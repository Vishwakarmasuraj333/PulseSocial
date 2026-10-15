import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth/admin-guard";

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    // Get primary organization settings or defaults
    const firstOrg = await prisma.organization.findFirst({
      include: { settings: true },
    });

    const settings = {
      platformName: "PulseSocial",
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true,
      defaultTimezone: firstOrg?.settings?.defaultTimezone || "UTC",
      requireApproval: firstOrg?.settings?.requireApproval ?? false,
      aiAutoSuggest: firstOrg?.settings?.aiAutoSuggest ?? true,
      notificationsEmail: firstOrg?.settings?.notificationsEmail ?? true,
      brandColor: firstOrg?.settings?.brandColor || "#6F52B5",
      databaseProvider: "PostgreSQL (Supabase)",
      geminiAiModel: "gemini-1.5-flash",
      maxMediaUploadMb: 25,
      sessionTimeoutMinutes: 1440, // 24 hours
    };

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("[ADMIN_SETTINGS_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve settings.", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();
    const { defaultTimezone, requireApproval, aiAutoSuggest, notificationsEmail, brandColor } = body;

    const firstOrg = await prisma.organization.findFirst();

    if (firstOrg) {
      await prisma.settings.upsert({
        where: { organizationId: firstOrg.id },
        update: {
          ...(defaultTimezone ? { defaultTimezone } : {}),
          ...(typeof requireApproval === "boolean" ? { requireApproval } : {}),
          ...(typeof aiAutoSuggest === "boolean" ? { aiAutoSuggest } : {}),
          ...(typeof notificationsEmail === "boolean" ? { notificationsEmail } : {}),
          ...(brandColor ? { brandColor } : {}),
        },
        create: {
          organizationId: firstOrg.id,
          defaultTimezone: defaultTimezone || "UTC",
          requireApproval: !!requireApproval,
          aiAutoSuggest: aiAutoSuggest ?? true,
          notificationsEmail: notificationsEmail ?? true,
          brandColor: brandColor || "#6F52B5",
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: auth.session?.id,
          action: "ADMIN_SETTINGS_UPDATED",
          resourceType: "Settings",
          resourceId: firstOrg.id,
          details: JSON.stringify(body),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Platform settings updated successfully.",
    });
  } catch (error: any) {
    console.error("[ADMIN_SETTINGS_PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update settings.", details: error.message },
      { status: 500 }
    );
  }
}
