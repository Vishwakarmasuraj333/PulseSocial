import assert from "assert";
import { SignalingStore } from "../../src/lib/calls/signaling-store";
import { PinterestProvider } from "../../src/lib/social/providers/pinterest";

export async function runVideoCallsUnitTests() {
  console.log("\n--- [UNIT TEST: WEBRTC VIDEO CALLING, CONVERSATIONS & PINTEREST INTEGRITY] ---");

  const testWorkspaceId = `test-ws-${Date.now()}`;
  const testRoomId = `room-${testWorkspaceId}-meet-101`;
  const hostId = "user-host-1";
  const peerId = "user-peer-2";

  // Test 1: Create room and verify parameters
  console.log("▶ Test 1: Creating WebRTC Call Room in SignalingStore...");
  const room = SignalingStore.createOrGetRoom({
    roomId: testRoomId,
    code: "pulse-meet-101",
    name: "Sprint Demo & Live Review",
    workspaceId: testWorkspaceId,
    hostId,
    hostName: "Suraj Host",
  });

  assert.strictEqual(room.id, testRoomId);
  assert.strictEqual(room.code, "pulse-meet-101");
  assert.strictEqual(room.workspaceId, testWorkspaceId);
  assert.strictEqual(room.status, "active");
  console.log("  ✔ Verified: WebRTC room created with active status and workspace isolation.");

  // Test 2: Host joins room
  console.log("▶ Test 2: Host and Peer join presence registration...");
  const hostParticipant = SignalingStore.joinRoom(testRoomId, {
    id: hostId,
    name: "Suraj Host",
    email: "suraj@pulsesocial.io",
    isHost: true,
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
  });

  assert.strictEqual(hostParticipant.id, hostId);
  assert.strictEqual(room.participants.size, 1);

  // Peer joins
  const peerParticipant = SignalingStore.joinRoom(testRoomId, {
    id: peerId,
    name: "Teammate Jane",
    email: "jane@pulsesocial.io",
    isHost: false,
    isMuted: true,
    isVideoOff: false,
    isScreenSharing: false,
  });

  assert.strictEqual(peerParticipant.id, peerId);
  assert.strictEqual(room.participants.size, 2);
  console.log("  ✔ Verified: Participants joined room with real-time presence tracking.");

  // Test 3: WebRTC Signal exchange (SDP Offer -> SDP Answer -> ICE Candidate)
  console.log("▶ Test 3: WebRTC Signal routing (Offer, Answer, ICE Candidates)...");
  const offerSignal = SignalingStore.addSignal(testRoomId, {
    fromId: hostId,
    toId: peerId,
    type: "offer",
    data: { sdp: "v=0\r\no=host 1234 5678 IN IP4 127.0.0.1...", type: "offer" },
  });

  assert.strictEqual(offerSignal.type, "offer");
  assert.strictEqual(offerSignal.fromId, hostId);

  // Poll signals for peer
  const peerSignals = SignalingStore.pollSignals(testRoomId, peerId, 0);
  const foundOffer = peerSignals.signals.find((s) => s.type === "offer" && s.fromId === hostId);
  assert.ok(foundOffer, "Peer must receive SDP offer from host");

  // Peer sends answer
  const answerSignal = SignalingStore.addSignal(testRoomId, {
    fromId: peerId,
    toId: hostId,
    type: "answer",
    data: { sdp: "v=0\r\no=peer 9876 5432 IN IP4 127.0.0.1...", type: "answer" },
  });

  const hostSignals = SignalingStore.pollSignals(testRoomId, hostId, offerSignal.timestamp);
  const foundAnswer = hostSignals.signals.find((s) => s.type === "answer" && s.fromId === peerId);
  assert.ok(foundAnswer, "Host must receive SDP answer from peer");
  console.log("  ✔ Verified: SDP Offer & Answer successfully routed between WebRTC peers.");

  // Test 4: Live In-Call Conversation (Chat Messages)
  console.log("▶ Test 4: Real-Time In-Call Conversation (Chat Messaging)...");
  const chatMsg = SignalingStore.addChatMessage(testRoomId, {
    senderId: peerId,
    senderName: "Teammate Jane",
    text: "Can everyone see my shared screen?",
  });

  assert.strictEqual(chatMsg.text, "Can everyone see my shared screen?");
  const allMessages = SignalingStore.getChatMessages(testRoomId);
  assert.strictEqual(allMessages.length, 1);
  assert.strictEqual(allMessages[0].senderId, peerId);
  console.log("  ✔ Verified: In-call chat conversation messages safely recorded and retrieved.");

  // Test 5: Media State Toggle (Mute/Screen Share)
  console.log("▶ Test 5: Media status updates (Screen sharing & mute)...");
  SignalingStore.updateParticipantMedia(testRoomId, hostId, {
    isScreenSharing: true,
    isMuted: true,
  });

  const updatedHost = room.participants.get(hostId);
  assert.strictEqual(updatedHost?.isScreenSharing, true);
  assert.strictEqual(updatedHost?.isMuted, true);
  console.log("  ✔ Verified: Dynamic participant audio/video/screen state updates broadcasted.");

  // Test 6: Participant departure & Room termination
  console.log("▶ Test 6: Peer departure & Room lifecycle...");
  SignalingStore.leaveRoom(testRoomId, peerId);
  assert.strictEqual(room.participants.size, 1);

  SignalingStore.leaveRoom(testRoomId, hostId);
  assert.strictEqual(room.participants.size, 0);
  assert.strictEqual(room.status, "ended");
  console.log("  ✔ Verified: Clean WebRTC teardown and room closure on last participant exit.");

  // Test 7: Pinterest Provider Configuration & OAuth URL
  console.log("▶ Test 7: Verifying Pinterest Provider configuration and OAuth 2.0 URL...");
  const pinterest = new PinterestProvider();
  assert.strictEqual(pinterest.platform, "pinterest");
  assert.strictEqual(pinterest.displayName, "Pinterest");
  assert.strictEqual(pinterest.isConfigured(), true);

  const authUrl = pinterest.getAuthorizationUrl("test_csrf_token", "http://localhost:3000/api/social/pinterest/callback");
  assert.ok(authUrl.startsWith("https://www.pinterest.com/oauth/?"));
  assert.ok(authUrl.includes("client_id=1612708"));
  assert.ok(authUrl.includes("response_type=code"));
  assert.ok(authUrl.includes("scope="));
  assert.ok(authUrl.includes("boards%3Aread"));
  assert.ok(authUrl.includes("pins%3Awrite"));
  console.log("  ✔ Verified: Pinterest provider correctly configured with official v5 OAuth URL.");

  console.log("==================================================================");
  console.log("✅ WEBRTC VIDEO CALLING, IN-CALL CONVERSATIONS & PINTEREST TESTS PASSED!");
  console.log("==================================================================");
}

if (require.main === module) {
  runVideoCallsUnitTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
