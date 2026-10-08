import { NextRequest, NextResponse } from "next/server";
import { generateAnalyticsInsights, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const { timeframe = "30d", question } = body;

    const result = await generateAnalyticsInsights({
      timeframe,
      question,
      userId: session?.id,
      workspaceId: session?.activeOrgId,
    });

    return NextResponse.json({
      success: true,
      provider: "gemini",
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
