import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { SignalingStore } from "@/lib/calls/signaling-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/calls/signal?roomId=...&participantId=...&since=...
 * Real-time polling endpoint for WebRTC signals, presence changes, and in-call messages
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const participantId = searchParams.get("participantId") || session.id;
    const since = parseInt(searchParams.get("since") || "0", 10);

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    const room = SignalingStore.getRoom(roomId);
    if (!room) {
      return NextResponse.json({
        signals: [],
        participants: [],
        messages: [],
        roomStatus: "not_found",
      });
    }

    // Tenant isolation verification
    if (room.workspaceId !== session.activeOrgId) {
      return NextResponse.json({ error: "Forbidden: Cross-workspace access" }, { status: 403 });
    }

    const updates = SignalingStore.pollSignals(roomId, participantId, since);

    return NextResponse.json({
      success: true,
      roomStatus: room.status,
      roomName: room.name,
      roomCode: room.code,
      hostId: room.hostId,
      signals: updates.signals,
      participants: updates.participants,
      messages: updates.messages,
      serverTime: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Signaling error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calls/signal
 * Dispatch WebRTC signals (join, offer, answer, candidate, media-status, chat-message, leave)
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.activeOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, roomId } = body;

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    // Ensure room exists for this workspace
    let room = SignalingStore.getRoom(roomId);
    if (!room) {
      room = SignalingStore.createOrGetRoom({
        roomId,
        code: roomId,
        workspaceId: session.activeOrgId,
        hostId: session.id,
        hostName: session.name || session.email.split("@")[0],
      });
    }

    if (room.workspaceId !== session.activeOrgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const participantId = body.participantId || session.id;
    const participantName = body.participantName || session.name || session.email.split("@")[0];

    switch (action) {
      case "join": {
        const participant = SignalingStore.joinRoom(roomId, {
          id: participantId,
          name: participantName,
          email: session.email,
          avatarUrl: body.avatarUrl || "",
          isHost: room.hostId === participantId,
          isMuted: Boolean(body.isMuted),
          isVideoOff: Boolean(body.isVideoOff),
          isScreenSharing: false,
        });
        return NextResponse.json({
          success: true,
          participant,
          participants: Array.from(room.participants.values()),
        });
      }

      case "leave": {
        SignalingStore.leaveRoom(roomId, participantId);
        return NextResponse.json({ success: true, left: true });
      }

      case "offer":
      case "answer":
      case "candidate": {
        if (!body.data) {
          return NextResponse.json({ error: "Missing signal data" }, { status: 400 });
        }
        const signal = SignalingStore.addSignal(roomId, {
          fromId: participantId,
          toId: body.toId,
          type: action,
          data: body.data,
        });
        return NextResponse.json({ success: true, signalId: signal.id });
      }

      case "media-status": {
        SignalingStore.updateParticipantMedia(roomId, participantId, {
          isMuted: body.isMuted,
          isVideoOff: body.isVideoOff,
          isScreenSharing: body.isScreenSharing,
        });
        return NextResponse.json({ success: true });
      }

      case "chat-message": {
        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (!text) {
          return NextResponse.json({ error: "Message text is empty" }, { status: 400 });
        }
        const message = SignalingStore.addChatMessage(roomId, {
          senderId: participantId,
          senderName: participantName,
          senderAvatar: body.senderAvatar || "",
          text,
        });
        return NextResponse.json({ success: true, message });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Signal post error" },
      { status: 500 }
    );
  }
}
