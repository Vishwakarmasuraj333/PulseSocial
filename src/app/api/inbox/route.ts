import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/security/encryption";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";
import { logAudit } from "@/lib/audit/logger";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";

    // 1. Fetch conversations with threads
    const conversations = await prisma.socialConversation.findMany({
      where: { organizationId: session.activeOrgId },
      include: {
        socialAccount: true,
        messages: {
          orderBy: { sentAt: "asc" },
        },
        assignedUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 50,
    });

    // 2. Fetch comments for this org
    const comments = await prisma.socialComment.findMany({
      where: {
        socialAccount: { organizationId: session.activeOrgId },
      },
      include: { socialAccount: true },
      orderBy: { postedAt: "desc" },
      take: 50,
    });

    // 3. Fetch flat messages for backward compatibility
    const messages = await prisma.socialMessage.findMany({
      where: {
        socialAccount: { organizationId: session.activeOrgId },
      },
      include: { socialAccount: true },
      orderBy: { sentAt: "desc" },
      take: 50,
    });

    const items = [
      ...comments.map((c) => ({
        id: c.id,
        type: "COMMENT" as const,
        sender: c.authorName,
        username: c.authorUsername,
        avatar: c.authorAvatarUrl,
        content: c.content,
        timestamp: c.postedAt,
        platform: c.socialAccount.provider,
        accountName: c.socialAccount.displayName,
        isRead: c.isRead,
        isReplied: c.isReplied,
      })),
      ...messages.map((m) => ({
        id: m.id,
        type: "MESSAGE" as const,
        sender: m.senderName,
        username: m.senderUsername,
        avatar: m.senderAvatarUrl,
        content: m.content,
        timestamp: m.sentAt,
        platform: m.socialAccount.provider,
        accountName: m.socialAccount.displayName,
        direction: m.direction,
        isRead: m.isRead,
        isReplied: false,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const filteredItems =
      type === "comments"
        ? items.filter((i) => i.type === "COMMENT")
        : type === "messages"
        ? items.filter((i) => i.type === "MESSAGE")
        : items;

    return NextResponse.json({
      success: true,
      items: filteredItems,
      conversations,
      stats: {
        totalConversations: conversations.length,
        unreadCount: conversations.reduce((acc, c) => acc + c.unreadCount, 0),
        totalComments: comments.length,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch inbox" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId || !session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, content, socialAccountId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    let conversation = null;
    let account = null;

    if (conversationId) {
      conversation = await prisma.socialConversation.findFirst({
        where: { id: conversationId, organizationId: session.activeOrgId },
        include: { socialAccount: { include: { token: true } } },
      });
      if (conversation) {
        account = conversation.socialAccount;
      }
    } else if (socialAccountId) {
      account = await prisma.socialAccount.findFirst({
        where: { id: socialAccountId, organizationId: session.activeOrgId },
        include: { token: true },
      });
    }

    if (!account) {
      return NextResponse.json({ error: "Connected social account not found" }, { status: 404 });
    }

    if (!account.token) {
      return NextResponse.json(
        { error: `Account ${account.displayName} has no live OAuth credentials.` },
        { status: 400 }
      );
    }

    const decryptedToken = decryptToken(
      account.token.encryptedAccessToken,
      account.token.iv,
      account.token.tag
    );

    const normalizedPlatform = (
      account.provider.toLowerCase() === "twitter"
        ? "x"
        : account.provider.toLowerCase() === "google" ||
          account.provider.toLowerCase() === "google-business"
        ? "google_business"
        : account.provider.toLowerCase()
    ) as SupportedPlatform;

    const provider = getSocialProvider(normalizedPlatform);
    let remoteMessageId = `outbound_${Date.now()}`;

    // If provider supports sendMessageOrReply, dispatch real message
    if (conversation && typeof provider.sendMessageOrReply === "function") {
      const res = await provider.sendMessageOrReply(
        decryptedToken,
        conversation.platformConversationId,
        content.trim(),
        account.providerAccountId
      );
      if (!res.success) {
        return NextResponse.json(
          { error: res.error || "Failed to deliver message through social platform API." },
          { status: 400 }
        );
      }
      if (res.messageId) remoteMessageId = res.messageId;
    }

    // Persist outbound message in database
    const newMsg = await prisma.socialMessage.create({
      data: {
        id: remoteMessageId,
        socialAccountId: account.id,
        conversationId: conversation?.id || null,
        platformMessageId: remoteMessageId,
        platform: normalizedPlatform,
        senderName: account.displayName,
        senderUsername: account.username,
        senderAvatarUrl: account.profileImageUrl,
        content: content.trim(),
        direction: "OUTBOUND",
        isRead: true,
        sentAt: new Date(),
      },
    });

    if (conversation) {
      await prisma.socialConversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageSnippet: content.trim().slice(0, 100),
          lastMessageAt: new Date(),
        },
      });
    }

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "INBOX_MESSAGE_SENT",
      resourceType: "SocialMessage",
      resourceId: newMsg.id,
      details: {
        platform: normalizedPlatform,
        conversationId: conversation?.id,
        recipient: conversation?.participantName,
      },
    });

    return NextResponse.json({
      success: true,
      message: newMsg,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to send message" },
      { status: 500 }
    );
  }
}
