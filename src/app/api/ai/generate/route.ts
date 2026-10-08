import { NextRequest, NextResponse } from "next/server";
import {
  generateSocialCaption,
  generateHashtagSuggestions,
  normalizeGeminiError,
} from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const {
      topic,
      prompt,
      action = "post",
      platform = "Instagram",
      contentType = "Engagement",
      brandName = "PulseSocial",
      brandVoice,
      targetAudience,
      tone = "Engaging & Viral",
      language = "English",
      cta,
      keywords,
      referenceText,
      websiteInfo,
      model,
    } = body;

    const effectiveTopic = (topic || prompt || "").trim();

    if (!effectiveTopic) {
      return NextResponse.json(
        {
          success: false,
          provider: "gemini",
          error: "TOPIC_REQUIRED",
          message: "Please provide a topic or prompt for content generation.",
        },
        { status: 400 }
      );
    }

    // Action: hashtags generation only
    if (action === "hashtags") {
      const hashtagsResult = await generateHashtagSuggestions({
        topic: effectiveTopic,
        platform,
        brand: brandName,
        userId: session?.id,
        workspaceId: session?.activeOrgId,
      });

      const combinedHashtags = [
        ...hashtagsResult.primary,
        ...hashtagsResult.secondary,
        ...hashtagsResult.niche,
        ...hashtagsResult.branded,
      ];

      return NextResponse.json({
        success: true,
        provider: "gemini",
        hashtags: combinedHashtags,
        breakdown: hashtagsResult,
        result: {
          hashtags: combinedHashtags,
        },
      });
    }

    // Action: Full Real Post Generation
    const postResult = await generateSocialCaption({
      topic: effectiveTopic,
      platform,
      contentType,
      brandName,
      brandVoice,
      targetAudience,
      tone,
      language,
      cta,
      keywords: Array.isArray(keywords) ? keywords : keywords ? [keywords] : undefined,
      referenceText,
      websiteInfo,
      model,
      userId: session?.id,
      workspaceId: session?.activeOrgId,
    });

    const variations = [
      {
        id: 1,
        label: `${tone} (Optimized)`,
        hook: postResult.hook,
        caption: postResult.caption,
        hashtags: postResult.hashtags,
        firstComment: postResult.platformNotes?.[0] || "",
      },
    ];

    return NextResponse.json({
      success: true,
      provider: "gemini",
      platform,
      caption: postResult.caption,
      hook: postResult.hook,
      cta: postResult.cta,
      hashtags: postResult.hashtags,
      platformNotes: postResult.platformNotes,
      suggestedPostingTime: postResult.suggestedPostingTime,
      imagePrompt: postResult.imagePrompt,
      variations,
      // Backward-compatible result wrapper
      result: {
        caption: postResult.caption,
        hook: postResult.hook,
        cta: postResult.cta,
        hashtags: postResult.hashtags,
        firstComment: postResult.platformNotes?.[0] || "",
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
