import { NextRequest, NextResponse } from "next/server";
import { enhancePrompt, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json(
        { success: false, provider: "gemini", error: "UNAUTHORIZED", message: "Active session required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { prompt, style, platform, aspectRatio, brandName } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { success: false, provider: "gemini", error: "PROMPT_REQUIRED", message: "Prompt is required." },
        { status: 400 }
      );
    }

    const result = await enhancePrompt({
      prompt: prompt.trim(),
      style,
      platform,
      aspectRatio,
      brandName,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const normalized = normalizeGeminiError(err);
    return NextResponse.json(
      { success: false, provider: "gemini", error: normalized.error, message: normalized.message },
      { status: normalized.statusCode }
    );
  }
}
