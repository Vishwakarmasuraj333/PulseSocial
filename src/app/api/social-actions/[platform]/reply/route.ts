import { NextResponse } from "next/server";
import { executeSocialAction } from "@/lib/social/action-executor";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    const body = await req.json();
    const { socialAccountId, externalPostId, externalCommentId, postId, content } = body;

    const result = await executeSocialAction({
      platform,
      actionType: "REPLY",
      socialAccountId,
      externalPostId,
      externalCommentId,
      postId,
      content,
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
        actionType: "REPLY",
        code: "SERVER_ERROR",
        error: (error as Error).message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
