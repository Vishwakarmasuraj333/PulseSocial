import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/security/encryption";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";

/**
 * Background Scheduler Worker
 * Processes all scheduled posts where runAt <= now and status is SCHEDULED.
 * Prevents concurrent duplicates, validates OAuth tokens, publishes via platform APIs,
 * records authentic post IDs or failure messages, and updates audit/notification logs.
 */
export async function GET(req: Request) {
  return handleScheduleExecution(req);
}

export async function POST(req: Request) {
  return handleScheduleExecution(req);
}

async function handleScheduleExecution(req: Request) {
  try {
    const now = new Date();

    // 1. Fetch pending scheduled posts that have reached or passed their execution time
    const pendingSchedules = await prisma.scheduledPost.findMany({
      where: {
        runAt: { lte: now },
        post: {
          status: "SCHEDULED",
        },
      },
      include: {
        post: {
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
        },
      },
      take: 20, // Batch limit to avoid timeouts
    });

    if (pendingSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No scheduled posts ready for execution.",
        processedCount: 0,
      });
    }

    const results = [];

    for (const schedule of pendingSchedules) {
      const post = schedule.post;

      // 2. Atomically lock scheduled post to prevent concurrent duplicate worker execution
      const claim = await prisma.scheduledPost.updateMany({
        where: { id: schedule.id, isLocked: false },
        data: { isLocked: true },
      });
      if (claim.count === 0) {
        continue; // Already claimed by another worker instance
      }

      await prisma.socialPost.update({
        where: { id: post.id },
        data: { status: "PUBLISHING" },
      });

      let publishedCount = 0;
      let failureCount = 0;

      for (const target of post.targets) {
        const account = target.socialAccount;

        if (!account.token) {
          failureCount++;
          await prisma.socialPostTarget.update({
            where: { id: target.id },
            data: {
              status: "FAILED",
              errorMessage: "Account has no authorization credentials. Re-authentication required.",
            },
          });
          continue;
        }

        // Check token expiration if tracked
        if (account.token.expiresAt && account.token.expiresAt < now) {
          failureCount++;
          await prisma.socialPostTarget.update({
            where: { id: target.id },
            data: {
              status: "FAILED",
              errorMessage: "OAuth access token expired. Please reconnect this account.",
            },
          });
          await prisma.socialAccount.update({
            where: { id: account.id },
            data: { status: "EXPIRED" },
          });
          continue;
        }

        try {
          const decryptedAccess = decryptToken(
            account.token.encryptedAccessToken,
            account.token.iv,
            account.token.tag
          );

          const provider = getSocialProvider(account.provider as SupportedPlatform);
          const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://pulsesocial1.vercel.app").replace(/\/$/, "");
          const resolvedMedia = post.media.map((m) => ({
            url: m.url.startsWith("http://") || m.url.startsWith("https://")
              ? m.url
              : `${appUrl}${m.url.startsWith("/") ? "" : "/"}${m.url}`,
            type: m.mediaType as "IMAGE" | "VIDEO",
          }));

          const publishResult = await provider.publishPost(decryptedAccess, {
            content: post.content,
            targetAccountId: account.providerAccountId,
            mediaUrls: resolvedMedia,
          });

          if (publishResult.success) {
            publishedCount++;
            await prisma.socialPostTarget.update({
              where: { id: target.id },
              data: {
                status: "PUBLISHED",
                platformPostId: publishResult.platformPostId,
                publishedAt: new Date(),
              },
            });
          } else {
            failureCount++;
            await prisma.socialPostTarget.update({
              where: { id: target.id },
              data: {
                status: "FAILED",
                errorMessage: publishResult.error || "Platform publishing rejected request",
              },
            });
          }
        } catch (publishErr: unknown) {
          failureCount++;
          await prisma.socialPostTarget.update({
            where: { id: target.id },
            data: {
              status: "FAILED",
              errorMessage: (publishErr as Error).message || "Failed to dispatch post to platform",
            },
          });
        }
      }

      // 3. Finalize post status
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

      // 4. Remove or archive the scheduled post record to prevent re-execution
      await prisma.scheduledPost.delete({
        where: { id: schedule.id },
      });

      results.push({
        postId: post.id,
        finalStatus,
        publishedCount,
        failureCount,
      });
    }

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      results,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Scheduler execution failed" },
      { status: 500 }
    );
  }
}
