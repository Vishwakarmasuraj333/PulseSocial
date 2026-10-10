import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized", code: "FORBIDDEN" }, { status: 401 });
    }

    const { id } = await params;

    const targetSession = await prisma.authSession.findFirst({
      where: {
        id,
        userId: session.id,
      },
    });

    if (!targetSession) {
      return NextResponse.json(
        { error: "Session not found", code: "RESOURCE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Mark revoked
    await prisma.authSession.update({
      where: { id: targetSession.id },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Session successfully revoked.",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to revoke session", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
