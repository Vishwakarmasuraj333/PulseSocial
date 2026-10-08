import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { syncSocialEngagement } from "@/lib/social/engagement-sync";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { postId, socialAccountId } = body;

    const summary = await syncSocialEngagement({
      organizationId: session.activeOrgId,
      postId: postId || undefined,
      socialAccountId: socialAccountId || undefined,
    });

    // If postId was specified, fetch the updated engagement snapshots & comments
    let snapshots: any[] = [];
    let comments: any[] = [];

    if (postId) {
      snapshots = await prisma.socialEngagementSnapshot.findMany({
        where: { postId },
        include: {
          socialAccount: {
            select: {
              id: true,
              displayName: true,
              username: true,
              profileImageUrl: true,
              provider: true,
            },
          },
        },
      });

      comments = await prisma.socialComment.findMany({
        where: {
          postId,
          socialAccount: {
            organizationId: session.activeOrgId,
          },
        },
        orderBy: { postedAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      summary,
      snapshots,
      comments,
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to refresh engagement" },
      { status: 500 }
    );
  }
}
