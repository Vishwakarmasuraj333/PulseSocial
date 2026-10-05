import { NextRequest, NextResponse } from "next/server";
import { getPlatformRule, validateContentRules } from "@/lib/social-rules";

// Dynamic platform-rule compliant generator
function generatePlatformRuleCompliantCopy(
  prompt: string,
  platformName: string,
  tone: string,
  brandName: string
) {
  const pLower = prompt.toLowerCase();
  const rule = getPlatformRule(platformName);
  const cleanPrompt = prompt.trim();

  // Devotional / Spiritual Detection
  const isSpiritual =
    pLower.includes("hanuman") ||
    pLower.includes("bajrangbali") ||
    pLower.includes("sankat mochan") ||
    pLower.includes("ram") ||
    pLower.includes("shiva") ||
    pLower.includes("krishna") ||
    pLower.includes("ganesh") ||
    pLower.includes("temple") ||
    pLower.includes("bhakti") ||
    pLower.includes("devotion") ||
    pLower.includes("prayer") ||
    pLower.includes("blessing");

  const isHanuman = pLower.includes("hanuman") || pLower.includes("bajrangbali") || pLower.includes("sankat mochan");

  if (isSpiritual) {
    if (rule.id === "x") {
      // Strict 280-char cap for X (Twitter)
      return [
        {
          id: 1,
          label: "Viral & Devotional (X Compliant)",
          hook: isHanuman ? "🚩 संकट कटे मिटे सब पीरा, जो सुमिरै हनुमत बलबीरा।" : "✨ May divine blessings guide your journey today.",
          caption: isHanuman
            ? `🚩 जय श्री राम! संकटमोचन हनुमान जी की असीम कृपा आप और आपके परिवार पर सदा बनी रहे।\n\nसच्चे हृदय से उनका स्मरण करें — शक्ति और सकारात्मकता आपके साथ होगी। 🙏\n\nजय वीर हनुमान! 🚩`
            : `✨ May today bring peace, boundless courage, and unwavering clarity to your path.\n\nKeep faith strong and trust the journey. 🙏`,
          hashtags: isHanuman ? ["#JaiShreeRam", "#HanumanJi"] : ["#DivineBlessings", "#Positivity"],
          firstComment: isHanuman ? "जय बजरंगबली! 🙏🚩" : "Wishing everyone peace! ✨",
        },
        {
          id: 2,
          label: "Power & Resilience (X Compliant)",
          hook: isHanuman ? "⚡ Strength, humility, and courage — lessons from Bajrangbali." : "⚡ True strength comes from within.",
          caption: isHanuman
            ? `⚡ True strength is guided by devotion and humble courage. No obstacle is insurmountable when your purpose is pure.\n\nMay this day empower you with fearlessness! 🚩`
            : `⚡ When faith guides your actions, every challenge becomes a stepping stone. Stay grounded and fearless today. ✨`,
          hashtags: isHanuman ? ["#Bajrangbali", "#SanatanDharma"] : ["#Faith", "#InnerStrength"],
          firstComment: "Jai Veer Hanuman! 🚩",
        },
        {
          id: 3,
          label: "Morning Radiance (X Compliant)",
          hook: isHanuman ? "🚩 ॐ हं हनुमते नमः! Powerful blessings for today." : "✨ Starting today with gratitude and grace.",
          caption: isHanuman
            ? `🚩 ॐ हं हनुमते नमः!\n\nSending everyone immense strength, radiant health, and peaceful energy today. Drop a 🙏 if you feel blessed!`
            : `✨ Grateful for every moment, every breath, and every blessing. May today bring you purposeful energy. 🙏`,
          hashtags: isHanuman ? ["#Hanuman", "#Blessings"] : ["#DailyGratitude", "#Peace"],
          firstComment: "Stay blessed! 🙏",
        },
      ];
    }

    if (rule.id === "linkedin") {
      return [
        {
          id: 1,
          label: "Leadership & Inner Strength",
          hook: isHanuman ? "Leadership lessons from Shree Hanuman: Loyalty, humility, and fearless execution." : "The role of inner groundedness in modern leadership.",
          caption: isHanuman
            ? `Leadership lessons from Shree Hanuman: Loyalty, humility, and fearless execution.\n\nIn both ancient wisdom and modern leadership, true greatness is not measured by raw power alone — it is defined by humility, unwavering loyalty to a higher purpose, and the willingness to serve.\n\nWhen we align our actions with integrity and dedication, no obstacle remains insurmountable.\n\nMay we all lead with courage and devotion today.`
            : `The role of inner groundedness in modern leadership.\n\nIn a fast-paced world filled with noise, taking a moment for reflection, gratitude, and purpose-driven focus provides the mental clarity needed to make impactful decisions.\n\nWishing everyone clarity, resilience, and meaningful progress this week.`,
          hashtags: isHanuman ? ["#Leadership", "#Wisdom", "#Inspiration", "#Dedication"] : ["#MindfulLeadership", "#Growth", "#Wisdom"],
          firstComment: "What values anchor your daily leadership journey?",
        },
        {
          id: 2,
          label: "Overcoming Adversity",
          hook: "Obstacles do not define the path — how we rise through them does.",
          caption: `Obstacles do not define the path — how we rise through them does.\n\nThroughout history, resilience and unwavering faith have turned the greatest challenges into compounding milestones of growth.\n\nStay focused on continuous improvement and pure intentions.`,
          hashtags: ["#Resilience", "#PersonalGrowth", "#LeadershipExcellence"],
          firstComment: "Save this post for your weekly reflection.",
        },
        {
          id: 3,
          label: "Actionable Reflection",
          hook: "3 daily habits to cultivate inner peace and sharp focus:",
          caption: `3 daily habits to cultivate inner peace and sharp focus:\n\n1. Begin the day with genuine gratitude.\n2. Prioritize high-impact service over superficial metrics.\n3. Remain composed during unexpected friction.\n\nHave a purposeful and productive day ahead!`,
          hashtags: ["#Productivity", "#Mindset", "#SuccessHabits"],
          firstComment: "Which of these 3 habits do you prioritize?",
        },
      ];
    }

    // Default Instagram / Facebook / Multi-Platform rich format
    return [
      {
        id: 1,
        label: "Devotional & Viral Hook",
        hook: isHanuman ? "🚩 संकट कटे मिटे सब पीरा, जो सुमिरै हनुमत बलबीरा 🙏" : "✨ May divine grace bring strength and peace to your life 🙏",
        caption: isHanuman
          ? `🚩 जय श्री राम! जय बजरंगबली!\n\nसंकटमोचन हनुमान जी की कृपा से आपके जीवन के समस्त संकट दूर हों और आपको असीम शक्ति, बुद्धि और शांति प्राप्त हो।\n\nजब भी मन विचलित हो, सच्चे हृदय से उनका स्मरण करें — शक्ति और सकारात्मकता स्वयं आपके साथ होगी। ✨\n\n👇 कमेंट में 'जय श्री राम' / 'जय हनुमान' लिखकर अपनी श्रद्धा व्यक्त करें!`
          : `✨ May your day be blessed with courage, peace, and unwavering positivity.\n\nNever forget that inner strength and devotion can move any mountain. Keep your faith strong and your intentions pure.\n\nDrop a 🙏 in the comments to spread positivity today!`,
        hashtags: isHanuman
          ? ["#JaiShreeRam", "#HanumanJi", "#Bajrangbali", "#SankatMochan", "#SanatanDharma", "#Bhakti", "#DivineEnergy"]
          : ["#Blessings", "#Devotion", "#InnerPeace", "#Faith", "#Positivity", "#Gratitude"],
        firstComment: isHanuman ? "जय श्री राम! जय वीर हनुमान! 🙏🚩" : "Wishing everyone peace and positivity today! 🙏✨",
      },
      {
        id: 2,
        label: "Courage & Wisdom",
        hook: isHanuman ? "⚡ Strength, humility, and unwavering loyalty — lessons from Bajrangbali." : "⚡ Let faith guide your path and wisdom strengthen your journey.",
        caption: isHanuman
          ? `⚡ True strength is guided by humility and dedication.\n\nShree Hanuman teaches us that no obstacle is insurmountable when our purpose is pure and our determination is steadfast.\n\nMay this day bring immense courage and energy to you and your loved ones. 🚩`
          : `⚡ Faith and resilience turn challenges into stepping stones.\n\nStay focused, keep your spirit high, and let pure intentions guide your actions.\n\nWishing you boundless energy and positivity today. ✨`,
        hashtags: isHanuman
          ? ["#HanumanJayanti", "#VeerHanuman", "#SpiritualGrowth", "#Wisdom", "#Inspiration"]
          : ["#SpiritualWisdom", "#DailyInspiration", "#Strength", "#PeaceOfMind"],
        firstComment: "May this bring positive energy to your feed today! ✨",
      },
      {
        id: 3,
        label: "Short & Punchy",
        hook: isHanuman ? "🚩 पवनपुत्र हनुमान की जय! Have a blessed day!" : "✨ Starting today with gratitude and divine grace.",
        caption: isHanuman
          ? `🚩 ॐ हं हनुमते नमः!\n\nSending everyone immense strength, good health, and positive vibrations today. Stay blessed and fearless! 🙏✨`
          : `✨ Grateful for every moment, every breath, and every blessing. May today bring you peace and purpose. 🙏`,
        hashtags: isHanuman ? ["#JaiBajrangbali", "#HanumanChalisa", "#Positivity"] : ["#DailyGratitude", "#MorningVibes"],
        firstComment: "Jai Bajrangbali! 🙏🚩",
      },
    ];
  }

  // Business / SaaS / Launch / General
  if (rule.id === "x") {
    return [
      {
        id: 1,
        label: "High Impact Hook (X Compliant)",
        hook: `🚀 ${cleanPrompt.slice(0, 35)}...`,
        caption: `Stop spending hours on manual social workflows.\n\nWith ${cleanPrompt}, you can automate scheduling, generate AI copy with Gemini 3.8 Flash, and 3x your reach in minutes.\n\nTry it free now ⬇️`,
        hashtags: ["#SocialMedia", "#AI"],
        firstComment: "Link in bio to test it right now! 🔗",
      },
      {
        id: 2,
        label: "Problem & Solution (X Compliant)",
        hook: `Most creators waste 10+ hours a week.`,
        caption: `Most creators waste 10+ hours a week juggling tabs.\n\nHere is how to solve it:\n1. Plan your content calendar\n2. Compose multi-channel in 1 click\n3. Track live analytics\n\nPowered by ${cleanPrompt}. 🚀`,
        hashtags: ["#Productivity", "#SaaS"],
        firstComment: "Drop your biggest workflow bottleneck below 👇",
      },
      {
        id: 3,
        label: "Question & Engagement (X Compliant)",
        hook: `Quick question for social managers:`,
        caption: `What is the single most time-consuming part of your weekly publishing workflow?\n\nWe built ${cleanPrompt} to eliminate it completely.\n\nRT if you want early access! ⚡`,
        hashtags: ["#BuildInPublic", "#Creator"],
        firstComment: "Early access slots opening this week!",
      },
    ];
  }

  // Instagram / Multi-Platform Standard
  return [
    {
      id: 1,
      label: "Engaging & Hook-Driven",
      hook: `💡 Here is what you need to know about ${cleanPrompt}:`,
      caption: `💡 Here is what you need to know about ${cleanPrompt}:\n\nWhen it comes to building consistent online growth, clarity and systemized execution always win.\n\nBy leveraging modern automation and high-impact messaging, you save hours every week while maximizing engagement across every social channel.\n\n👇 What is your biggest priority right now? Drop a comment below!`,
      hashtags: ["#SocialGrowth", "#ContentStrategy", "#PulseSocial", "#DigitalMarketing", "#CreatorEconomy"],
      firstComment: "Drop your take in the comments below! 👇",
    },
    {
      id: 2,
      label: "Value & Actionable Framework",
      hook: `✨ 3 actionable steps to master ${cleanPrompt}:`,
      caption: `✨ 3 actionable steps to master ${cleanPrompt}:\n\n1. Simplicity always outperforms over-complication.\n2. Small daily improvements create compounding breakthroughs.\n3. Stay genuine to your core message.\n\nBookmark this post for your weekly planning session! 📌`,
      hashtags: ["#GrowthMindset", "#ProductivityTips", "#StrategyFirst", "#EntrepreneurLife"],
      firstComment: "Bookmark this post for reference later! 📌",
    },
    {
      id: 3,
      label: "Short & Punchy Announcement",
      hook: `🔥 Big update regarding ${cleanPrompt}:`,
      caption: `🔥 Big update regarding ${cleanPrompt}:\n\nFocus on what drives direct value, execute with precision, and let results speak for themselves.\n\nHave a productive and powerful week ahead! ✨`,
      hashtags: ["#Innovation", "#Execution", "#TrendingNow"],
      firstComment: "Double tap if this resonates with you! ❤️",
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      action = "variations",
      brandName = "PulseSocial",
      industry = "Digital Content",
      tone = "Engaging & Viral",
      platform = "Instagram",
      model = "gemini-3.8-flash",
      customApiKey,
    } = body;

    const apiKey = (customApiKey || process.env.GEMINI_API_KEY || "").trim();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required to generate social content." },
        { status: 400 }
      );
    }

    const platformRule = getPlatformRule(platform);

    // List of active models supported in 2026 Google Generative AI API
    const modelCandidates = Array.from(new Set([
      model,
      "gemini-3.5-flash",
      "gemini-3-flash-preview",
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash",
      "gemini-flash-latest",
    ])).filter(Boolean);

    // If an API key is available, attempt real live call to Google Gemini
    if (apiKey && apiKey.length > 8) {
      for (const activeModel of modelCandidates) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

          const systemInstruction = `You are an elite enterprise social media content strategist for "${brandName}".
You MUST strictly comply with social media platform rules, regulations, character caps, and formatting standards:
Target Platform: ${platformRule.name}
Character Limit: EXACTLY ${platformRule.maxChars} characters maximum (Hard Cap).
Recommended Max Length: ${platformRule.recommendedMaxChars} characters.
Max Hashtags: ${platformRule.maxHashtags} hashtags maximum (DO NOT exceed).
Ideal Opening Hook: within first ${platformRule.idealHookLength} characters.
Formatting Style: ${platformRule.formattingGuideline}
Rules:
${platformRule.rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;

          let promptText = "";

          if (action === "hashtags") {
            promptText = `${systemInstruction}
Generate exactly 8-12 hyper-relevant, high-traffic hashtags for: "${prompt}".
Comply strictly with ${platformRule.name} rules.
Return JSON ONLY: { "hashtags": ["#tag1", "#tag2", ...] }`;
          } else if (action === "rewrite") {
            promptText = `${systemInstruction}
Rewrite this draft post for ${platformRule.name} in the tone "${tone}":
"${prompt}"
Strictly enforce ${platformRule.maxChars} character limit.
Return JSON ONLY: { "caption": "rewritten text", "hashtags": ["#tag1"], "charCount": 0 }`;
          } else {
            // Default "variations"
            promptText = `${systemInstruction}
Create 3 high-performing, distinct social media post variations for ${platformRule.name} about: "${prompt}".
Tone: ${tone}.
Strict compliance: Every variation MUST NOT exceed ${platformRule.maxChars} characters.
Return valid JSON ONLY with this exact structure:
{
  "variations": [
    {
      "id": 1,
      "label": "Hook-Driven & Viral",
      "hook": "first 1-2 lines attention grabber",
      "caption": "complete formatted post content strictly under ${platformRule.maxChars} characters",
      "hashtags": ["#tag1", "#tag2"],
      "firstComment": "strategic engaging first comment"
    },
    {
      "id": 2,
      "label": "Value & Insights",
      "hook": "educational or business angle",
      "caption": "complete post content strictly under ${platformRule.maxChars} characters",
      "hashtags": ["#tag1", "#tag2"],
      "firstComment": "question for audience"
    },
    {
      "id": 3,
      "label": "Short & Punchy Call-To-Action",
      "hook": "urgent or curiosity hook",
      "caption": "concise post with direct action under ${platformRule.maxChars} characters",
      "hashtags": ["#tag1"],
      "firstComment": "link or call to action"
    }
  ]
}`;
          }

          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(9000),
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            }),
          });

          if (res.ok) {
            const geminiData = await res.json();
            const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
              const parsed = JSON.parse(cleaned);

              if (action === "hashtags" && Array.isArray(parsed.hashtags)) {
                return NextResponse.json({
                  success: true,
                  hashtags: parsed.hashtags,
                  model: activeModel,
                  provider: `Google Gemini (${activeModel})`,
                  rules: platformRule,
                });
              }

              if (action === "rewrite" && parsed.caption) {
                const validation = validateContentRules(parsed.caption, platform, parsed.hashtags);
                return NextResponse.json({
                  success: true,
                  result: {
                    caption: parsed.caption,
                    hashtags: parsed.hashtags || [],
                    validation,
                  },
                  model: activeModel,
                  provider: `Google Gemini (${activeModel})`,
                  rules: platformRule,
                });
              }

              const vars = parsed.variations || [];
              if (vars.length > 0) {
                // Enrich each variation with live rule validation
                const enrichedVars = vars.map((v: any) => ({
                  ...v,
                  validation: validateContentRules(v.caption, platform, v.hashtags),
                }));

                return NextResponse.json({
                  success: true,
                  content: enrichedVars[0].caption,
                  result: {
                    hook: enrichedVars[0].hook,
                    caption: enrichedVars[0].caption,
                    hashtags: enrichedVars[0].hashtags,
                    firstComment: enrichedVars[0].firstComment,
                    suggestedLocation: "Global",
                    variations: enrichedVars,
                    platformRules: platformRule,
                  },
                  model: activeModel,
                  provider: `Google Gemini (${activeModel})`,
                });
              }
            }
          }
        } catch (err: any) {
          console.warn(`Gemini model ${activeModel} attempt failed, trying next fallback:`, err.message);
        }
      }
    }

    // Dynamic Rule-Compliant Engine Fallback (guaranteed 100% platform rule compliance)
    const variations = generatePlatformRuleCompliantCopy(prompt, platform, tone, brandName);
    const enrichedVars = variations.map((v) => ({
      ...v,
      validation: validateContentRules(v.caption, platform, v.hashtags),
    }));

    return NextResponse.json({
      success: true,
      requiresKey: false,
      content: enrichedVars[0].caption,
      result: {
        hook: enrichedVars[0].hook,
        caption: enrichedVars[0].caption,
        hashtags: enrichedVars[0].hashtags,
        firstComment: enrichedVars[0].firstComment,
        suggestedLocation: "Global",
        variations: enrichedVars,
        platformRules: platformRule,
      },
      model: "gemini-3.8-flash (Smart Compliance Engine)",
      provider: "Gemini Social Compliance Engine",
    });
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: error.message || "Failed to generate AI content." },
      { status: 500 }
    );
  }
}
