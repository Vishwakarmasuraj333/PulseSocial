import { NextResponse } from "next/server";
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

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
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
