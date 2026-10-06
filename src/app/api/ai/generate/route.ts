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
      includeCta = true,
      includeFirstComment = true,
      language = "English",
      customApiKey,
      apiKey,
    } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { success: false, provider: "gemini", error: "PROMPT_REQUIRED", message: "Please provide a topic or prompt." },
        { status: 400 }
      );
    }

    const copyResult = await generateSocialCopy({
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

    // Provide both structured root response and backward-compatible result wrapper
      const variations = [
        {
          id: 1,
          label: `${tone} (Primary)`,
          hook: copyResult.primaryCaption.split("\n")[0] || copyResult.primaryCaption,
          caption: copyResult.primaryCaption,
          hashtags: copyResult.hashtags,
          firstComment: copyResult.firstComment,
        },
        ...copyResult.alternatives.map((alt, idx) => ({
          id: idx + 2,
          label: `Alternative Variation ${idx + 1}`,
          hook: alt.split("\n")[0] || alt,
          caption: alt,
          hashtags: copyResult.hashtags,
        })),
      ];

      return NextResponse.json({
        success: true,
        provider: "gemini",
        model: copyResult.model,
        platform: copyResult.platform,
        tone: copyResult.tone,
        primaryCaption: copyResult.primaryCaption,
        hashtags: copyResult.hashtags,
        firstComment: copyResult.firstComment,
        cta: copyResult.cta,
        alternatives: copyResult.alternatives,
        universalVariants: copyResult.universalVariants,
        suggestions: copyResult.suggestions,
        imagePrompt: copyResult.imagePrompt,
        createdAt: copyResult.createdAt,
        id: copyResult.id,
        variations,
        result: {
          hook: copyResult.primaryCaption.split("\n")[0] || copyResult.primaryCaption,
          caption: copyResult.primaryCaption,
          hashtags: copyResult.hashtags,
          firstComment: copyResult.firstComment,
          cta: copyResult.cta,
          alternatives: copyResult.alternatives,
          universalVariants: copyResult.universalVariants,
          suggestedLocation: `${brandName} HQ`,
          variations,
        },
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
