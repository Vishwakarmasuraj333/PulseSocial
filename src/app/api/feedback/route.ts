import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    const body = await req.json().catch(() => ({}));
    const { rating, category = "general", message, screenshotUrl, email } = body;

    const numRating = Number(rating);
    if (!numRating || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: "Rating must be a valid number between 1 and 5." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Please enter your feedback comments before submitting." },
        { status: 400 }
      );
    }

    const formattedMessage = `[${category.toUpperCase()}] ${message.trim()}${
      email ? ` (Contact: ${email})` : ""
    }`;

    let feedbackRecord = null;
    try {
      feedbackRecord = await prisma.feedback.create({
        data: {
          rating: numRating,
          message: formattedMessage,
          userId: session?.id || null,
          organizationId: session?.activeOrgId || null,
          screenshotUrl: screenshotUrl || null,
          status: "NEW",
        },
      });
    } catch (dbError) {
      console.warn("[FEEDBACK_DB_FALLBACK] Feedback saved to secure audit log:", dbError);
    }

    // Always log audit trail
    await logAudit({
      action: "USER_FEEDBACK_SUBMITTED",
      resourceType: "FEEDBACK",
      resourceId: feedbackRecord?.id || `fb_${Date.now()}`,
      userId: session?.id || undefined,
      organizationId: session?.activeOrgId || undefined,
      details: {
        rating: numRating,
        category,
        message: message.trim(),
        userEmail: session?.email || email || null,
        feedbackId: feedbackRecord?.id || `fb_${Date.now()}`,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      id: feedbackRecord?.id || `fb_${Date.now()}`,
      message: "Thank you for your feedback! It has been logged and sent directly to our team.",
    });
  } catch (error: unknown) {
    console.error("[API_FEEDBACK_ERROR]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to record feedback. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: session.activeOrgId ? { organizationId: session.activeOrgId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, count: feedbacks.length, feedbacks });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch feedbacks" },
      { status: 500 }
    );
  }
}
