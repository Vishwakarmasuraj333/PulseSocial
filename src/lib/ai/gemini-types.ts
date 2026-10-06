export type GeminiTextModelId =
  | "gemini-3.5-flash"
  | "gemini-3.7-flash"
  | "gemini-3.8-flash"
  | "gemini-flash-latest"
  | "gemini-3.1-flash-lite"
  | "gemini-3.1-pro-preview";

export type GeminiImageModelId =
  | "gemini-3.1-flash-image"
  | "gemini-3-pro-image"
  | "gemini-3.1-flash-lite-image";

export type GeminiTaskType =
  | "social-copy"
  | "suggestions"
  | "image"
  | "image-edit"
  | "prompt-enhance"
  | "image-to-caption"
  | "caption-to-image";

export interface SocialCopyRequest {
  prompt: string;
  brandName?: string;
  industry?: string;
  tone?: string;
  platform?: string;
  model?: string;
  includeHashtags?: boolean;
  includeFirstComment?: boolean;
  includeCta?: boolean;
  language?: string; // English | Hindi | Hinglish
  userId?: string;
  workspaceId?: string;
  apiKey?: string;
}

export interface UniversalVariants {
  instagram?: string;
  linkedin?: string;
  x?: string;
  facebook?: string;
  tiktok?: string;
  threads?: string;
}

export interface SocialCopyResponse {
  success: true;
  provider: "gemini";
  model: string;
  platform: string;
  tone: string;
  primaryCaption: string;
  hashtags: string[];
  firstComment?: string;
  cta?: string;
  alternatives: string[];
  universalVariants?: UniversalVariants;
  suggestions?: string[];
  imagePrompt?: string;
  title?: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  id?: string;
}

export interface GeminiSuggestionResponse {
  success: true;
  provider: "gemini";
  model: string;
  topic: string;
  hooks: string[];
  contentAngles: string[];
  ctaIdeas: string[];
  audienceAngles: string[];
  recommendedHashtags: string[];
  visualConcepts: string[];
  campaignIdea?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  model?: string;
  enhance?: boolean;
  brandName?: string;
  platform?: string;
  referenceImageBase64?: string;
  referenceImageMimeType?: string;
  userId?: string;
  workspaceId?: string;
  apiKey?: string;
}

export interface ImageGenerationResponse {
  success: true;
  provider: "gemini";
  imageUrl: string;
  prompt: string;
  enhancedPrompt?: string;
  aspectRatio: string;
  model: string;
  style: string;
  dimensions?: { width: number; height: number };
  createdAt: string;
  id?: string;
}

export interface ImageEditRequest {
  imageBase64: string;
  mimeType: string;
  instruction: string;
  aspectRatio?: string;
  model?: string;
  userId?: string;
  workspaceId?: string;
  apiKey?: string;
}

export interface PromptEnhanceRequest {
  prompt: string;
  style?: string;
  platform?: string;
  aspectRatio?: string;
  brandName?: string;
  apiKey?: string;
}

export interface PromptEnhanceResponse {
  success: true;
  provider: "gemini";
  enhancedPrompt: string;
  originalPrompt: string;
  details?: {
    subject?: string;
    composition?: string;
    lighting?: string;
    mood?: string;
    colorDirection?: string;
  };
}

export interface ImageToCaptionRequest {
  imageBase64: string;
  mimeType: string;
  platform?: string;
  tone?: string;
  brandName?: string;
  industry?: string;
  includeHashtags?: boolean;
  includeFirstComment?: boolean;
  language?: string;
  userId?: string;
  workspaceId?: string;
  apiKey?: string;
}

export interface GeminiApiError {
  success: false;
  provider: "gemini";
  error: string;
  message: string;
  statusCode?: number;
}
