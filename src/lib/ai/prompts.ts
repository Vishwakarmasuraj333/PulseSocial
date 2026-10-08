export * from "./gemini-prompts";
import {
  PostGeneratorRequest,
  ReplyAssistantRequest,
  ContentRepurposeRequest,
  ContentIdeasRequest,
  HashtagSuggestionsRequest,
  VisualPromptRequest,
  AnalyticsInsightsRequest,
  ContentRewriteRequest,
  ModerationSuggestionRequest,
} from "./types";
import { buildPlatformGuidelines, buildToneGuideline, SYSTEM_PERSONA_PROMPT } from "./gemini-prompts";

export function buildPostGeneratorPrompt(req: PostGeneratorRequest): string {
  const platform = req.platform || "Instagram";
  const platformRules = buildPlatformGuidelines(platform);
  const toneDesc = buildToneGuideline(req.tone || req.brandVoice?.tone || "Engaging & Viral");
  const lang = req.language || req.brandVoice?.preferredLanguage || "English";

  const voiceInstructions = req.brandVoice
    ? `BRAND VOICE GUIDELINES:
- Brand Name: ${req.brandVoice.name || req.brandName || "PulseSocial"}
- Industry: ${req.brandVoice.industry || "Technology"}
- Description: ${req.brandVoice.description || "N/A"}
- Target Audience: ${req.brandVoice.targetAudience || req.targetAudience || "N/A"}
- Preferred Writing Style: ${req.brandVoice.writingStyle || "Modern, Direct, Value-led"}
- Words/Phrases to Avoid: ${req.brandVoice.wordsToAvoid || "None"}
- Preferred CTA: ${req.brandVoice.preferredCta || req.cta || "N/A"}
- Emoji Preference: ${req.brandVoice.emojiPreference || "Tasteful, max 2-3"}
- Hashtag Preference: ${req.brandVoice.hashtagPreference || "Contextual only"}`
    : `BRAND CONTEXT:
- Brand Name: ${req.brandName || "PulseSocial"}
- Target Audience: ${req.targetAudience || "Audience interested in this topic"}`;

  const langDirective =
    lang === "Hinglish"
      ? `CRITICAL LANGUAGE REQUIREMENT: Output must be in natural, conversational HINGLISH (a modern blend of conversational Hindi written in the English/Latin alphabet with English terms, commonly used by Indian professionals and creators). Do NOT output Devanagari script, and do NOT use robotic pure Sanskritized Hindi.`
      : lang === "Hindi"
      ? `CRITICAL LANGUAGE REQUIREMENT: Output must be written in natural, fluent HINDI.`
      : `CRITICAL LANGUAGE REQUIREMENT: Output must be in clear, native ${lang}.`;

  return `${SYSTEM_PERSONA_PROMPT}

You are generating a publication-ready post for ${platform}.

${platformRules}

CONTENT DETAILS:
- Topic / Focus: ${req.topic}
- Content Type: ${req.contentType || "General Update"}
- Desired Tone: ${req.tone || "Engaging & Viral"} (${toneDesc})
- Target Call To Action: ${req.cta || "Engagement / Action oriented"}
${req.keywords && req.keywords.length ? `- Required Keywords: ${req.keywords.join(", ")}` : ""}
${req.referenceText ? `- Reference Material / Source Text: ${req.referenceText}` : ""}
${req.websiteInfo ? `- Product / Website Info: ${req.websiteInfo}` : ""}

${voiceInstructions}

${langDirective}

OUTPUT REQUIREMENTS:
Respond ONLY with a valid JSON object matching this schema:
{
  "caption": "The full optimized body caption including paragraphs and formatting",
  "hook": "The punchy opening first sentence or hook",
  "cta": "The specific closing call to action",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "platformNotes": ["Key algorithmic or formatting tip for this specific post"],
  "suggestedPostingTime": "Recommended day and peak hour for maximum reach",
  "imagePrompt": "A detailed commercial visual prompt that an image generation model can use to create a matching visual"
}`;
}

