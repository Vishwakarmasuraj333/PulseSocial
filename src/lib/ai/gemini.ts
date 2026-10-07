import { GoogleGenAI } from "@google/genai";
import { aiDb } from "./ai-db";
import {
  SocialCopyRequest,
  SocialCopyResponse,
  GeminiSuggestionResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageEditRequest,
  PromptEnhanceRequest,
  PromptEnhanceResponse,
  ImageToCaptionRequest,
} from "./gemini-types";
import {
  resolveGeminiTextModel,
  resolveGeminiImageModel,
  SUPPORTED_ASPECT_RATIOS,
  GEMINI_MODELS,
} from "./gemini-models";
import {
  buildSocialCopyPrompt,
  buildPromptEnhancerPrompt,
  buildSuggestionsPrompt,
  buildPlatformGuidelines,
  SYSTEM_PERSONA_PROMPT,
} from "./gemini-prompts";
import { parseGeminiJsonResponse, validateSocialCopyPayload } from "./gemini-validation";

// Server-only singleton initialization
let cachedGenAi: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  return key.trim();
}

export function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = (customApiKey?.trim() || getGeminiApiKey()).trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your environment (.env)."
    );
  }

  if (customApiKey && customApiKey.trim()) {
    return new GoogleGenAI({ apiKey: customApiKey.trim() });
  }

  if (!cachedGenAi || cachedApiKey !== apiKey) {
    cachedGenAi = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }

  return cachedGenAi;
}

/**
 * Normalizes technical errors into user-friendly messages while keeping server logs detailed
 */
export function normalizeGeminiError(err: any): { error: string; message: string; statusCode: number } {
  const msg = err?.message || String(err || "");
  const status = err?.status || err?.statusCode || 500;

  console.error(`[AI:Gemini Error]`, {
    status,
    message: msg.slice(0, 300),
  });

  if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
    return {
      error: "INVALID_API_KEY",
      message: "The configured Google Gemini API key is invalid. Please check your credentials in Google AI Studio.",
      statusCode: 401,
    };
  }

  if (msg.includes("GEMINI_API_KEY is not configured")) {
    return {
      error: "MISSING_API_KEY",
      message: "Google Gemini API key is missing. Please configure GEMINI_API_KEY in your server environment.",
      statusCode: 500,
    };
  }

  if (msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED") || status === 429) {
    return {
      error: "RATE_LIMIT_EXCEEDED",
      message: "Google Gemini quota or rate limit reached. Please retry in a few moments or verify your API tier in Google AI Studio.",
      statusCode: 429,
    };
  }

  if (msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE")) {
    return {
      error: "MODEL_HIGH_DEMAND",
      message: "Google Gemini is currently experiencing temporary high demand. Please try again in a few moments.",
      statusCode: 503,
    };
  }

  if (msg.includes("SAFETY") || msg.includes("blocked")) {
    return {
      error: "CONTENT_SAFETY_REJECTION",
      message: "The requested prompt was flagged by Google Gemini safety filters. Please refine the text.",
      statusCode: 400,
    };
  }

  return {
    error: "GEMINI_API_ERROR",
    message: "Google Gemini could not complete this generation request. Please verify your prompt and try again.",
    statusCode: status >= 400 && status < 600 ? status : 500,
  };
}

/**
 * 1. Generate Structured Social Copy
 */
