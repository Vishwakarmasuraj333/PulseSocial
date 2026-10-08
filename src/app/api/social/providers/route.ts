import { NextResponse } from "next/server";
import { getAllSocialProviders } from "@/lib/social/registry";
import { PLATFORM_CAPABILITY_MATRIX } from "@/lib/social/types";
import { PLATFORM_CAPABILITIES, getPlatformCapability } from "@/lib/social/capabilities";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export type TruthPublishingStatus =
  | "Ready to publish"
  | "Connected — Publishing approval required"
  | "Connected configuration incomplete"
  | "Reauthorization required";

export async function GET() {
  const session = await getSession();
  const providers = getAllSocialProviders();

  let connectedAccounts: Array<{
    id: string;
    provider: string;
    displayName: string;
    username: string | null;
    profileImageUrl: string | null;
    status: string;
    lastSyncedAt: Date | null;
    token: {
      expiresAt: Date | null;
      updatedAt: Date;
    } | null;
  }> = [];

  if (session?.activeOrgId) {
    connectedAccounts = await prisma.socialAccount.findMany({
      where: { organizationId: session.activeOrgId },
      select: {
        id: true,
        provider: true,
        displayName: true,
        username: true,
        profileImageUrl: true,
        status: true,
        lastSyncedAt: true,
        token: {
          select: {
            expiresAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  const result = providers.map((p) => {
    const isConfigured = Boolean(p.isConfigured);
    const capability =
      PLATFORM_CAPABILITIES[p.platform === "google_business" ? "googlebusiness" : p.platform] ||
      getPlatformCapability(p.platform);

    const matchingAccounts = connectedAccounts.filter(
      (a) =>
        a.provider.toLowerCase() === p.platform.toLowerCase() ||
        (p.platform === "google_business" && a.provider.toLowerCase().includes("google"))
    );

    const primaryAccount = matchingAccounts[0] || null;
    const isConnected = Boolean(primaryAccount);

    let tokenStatus: "VALID" | "EXPIRED" | "MISSING" = "MISSING";
    if (isConnected) {
      if (primaryAccount?.token?.expiresAt && primaryAccount.token.expiresAt < new Date()) {
        tokenStatus = "EXPIRED";
      } else if (primaryAccount?.token) {
        tokenStatus = "VALID";
      }
    }

    const isApprovalRequired =
      capability.APPROVAL_REQUIRED && !capability.PUBLISHING_APPROVED;
    const isBlocked = capability.status === "BLOCKED";

    // Truthful publishing status calculation (Section 3)
    let publishingStatus: TruthPublishingStatus;
    if (!isConfigured) {
      publishingStatus = "Connected configuration incomplete";
    } else if (isConnected && tokenStatus === "EXPIRED") {
      publishingStatus = "Reauthorization required";
    } else if (isApprovalRequired || isBlocked) {
      publishingStatus = "Connected — Publishing approval required";
    } else {
      publishingStatus = "Ready to publish";
    }

    const publishingAvailable = Boolean(
      isConnected &&
      tokenStatus === "VALID" &&
      publishingStatus === "Ready to publish" &&
      capability.canPublish
    );

    const enhancedAccount = primaryAccount
      ? {
          ...primaryAccount,
          publishingStatus,
          publishingAvailable,
          tokenStatus,
          isApprovalRequired,
          isConfigured,
          capabilityNotes: capability.unsupportedMessage || capability.notes,
        }
      : null;

    return {
      ...p,
      isConfigured,
      capabilities: PLATFORM_CAPABILITY_MATRIX[p.platform],
      platformCapability: capability,
      isConnected,
      tokenStatus,
      publishingStatus,
      publishingAvailable,
      isApprovalRequired,
      connectedAccount: enhancedAccount,
      connectedAccounts: matchingAccounts.map((acc) => ({
        ...acc,
        publishingStatus,
        publishingAvailable,
        tokenStatus,
        isApprovalRequired,
        isConfigured,
      })),
    };
  });

  return NextResponse.json({
    providers: result,
  });
}
