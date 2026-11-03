import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK_PLANS = [
  {
    id: "plan-starter",
    name: "Starter",
    slug: "starter",
    desc: "Ideal for independent creators and emerging influencers building audience momentum.",
    priceMonthly: "$19",
    priceAnnual: "$15",
    features: [
      "Up to 5 Social Accounts",
      "Unlimited Scheduled Posts",
      "Standard AI Copy Generator",
      "Basic Analytics & Reach Metrics",
      "Unified Comment Inbox",
    ],
    limits: { accounts: 5, postsPerDay: 50 },
    highlight: false,
    badge: null,
    ctaLabel: "Get Started",
    ctaHref: "/signup?plan=starter",
  },
  {
    id: "plan-pro",
    name: "Professional",
    slug: "professional",
    desc: "Engineered for scaling creators, fast-growing brands, and dynamic marketing teams.",
    priceMonthly: "$49",
    priceAnnual: "$39",
    features: [
      "Up to 15 Connected Accounts",
      "Gemini 2.5 Flash AI Assistant",
      "Multi-Channel Simultaneous Broadcast",
      "Advanced Analytics & PDF Reports",
      "Team Approvals & Roles",
      "Unified Direct Messages & Chat",
    ],
    limits: { accounts: 15, postsPerDay: 200 },
    highlight: true,
    badge: "Most Popular",
    ctaLabel: "Get Started with Pro",
    ctaHref: "/signup?plan=professional",
  },
  {
    id: "plan-agency",
    name: "Agency & Enterprise",
    slug: "agency",
    desc: "For digital agencies and multi-brand corporate teams managing enterprise scale.",
    priceMonthly: "$99",
    priceAnnual: "$79",
    features: [
      "Unlimited Social Channels & Brands",
      "Dedicated IP & Custom Webhooks",
      "Audit Logging & SSO Security",
      "AI Prompt Enhancer & Auto-Publish",
      "White-label Reports & Client Portals",
      "24/7 Priority Support & SLA",
    ],
    limits: { accounts: 100, postsPerDay: 1000 },
    highlight: false,
    badge: "Agency Choice",
    ctaLabel: "Start Agency Plan",
    ctaHref: "/signup?plan=agency",
  },
];

export async function GET() {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: "asc" },
    });

    if (!plans || plans.length === 0) {
      return NextResponse.json(
        { success: true, plans: FALLBACK_PLANS },
        { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
      );
    }

    const mapped = plans.map((p) => {
      let features: string[] = [];
      try {
        features = JSON.parse(p.featuresJson);
      } catch {
        features = [];
      }

      let limits: any = {};
      try {
        if (p.limitsJson) limits = JSON.parse(p.limitsJson);
      } catch {
        limits = {};
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        desc: p.description,
        priceMonthly: `$${p.priceMonthly}`,
        priceAnnual: `$${p.priceAnnual}`,
        features,
        limits,
        highlight: p.isPopular,
        badge: p.isPopular ? "Most Popular" : null,
        ctaLabel: p.isPopular ? "Get Started with Pro" : p.slug === "agency" ? "Start Agency Plan" : "Get Started",
        ctaHref: `/signup?plan=${p.slug}`,
      };
    });

    return NextResponse.json(
      { success: true, plans: mapped },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (_error: any) {
    // Graceful offline fallback
    return NextResponse.json(
      { success: true, plans: FALLBACK_PLANS, offline: true },
      { headers: { "Cache-Control": "public, s-maxage=60" } }
    );
  }
}
