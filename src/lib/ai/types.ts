import { z } from "zod";

// ==========================================
// 1. Post Generator Types & Schema
// ==========================================
export const PostGeneratorSchema = z.object({
  caption: z.string().describe("The full optimized post caption"),
  hook: z.string().describe("The high-converting first line or hook"),
  cta: z.string().describe("Direct call to action"),
  hashtags: z.array(z.string()).describe("Relevant platform-optimized hashtags"),
  platformNotes: z.array(z.string()).describe("Best practice tips for this platform"),
  suggestedPostingTime: z.string().describe("Optimal publishing time window"),
  imagePrompt: z.string().describe("High-definition prompt for image generation"),
});

export type PostGeneratorResponse = z.infer<typeof PostGeneratorSchema>;

export interface PostGeneratorRequest {
  platform:
    | "LinkedIn"
    | "Facebook"
    | "Instagram"
    | "X"
    | "Threads"
    | "TikTok"
    | "YouTube"
    | "Pinterest"
    | string;
  contentType:
    | "Promotional"
    | "Educational"
    | "Announcement"
    | "Product launch"
    | "Engagement"
    | "Storytelling"
    | "Community"
    | "Event"
    | "Hiring"
    | "Brand awareness"
    | "Custom"
    | string;
  topic: string;
  brandName?: string;
  brandVoice?: {
    name?: string;
    description?: string;
    industry?: string;
    targetAudience?: string;
    tone?: string;
    writingStyle?: string;
    preferredLanguage?: string;
    wordsToAvoid?: string;
    preferredCta?: string;
    emojiPreference?: string;
    hashtagPreference?: string;
  };
  targetAudience?: string;
  tone?: string;
  language?: "English" | "Hindi" | "Hinglish" | string;
  cta?: string;
  keywords?: string[];
  referenceText?: string;
  websiteInfo?: string;
  model?: string;
  userId?: string;
  workspaceId?: string;
}

// ==========================================
// 2. Reply Assistant Types & Schema
// ==========================================
export const ReplyAssistantSchema = z.object({
  professional: z.string().describe("Polite, respectful, and corporate response"),
  friendly: z.string().describe("Warm, energetic, and engaging response"),
  short: z.string().describe("Brief, direct 1-sentence reply"),
  detailed: z.string().describe("Comprehensive, helpful explanation"),
  suggestedBest: z.string().describe("Recommended top response based on context"),
  translation: z.string().optional().describe("Translated response if requested"),
});

export type ReplyAssistantResponse = z.infer<typeof ReplyAssistantSchema>;

export interface ReplyAssistantRequest {
  message: string;
  platform?: string;
  conversationContext?: string;
  desiredTone?: string;
  brandPersonality?: string;
  language?: string;
  action?: "generate" | "shorten" | "expand" | "professional" | "friendly" | "translate";
  targetLanguage?: string;
  currentDraft?: string;
  userId?: string;
  workspaceId?: string;
}

// ==========================================
// 3. Content Repurpose Types & Schema
// ==========================================
export const ContentRepurposeSchema = z.object({
  linkedin: z.object({
    caption: z.string(),
    notes: z.string(),
  }),
  facebook: z.object({
    caption: z.string(),
    notes: z.string(),
  }),
  instagram: z.object({
    caption: z.string(),
    hashtags: z.array(z.string()),
    notes: z.string(),
  }),
  x: z.object({
    tweet: z.string(),
    thread: z.array(z.string()).optional(),
    notes: z.string(),
  }),
  threads: z.object({
    caption: z.string(),
    notes: z.string(),
  }),
  tiktok: z.object({
    caption: z.string(),
    hook: z.string(),
    soundIdea: z.string().optional(),
  }),
  youtube: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
  pinterest: z.object({
    pinTitle: z.string(),
    description: z.string(),
    boardIdea: z.string(),
  }),
});

export type ContentRepurposeResponse = z.infer<typeof ContentRepurposeSchema>;

export interface ContentRepurposeRequest {
  originalContent: string;
  brandName?: string;
  sourcePlatform?: string;
  tone?: string;
  language?: string;
  userId?: string;
  workspaceId?: string;
}

// ==========================================
// 4. Content Ideas Types & Schema
// ==========================================
export const ContentIdeaItemSchema = z.object({
  title: z.string(),
  hook: z.string(),
  contentAngle: z.string(),
  platform: z.string(),
  format: z.string(),
  cta: z.string(),
  visualIdea: z.string(),
});

