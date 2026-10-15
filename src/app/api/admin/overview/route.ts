import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { authorized, errorResponse } = await verifyAdminAccess();
  if (!authorized) return errorResponse;

  try {
    const startDb = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startDb;

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalOrgs,
      totalAccounts,
      connectedAccounts,
      totalPosts,
      publishedPosts,
      scheduledPosts,
      draftPosts,
      failedPosts,
      totalAiGenerations,
      pendingFeedback,
      pendingContact,
      recentUsers,
      recentAuditLogs,
      recentPosts,
      recentSyncJobs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.organization.count(),
      prisma.socialAccount.count(),
      prisma.socialAccount.count({ where: { status: "CONNECTED" } }),
      prisma.socialPost.count(),
      prisma.socialPost.count({ where: { status: "PUBLISHED" } }),
      prisma.socialPost.count({ where: { status: "SCHEDULED" } }),
      prisma.socialPost.count({ where: { status: "DRAFT" } }),
      prisma.socialPost.count({ where: { status: "FAILED" } }),
      prisma.aiGeneration.count(),
      prisma.feedback.count({ where: { status: "NEW" } }),
      prisma.contactRequest.count({ where: { status: "PENDING" } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          avatarUrl: true,
          createdAt: true,
          memberships: {
            select: {
              role: true,
              organization: { select: { name: true } },
            },
          },
        },
      }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.socialPost.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { name: true, email: true } },
          targets: {
            include: {
              socialAccount: { select: { provider: true, displayName: true } },
            },
          },
        },
      }),
      prisma.syncJob.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          socialAccount: { select: { provider: true, displayName: true } },
        },
      }),
    ]);

    const totalPublishAttempts = publishedPosts + failedPosts;
    const publishingSuccessRate =
      totalPublishAttempts > 0
        ? Math.round((publishedPosts / totalPublishAttempts) * 100)
        : 100;

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalOrgs,
        totalAccounts,
        connectedAccounts,
        totalPosts,
        publishedPosts,
        scheduledPosts,
        draftPosts,
        failedPosts,
        publishingSuccessRate,
        totalAiGenerations,
        pendingFeedback,
        pendingContact,
      },
      systemHealth: {
        database: { status: "HEALTHY", latencyMs: dbLatencyMs },
        tokenVault: { status: "SECURE", cipher: "AES-256-GCM" },
        activeJobs: recentSyncJobs.length,
      },
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        name: u.name || u.email.split("@")[0],
        email: u.email,
        status: u.status,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt,
        workspacesCount: u.memberships.length,
        primaryRole: u.memberships[0]?.role || "MEMBER",
      })),
      recentAuditLogs: recentAuditLogs.map((l) => ({
        id: l.id,
        action: l.action,
        resourceType: l.resourceType,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
        actor: l.user?.name || l.user?.email || "System",
      })),
      recentPosts: recentPosts.map((p) => ({
        id: p.id,
        content: p.content,
        status: p.status,
        createdAt: p.createdAt,
        scheduledFor: p.scheduledFor,
        author: p.creator?.name || p.creator?.email || "Unknown",
        channels: p.targets.map((t) => t.socialAccount.provider),
      })),
      recentSyncJobs: recentSyncJobs.map((j) => ({
        id: j.id,
        provider: j.provider,
        jobType: j.jobType,
        status: j.status,
        processedCount: j.processedCount,
        startedAt: j.startedAt,
        completedAt: j.completedAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load admin overview metrics" },
      { status: 500 }
    );
  }
}
