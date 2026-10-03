// PulseSocial — Social Media Platform Rules, Regulations & Character Limits

export interface PlatformRule {
  id: string;
  name: string;
  maxChars: number;
  recommendedMaxChars: number;
  maxHashtags: number;
  recommendedHashtags: number;
  hashtagPlacement: "bottom" | "first_comment" | "inline" | "any";
  idealHookLength: number;
  aspectRatios: string[];
  rules: string[];
  formattingGuideline: string;
}

export const PLATFORM_RULES: Record<string, PlatformRule> = {
  x: {
    id: "x",
    name: "X (Twitter)",
    maxChars: 280,
    recommendedMaxChars: 240,
    maxHashtags: 3,
    recommendedHashtags: 2,
    hashtagPlacement: "inline",
    idealHookLength: 40,
    aspectRatios: ["16:9", "1:1"],
    rules: [
      "Strict 280 character limit per individual post.",
      "Limit hashtags to 1-2 hyper-relevant tags (algorithm penalizes 4+ hashtags).",
      "Hook must be delivered in the first 40 characters before scroll-away.",
      "Clear call to action or link at the end.",
      "Use numbered format (1/n) if spanning multiple thread tweets.",
    ],
    formattingGuideline: "Ultra-concise, conversational, zero fluff, sharp single-thought focus.",
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    maxChars: 2200,
    recommendedMaxChars: 450,
    maxHashtags: 30,
    recommendedHashtags: 8,
    hashtagPlacement: "first_comment",
    idealHookLength: 125,
    aspectRatios: ["1:1", "4:5", "9:16"],
    rules: [
      "2,200 character cap; top 125 characters appear before the '...more' truncation.",
      "Optimal 5-10 targeted niche hashtags rather than generic saturated tags.",
      "Place hashtags separated by line breaks or in the strategic first comment.",
      "Clean paragraph spacing with emojis as visual bullet points.",
      "Encourage saves and shares with high-value swipeable tips.",
    ],
    formattingGuideline: "Aesthetic formatting, double line breaks, visually inviting layout.",
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    maxChars: 3000,
    recommendedMaxChars: 1200,
    maxHashtags: 5,
    recommendedHashtags: 3,
    hashtagPlacement: "bottom",
    idealHookLength: 150,
    aspectRatios: ["1:1", "16:9", "4:5"],
    rules: [
      "3,000 character cap; first 3 lines (150 chars) determine 'see more' click-through.",
      "3-5 professional industry hashtags at the bottom.",
      "Generous whitespace between 1-2 sentence paragraphs for mobile scannability.",
      "Focus on lessons learned, business insights, or thought leadership.",
      "End with an engaging open-ended question to foster genuine comments.",
    ],
    formattingGuideline: "Structured thought leadership, skimmable paragraphs, business value.",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    maxChars: 63206,
    recommendedMaxChars: 350,
    maxHashtags: 5,
    recommendedHashtags: 2,
    hashtagPlacement: "bottom",
    idealHookLength: 100,
    aspectRatios: ["1:1", "16:9"],
    rules: [
      "Massive 63,206 character limit, but 100-250 characters achieve peak engagement.",
      "Keep hashtags minimal (1-2 max); algorithm prioritizes organic discussion.",
      "Foster community discussion with questions and relatable everyday angles.",
      "Embed multimedia or video visual whenever possible.",
    ],
    formattingGuideline: "Friendly, community-first, conversational storytelling.",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    maxChars: 4000,
    recommendedMaxChars: 200,
    maxHashtags: 10,
    recommendedHashtags: 5,
    hashtagPlacement: "bottom",
    idealHookLength: 60,
    aspectRatios: ["9:16"],
    rules: [
      "4,000 character description cap, but concise 150-char captions trend higher.",
      "Include a mix of high-volume tags (#FYP, #Trending) and specific niche tags.",
      "Hook the audience visually and audibly in the first 2 seconds.",
      "Strong call to action to check comments or follow for part 2.",
    ],
    formattingGuideline: "Trendy, energetic, audio/visual synchronized text.",
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    maxChars: 5000,
    recommendedMaxChars: 1000,
    maxHashtags: 15,
    recommendedHashtags: 3,
    hashtagPlacement: "bottom",
    idealHookLength: 100,
    aspectRatios: ["16:9", "9:16"],
    rules: [
      "5,000 character description limit.",
      "First 2 lines appear in search results before truncation.",
      "Include clear video timestamps/chapters.",
      "Include 3 primary hashtags displayed above the title on YouTube.",
      "Clear call to subscribe and external resource links.",
    ],
    formattingGuideline: "Search-engine optimized, structured chapters, clear links.",
  },
  threads: {
    id: "threads",
    name: "Threads",
    maxChars: 500,
    recommendedMaxChars: 300,
    maxHashtags: 1,
    recommendedHashtags: 1,
    hashtagPlacement: "inline",
    idealHookLength: 80,
    aspectRatios: ["1:1", "4:5", "16:9"],
    rules: [
      "Strict 500 character limit per thread post.",
      "Single topic tag support (no hashtag spam).",
      "Casual, text-first, authentic voice without heavy sales pitches.",
    ],
    formattingGuideline: "Unfiltered, conversational, community banter.",
  },
  pinterest: {
    id: "pinterest",
    name: "Pinterest",
    maxChars: 500,
    recommendedMaxChars: 250,
    maxHashtags: 5,
    recommendedHashtags: 3,
    hashtagPlacement: "bottom",
    idealHookLength: 60,
    aspectRatios: ["9:16", "4:5"],
    rules: [
      "500 character pin description limit.",
      "Search-engine rich keywords for high-intent DIY, lifestyle, or shopping queries.",
      "Direct link to target landing page or product pin.",
    ],
    formattingGuideline: "Keyword-packed descriptive guide with direct shopping intent.",
  },
};

