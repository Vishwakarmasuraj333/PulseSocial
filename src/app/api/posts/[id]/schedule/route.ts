import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Viewers and analysts cannot schedule
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: session.activeOrgId,
          userId: session.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    const role = member.role.toUpperCase();
    if (role === "VIEWER" || role === "ANALYST") {
      return NextResponse.json(
        { error: "You do not have permission to schedule posts in this workspace" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.scheduledFor) {
      return NextResponse.json(
        { error: "scheduledFor timestamp is required" },
        { status: 400 }
      );
    }

    const runAt = new Date(body.scheduledFor);
    if (isNaN(runAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid scheduledFor date format" },
        { status: 400 }
      );
    }

    const post = await prisma.socialPost.findFirst({
      where: { id, organizationId: session.activeOrgId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Update post status and scheduled timestamp
    const updated = await prisma.socialPost.update({
      where: { id },
      data: {
        status: "SCHEDULED",
        scheduledFor: runAt,
      },
    });

    // Upsert ScheduledPost record for background worker
    await prisma.scheduledPost.upsert({
      where: { postId: id },
      update: {
        runAt,
        timezone: body.timezone || "UTC",
      },
      create: {
        postId: id,
        runAt,
        timezone: body.timezone || "UTC",
      },
    });

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: "POST_SCHEDULED",
      resourceType: "SocialPost",
      resourceId: id,
      details: { runAt: runAt.toISOString() },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to schedule post" },
      { status: 500 }
    );
  }
}
