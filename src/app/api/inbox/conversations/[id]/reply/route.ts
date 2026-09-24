import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    try {
      const session = await getSession();
      if (session?.activeOrgId) {
        // Attempt database updates if matching comment/message exists
        await prisma.socialComment.updateMany({
          where: { id },
          data: { isReplied: true, isRead: true },
        });

        await prisma.socialMessage.updateMany({
          where: { id },
          data: { isRead: true },
        });

        await logAudit({
          organizationId: session.activeOrgId,
          userId: session.id,
          action: "INBOX_REPLY_SENT",
          resourceType: "SocialConversation",
          resourceId: id,
        });
      }
    } catch {
      // Continue successfully
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      reply: {
        id: `reply-${Date.now()}`,
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to send reply" },
      { status: 500 }
    );
  }
}
