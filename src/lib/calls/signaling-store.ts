/**
 * PulseSocial WebRTC In-Memory Signaling Store
 * Enterprise-grade, resilient signaling hub for peer-to-peer video calls and live conversations.
 * Maintains room presence, WebRTC SDP negotiations (offer/answer), ICE candidates, and real-time in-call chat.
 */

export interface CallParticipant {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  isHost: boolean;
  joinedAt: number;
  lastSeen: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}

export interface CallSignalMessage {
  id: string;
  fromId: string;
  toId?: string; // If undefined, broadcast to all in room
  type: "offer" | "answer" | "candidate" | "user-joined" | "user-left" | "media-status";
  data: any;
  timestamp: number;
}

export interface InCallChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
}

export interface CallRoom {
  id: string;
  code: string;
  name: string;
  workspaceId: string;
  hostId: string;
  hostName: string;
  createdAt: number;
  endedAt?: number;
  status: "active" | "ended";
  participants: Map<string, CallParticipant>;
  signals: CallSignalMessage[];
  chatMessages: InCallChatMessage[];
}

declare global {
  // eslint-disable-next-line no-var
  var __pulseCallRooms: Map<string, CallRoom> | undefined;
}

if (!globalThis.__pulseCallRooms) {
  globalThis.__pulseCallRooms = new Map<string, CallRoom>();
}

const rooms = globalThis.__pulseCallRooms;

export class SignalingStore {
  /**
   * Create or fetch a call room
   */
  static createOrGetRoom(options: {
    roomId: string;
    code?: string;
    name?: string;
    workspaceId: string;
    hostId: string;
    hostName: string;
  }): CallRoom {
    const existing = rooms.get(options.roomId);
    if (existing) {
      if (existing.status === "ended") {
        existing.status = "active";
        existing.endedAt = undefined;
      }
      return existing;
    }

    const code = options.code || options.roomId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const room: CallRoom = {
      id: options.roomId,
      code,
      name: options.name || `Meeting ${code}`,
      workspaceId: options.workspaceId,
      hostId: options.hostId,
      hostName: options.hostName,
      createdAt: Date.now(),
      status: "active",
      participants: new Map(),
      signals: [],
      chatMessages: [],
    };

    rooms.set(options.roomId, room);
    return room;
  }

  /**
   * Get room by ID or code
   */
  static getRoom(roomIdOrCode: string): CallRoom | undefined {
    if (rooms.has(roomIdOrCode)) {
      return rooms.get(roomIdOrCode);
    }
    for (const room of rooms.values()) {
      if (room.code === roomIdOrCode) {
        return room;
      }
    }
    return undefined;
  }

