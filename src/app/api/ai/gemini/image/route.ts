import { NextRequest, NextResponse } from "next/server";
import { generateGeminiImage, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      style = "realistic",
      aspectRatio = "1:1",
      model = "gemini-3.1-flash-image",
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
      style,
      aspectRatio,
      model,
      enhance: Boolean(enhance),
      brandName,
      platform,
      referenceImageBase64,
      referenceImageMimeType,
      userId: session?.id,
      workspaceId: session?.activeOrgId,
      apiKey: customApiKey || apiKey,
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
