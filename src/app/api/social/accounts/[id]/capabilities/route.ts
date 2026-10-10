import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getPlatformCapability } from "@/lib/social/capabilities";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized", code: "FORBIDDEN" }, { status: 401 });
    }

    const { id } = await params;

    const account = await prisma.socialAccount.findFirst({
      where: {
        id,
        organizationId: session.activeOrgId,
      },
      include: {
        token: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Social account not found in this workspace.", code: "RESOURCE_NOT_FOUND" },
        { status: 404 }
      );
    }

    const capabilities = getPlatformCapability(account.provider, account);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        provider: account.provider,
        displayName: account.displayName,
        username: account.username,
        status: account.status,
      },
      capabilities,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load account capabilities", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
