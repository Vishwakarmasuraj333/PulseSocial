import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.socialNotification.findMany({
      where: { organizationId: session.activeOrgId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = await prisma.socialNotification.count({
      where: {
        organizationId: session.activeOrgId,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.message,
        time: new Date(n.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: n.isRead,
        type: n.type.toLowerCase(),
      })),
      unreadCount,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, markAllRead } = body;

    if (markAllRead) {
      await prisma.socialNotification.updateMany({
        where: { organizationId: session.activeOrgId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (id) {
      await prisma.socialNotification.updateMany({
        where: { id, organizationId: session.activeOrgId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "Notification marked as read." });
    }

    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update notification" },
      { status: 500 }
    );
  }
}
