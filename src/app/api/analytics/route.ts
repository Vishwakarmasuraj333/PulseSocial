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
    const platform = searchParams.get("platform");

    const accounts = await prisma.socialAccount.findMany({
      where: {
        organizationId: session.activeOrgId,
        ...(platform && platform !== "all" ? { provider: platform } : {}),
      },
      include: {
        profile: true,
        analytics: {
          orderBy: { metricDate: "desc" },
          take: 30,
        },
      },
    });

    // Calculate aggregated totals
    let totalFollowers = 0;
    let totalImpressions = 0;
    let totalReach = 0;
    let totalEngagement = 0;
    let totalClicks = 0;

    accounts.forEach((acc) => {
      totalFollowers += acc.profile?.followersCount || 0;
      acc.analytics.forEach((stat) => {
        totalImpressions += stat.impressions;
        totalReach += stat.reach;
        totalEngagement += stat.engagementCount;
        totalClicks += stat.clicks;
      });
    });

    const postsCount = await prisma.socialPost.count({
      where: { organizationId: session.activeOrgId, status: "PUBLISHED" },
    });

    const scheduledCount = await prisma.socialPost.count({
      where: { organizationId: session.activeOrgId, status: "SCHEDULED" },
    });

    const commentsCount = await prisma.socialComment.count({
      where: { socialAccount: { organizationId: session.activeOrgId } },
    });

    const messagesCount = await prisma.socialMessage.count({
      where: { socialAccount: { organizationId: session.activeOrgId } },
    });

    // Build day-by-day trend data
    const dailyMap: Record<string, { date: string; impressions: number; reach: number; engagement: number }> = {};
    accounts.forEach((acc) => {
      acc.analytics.forEach((stat) => {
        const d = stat.metricDate.toISOString().split("T")[0];
        if (!dailyMap[d]) {
          dailyMap[d] = { date: d, impressions: 0, reach: 0, engagement: 0 };
        }
        dailyMap[d].impressions += stat.impressions;
        dailyMap[d].reach += stat.reach;
        dailyMap[d].engagement += stat.engagementCount;
      });
    });

    const trends = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      summary: {
        totalFollowers,
        totalImpressions,
        totalReach,
        totalEngagement,
        engagementRate: totalReach > 0 ? Number(((totalEngagement / totalReach) * 100).toFixed(2)) : 0,
        postsPublished: postsCount,
        scheduledPosts: scheduledCount,
        commentsCount,
        messagesCount,
        totalClicks,
      },
      trends,
      accounts: accounts.map((a) => ({
        id: a.id,
        provider: a.provider,
        displayName: a.displayName,
        username: a.username,
        profileImageUrl: a.profileImageUrl,
        followersCount: a.profile?.followersCount || 0,
        status: a.status,
      })),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}