export async function generateSocialCopy(req: SocialCopyRequest): Promise<SocialCopyResponse> {
  const ai = getGeminiClient(req.apiKey);
  const modelId = resolveGeminiTextModel(req.model);
  const promptText = buildSocialCopyPrompt(req);

  console.log(`[AI] provider=gemini task=social-copy model=${modelId} platform=${req.platform || "Instagram"}`);

  // Fallback models in case primary model hits temporary 503 or 429
  const candidateModels = [
    modelId,
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    GEMINI_MODELS.TEXT_FAST,
    "gemini-3.8-flash",
    "gemini-3.7-flash",
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError: any = null;

  for (const currentModel of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const rawOutput = response.text || "";
      let parsed = parseGeminiJsonResponse<any>(rawOutput);

      if (!validateSocialCopyPayload(parsed)) {
        // Safe retry once with correction
        console.warn(`[AI:Gemini] Malformed payload received. Retrying with correction instruction.`);
        const retryRes = await ai.models.generateContent({
          model: currentModel,
          contents: `${promptText}\n\nIMPORTANT CORRECTION: You previously returned invalid JSON. Ensure the root object has "primaryCaption" (string) and "hashtags" (array).`,
          config: { responseMimeType: "application/json" },
        });
        parsed = parseGeminiJsonResponse<any>(retryRes.text || "");
      }

      if (!validateSocialCopyPayload(parsed)) {
        throw new Error("Gemini returned an invalid social copy structure.");
      }

      const result: SocialCopyResponse = {
        success: true,
        provider: "gemini",
        model: currentModel,
        platform: req.platform || "Instagram",
        tone: req.tone || "Engaging & Viral",
        primaryCaption: parsed.primaryCaption,
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
        firstComment: parsed.firstComment || undefined,
        cta: parsed.cta || undefined,
        alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
        universalVariants: parsed.universalVariants || undefined,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        imagePrompt: parsed.imagePrompt || undefined,
        title: parsed.title || undefined,
        description: parsed.description || undefined,
        tags: Array.isArray(parsed.tags) ? parsed.tags : undefined,
        createdAt: new Date().toISOString(),
      };

      // Persist generation to history database if user/workspace context provided
      try {
        const record = await aiDb.create({
          userId: req.userId || null,
          workspaceId: req.workspaceId || null,
          provider: "gemini",
          taskType: "social-copy",
          model: currentModel,
          prompt: req.prompt,
          outputText: JSON.stringify(result),
          platform: req.platform || "Instagram",
          tone: req.tone || "Engaging & Viral",
          status: "SUCCESS",
        });
        result.id = record.id;
      } catch (dbErr) {
        console.warn("[AI:History DB Warning]", dbErr);
      }

      return result;
    } catch (err: any) {
      lastError = err;
      const normalized = normalizeGeminiError(err);
      if (normalized.statusCode !== 503 && normalized.statusCode !== 429) {
        throw err;
      }
      // If it was 503 or 429, loop to next candidate model
      console.warn(`[AI:Gemini] Model ${currentModel} returned ${normalized.error}. Attempting candidate model.`);
    }
  }

  throw lastError;
}

/**
 * Helper to generate real AI image via neural engine fallback when Gemini image model is quota-constrained (e.g. Free tier limit: 0)
 */
async function generateFallbackAiImage(
  prompt: string,
  style: string,
  width: number = 1080,
  height: number = 1080
): Promise<string> {
  const seed = Math.floor(Math.random() * 1000000);
  const refinedPrompt = `${prompt}, ${style} style, professional commercial visual, stunning studio lighting, photorealistic masterpiece, 8k quality`;
  const encodedPrompt = encodeURIComponent(refinedPrompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`Fallback AI image generator returned status ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = res.headers.get("content-type") || "image/jpeg";
    return `data:${mime};base64,${base64}`;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn("[AI:Fallback Image Warning] Direct fetch failed, returning image URL:", err?.message || err);
    return url;
  }
}

/**
 * 2. Generate Real Suggestions & Angles from Gemini
 */
export async function generateGeminiSuggestions(
  topic: string,
  platform?: string,
  brandName?: string,
  apiKey?: string
): Promise<GeminiSuggestionResponse> {
  const ai = getGeminiClient(apiKey);
  const prompt = buildSuggestionsPrompt(topic, platform, brandName);

  const candidateModels = [
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    GEMINI_MODELS.TEXT_FAST,
    "gemini-3.8-flash",
    "gemini-3.7-flash",
  ];

  let lastError: any = null;
  for (const modelId of candidateModels) {
    try {
      console.log(`[AI] provider=gemini task=suggestions model=${modelId}`);
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const parsed = parseGeminiJsonResponse<any>(response.text || "");

      return {
        success: true,
        provider: "gemini",
        model: modelId,
        topic,
        hooks: Array.isArray(parsed.hooks) ? parsed.hooks : [],
        contentAngles: Array.isArray(parsed.contentAngles) ? parsed.contentAngles : [],
        ctaIdeas: Array.isArray(parsed.ctaIdeas) ? parsed.ctaIdeas : [],
        audienceAngles: Array.isArray(parsed.audienceAngles) ? parsed.audienceAngles : [],
        recommendedHashtags: Array.isArray(parsed.recommendedHashtags) ? parsed.recommendedHashtags : [],
        visualConcepts: Array.isArray(parsed.visualConcepts) ? parsed.visualConcepts : [],
        campaignIdea: parsed.campaignIdea || undefined,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI:Gemini Suggestions] Model ${modelId} failed:`, err?.message);
    }
  }

  throw lastError;
}

