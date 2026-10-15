import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth/admin-guard";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Plan ID is required." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, priceMonthly, priceAnnual, description, featuresJson, limitsJson, isPopular, isActive } = body;

    const existing = await prisma.pricingPlan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pricing plan not found." }, { status: 404 });
    }

    const updateData: any = {};
    if (typeof name === "string" && name.trim()) updateData.name = name.trim();
    if (priceMonthly !== undefined) updateData.priceMonthly = parseInt(priceMonthly, 10);
    if (priceAnnual !== undefined) updateData.priceAnnual = parseInt(priceAnnual, 10);
    if (description !== undefined) updateData.description = description;
    if (featuresJson !== undefined) {
      updateData.featuresJson = typeof featuresJson === "string" ? featuresJson : JSON.stringify(featuresJson);
    }
    if (limitsJson !== undefined) {
      updateData.limitsJson = typeof limitsJson === "string" ? limitsJson : JSON.stringify(limitsJson);
    }
    if (typeof isPopular === "boolean") updateData.isPopular = isPopular;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    const updated = await prisma.$transaction(async (tx) => {
      const plan = await tx.pricingPlan.update({
        where: { id },
        data: updateData,
      });

      await tx.auditLog.create({
        data: {
          userId: auth.session?.id,
          action: "ADMIN_PLAN_UPDATED",
          resourceType: "PricingPlan",
          resourceId: id,
          details: JSON.stringify({ updateData, planSlug: existing.slug }),
        },
      });

      return plan;
    });

    return NextResponse.json({
      success: true,
      plan: updated,
      message: "Plan updated successfully.",
    });
  } catch (error: any) {
    console.error("[ADMIN_PLAN_PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update pricing plan.", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Plan ID is required." }, { status: 400 });
  }

  try {
    const existing = await prisma.pricingPlan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pricing plan not found." }, { status: 404 });
    }

    // Toggle active state or delete
    const updated = await prisma.pricingPlan.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.session?.id,
        action: "ADMIN_PLAN_DEACTIVATED",
        resourceType: "PricingPlan",
        resourceId: id,
        details: JSON.stringify({ planName: existing.name }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Plan ${existing.name} has been deactivated.`,
      plan: updated,
    });
  } catch (error: any) {
    console.error("[ADMIN_PLAN_DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to deactivate plan.", details: error.message },
      { status: 500 }
    );
  }
}
