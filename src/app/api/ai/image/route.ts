import { NextRequest, NextResponse } from "next/server";
import { generateGeminiImage, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      model = "gemini-3.1-flash-image",
      style = "realistic",
      aspectRatio = "1:1",
      enhance = true,
      brandName,
      platform,
      referenceImageBase64,
      referenceImageMimeType,
      customApiKey,
      apiKey,
    } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { success: false, provider: "gemini", error: "PROMPT_REQUIRED", message: "Image prompt is required." },
        { status: 400 }
      );
    }

    const result = await generateGeminiImage({
      prompt: prompt.trim(),
      model,
      style,
      aspectRatio,
      enhance: Boolean(enhance),
      brandName,
      platform,
      referenceImageBase64,
      referenceImageMimeType,
      userId: session?.id,
      workspaceId: session?.activeOrgId,
      apiKey: customApiKey || apiKey,
    });

    return NextResponse.json({
      success: true,
      provider: "gemini",
      generator: result.model,
      imageUrl: result.imageUrl,
      prompt: result.prompt,
      enhancedPrompt: result.enhancedPrompt,
      aspectRatio: result.aspectRatio,
      model: result.model,
      style: result.style,
      dimensions: result.dimensions,
      createdAt: result.createdAt,
      id: result.id,
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