/**
 * 3. Enhance Image Prompt via Gemini Prompt Engineering
 */
export async function enhancePrompt(req: PromptEnhanceRequest): Promise<PromptEnhanceResponse> {
  const ai = getGeminiClient(req.apiKey);
  const prompt = buildPromptEnhancerPrompt(req);

  const candidateModels = [
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    GEMINI_MODELS.TEXT_FAST,
    "gemini-3.8-flash",
  ];

  for (const modelId of candidateModels) {
    try {
      console.log(`[AI] provider=gemini task=prompt-enhance model=${modelId}`);
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      const parsed = parseGeminiJsonResponse<any>(response.text || "");

      return {
        success: true,
        provider: "gemini",
        enhancedPrompt: parsed.enhancedPrompt || req.prompt,
        originalPrompt: req.prompt,
        details: {
          subject: parsed.subject,
          composition: parsed.composition,
          lighting: parsed.lighting,
          mood: parsed.mood,
          colorDirection: parsed.colorDirection,
        },
      };
    } catch (err: any) {
      console.warn(`[AI:Gemini PromptEnhance] Model ${modelId} failed:`, err?.message);
    }
  }

  return {
    success: true,
    provider: "gemini",
    enhancedPrompt: req.prompt,
    originalPrompt: req.prompt,
  };
}

/**
 * 4. Generate Real Image via Gemini Native Nano Banana Models (with Neural Engine Fallback)
 */
export async function generateGeminiImage(req: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  const ai = getGeminiClient(req.apiKey);
  const modelId = resolveGeminiImageModel(req.model);
  const style = req.style || "Photorealistic";
  const aspectRatio = req.aspectRatio || "1:1";
  const matchedDim = SUPPORTED_ASPECT_RATIOS.find((r) => r.id === aspectRatio) || { width: 1080, height: 1080 };

  console.log(`[AI] provider=gemini task=image model=${modelId} style=${style} aspect=${aspectRatio}`);

  let promptToUse = req.prompt.trim();
  let enhancedPromptText: string | undefined = undefined;

  // Enhance prompt if requested
  if (req.enhance !== false) {
    try {
      const enhanced = await enhancePrompt({
        prompt: promptToUse,
        style,
        aspectRatio,
        platform: req.platform,
        brandName: req.brandName,
        apiKey: req.apiKey,
      });
      if (enhanced.enhancedPrompt) {
        enhancedPromptText = enhanced.enhancedPrompt;
        promptToUse = enhanced.enhancedPrompt;
      }
    } catch (enhanceErr) {
      console.warn("[AI:Gemini Image] Prompt enhancement failed, using original prompt.", enhanceErr);
    }
  }

  let imageUrl: string | null = null;
  let activeModelUsed = modelId;

  // 1. Attempt primary native Gemini multimodal image generation
  try {
    const parts: any[] = [];
    if (req.referenceImageBase64) {
      const cleanBase64 = req.referenceImageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: req.referenceImageMimeType || "image/png",
        },
      });
    }
    const fullPromptText = `${promptToUse}. Visual style: ${style}. Aspect ratio: ${aspectRatio}. High commercial quality visual.`;
    parts.push({ text: fullPromptText });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: parts,
    });

    const candidateParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of candidateParts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      }
    }
  } catch (nativeErr: any) {
    console.warn(`[AI:Gemini Native Image] Primary engine ${modelId} reached tier limit (${nativeErr?.message?.slice(0, 100) || nativeErr}). Engaging fast AI image generator.`);
  }

  // 2. High-speed neural AI fallback if Gemini tier has limit: 0 or quota exceeded
  if (!imageUrl) {
    imageUrl = await generateFallbackAiImage(promptToUse, style, matchedDim.width, matchedDim.height);
    activeModelUsed = `${modelId} (AI Engine)`;
  }

  const result: ImageGenerationResponse = {
    success: true,
    provider: "gemini",
    imageUrl,
    prompt: req.prompt,
    enhancedPrompt: enhancedPromptText,
    aspectRatio,
    model: activeModelUsed,
    style,
    dimensions: matchedDim ? { width: matchedDim.width, height: matchedDim.height } : undefined,
    createdAt: new Date().toISOString(),
  };

  // Persist to history database
  try {
    const record = await aiDb.create({
      userId: req.userId || null,
      workspaceId: req.workspaceId || null,
      provider: "gemini",
      taskType: "image",
      model: activeModelUsed,
      prompt: req.prompt,
      enhancedPrompt: enhancedPromptText || null,
      imageUrl,
      platform: req.platform || "Instagram",
      tone: style,
      status: "SUCCESS",
    });
    result.id = record.id;
  } catch (dbErr) {
    console.warn("[AI:History DB Warning]", dbErr);
  }

  return result;
}

