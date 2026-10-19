"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  Users,
  MessageSquare,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Send,
  Sparkles,
  MonitorUp,
  Radio,
  Volume2,
  ShieldCheck,
  Settings,
  X,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
}

interface VideoCallRoomProps {
  roomId: string;
  roomName: string;
  roomCode: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  isHost?: boolean;
  initialAudioEnabled?: boolean;
  initialVideoEnabled?: boolean;
}

const STUN_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

export function VideoCallRoom({
  roomId,
  roomName,
  roomCode,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isHost = false,
  initialAudioEnabled = true,
  initialVideoEnabled = true,
}: VideoCallRoomProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Media state
  const [isMuted, setIsMuted] = useState(!initialAudioEnabled);
  const [isVideoOff, setIsVideoOff] = useState(!initialVideoEnabled);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);

  // Active side panel
  const [activePanel, setActivePanel] = useState<"chat" | "participants" | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Participants & in-call conversation
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Video element refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Streams & WebRTC refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const lastSignalTimestamp = useRef<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Format call duration
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}:${(mins % 60).toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Send signal helper
  const sendSignal = useCallback(
    async (action: string, payload: Record<string, any> = {}) => {
      try {
        await fetch("/api/calls/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            roomId,
            participantId: currentUserId,
            participantName: currentUserName,
            avatarUrl: currentUserAvatar,
            ...payload,
          }),
        });
      } catch (err) {
        console.warn("Signal send error:", err);
      }
    },
    [roomId, currentUserId, currentUserName, currentUserAvatar]
  );

  // Initialize WebRTC Peer Connection
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection(STUN_SERVERS);
    peerConnectionRef.current = pc;

    // Send ICE candidates to peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal("candidate", { data: event.candidate });
      }
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setConnectionStatus("connected");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setConnectionStatus("disconnected");
      }
    };

    // Remote track arrival
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setConnectionStatus("connected");
      }
    };

    // DataChannel for instant P2P in-call chat
    pc.ondatachannel = (event) => {
      const channel = event.channel;
      dataChannelRef.current = channel;
      channel.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "chat") {
            setMessages((prev) => [...prev, msg.message]);
            if (activePanel !== "chat") {
              setUnreadMessages((prev) => prev + 1);
            }
          }
        } catch {}
      };
    };

    // Add local media tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  }, [sendSignal, activePanel]);

  // Audio level detection for voice activity indicator
  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const source = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      const checkVoice = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const average = sum / buffer.length;
        setIsAudioSpeaking(average > 25);
        requestAnimationFrame(checkVoice);
      };
      checkVoice();
    } catch {}
  };

  // Start media stream & join room
  useEffect(() => {
    let isCancelled = false;

    async function initMediaAndRoom() {
      try {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } catch {
          // Fallback to audio-only if camera is unavailable or permission denied
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsVideoOff(true);
          } catch {
            toast({
              title: "Media Access Warning",
              message: "Camera and microphone access could not be acquired. You can still participate via in-call chat.",
              type: "warning",
            });
          }
        }

        if (isCancelled) return;

        if (stream) {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }

          // Apply initial audio/video toggles
          stream.getAudioTracks().forEach((t) => {
            t.enabled = initialAudioEnabled;
          });
          stream.getVideoTracks().forEach((t) => {
            t.enabled = initialVideoEnabled;
          });

          setupAudioAnalysis(stream);
        }

        // Initialize PeerConnection
        const pc = createPeerConnection();

        // Create data channel as host/caller
        try {
          const dc = pc.createDataChannel("pulse_chat");
          dataChannelRef.current = dc;
          dc.onmessage = (e) => {
            try {
              const msg = JSON.parse(e.data);
              if (msg.type === "chat") {
                setMessages((prev) => [...prev, msg.message]);
              }
            } catch {}
          };
        } catch {}

        // Join signaling room
        await sendSignal("join", {
          isMuted: !initialAudioEnabled,
          isVideoOff: !initialVideoEnabled,
        });

        // If host or secondary participant, initiate call offer
        if (!isHost) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await sendSignal("offer", { data: offer });
        }
      } catch (err: any) {
        console.error("Call init error:", err);
      }
    }

    initMediaAndRoom();

    return () => {
      isCancelled = true;
    };
  }, [createPeerConnection, sendSignal, isHost, initialAudioEnabled, initialVideoEnabled, toast]);

  // Handle incoming signals (offers, answers, candidates, user events)
  const handleIncomingSignal = useCallback(
    async (signal: any) => {
      const pc = peerConnectionRef.current || createPeerConnection();

      try {
        if (signal.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal("answer", { toId: signal.fromId, data: answer });
        } else if (signal.type === "answer") {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
          }
        } else if (signal.type === "candidate") {
          if (pc.remoteDescription && signal.data) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.data));
          }
        } else if (signal.type === "user-joined") {
          toast({
            title: "Participant Joined",
            message: `${signal.data?.name || "A new teammate"} joined the video call.`,
            type: "success",
          });
          // Re-negotiate connection with newcomer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await sendSignal("offer", { toId: signal.fromId, data: offer });
        } else if (signal.type === "user-left") {
          toast({
            title: "Participant Left",
            message: "A participant has left the meeting room.",
            type: "info",
          });
        }
      } catch (err) {
        console.warn("Signal handling error:", err);
      }
    },
    [createPeerConnection, sendSignal, toast]
  );

  // Periodic signaling polling loop
  useEffect(() => {
    let isSubscribed = true;

    async function poll() {
      try {
        const res = await fetch(
          `/api/calls/signal?roomId=${encodeURIComponent(roomId)}&participantId=${encodeURIComponent(
            currentUserId
          )}&since=${lastSignalTimestamp.current}`
        );

        if (!res.ok) return;
        const data = await res.json();
        if (!isSubscribed) return;

        if (data.serverTime) {
          lastSignalTimestamp.current = data.serverTime;
        }

        if (Array.isArray(data.participants)) {
          setParticipants(data.participants);
        }

        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newItems = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
            if (newItems.length > 0 && activePanel !== "chat") {
              setUnreadMessages((count) => count + newItems.length);
            }
            return [...prev, ...newItems];
          });
        }

        if (Array.isArray(data.signals)) {
          for (const sig of data.signals) {
            await handleIncomingSignal(sig);
          }
        }
      } catch {}
    }

    // Poll every 1.5 seconds for snappy real-time responsiveness
    pollingIntervalRef.current = setInterval(poll, 1500);
    poll();

    return () => {
      isSubscribed = false;
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [roomId, currentUserId, handleIncomingSignal, activePanel]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, activePanel]);

  // Media Controls: Toggle Microphone
  const toggleMute = () => {
    if (localStreamRef.current) {
      const nextMuted = !isMuted;
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
      setIsMuted(nextMuted);
      sendSignal("media-status", { isMuted: nextMuted });
      toast({
        title: nextMuted ? "Microphone Muted" : "Microphone Active",
        message: nextMuted ? "Your audio is now muted." : "Others can hear you.",
        type: "info",
      });
    }
  };

  // Media Controls: Toggle Video Camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const nextVideoOff = !isVideoOff;
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !nextVideoOff;
      });
      setIsVideoOff(nextVideoOff);
      sendSignal("media-status", { isVideoOff: nextVideoOff });
      toast({
        title: nextVideoOff ? "Camera Turned Off" : "Camera Turned On",
        message: nextVideoOff ? "Your video feed is paused." : "Your video feed is live.",
        type: "info",
      });
    }
  };

  // Media Controls: Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (peerConnectionRef.current && videoTrack) {
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(videoTrack);
        }
      }
      setIsScreenSharing(false);
      sendSignal("media-status", { isScreenSharing: false });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenStreamRef.current = screenStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        const screenTrack = screenStream.getVideoTracks()[0];
        if (peerConnectionRef.current && screenTrack) {
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
        sendSignal("media-status", { isScreenSharing: true });
        toast({
          title: "Screen Sharing Active",
          message: "You are presenting your screen to the room.",
          type: "success",
        });
      } catch {
        // User cancelled picker
      }
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Copy Meeting Link
  const copyMeetingLink = () => {
    const meetUrl = `${window.location.origin}/calls/${encodeURIComponent(roomCode)}`;
    navigator.clipboard.writeText(meetUrl);
    setCopiedLink(true);
    toast({
      title: "Meeting Link Copied",
      message: `Anyone in your team can join using: ${meetUrl}`,
      type: "success",
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Send In-Call Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingMessage) return;

    const messageText = chatInput.trim();
    setChatInput("");
    setIsSendingMessage(true);

    const newMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      text: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);

    // Send via WebRTC DataChannel for peer-to-peer instant delivery
    if (dataChannelRef.current && dataChannelRef.current.readyState === "open") {
      try {
        dataChannelRef.current.send(JSON.stringify({ type: "chat", message: newMsg }));
      } catch {}
    }

    // Also persist via signaling API
    try {
      await sendSignal("chat-message", {
        text: messageText,
        senderAvatar: currentUserAvatar,
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // End Call / Leave Room cleanly
  const handleEndCall = async () => {
    try {
      await sendSignal("leave");
    } catch {}

    // Teardown media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    toast({
      title: "Call Ended",
      message: `You disconnected from ${roomName}. Call duration: ${formatTime(callDuration)}.`,
      type: "info",
    });

    router.push("/calls");
  };

  const remoteParticipants = participants.filter((p) => p.id !== currentUserId);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col h-[calc(100vh-64px)] w-full bg-slate-950 text-white overflow-hidden select-none font-sans"
    >
      {/* ============================================================== */}
      {/* TOP BAR: Room Title, Encryption Badge, Duration & Quick Info  */}
      {/* ============================================================== */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-slate-950/90 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-white tracking-wide">{roomName}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {roomCode}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> WebRTC P2P Encrypted
              </span>
              <span>•</span>
              <span className="font-mono text-slate-300 font-medium">{formatTime(callDuration)}</span>
              <span>•</span>
              <span className="capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>

        {/* Quick Link Share & Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={copyMeetingLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-all shadow-sm"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copiedLink ? "Link Copied!" : "Copy Invite Link"}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN VIDEO STAGE AREA                                         */}
      {/* ============================================================== */}
      <div className="flex-1 relative flex items-center justify-center p-4 pt-16 pb-24 overflow-hidden">
        {/* Remote participant or Standby Stage */}
        <div className="relative w-full h-full max-w-6xl max-h-[82vh] rounded-2xl bg-slate-900 border border-slate-800/80 shadow-2xl overflow-hidden flex items-center justify-center">
          {/* Remote Video element */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              remoteParticipants.length > 0 && !remoteParticipants[0].isVideoOff ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Standby screen when waiting for peer or peer video is off */}
          {(!remoteParticipants.length || remoteParticipants[0].isVideoOff) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-center px-4">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white tracking-wider">
                      {remoteParticipants.length > 0
                        ? remoteParticipants[0].name.charAt(0).toUpperCase()
                        : "P"}
                    </span>
                  </div>
                </div>
                {remoteParticipants.length === 0 && (
                  <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-500 text-slate-950 shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-semibold text-white mb-2">
                {remoteParticipants.length > 0
                  ? remoteParticipants[0].name
                  : "Waiting for other participants to join..."}
              </h2>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                {remoteParticipants.length > 0
                  ? "Participant has their camera turned off."
                  : "Share this meeting link with your team members to start your collaborative video session."}
              </p>

              {remoteParticipants.length === 0 && (
                <button
                  onClick={copyMeetingLink}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
                >
                  <Copy className="w-4 h-4" />
                  {copiedLink ? "Link Copied!" : "Copy Meeting Link"}
                </button>
              )}
            </div>
          )}

          {/* Remote Peer Label & Badges */}
          {remoteParticipants.length > 0 && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 backdrop-blur-md border border-slate-700/50 text-xs font-medium text-white shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{remoteParticipants[0].name}</span>
              {remoteParticipants[0].isMuted && (
                <MicOff className="w-3.5 h-3.5 text-rose-400 ml-1" />
              )}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* LOCAL PREVIEW PIP (Picture-in-Picture)                        */}
        {/* ============================================================ */}
        <div
          className={`absolute bottom-28 right-8 w-48 sm:w-64 aspect-video rounded-xl bg-slate-900 border-2 transition-all duration-300 shadow-2xl overflow-hidden z-10 ${
            isAudioSpeaking ? "border-emerald-500 shadow-emerald-500/20" : "border-slate-700"
          }`}
        >
          {/* Local Video Stream */}
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover -scale-x-100 ${
              isVideoOff ? "hidden" : "block"
            }`}
          />

          {/* Avatar when local camera is off */}
          {isVideoOff && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-300">
              <div className="w-12 h-12 rounded-full bg-indigo-600/40 border border-indigo-400 flex items-center justify-center text-lg font-bold text-white mb-1">
                {currentUserName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-slate-400">Camera Off</span>
            </div>
          )}

          {/* Local Participant Badge */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded bg-slate-950/80 backdrop-blur-sm text-[11px] text-white">
            <span className="truncate max-w-[120px] font-medium">You ({currentUserName})</span>
            <div className="flex items-center gap-1">
              {isMuted ? (
                <MicOff className="w-3 h-3 text-rose-400" />
              ) : (
                <Mic className="w-3 h-3 text-emerald-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BOTTOM CONTROL BAR                                             */}
      {/* ============================================================== */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl">
          {/* Microphone Mute Toggle */}
          <button
            onClick={toggleMute}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all shadow-md ${
              isMuted
                ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            }`}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all shadow-md ${
              isVideoOff
                ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            }`}
            title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share Toggle */}
          <button
            onClick={toggleScreenShare}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all shadow-md ${
              isScreenSharing
                ? "bg-indigo-600 text-white shadow-indigo-600/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
            title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          <div className="w-[1px] h-6 bg-slate-700/60 mx-1" />

          {/* In-Call Chat Drawer Toggle */}
          <button
            onClick={() => {
              setActivePanel((curr) => (curr === "chat" ? null : "chat"));
              setUnreadMessages(0);
            }}
            className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all shadow-md ${
              activePanel === "chat"
                ? "bg-indigo-600 text-white shadow-indigo-600/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
            title="In-Call Conversation"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessages > 0 && activePanel !== "chat" && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                {unreadMessages}
              </span>
            )}
          </button>

          {/* Participants Drawer Toggle */}
          <button
            onClick={() => setActivePanel((curr) => (curr === "participants" ? null : "participants"))}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all shadow-md ${
              activePanel === "participants"
                ? "bg-indigo-600 text-white shadow-indigo-600/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
            title="Meeting Participants"
          >
            <Users className="w-5 h-5" />
          </button>

          <div className="w-[1px] h-6 bg-slate-700/60 mx-1" />

          {/* Disconnect / End Call Button */}
          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 px-6 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-all shadow-lg shadow-rose-600/30"
            title="Leave Meeting"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline">Leave Call</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SIDE DRAWER: In-Call Chat Conversation OR Participants         */}
      {/* ============================================================== */}
      {activePanel && (
        <div className="absolute top-16 bottom-24 right-4 w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col z-30 overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-2">
              {activePanel === "chat" ? (
                <>
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">In-Call Messages</h3>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Participants ({participants.length || 1})
                  </h3>
                </>
              )}
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body: In-Call Chat */}
          {activePanel === "chat" && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Message list */}
              <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="font-medium text-slate-300">No in-call messages yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Send a message to everyone currently in this video meeting.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                          <span className="font-medium text-slate-300">
                            {isMe ? "You" : msg.senderName}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div
                          className={`px-3 py-2 rounded-xl text-xs max-w-[85%] break-words ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20"
                              : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Send a message to everyone..."
                  className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSendingMessage}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Drawer Body: Participants */}
          {activePanel === "participants" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {/* Current User */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUserName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                      <span>{currentUserName}</span>
                      <span className="text-[10px] text-indigo-400 font-semibold">(You)</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{isHost ? "Meeting Host" : "Participant"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                  {isVideoOff ? <VideoOff className="w-3.5 h-3.5 text-rose-400" /> : <Video className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </div>

              {/* Other Participants */}
              {remoteParticipants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{p.name}</div>
                      <span className="text-[10px] text-slate-400">{p.isHost ? "Host" : "Connected Teammate"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                    {p.isVideoOff ? <VideoOff className="w-3.5 h-3.5 text-rose-400" /> : <Video className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
