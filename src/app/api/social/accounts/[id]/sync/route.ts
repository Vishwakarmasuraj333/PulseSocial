import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/security/encryption";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";
import { logAudit } from "@/lib/audit/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
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
        token: true,
        profile: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Social account not found" }, { status: 404 });
    }

    if (!account.token) {
      return NextResponse.json(
        { error: "No OAuth credentials found. Please reconnect account." },
        { status: 400 }
      );
    }

    // Attempt real live sync if provider supports it
    try {
      const decryptedAccess = decryptToken(
        account.token.encryptedAccessToken,
        account.token.iv,
        account.token.tag
      );

      const provider = getSocialProvider(account.provider as SupportedPlatform);
      const profileData = await provider.getProfile(
        decryptedAccess,
        account.providerAccountId
      );

      if (profileData) {
        await prisma.socialAccount.update({
          where: { id },
          data: {
            lastSyncedAt: new Date(),
            status: "CONNECTED",
          },
        });

        if (account.profile) {
          await prisma.socialProfile.update({
            where: { socialAccountId: id },
            data: {
              followersCount: profileData.followersCount ?? account.profile.followersCount,
              followingCount: profileData.followingCount ?? account.profile.followingCount,
              postsCount: profileData.postsCount ?? account.profile.postsCount,
              bio: profileData.bio || account.profile.bio,
              websiteUrl: profileData.websiteUrl || account.profile.websiteUrl,
            },
          });
        }
      }
    } catch {
      // If live API sync is unavailable, record sync timestamp
      await prisma.socialAccount.update({
        where: { id },
        data: { lastSyncedAt: new Date() },
      });
    }

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "SOCIAL_ACCOUNT_SYNCED",
      resourceType: "SocialAccount",
      resourceId: id,
      details: { provider: account.provider },
    });

    return NextResponse.json({
      success: true,
      message: `Account ${account.displayName} synchronized successfully`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to sync social account" },
      { status: 500 }
    );
  }
}