export function buildReplyAssistantPrompt(req: ReplyAssistantRequest): string {
  const lang = req.language || "English";
  const actionDirective = req.action
    ? `SPECIFIC ACTION: The user wants to '${req.action}' the response. Current draft if applicable: "${req.currentDraft || ""}". Target language if applicable: "${req.targetLanguage || lang}".`
    : "";

  return `${SYSTEM_PERSONA_PROMPT}

You are an expert social media community manager generating authentic replies to incoming user comments or messages.

INCOMING COMMENT / MESSAGE:
"${req.message}"

PLATFORM: ${req.platform || "Universal"}
${req.conversationContext ? `CONVERSATION CONTEXT: ${req.conversationContext}` : ""}
${req.brandPersonality ? `BRAND PERSONALITY: ${req.brandPersonality}` : "BRAND PERSONALITY: Helpful, authentic, prompt, respectful"}
${req.desiredTone ? `DESIRED TONE: ${req.desiredTone}` : ""}
LANGUAGE: ${lang}
${actionDirective}

RULES:
1. Never invent company facts, pricing, or promises that aren't provided.
2. If pricing is asked and unknown, warmly invite them to check the link in bio or share their requirements.
3. Keep answers human and conversational.

Respond ONLY with a valid JSON object matching this schema:
{
  "professional": "Polite, respectful, and corporate response",
  "friendly": "Warm, energetic, and engaging response",
  "short": "Brief, direct 1-sentence reply",
  "detailed": "Comprehensive, helpful explanation",
  "suggestedBest": "Recommended top response tailored to this exact message",
  "translation": "Translated response if targetLanguage was specified, else empty string"
}`;
}

export function buildContentRepurposePrompt(req: ContentRepurposeRequest): string {
  return `${SYSTEM_PERSONA_PROMPT}

You are a world-class content repurposing specialist.
Take this ONE original piece of content and independently adapt it into native, high-performing formats for 8 distinct platforms.
Do NOT simply copy-paste the same caption across channels. Each platform has distinct algorithms and consumption habits.

ORIGINAL CONTENT:
"""
${req.originalContent}
"""

BRAND NAME: ${req.brandName || "PulseSocial"}
DESIRED TONE: ${req.tone || "Authentic & Engaging"}
LANGUAGE: ${req.language || "English"}

Respond ONLY with a valid JSON object matching this schema:
{
  "linkedin": {
    "caption": "Thought leadership format with spacing and professional hook",
    "notes": "Formatting advice for LinkedIn"
  },
  "facebook": {
    "caption": "Relatable community post prompting discussion",
    "notes": "Facebook optimization tip"
  },
  "instagram": {
    "caption": "Engaging visual-first story caption",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "notes": "Carousel or Reel advice"
  },
  "x": {
    "tweet": "Punchy post under 280 characters with hashtags",
    "thread": ["Follow-up tweet 1", "Follow-up tweet 2"],
    "notes": "Thread timing advice"
  },
  "threads": {
    "caption": "Conversational micro-post",
    "notes": "Threads interaction tip"
  },
  "tiktok": {
    "caption": "Short caption with search keywords",
    "hook": "On-screen 2-second visual hook",
    "soundIdea": "Recommended audio vibe or pacing"
  },
  "youtube": {
    "title": "High-CTR search optimized title under 70 chars",
    "description": "Structured description with summary and call to action",
    "tags": ["tag1", "tag2", "tag3"]
  },
  "pinterest": {
    "pinTitle": "Searchable Pin title",
    "description": "Aesthetic keyword-rich Pin description",
    "boardIdea": "Suggested board category"
  }
}`;
}

export function buildContentIdeasPrompt(req: ContentIdeasRequest): string {
  const count = Math.min(Math.max(req.numberOfIdeas || 5, 1), 10);

  return `${SYSTEM_PERSONA_PROMPT}

Generate ${count} realistic, high-converting social media content ideas for the specified brand and platform.

BRAND: ${req.brand}
INDUSTRY: ${req.industry}
TARGET AUDIENCE: ${req.audience}
PLATFORM: ${req.platform}
GOAL: ${req.goal || "Audience engagement & brand growth"}

RULES:
- Ideas must be tangible, practical, and executable.
- Avoid vague advice like "Post a quote". Give exact hooks and creative angles.

Respond ONLY with a valid JSON object matching this schema:
{
  "ideas": [
    {
      "title": "Clear concept title",
      "hook": "The exact opening line or on-screen hook",
      "contentAngle": "Unique angle or core takeaway",
      "platform": "${req.platform}",
      "format": "e.g. Carousel, Short-form Reel, Single Image, Poll, Text Post",
      "cta": "Engaging call to action",
      "visualIdea": "Detailed description of the visual or video frame"
    }
  ]
}`;
}

