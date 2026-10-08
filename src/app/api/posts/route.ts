import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";
import { getSocialProvider } from "@/lib/social/registry";
import { decryptToken } from "@/lib/security/encryption";
import { getPlatformCapability } from "@/lib/social/capabilities";

const CreatePostSchema = z.object({
  content: z.string().optional().default(""),
  targetAccountIds: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  action: z.enum(["DRAFT", "SCHEDULE", "PUBLISH_NOW", "QUEUE"]).optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "QUEUED"]).optional(),
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
    // 1. Session verification
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

    const {
      content: rawContent,
      targetAccountIds,
      platforms,
      action: explicitAction,
      status: explicitStatus,
      scheduledFor,
      mediaUrls,
    } = validated.data;

    const content = (rawContent || "").trim();

    // Map flexible action/status
    let action: "DRAFT" | "SCHEDULE" | "PUBLISH_NOW" | "QUEUE" = explicitAction || "DRAFT";
    if (!explicitAction && explicitStatus) {
      if (explicitStatus === "PUBLISHED") action = "PUBLISH_NOW";
      else if (explicitStatus === "SCHEDULED") action = "SCHEDULE";
      else if (explicitStatus === "QUEUED") action = "QUEUE";
      else action = "DRAFT";
    }

    // 2. Organization verification
    const org = await prisma.organization.findUnique({
      where: { id: session.activeOrgId },
    });
    if (!org) {
      return NextResponse.json({ error: "Organization workspace not found." }, { status: 404 });
    }

    // 3. Content and media presence validation
    const hasMedia = Boolean(mediaUrls && mediaUrls.length > 0);
    const hasContent = Boolean(content.length > 0);
    if (!hasContent && !hasMedia) {
      return NextResponse.json(
        { error: "Post content or media attachment is required." },
        { status: 400 }
      );
    }

    // 4. Social account resolution
    const requestedTargets = [
      ...(targetAccountIds || []),
      ...(platforms || []),
    ];

    const validAccountIds: string[] = [];

    for (const targetId of requestedTargets) {
      if (!targetId || targetId === "default-channel" || targetId === "auto") continue;

      const byId = await prisma.socialAccount.findFirst({
        where: { id: targetId, organizationId: session.activeOrgId },
      });
      if (byId) {
        if (!validAccountIds.includes(byId.id)) validAccountIds.push(byId.id);
        continue;
      }

      const cleanProvider = targetId.toLowerCase().replace(/^channel-/, "").trim();
      const existingByProvider = await prisma.socialAccount.findFirst({
        where: {
          organizationId: session.activeOrgId,
          provider: cleanProvider === "google_business" ? "googlebusiness" : cleanProvider,
        },
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

    // Fetch full accounts including tokens to perform pre-publish validations
    const targetAccounts = await prisma.socialAccount.findMany({
      where: { id: { in: validAccountIds } },
      include: { token: true },
    });

    const normalizedMedia = (mediaUrls || []).map((m, index) => ({
      url: typeof m === "string" ? m : m.url,
      type: typeof m === "string" ? "IMAGE" : (m.type || "IMAGE"),
      altText: typeof m === "string" ? "" : (m.altText || ""),
      orderIndex: index,
    }));

    const hasVideo = normalizedMedia.some((m) => m.type === "VIDEO");

    // 5. Pre-publish validations (Requirement 6) when action === "PUBLISH_NOW"
    if (action === "PUBLISH_NOW") {
      const preflightErrors: string[] = [];

      for (const acc of targetAccounts) {
        const cap = getPlatformCapability(acc.provider);

        // a. Token existence
        if (!acc.token) {
          preflightErrors.push(
            `Connected configuration incomplete: ${cap.displayName} account is not connected with OAuth credentials.`
          );
          continue;
        }

        // b. Token expiry
        if (acc.token.expiresAt && acc.token.expiresAt < new Date()) {
          preflightErrors.push(
            `Reauthorization required: OAuth access token for ${cap.displayName} has expired. Please reauthorize account.`
          );
          continue;
        }

        // c. Platform capability
        if (!cap.canPublish || cap.status === "BLOCKED") {
          preflightErrors.push(
            `Publishing blocked: ${cap.displayName} does not permit direct publishing (${cap.unsupportedMessage || "Policy restriction"}).`
          );
          continue;
        }

        // d. Approval state
        if (cap.APPROVAL_REQUIRED && !cap.PUBLISHING_APPROVED) {
          preflightErrors.push(
            `Connected — Publishing approval required: ${cap.displayName} requires developer partner app review (${cap.unsupportedMessage || "Approval required"}).`
          );
          continue;
        }

        // e. Platform character limits
        if (content.length > cap.maxCharacterLimit) {
          preflightErrors.push(
            `Platform limit exceeded: Content length (${content.length}) exceeds ${cap.displayName} limit of ${cap.maxCharacterLimit} characters.`
          );
          continue;
        }

        // f. Media requirements
        if ((acc.provider === "tiktok" || acc.provider === "youtube") && !hasVideo) {
          preflightErrors.push(
            `${cap.displayName} requires a video attachment for publication.`
          );
          continue;
        }

        if (acc.provider === "pinterest" && normalizedMedia.length === 0) {
          preflightErrors.push(
            `Pinterest requires an image or video attachment for pin creation.`
          );
          continue;
        }
      }

      // If all targets fail pre-flight validation, reject with actionable 422 error
      if (preflightErrors.length === targetAccounts.length) {
        return NextResponse.json(
          {
            error: preflightErrors[0],
            allErrors: preflightErrors,
          },
          { status: 422 }
        );
      }
    }

    let initialStatus = "DRAFT";
    if (action === "SCHEDULE") initialStatus = "SCHEDULED";
    if (action === "QUEUE") initialStatus = "QUEUED";
    if (action === "PUBLISH_NOW") initialStatus = "PUBLISHING";

    const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;

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

    // Create SocialPost record
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
          create: normalizedMedia.map((m) => ({
            url: m.url,
            mediaType: m.type as "IMAGE" | "VIDEO",
            altText: m.altText,
            orderIndex: m.orderIndex,
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

    // If PUBLISH_NOW, trigger real publishing execution across all targets
    if (action === "PUBLISH_NOW") {
      let publishedCount = 0;
      let failureCount = 0;
      const targetErrors: string[] = [];

      for (const target of post.targets) {
        const account = target.socialAccount;
        const cap = getPlatformCapability(account.provider);

        // Pre-validate target before dispatch
        if (!account.token) {
          failureCount++;
          const errMsg = `Connected configuration incomplete: ${cap.displayName} is missing live OAuth credentials.`;
          targetErrors.push(errMsg);
          await prisma.socialPostTarget.update({
            where: { id: target.id },
            data: { status: "FAILED", errorMessage: errMsg },
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

        if (account.token.expiresAt && account.token.expiresAt < new Date()) {
          failureCount++;
          const errMsg = `Reauthorization required: OAuth token for ${cap.displayName} has expired.`;
          targetErrors.push(errMsg);
          await prisma.socialPostTarget.update({
            where: { id: target.id },
            data: { status: "FAILED", errorMessage: errMsg },
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

        if (cap.APPROVAL_REQUIRED && !cap.PUBLISHING_APPROVED) {
          failureCount++;
          const errMsg = `Connected — Publishing approval required: ${cap.displayName} requires developer partner review (${cap.unsupportedMessage || "Approval required"}).`;
          targetErrors.push(errMsg);
          await prisma.socialPostTarget.update({
            where: { id: target.id },
            data: { status: "FAILED", errorMessage: errMsg },
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

        try {
          const decryptedAccess = decryptToken(
            account.token.encryptedAccessToken,
            account.token.iv,
            account.token.tag
          );

          if (!decryptedAccess || decryptedAccess.startsWith("token_") || decryptedAccess.startsWith("direct_token_")) {
            failureCount++;
            const errMsg = `Live OAuth credentials are not connected for ${cap.displayName}. Reconnect via official OAuth.`;
            targetErrors.push(errMsg);
            await prisma.socialPostTarget.update({
              where: { id: target.id },
              data: { status: "FAILED", errorMessage: errMsg },
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

          // Section 7: Only after real platform API returns success:
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
            // Section 8: Platform returned approval/permission or remote API error:
            failureCount++;
            const errMsg = result.error || "Remote platform API rejected publication.";
            targetErrors.push(errMsg);
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
          const errMsg = targetErr?.message || "Platform API network exception.";
          targetErrors.push(errMsg);
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

      // If zero targets succeeded, return actionable failure (Section 8)
      if (publishedCount === 0) {
        return NextResponse.json(
          {
            error: targetErrors[0] || "Publishing failed across selected platforms.",
            allErrors: targetErrors,
            post: updatedPost,
          },
          { status: 422 }
        );
      }

      return NextResponse.json({
        success: true,
        post: updatedPost,
        publishedCount,
        failureCount,
        partialWarning: failureCount > 0 ? targetErrors.join(" | ") : undefined,
      });
    }

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: `POST_${action}`,
      resourceType: "SocialPost",
      resourceId: post.id,
      details: { targetsCount: targetAccounts.length },
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