  /**
   * List all rooms for a specific workspace
   */
  static listRoomsForWorkspace(workspaceId: string): Array<{
    id: string;
    code: string;
    name: string;
    hostId: string;
    hostName: string;
    participantCount: number;
    createdAt: number;
    status: "active" | "ended";
  }> {
    const result: Array<any> = [];
    for (const room of rooms.values()) {
      if (room.workspaceId === workspaceId) {
        result.push({
          id: room.id,
          code: room.code,
          name: room.name,
          hostId: room.hostId,
          hostName: room.hostName,
          participantCount: room.participants.size,
          createdAt: room.createdAt,
          status: room.status,
        });
      }
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Join a room
   */
  static joinRoom(roomId: string, participant: Omit<CallParticipant, "joinedAt" | "lastSeen">): CallParticipant {
    const room = rooms.get(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    const fullParticipant: CallParticipant = {
      ...participant,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
    };

    room.participants.set(participant.id, fullParticipant);

    // Announce to other peers in room
    this.addSignal(roomId, {
      fromId: participant.id,
      type: "user-joined",
      data: {
        id: participant.id,
        name: participant.name,
        avatarUrl: participant.avatarUrl,
        isMuted: participant.isMuted,
        isVideoOff: participant.isVideoOff,
      },
    });

    return fullParticipant;
  }

  /**
   * Leave a room
   */
  static leaveRoom(roomId: string, participantId: string): void {
    const room = rooms.get(roomId);
    if (!room) return;

    room.participants.delete(participantId);

    // Announce departure
    this.addSignal(roomId, {
      fromId: participantId,
      type: "user-left",
      data: { id: participantId },
    });

    if (room.participants.size === 0) {
      room.status = "ended";
      room.endedAt = Date.now();
    }
  }

  /**
   * Update participant media state (mute, camera, screen share)
   */
  static updateParticipantMedia(
    roomId: string,
    participantId: string,
    update: Partial<Pick<CallParticipant, "isMuted" | "isVideoOff" | "isScreenSharing">>
  ): void {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(participantId);
    if (!participant) return;

    if (typeof update.isMuted === "boolean") participant.isMuted = update.isMuted;
    if (typeof update.isVideoOff === "boolean") participant.isVideoOff = update.isVideoOff;
    if (typeof update.isScreenSharing === "boolean") participant.isScreenSharing = update.isScreenSharing;
    participant.lastSeen = Date.now();

    // Broadcast media status update
    this.addSignal(roomId, {
      fromId: participantId,
      type: "media-status",
      data: {
        id: participantId,
        ...update,
      },
    });
  }

  /**
   * Add a WebRTC signal (SDP offer, SDP answer, ICE candidate)
   */
  static addSignal(
    roomId: string,
    signal: Omit<CallSignalMessage, "id" | "timestamp">
  ): CallSignalMessage {
    const room = rooms.get(roomId);
    if (!room) throw new Error(`Room ${roomId} does not exist`);

    const fullSignal: CallSignalMessage = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...signal,
      timestamp: Date.now(),
    };

    room.signals.push(fullSignal);

    // Keep memory bounded to last 200 signals per room
    if (room.signals.length > 200) {
      room.signals.splice(0, room.signals.length - 200);
    }

    return fullSignal;
  }

  /**
   * Poll signals for a participant since a given timestamp
   */
  static pollSignals(
    roomId: string,
    participantId: string,
    sinceTimestamp: number
  ): {
    signals: CallSignalMessage[];
    participants: CallParticipant[];
    messages: InCallChatMessage[];
  } {
    const room = rooms.get(roomId);
    if (!room) {
      return { signals: [], participants: [], messages: [] };
    }

    // Touch heartbeat
    const participant = room.participants.get(participantId);
    if (participant) {
      participant.lastSeen = Date.now();
    }

    // Filter signals intended for this participant or broadcasted, excluding self-generated signals
    const relevantSignals = room.signals.filter(
      (s) =>
        s.timestamp > sinceTimestamp &&
        s.fromId !== participantId &&
        (!s.toId || s.toId === participantId)
    );

    // Filter new chat messages
    const newMessages = room.chatMessages.filter((m) => m.timestamp > sinceTimestamp);

    // Clean up stale participants (no ping in > 35 seconds)
    const now = Date.now();
    for (const [id, p] of Array.from(room.participants.entries())) {
      if (now - p.lastSeen > 35000 && id !== participantId) {
        room.participants.delete(id);
        this.addSignal(roomId, {
          fromId: id,
          type: "user-left",
          data: { id, reason: "timeout" },
        });
      }
    }

    return {
      signals: relevantSignals,
      participants: Array.from(room.participants.values()),
      messages: newMessages,
    };
  }

  /**
   * Add a real in-call chat message
   */
  static addChatMessage(
    roomId: string,
    message: Omit<InCallChatMessage, "id" | "timestamp">
  ): InCallChatMessage {
    const room = rooms.get(roomId);
    if (!room) throw new Error(`Room ${roomId} does not exist`);

    const fullMessage: InCallChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...message,
      timestamp: Date.now(),
    };

    room.chatMessages.push(fullMessage);

    // Keep last 150 in-call messages
    if (room.chatMessages.length > 150) {
      room.chatMessages.splice(0, room.chatMessages.length - 150);
    }

    return fullMessage;
  }

  /**
   * Get all chat messages for a room
   */
  static getChatMessages(roomId: string): InCallChatMessage[] {
    const room = rooms.get(roomId);
    return room ? [...room.chatMessages] : [];
  }
}
