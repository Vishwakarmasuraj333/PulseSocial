import { NextResponse } from "next/server";
import { executeSocialAction } from "@/lib/social/action-executor";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ platform: string; commentId: string }> }
) {
  try {
    const { platform, commentId } = await params;
    const session = await getSession();

    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to get socialAccountId from query string or body or lookup
    const { searchParams } = new URL(req.url);
    let socialAccountId = searchParams.get("socialAccountId");

    if (!socialAccountId) {
      try {
        const body = await req.json().catch(() => ({}));
        socialAccountId = body.socialAccountId;
      } catch {}
    }

    if (!socialAccountId) {
      // Find comment in database to retrieve verified socialAccountId
      const existing = await prisma.socialComment.findFirst({
        where: {
          platformCommentId: commentId,
          socialAccount: {
            organizationId: session.activeOrgId,
          },
        },
      });
      socialAccountId = existing?.socialAccountId || null;
    }

    if (!socialAccountId) {
      return NextResponse.json(
        {
          success: false,
          code: "ACCOUNT_REQUIRED",
          error: "Unable to identify authorized social account for this comment.",
        },
        { status: 400 }
      );
    }

    const result = await executeSocialAction({
      platform,
      actionType: "DELETE_COMMENT",
      socialAccountId,
      externalCommentId: commentId,
    });

    if (!result.success) {
      const status =
        result.code === "UNAUTHORIZED"
          ? 401
          : result.code === "FORBIDDEN"
          ? 403
          : result.code === "RATE_LIMITED"
          ? 429
          : result.code === "UNSUPPORTED_ACTION"
          ? 400
          : result.requiresReauth
          ? 401
          : 400;

      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        actionType: "DELETE_COMMENT",
        code: "SERVER_ERROR",
        error: (error as Error).message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ platform: string; commentId: string }> }
) {
  try {
    const { platform, commentId } = await params;
    const body = await req.json();
    const { socialAccountId, action } = body;

    if (action === "hide" || action === "HIDE_COMMENT") {
      const result = await executeSocialAction({
        platform,
        actionType: "HIDE_COMMENT",
        socialAccountId,
        externalCommentId: commentId,
      });

      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid action. Supported: hide" },
      { status: 400 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
