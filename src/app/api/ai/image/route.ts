import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      model = "flux",
      style = "realistic",
      aspectRatio = "1:1",
      enhance = true,
      customApiKey,
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Image prompt is required." },
        { status: 400 }
      );
    }

    const cleanPrompt = prompt.trim();
    let finalPrompt = cleanPrompt;

    // 1. Google Gemini 3.8 Flash Prompt Enhancement for cinema-grade realism
    const apiKey = (customApiKey || process.env.GEMINI_API_KEY || "").trim();
    if (enhance && apiKey) {
      const enhanceModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash"];
      for (const m of enhanceModels) {
        try {
          const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
          const enhanceInstruction = `You are a world-class prompt engineer for text-to-image models (Flux & SDXL).
Convert this user image request into an ultra-high-resolution, visually breathtaking, photographic image prompt: "${cleanPrompt}".
Style: ${style}.
Guidelines: Include precise details on lighting, camera angle, atmospheric mood, realism, 8k resolution, but keep the description under 45 words.
DO NOT include markdown, quotes, or preamble. Return ONLY the raw enhanced prompt string.`;

          const geminiRes = await fetch(geminiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(4000),
            body: JSON.stringify({
              contents: [{ parts: [{ text: enhanceInstruction }] }],
            }),
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const enhancedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (enhancedText && enhancedText.length > 10) {
              finalPrompt = enhancedText;
              break;
            }
          }
        } catch (geminiErr) {
          // silently continue to next model or raw prompt
        }
      }
    }

    // 2. Determine dimensions based on aspect ratio
    let width = 1080;
    let height = 1080;
    if (aspectRatio === "9:16" || aspectRatio === "story") {
      width = 720;
      height = 1280;
    } else if (aspectRatio === "16:9" || aspectRatio === "landscape") {
      width = 1280;
      height = 720;
    } else if (aspectRatio === "4:5") {
      width = 1080;
      height = 1350;
    }

    // 3. Style modifiers for high-converting social imagery
    let styleModifier = "";
    if (style === "cinematic") {
      styleModifier = ", cinematic lighting, 8k resolution, photorealistic, dramatic depth of field, IMAX quality";
    } else if (style === "anime") {
      styleModifier = ", vibrant anime aesthetic, detailed makoto shinkai art style, crisp linework, vivid colors";
    } else if (style === "3d") {
      styleModifier = ", 3D render, octane render, unreal engine 5, ray tracing, cute stylized 3D, volumetric lighting";
    } else if (style === "neon") {
      styleModifier = ", cyberpunk neon glow, dark moody futuristic atmospheric lighting, high contrast, vibrant luminescence";
    } else if (style === "minimalist") {
      styleModifier = ", clean minimalist composition, pastel background, soft studio lighting, elegant, aesthetic";
    } else {
      styleModifier = ", award-winning commercial photography, highly detailed, natural lighting, shot on 35mm lens, 4k";
    }

    const fullPrompt = `${finalPrompt}${styleModifier}`;
    const seed = Math.floor(Math.random() * 9000000) + 1000000;

    // Real live image generation endpoint
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      fullPrompt
    )}?width=${width}&height=${height}&model=${encodeURIComponent(
      model === "flux" ? "flux" : model
    )}&nologo=true&seed=${seed}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: cleanPrompt,
      enhancedPrompt: finalPrompt,
      aspectRatio,
      dimensions: { width, height },
      model,
      style,
      seed,
      generator: "Flux.1 Pro + Gemini 3.8 Flash Enhancer",
    });
  } catch (error: any) {
    console.error("AI image generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI image." },
      { status: 500 }
    );
  }
}
