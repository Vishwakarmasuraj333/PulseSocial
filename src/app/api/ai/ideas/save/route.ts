import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { idea, title, hook, cta, platform } = body;

    const orgId = session.activeOrgId;
    if (!orgId) {
      return NextResponse.json(
        { error: "No active workspace found for this user." },
        { status: 400 }
      );
    }

    const draftTitle = title || idea?.title || "AI Generated Idea";
    const draftContent = `${hook || idea?.hook || ""}\n\n${idea?.contentAngle || ""}\n\nCTA: ${cta || idea?.cta || ""}`.trim();

    const createdDraft = await prisma.draft.create({
      data: {
        organizationId: orgId,
        title: draftTitle,
        content: draftContent,
        targetChannels: JSON.stringify([platform || idea?.platform || "general"]),
      },
    });

    return NextResponse.json({
      success: true,
      draftId: createdDraft.id,
      draft: createdDraft,
      message: "Idea saved as post draft successfully.",
    });
  } catch (err: any) {
    console.error("Failed to save AI idea:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save AI idea as draft" },
      { status: 500 }
    );
  }
}
