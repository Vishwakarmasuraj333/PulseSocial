import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";
import { executeSocialAction } from "@/lib/social/action-executor";
import { getPlatformCapability } from "@/lib/social/capabilities";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized", code: "FORBIDDEN" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message cannot be empty", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const cleanId = id.replace(/^(cmt-|msg-)/, "");

    // 1. Try finding as a Social Comment
    const comment = await prisma.socialComment.findFirst({
      where: {
        id: { in: [id, cleanId] },
        socialAccount: { organizationId: session.activeOrgId },
      },
      include: {
        socialAccount: true,
      },
    });

    if (comment) {
      const cap = getPlatformCapability(comment.socialAccount.provider, comment.socialAccount);
      if (!cap.canComment) {
        return NextResponse.json(
          {
            success: false,
            error: `${cap.displayName} does not support programmatic comment replies via official API.`,
            code: "PROVIDER_UNSUPPORTED_CAPABILITY",
          },
          { status: 400 }
        );
      }

      // Execute real reply via official provider API
      const actionResult = await executeSocialAction({
        platform: comment.socialAccount.provider,
        actionType: "REPLY",
        socialAccountId: comment.socialAccountId,
        externalPostId: comment.platformPostId || "",
        externalCommentId: comment.platformCommentId,
        content: message.trim(),
      });

      if (!actionResult.success) {
        const statusCode = actionResult.requiresReauth ? 401 : 400;
        return NextResponse.json(
          {
            success: false,
            error: actionResult.error || "Failed to dispatch reply to social network.",
            code: actionResult.code,
            requiresReauth: actionResult.requiresReauth,
          },
          { status: statusCode }
        );
      }

      await prisma.socialComment.update({
        where: { id: comment.id },
        data: { isReplied: true, isRead: true },
      });

      await logAudit({
        organizationId: session.activeOrgId,
        userId: session.id,
        action: "COMMENT_REPLY_SENT",
        resourceType: "SocialComment",
        resourceId: comment.id,
        details: { platform: comment.socialAccount.provider, externalActionId: actionResult.externalActionId },
      });

      return NextResponse.json({
        success: true,
        message: "Reply posted successfully via official platform API.",
        reply: actionResult.data,
        externalActionId: actionResult.externalActionId,
      });
    }

    // 2. Try finding as a Social Message (DM)
    const socialMessage = await prisma.socialMessage.findFirst({
      where: {
        id: { in: [id, cleanId] },
        socialAccount: { organizationId: session.activeOrgId },
      },
      include: {
        socialAccount: true,
      },
    });

    if (socialMessage) {
      // Direct messaging API requires approved advanced access (e.g. Meta Messenger / WhatsApp / X DM)
      // Check if provider account has message sending capability
      return NextResponse.json(
        {
          success: false,
          error: `Direct message reply via ${socialMessage.socialAccount.displayName} requires approved provider messaging permissions (app review pending).`,
          code: "PROVIDER_APPROVAL_REQUIRED",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Conversation not found in active workspace.", code: "RESOURCE_NOT_FOUND" },
      { status: 404 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to process reply", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
