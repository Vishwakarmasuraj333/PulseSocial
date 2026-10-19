import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { SignalingStore } from "@/lib/calls/signaling-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/calls/rooms
 * List all active/recent call rooms for the current workspace
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = SignalingStore.listRoomsForWorkspace(session.activeOrgId);
    return NextResponse.json({
      success: true,
      rooms,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to list rooms" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calls/rooms
 * Create a new live meeting room or return existing room
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const rawName = typeof body.name === "string" ? body.name.trim() : "";
    const customCode = typeof body.code === "string" ? body.code.trim().toLowerCase() : "";

    // Generate user-friendly room code if not provided
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const roomCode = customCode || `pulse-${randomSuffix}`;
    const roomId = `room-${session.activeOrgId}-${roomCode}`;
    const roomName = rawName || `Team Sync (${roomCode.toUpperCase()})`;

    const hostName = session.name || session.email.split("@")[0];

    const room = SignalingStore.createOrGetRoom({
      roomId,
      code: roomCode,
      name: roomName,
      workspaceId: session.activeOrgId,
      hostId: session.id,
      hostName,
    });

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        name: room.name,
        hostId: room.hostId,
        hostName: room.hostName,
        createdAt: room.createdAt,
        status: room.status,
        participantCount: room.participants.size,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create room" },
      { status: 500 }
    );
  }
}
