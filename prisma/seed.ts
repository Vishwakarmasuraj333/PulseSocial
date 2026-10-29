import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PulseSocial production foundation...");

  // 1. Ensure Admin User
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@pulsesocial.io" },
    update: {
      name: "Pulse Admin",
      emailVerified: true,
      status: "ACTIVE",
    },
    create: {
      email: "admin@pulsesocial.io",
      name: "Pulse Admin",
      passwordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
      avatarUrl: "/icons/pulse-logo.svg",
    },
  });

  // 2. Ensure Suraj Vishwakarma User
  const surajUser = await prisma.user.upsert({
    where: { email: "itsurya9930@gmail.com" },
    update: {
      name: "Suraj Vishwakarma",
      emailVerified: true,
      status: "ACTIVE",
    },
    create: {
      email: "itsurya9930@gmail.com",
      name: "Suraj Vishwakarma",
      passwordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    },
  });

  // 3. Ensure Default Organizations
  const pulseOrg = await prisma.organization.upsert({
    where: { slug: "pulse-media-global" },
    update: {
      name: "Pulse Media Global",
      timezone: "UTC",
    },
    create: {
      name: "Pulse Media Global",
      slug: "pulse-media-global",
      timezone: "UTC",
    },
  });

  const surajOrg = await prisma.organization.upsert({
    where: { slug: "suraj-workspace" },
    update: {
      name: "Suraj Vishwakarma's Workspace",
      timezone: "Asia/Kolkata",
    },
    create: {
      name: "Suraj Vishwakarma's Workspace",
      slug: "suraj-workspace",
      timezone: "Asia/Kolkata",
    },
  });

  const orgs = [pulseOrg, surajOrg];
  const users = [adminUser, surajUser];

  // 4. Ensure Memberships and Settings
  for (const org of orgs) {
    await prisma.settings.upsert({
      where: { organizationId: org.id },
      update: {},
      create: {
        organizationId: org.id,
        defaultTimezone: org.timezone || "UTC",
        requireApproval: false,
        aiAutoSuggest: true,
        notificationsEmail: true,
      },
    });

    for (const u of users) {
      await prisma.organizationMember.upsert({
        where: {
          userId_organizationId: {
            userId: u.id,
            organizationId: org.id,
          },
        },
        update: {
          role: "OWNER",
          channelsAccess: "ALL",
          isApprover: true,
        },
        create: {
          organizationId: org.id,
          userId: u.id,
          role: "OWNER",
          channelsAccess: "ALL",
          isApprover: true,
        },
      });
    }
  }

  // NOTE: Real social accounts must be connected via official OAuth in the app.
  // We strictly DO NOT seed fake/mock connected accounts.

  // 5. Pricing Plans
  const PLANS = [
    {
      slug: "starter",
      name: "Starter",
      description: "Ideal for independent creators and emerging influencers building audience momentum.",
      priceMonthly: 19,
      priceAnnual: 15,
      featuresJson: JSON.stringify([
        "Up to 5 Social Accounts",
        "Unlimited Scheduled Posts",
        "Standard AI Copy Generator",
        "Basic Analytics & Reach Metrics",
        "Unified Comment Inbox",
      ]),
      limitsJson: JSON.stringify({ accounts: 5, members: 1, storageMB: 5000 }),
      isPopular: false,
      isActive: true,
    },
    {
      slug: "professional",
      name: "Professional",
      description: "Engineered for scaling creators, fast-growing brands, and dynamic marketing teams.",
      priceMonthly: 49,
      priceAnnual: 39,
      featuresJson: JSON.stringify([
        "Up to 15 Connected Accounts",
        "Gemini 2.5 Flash AI Assistant",
        "Multi-Channel Simultaneous Broadcast",
        "Advanced Analytics & PDF Reports",
        "Team Approvals & Roles",
        "Unified Direct Messages & Chat",
      ]),
      limitsJson: JSON.stringify({ accounts: 15, members: 5, storageMB: 25000 }),
      isPopular: true,
      isActive: true,
    },
    {
      slug: "agency",
      name: "Agency & Enterprise",
      description: "For digital agencies and multi-brand corporate teams managing enterprise scale.",
      priceMonthly: 99,
      priceAnnual: 79,
      featuresJson: JSON.stringify([
        "Unlimited Social Channels & Brands",
        "Dedicated IP & Custom Webhooks",
        "Audit Logging & SSO Security",
        "AI Prompt Enhancer & Auto-Publish",
        "White-label Reports & Client Portals",
        "24/7 Priority Support & SLA",
      ]),
      limitsJson: JSON.stringify({ accounts: 999, members: 25, storageMB: 100000 }),
      isPopular: false,
      isActive: true,
    },
  ];

  for (const pl of PLANS) {
    await prisma.pricingPlan.upsert({
      where: { slug: pl.slug },
      update: pl,
      create: pl,
    });
  }

  console.log("Database seeded successfully with authentic users, workspaces, and pricing plans!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
