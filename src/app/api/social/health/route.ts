import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PLATFORM_CAPABILITIES } from "@/lib/social/capabilities";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";

export type ProductionAuditStatus =
  | "CODE VERIFIED"
  | "EXTERNAL API VERIFIED"
  | "LIVE ACCOUNT TESTED"
  | "APPROVAL REQUIRED"
  | "CREDENTIALS REQUIRED"
  | "REAUTH REQUIRED"
  | "BLOCKED";

export interface PlatformHealthReport {
  platform: string;
  displayName: string;
  apiVersion: string;
  auditStatus: ProductionAuditStatus;

  // Separate operational states (Point 2)
  CONNECTED: boolean;
  TOKEN_VALID: "VALID" | "EXPIRED" | "MISSING";
  ACCOUNT_SYNCED: boolean;
  PUBLISHING_AVAILABLE: boolean;
  LIVE_API_VERIFIED: boolean;
  LIVE_ACCOUNT_TESTED: boolean;

  // Granular check details
  oauthStatus: "PASS" | "FAIL";
  approvalStatus: "APPROVED" | "REQUIRED" | "NOT_REQUIRED";
  mediaStatus: "READY" | "BLOCKED";
  accountCount: number;
  lastApiCheck: string | null;
  lastError: string | null;
  notes?: string;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = session.activeOrgId;

    // Fetch all connected social accounts for this organization
    const accounts = await prisma.socialAccount.findMany({
      where: { organizationId: orgId },
      include: {
        token: {
          select: {
            expiresAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Fetch publishing attempts to verify real live successes/failures
    const recentAttempts = await prisma.publishingAttempt.findMany({
      where: {
        post: { organizationId: orgId },
      },
      orderBy: { attemptedAt: "desc" },
      take: 100,
      select: {
        provider: true,
        status: true,
        errorMessage: true,
        attemptedAt: true,
      },
    });

    const platformsList: SupportedPlatform[] = [
      "facebook",
      "instagram",
      "linkedin",
      "x",
      "youtube",
      "tiktok",
      "pinterest",
      "threads",
      "google_business",
      "mastodon",
      "telegram",
      "reddit",
      "bluesky",
      "snapchat",
    ];

    const health: PlatformHealthReport[] = [];

    for (const p of platformsList) {
      const capKey = p === "google_business" ? "googlebusiness" : p;
      const capability = PLATFORM_CAPABILITIES[capKey] || PLATFORM_CAPABILITIES[p];

      let isConfigured = false;
      try {
        const provider = getSocialProvider(p);
        isConfigured = provider.isConfigured();
      } catch {
        isConfigured = false;
      }

      const matchingAccounts = accounts.filter(
        (a) =>
          a.provider.toLowerCase() === p.toLowerCase() ||
          (p === "google_business" && a.provider.toLowerCase().includes("google"))
      );

      const isConnected = matchingAccounts.length > 0;
      const primaryAccount = matchingAccounts[0];

      // Check token status
      let tokenStatus: "VALID" | "EXPIRED" | "MISSING" = "MISSING";
      if (isConnected) {
        if (primaryAccount.token?.expiresAt && primaryAccount.token.expiresAt < new Date()) {
          tokenStatus = "EXPIRED";
        } else if (primaryAccount.token) {
          tokenStatus = "VALID";
        }
      }

      // Check account synced
      const isSynced = Boolean(isConnected && primaryAccount.lastSyncedAt);

      // Check live publishing history for this workspace
      const providerAttempts = recentAttempts.filter(
        (a) => a.provider.toLowerCase() === p.toLowerCase()
      );
      const hasLiveSuccess = providerAttempts.some((a) => a.status === "SUCCESS");
      const lastFailedAttempt = providerAttempts.find((a) => a.status === "FAILED");
      const lastError = lastFailedAttempt ? lastFailedAttempt.errorMessage : null;

      // Approval requirement
      const isApprovalRequired = capability.APPROVAL_REQUIRED && !capability.PUBLISHING_APPROVED;

      // Publishing availability: true only if connected, token valid, publishing supported, and not blocked by approval
      const isPublishingAvailable = Boolean(
        capability.canPublish &&
        !isApprovalRequired &&
        capability.status !== "BLOCKED" &&
        (!isConnected || tokenStatus === "VALID")
      );

      // Determine strict production audit status (Point 1)
      let auditStatus: ProductionAuditStatus;
      if (capability.status === "BLOCKED" || p === "snapchat") {
        auditStatus = "BLOCKED";
      } else if (!isConfigured) {
        auditStatus = "CREDENTIALS REQUIRED";
      } else if (isConnected && tokenStatus === "EXPIRED") {
        auditStatus = "REAUTH REQUIRED";
      } else if (isApprovalRequired) {
        auditStatus = "APPROVAL REQUIRED";
      } else if (hasLiveSuccess) {
        auditStatus = "LIVE ACCOUNT TESTED";
      } else if (isConnected && tokenStatus === "VALID" && capability.REAL_API_VERIFIED) {
        auditStatus = "EXTERNAL API VERIFIED";
      } else {
        auditStatus = "CODE VERIFIED";
      }

      const lastApiCheck = primaryAccount?.lastSyncedAt
        ? primaryAccount.lastSyncedAt.toISOString()
        : primaryAccount?.token?.updatedAt
        ? primaryAccount.token.updatedAt.toISOString()
        : null;

      health.push({
        platform: p,
        displayName: capability.displayName,
        apiVersion: capability.apiVersion,
        auditStatus,
        CONNECTED: isConnected,
        TOKEN_VALID: tokenStatus,
        ACCOUNT_SYNCED: isSynced,
        PUBLISHING_AVAILABLE: isPublishingAvailable,
        LIVE_API_VERIFIED: capability.REAL_API_VERIFIED,
        LIVE_ACCOUNT_TESTED: hasLiveSuccess,
        oauthStatus: isConfigured ? "PASS" : "FAIL",
        approvalStatus: capability.APPROVAL_REQUIRED
          ? capability.PUBLISHING_APPROVED
            ? "APPROVED"
            : "REQUIRED"
          : "NOT_REQUIRED",
        mediaStatus: capability.MEDIA_UPLOAD_SUPPORTED ? "READY" : "BLOCKED",
        accountCount: matchingAccounts.length,
        lastApiCheck,
        lastError,
        notes: capability.unsupportedMessage || capability.notes,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to retrieve API health matrix" },
      { status: 500 }
    );
  }
}
