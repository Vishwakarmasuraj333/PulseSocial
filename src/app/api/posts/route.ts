import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";
import { decryptToken } from "@/lib/security/encryption";

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

    // Resolve or establish valid SocialAccount IDs for this organization
    let validAccountIds: string[] = [];
    if (targetAccountIds && targetAccountIds.length > 0) {
      const existingAccounts = await prisma.socialAccount.findMany({
        where: {
          organizationId: session.activeOrgId,
          id: { in: targetAccountIds },
        },
        select: { id: true },
      });
      validAccountIds = existingAccounts.map((a) => a.id);
    }

    // If none matched, check for any existing accounts in this organization
    if (validAccountIds.length === 0) {
      const fallbackAccounts = await prisma.socialAccount.findMany({
        where: { organizationId: session.activeOrgId, status: "CONNECTED" },
        take: 3,
        select: { id: true },
      });
      if (fallbackAccounts.length > 0) {
        validAccountIds = fallbackAccounts.map((a) => a.id);
      } else {
        return NextResponse.json(
          {
            error:
              "No connected social accounts found in this workspace. Please connect a social channel via official OAuth before publishing or scheduling posts.",
          },
          { status: 400 }
        );
      }
    }

    // Create SocialPost record with guaranteed valid target foreign keys
    const post = await prisma.socialPost.create({
      data: {
        organizationId: session.activeOrgId,
        creatorId: session.id,
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

    // If PUBLISH_NOW, trigger real publishing execution
    if (action === "PUBLISH_NOW") {
      let publishedCount = 0;
      let failureCount = 0;

      for (const target of post.targets) {
        const account = target.socialAccount;
        try {
          if (!account.token) {
            failureCount++;
            await prisma.socialPostTarget.update({
              where: { id: target.id },
              data: {
                status: "FAILED",
                errorMessage: "No valid OAuth authorization token found for this account. Please reconnect via official OAuth.",
              },
            });
            continue;
          }

          const decryptedAccess = decryptToken(
            account.token.encryptedAccessToken,
            account.token.iv,
            account.token.tag
          );

          const provider = getSocialProvider(account.provider as SupportedPlatform);
          const result = await provider.publishPost(decryptedAccess, {
            content,
            targetAccountId: account.providerAccountId,
            mediaUrls: post.media.map((m) => ({ url: m.url, type: m.mediaType as "IMAGE" | "VIDEO" })),
          });

          if (result.success) {
            publishedCount++;
            await prisma.socialPostTarget.update({
              where: { id: target.id },
              data: {
                status: "PUBLISHED",
                platformPostId: result.platformPostId,
                publishedAt: new Date(),
              },
            });
          } else {
            failureCount++;
            await prisma.socialPostTarget.update({
              where: { id: target.id },
              data: {
                status: "FAILED",
                errorMessage: result.error,
              },
            });
          }
        } catch (targetErr: unknown) {
          failureCount++;
          await prisma.socialPostTarget.update({
            where: { id: target.id },
            data: {
              status: "FAILED",
              errorMessage: (targetErr as Error).message,
            },
          });
        }
      }

      const finalStatus =
        publishedCount > 0 && failureCount === 0
          ? "PUBLISHED"
          : publishedCount > 0 && failureCount > 0
          ? "PARTIALLY_PUBLISHED"
          : "FAILED";

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

    return NextResponse.json({ success: true, post });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create post" },
      { status: 500 }
    );
  }
}
