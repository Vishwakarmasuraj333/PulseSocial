import { NextResponse } from "next/server";
import { syncSocialEngagement } from "@/lib/social/engagement-sync";

/**
 * Background Engagement Sync Job
 * GET /api/cron/social-engagement
 *
 * Flow:
 * 1. Authenticate cron (Bearer token or CRON_SECRET)
 * 2. Find published posts requiring sync
 * 3. Load platform adapter
 * 4. Validate token
 * 5. Fetch supported metrics/comments
 * 6. Upsert external records
 * 7. Update lastSyncedAt
 * 8. Handle token/API errors & mark reauthorization when required
 * 9. Prevent duplicate records via external unique keys
 */
export async function GET(req: Request) {
  return handleSync(req);
}

export async function POST(req: Request) {
  return handleSync(req);
}

async function handleSync(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const { searchParams } = new URL(req.url);
    const cronKey = searchParams.get("key") || searchParams.get("token");

    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret) {
      const isAuthValid =
        authHeader === `Bearer ${expectedSecret}` || cronKey === expectedSecret;
      if (!isAuthValid) {
        return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
      }
    }

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
