import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth/admin-guard";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    let plans = await prisma.pricingPlan.findMany({
      orderBy: { priceMonthly: "asc" },
    });

    // If no plans in DB yet, seed initial plans to ensure real editable rows exist
    if (plans.length === 0) {
      const defaultPlans = [
        {
          name: "Starter",
          slug: "starter",
          priceMonthly: 19,
          priceAnnual: 190,
          description: "Essential social media scheduling for creators and solo professionals.",
          featuresJson: JSON.stringify([
            "5 Connected Social Profiles",
            "30 Scheduled Posts per month",
            "Standard Post Publishing",
            "Basic Analytics (30 days history)",
            "Community Support",
          ]),
          limitsJson: JSON.stringify({
            accounts: 5,
            postsPerMonth: 30,
            members: 1,
            aiTokens: 5000,
          }),
          isPopular: false,
          isActive: true,
        },
        {
          name: "Professional",
          slug: "professional",
          priceMonthly: 49,
          priceAnnual: 490,
          description: "Comprehensive management and AI content suite for growing agencies and teams.",
          featuresJson: JSON.stringify([
            "20 Connected Social Profiles",
            "Unlimited Scheduled Posts",
            "Gemini AI Assistant & Studio",
            "Advanced Multi-Platform Analytics",
            "Team Collaboration (Up to 5 seats)",
            "Priority Email & Chat Support",
          ]),
          limitsJson: JSON.stringify({
            accounts: 20,
            postsPerMonth: -1,
            members: 5,
            aiTokens: 50000,
          }),
          isPopular: true,
          isActive: true,
        },
        {
          name: "Enterprise",
          slug: "enterprise",
          priceMonthly: 149,
          priceAnnual: 1490,
          description: "High-volume orchestration, custom integrations, dedicated SLA, and role-based access.",
          featuresJson: JSON.stringify([
            "Unlimited Social Profiles",
            "Unlimited Team Members",
            "Custom Roles & Approval Workflows",
            "Dedicated Account Manager",
            "99.9% Uptime SLA",
            "Audit Trail & Compliance Logs",
          ]),
          limitsJson: JSON.stringify({
            accounts: -1,
            postsPerMonth: -1,
            members: -1,
            aiTokens: 250000,
          }),
          isPopular: false,
          isActive: true,
        },
      ];

      for (const p of defaultPlans) {
        await prisma.pricingPlan.upsert({
          where: { slug: p.slug },
          update: {},
          create: p,
        });
      }

      plans = await prisma.pricingPlan.findMany({
        orderBy: { priceMonthly: "asc" },
      });
    }

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error("[ADMIN_PLANS_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve pricing plans.", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();
    const { name, slug, priceMonthly, priceAnnual, description, featuresJson, limitsJson, isPopular } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
    }

    const plan = await prisma.pricingPlan.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        priceMonthly: parseInt(priceMonthly || "0", 10),
        priceAnnual: parseInt(priceAnnual || "0", 10),
        description: description || "",
        featuresJson: typeof featuresJson === "string" ? featuresJson : JSON.stringify(featuresJson || []),
        limitsJson: typeof limitsJson === "string" ? limitsJson : JSON.stringify(limitsJson || {}),
        isPopular: !!isPopular,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.session?.id,
        action: "ADMIN_PLAN_CREATED",
        resourceType: "PricingPlan",
        resourceId: plan.id,
        details: JSON.stringify({ name: plan.name, slug: plan.slug }),
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("[ADMIN_PLAN_POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create pricing plan.", details: error.message },
      { status: 500 }
    );
  }
}
