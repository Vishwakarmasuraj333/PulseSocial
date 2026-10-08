import { NextRequest, NextResponse } from "next/server";
import { generateContentRewrite, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const {
      content,
      text,
      action = "professional",
      targetLanguage,
      platform,
    } = body;

    const sourceContent = (content || text || "").trim();
    if (!sourceContent) {
      return NextResponse.json(
        {
          success: false,
          provider: "gemini",
          error: "CONTENT_REQUIRED",
          message: "Please provide content text to rewrite.",
        },
        { status: 400 }
      );
    }

    const result = await generateContentRewrite({
      content: sourceContent,
      action,
      targetLanguage,
      platform,
      userId: session?.id,
      workspaceId: session?.activeOrgId,
    });

    return NextResponse.json({
      success: true,
      provider: "gemini",
      action,
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
