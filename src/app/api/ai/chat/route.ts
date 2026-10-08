import { NextRequest, NextResponse } from "next/server";
import { generateText, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { SYSTEM_PERSONA_PROMPT } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const { messages = [], message, prompt } = body;

    let userPrompt = (message || prompt || "").trim();
    if (!userPrompt && Array.isArray(messages) && messages.length > 0) {
      userPrompt = messages[messages.length - 1]?.content || "";
    }

    if (!userPrompt) {
      return NextResponse.json(
        {
          success: false,
          provider: "gemini",
          error: "MESSAGE_REQUIRED",
          message: "Please provide a query for the AI assistant.",
        },
        { status: 400 }
      );
    }

    // Gather live workspace context
    let workspaceInfo = "Workspace: Standard workspace";
    let connectedPlatforms: string[] = [];
    let recentDrafts: string[] = [];

    if (session?.activeOrgId) {
      try {
        const org = await prisma.organization.findUnique({
          where: { id: session.activeOrgId },
          include: {
            socialAccounts: { select: { provider: true, displayName: true } },
            drafts: { take: 3, select: { title: true } },
          },
        });
        if (org) {
          workspaceInfo = `Workspace Name: "${org.name}" (Slug: ${org.slug})`;
          connectedPlatforms = org.socialAccounts.map((a) => `${a.provider} (${a.displayName})`);
          recentDrafts = org.drafts.map((d) => d.title || "Untitled Draft");
        }
      } catch (dbErr) {
        console.warn("[AI:Chat context warning]", dbErr);
      }
    }

    const contextBlock = `
CURRENT WORKSPACE CONTEXT:
- User: ${session?.name || session?.email || "PulseSocial User"}
- ${workspaceInfo}
- Connected Social Channels: ${connectedPlatforms.length > 0 ? connectedPlatforms.join(", ") : "None currently connected"}
- Recent Saved Drafts: ${recentDrafts.length > 0 ? recentDrafts.join(", ") : "No recent drafts"}
`;

    let historyBlock = "";
    if (Array.isArray(messages) && messages.length > 1) {
      const pastTurns = messages.slice(-6, -1);
      historyBlock = "\nCONVERSATION HISTORY:\n" + pastTurns
        .map((m: any) => `${m.role === "user" ? "USER" : "GEMINI"}: ${m.content}`)
        .join("\n\n") + "\n";
    }

    const chatPrompt = `${SYSTEM_PERSONA_PROMPT}

You are the official Google Gemini AI Social Media Copilot embedded in PulseSocial.
You help creators, founders, and marketing managers craft viral social posts, high-converting hooks, engaging threads, schedule ideas, and visual concepts.

${contextBlock}
${historyBlock}
CURRENT USER QUERY:
"${userPrompt}"

RULES:
- Answer directly, practically, professionally, and creatively.
- If asked to write a post for X (Twitter), keep it punchy, engaging, within 280 characters or as a numbered thread (1/n) with relevant hashtags.
- If Hinglish or Hindi is used or requested, respond in natural, friendly, highly modern conversational Hinglish.
- If writing a post or caption, format it cleanly with spacing, hook, body, CTA, and relevant hashtags so the user can directly copy or publish it.
- Keep formatting clean using standard markdown with bullet points and bold headers where appropriate.`;

    const reply = await generateText(chatPrompt);

    return NextResponse.json({
      success: true,
      provider: "gemini",
      reply,
      content: reply,
      message: {
        role: "assistant",
        content: reply,
      },
    });
  } catch (err: any) {
    const normalized = normalizeGeminiError(err);
    return NextResponse.json(
      {
        success: false,
        provider: "gemini",
        error: normalized.error,
        message: normalized.message,
      },
      { status: normalized.statusCode }
    );
  }
}
