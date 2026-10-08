import { NextRequest, NextResponse } from "next/server";
import { generateReply, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const {
      message,
      comment,
      platform = "Instagram",
      conversationContext,
      desiredTone,
      brandPersonality,
      language = "English",
      action,
      targetLanguage,
      currentDraft,
    } = body;

    const incoming = (message || comment || "").trim();

    if (!incoming) {
      return NextResponse.json(
        {
          success: false,
          provider: "gemini",
          error: "MESSAGE_REQUIRED",
          message: "Please provide the incoming message or comment text.",
        },
        { status: 400 }
      );
    }

    const replyResult = await generateReply({
      message: incoming,
      platform,
      conversationContext,
      desiredTone,
      brandPersonality,
      language,
      action,
      targetLanguage,
      currentDraft,
      userId: session?.id,
      workspaceId: session?.activeOrgId,
    });

    return NextResponse.json({
      success: true,
      provider: "gemini",
      platform,
      ...replyResult,
    });
  } catch (err: any) {
    const normalized = normalizeGeminiError(err);
    return NextResponse.json(
      {
        success: false,
        provider: "gemini",
        error: normalized.error,
        message: normalized.message,
      },
      { status: normalized.statusCode }
    );
  }
}
