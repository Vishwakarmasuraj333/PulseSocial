import { NextRequest, NextResponse } from "next/server";
import { generateGeminiSuggestions, normalizeGeminiError } from "@/lib/ai/gemini";
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
    const { topic, platform, brandName } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { success: false, provider: "gemini", error: "TOPIC_REQUIRED", message: "Please provide a topic to generate suggestions." },
        { status: 400 }
      );
    }

    const result = await generateGeminiSuggestions(topic.trim(), platform, brandName);
    return NextResponse.json(result);
  } catch (err: any) {
    const normalized = normalizeGeminiError(err);
    return NextResponse.json(
      { success: false, provider: "gemini", error: normalized.error, message: normalized.message },
      { status: normalized.statusCode }
    );
  }
}
