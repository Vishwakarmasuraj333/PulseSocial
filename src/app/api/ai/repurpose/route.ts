import { NextRequest, NextResponse } from "next/server";
import { generateContentRepurpose, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const { originalContent, content, brandName, tone, language } = body;

    const sourceText = (originalContent || content || "").trim();

    if (!sourceText) {
      return NextResponse.json(
        {
          success: false,
          provider: "gemini",
          error: "CONTENT_REQUIRED",
          message: "Please provide the original piece of content to repurpose.",
        },
        { status: 400 }
      );
    }

    const result = await generateContentRepurpose({
      originalContent: sourceText,
      brandName,
      tone,
      language,
      userId: session?.id,
      workspaceId: session?.activeOrgId,
    });

    return NextResponse.json({
      success: true,
      provider: "gemini",
      repurposed: result,
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
