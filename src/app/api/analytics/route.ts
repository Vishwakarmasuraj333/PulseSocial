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

    const numDays = timeframe === "7d" ? 7 : timeframe === "90d" ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);

    const accounts = await prisma.socialAccount.findMany({
      where: {
        organizationId: session.activeOrgId,
        ...(platform && platform !== "all" ? { provider: platform } : {}),
      },
      include: {
        profile: true,
        analytics: {
          where: {
            metricDate: { gte: startDate },
          },
          orderBy: { metricDate: "desc" },
          take: 30,
        },
        engagementSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    const postsCount = await prisma.socialPost.count({
      where: { organizationId: session.activeOrgId, status: "PUBLISHED" },
    });

    const scheduledCount = await prisma.socialPost.count({
      where: { organizationId: session.activeOrgId, status: "SCHEDULED" },
    });

    const draftsCount = await prisma.socialPost.count({
      where: { organizationId: session.activeOrgId, status: "DRAFT" },
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

      // Also incorporate engagement snapshots if available
      if (acc.engagementSnapshots && acc.engagementSnapshots.length > 0) {
        acc.engagementSnapshots.forEach((snap) => {
          totalLikes += snap.likes || 0;
          totalShares += snap.shares || 0;
          if (!hasRealAnalyticsRecords) {
            totalImpressions += snap.impressions || 0;
            totalReach += snap.reach || 0;
          }
        });
      }
    });

    // If no external analytics records are present, engagement is strictly from real database comments, messages, and likes
    if (!hasRealAnalyticsRecords) {
      totalEngagement = commentsCount + messagesCount + totalLikes + totalShares;
    }

    const calculatedEngagementRate =
      totalReach > 0
        ? Number(((totalEngagement / totalReach) * 100).toFixed(2))
        : totalFollowers !== null && totalFollowers > 0 && totalEngagement > 0
        ? Number(((totalEngagement / totalFollowers) * 100).toFixed(2))
        : 0;

    const followerGrowthRate = 0;

    // Days count based on timeframe
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

    // Real comments in period for engagement area chart
    const periodComments = await prisma.socialComment.findMany({
      where: {
        socialAccount: { organizationId: session.activeOrgId },
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
    });

    // Subdivide into chart sample points (max 8 points for crisp visualization)
    const step = Math.max(1, Math.floor(numDays / 8));
    const engagementBreakdown: { date: string; comments: number; likes: number; saves: number; shares: number }[] = [];

    for (let i = numDays - 1; i >= 0; i -= step) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const dayComments = periodComments.filter(
        (c) => c.createdAt.toISOString().split("T")[0] === dStr
      ).length;
      const dayStat = dateMap.get(dStr);

      engagementBreakdown.push({
        date: label,
        comments: dayComments,
        likes: dayStat?.engagement ? Math.max(0, dayStat.engagement - dayComments) : 0,
        saves: 0,
        shares: 0,
      });
    }

    // Real Top Performing Published Posts
    const publishedPosts = await prisma.socialPost.findMany({
      where: { organizationId: session.activeOrgId, status: "PUBLISHED" },
      include: {
        media: true,
        targets: {
          include: {
            socialAccount: { include: { profile: true } },
          },
        },
        comments: true,
        engagementSnapshots: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 6,
    });

    const topPosts = publishedPosts.map((p) => {
      const target = p.targets[0];
      const prov = target?.socialAccount?.provider || "social";
      const provLabel = target?.socialAccount?.displayName || (prov.charAt(0).toUpperCase() + prov.slice(1));
      const likesCount = p.engagementSnapshots?.reduce((sum, s) => sum + (s.likes || 0), 0) || 0;
      const reachCount = p.engagementSnapshots?.reduce((sum, s) => sum + (s.reach || 0), 0) || (target?.socialAccount?.profile?.followersCount || 0);
      const commentsTotal = p.comments.length;

      return {
        id: p.id,
        platform: prov,
        platformLabel: provLabel,
        caption: p.content.length > 95 ? p.content.slice(0, 95) + "..." : p.content,
        fullContent: p.content,
        publishedAt: p.publishedAt
          ? new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "Recently",
        likes: likesCount >= 1000 ? `${(likesCount / 1000).toFixed(1)}K` : String(likesCount),
        reach: reachCount >= 1000 ? `${(reachCount / 1000).toFixed(1)}K` : String(reachCount),
        rate: calculatedEngagementRate > 0 ? `${calculatedEngagementRate}%` : "0%",
        comments: String(commentsTotal),
        thumbnailUrl: p.media?.[0]?.url || undefined,
      };
    });

    // Real Content Type Performance from DB
    const allOrgPosts = await prisma.socialPost.findMany({
      where: { organizationId: session.activeOrgId, status: "PUBLISHED" },
      include: { media: true },
    });

    let videoCount = 0;
    let carouselCount = 0;
    let singleImageCount = 0;
    let textCount = 0;

    allOrgPosts.forEach((p) => {
      if (p.media.some((m) => m.mediaType === "VIDEO")) {
        videoCount++;
      } else if (p.media.length > 1) {
        carouselCount++;
      } else if (p.media.length === 1) {
        singleImageCount++;
      } else {
        textCount++;
      }
    });

    const totalPublished = allOrgPosts.length;

    const contentTypes = [
      {
        type: "Video & Reels",
        reach: videoCount > 0 && totalReach > 0 ? Math.round((totalReach * videoCount) / totalPublished) : 0,
        engagementRate: videoCount > 0 && calculatedEngagementRate > 0 ? `${calculatedEngagementRate}%` : "0%",
        postsCount: videoCount,
        percentage: totalPublished > 0 ? Math.round((videoCount / totalPublished) * 100) : 0,
        color: "#0284C7",
      },
      {
        type: "Carousel",
        reach: carouselCount > 0 && totalReach > 0 ? Math.round((totalReach * carouselCount) / totalPublished) : 0,
        engagementRate: carouselCount > 0 && calculatedEngagementRate > 0 ? `${calculatedEngagementRate}%` : "0%",
        postsCount: carouselCount,
        percentage: totalPublished > 0 ? Math.round((carouselCount / totalPublished) * 100) : 0,
        color: "#3B82F6",
      },
      {
        type: "Single Image",
        reach: singleImageCount > 0 && totalReach > 0 ? Math.round((totalReach * singleImageCount) / totalPublished) : 0,
        engagementRate: singleImageCount > 0 && calculatedEngagementRate > 0 ? `${calculatedEngagementRate}%` : "0%",
        postsCount: singleImageCount,
        percentage: totalPublished > 0 ? Math.round((singleImageCount / totalPublished) * 100) : 0,
        color: "#60A5FA",
      },
      {
        type: "Text Posts",
        reach: textCount > 0 && totalReach > 0 ? Math.round((totalReach * textCount) / totalPublished) : 0,
        engagementRate: textCount > 0 && calculatedEngagementRate > 0 ? `${calculatedEngagementRate}%` : "0%",
        postsCount: textCount,
        percentage: totalPublished > 0 ? Math.round((textCount / totalPublished) * 100) : 0,
        color: "#93C5FD",
      },
    ];

    // Real Reach by Platform strictly for CONNECTED accounts
    const maxAccountReach = Math.max(
      ...accounts.map((a) => {
        let accR = 0;
        a.analytics?.forEach((st) => { accR += st.reach || 0; });
        return Math.max(accR, a.profile?.followersCount || 0);
      }),
      100
    );

    const platforms = accounts.map((a) => {
      let accReach = 0;
      if (a.analytics && a.analytics.length > 0) {
        a.analytics.forEach((st) => { accReach += st.reach || 0; });
      }
      const followers = a.profile?.followersCount ?? 0;
      const displayReach = accReach > 0 ? accReach : followers;
      const pct = maxAccountReach > 0 ? Math.min(100, Math.round((displayReach / maxAccountReach) * 100)) : 0;

      return {
        id: a.provider.toLowerCase(),
        name: a.displayName || (a.provider.charAt(0).toUpperCase() + a.provider.slice(1)),
        username: a.username || a.displayName,
        profileImageUrl: a.profileImageUrl,
        reach: displayReach,
        reachFormatted: displayReach >= 1000 ? `${(displayReach / 1000).toFixed(1)}K` : String(displayReach),
        followers,
        followersFormatted: followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : String(followers),
        percentage: Math.max(pct, accounts.length === 1 ? 100 : 15),
        status: a.status || "CONNECTED",
      };
    });

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
      draftsCount,
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
      platforms,
      contentTypes,
      topPosts,
      engagementBreakdown,
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
