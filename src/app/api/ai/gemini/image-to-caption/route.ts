import { NextRequest, NextResponse } from "next/server";
import { imageToCaption, normalizeGeminiError } from "@/lib/ai/gemini";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json(
        { success: false, provider: "gemini", error: "UNAUTHORIZED", message: "Active session required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { imageBase64, mimeType, platform, tone, brandName, industry } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { success: false, provider: "gemini", error: "IMAGE_REQUIRED", message: "Image is required." },
        { status: 400 }
      );
    }

    const result = await imageToCaption({
      imageBase64,
      mimeType: mimeType || "image/png",
      platform,
      tone,
      brandName,
      industry,
      userId: session.id,
      workspaceId: session.activeOrgId,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const normalized = normalizeGeminiError(err);
    return NextResponse.json(
      { success: false, provider: "gemini", error: normalized.error, message: normalized.message },
      { status: normalized.statusCode }
    );
  }
}
