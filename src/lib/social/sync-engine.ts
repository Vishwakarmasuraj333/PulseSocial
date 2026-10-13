import { prisma } from "@/lib/prisma";
import { decryptToken, encryptToken } from "@/lib/security/encryption";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";
import { logAudit } from "@/lib/audit/logger";

export interface SyncAccountOptions {
  socialAccountId: string;
  organizationId: string;
  forceAll?: boolean;
}

export interface SyncAccountResult {
  success: boolean;
  socialAccountId: string;
  provider: string;
  accountName: string;
  syncedPosts: number;
  syncedComments: number;
  syncedConversations: number;
  syncedAnalytics: number;
  error?: string;
}

/**
 * Universal Social Account Sync Engine
 * Reconciles authentic remote provider data into PulseSocial's persistent database:
 * - Real Profile metrics & follower count
 * - Real Published Posts & remote Media assets
 * - Real Post Engagements (likes, comments count, reach, impressions)
 * - Real Comment threads & author metadata
 * - Real Inbox Conversations & Direct Messages
 * - Real Insights snapshots for Analytics
 */
export async function syncAccountData(
  options: SyncAccountOptions
): Promise<SyncAccountResult> {
  const { socialAccountId, organizationId } = options;

  const account = await prisma.socialAccount.findFirst({
    where: {
      id: socialAccountId,
      organizationId,
    },
    include: {
      token: true,
      profile: true,
    },
  });

  if (!account) {
    return {
      success: false,
      socialAccountId,
      provider: "unknown",
      accountName: "Unknown",
      syncedPosts: 0,
      syncedComments: 0,
      syncedConversations: 0,
      syncedAnalytics: 0,
      error: "Social account not found in workspace.",
    };
  }

  const normalizedPlatform = (
    account.provider.toLowerCase() === "twitter"
      ? "x"
      : account.provider.toLowerCase() === "google" ||
        account.provider.toLowerCase() === "google-business"
      ? "google_business"
      : account.provider.toLowerCase()
  ) as SupportedPlatform;

  // Track or create SyncJob
  const syncJob = await prisma.syncJob.create({
    data: {
      organizationId,
      socialAccountId: account.id,
      provider: account.provider,
      jobType: "FULL",
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });

  let syncedPosts = 0;
  let syncedComments = 0;
  let syncedConversations = 0;
  let syncedAnalytics = 0;

  try {
    let provider: any;
    try {
      provider = getSocialProvider(normalizedPlatform);
    } catch (e: any) {
      await prisma.syncJob.update({
        where: { id: syncJob.id },
        data: { status: "FAILED", errorMessage: e.message, completedAt: new Date() },
      });
      return {
        success: false,
        socialAccountId: account.id,
        provider: account.provider,
        accountName: account.displayName,
        syncedPosts: 0,
        syncedComments: 0,
        syncedConversations: 0,
        syncedAnalytics: 0,
        error: `Provider ${account.provider} is not registered.`,
      };
    }

    if (!account.token) {
      await prisma.syncJob.update({
        where: { id: syncJob.id },
        data: { status: "FAILED", errorMessage: "No OAuth token connected", completedAt: new Date() },
      });
      return {
        success: false,
        socialAccountId: account.id,
        provider: account.provider,
        accountName: account.displayName,
        syncedPosts: 0,
        syncedComments: 0,
        syncedConversations: 0,
        syncedAnalytics: 0,
        error: `OAuth credentials are not configured for ${account.displayName}. Reconnect account.`,
      };
    }

    let decryptedToken = "";

    // 1. Auto-refresh if token is expired
    if (account.token.expiresAt && account.token.expiresAt < new Date()) {
      let refreshed = false;
      if (
        account.token.encryptedRefreshToken &&
        typeof provider.refreshToken === "function"
      ) {
        try {
          const decryptedRefresh = decryptToken(
            account.token.encryptedRefreshToken,
            account.token.iv,
            account.token.tag
          );
          if (decryptedRefresh) {
            const newTokens = await provider.refreshToken(decryptedRefresh);
            if (newTokens.accessToken) {
              const encAccess = encryptToken(newTokens.accessToken);
              let encRefresh = account.token.encryptedRefreshToken;
              let refreshExp = account.token.refreshTokenExpiresAt;
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
                where: { id: account.token.id },
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
                where: { id: account.id },
                data: { status: "CONNECTED" },
              });
              decryptedToken = newTokens.accessToken;
              refreshed = true;
            }
          }
        } catch (rErr) {
          console.warn("Token refresh failed during sync:", rErr);
        }
      }

      if (!refreshed) {
        await prisma.socialAccount.update({
          where: { id: account.id },
          data: { status: "RECONNECT_REQUIRED" },
        });
        await prisma.syncJob.update({
          where: { id: syncJob.id },
          data: { status: "FAILED", errorMessage: "Token expired", completedAt: new Date() },
        });
        return {
          success: false,
          socialAccountId: account.id,
          provider: account.provider,
          accountName: account.displayName,
          syncedPosts: 0,
          syncedComments: 0,
          syncedConversations: 0,
          syncedAnalytics: 0,
          error: "OAuth token has expired and cannot be refreshed automatically. Please reconnect.",
        };
      }
    }

    if (!decryptedToken) {
      try {
        decryptedToken = decryptToken(
          account.token.encryptedAccessToken,
          account.token.iv,
          account.token.tag
        );
      } catch (dErr: any) {
        await prisma.syncJob.update({
          where: { id: syncJob.id },
          data: { status: "FAILED", errorMessage: "Decryption error", completedAt: new Date() },
        });
        return {
          success: false,
          socialAccountId: account.id,
          provider: account.provider,
          accountName: account.displayName,
          syncedPosts: 0,
          syncedComments: 0,
          syncedConversations: 0,
          syncedAnalytics: 0,
          error: "Failed to decrypt OAuth credentials.",
        };
      }
    }

    // 2. Sync Profile Metrics
    try {
      if (typeof provider.getProfile === "function") {
        const profileData = await provider.getProfile(
          decryptedToken,
          account.providerAccountId
        );
        if (profileData) {
          await prisma.socialProfile.upsert({
            where: { socialAccountId: account.id },
            create: {
              socialAccountId: account.id,
              bio: profileData.bio,
              followersCount: profileData.followersCount,
              followingCount: profileData.followingCount,
              postsCount: profileData.postsCount,
              websiteUrl: profileData.websiteUrl,
              rawProfileJson: profileData.raw ? JSON.stringify(profileData.raw) : null,
            },
            update: {
              bio: profileData.bio !== undefined ? profileData.bio : undefined,
              followersCount:
                profileData.followersCount !== null
                  ? profileData.followersCount
                  : undefined,
              followingCount:
                profileData.followingCount !== null
                  ? profileData.followingCount
                  : undefined,
              postsCount:
                profileData.postsCount !== null ? profileData.postsCount : undefined,
              websiteUrl: profileData.websiteUrl || undefined,
              rawProfileJson: profileData.raw ? JSON.stringify(profileData.raw) : undefined,
            },
          });
        }
      }
    } catch (profErr) {
      console.warn(`[Sync] Profile sync warning for ${account.id}:`, profErr);
    }

    // Resolve an authorized creator user ID for workspace posts
    const creatorUser = await prisma.organizationMember.findFirst({
      where: { organizationId },
      select: { userId: true },
    });
    const creatorId = creatorUser?.userId || "system";

    // 3. Sync Published Posts & Media
    const remotePostIds: string[] = [];
    if (typeof provider.fetchPosts === "function") {
      try {
        const remotePosts = await provider.fetchPosts(
          decryptedToken,
          account.providerAccountId,
          25
        );

        for (const rPost of remotePosts) {
          if (!rPost.platformPostId) continue;
          remotePostIds.push(rPost.platformPostId);

          // Check if post target already exists
          const existingTarget = await prisma.socialPostTarget.findFirst({
            where: {
              socialAccountId: account.id,
              platformPostId: rPost.platformPostId,
            },
            include: { post: true },
          });

          let postId = existingTarget?.postId;

          if (!existingTarget) {
            // Create SocialPost + Target
            const newPost = await prisma.socialPost.create({
              data: {
                organizationId,
                creatorId,
                content: rPost.content || "",
                status: "PUBLISHED",
                publishedAt: rPost.publishedAt,
                targets: {
                  create: {
                    socialAccountId: account.id,
                    platformPostId: rPost.platformPostId,
                    status: "PUBLISHED",
                    publishedAt: rPost.publishedAt,
                  },
                },
                media: {
                  create: (rPost.media || []).map((m: any, idx: number) => ({
                    url: m.url,
                    mediaType: m.type || "IMAGE",
                    altText: m.altText || null,
                    orderIndex: idx,
                  })),
                },
              },
            });
            postId = newPost.id;
          } else {
            // Update existing post
            await prisma.socialPost.update({
              where: { id: existingTarget.postId },
              data: {
                content: rPost.content || existingTarget.post.content,
                status: "PUBLISHED",
                publishedAt: rPost.publishedAt,
              },
            });
          }

          // Upsert Engagement Snapshot
          await prisma.socialEngagementSnapshot.upsert({
            where: {
              platform_externalPostId: {
                platform: normalizedPlatform,
                externalPostId: rPost.platformPostId,
              },
            },
            create: {
              postId,
              socialAccountId: account.id,
              platform: normalizedPlatform,
              externalPostId: rPost.platformPostId,
              externalPostUrl: rPost.permalink || null,
              likes: rPost.likes,
              reactions: rPost.likes,
              comments: rPost.comments,
              shares: rPost.shares,
              views: rPost.views,
              rawMetricsJson: rPost.rawJson || null,
              lastSyncedAt: new Date(),
            },
            update: {
              postId,
              likes: rPost.likes !== undefined ? rPost.likes : undefined,
              reactions: rPost.likes !== undefined ? rPost.likes : undefined,
              comments: rPost.comments !== undefined ? rPost.comments : undefined,
              shares: rPost.shares !== undefined ? rPost.shares : undefined,
              views: rPost.views !== undefined ? rPost.views : undefined,
              externalPostUrl: rPost.permalink || undefined,
              rawMetricsJson: rPost.rawJson || undefined,
              lastSyncedAt: new Date(),
            },
          });

          syncedPosts++;
        }
      } catch (postsErr) {
        console.warn(`[Sync] Posts fetch warning for ${account.id}:`, postsErr);
      }
    }

    // 4. Sync Post Comments
    if (typeof provider.fetchPostComments === "function" && remotePostIds.length > 0) {
      try {
        for (const pId of remotePostIds.slice(0, 10)) {
          const comments = await provider.fetchPostComments(
            decryptedToken,
            pId,
            account.providerAccountId
          );

          for (const c of comments) {
            if (!c.externalCommentId) continue;
            await prisma.socialComment.upsert({
              where: {
                platform_platformCommentId: {
                  platform: normalizedPlatform,
                  platformCommentId: c.externalCommentId,
                },
              },
              create: {
                socialAccountId: account.id,
                platformCommentId: c.externalCommentId,
                platformPostId: pId,
                platform: normalizedPlatform,
                parentId: c.parentId || null,
                authorName: c.authorName || "Social User",
                authorUsername: c.authorUsername || undefined,
                authorAvatarUrl: c.authorAvatarUrl || undefined,
                content: c.content || "",
                postedAt: c.postedAt || new Date(),
                isRead: true,
              },
              update: {
                content: c.content || undefined,
                authorName: c.authorName || undefined,
                updatedAt: new Date(),
              },
            });
            syncedComments++;
          }
        }
      } catch (cErr) {
        console.warn(`[Sync] Comments sync warning for ${account.id}:`, cErr);
      }
    }

    // 5. Sync Inbox & Conversations
    if (typeof provider.fetchInboxConversations === "function") {
      try {
        const conversations = await provider.fetchInboxConversations(
          decryptedToken,
          account.providerAccountId,
          20
        );

        for (const conv of conversations) {
          if (!conv.platformConversationId) continue;

          const savedConv = await prisma.socialConversation.upsert({
            where: {
              platform_socialAccountId_platformConversationId: {
                platform: normalizedPlatform,
                socialAccountId: account.id,
                platformConversationId: conv.platformConversationId,
              },
            },
            create: {
              organizationId,
              socialAccountId: account.id,
              platformConversationId: conv.platformConversationId,
              platform: normalizedPlatform,
              participantId: conv.participantId || null,
              participantName: conv.participantName,
              participantUsername: conv.participantUsername || null,
              participantAvatarUrl: conv.participantAvatarUrl || null,
              lastMessageSnippet: conv.lastMessageSnippet || null,
              lastMessageAt: conv.lastMessageAt || new Date(),
              unreadCount: conv.unreadCount || 0,
            },
            update: {
              participantName: conv.participantName,
              participantUsername: conv.participantUsername || undefined,
              participantAvatarUrl: conv.participantAvatarUrl || undefined,
              lastMessageSnippet: conv.lastMessageSnippet || undefined,
              lastMessageAt: conv.lastMessageAt || undefined,
              unreadCount: conv.unreadCount !== undefined ? conv.unreadCount : undefined,
              updatedAt: new Date(),
            },
          });

          for (const msg of conv.messages || []) {
            if (!msg.platformMessageId) continue;
            await prisma.socialMessage.upsert({
              where: {
                id: msg.platformMessageId,
              },
              create: {
                id: msg.platformMessageId,
                socialAccountId: account.id,
                conversationId: savedConv.id,
                platformMessageId: msg.platformMessageId,
                platform: normalizedPlatform,
                senderName: msg.senderName,
                senderUsername: msg.senderUsername || null,
                senderAvatarUrl: msg.senderAvatarUrl || null,
                content: msg.content,
                direction: msg.direction || "INBOUND",
                sentAt: msg.sentAt || new Date(),
              },
              update: {
                content: msg.content,
                senderName: msg.senderName,
              },
            });
          }

          syncedConversations++;
        }
      } catch (inboxErr) {
        console.warn(`[Sync] Inbox sync warning for ${account.id}:`, inboxErr);
      }
    }

    // 6. Sync Insights & Analytics
    if (typeof provider.fetchInsights === "function") {
      try {
        const insights = await provider.fetchInsights(
          decryptedToken,
          account.providerAccountId
        );

        for (const ins of insights) {
          await prisma.socialAnalytics.upsert({
            where: {
              socialAccountId_metricDate: {
                socialAccountId: account.id,
                metricDate: ins.date,
              },
            },
            create: {
              socialAccountId: account.id,
              metricDate: ins.date,
              followers: ins.followers || 0,
              following: ins.following || 0,
              impressions: ins.impressions || 0,
              reach: ins.reach || 0,
              engagementCount: ins.engagementCount || 0,
              clicks: ins.clicks || 0,
              shares: ins.shares || 0,
              saves: ins.saves || 0,
              isCalculated: false,
            },
            update: {
              followers: ins.followers !== undefined ? ins.followers || 0 : undefined,
              following: ins.following !== undefined ? ins.following || 0 : undefined,
              impressions: ins.impressions !== undefined ? ins.impressions || 0 : undefined,
              reach: ins.reach !== undefined ? ins.reach || 0 : undefined,
              engagementCount: ins.engagementCount !== undefined ? ins.engagementCount || 0 : undefined,
              clicks: ins.clicks !== undefined ? ins.clicks || 0 : undefined,
              shares: ins.shares !== undefined ? ins.shares || 0 : undefined,
              saves: ins.saves !== undefined ? ins.saves || 0 : undefined,
            },
          });
          syncedAnalytics++;
        }
      } catch (insErr) {
        console.warn(`[Sync] Insights sync warning for ${account.id}:`, insErr);
      }
    }

    // 7. Complete Sync
    const now = new Date();
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        lastSyncedAt: now,
        status: "CONNECTED",
      },
    });

    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: {
        status: "COMPLETED",
        processedCount: syncedPosts + syncedComments + syncedConversations + syncedAnalytics,
        completedAt: now,
      },
    });

    await logAudit({
      organizationId,
      userId: creatorId,
      action: "SOCIAL_ACCOUNT_SYNCED",
      resourceType: "SocialAccount",
      resourceId: account.id,
      details: {
        provider: account.provider,
        displayName: account.displayName,
        syncedPosts,
        syncedComments,
        syncedConversations,
        syncedAnalytics,
      },
    });

    return {
      success: true,
      socialAccountId: account.id,
      provider: account.provider,
      accountName: account.displayName,
      syncedPosts,
      syncedComments,
      syncedConversations,
      syncedAnalytics,
    };
  } catch (err: any) {
    console.error(`[Sync] Unexpected error syncing account ${account.id}:`, err);
    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: {
        status: "FAILED",
        errorMessage: err.message || "Unexpected sync failure",
        completedAt: new Date(),
      },
    });
    return {
      success: false,
      socialAccountId: account.id,
      provider: account.provider,
      accountName: account.displayName,
      syncedPosts,
      syncedComments,
      syncedConversations,
      syncedAnalytics,
      error: err.message || "Failed to synchronize social account data.",
    };
  }
}
