import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "hex"
);

function encryptToken(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return { encrypted, iv: iv.toString("hex"), tag };
}

const PLATFORM_DEFS = [
  {
    provider: "youtube",
    displayName: "Suraj Vishwakarma (Official Channel)",
    username: "surajvishwakarma_yt",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop&crop=faces",
    accountType: "Channel",
    bio: "Official YouTube channel broadcasting tech tutorials, AI workflows, and SaaS build-in-public updates.",
    followers: 24800,
    following: 120,
    posts: 142,
  },
  {
    provider: "facebook",
    displayName: "Pulse Media Global (Official Page)",
    username: "pulsemediaglobal_official",
    avatarUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop&crop=faces",
    accountType: "Business Page",
    bio: "Verified business page for Pulse Media Global. Omnichannel content automation & real-time analytics.",
    followers: 18950,
    following: 430,
    posts: 268,
  },
  {
    provider: "instagram",
    displayName: "Suraj Vishwakarma (@itsurya9930)",
    username: "itsurya9930",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
    accountType: "Professional Account",
    bio: "Creator & Founder | Building high-velocity AI platforms | Mumbai, India 🚀",
    followers: 32400,
    following: 580,
    posts: 312,
  },
  {
    provider: "linkedin",
    displayName: "Suraj Vishwakarma (LinkedIn Profile)",
    username: "suraj-vishwakarma-official",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    accountType: "Company Page & Profile",
    bio: "Software Engineer & Product Architect | Scaling multi-channel marketing automation engines.",
    followers: 15600,
    following: 890,
    posts: 198,
  },
  {
    provider: "x",
    displayName: "Suraj Vishwakarma (@itsurya9930)",
    username: "itsurya9930",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces",
    accountType: "Verified Profile",
    bio: "Building in public with Next.js & Gemini AI. ⚡ PulseSocial founder.",
    followers: 12200,
    following: 610,
    posts: 840,
  },
  {
    provider: "tiktok",
    displayName: "Pulse Creator Desk (@pulsesocial)",
    username: "pulsesocial_hq",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces",
    accountType: "Creator Account",
    bio: "Short-form social strategies, viral hooks, and AI creation workflow tips.",
    followers: 45200,
    following: 215,
    posts: 185,
  },
  {
    provider: "pinterest",
    displayName: "Pulse Visual Studios (Pinterest Business)",
    username: "pulsevisuals",
    avatarUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop&crop=faces",
    accountType: "Business Account",
    bio: "Visual marketing, modern infographics, high-conversion pins, and brand aesthetics.",
    followers: 9800,
    following: 140,
    posts: 540,
  },
  {
    provider: "threads",
    displayName: "Suraj Vishwakarma (@itsurya.threads)",
    username: "itsurya.threads",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
    accountType: "Threads Profile",
    bio: "Micro-thoughts on AI engineering, SaaS growth, and modern developer tooling.",
    followers: 8400,
    following: 320,
    posts: 165,
  },
  {
    provider: "snapchat",
    displayName: "Pulse Studio Spotlight",
    username: "pulsesocial_snap",
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=faces",
    accountType: "Public Profile",
    bio: "Behind-the-scenes engineering and Spotlight video stories.",
    followers: 11200,
    following: 95,
    posts: 89,
  },
  {
    provider: "whatsapp",
    displayName: "Pulse Business Broadcast (Cloud API)",
    username: "pulse_whatsapp_biz",
    avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=faces",
    accountType: "Business Account",
    bio: "Official verified WhatsApp Business channel for customer announcements & team alerts.",
    followers: 6700,
    following: 10,
    posts: 42,
  },
  {
    provider: "reddit",
    displayName: "u/SurajVishwakarma_HQ",
    username: "SurajVishwakarma_HQ",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces",
    accountType: "Reddit Profile",
    bio: "Active contributor across r/webdev, r/SaaS, r/Entrepreneur, and r/ArtificialInteligence.",
    followers: 4300,
    following: 85,
    posts: 210,
  },
  {
    provider: "bluesky",
    displayName: "Suraj Vishwakarma (@suraj.bsky.social)",
    username: "suraj.bsky.social",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces",
    accountType: "Bluesky Account",
    bio: "Decentralized open social on AT Protocol. Building PulseSocial.",
    followers: 5100,
    following: 240,
    posts: 95,
  },
  {
    provider: "telegram",
    displayName: "Pulse Global Announcements Channel",
    username: "pulsesocial_channel",
    avatarUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&h=200&fit=crop&crop=faces",
    accountType: "Broadcast Channel",
    bio: "Real-time platform updates, engineering changelog, and social marketing playbooks.",
    followers: 14200,
    following: 0,
    posts: 124,
  },
  {
    provider: "mastodon",
    displayName: "Suraj Vishwakarma (@suraj@mastodon.social)",
    username: "suraj_mastodon",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    accountType: "Federated Account",
    bio: "Federated microblogging on Mastodon fediverse network.",
    followers: 3800,
    following: 310,
    posts: 78,
  },
  {
    provider: "google_business",
    displayName: "Pulse Media Global (HQ Listing)",
    username: "pulse_media_gmb",
    avatarUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop&crop=faces",
    accountType: "Business Listing",
    bio: "Verified Google Business profile for Pulse Media Global Headquarters.",
    followers: 2900,
    following: 15,
    posts: 64,
  },
];

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
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
      avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocLzH8hLSeIcq2p5DyC7xcRwM16rsBdw4_3wwbCX1OK-XLqpQg=s96-c",
    },
  });

  // 3. Ensure Primary Organizations
  const pulseOrg = await prisma.organization.upsert({
    where: { slug: "pulse-media-global" },
    update: {
      name: "Pulse Media Global",
    },
    create: {
      name: "Pulse Media Global",
      slug: "pulse-media-global",
      timezone: "UTC",
    },
  });

  const surajOrg = await prisma.organization.upsert({
    where: { slug: "itsurya9930-brand-0952" },
    update: {
      name: "Suraj Vishwakarma's Workspace",
    },
    create: {
      name: "Suraj Vishwakarma's Workspace",
      slug: "itsurya9930-brand-0952",
      timezone: "Asia/Kolkata",
    },
  });

  const orgs = [pulseOrg, surajOrg];
  const users = [adminUser, surajUser];

  // 4. Ensure Organization Memberships
  for (const u of users) {
    for (const org of orgs) {
      await prisma.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: org.id,
            userId: u.id,
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

  // 5. Connect all 15 platforms for each organization
  for (const org of orgs) {
    for (const p of PLATFORM_DEFS) {
      const providerAccountId = `${org.slug}_${p.provider}_live`;
      const { encrypted, iv, tag } = encryptToken(`token_${p.provider}_${Date.now()}`);

      const acc = await prisma.socialAccount.upsert({
        where: {
          organizationId_provider_providerAccountId: {
            organizationId: org.id,
            provider: p.provider,
            providerAccountId,
          },
        },
        update: {
          displayName: p.displayName,
          username: p.username,
          profileImageUrl: p.avatarUrl,
          accountType: p.accountType,
          status: "CONNECTED",
          scopes: JSON.stringify(["publish", "read", "analytics", "messages", "comments"]),
          metadata: JSON.stringify({ verified: true, isOfficial: true }),
          lastSyncedAt: new Date(),
        },
        create: {
          organizationId: org.id,
          provider: p.provider,
          providerAccountId,
          displayName: p.displayName,
          username: p.username,
          profileImageUrl: p.avatarUrl,
          accountType: p.accountType,
          status: "CONNECTED",
          scopes: JSON.stringify(["publish", "read", "analytics", "messages", "comments"]),
          metadata: JSON.stringify({ verified: true, isOfficial: true }),
          connectedAt: new Date(),
          lastSyncedAt: new Date(),
        },
      });

      await prisma.socialProfile.upsert({
        where: { socialAccountId: acc.id },
        update: {
          bio: p.bio,
          followersCount: p.followers,
          followingCount: p.following,
          postsCount: p.posts,
        },
        create: {
          socialAccountId: acc.id,
          bio: p.bio,
          followersCount: p.followers,
          followingCount: p.following,
          postsCount: p.posts,
        },
      });

      await prisma.socialToken.upsert({
        where: { socialAccountId: acc.id },
        update: {
          encryptedAccessToken: encrypted,
          iv,
          tag,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
        create: {
          socialAccountId: acc.id,
          encryptedAccessToken: encrypted,
          iv,
          tag,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // 6. Pricing Plans
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

  console.log("Database seeded successfully with all dynamic platforms, users, and pricing!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
