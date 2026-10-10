import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.activeOrgId },
      include: {
        _count: {
          select: {
            members: true,
            socialAccounts: true,
            posts: true,
          },
        },
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const orgAny = org as any;
    return NextResponse.json({
      brand: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        avatarUrl: org.logoUrl || "",
        logoUrl: org.logoUrl,
        coverUrl: orgAny.coverUrl || "",
        timezone: org.timezone || "Asia/Kolkata",
        description: orgAny.description || "",
        createdAt: org.createdAt,
        membersCount: org._count.members,
        channelsCount: org._count.socialAccounts,
        postsCount: org._count.posts,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, industry, website, color, timezone } = body;

    const trimmedName = (name || "").trim();
    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { error: "Brand name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    const baseSlug = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    let newOrg: any = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const nonce = crypto.randomBytes(4).toString("hex");
      const candidateSlug = `${baseSlug}-${nonce}`;
      try {
        newOrg = await prisma.organization.create({
          data: {
            name: trimmedName,
            slug: candidateSlug,
            timezone: timezone || "Asia/Kolkata",
            description: industry ? `Industry: ${industry}` : undefined,
          } as any,
        });
        break;
      } catch (err: any) {
        if (err?.code === "P2002" && attempt < 4) {
          continue; // Unique constraint collision retry
        }
        throw err;
      }
    }

    if (!newOrg) throw new Error("Failed to generate unique organization slug");

    // Add user as OWNER
    await prisma.organizationMember.create({
      data: {
        organizationId: newOrg.id,
        userId: session.id,
        role: "OWNER",
        channelsAccess: "ALL",
        isApprover: true,
      },
    });

    // Update active session cookie so the new brand becomes the active workspace
    const { createSession } = await import("@/lib/auth/session");
    await createSession({
      ...session,
      activeOrgId: newOrg.id,
    });

    try {
      await logAudit({
        organizationId: newOrg.id,
        userId: session.id,
        action: "ORGANIZATION_CREATED",
        resourceType: "ORGANIZATION",
        resourceId: newOrg.id,
        details: { name: newOrg.name, slug: newOrg.slug, website, color },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      brand: {
        id: newOrg.id,
        name: newOrg.name,
        slug: newOrg.slug,
        timezone: newOrg.timezone,
        avatarUrl: newOrg.logoUrl || "",
        logoUrl: newOrg.logoUrl,
        coverUrl: newOrg.coverUrl || "",
        description: newOrg.description || "",
        createdAt: newOrg.createdAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create brand" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId || !session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: only OWNER or ADMIN can update brand settings
    const callerMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: session.activeOrgId,
          userId: session.id,
        },
      },
    });

    if (!callerMember || !["OWNER", "ADMIN"].includes(callerMember.role.toUpperCase())) {
      return NextResponse.json(
        { error: "Forbidden: Only organization Owners and Admins can update brand settings." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, logoUrl, coverUrl, timezone, description } = body;

    const dataToUpdate: Record<string, any> = {};

    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed || trimmed.length < 2) {
        return NextResponse.json(
          { error: "Brand name must be at least 2 characters long." },
          { status: 400 }
        );
      }
      dataToUpdate.name = trimmed;
    }

    if (logoUrl !== undefined) {
      dataToUpdate.logoUrl = logoUrl;
    }

    if (coverUrl !== undefined) {
      dataToUpdate.coverUrl = coverUrl;
    }

    if (timezone !== undefined) {
      dataToUpdate.timezone = timezone;
    }

    if (description !== undefined) {
      dataToUpdate.description = description;
    }

    const updated: any = await prisma.organization.update({
      where: { id: session.activeOrgId },
      data: dataToUpdate,
    });

    // Record audit log
    try {
      await logAudit({
        organizationId: session.activeOrgId,
        userId: session.id,
        action: "ORGANIZATION_UPDATED",
        resourceType: "ORGANIZATION",
        resourceId: session.activeOrgId,
        details: {
          updatedFields: Object.keys(dataToUpdate),
        },
      });
    } catch {}

    const updatedAny = updated as any;
    return NextResponse.json({
      success: true,
      message: "Brand information updated successfully.",
      brand: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        avatarUrl: updated.logoUrl,
        logoUrl: updated.logoUrl,
        coverUrl: updatedAny.coverUrl || "",
        timezone: updated.timezone,
        description: updatedAny.description || "",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update brand" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { confirmName } = body;

    const org = await prisma.organization.findUnique({
      where: { id: session.activeOrgId },
    });

    if (!org) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check member role first: strictly Workspace Owner only
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: session.activeOrgId,
          userId: session.id,
        },
      },
    });

    if (!member || member.role.toUpperCase() !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden: Only the workspace Owner can delete this brand." },
        { status: 403 }
      );
    }

    // Safety verification: confirm name must match
    if (confirmName?.trim().toLowerCase() !== org.name.trim().toLowerCase()) {
      return NextResponse.json(
        { error: "Confirmation name does not match the brand name." },
        { status: 400 }
      );
    }

    // Write audit event before deleting
    try {
      await logAudit({
        organizationId: org.id,
        userId: session.id,
        action: "ORGANIZATION_DELETED",
        resourceType: "ORGANIZATION",
        resourceId: org.id,
        details: { name: org.name, slug: org.slug },
      });
    } catch {}

    // Delete organization cascading relations
    await prisma.organization.delete({
      where: { id: session.activeOrgId },
    });

    return NextResponse.json({
      success: true,
      message: `Brand "${org.name}" has been permanently deleted.`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete brand" },
      { status: 500 }
    );
  }
}
