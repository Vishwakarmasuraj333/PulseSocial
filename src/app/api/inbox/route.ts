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

    const comments = await prisma.socialComment.findMany({
      where: {
        socialAccount: { organizationId: session.activeOrgId },
      },
      include: { socialAccount: true },
      orderBy: { postedAt: "desc" },
      take: 50,
    });

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
        isRead: m.isRead,
        isReplied: false,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const filtered =
      type === "comments"
        ? items.filter((i) => i.type === "COMMENT")
        : type === "messages"
        ? items.filter((i) => i.type === "MESSAGE")
        : items;

    return NextResponse.json({ items: filtered });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch inbox" },
      { status: 500 }
    );
  }
}
