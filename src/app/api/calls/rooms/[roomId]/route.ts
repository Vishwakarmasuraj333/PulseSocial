import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { SignalingStore } from "@/lib/calls/signaling-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/calls/rooms/[roomId]
 * Get details, current participants, and messages of a call room
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const room = SignalingStore.getRoom(roomId);

    if (!room) {
      // If requested by code, try to find by code or auto-initialize for this workspace
      const autoRoom = SignalingStore.createOrGetRoom({
        roomId,
        code: roomId,
        workspaceId: session.activeOrgId,
        hostId: session.id,
        hostName: session.name || session.email.split("@")[0],
      });

      return NextResponse.json({
        success: true,
        room: {
          id: autoRoom.id,
          code: autoRoom.code,
          name: autoRoom.name,
          hostId: autoRoom.hostId,
          hostName: autoRoom.hostName,
          status: autoRoom.status,
          participants: Array.from(autoRoom.participants.values()),
          chatMessages: autoRoom.chatMessages,
        },
      });
    }

    // Verify workspace isolation
    if (room.workspaceId !== session.activeOrgId) {
      return NextResponse.json(
        { error: "Forbidden: Call room belongs to another workspace" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        name: room.name,
        hostId: room.hostId,
        hostName: room.hostName,
        status: room.status,
        participants: Array.from(room.participants.values()),
        chatMessages: room.chatMessages,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calls/rooms/[roomId]
 * End a call room
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const room = SignalingStore.getRoom(roomId);
    if (!room) {
      return NextResponse.json({ success: true, message: "Room not found or already ended" });
    }

    if (room.workspaceId !== session.activeOrgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    room.status = "ended";
    room.endedAt = Date.now();
    room.participants.clear();

    return NextResponse.json({ success: true, message: "Call room ended" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
