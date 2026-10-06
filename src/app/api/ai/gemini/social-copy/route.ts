import { NextRequest, NextResponse } from "next/server";
import { generateSocialCopy, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      brandName = "PulseSocial",
      industry = "Social Media Marketing",
      tone = "Engaging & Viral",
      platform = "Instagram",
      model = "gemini-3.5-flash",
      includeHashtags = true,
      includeFirstComment = true,
      includeCta = true,
      language = "English",
      customApiKey,
      apiKey,
    } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { success: false, provider: "gemini", error: "PROMPT_REQUIRED", message: "Please provide a valid prompt or topic." },
        { status: 400 }
      );
    }

    const result = await generateSocialCopy({
      prompt: prompt.trim(),
      brandName,
      industry,
      tone,
      platform,
      model,
      includeHashtags: Boolean(includeHashtags),
      includeFirstComment: Boolean(includeFirstComment),
      includeCta: Boolean(includeCta),
      language,
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