export function buildHashtagSuggestionsPrompt(req: HashtagSuggestionsRequest): string {
  return `${SYSTEM_PERSONA_PROMPT}

You are a social media search and discovery algorithm expert.
Generate targeted, platform-specific hashtags for the topic below.
Do NOT generate generic spam tags (like #love, #instagood, #viral).
Focus on relevant categorization, niche reach, and discovery intent.

TOPIC: ${req.topic}
${req.context ? `CONTEXT: ${req.context}` : ""}
PLATFORM: ${req.platform || "Instagram"}
BRAND: ${req.brand || "PulseSocial"}

Respond ONLY with a valid JSON object matching this schema:
{
  "primary": ["#CoreTopicTag1", "#CoreTopicTag2", "#CoreTopicTag3"],
  "secondary": ["#SpecificSubtopicTag1", "#SpecificSubtopicTag2", "#SpecificSubtopicTag3"],
  "niche": ["#MicroCommunityTag1", "#MicroCommunityTag2", "#MicroCommunityTag3"],
  "branded": ["#BrandTag1", "#CampaignTag2"]
}`;
}

export function buildVisualPromptPrompt(req: VisualPromptRequest): string {
  return `${SYSTEM_PERSONA_PROMPT}

You are a premier commercial prompt engineer specializing in commercial photorealistic imagery.
Turn the user's idea into an exquisite, professional visual prompt ready for image models.

CONCEPT: ${req.prompt}
${req.brand ? `BRAND: ${req.brand}` : ""}
${req.product ? `PRODUCT: ${req.product}` : ""}
PLATFORM: ${req.platform || "Instagram"}
TARGET AUDIENCE: ${req.audience || "General"}
PREFERRED STYLE: ${req.style || "Commercial 8K"}
ASPECT RATIO: ${req.aspectRatio || "1:1"}

RULES:
- DO NOT put complex or unnecessary typography / written text inside the image.
- Specify camera gear, lighting, color grading, depth of field, and compositional framing.

Respond ONLY with a valid JSON object matching this schema:
{
  "prompt": "Comprehensive descriptive visual prompt under 80 words",
  "aspectRatio": "${req.aspectRatio || "1:1"}",
  "negativePrompt": "blurry, distorted, amateur, low quality, warped text, watermarks",
  "visualStyle": "${req.style || "Commercial 8K"}",
  "composition": "Camera angle, lighting setup, and focal positioning"
}`;
}

export function buildAnalyticsInsightsPrompt(req: AnalyticsInsightsRequest, realMetrics: any): string {
  const hasData = Boolean(
    realMetrics &&
    (realMetrics.totalPosts > 0 || realMetrics.followers > 0 || realMetrics.reach > 0)
  );

  return `${SYSTEM_PERSONA_PROMPT}

You are an executive Chief Social Strategist.
Analyze REAL account metrics provided below.

CRITICAL INTEGRITY INSTRUCTION:
- Never fabricate numbers or assume imaginary metrics.
- Clearly differentiate between REAL DATA and AI STRATEGIC INTERPRETATION.
- If data is sparse or empty, state: "Not enough data available to make a reliable conclusion."

REAL METRIC DATA:
${JSON.stringify(realMetrics, null, 2)}

USER QUESTION (IF ANY):
"${req.question || "What are our performance insights and recommendations for next week?"}"

Respond ONLY with a valid JSON object matching this schema:
{
  "hasSufficientData": ${hasData},
  "insufficientDataReason": "${hasData ? "" : "Insufficient historical posts or engagement data found in the workspace."}",
  "whatIsWorking": ["Working point 1", "Working point 2"],
  "whatIsUnderperforming": ["Underperforming area 1"],
  "contentOpportunities": ["Opportunity 1", "Opportunity 2"],
  "platformRecommendations": ["Recommendation for platform 1"],
  "contentThemes": ["Theme 1", "Theme 2"],
  "nextWeekRecommendations": ["Action 1", "Action 2", "Action 3"],
  "answerToUser": "Direct, data-backed answer to the user's specific question."
}`;
}
