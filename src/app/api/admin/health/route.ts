import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth/admin-guard";

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    // 1. Measure real DB latency
    const startPing = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Math.round(performance.now() - startPing);

    // 2. Fetch real counts across database
    const [
      userCount,
      activeUserCount,
      suspendedUserCount,
      orgCount,
      accountCount,
      connectedAccountCount,
      postCount,
      publishedPostCount,
      failedPostCount,
      scheduledPostCount,
      syncJobCount,
      failedSyncJobCount,
      auditLogCount,
      feedbackCount,
      contactCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.organization.count(),
      prisma.socialAccount.count(),
      prisma.socialAccount.count({ where: { status: "CONNECTED" } }),
      prisma.socialPost.count(),
      prisma.socialPost.count({ where: { status: "PUBLISHED" } }),
      prisma.socialPost.count({ where: { status: "FAILED" } }),
      prisma.socialPost.count({ where: { status: "SCHEDULED" } }),
      prisma.syncJob.count(),
      prisma.syncJob.count({ where: { status: "FAILED" } }),
      prisma.auditLog.count(),
      prisma.feedback.count(),
      prisma.contactRequest.count(),
    ]);

    // 3. Token health: count expired tokens
    const now = new Date();
    const expiredAccounts = await prisma.socialAccount.count({
      where: {
        tokenExpiresAt: { lt: now },
      },
    });

    // 4. Memory & environment stats
    const mem = process.memoryUsage();
    const systemInfo = {
      uptimeSeconds: Math.round(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMb: Math.round(mem.rss / (1024 * 1024)),
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
      },
    };

    const isHealthy = dbLatencyMs < 1000 && failedPostCount < (publishedPostCount || 1) * 2;

    return NextResponse.json({
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      timestamp: new Date().toISOString(),
      database: {
        status: dbLatencyMs < 500 ? "OPTIMAL" : dbLatencyMs < 1000 ? "ACCEPTABLE" : "SLOW",
        latencyMs: dbLatencyMs,
        provider: "PostgreSQL (Supabase)",
      },
      counts: {
        users: { total: userCount, active: activeUserCount, suspended: suspendedUserCount },
        organizations: orgCount,
        socialAccounts: { total: accountCount, connected: connectedAccountCount, expired: expiredAccounts },
        posts: { total: postCount, published: publishedPostCount, failed: failedPostCount, scheduled: scheduledPostCount },
        syncJobs: { total: syncJobCount, failed: failedSyncJobCount },
        auditLogs: auditLogCount,
        support: { feedback: feedbackCount, contacts: contactCount },
      },
      system: systemInfo,
    });
  } catch (error: any) {
    console.error("[ADMIN_HEALTH_GET] Error:", error);
    return NextResponse.json(
      {
        status: "UNHEALTHY",
        error: "System health probe failed.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