export const ContentIdeasSchema = z.object({
  ideas: z.array(ContentIdeaItemSchema),
});

export type ContentIdeaItem = z.infer<typeof ContentIdeaItemSchema>;
export type ContentIdeasResponse = z.infer<typeof ContentIdeasSchema>;

export interface ContentIdeasRequest {
  brand: string;
  industry: string;
  audience: string;
  platform: string;
  numberOfIdeas?: number;
  goal?: string;
  userId?: string;
  workspaceId?: string;
}

// ==========================================
// 5. Hashtag Suggestions Types & Schema
// ==========================================
export const HashtagSuggestionsSchema = z.object({
  primary: z.array(z.string()).describe("High-volume, core topic hashtags"),
  secondary: z.array(z.string()).describe("Medium-volume, specific contextual tags"),
  niche: z.array(z.string()).describe("Targeted community or micro-niche tags"),
  branded: z.array(z.string()).describe("Brand and campaign identity tags"),
});

export type HashtagSuggestionsResponse = z.infer<typeof HashtagSuggestionsSchema>;

export interface HashtagSuggestionsRequest {
  topic: string;
  context?: string;
  platform?: string;
  brand?: string;
  userId?: string;
  workspaceId?: string;
}

// ==========================================
// 6. Visual Prompt Types & Schema
// ==========================================
export const VisualPromptSchema = z.object({
  prompt: z.string().describe("Descriptive visual prompt with lighting, scene, composition"),
  aspectRatio: z.string().describe("Target aspect ratio e.g. 1:1, 4:5, 9:16, 16:9"),
  negativePrompt: z.string().describe("Things to avoid e.g. text artifacts, blurry"),
  visualStyle: z.string().describe("Commercial 8K, Minimalist, 3D Octane, Cinematic"),
  composition: z.string().describe("Framing, camera angle, and subject placement"),
});

export type VisualPromptResponse = z.infer<typeof VisualPromptSchema> & {
  generatedImageUrl?: string;
  isGenerated: boolean;
  providerNotice?: string;
};

export interface VisualPromptRequest {
  prompt: string;
  brand?: string;
  product?: string;
  platform?: string;
  audience?: string;
  style?: string;
  aspectRatio?: "1:1" | "4:5" | "9:16" | "16:9" | string;
  userId?: string;
  workspaceId?: string;
}

// ==========================================
// 7. Social Strategy & Analytics Insights
// ==========================================
export const AnalyticsInsightsSchema = z.object({
  hasSufficientData: z.boolean(),
  insufficientDataReason: z.string().optional(),
  whatIsWorking: z.array(z.string()),
  whatIsUnderperforming: z.array(z.string()),
  contentOpportunities: z.array(z.string()),
  platformRecommendations: z.array(z.string()),
  contentThemes: z.array(z.string()),
  nextWeekRecommendations: z.array(z.string()),
  answerToUser: z.string().optional(),
});

export type AnalyticsInsightsResponse = z.infer<typeof AnalyticsInsightsSchema> & {
  realDataSummary: {
    totalPosts: number;
    followers: number;
    reach: number;
    engagementRate: number;
    topPlatform: string;
  };
};

export interface AnalyticsInsightsRequest {
  timeframe: string;
  question?: string;
  userId?: string;
  workspaceId?: string;
}

// ==========================================
// 8. Content Rewrite Types & Schema
// ==========================================
export const ContentRewriteSchema = z.object({
  rewrittenText: z.string(),
  hook: z.string(),
  keyChanges: z.array(z.string()),
  readingTimeSeconds: z.number().optional(),
});

export type ContentRewriteResponse = z.infer<typeof ContentRewriteSchema>;

export interface ContentRewriteRequest {
  content: string;
  action: "shorten" | "expand" | "professional" | "friendly" | "viral_hook" | "translate" | "hinglish";
  targetLanguage?: string;
  platform?: string;
  userId?: string;
  workspaceId?: string;
}

// ==========================================
// 9. Moderation Suggestion Types & Schema
// ==========================================
export const ModerationSuggestionSchema = z.object({
  isFlagged: z.boolean(),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE", "TOXIC"]),
  category: z.string(),
  reason: z.string(),
  recommendedAction: z.enum(["APPROVE", "FLAG", "HIDE", "ESCALATE", "REPLY"]),
  suggestedActionNote: z.string(),
});

export type ModerationSuggestionResponse = z.infer<typeof ModerationSuggestionSchema>;

export interface ModerationSuggestionRequest {
  content: string;
  platform?: string;
  userId?: string;
  workspaceId?: string;
}
