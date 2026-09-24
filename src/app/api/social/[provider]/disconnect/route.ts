import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { SupportedPlatform } from "@/lib/social/types";
import { logAudit } from "@/lib/audit/logger";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawKey = (await params).provider.toLowerCase();
    const platformKey = (
      rawKey === "google" || rawKey === "google-business"
        ? "google_business"
        : rawKey
    ) as SupportedPlatform;

    let targetAccountId: string | null = null;
    try {
      const body = await req.json();
      targetAccountId = body?.accountId || null;
    } catch {
      targetAccountId = null;
    }

    const account = await prisma.socialAccount.findFirst({
      where: targetAccountId
        ? {
            id: targetAccountId,
            organizationId: session.activeOrgId,
          }
        : {
            organizationId: session.activeOrgId,
            provider: platformKey,
          },
    });

    if (!account) {
      return NextResponse.json(
        { error: `No connected ${platformKey} account found to disconnect` },
        { status: 404 }
      );
    }

    // Delete associated social tokens and profile, and the socialAccount record
    await prisma.socialToken.deleteMany({
      where: { socialAccountId: account.id },
    });

    await prisma.socialProfile.deleteMany({
      where: { socialAccountId: account.id },
    });

    await prisma.socialAccount.delete({
      where: { id: account.id },
    });

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "OAUTH_DISCONNECTED",
      resourceType: "SocialAccount",
      resourceId: account.id,
      details: {
        provider: account.provider,
        displayName: account.displayName,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${account.displayName} has been disconnected successfully.`,
      disconnectedProvider: platformKey,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to disconnect account" },
      { status: 500 }
    );
  }
}
