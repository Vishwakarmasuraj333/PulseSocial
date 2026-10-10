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

    // Fetch members
    const orgMembers = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Fetch pending invitations
    const pendingInvites = await prisma.teamInvitation.findMany({
      where: { organizationId: orgId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    const activeMembers = orgMembers.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name || m.user.email.split("@")[0],
      email: m.user.email,
      role: m.role,
      channelsAccess: m.channelsAccess,
      isApprover: m.isApprover,
      avatar: m.user.avatarUrl || "",
      initial: (m.user.name || m.user.email || "U").charAt(0).toUpperCase(),
      status: "Active",
      isPending: false,
      joinedAt: new Date(m.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    const inviteMembers = pendingInvites.map((inv) => ({
      id: inv.id,
      userId: null,
      name: inv.email.split("@")[0],
      email: inv.email,
      role: inv.role,
      channelsAccess: inv.channelsAccess,
      isApprover: inv.isApprover,
      avatar: "",
      initial: inv.email.charAt(0).toUpperCase(),
      status: "Pending Invite",
      isPending: true,
      joinedAt: `Invited ${new Date(inv.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`,
    }));

    return NextResponse.json({
      success: true,
      members: [...activeMembers, ...inviteMembers],
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch members" },
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

    // RBAC: caller must be OWNER or ADMIN
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
        { error: "Forbidden: Only organization Owners and Admins can update team members." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { memberId, role, channelsAccess, isApprover } = body;

    if (!memberId || !role) {
      return NextResponse.json(
        { error: "Member ID and role are required" },
        { status: 400 }
      );
    }

    // Try finding OrganizationMember
    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId: session.activeOrgId },
      include: { user: true },
    });

    if (member) {
      const updated = await prisma.organizationMember.update({
        where: { id: member.id },
        data: {
          role,
          ...(channelsAccess ? { channelsAccess } : {}),
          ...(typeof isApprover === "boolean" ? { isApprover } : {}),
        },
      });

      try {
        await logAudit({
          organizationId: session.activeOrgId,
          userId: session.id,
          action: "MEMBER_ROLE_UPDATED",
          resourceType: "OrganizationMember",
          resourceId: member.id,
          details: { email: member.user.email, newRole: role },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: `Role updated to ${role}.`,
        member: updated,
      });
    }

    // Try finding pending invitation
    const invite = await prisma.teamInvitation.findFirst({
      where: { id: memberId, organizationId: session.activeOrgId },
    });

    if (invite) {
      const updated = await prisma.teamInvitation.update({
        where: { id: invite.id },
        data: { role },
      });

      return NextResponse.json({
        success: true,
        message: `Invitation role updated to ${role}.`,
        invitation: updated,
      });
    }

    return NextResponse.json({ error: "Member or invitation not found" }, { status: 404 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to update member" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId || !session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: caller must be OWNER or ADMIN
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
        { error: "Forbidden: Only organization Owners and Admins can remove team members." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("id");

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    // Check if it's an OrganizationMember
    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId: session.activeOrgId },
      include: { user: true },
    });

    if (member) {
      // Prevent deleting the owner if only one owner
      if (member.role === "OWNER" || member.userId === session.id) {
        return NextResponse.json(
          { error: "Cannot remove the primary brand owner." },
          { status: 400 }
        );
      }

      await prisma.organizationMember.delete({
        where: { id: member.id },
      });

      try {
        await logAudit({
          organizationId: session.activeOrgId,
          userId: session.id,
          action: "MEMBER_REMOVED",
          resourceType: "OrganizationMember",
          resourceId: member.id,
          details: { email: member.user.email },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: `${member.user.name || member.user.email} was removed from the brand.`,
      });
    }

    // Check if it's a pending invitation
    const invite = await prisma.teamInvitation.findFirst({
      where: { id: memberId, organizationId: session.activeOrgId },
    });

    if (invite) {
      await prisma.teamInvitation.delete({
        where: { id: invite.id },
      });

      return NextResponse.json({
        success: true,
        message: `Invitation for ${invite.email} has been revoked.`,
      });
    }

    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to remove member" },
      { status: 500 }
    );
  }
}
