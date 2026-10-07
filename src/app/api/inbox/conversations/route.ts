import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";

    const dbMessages = await prisma.socialMessage.findMany({
      where: { socialAccount: { organizationId: session.activeOrgId } },
      include: { socialAccount: true },
      orderBy: { sentAt: "desc" },
      take: 50,
    });

    const dbComments = await prisma.socialComment.findMany({
      where: { socialAccount: { organizationId: session.activeOrgId } },
      include: { socialAccount: true },
      orderBy: { postedAt: "desc" },
      take: 50,
    });

    let conversations = [
      ...dbMessages.map((m) => ({
        id: `msg-${m.id}`,
        senderName: m.senderName,
        senderAvatar: m.senderAvatarUrl || undefined,
        platform: m.socialAccount.provider,
        lastMessage: m.content,
        lastMessageAt: new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        unreadCount: m.isRead ? 0 : 1,
        type: "MESSAGE" as const,
        messages: [
          {
            id: m.id,
            sender: m.senderName,
            avatar: m.senderAvatarUrl || undefined,
            text: m.content,
            timestamp: new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isMe: false,
          },
        ],
      })),
      ...dbComments.map((c) => ({
        id: `cmt-${c.id}`,
        senderName: c.authorName,
        senderAvatar: c.authorAvatarUrl || undefined,
        platform: c.socialAccount.provider,
        lastMessage: c.content,
        lastMessageAt: new Date(c.postedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        unreadCount: c.isRead ? 0 : 1,
        type: "COMMENT" as const,
        messages: [
          {
            id: c.id,
            sender: c.authorName,
            avatar: c.authorAvatarUrl || undefined,
            text: c.content,
            timestamp: new Date(c.postedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isMe: false,
          },
        ],
      })),
    ];


    const filtered =

      type === "unread"
        ? conversations.filter((c) => c.unreadCount > 0)
        : type === "mentions"
        ? conversations.filter((c: { type: string }) => c.type === "MENTION")
        : type === "comments"
        ? conversations.filter((c) => c.type === "COMMENT")
        : type === "messages"
        ? conversations.filter((c) => c.type === "MESSAGE")
        : conversations;

    return NextResponse.json({ conversations: filtered });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load conversations" },
      { status: 500 }
    );
  }
}
