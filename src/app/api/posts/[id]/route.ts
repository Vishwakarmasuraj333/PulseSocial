import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.socialPost.findFirst({
      where: {
        id,
        organizationId: session.activeOrgId,
      },
      include: {
        targets: {
          include: {
            socialAccount: {
              select: {
                id: true,
                provider: true,
                displayName: true,
                username: true,
                profileImageUrl: true,
              },
            },
          },
        },
        media: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to retrieve post" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Viewers cannot edit posts
    if (session.role === "VIEWER") {
      return NextResponse.json(
        { error: "Viewers do not have permission to modify posts" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const existingPost = await prisma.socialPost.findFirst({
      where: { id, organizationId: session.activeOrgId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updated = await prisma.socialPost.update({
      where: { id },
      data: {
        content: body.content !== undefined ? body.content : existingPost.content,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : existingPost.scheduledFor,
        status: body.status !== undefined ? body.status : existingPost.status,
      },
    });

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "POST_UPDATED",
      resourceType: "SocialPost",
      resourceId: id,
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Viewers cannot delete posts
    if (session.role === "VIEWER") {
      return NextResponse.json(
        { error: "Viewers do not have permission to delete posts" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingPost = await prisma.socialPost.findFirst({
      where: { id, organizationId: session.activeOrgId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.socialPost.delete({
      where: { id },
    });

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "POST_DELETED",
      resourceType: "SocialPost",
      resourceId: id,
    });

    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to delete post" },
      { status: 500 }
    );
  }
}
