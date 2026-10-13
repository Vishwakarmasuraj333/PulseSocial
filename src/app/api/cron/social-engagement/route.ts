import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncSocialEngagement } from "@/lib/social/engagement-sync";
import { verifyCronAuth } from "@/lib/security/cron-auth";

/**
 * Background Engagement Sync Job
 * GET /api/cron/social-engagement
 */
export async function GET(req: Request) {
  return handleSync(req);
}

export async function POST(req: Request) {
  return handleSync(req);
}

async function handleSync(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized cron execution", code: "FORBIDDEN" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const summary = await syncSocialEngagement({ limit });

    // Also run full account sync for accounts needing refresh
    const staleThreshold = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    const staleAccounts = await prisma.socialAccount.findMany({
      where: {
        status: "CONNECTED",
        OR: [
          { lastSyncedAt: null },
          { lastSyncedAt: { lt: staleThreshold } },
        ],
      },
      take: 10,
    });

    const accountSyncResults = [];
    const { syncAccountData } = await import("@/lib/social/sync-engine");
    for (const acc of staleAccounts) {
      const res = await syncAccountData({
        socialAccountId: acc.id,
        organizationId: acc.organizationId,
      });
      accountSyncResults.push({ id: acc.id, provider: acc.provider, success: res.success });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      accountsRefreshed: accountSyncResults.length,
      accountSyncResults,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Engagement sync cron failed",
      },
      { status: 500 }
    );
  }
}
