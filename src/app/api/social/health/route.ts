import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PLATFORM_CAPABILITIES, PlatformIntegrationStatus } from "@/lib/social/capabilities";
import { getSocialProvider } from "@/lib/social/registry";
import { SupportedPlatform } from "@/lib/social/types";

export interface PlatformHealthReport {
  platform: string;
  displayName: string;
  apiVersion: string;
  status: PlatformIntegrationStatus;
  oauthStatus: "PASS" | "FAIL";
  tokenStatus: "VALID" | "EXPIRED" | "NOT_CONNECTED";
  accountSyncStatus: "PASS" | "FAIL" | "NOT_SYNCED";
  publishingStatus: "READY" | "BLOCKED" | "APPROVAL_REQUIRED";
  approvalStatus: "APPROVED" | "REQUIRED" | "NOT_REQUIRED";
  mediaStatus: "READY" | "BLOCKED";
  isConnected: boolean;
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

    // Fetch recent publishing attempts to identify real last errors (admin safe)
    const recentAttempts = await prisma.publishingAttempt.findMany({
      where: {
        post: { organizationId: orgId },
      },
      orderBy: { attemptedAt: "desc" },
      take: 50,
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

      // OAuth status: PASS if environment credentials exist, FAIL otherwise
      const oauthStatus: "PASS" | "FAIL" = isConfigured ? "PASS" : "FAIL";

      // Token status: VALID, EXPIRED, or NOT_CONNECTED
      let tokenStatus: "VALID" | "EXPIRED" | "NOT_CONNECTED" = "NOT_CONNECTED";
      if (isConnected) {
        if (primaryAccount.token?.expiresAt && primaryAccount.token.expiresAt < new Date()) {
          tokenStatus = "EXPIRED";
        } else {
          tokenStatus = "VALID";
        }
      }

      // Account Sync status
      const accountSyncStatus: "PASS" | "FAIL" | "NOT_SYNCED" = isConnected
        ? primaryAccount.lastSyncedAt
          ? "PASS"
          : "FAIL"
        : "NOT_SYNCED";

      // Approval requirement status
      const approvalStatus: "APPROVED" | "REQUIRED" | "NOT_REQUIRED" = capability.APPROVAL_REQUIRED
        ? capability.PUBLISHING_APPROVED
          ? "APPROVED"
          : "REQUIRED"
        : "NOT_REQUIRED";

      // Publishing readiness
      let publishingStatus: "READY" | "BLOCKED" | "APPROVAL_REQUIRED" = "READY";
      if (capability.status === "BLOCKED" || !capability.canPublish) {
        publishingStatus = "BLOCKED";
      } else if (capability.APPROVAL_REQUIRED && !capability.PUBLISHING_APPROVED) {
        publishingStatus = "APPROVAL_REQUIRED";
      }

      // Media status
      const mediaStatus: "READY" | "BLOCKED" = capability.MEDIA_UPLOAD_SUPPORTED ? "READY" : "BLOCKED";

      // Last error from attempts (admin safe, zero secrets)
      const lastAttempt = recentAttempts.find(
        (a) => a.provider.toLowerCase() === p.toLowerCase()
      );
      const lastError =
        lastAttempt && lastAttempt.status === "FAILED"
          ? lastAttempt.errorMessage
          : null;

      // Last checked at
      const lastApiCheck = primaryAccount?.lastSyncedAt
        ? primaryAccount.lastSyncedAt.toISOString()
        : primaryAccount?.token?.updatedAt
        ? primaryAccount.token.updatedAt.toISOString()
        : null;

      // Final status according to Section 27 classification
      let currentStatus: PlatformIntegrationStatus = capability.status;
      if (!isConfigured) {
        currentStatus = "CONFIGURATION REQUIRED";
      } else if (isConnected && tokenStatus === "EXPIRED") {
        currentStatus = "REAUTH REQUIRED";
      } else if (p === "snapchat") {
        currentStatus = "BLOCKED";
      } else if (capability.APPROVAL_REQUIRED && !capability.PUBLISHING_APPROVED) {
        currentStatus = "APPROVAL REQUIRED";
      } else if (isConnected) {
        currentStatus = "REAL API CONNECTED";
      }

      health.push({
        platform: p,
        displayName: capability.displayName,
        apiVersion: capability.apiVersion,
        status: currentStatus,
        oauthStatus,
        tokenStatus,
        accountSyncStatus,
        publishingStatus,
        approvalStatus,
        mediaStatus,
        isConnected,
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
