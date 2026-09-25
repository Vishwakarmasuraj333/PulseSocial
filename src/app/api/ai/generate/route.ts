import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      brandName = "Brand",
      industry = "Digital Content",
      tone = "Engaging & Viral",
      platform = "general",
      postType = "standard",
      includeHashtags = true,
      includeCta = true,
      includeFirstComment = true,
      customApiKey,
    } = body;

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_KEY_MISSING",
          message:
            "Google Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file or enter your API key to generate content with Gemini AI.",
          requiresKey: true,
        },
        { status: 400 }
      );
    }

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required to generate social content." },
        { status: 400 }
      );
    }

    const platformGuidance: Record<string, string> = {
      x: "Keep the main tweet punchy, concise, under 280 characters if possible, high-energy hook.",
      twitter: "Keep the main tweet punchy, concise, under 280 characters, high-energy hook.",
      linkedin: "Professional, structured, insightful thought-leadership style with clean spacing and actionable takeaways.",
      instagram: "Visual, engaging, conversational narrative with authentic tone and relevant emojis.",
      facebook: "Community-driven, conversational, relatable, with an open-ended engagement question.",
      youtube: "Video/Shorts description style with excitement, value propositions, and subscribe prompt.",
      threads: "Casual, witty, conversational microblogging style designed to spark lively replies.",
      general: "Balanced, dynamic, high-engagement social media copy suitable across multi-channel distribution.",
    };

    const targetGuidance = platformGuidance[platform.toLowerCase()] || platformGuidance.general;

    const systemInstruction = `You are an elite, world-class social media strategist and copywriter creating content for the brand "${brandName}" in the "${industry}" industry.
Format your output strictly as a valid JSON object with the following keys:
- "hook": A single powerful headline/first-line attention hook (no hashtags).
- "caption": The complete, publication-ready post caption formatted with line breaks, expressive tone, and emojis. ${targetGuidance}
- "hashtags": An array of 4 to 8 relevant, high-impact hashtags (including the '#' prefix). ${
      includeHashtags ? "Include trending and niche tags." : "Keep minimal."
    }
- "firstComment": ${
      includeFirstComment
        ? "A strategic first comment designed to maximize algorithmic engagement, ask a discussion question, or share an extra resource."
        : "A short thank you or question."
    }
- "suggestedLocation": A relevant city/location (e.g. 'Mumbai, Maharashtra, India' or 'San Francisco, CA, USA' or 'Global').

Important: Output ONLY the valid JSON object. Do not wrap in markdown quotes if possible, or use standard json.`;

    const userPrompt = `Create a ${tone} ${postType} post for ${platform.toUpperCase()}.
Topic / Context: "${prompt}".
${includeCta ? "Make sure to include a clear, natural Call-To-Action." : ""}
Return valid JSON.`;

    // Try Gemini 1.5 Flash (fast, state-of-the-art) with fallback to gemini-2.0-flash
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemInstruction}\n\n${userPrompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      let errorMsg = `Google Gemini API returned status ${res.status}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error?.message) errorMsg = parsed.error.message;
      } catch {}
      return NextResponse.json(
        { error: "GEMINI_API_ERROR", message: errorMsg },
        { status: res.status }
      );
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const textContent = candidate?.content?.parts?.[0]?.text;

    if (!textContent) {
      return NextResponse.json(
        { error: "NO_CONTENT_GENERATED", message: "Gemini did not return any candidates." },
        { status: 500 }
      );
    }

    let parsedResult;
    try {
      // Remove any markdown code block wrappers if present
      const cleaned = textContent.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      parsedResult = JSON.parse(cleaned);
    } catch {
      // Fallback if parsing fails
      parsedResult = {
        hook: prompt.slice(0, 60),
        caption: textContent,
        hashtags: [`#${brandName.replace(/\s+/g, "")}`, "#SocialMedia", "#Innovation"],
        firstComment: "Let us know your thoughts in the comments below! 👇",
        suggestedLocation: "Global",
      };
    }

    return NextResponse.json({
      success: true,
      result: parsedResult,
      model: "gemini-1.5-flash",
    });
  } catch (error: any) {
    console.error("Gemini generation route error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: error.message || "Failed to generate AI content." },
      { status: 500 }
    );
  }
}
