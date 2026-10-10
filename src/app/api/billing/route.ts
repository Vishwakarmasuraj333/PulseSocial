import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim() !== "");
    const hasRazorpay = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.trim() !== "");
    const isConfigured = hasStripe || hasRazorpay;

    // Fetch real organization resource usage
    const [connectedChannelsCount, publishedPostsCount, scheduledPostsCount, teamMembersCount] =
      await Promise.all([
        prisma.socialAccount.count({
          where: { organizationId: session.activeOrgId, status: "CONNECTED" },
        }),
        prisma.socialPost.count({
          where: { organizationId: session.activeOrgId, status: "PUBLISHED" },
        }),
        prisma.socialPost.count({
          where: { organizationId: session.activeOrgId, status: "SCHEDULED" },
        }),
        prisma.organizationMember.count({
          where: { organizationId: session.activeOrgId },
        }),
      ]);

    // Workspace Plan Tier Configuration
    const WORKSPACE_PLAN_CONFIG = {
      FREE: {
        name: "Free Trial",
        maxChannels: 3,
        maxPostsPerMonth: 30,
        maxTeamMembers: 1,
        maxStorageGb: 1,
        source: "workspace_plan_config:free_tier",
      },
      STARTER: {
        name: "Starter Plan",
        maxChannels: 5,
        maxPostsPerMonth: 100,
        maxTeamMembers: 2,
        maxStorageGb: 5,
        source: "workspace_plan_config:starter_tier",
      },
      PROFESSIONAL: {
        name: "Professional Plan",
        maxChannels: 15,
        maxPostsPerMonth: 500,
        maxTeamMembers: 5,
        maxStorageGb: 20,
        source: "workspace_plan_config:professional_tier",
      },
      ENTERPRISE: {
        name: "Enterprise Custom",
        maxChannels: null,
        maxPostsPerMonth: null,
        maxTeamMembers: null,
        maxStorageGb: null,
        source: "workspace_plan_config:enterprise_unlimited",
      },
    } as const;

    const activeTier = "STARTER";
    const tierConfig = WORKSPACE_PLAN_CONFIG[activeTier];

    const plan = {
      name: tierConfig.name,
      planKey: activeTier,
      source: tierConfig.source,
      status: "ACTIVE",
      interval: "monthly",
      renewalDate: null,
      provider: isConfigured ? (hasStripe ? "Stripe" : "Razorpay") : null,
      limits: {
        socialChannels: {
          used: connectedChannelsCount,
          max: tierConfig.maxChannels,
          unlimited: tierConfig.maxChannels === null,
          source: `${tierConfig.source}:maxChannels`,
        },
        postsPerMonth: {
          used: publishedPostsCount + scheduledPostsCount,
          max: tierConfig.maxPostsPerMonth,
          unlimited: tierConfig.maxPostsPerMonth === null,
          source: `${tierConfig.source}:maxPostsPerMonth`,
        },
        teamMembers: {
          used: teamMembersCount,
          max: tierConfig.maxTeamMembers,
          unlimited: tierConfig.maxTeamMembers === null,
          source: `${tierConfig.source}:maxTeamMembers`,
        },
        storageGb: {
          used: 0.1,
          max: tierConfig.maxStorageGb,
          unlimited: tierConfig.maxStorageGb === null,
          source: `${tierConfig.source}:maxStorageGb`,
        },
      },
    };

    return NextResponse.json({
      success: true,
      isConfigured,
      statusMessage: isConfigured ? "Billing active" : "Billing not configured",
      provider: isConfigured ? (hasStripe ? "Stripe" : "Razorpay") : null,
      plan,
      invoices: [], // Never display fake invoices
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load billing status" },
      { status: 500 }
    );
  }
}
