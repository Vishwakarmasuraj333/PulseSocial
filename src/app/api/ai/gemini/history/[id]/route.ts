import { NextRequest, NextResponse } from "next/server";
import { aiDb } from "@/lib/ai/ai-db";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Active session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID_REQUIRED", message: "History item ID required." },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await aiDb.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND", message: "Generation record not found." },
        { status: 404 }
      );
    }

    await aiDb.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error("[AI:History DELETE Error]", err);
    return NextResponse.json(
      { success: false, error: "DELETE_FAILED", message: "Failed to delete history record." },
      { status: 500 }
    );
  }
}
