import { NextRequest, NextResponse } from "next/server";
import { aiDb } from "@/lib/ai/ai-db";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Active session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const taskType = searchParams.get("taskType");
    const platform = searchParams.get("platform");
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const whereClause: any = {
      userId: session.id,
    };

    if (taskType && taskType !== "all") {
      whereClause.taskType = taskType;
    }
    if (platform && platform !== "all") {
      whereClause.platform = { contains: platform, mode: "insensitive" };
    }

    const items = await aiDb.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        taskType: true,
        model: true,
        prompt: true,
        enhancedPrompt: true,
        outputText: true,
        imageUrl: true,
        platform: true,
        tone: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      generations: items,
    });
  } catch (err: any) {
    console.error("[AI:History Error]", err);
    return NextResponse.json(
      { success: false, error: "FETCH_FAILED", message: "Failed to fetch generation history." },
      { status: 500 }
    );
  }
}
