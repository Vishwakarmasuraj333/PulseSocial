import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { syncAccountData } from "@/lib/social/sync-engine";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.socialAccount.findMany({
      where: { organizationId: session.activeOrgId },
      select: {
        id: true,
        provider: true,
        displayName: true,
        username: true,
        status: true,
        lastSyncedAt: true,
        tokenExpiresAt: true,
        syncJobs: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    return NextResponse.json({
      success: true,
      accounts: accounts.map((a) => ({
        id: a.id,
        provider: a.provider,
        displayName: a.displayName,
        username: a.username,
        status: a.status,
        lastSyncedAt: a.lastSyncedAt ? a.lastSyncedAt.toISOString() : null,
        recentJobs: a.syncJobs,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch sync health" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const { accountId } = body;

    if (accountId) {
      const result = await syncAccountData({
        socialAccountId: accountId,
        organizationId: session.activeOrgId,
      });

      return NextResponse.json({
        success: result.success,
        results: [result],
      });
    }

    // Sync all accounts for workspace
    const accounts = await prisma.socialAccount.findMany({
      where: { organizationId: session.activeOrgId },
      select: { id: true, displayName: true, provider: true },
    });

    if (accounts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No connected accounts to synchronize.",
        results: [],
      });
    }

    const results = [];
    for (const acc of accounts) {
      const res = await syncAccountData({
        socialAccountId: acc.id,
        organizationId: session.activeOrgId,
      });
      results.push(res);
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to execute social account sync" },
      { status: 500 }
    );
  }
}
