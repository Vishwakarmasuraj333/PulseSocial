import { GeminiTextModelId, GeminiImageModelId } from "./gemini-types";

// Official Google Gemini Active Models (2026 Production)
export const GEMINI_MODELS = {
  // Text Models
  TEXT_FAST: "gemini-3.5-flash" as GeminiTextModelId,
  TEXT_BALANCED: "gemini-3.7-flash" as GeminiTextModelId,
  TEXT_PRO: "gemini-3.8-flash" as GeminiTextModelId,
  TEXT_LATEST: "gemini-flash-latest" as GeminiTextModelId,
  TEXT_LITE: "gemini-3.1-flash-lite" as GeminiTextModelId,
  TEXT_REASONING: "gemini-3.1-pro-preview" as GeminiTextModelId,

  // Image Models (Nano Banana Native Multimodal Image Generation)
  IMAGE_PRIMARY: "gemini-3.1-flash-image" as GeminiImageModelId, // Nano Banana 2
  IMAGE_PREMIUM: "gemini-3-pro-image" as GeminiImageModelId,     // Nano Banana Pro
  IMAGE_FAST: "gemini-3.1-flash-lite-image" as GeminiImageModelId, // Nano Banana 2 Lite
} as const;

export interface ModelDescriptor {
  id: string;
  apiModelId: string;
  name: string;
  badge?: string;
  desc: string;
  isDefault?: boolean;
}

export const TEXT_MODEL_CONFIGS: ModelDescriptor[] = [
  {
    id: "gemini-3.5-flash",
    apiModelId: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    badge: "Ultra Fast",
    desc: "Lightning fast, high consistency & structured output",
    isDefault: true,
  },
  {
    id: "gemini-3.7-flash",
    apiModelId: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    badge: "Next-Gen",
    desc: "Advanced multimodal reasoning & creative copy",
  },
  {
    id: "gemini-3.8-flash",
    apiModelId: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    badge: "Flagship",
    desc: "Next-gen multimodal, high intelligence & reasoning",
  },
  {
    id: "gemini-flash-latest",
    apiModelId: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    badge: "Production",
    desc: "Real-time production copy & viral hooks",
  },
  {
    id: "gemini-3.1-flash-lite",
    apiModelId: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    badge: "Lite",
    desc: "Instant micro-copy, hashtags & quick ideas",
  },
  {
    id: "gemini-3.1-pro-preview",
    apiModelId: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    badge: "Deep Reasoning",
    desc: "Long-form LinkedIn & complex strategic writing",
  },
];

export const IMAGE_MODEL_CONFIGS: ModelDescriptor[] = [
  {
    id: "gemini-3.1-flash-image",
    apiModelId: "gemini-3.1-flash-image",
    name: "Nano Banana 2",
    badge: "Primary",
    desc: "Fast, photorealistic commercial product imagery",
    isDefault: true,
  },
  {
    id: "gemini-3-pro-image",
    apiModelId: "gemini-3-pro-image",
    name: "Nano Banana Pro",
    badge: "Ultra Quality",
    desc: "Studio 8K fidelity & complex scene compositions",
  },
  {
    id: "gemini-3.1-flash-lite-image",
    apiModelId: "gemini-3.1-flash-lite-image",
    name: "Nano Banana 2 Lite",
    badge: "Fast & Efficient",
    desc: "Rapid social graphics & story mockups",
  },
];

export const SUPPORTED_ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 Square", width: 1080, height: 1080, desc: "Instagram & Facebook feed" },
  { id: "4:5", label: "4:5 Portrait", width: 1080, height: 1350, desc: "Instagram Carousel & Vertical feed" },
  { id: "9:16", label: "9:16 Vertical", width: 720, height: 1280, desc: "Reels, TikTok & Stories" },
  { id: "16:9", label: "16:9 Landscape", width: 1280, height: 720, desc: "LinkedIn & X banner" },
  { id: "2:3", label: "2:3 Pin", width: 1000, height: 1500, desc: "Pinterest Pin standard" },
  { id: "3:2", label: "3:2 Photo", width: 1500, height: 1000, desc: "Editorial photography" },
];

export function resolveGeminiTextModel(rawInput?: string): string {
  if (!rawInput) return GEMINI_MODELS.TEXT_FAST;
  const normalized = rawInput.trim().toLowerCase();

  if (normalized.includes("3.5") || normalized === "gemini-3.5-flash") {
    return "gemini-3.5-flash";
  }
  if (normalized.includes("3.7") || normalized === "gemini-3.7-flash") {
    return "gemini-3.7-flash";
  }
  if (normalized.includes("3.8") || normalized === "gemini-3.8-flash") {
    return "gemini-3.8-flash";
  }
  if (normalized.includes("latest") || normalized === "gemini-flash-latest") {
    return "gemini-flash-latest";
  }
  if (normalized.includes("lite") || normalized.includes("3.1-flash-lite")) {
    return "gemini-3.1-flash-lite";
  }
  if (normalized.includes("3.1") || normalized.includes("pro") || normalized === "gemini-3.1-pro-preview") {
    return "gemini-3.1-pro-preview";
  }

  return GEMINI_MODELS.TEXT_FAST;
}

export function resolveGeminiImageModel(rawInput?: string): string {
  if (!rawInput) return GEMINI_MODELS.IMAGE_PRIMARY;
  const normalized = rawInput.trim().toLowerCase();

  if (normalized.includes("pro") || normalized.includes("nano banana pro")) {
    return GEMINI_MODELS.IMAGE_PREMIUM;
  }
  if (normalized.includes("lite") || normalized.includes("nano banana 2 lite")) {
    return GEMINI_MODELS.IMAGE_FAST;
  }
  return GEMINI_MODELS.IMAGE_PRIMARY;
}
