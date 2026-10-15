import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth/admin-guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Organization ID is required." }, { status: 400 });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                status: true,
              },
            },
          },
        },
        socialAccounts: {
          select: {
            id: true,
            provider: true,
            displayName: true,
            username: true,
            status: true,
            connectedAt: true,
            lastSyncedAt: true,
            tokenExpiresAt: true,
          },
        },
        settings: true,
        _count: {
          select: {
            posts: true,
            drafts: true,
            publishingQueues: true,
            campaigns: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found." }, { status: 404 });
    }

    return NextResponse.json({ organization });
  } catch (error: any) {
    console.error("[ADMIN_ORG_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve organization.", details: error.message },
      { status: 500 }
    );
  }
}

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
    return NextResponse.json({ error: "Organization ID is required." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, description, timezone } = body;

    const existing = await prisma.organization.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Organization not found." }, { status: 404 });
    }

    const updateData: any = {};
    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }
    if (typeof description === "string") {
      updateData.description = description.trim();
    }
    if (typeof timezone === "string" && timezone.trim()) {
      updateData.timezone = timezone.trim();
    }

    const updated = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.update({
        where: { id },
        data: updateData,
      });

      await tx.auditLog.create({
        data: {
          userId: auth.session?.id,
          organizationId: id,
          action: "ADMIN_ORGANIZATION_UPDATED",
          resourceType: "Organization",
          resourceId: id,
          details: JSON.stringify({ updateData, previousName: existing.name }),
        },
      });

      return org;
    });

    return NextResponse.json({
      success: true,
      organization: updated,
      message: "Organization updated successfully.",
    });
  } catch (error: any) {
    console.error("[ADMIN_ORG_PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update organization.", details: error.message },
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
    return NextResponse.json({ error: "Organization ID is required." }, { status: 400 });
  }

  try {
    const existing = await prisma.organization.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Organization not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          userId: auth.session?.id,
          organizationId: null,
          action: "ADMIN_ORGANIZATION_DELETED",
          resourceType: "Organization",
          resourceId: id,
          details: JSON.stringify({
            deletedName: existing.name,
            deletedSlug: existing.slug,
          }),
        },
      });

      await tx.organization.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Organization "${existing.name}" has been deleted.`,
    });
  } catch (error: any) {
    console.error("[ADMIN_ORG_DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete organization.", details: error.message },
      { status: 500 }
    );
  }
}
