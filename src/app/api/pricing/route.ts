import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: "asc" },
    });

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
      };
    });

    return NextResponse.json({ success: true, plans: mapped });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch pricing plans" },
      { status: 500 }
    );
  }
}
