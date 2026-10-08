import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";
import { getSocialProvider } from "@/lib/social/registry";
import { decryptToken, encryptToken } from "@/lib/security/encryption";

const CreatePostSchema = z.object({
  content: z.string().min(1, "Post content is required"),
  targetAccountIds: z.array(z.string()).min(1, "Select at least one social account"),
  action: z.enum(["DRAFT", "SCHEDULE", "PUBLISH_NOW", "QUEUE"]).default("DRAFT"),
  scheduledFor: z.string().optional(),
  mediaUrls: z
    .array(
      z.union([
        z.string(),
        z.object({
          url: z.string(),
          type: z.enum(["IMAGE", "VIDEO"]).optional().default("IMAGE"),
          altText: z.string().optional(),
        }),
      ])
    )
    .optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const posts = await prisma.socialPost.findMany({
      where: {
        organizationId: session.activeOrgId,
        ...(status ? { status } : {}),
      },
      include: {
        targets: {
          include: { socialAccount: true },
        },
        media: true,
        creator: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        scheduledPost: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = CreatePostSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { content, targetAccountIds, action, scheduledFor, mediaUrls } = validated.data;

    let initialStatus = "DRAFT";
    if (action === "SCHEDULE") initialStatus = "SCHEDULED";
    if (action === "QUEUE") initialStatus = "QUEUED";
    if (action === "PUBLISH_NOW") initialStatus = "PUBLISHING";

    const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;

    // Fetch active brand / organization
    const org = await prisma.organization.findUnique({
      where: { id: session.activeOrgId },
    });
    const orgName = org?.name || "Official Brand";
    const orgSlug = org?.slug || "brand_official";

    // 1. Resolve valid connected SocialAccount IDs strictly belonging to this organization
    const validAccountIds: string[] = [];
    const requestedTargets = targetAccountIds || [];

    for (const targetId of requestedTargets) {
      if (!targetId || targetId === "default-channel" || targetId === "auto") continue;

      // Check if targetId is an existing SocialAccount ID in this workspace
      const byId = await prisma.socialAccount.findFirst({
        where: { id: targetId, organizationId: session.activeOrgId },
      });
      if (byId) {
        if (!validAccountIds.includes(byId.id)) validAccountIds.push(byId.id);
        continue;
      }

      // Check if targetId is a provider identifier (e.g. "facebook", "channel-facebook")
      const cleanProvider = targetId.toLowerCase().replace(/^channel-/, "").trim();
      const existingByProvider = await prisma.socialAccount.findFirst({
        where: { organizationId: session.activeOrgId, provider: cleanProvider },
      });

      if (existingByProvider && !validAccountIds.includes(existingByProvider.id)) {
        validAccountIds.push(existingByProvider.id);
      }
    }

    if (validAccountIds.length === 0) {
      return NextResponse.json(
        {
          error:
            "No connected social accounts found for the selected platforms. Please connect your official social accounts before publishing.",
        },
        { status: 400 }
      );
    }

    // Resolve creator ID reliably
    const creatorId =
      session.id ||
      (session as any).userId ||
      (await prisma.organizationMember.findFirst({
        where: { organizationId: session.activeOrgId },
        select: { userId: true },
      }))?.userId ||
      (await prisma.user.findFirst({ select: { id: true } }))?.id ||
      "admin";

    // Create SocialPost record with guaranteed valid target foreign keys for ALL selected channels
    const post = await prisma.socialPost.create({
      data: {
        organizationId: session.activeOrgId,
        creatorId,
        content,
        status: initialStatus,
        scheduledFor: scheduledDate,
        targets: {
          create: validAccountIds.map((accId) => ({
            socialAccountId: accId,
            status: "PENDING",
          })),
        },
        media: {
          create: (mediaUrls || []).map((m, index) => ({
            url: typeof m === "string" ? m : m.url,
            mediaType: typeof m === "string" ? "IMAGE" : (m.type || "IMAGE"),
            altText: typeof m === "string" ? "" : (m.altText || ""),
            orderIndex: index,
          })),
        },
      },
      include: {
        targets: {
          include: {
            socialAccount: {
              include: { token: true },
            },
          },
        },
        media: true,
      },
    });

    if (action === "SCHEDULE" && scheduledDate) {
      await prisma.scheduledPost.create({
        data: {
          postId: post.id,
          runAt: scheduledDate,
          timezone: "UTC",
        },
      });
    }

    // If PUBLISH_NOW, trigger real publishing execution across ALL targets
    if (action === "PUBLISH_NOW") {
      let publishedCount = 0;
      let failureCount = 0;
      for (const target of post.targets) {
        const account = target.socialAccount;
        try {
          if (!account.token) {
            failureCount++;
            const errMsg = `${account.provider} account is not connected with live OAuth tokens.`;
            await prisma.socialPostTarget.update({
              where: { id: target.id },
              data: {
                status: "FAILED",
                errorMessage: errMsg,
              },
            });
            await prisma.publishingAttempt.create({
              data: {
                postId: post.id,
                provider: account.provider,
                status: "FAILED",
                errorMessage: errMsg,
              },
            });
            continue;
          }

          const decryptedAccess = decryptToken(
            account.token.encryptedAccessToken,
            account.token.iv,
            account.token.tag
          );

          if (!decryptedAccess || decryptedAccess.startsWith("token_") || decryptedAccess.startsWith("direct_token_")) {
            failureCount++;
            const errMsg = `Live OAuth credentials are not connected for ${account.provider}. Reconnect via official OAuth.`;
            await prisma.socialPostTarget.update({
              where: { id: target.id },
              data: {
                status: "FAILED",
                errorMessage: errMsg,
              },
            });
            await prisma.publishingAttempt.create({
              data: {
                postId: post.id,
                provider: account.provider,
                status: "FAILED",
                errorMessage: errMsg,
              },
            });
            continue;
          }

          const provider = getSocialProvider(account.provider as any);
          const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://pulsesocial1.vercel.app").replace(/\/$/, "");
          const resolvedMedia = post.media.map((m) => ({
            url: m.url.startsWith("http://") || m.url.startsWith("https://")
              ? m.url
              : `${appUrl}${m.url.startsWith("/") ? "" : "/"}${m.url}`,
            type: m.mediaType as "IMAGE" | "VIDEO",
          }));

          const result = await provider.publishPost(decryptedAccess, {
            content,
            targetAccountId: account.providerAccountId,
            mediaUrls: resolvedMedia,
          });

          if (result.success && result.platformPostId) {
            publishedCount++;
            await prisma.socialPostTarget.update({
              where: { id: target.id },
              data: {
                status: "PUBLISHED",
                platformPostId: result.platformPostId,
                publishedAt: new Date(),
              },
            });
            await prisma.publishingAttempt.create({
              data: {
                postId: post.id,
                provider: account.provider,
                status: "SUCCESS",
                responsePayload: JSON.stringify(result),
              },
            });
          } else {
            failureCount++;
            const errMsg = result.error || "Remote platform API rejected publication.";
            await prisma.socialPostTarget.update({
              where: { id: target.id },
              data: {
                status: "FAILED",
                errorMessage: errMsg,
              },
            });
            await prisma.publishingAttempt.create({
              data: {
                postId: post.id,
                provider: account.provider,
                status: "FAILED",
                errorMessage: errMsg,
              },
            });
          }
        } catch (targetErr: any) {
          failureCount++;
          const errMsg = targetErr?.message || "Platform API error.";
          await prisma.socialPostTarget.update({
            where: { id: target.id },
            data: {
              status: "FAILED",
              errorMessage: errMsg,
            },
          });
          await prisma.publishingAttempt.create({
            data: {
              postId: post.id,
              provider: account.provider,
              status: "FAILED",
              errorMessage: errMsg,
            },
          });
        }
      }

      let finalStatus = "FAILED";
      if (publishedCount > 0 && failureCount === 0) {
        finalStatus = "PUBLISHED";
      } else if (publishedCount > 0 && failureCount > 0) {
        finalStatus = "PARTIALLY_PUBLISHED";
      } else {
        finalStatus = "FAILED";
      }

      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: finalStatus,
          publishedAt: publishedCount > 0 ? new Date() : null,
        },
      });
    }

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: `POST_${action}`,
      resourceType: "SocialPost",
      resourceId: post.id,
      details: { targetsCount: targetAccountIds.length },
    });

    const updatedPost = await prisma.socialPost.findUnique({
      where: { id: post.id },
      include: {
        targets: {
          include: {
            socialAccount: {
              include: { token: true },
            },
          },
        },
        media: true,
      },
    });

    return NextResponse.json({ success: true, post: updatedPost || post });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await prisma.socialPost.findFirst({
      where: { id, organizationId: session.activeOrgId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.socialPost.delete({
      where: { id },
    });

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "POST_DELETED",
      resourceType: "SocialPost",
      resourceId: id,
    });

    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to delete post" },
      { status: 500 }
    );
  }
}
