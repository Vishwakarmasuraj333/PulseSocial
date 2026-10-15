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
    return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
  }

  try {
    const post = await prisma.socialPost.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: true,
        targets: {
          include: {
            socialAccount: true,
          },
        },
        media: true,
        attempts: {
          orderBy: { attemptedAt: "desc" },
        },
        engagementSnapshots: {
          take: 5,
          orderBy: { lastSyncedAt: "desc" },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error("[ADMIN_POST_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve post.", details: error.message },
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
    return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, scheduledFor } = body;

    const existing = await prisma.socialPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const updateData: any = {};
    if (status && ["DRAFT", "SCHEDULED", "PUBLISHED", "FAILED", "CANCELLED", "QUEUED"].includes(status)) {
      updateData.status = status;
      if (status === "PUBLISHED" && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (scheduledFor) {
      updateData.scheduledFor = new Date(scheduledFor);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.socialPost.update({
        where: { id },
        data: updateData,
      });

      await tx.auditLog.create({
        data: {
          userId: auth.session?.id,
          organizationId: existing.organizationId,
          action: "ADMIN_POST_STATUS_UPDATED",
          resourceType: "SocialPost",
          resourceId: id,
          details: JSON.stringify({ previousStatus: existing.status, updateData }),
        },
      });

      return p;
    });

    return NextResponse.json({
      success: true,
      post: updated,
      message: "Post status updated successfully.",
    });
  } catch (error: any) {
    console.error("[ADMIN_POST_PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update post.", details: error.message },
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
    return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
  }

  try {
    const existing = await prisma.socialPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          userId: auth.session?.id,
          organizationId: existing.organizationId,
          action: "ADMIN_POST_DELETED",
          resourceType: "SocialPost",
          resourceId: id,
          details: JSON.stringify({
            contentPreview: existing.content.substring(0, 80),
            status: existing.status,
          }),
        },
      });

      await tx.socialPost.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error: any) {
    console.error("[ADMIN_POST_DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete post.", details: error.message },
      { status: 500 }
    );
  }
}
