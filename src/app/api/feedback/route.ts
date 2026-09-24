import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rating, message, screenshotUrl, sourcePage } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be a valid integer between 1 and 5." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Feedback comments cannot be empty." }, { status: 400 });
    }

    const feedback = await (prisma as any).feedback.create({
      data: {
        rating,
        message: message.trim(),
        screenshotUrl: screenshotUrl || null,
        sourcePage: sourcePage || null,
      },
    });

    return NextResponse.json({
      success: true,
      id: feedback.id,
      message: "Thank you for helping us improve PulseSocial! Your feedback has been forwarded to the engineering & design teams.",
    });
  } catch (error: any) {
    console.error("[API_FEEDBACK_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to record feedback. Please try again later." },
      { status: 500 }
    );
  }
}
