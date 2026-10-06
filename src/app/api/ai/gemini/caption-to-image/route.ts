import { NextRequest, NextResponse } from "next/server";
import { generateGeminiImage, enhancePrompt, normalizeGeminiError } from "@/lib/ai/gemini";
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
    const { caption, brandName, style = "Photorealistic", aspectRatio = "1:1" } = body;

    if (!caption || typeof caption !== "string" || !caption.trim()) {
      return NextResponse.json(
        { success: false, provider: "gemini", error: "CAPTION_REQUIRED", message: "Caption is required." },
        { status: 400 }
      );
    }

    // Enhance caption into detailed visual image prompt
    const enhanced = await enhancePrompt({
      prompt: `Create a visual composition illustrating this social media copy: "${caption.slice(0, 300)}"`,
      style,
      aspectRatio,
      brandName,
    });

    const result = await generateGeminiImage({
      prompt: enhanced.enhancedPrompt,
      style,
      aspectRatio,
      brandName,
      userId: session.id,
      workspaceId: session.activeOrgId,
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