export function getPlatformRule(platformName: string): PlatformRule {
  const norm = platformName.toLowerCase();
  if (norm.includes("x") || norm.includes("twitter")) return PLATFORM_RULES.x;
  if (norm.includes("insta")) return PLATFORM_RULES.instagram;
  if (norm.includes("link")) return PLATFORM_RULES.linkedin;
  if (norm.includes("face")) return PLATFORM_RULES.facebook;
  if (norm.includes("tik")) return PLATFORM_RULES.tiktok;
  if (norm.includes("you") || norm.includes("yt")) return PLATFORM_RULES.youtube;
  if (norm.includes("thread")) return PLATFORM_RULES.threads;
  if (norm.includes("pin")) return PLATFORM_RULES.pinterest;
  return PLATFORM_RULES.instagram;
}

export function validateContentRules(
  caption: string,
  platformName: string,
  hashtags: string[] = []
): {
  isCompliant: boolean;
  charCount: number;
  maxChars: number;
  charRemaining: number;
  hashtagCount: number;
  maxHashtags: number;
  warnings: string[];
  hookScore: number;
} {
  const rule = getPlatformRule(platformName);
  const charCount = caption.length;
  const isOverChar = charCount > rule.maxChars;
  const hashtagCount = hashtags.length;
  const isOverHashtags = hashtagCount > rule.maxHashtags;

  const warnings: string[] = [];
  if (isOverChar) {
    warnings.push(`Exceeds ${rule.name} limit by ${charCount - rule.maxChars} characters (Max: ${rule.maxChars}).`);
  }
  if (isOverHashtags) {
    warnings.push(`Too many hashtags for ${rule.name} (${hashtagCount}/${rule.maxHashtags} max).`);
  }

  // Hook evaluation
  const firstLine = caption.split("\n")[0] || "";
  let hookScore = 80;
  if (firstLine.length > 10 && firstLine.length <= rule.idealHookLength) {
    hookScore += 15;
  }
  if (/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/u.test(firstLine)) {
    hookScore += 5; // Emoji bonus
  }
  if (isOverChar) {
    hookScore -= 40;
  }

  return {
    isCompliant: !isOverChar && !isOverHashtags,
    charCount,
    maxChars: rule.maxChars,
    charRemaining: rule.maxChars - charCount,
    hashtagCount,
    maxHashtags: rule.maxHashtags,
    warnings,
    hookScore: Math.max(10, Math.min(100, hookScore)),
  };
}
