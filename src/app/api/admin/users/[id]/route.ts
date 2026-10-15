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
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
        _count: {
          select: {
            postsCreated: true,
            aiGenerations: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("[ADMIN_USER_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user.", details: error.message },
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
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, name, role, emailVerified } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { memberships: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (typeof status === "string" && ["ACTIVE", "SUSPENDED", "PENDING"].includes(status)) {
      updateData.status = status;
    }
    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }
    if (typeof emailVerified === "boolean") {
      updateData.emailVerified = emailVerified;
      if (emailVerified && !existingUser.emailVerifiedAt) {
        updateData.emailVerifiedAt = new Date();
      }
    }

    // Execute update in transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: updateData,
      });

      // Update role across primary organization membership if provided
      if (typeof role === "string" && ["OWNER", "ADMIN", "MEMBER", "EDITOR", "VIEWER"].includes(role)) {
        if (existingUser.memberships.length > 0) {
          await tx.organizationMember.updateMany({
            where: { userId: id },
            data: { role },
          });
        }
      }

      // Record administrative audit log
      await tx.auditLog.create({
        data: {
          userId: auth.session?.id,
          action: "ADMIN_USER_UPDATED",
          resourceType: "User",
          resourceId: id,
          details: JSON.stringify({
            updatedFields: { status, name, role, emailVerified },
            previousStatus: existingUser.status,
            targetEmail: existingUser.email,
          }),
        },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "User successfully updated.",
    });
  } catch (error: any) {
    console.error("[ADMIN_USER_PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update user.", details: error.message },
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
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  // Prevent admin from deleting their own account via admin panel
  if (auth.session?.id === id) {
    return NextResponse.json(
      { error: "Cannot delete your own active administrator account." },
      { status: 400 }
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Record audit log prior to cascade deletion
      await tx.auditLog.create({
        data: {
          userId: auth.session?.id,
          action: "ADMIN_USER_DELETED",
          resourceType: "User",
          resourceId: id,
          details: JSON.stringify({
            deletedEmail: existingUser.email,
            deletedName: existingUser.name,
          }),
        },
      });

      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `User ${existingUser.email} has been permanently deleted.`,
    });
  } catch (error: any) {
    console.error("[ADMIN_USER_DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete user.", details: error.message },
      { status: 500 }
    );
  }
}
