import { prisma } from "@/lib/prisma";
import { decryptToken, encryptToken } from "@/lib/security/encryption";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";

export interface SyncEngagementOptions {
  organizationId?: string;
  postId?: string;
  socialAccountId?: string;
  limit?: number;
}

export interface SyncSummary {
  processed: number;
  synced: number;
  skipped: number;
  failed: number;
  errors: Array<{ targetId: string; platform: string; error: string }>;
}

export async function syncSocialEngagement(
  options: SyncEngagementOptions = {}
): Promise<SyncSummary> {
  const { organizationId, postId, socialAccountId, limit = 50 } = options;

  const whereClause: any = {
    status: "PUBLISHED",
    platformPostId: { not: null },
  };

  if (postId) {
    whereClause.postId = postId;
  }

  if (socialAccountId) {
    whereClause.socialAccountId = socialAccountId;
  }

  if (organizationId) {
    whereClause.post = {
      organizationId,
    };
  }

  const targets = await prisma.socialPostTarget.findMany({
    where: whereClause,
    include: {
      post: true,
      socialAccount: {
        include: {
          token: true,
        },
      },
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
  });

  const summary: SyncSummary = {
    processed: targets.length,
    synced: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (const target of targets) {
    const { socialAccount } = target;
    const platform = (
      socialAccount.provider.toLowerCase() === "twitter"
        ? "x"
        : socialAccount.provider.toLowerCase() === "google" ||
          socialAccount.provider.toLowerCase() === "google-business"
        ? "google_business"
        : socialAccount.provider.toLowerCase()
    ) as SupportedPlatform;

    if (!target.platformPostId) {
      summary.skipped++;
      continue;
    }

    if (!socialAccount.token) {
      summary.failed++;
      summary.errors.push({
        targetId: target.id,
        platform,
        error: "No OAuth token connected for account",
      });
      continue;
    }

    let provider: any;
    try {
      provider = getSocialProvider(platform);
    } catch (e: any) {
      summary.skipped++;
      continue;
    }

    let decryptedToken = "";

    if (
      socialAccount.token.expiresAt &&
      socialAccount.token.expiresAt < new Date()
    ) {
      let refreshed = false;
      if (
        socialAccount.token.encryptedRefreshToken &&
        typeof provider.refreshToken === "function"
      ) {
        try {
          const decryptedRefresh = decryptToken(
            socialAccount.token.encryptedRefreshToken,
            socialAccount.token.iv,
            socialAccount.token.tag
          );
          if (decryptedRefresh) {
            const newTokens = await provider.refreshToken(decryptedRefresh);
            if (newTokens.accessToken) {
              const encAccess = encryptToken(newTokens.accessToken);
              let encRefresh = socialAccount.token.encryptedRefreshToken;
              let refreshExp = socialAccount.token.refreshTokenExpiresAt;
              if (newTokens.refreshToken) {
                encRefresh = encryptToken(newTokens.refreshToken).encrypted;
                if (newTokens.refreshTokenExpiresIn) {
                  refreshExp = new Date(Date.now() + newTokens.refreshTokenExpiresIn * 1000);
                }
              }
              const expiresAt = newTokens.expiresIn
                ? new Date(Date.now() + newTokens.expiresIn * 1000)
                : new Date(Date.now() + 3600 * 1000);

              await prisma.socialToken.update({
                where: { id: socialAccount.token.id },
                data: {
                  encryptedAccessToken: encAccess.encrypted,
                  encryptedRefreshToken: encRefresh,
                  iv: encAccess.iv,
                  tag: encAccess.tag,
                  expiresAt,
                  refreshTokenExpiresAt: refreshExp,
                },
              });
              await prisma.socialAccount.update({
                where: { id: socialAccount.id },
                data: { status: "CONNECTED" },
              });
              decryptedToken = newTokens.accessToken;
              refreshed = true;
            }
          }
        } catch {}
      }

      if (!refreshed) {
        await prisma.socialAccount.update({
          where: { id: socialAccount.id },
          data: { status: "RECONNECT_REQUIRED" },
        });
        summary.failed++;
        summary.errors.push({
          targetId: target.id,
          platform,
          error: "OAuth token expired. Reconnect required.",
        });
        continue;
      }
    }

    if (!decryptedToken) {
      try {
        decryptedToken = decryptToken(
          socialAccount.token.encryptedAccessToken,
          socialAccount.token.iv,
          socialAccount.token.tag
        );
      } catch {
        summary.failed++;
        summary.errors.push({
          targetId: target.id,
          platform,
          error: "Failed to decrypt OAuth token",
        });
        continue;
      }
    }

    if (
      !decryptedToken ||
      decryptedToken.startsWith("token_") ||
      decryptedToken.startsWith("direct_token_")
    ) {
      summary.skipped++;
      continue;
    }

    try {
      // 1. Sync Metrics
      if (typeof provider.syncPostEngagement === "function") {
        const metrics = await provider.syncPostEngagement(
          decryptedToken,
          target.platformPostId,
          socialAccount.providerAccountId
        );

        if (metrics.requiresReauth) {
          await prisma.socialAccount.update({
            where: { id: socialAccount.id },
            data: { status: "RECONNECT_REQUIRED" },
          });
        }

        if (metrics.success) {
          await prisma.socialEngagementSnapshot.upsert({
            where: {
              platform_externalPostId: {
                platform,
                externalPostId: target.platformPostId,
              },
            },
            create: {
              postId: target.postId,
              socialAccountId: socialAccount.id,
              platform,
              externalPostId: target.platformPostId,
              likes: metrics.likes,
              reactions: metrics.reactions,
              comments: metrics.comments,
              shares: metrics.shares,
              reposts: metrics.reposts,
              views: metrics.views,
              impressions: metrics.impressions,
              reach: metrics.reach,
              saves: metrics.saves,
              rawMetricsJson: metrics.rawResponse
                ? JSON.stringify(metrics.rawResponse)
                : null,
              lastSyncedAt: new Date(),
            },
            update: {
              postId: target.postId,
              likes: metrics.likes,
              reactions: metrics.reactions,
              comments: metrics.comments,
              shares: metrics.shares,
              reposts: metrics.reposts,
              views: metrics.views,
              impressions: metrics.impressions,
              reach: metrics.reach,
              saves: metrics.saves,
              rawMetricsJson: metrics.rawResponse
                ? JSON.stringify(metrics.rawResponse)
                : null,
              lastSyncedAt: new Date(),
            },
          });
        }
      }

      // 2. Fetch and persist authentic comments if provider supports it
      if (typeof provider.fetchPostComments === "function") {
        const comments = await provider.fetchPostComments(
          decryptedToken,
          target.platformPostId,
          socialAccount.providerAccountId
        );

        for (const c of comments) {
          if (!c.externalCommentId) continue;
          await prisma.socialComment.upsert({
            where: {
              platform_platformCommentId: {
                platform,
                platformCommentId: c.externalCommentId,
              },
            },
            create: {
              socialAccountId: socialAccount.id,
              platformCommentId: c.externalCommentId,
              platformPostId: target.platformPostId,
              postId: target.postId,
              platform,
              parentId: c.parentId || null,
              authorName: c.authorName,
              authorUsername: c.authorUsername || undefined,
              authorAvatarUrl: c.authorAvatarUrl || undefined,
              content: c.content,
              postedAt: c.postedAt,
            },
            update: {
              content: c.content,
              updatedAt: new Date(),
            },
          });
        }
      }

      // 3. Mark social account lastSyncedAt
      await prisma.socialAccount.update({
        where: { id: socialAccount.id },
        data: { lastSyncedAt: new Date() },
      });

      summary.synced++;
    } catch (syncErr: unknown) {
      summary.failed++;
      summary.errors.push({
        targetId: target.id,
        platform,
        error: (syncErr as Error).message || "Unknown error during sync",
      });
    }
  }

  return summary;
}
