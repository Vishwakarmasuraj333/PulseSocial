import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = session.activeOrgId;

    // Fetch or create Settings record
    let settings = await prisma.settings.findUnique({
      where: { organizationId: orgId },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          organizationId: orgId,
          defaultTimezone: "Asia/Kolkata",
          requireApproval: false,
          aiAutoSuggest: true,
          notificationsEmail: true,
          brandColor: "#1877F2",
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = session.activeOrgId;
    const body = await req.json();
    const {
      defaultTimezone,
      requireApproval,
      aiAutoSuggest,
      notificationsEmail,
      brandColor,
    } = body;

    const dataToUpdate: Record<string, any> = {};
    if (defaultTimezone !== undefined) dataToUpdate.defaultTimezone = defaultTimezone;
    if (requireApproval !== undefined) dataToUpdate.requireApproval = requireApproval;
    if (aiAutoSuggest !== undefined) dataToUpdate.aiAutoSuggest = aiAutoSuggest;
    if (notificationsEmail !== undefined) dataToUpdate.notificationsEmail = notificationsEmail;
    if (brandColor !== undefined) dataToUpdate.brandColor = brandColor;

    const updated = await prisma.settings.upsert({
      where: { organizationId: orgId },
      update: dataToUpdate,
      create: {
        organizationId: orgId,
        defaultTimezone: defaultTimezone || "Asia/Kolkata",
        requireApproval: requireApproval || false,
        aiAutoSuggest: aiAutoSuggest ?? true,
        notificationsEmail: notificationsEmail ?? true,
        brandColor: brandColor || "#1877F2",
      },
    });

    try {
      await logAudit({
        organizationId: orgId,
        userId: session.id,
        action: "SETTINGS_UPDATED",
        resourceType: "Settings",
        resourceId: updated.id,
        details: dataToUpdate,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Settings preferences updated successfully.",
      settings: updated,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
