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
    const timeframe = searchParams.get("timeframe") || "30d";

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

    // Calculate aggregated totals strictly from real data
    let totalFollowers: number | null = null;
    let totalImpressions = 0;
    let totalReach = 0;
    let totalEngagement = 0;
    let totalClicks = 0;
    let totalShares = 0;
    let totalLikes = 0;
    let hasRealAnalyticsRecords = false;

    // Group analytics by date if available
    const dateMap = new Map<string, { impressions: number; reach: number; engagement: number; clicks: number }>();

    accounts.forEach((acc) => {
      if (typeof acc.profile?.followersCount === "number") {
        totalFollowers = (totalFollowers ?? 0) + acc.profile.followersCount;
      }

      if (acc.analytics && acc.analytics.length > 0) {
        hasRealAnalyticsRecords = true;
        acc.analytics.forEach((stat) => {
          totalImpressions += stat.impressions || 0;
          totalReach += stat.reach || 0;
          totalEngagement += stat.engagementCount || 0;
          totalClicks += stat.clicks || 0;
          totalShares += stat.shares || 0;

          const dKey = stat.metricDate.toISOString().split("T")[0];
          const existing = dateMap.get(dKey) || { impressions: 0, reach: 0, engagement: 0, clicks: 0 };
          dateMap.set(dKey, {
            impressions: existing.impressions + (stat.impressions || 0),
            reach: existing.reach + (stat.reach || 0),
            engagement: existing.engagement + (stat.engagementCount || 0),
            clicks: existing.clicks + (stat.clicks || 0),
          });
        });
      }
    });

    // If no external analytics records are present, engagement is strictly from real database comments and messages
    if (!hasRealAnalyticsRecords) {
      totalEngagement = commentsCount + messagesCount;
    }

    const calculatedEngagementRate =
      totalReach > 0
        ? Number(((totalEngagement / totalReach) * 100).toFixed(2))
        : totalFollowers !== null && totalFollowers > 0 && totalEngagement > 0
        ? Number(((totalEngagement / totalFollowers) * 100).toFixed(2))
        : 0;

    const followerGrowthRate = 0;

    // Days count based on timeframe
    const numDays = timeframe === "7d" ? 7 : timeframe === "90d" ? 90 : 30;
    const now = new Date();
    const trends: { date: string; impressions: number; reach: number; engagement: number }[] = [];
    const chartData: { date: string; followers: number | null; engagement: number; reach: number }[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const dayData = dateMap.get(dateStr) || { impressions: 0, reach: 0, engagement: 0, clicks: 0 };

      trends.push({
        date: dateStr,
        impressions: dayData.impressions,
        reach: dayData.reach,
        engagement: dayData.engagement,
      });

      chartData.push({
        date: dateStr,
        followers: totalFollowers,
        engagement: dayData.engagement,
        reach: dayData.reach,
      });
    }

    const dataSource = hasRealAnalyticsRecords
      ? "API_SYNCED"
      : accounts.length > 0
      ? "DATABASE_CALCULATED"
      : "UNAVAILABLE";

    const summary = {
      totalFollowers,
      totalImpressions,
      totalReach,
      totalEngagement,
      engagementRate: calculatedEngagementRate,
      postsPublished: postsCount,
      scheduledPosts: scheduledCount,
      commentsCount,
      messagesCount,
      totalClicks,
      dataSource,
      isDataAvailable:
        accounts.length > 0 &&
        ((totalFollowers !== null && totalFollowers > 0) ||
          postsCount > 0 ||
          totalImpressions > 0 ||
          commentsCount > 0),
    };

    return NextResponse.json({
      success: true,
      dataSource,
      totalFollowers,
      followerGrowth: followerGrowthRate,
      engagementRate: calculatedEngagementRate,
      totalReach,
      totalImpressions,
      totalClicks,
      totalLikes,
      totalComments: commentsCount,
      totalShares,
      chartData,
      summary,
      trends,
      accounts: accounts.map((a) => {
        const accFollowers = typeof a.profile?.followersCount === "number" ? a.profile.followersCount : null;
        let accImpressions = 0;
        let accReach = 0;
        let accEng = 0;
        if (a.analytics && a.analytics.length > 0) {
          a.analytics.forEach((st) => {
            accImpressions += st.impressions || 0;
            accReach += st.reach || 0;
            accEng += st.engagementCount || 0;
          });
        }
        return {
          id: a.id,
          provider: a.provider,
          displayName: a.displayName,
          username: a.username,
          profileImageUrl: a.profileImageUrl,
          followersCount: accFollowers,
          postsCount: typeof a.profile?.postsCount === "number" ? a.profile.postsCount : postsCount,
          impressions: accImpressions,
          reach: accReach,
          engagements: accEng,
          growthRate: 0,
          status: a.status,
        };
      }),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}
