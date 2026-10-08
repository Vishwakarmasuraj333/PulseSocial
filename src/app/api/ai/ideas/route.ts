import { NextRequest, NextResponse } from "next/server";
import { generatePostIdeas, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const {
      brand = "PulseSocial",
      industry = "Social Media Marketing",
      audience = "Creators & Business Owners",
      platform = "Instagram",
      numberOfIdeas = 5,
      goal = "Audience Engagement",
    } = body;

    const result = await generatePostIdeas({
      brand,
      industry,
      audience,
      platform,
      numberOfIdeas: Number(numberOfIdeas) || 5,
      goal,
      userId: session?.id,
      workspaceId: session?.activeOrgId,
    });

    return NextResponse.json({
      success: true,
      provider: "gemini",
      ideas: result.ideas,
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
