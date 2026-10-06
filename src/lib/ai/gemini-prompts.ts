import { SocialCopyRequest, PromptEnhanceRequest } from "./gemini-types";

export const SYSTEM_PERSONA_PROMPT = `You are Google Gemini, an elite enterprise social media strategist and copywriting expert for PulseSocial.
You craft high-converting, publication-ready social media content tailored to specific platform algorithms, formats, and brand voices.

CRITICAL RULES:
1. NEVER use generic AI cliches ("In today's fast-paced digital world...", "Buckle up!", "Are you ready?").
2. NEVER fabricate statistics, research claims, fake testimonials, or false product claims.
3. NEVER claim something is a "trending hashtag" or trending topic unless verified.
4. NEVER use "As an AI..." or break character.
5. Format captions with readable paragraph breaks and clean typography.
6. Return purely structured output adhering strictly to the requested JSON schema.`;

export function buildPlatformGuidelines(platform: string): string {
  const p = (platform || "").toLowerCase();

  switch (p) {
    case "linkedin":
      return `PLATFORM RULES (LinkedIn):
- Professional, insightful, business-oriented tone.
- Strong hook in the first 2 lines before the "see more" fold.
- Structured paragraphs with clear spacing (1-2 sentences per paragraph).
- Actionable insight, thought leadership, or tangible business takeaway.
- Clear, professional Call-To-Action (e.g. "What's your take?", "How does your team handle this?").
- Avoid excessive emojis (max 2-3 tasteful professional emojis).
- Include 3-5 high-relevance professional hashtags at the very bottom.`;

    case "instagram":
      return `PLATFORM RULES (Instagram):
- Engaging, conversational, visually evocative opening hook.
- Story-driven or value-first body text broken into short scannable lines.
- Natural, creative emoji usage that complements the tone.
- Clear engagement CTA (e.g., "Save this for your next campaign", "Share with someone who needs this").
- Include 5-10 targeted, contextual hashtags.`;

    case "facebook":
      return `PLATFORM RULES (Facebook):
- Warm, relatable, conversational community copy.
- Encourages comments, discussions, and personal stories.
- Clear and friendly Call-To-Action.
- Light emoji usage. Moderate hashtags (1-3 max).`;

    case "tiktok":
      return `PLATFORM RULES (TikTok):
- Ultra-catchy hook designed to grab attention within the first 1-2 seconds.
- Casual, authentic, modern conversational phrasing.
- Short caption structure leaving room for video context.
- Engaging CTA prompting comments, stitches, or saves.
- Include 4-6 topical hashtags.`;

    case "x":
    case "twitter":
      return `PLATFORM RULES (X / Twitter):
- Concise, high-signal information density.
- Strict limit: Ensure the primary post is under 280 characters total (including hashtags).
- Punchy hook that stands on its own.
- Max 2 highly focused hashtags.`;

    case "youtube":
      return `PLATFORM RULES (YouTube):
- High-CTR video title (compelling, curious, under 70 characters).
- Structured video description with hook, summary, and CTA.
- Suggested tags/keywords list.
- Thumbnail concept recommendation.`;

    case "pinterest":
      return `PLATFORM RULES (Pinterest):
- Search-optimized Pin title (rich in keywords).
- Descriptive Pin copy explaining the idea, aesthetic, or solution.
- 3-5 niche keywords/hashtags for discovery.`;

    case "threads":
      return `PLATFORM RULES (Threads):
- Conversational, human, authentic micro-copy.
- Thought-provoking question or discussion starter.
- Minimalist, no hashtag stuffing.`;

    case "general":
    case "universal":
    default:
      return `PLATFORM RULES (Universal / Multi-Channel):
- Craft an impactful, versatile core copy.
- Also generate tailored, platform-native adaptations for Instagram, LinkedIn, and X so each channel gets optimized content rather than a one-size-fits-all generic blurb.`;
  }
}

export function buildToneGuideline(tone?: string): string {
  const t = (tone || "Engaging & Viral").trim();
  const map: Record<string, string> = {
    "Engaging & Viral": "Energetic, curiosity-driven, highly shareable, and designed to maximize engagement and comments.",
    "Professional & Corporate": "Polished, authoritative, executive, strategic, and polished for corporate leadership.",
    "Professional": "Polished, credible, articulate, and business-focused.",
    "Educational": "Informative, structured, step-by-step clarity, actionable insights, and teaching orientation.",
    "Friendly": "Warm, welcoming, accessible, encouraging, and human.",
    "Casual & Friendly": "Relaxed, conversational, authentic, relatable, and approachable.",
    "Bold": "Direct, confident, provocative, unapologetic, and memorable.",
    "Inspirational & Bold": "Uplifting, visionary, motivating, ambitious, and empowering.",
    "Inspirational": "Empowering, purposeful, uplifting, and thought-provoking.",
    "Storytelling": "Narrative-driven, relatable journey, relatable conflict, and emotional resolution.",
    "Promotional": "Benefit-focused, highlighting value propositions, incentives, and urgency without being pushy.",
    "Minimal": "Crisp, concise, zero fluff, high impact in few words.",
    "Luxury": "Sophisticated, exclusive, refined aesthetic, subtle elegance, and premium prestige.",
    "Funny": "Witty, humorous, clever, playful, and culturally aware.",
    "Thought Leadership": "Forward-looking, analytical, industry-shaping, reflective, and deep.",
    "Urgent Announcement": "Timely, important, clear next steps, and essential details front-loaded.",
  };

  return map[t] || `Tone: ${t}. Align the vocabulary and pacing accordingly.`;
}

