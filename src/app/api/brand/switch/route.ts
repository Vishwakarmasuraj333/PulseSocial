import { NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const brandId = body.brandId || body.organizationId;

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }

    // Check organization exists
    const org = await prisma.organization.findUnique({
      where: { id: brandId },
    });

    if (!org) {
      return NextResponse.json({ error: "Brand workspace not found" }, { status: 404 });
    }

    // Check membership
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: session.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied. You are not a member of this workspace." },
        { status: 403 }
      );
    }

    // Update session cookie with new activeOrgId
    await createSession({
      ...session,
      activeOrgId: org.id,
      role: membership.role,
    });

    try {
      await logAudit({
        organizationId: org.id,
        userId: session.id,
        action: "WORKSPACE_SWITCHED",
        resourceType: "ORGANIZATION",
        resourceId: org.id,
        details: { orgName: org.name, slug: org.slug },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Switched active workspace to "${org.name}"`,
      activeBrand: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        timezone: org.timezone,
        logoUrl: org.logoUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to switch workspace" },
      { status: 500 }
    );
  }
}
