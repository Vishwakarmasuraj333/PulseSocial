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

    // Server-side RBAC check: Viewers and unauthorized editors cannot publish
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: session.activeOrgId,
          userId: session.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    const role = member.role.toUpperCase();
    if (role === "VIEWER" || role === "ANALYST") {
      return NextResponse.json(
        { error: "You do not have permission to publish posts in this workspace" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const post = await prisma.socialPost.findFirst({
      where: {
        id,
        organizationId: session.activeOrgId,
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

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

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
            errorMessage: "No valid authorization token found. Re-authentication required.",
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

        const provider = getSocialProvider(account.provider as SupportedPlatform);
        const result = await provider.publishPost(decryptedAccess, {
          content: post.content,
          targetAccountId: account.providerAccountId,
          mediaUrls: post.media.map((m) => ({
            url: m.url,
            type: m.mediaType as "IMAGE" | "VIDEO",
          })),
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
              errorMessage: result.error || "Publishing was rejected by social platform",
            },
          });
        }
      } catch (targetErr: unknown) {
        failureCount++;
        await prisma.socialPostTarget.update({
          where: { id: target.id },
          data: {
            status: "FAILED",
            errorMessage: (targetErr as Error).message || "Failed to publish post",
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

    const updated = await prisma.socialPost.update({
      where: { id },
      data: {
        status: finalStatus,
        publishedAt: publishedCount > 0 ? new Date() : null,
      },
    });

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "POST_PUBLISHED",
      resourceType: "SocialPost",
      resourceId: id,
      details: { publishedCount, failureCount, finalStatus },
    });

    return NextResponse.json({
      success: publishedCount > 0,
      status: finalStatus,
      publishedCount,
      failureCount,
      post: updated,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to execute post publish" },
      { status: 500 }
    );
  }
}