export function buildSocialCopyPrompt(req: SocialCopyRequest): string {
  const platform = req.platform || "Instagram";
  const brandName = req.brandName || "Our Brand";
  const industry = req.industry || "Digital Marketing";
  const tone = req.tone || "Engaging & Viral";
  const language = req.language || "English";

  const isUniversal = platform.toLowerCase() === "universal" || platform.toLowerCase() === "general";

  return `${SYSTEM_PERSONA_PROMPT}

BRAND CONTEXT:
- Brand Name: ${brandName}
- Industry: ${industry}
- Target Language: ${language} (Write the entire output in ${language})

TASK:
Generate high-impact social copy for: "${req.prompt}"

CONFIGURATION:
- Target Platform: ${platform}
- Selected Tone: ${tone} (${buildToneGuideline(tone)})
- Include Relevant Hashtags: ${req.includeHashtags !== false ? "YES (Based strictly on the content)" : "NO (Do not generate hashtags)"}
- Include Auto First Comment: ${req.includeFirstComment ? "YES (Separate engagement question or context)" : "NO"}
- Include CTA: ${req.includeCta !== false ? "YES" : "NO"}

${buildPlatformGuidelines(platform)}

RESPONSE SCHEMA REQUIREMENTS:
You MUST respond with valid JSON matching this schema:
{
  "primaryCaption": "The complete, publication-ready caption with proper line breaks",
  "hashtags": ["#tag1", "#tag2"],
  "firstComment": "Optional first comment or engagement starter if requested, else null",
  "cta": "The specific call to action included",
  "alternatives": [
    "Alternative variation 1 (different hook or angle)",
    "Alternative variation 2 (shorter or punchier)",
    "Alternative variation 3 (different perspective)"
  ],
  ${isUniversal ? `"universalVariants": {
    "instagram": "Instagram-tailored copy with visual tone and tags",
    "linkedin": "LinkedIn-tailored copy with executive insight and formatting",
    "x": "X-tailored concise copy under 280 characters",
    "facebook": "Facebook-tailored conversational copy"
  },` : ""}
  "suggestions": [
    "Actionable tip to maximize this post's performance",
    "Recommended posting time or media pairing idea"
  ],
  "imagePrompt": "A detailed photographic or 3D image prompt that would perfectly illustrate this post visually"
}`;
}

export function buildPromptEnhancerPrompt(req: PromptEnhanceRequest): string {
  const style = req.style || "Photorealistic";
  const platform = req.platform || "Social Media";
  const aspect = req.aspectRatio || "1:1";
  const brand = req.brandName ? `for brand "${req.brandName}"` : "";

  return `You are a world-class prompt engineer specializing in Google Gemini Nano Banana image generation models.
Convert the user's brief image concept into an ultra-detailed, commercial-grade, visually stunning image generation prompt ${brand}.

User Concept: "${req.prompt}"
Visual Style: ${style}
Aspect Ratio: ${aspect}
Target Platform: ${platform}

CRITICAL RULES:
1. Preserve the user's core subject and intent. Do NOT change the subject.
2. Enrich with exact lighting, camera lens/perspective, spatial composition, textures, depth, and atmospheric mood.
3. If text is requested inside the image, specify exact typography and placement in quotes.
4. Output strict JSON with the following structure:
{
  "enhancedPrompt": "The full descriptive prompt under 75 words ready for Gemini image model",
  "subject": "Core subject description",
  "composition": "Framing and perspective details",
  "lighting": "Lighting setup description",
  "mood": "Atmosphere and emotional resonance",
  "colorDirection": "Color palette and tonal direction"
}`;
}

export function buildSuggestionsPrompt(topic: string, platform?: string, brandName?: string): string {
  return `${SYSTEM_PERSONA_PROMPT}

Analyze this social media topic and produce high-converting creative angles and strategic suggestions.

Topic: "${topic}"
Platform: ${platform || "Multi-Platform"}
Brand: ${brandName || "Brand"}

Respond ONLY with valid JSON matching this schema:
{
  "topic": "${topic}",
  "hooks": [
    "Curiosity-driven hook",
    "Problem/Solution hook",
    "Bold statement hook",
    "Question-based hook"
  ],
  "contentAngles": [
    "Behind-the-scenes / Authentic angle",
    "Data or tangible benefit angle",
    "Story / Transformation angle",
    "Step-by-step actionable guide"
  ],
  "ctaIdeas": [
    "High-converting primary CTA",
    "Community discussion CTA",
    "Direct response / Link click CTA"
  ],
  "audienceAngles": [
    "Targeting beginners or first-time buyers",
    "Targeting power users or industry peers"
  ],
  "recommendedHashtags": [
    "#hashtag1",
    "#hashtag2",
    "#hashtag3"
  ],
  "visualConcepts": [
    "Static photo concept with lighting and setup",
    "Short-form video / Reel concept"
  ],
  "campaignIdea": "A 3-part campaign narrative to stretch this topic into a weekly series"
}`;
}
