import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";

// GET /api/comments - Fetch posts with comments for the active workspace
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

    // 3. Fetch published posts for this org
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
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // 4. Map posts with their corresponding real comments
    const postsWithComments = posts.map((post) => {
      const postComments = comments.filter(
        (c) => c.platformPostId === post.id || post.targets.some((t) => t.socialAccountId === c.socialAccountId)
      );

      const targetAccount = post.targets[0]?.socialAccount || accounts[0];

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
        likes: 0,
        shares: 0,
        commentsCount: postComments.length,
        comments: postComments.map((c) => ({
          id: c.id,
          authorName: c.authorName,
          authorAvatarUrl: c.authorAvatarUrl,
          authorUsername: c.authorUsername,
          content: c.content,
          postedAt: c.postedAt,
          isReplied: c.isReplied,
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

// POST /api/comments - Post a new comment or reply
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { postId, content, platform, socialAccountId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
    }

    // Find account to attribute this comment to
    let account = null;
    if (socialAccountId) {
      account = await prisma.socialAccount.findFirst({
        where: { id: socialAccountId, organizationId: session.activeOrgId },
      });
    }

    if (!account && platform) {
      account = await prisma.socialAccount.findFirst({
        where: { provider: platform.toLowerCase(), organizationId: session.activeOrgId },
      });
    }

    if (!account) {
      account = await prisma.socialAccount.findFirst({
        where: { organizationId: session.activeOrgId },
      });
    }

    if (!account) {
      return NextResponse.json(
        { error: "No connected social account found in workspace to post comment as." },
        { status: 400 }
      );
    }

    // Persist real comment to database
    const newComment = await prisma.socialComment.create({
      data: {
        socialAccountId: account.id,
        platformCommentId: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        platformPostId: postId || null,
        authorName: account.displayName,
        authorUsername: account.username || account.displayName.toLowerCase().replace(/\s+/g, ""),
        authorAvatarUrl: account.profileImageUrl,
        content: content.trim(),
        postedAt: new Date(),
        isRead: true,
        isReplied: true,
      },
    });

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "COMMENT_POSTED",
      resourceType: "SocialComment",
      resourceId: newComment.id,
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: newComment.id,
        authorName: newComment.authorName,
        authorAvatarUrl: newComment.authorAvatarUrl,
        authorUsername: newComment.authorUsername,
        content: newComment.content,
        postedAt: newComment.postedAt,
        isReplied: true,
      },
    });
  } catch (error: unknown) {
    console.error("Failed to post comment:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to post comment" },
      { status: 500 }
    );
  }
}
