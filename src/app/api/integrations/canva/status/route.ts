import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCanvaCredentials } from "@/lib/canva/canvaClient";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const { isConfigured, redirectUri } = getCanvaCredentials();
    const session = await getSession();
    const orgId = session?.activeOrgId;

    if (!orgId) {
      return NextResponse.json({
        isConfigured,
        isConnected: false,
        redirectUri,
      });
    }

    const account = await prisma.socialAccount.findFirst({
      where: {
        organizationId: orgId,
        provider: "canva",
        status: "CONNECTED",
      },
      select: {
        id: true,
        providerAccountId: true,
        displayName: true,
        profileImageUrl: true,
        connectedAt: true,
        lastSyncedAt: true,
        tokenExpiresAt: true,
      },
    });

    return NextResponse.json({
      isConfigured,
      isConnected: Boolean(account),
      account: account || null,
      redirectUri,
    });
  } catch (error: any) {
    console.error("Canva status check error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const org = await prisma.organization.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!org) {
      return NextResponse.json({ success: true });
    }

    await prisma.socialAccount.deleteMany({
      where: {
        organizationId: org.id,
        provider: "canva",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Canva disconnected successfully.",
    });
  } catch (error: any) {
    console.error("Canva disconnect error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
