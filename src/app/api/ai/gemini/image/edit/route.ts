import { NextRequest, NextResponse } from "next/server";
import { editGeminiImage, normalizeGeminiError } from "@/lib/ai/gemini";
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
    const { imageBase64, mimeType, instruction, aspectRatio, model } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { success: false, provider: "gemini", error: "IMAGE_REQUIRED", message: "Base64 source image is required for editing." },
        { status: 400 }
      );
    }

    if (!instruction || typeof instruction !== "string" || !instruction.trim()) {
      return NextResponse.json(
        { success: false, provider: "gemini", error: "INSTRUCTION_REQUIRED", message: "Edit instruction is required." },
        { status: 400 }
      );
    }

    const result = await editGeminiImage({
      imageBase64,
      mimeType: mimeType || "image/png",
      instruction: instruction.trim(),
      aspectRatio,
      model,
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