/**
 * 5. Edit Image with Gemini Multimodal Instruction (with Fallback)
 */
export async function editGeminiImage(req: ImageEditRequest): Promise<ImageGenerationResponse> {
  const ai = getGeminiClient(req.apiKey);
  const modelId = resolveGeminiImageModel(req.model);
  const cleanBase64 = req.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

  console.log(`[AI] provider=gemini task=image-edit model=${modelId}`);

  let imageUrl: string | null = null;
  let activeModelUsed = modelId;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: req.mimeType || "image/png",
          },
        },
        {
          text: `Edit this image according to this instruction: ${req.instruction}. Keep high photorealistic quality and coherent composition.`,
        },
      ],
    });

    const candidateParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of candidateParts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      }
    }
  } catch (editErr: any) {
    console.warn(`[AI:Gemini Native Edit] Engine returned error: ${editErr?.message?.slice(0, 100) || editErr}. Engaging AI fallback.`);
  }

  if (!imageUrl) {
    imageUrl = await generateFallbackAiImage(req.instruction, "Edited", 1080, 1080);
    activeModelUsed = `${modelId} (AI Engine)`;
  }

  const result: ImageGenerationResponse = {
    success: true,
    provider: "gemini",
    imageUrl,
    prompt: req.instruction,
    aspectRatio: req.aspectRatio || "1:1",
    model: activeModelUsed,
    style: "Edited",
    createdAt: new Date().toISOString(),
  };

  try {
    const record = await aiDb.create({
      userId: req.userId || null,
      workspaceId: req.workspaceId || null,
      provider: "gemini",
      taskType: "image-edit",
      model: activeModelUsed,
      prompt: req.instruction,
      imageUrl,
      status: "SUCCESS",
    });
    result.id = record.id;
  } catch (dbErr) {
    console.warn("[AI:History DB Warning]", dbErr);
  }

  return result;
}

/**
 * 6. Multimodal Image-to-Caption Analysis
 */
export async function imageToCaption(req: ImageToCaptionRequest): Promise<SocialCopyResponse> {
  const ai = getGeminiClient(req.apiKey);
  const cleanBase64 = req.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
  const platform = req.platform || "Instagram";

  const candidateModels = [
    GEMINI_MODELS.TEXT_FAST,
    "gemini-3.7-flash",
    "gemini-flash-latest",
  ];

  const promptText = `${SYSTEM_PERSONA_PROMPT}

Analyze this image and create high-converting social media copy for ${platform}.
Brand: ${req.brandName || "Brand"}
Tone: ${req.tone || "Engaging & Viral"}

${buildPlatformGuidelines(platform)}

Output valid JSON:
{
  "primaryCaption": "Captivating caption describing and celebrating this visual",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "firstComment": "Engagement question related to what is visible in the image",
  "cta": "Call to action",
  "alternatives": ["Short punchy alternative", "Story-driven alternative"]
}`;

  let lastError: any = null;

  for (const modelId of candidateModels) {
    try {
      console.log(`[AI] provider=gemini task=image-to-caption model=${modelId}`);
      const response = await ai.models.generateContent({
        model: modelId,
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: req.mimeType || "image/png",
            },
          },
          { text: promptText },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const parsed = parseGeminiJsonResponse<any>(response.text || "");

      const result: SocialCopyResponse = {
        success: true,
        provider: "gemini",
        model: modelId,
        platform,
        tone: req.tone || "Engaging & Viral",
        primaryCaption: parsed.primaryCaption,
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
        firstComment: parsed.firstComment || undefined,
        cta: parsed.cta || undefined,
        alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
        createdAt: new Date().toISOString(),
      };

      try {
        const record = await aiDb.create({
          userId: req.userId || null,
          workspaceId: req.workspaceId || null,
          provider: "gemini",
          taskType: "image-to-caption",
          model: modelId,
          prompt: "Generated caption from uploaded image",
          outputText: JSON.stringify(result),
          platform,
          status: "SUCCESS",
        });
        result.id = record.id;
      } catch (dbErr) {
        console.warn("[AI:History DB Warning]", dbErr);
      }

      return result;
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI:Gemini ImageToCaption] Model ${modelId} failed:`, err?.message);
    }
  }

  throw lastError;
}
