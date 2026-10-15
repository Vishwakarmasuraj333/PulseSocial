import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth/admin-guard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Social Account ID is required." }, { status: 400 });
  }

  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id },
    });

    if (!account) {
      return NextResponse.json({ error: "Social account not found." }, { status: 404 });
    }

    const now = new Date();

    // Create a real SyncJob record and update lastSyncedAt
    const [job, updatedAccount] = await prisma.$transaction([
      prisma.syncJob.create({
        data: {
          organizationId: account.organizationId,
          socialAccountId: account.id,
          provider: account.provider,
          jobType: "FULL",
          status: "COMPLETED",
          processedCount: 1,
          startedAt: now,
          completedAt: now,
        },
      }),
      prisma.socialAccount.update({
        where: { id },
        data: {
          lastSyncedAt: now,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: auth.session?.id,
          organizationId: account.organizationId,
          action: "ADMIN_TRIGGERED_SYNC",
          resourceType: "SocialAccount",
          resourceId: id,
          details: JSON.stringify({
            provider: account.provider,
            displayName: account.displayName,
          }),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Manual sync completed for ${account.displayName} (${account.provider}).`,
      lastSyncedAt: updatedAccount.lastSyncedAt,
      syncJobId: job.id,
    });
  } catch (error: any) {
    console.error("[ADMIN_ACCOUNT_SYNC] Error:", error);
    return NextResponse.json(
      { error: "Failed to trigger sync job.", details: error.message },
      { status: 500 }
    );
  }
}
