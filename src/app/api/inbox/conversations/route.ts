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

    if (conversations.length === 0) {
      conversations = [
        {
          id: "msg-preview-1",
          senderName: "Priya Sharma",
          senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
          platform: "instagram",
          lastMessage: "Loved your latest post on AI content workflows! How do you handle team approvals?",
          lastMessageAt: "10:24 AM",
          unreadCount: 1,
          type: "MESSAGE" as const,
          messages: [
            {
              id: "m-101",
              sender: "Priya Sharma",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
              text: "Hey there! Loved your latest post on AI content workflows! How do you handle team approvals across multiple brand channels?",
              timestamp: "10:24 AM",
              isMe: false,
            },
          ],
        },
        {
          id: "cmt-preview-2",
          senderName: "Alex Morgan",
          senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
          platform: "linkedin",
          lastMessage: "Great insights on omnichannel social automation. We are implementing this across our 5 brands.",
          lastMessageAt: "09:45 AM",
          unreadCount: 1,
          type: "COMMENT" as const,
          messages: [
            {
              id: "m-102",
              sender: "Alex Morgan",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
              text: "Great insights on omnichannel social automation. We are implementing this across our 5 brands.",
              timestamp: "09:45 AM",
              isMe: false,
            },
          ],
        },
        {
          id: "msg-preview-3",
          senderName: "Devon Vance",
          senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
          platform: "x",
          lastMessage: "Does PulseSocial support multi-account simultaneous scheduling for enterprise teams?",
          lastMessageAt: "Yesterday",
          unreadCount: 0,
          type: "MESSAGE" as const,
          messages: [
            {
              id: "m-103",
              sender: "Devon Vance",
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
              text: "@PulseSocial Does your studio composer support multi-account simultaneous scheduling for enterprise teams?",
              timestamp: "Yesterday",
              isMe: false,
            },
            {
              id: "m-104",
              sender: "PulseSocial Team",
              avatar: "/icons/pulse-logo.svg",
              text: "Yes, absolutely! You can select all your connected channels and publish simultaneously with per-channel rule validation.",
              timestamp: "Yesterday",
              isMe: true,
            },
          ],
        },
        {
          id: "cmt-preview-4",
          senderName: "Sophia Chen",
          senderAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
          platform: "facebook",
          lastMessage: "Our engagement spiked 40% after using your suggested best posting times! 🙌",
          lastMessageAt: "Oct 4",
          unreadCount: 0,
          type: "COMMENT" as const,
          messages: [
            {
              id: "m-105",
              sender: "Sophia Chen",
              avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
              text: "Our engagement spiked 40% after using your suggested best posting times! 🙌",
              timestamp: "Oct 4",
              isMe: false,
            },
          ],
        },
        {
          id: "msg-preview-5",
          senderName: "Marcus Brody",
          senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
          platform: "instagram",
          lastMessage: "Can you share the link to your latest webinar replay?",
          lastMessageAt: "Oct 3",
          unreadCount: 0,
          type: "MESSAGE" as const,
          messages: [
            {
              id: "m-106",
              sender: "Marcus Brody",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
              text: "Can you share the link to your latest webinar replay?",
              timestamp: "Oct 3",
              isMe: false,
            },
          ],
        },
      ];
    }

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
