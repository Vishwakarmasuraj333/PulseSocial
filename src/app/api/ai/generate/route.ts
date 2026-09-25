import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      action = "variations",
      brandName = "PulseSocial Brand",
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

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required to generate social content." },
        { status: 400 }
      );
    }

    // If Gemini key is missing, return friendly response with requiresKey flag
    if (!apiKey) {
      // Deterministic realistic fallback variations so UI never crashes or shows fake mock
      const sampleVariations = [
        {
          id: 1,
          label: "Variation 1 (Engaging & Viral)",
          hook: `🚀 Stop scrolling! Here is what is transforming our approach to ${prompt.slice(0, 35)}...`,
          caption: `🚀 Stop scrolling! Here is what is transforming our approach to ${prompt.slice(0, 35)}...\n\nConsistency beats guesswork every single time. By orchestrating everything through a unified command center, we've increased organic reach while saving hours every week.\n\n👇 What's your biggest priority this month? Let's discuss in the comments!`,
          hashtags: ["#SocialMediaGrowth", "#ContentStrategy", "#CreatorEconomy", "#PulseSocial"],
          firstComment: "Drop your thoughts below—we reply to every comment! 👇",
        },
        {
          id: 2,
          label: "Variation 2 (Professional & Value-First)",
          hook: `3 Key Insights on ${prompt.slice(0, 35)} that every team should know:`,
          caption: `3 Key Insights on ${prompt.slice(0, 35)} that every team should know:\n\n1. Multi-network synchronization keeps your brand message unified.\n2. Optimal scheduling algorithms ensure you hit peak active audience windows.\n3. Real API telemetry eliminates guesswork.\n\nExplore how high-performing teams streamline their distribution with PulseSocial.`,
          hashtags: ["#BusinessGrowth", "#SocialMediaMarketing", "#Productivity", "#SaaS"],
          firstComment: "Link to full breakdown and documentation in our profile! 🔗",
        },
        {
          id: 3,
          label: "Variation 3 (Conversational & Storytelling)",
          hook: `We used to struggle with managing multi-channel posts until we changed this one thing.`,
          caption: `We used to struggle with managing multi-channel posts until we changed this one thing.\n\nContext on ${prompt}:\nWhen you eliminate the friction of switching between 6 different apps, you can focus on creating content that actually resonates with your audience.\n\nTry this approach this week and see the difference in community response! ✨`,
          hashtags: ["#BehindTheScenes", "#CreatorLife", "#MarketingTips", "#GrowthHacking"],
          firstComment: "Save this post for your next campaign planning session! 📌",
        },
      ];

      return NextResponse.json({
        success: true,
        requiresKey: true,
        notice: "Google Gemini API key is not configured in .env. Enter your key or configure GEMINI_API_KEY in Settings > Integrations for custom live generation.",
        model: "offline-preview",
        result: {
          hook: sampleVariations[0].hook,
          caption: sampleVariations[0].caption,
          hashtags: sampleVariations[0].hashtags,
          firstComment: sampleVariations[0].firstComment,
          suggestedLocation: "Global",
          variations: sampleVariations,
        },
      });
    }

    const platformGuidance: Record<string, string> = {
      x: "Keep under 280 characters, punchy hook, concise format.",
      twitter: "Keep under 280 characters, punchy hook, concise format.",
      linkedin: "Professional, structured thought-leadership style with clean spacing.",
      instagram: "Visual, engaging narrative with emojis and community conversation prompt.",
      facebook: "Community-driven, conversational, relatable with discussion question.",
      youtube: "Shorts/Video description style with excitement and subscribe prompt.",
      threads: "Casual, witty, conversational microblogging style.",
      general: "Balanced, dynamic, high-engagement social media copy.",
    };

    const targetGuidance = platformGuidance[platform.toLowerCase()] || platformGuidance.general;

    let systemInstruction = "";
    let userPrompt = "";

    if (action === "variations" || action === "post" || action === "caption") {
      systemInstruction = `You are an elite social media strategist for "${brandName}" in "${industry}".
Generate 3 distinct, publication-ready post variations for ${platform.toUpperCase()} in valid JSON:
{
  "variations": [
    {
      "id": 1,
      "label": "Variation 1 (High Energy & Hook-Driven)",
      "hook": "Single line attention hook",
      "caption": "Full post text with line breaks and emojis. ${targetGuidance}",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"],
      "firstComment": "Strategic conversation starter comment"
    },
    {
      "id": 2,
      "label": "Variation 2 (Professional & Direct)",
      "hook": "Single line attention hook",
      "caption": "Full post text with line breaks and emojis.",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"],
      "firstComment": "Strategic conversation starter comment"
    },
    {
      "id": 3,
      "label": "Variation 3 (Storytelling & Community)",
      "hook": "Single line attention hook",
      "caption": "Full post text with line breaks and emojis.",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"],
      "firstComment": "Strategic conversation starter comment"
    }
  ]
}
Return ONLY valid JSON.`;
      userPrompt = `Topic / Input: "${prompt}". Desired tone: ${tone}. ${includeCta ? "Include clear CTA." : ""}`;
    } else if (action === "rewrite" || action === "shorten" || action === "expand") {
      systemInstruction = `You are an expert copy editor. ${
        action === "shorten"
          ? "Condense the input to be punchy and direct while preserving core message."
          : action === "expand"
          ? "Expand the input with insightful details, actionable bullet points, and engaging hooks."
          : `Rewrite the input in a ${tone} tone for ${platform}.`
      }
Return valid JSON:
{
  "caption": "The rewritten/modified copy",
  "hook": "Extracted or enhanced hook",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "firstComment": "Engaging first comment"
}`;
      userPrompt = `Content to transform: "${prompt}"`;
    } else if (action === "hashtags") {
      systemInstruction = `Generate 15 high-performing, niche and trending hashtags for social media based on the topic. Return valid JSON: { "hashtags": ["#tag1", "#tag2", ...] }`;
      userPrompt = `Topic: "${prompt}"`;
    } else if (action === "ideas") {
      systemInstruction = `Generate 5 viral content ideas and hooks based on the topic. Return valid JSON: { "ideas": [ { "title": "...", "angle": "...", "hook": "..." } ] }`;
      userPrompt = `Topic: "${prompt}"`;
    } else if (action === "image_prompt") {
      systemInstruction = `Generate a detailed, cinematic image generation prompt (compatible with Imagen 3 / Midjourney) for social media. Return valid JSON: { "imagePrompt": "...", "style": "...", "aspectRatio": "1:1" }`;
      userPrompt = `Theme / Concept: "${prompt}"`;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const geminiPayload = {
      contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1500,
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
      let errorMsg = `Google Gemini API returned status ${res.status}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error?.message) errorMsg = parsed.error.message;
      } catch {}
      return NextResponse.json({ error: "GEMINI_API_ERROR", message: errorMsg }, { status: res.status });
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const textContent = candidate?.content?.parts?.[0]?.text;

    if (!textContent) {
      return NextResponse.json(
        { error: "NO_CONTENT_GENERATED", message: "Gemini did not return any content." },
        { status: 500 }
      );
    }

    let parsedResult;
    try {
      const cleaned = textContent.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      parsedResult = JSON.parse(cleaned);
    } catch {
      parsedResult = {
        hook: prompt.slice(0, 60),
        caption: textContent,
        hashtags: [`#${brandName.replace(/\s+/g, "")}`, "#SocialMedia", "#Growth"],
        firstComment: "Let us know your thoughts below! 👇",
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
