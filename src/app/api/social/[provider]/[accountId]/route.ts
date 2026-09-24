import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";
import { decryptToken } from "@/lib/security/encryption";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ provider: string; accountId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider, accountId } = await params;
    const platformKey = provider.toLowerCase() as SupportedPlatform;

    const account = await prisma.socialAccount.findFirst({
      where: {
        id: accountId,
        organizationId: session.activeOrgId,
      },
      include: {
        token: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found in workspace" }, { status: 404 });
    }

    // Try revoking token if possible
    if (account.token) {
      try {
        const decryptedAccess = decryptToken(
          account.token.encryptedAccessToken,
          account.token.iv,
          account.token.tag
        );
        const socialProvider = getSocialProvider(platformKey);
        await socialProvider.disconnect(decryptedAccess);
      } catch (e) {
        console.warn("Could not revoke token with remote provider:", e);
      }

      // Delete encrypted token vault record
      await prisma.socialToken.delete({
        where: { id: account.token.id },
      });
    }

    // Delete social account records and cascade
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
        provider: platformKey,
        displayName: account.displayName,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${account.displayName} has been disconnected and credentials purged.`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to disconnect account" },
      { status: 500 }
    );
  }
}
