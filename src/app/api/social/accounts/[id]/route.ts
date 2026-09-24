import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const account = await prisma.socialAccount.findFirst({
      where: {
        id,
        organizationId: session.activeOrgId,
      },
      include: {
        profile: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, account });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to retrieve account" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Only Owner/Admin/Manager can disconnect social accounts
    if (session.role === "VIEWER" || session.role === "EDITOR") {
      return NextResponse.json(
        { error: "You do not have permission to disconnect social channels" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const account = await prisma.socialAccount.findFirst({
      where: {
        id,
        organizationId: session.activeOrgId,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Safely delete social account (cascades to tokens and profiles)
    await prisma.socialAccount.delete({
      where: { id },
    });

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "SOCIAL_ACCOUNT_DISCONNECTED",
      resourceType: "SocialAccount",
      resourceId: id,
      details: { provider: account.provider, displayName: account.displayName },
    });

    return NextResponse.json({
      success: true,
      message: `${account.displayName} disconnected successfully`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to disconnect account" },
      { status: 500 }
    );
  }
}
