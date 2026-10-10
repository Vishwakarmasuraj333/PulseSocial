import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const [unreadMessages, unreadComments] = await Promise.all([
      prisma.socialMessage.count({
        where: {
          socialAccount: { organizationId: session.activeOrgId },
          isRead: false,
        },
      }),
      prisma.socialComment.count({
        where: {
          socialAccount: { organizationId: session.activeOrgId },
          isRead: false,
        },
      }),
    ]);

    const unreadCount = unreadMessages + unreadComments;
    return NextResponse.json({
      unreadCount,
      messages: unreadMessages,
      comments: unreadComments,
    });
  } catch (error: unknown) {
    return NextResponse.json({ unreadCount: 0 });
  }
}
