import { NextRequest, NextResponse } from "next/server";
import { generateHashtagSuggestions, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const { topic, context, platform = "Instagram", brand = "PulseSocial" } = body;

    const topicText = (topic || "").trim();
    if (!topicText) {
      return NextResponse.json(
        {
          success: false,
          provider: "gemini",
          error: "TOPIC_REQUIRED",
          message: "Please provide a topic to generate hashtags.",
        },
        { status: 400 }
      );
    }

    const result = await generateHashtagSuggestions({
      topic: topicText,
      context,
      platform,
      brand,
      userId: session?.id,
      workspaceId: session?.activeOrgId,
    });

    const allTags = [
      ...result.primary,
      ...result.secondary,
      ...result.niche,
      ...result.branded,
    ];

    return NextResponse.json({
      success: true,
      provider: "gemini",
      all: allTags,
      hashtags: allTags,
      ...result,
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
