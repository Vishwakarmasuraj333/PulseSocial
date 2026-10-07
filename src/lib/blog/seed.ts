import { PrismaClient } from "@prisma/client";

export const DEFAULT_CATEGORIES = [
  { name: "Social Media", slug: "social-media", description: "Trends and platform strategies" },
  { name: "Content Strategy", slug: "content-strategy", description: "Planning and scheduling excellence" },
  { name: "Marketing", slug: "marketing", description: "Audience acquisition and branding" },
  { name: "Publishing", slug: "publishing", description: "Multi-platform publishing best practices" },
  { name: "Analytics", slug: "analytics", description: "Interpreting reach and engagement data" },
  { name: "Product Updates", slug: "product-updates", description: "New features in PulseSocial" },
  { name: "Guides", slug: "guides", description: "Step-by-step walkthroughs" },
];

export const DEFAULT_BLOG_POSTS = [
  {
    title: "The 2026 Social Architecture: Why Direct OAuth 2.0 Matters",
    slug: "2026-social-architecture-oauth-matters",
    excerpt: "Why modern marketing teams must abandon fragile scraper extensions and embrace hardware-grade OAuth tokens.",
    content: `Managing multiple social accounts in 2026 demands zero compromise on security. Legacy tools frequently relied on browser extension sessions or requested direct passwords, exposing teams to account locks and compliance audits.

With PulseSocial's official API architecture, your tokens are encrypted with AES-256-GCM and refreshed through cryptographically verified server-side flows. This ensures uninterrupted scheduled publishing across Facebook, Instagram, LinkedIn, and X without ever compromising account ownership.`,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    authorName: "Sarah Chen",
    readingTime: "5 min read",
    tags: "OAuth, Security, Architecture",
    isFeatured: true,
    categorySlug: "social-media",
  },
  {
    title: "Mastering the 7-Step Content Pipeline for High Organic Reach",
    slug: "mastering-7-step-content-pipeline",
    excerpt: "How unified planning, cross-platform adaptation, and intelligent scheduling eliminate content fatigue.",
    content: `Publishing great content isn't just about drafting a witty tweet. It starts with strategic campaign themes, platform-tailored media dimensions, and timezone-optimized queues.

By organizing your schedule across dedicated monthly and weekly milestones in PulseSocial's Content Calendar, teams achieve up to 3x higher post velocity while cutting preparation time in half.`,
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    authorName: "Marcus Vance",
    readingTime: "4 min read",
    tags: "Content Strategy, Planning, Scheduling",
    isFeatured: false,
    categorySlug: "content-strategy",
  },
  {
    title: "Deciphering Engagement: Why True Reach Beats Vanity Metrics",
    slug: "deciphering-engagement-true-reach",
    excerpt: "Stop obsessing over raw follower tallies. Focus on algorithmic engagement curves and genuine audience signals.",
    content: `Follower counts are often misleading indicators of business impact. In modern social network algorithms, saves, direct replies, and profile click-throughs dictate distribution.

PulseSocial pulls verified telemetry directly from official Graph and Community Management APIs, displaying genuine performance curves so you can double down on what resonates.`,
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    authorName: "Elena Rostova",
    readingTime: "6 min read",
    tags: "Analytics, Growth, Metrics",
    isFeatured: false,
    categorySlug: "analytics",
  },
];

export async function ensureBlogSeeded(prisma: PrismaClient) {
  const p = prisma as any;
  const count = await p.blogPost.count();
  if (count > 0) return;

  // 1. Seed categories
  for (const cat of DEFAULT_CATEGORIES) {
    await p.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 2. Seed posts
  for (const item of DEFAULT_BLOG_POSTS) {
    const cat = await p.category.findUnique({ where: { slug: item.categorySlug } });
    if (cat) {
      await p.blogPost.upsert({
        where: { slug: item.slug },
        update: {},
        create: {
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          content: item.content,
          coverImage: item.coverImage,
          authorName: item.authorName,
          readingTime: item.readingTime,
          tags: item.tags,
          isFeatured: item.isFeatured,
          categoryId: cat.id,
        },
      });
    }
  }
}
