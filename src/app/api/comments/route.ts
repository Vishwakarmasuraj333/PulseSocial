import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { executeSocialAction } from "@/lib/social/action-executor";

// GET /api/comments - Fetch posts with authentic comments and engagement metrics for the active workspace
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");

    // 1. Fetch connected accounts for this org
    const accounts = await prisma.socialAccount.findMany({
      where: {
        organizationId: session.activeOrgId,
        ...(platform && platform !== "all" ? { provider: platform.toLowerCase() } : {}),
      },
      include: {
        profile: true,
      },
    });

    // 2. Fetch comments for this org
    const comments = await prisma.socialComment.findMany({
      where: {
        socialAccount: {
          organizationId: session.activeOrgId,
          ...(platform && platform !== "all" ? { provider: platform.toLowerCase() } : {}),
        },
      },
      include: {
        socialAccount: true,
      },
      orderBy: { postedAt: "desc" },
    });

    // 3. Fetch published posts for this org with real engagement snapshots
    const posts = await prisma.socialPost.findMany({
      where: {
        organizationId: session.activeOrgId,
        ...(platform && platform !== "all"
          ? {
              targets: {
                some: {
                  socialAccount: {
                    provider: platform.toLowerCase(),
                  },
                },
              },
            }
          : {}),
      },
      include: {
        media: true,
        targets: {
          include: {
            socialAccount: true,
          },
        },
        engagementSnapshots: {
          include: {
            socialAccount: {
              select: {
                id: true,
                displayName: true,
                username: true,
                profileImageUrl: true,
                provider: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // 4. Map posts with their corresponding real comments and authentic metrics
    const postsWithComments = posts.map((post) => {
      const postComments = comments.filter(
        (c) =>
          c.postId === post.id ||
          c.platformPostId === post.id ||
          post.targets.some((t) => t.platformPostId && t.platformPostId === c.platformPostId)
      );

      const targetAccount = post.targets[0]?.socialAccount || accounts[0];
      const snapshot = post.engagementSnapshots[0];

      return {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        publishedAt: post.publishedAt || post.createdAt,
        media: post.media.map((m) => ({ id: m.id, url: m.url, mediaType: m.mediaType })),
        account: targetAccount
          ? {
              id: targetAccount.id,
              provider: targetAccount.provider,
              displayName: targetAccount.displayName,
              username: targetAccount.username,
              profileImageUrl: targetAccount.profileImageUrl,
            }
          : null,
        targets: post.targets.map((t) => ({
          id: t.id,
          platform: t.socialAccount.provider,
          platformPostId: t.platformPostId,
          status: t.status,
          accountName: t.socialAccount.displayName,
          accountUsername: t.socialAccount.username,
        })),
        engagement: post.engagementSnapshots.map((s) => ({
          platform: s.platform,
          externalPostId: s.externalPostId,
          likes: s.likes,
          reactions: s.reactions,
          comments: s.comments,
          shares: s.shares,
          reposts: s.reposts,
          views: s.views,
          impressions: s.impressions,
          reach: s.reach,
          saves: s.saves,
          lastSyncedAt: s.lastSyncedAt,
        })),
        likes: snapshot?.likes ?? null,
        shares: snapshot?.shares ?? null,
        commentsCount: postComments.length,
        comments: postComments.map((c) => ({
          id: c.id,
          platformCommentId: c.platformCommentId,
          platform: c.platform,
          authorName: c.authorName,
          authorAvatarUrl: c.authorAvatarUrl,
          authorUsername: c.authorUsername,
          content: c.content,
          postedAt: c.postedAt,
          isReplied: c.isReplied,
          parentId: c.parentId,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      posts: postsWithComments,
      accounts: accounts.map((a) => ({
        id: a.id,
        provider: a.provider,
        displayName: a.displayName,
        username: a.username,
      })),
      totalComments: comments.length,
    });
  } catch (error: unknown) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load comments" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Post a real comment to a social network via official API
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { postId, content, platform, socialAccountId, externalPostId, parentCommentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
    }

    // Resolve post and target if postId is given
    let resolvedPost = null;
    let targetPostId = externalPostId;
    let targetAccountId = socialAccountId;
    let resolvedPlatform = platform;

    if (postId) {
      resolvedPost = await prisma.socialPost.findFirst({
        where: { id: postId, organizationId: session.activeOrgId },
        include: {
          targets: {
            include: { socialAccount: true },
          },
        },
      });

      if (resolvedPost) {
        const target = resolvedPost.targets.find(
          (t) =>
            (!platform || t.socialAccount.provider.toLowerCase() === platform.toLowerCase()) &&
            t.platformPostId
        ) || resolvedPost.targets[0];

        if (target) {
          targetPostId = target.platformPostId || targetPostId;
          targetAccountId = target.socialAccountId || targetAccountId;
          resolvedPlatform = target.socialAccount.provider || resolvedPlatform;
        }
      }
    }

    if (!targetAccountId) {
      const fallbackAccount = await prisma.socialAccount.findFirst({
        where: {
          organizationId: session.activeOrgId,
          ...(resolvedPlatform ? { provider: resolvedPlatform.toLowerCase() } : {}),
        },
      });
      if (fallbackAccount) {
        targetAccountId = fallbackAccount.id;
        resolvedPlatform = fallbackAccount.provider;
      }
    }

    if (!targetAccountId || !targetPostId) {
      return NextResponse.json(
        {
          error:
            "A connected social account and published external post ID are required to post a real comment.",
        },
        { status: 400 }
      );
    }

    // Call real platform API via executeSocialAction
    const actionResult = parentCommentId
      ? await executeSocialAction({
          platform: resolvedPlatform,
          actionType: "REPLY",
          socialAccountId: targetAccountId,
          externalPostId: targetPostId,
          externalCommentId: parentCommentId,
          postId: postId || undefined,
          content: content.trim(),
        })
      : await executeSocialAction({
          platform: resolvedPlatform,
          actionType: "COMMENT",
          socialAccountId: targetAccountId,
          externalPostId: targetPostId,
          postId: postId || undefined,
          content: content.trim(),
        });

    if (!actionResult.success) {
      const statusCode = actionResult.requiresReauth ? 401 : 400;
      return NextResponse.json(
        {
          success: false,
          error: actionResult.error || "Failed to post comment to social network",
          code: actionResult.code,
          requiresReauth: actionResult.requiresReauth,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      comment: actionResult.data,
      externalActionId: actionResult.externalActionId,
    });
  } catch (error: unknown) {
    console.error("Failed to post comment:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to post comment" },
      { status: 500 }
    );
  }
}
