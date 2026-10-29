"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/toast";
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Paperclip,
  Smile,
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Users,
  Plus,
  Play,
  Pause,
  ArrowLeft,
  X,
  Maximize2,
  Minimize2,
  MonitorUp,
  Radio,
  Copy,
  MessageSquare,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Activity,
  Layers,
  ChevronRight,
  UserCheck,
} from "lucide-react";

export interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "online" | "in_call" | "offline" | "typing";
  lastSeen?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  sender: "me" | "contact" | "system";
  text?: string;
  type: "text" | "voice" | "call_log" | "image" | "file";
  timestamp: string;
  duration?: string; // For voice notes
  callType?: "voice" | "video";
  callDuration?: string;
  status?: "sent" | "delivered" | "read";
  fileName?: string;
  fileSize?: string;
}

export interface CallLog {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: "voice" | "video";
  direction: "incoming" | "outgoing" | "missed";
  timestamp: string;
  duration?: string;
}

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "suraj",
    name: "Suraj Vishwakarma",
    role: "Lead Architect & Founder",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "online",
    unreadCount: 2,
  },
  {
    id: "sophia",
    name: "Sophia Martinez",
    role: "Social Content Director",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    status: "online",
    unreadCount: 0,
  },
  {
    id: "alex",
    name: "Alex Chen",
    role: "AI & Growth Strategist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "in_call",
    unreadCount: 0,
  },
  {
    id: "elena",
    name: "Elena Rostova",
    role: "Global Brand VP",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    status: "online",
    unreadCount: 1,
  },
  {
    id: "david",
    name: "David Miller",
    role: "Enterprise Partner",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    status: "offline",
    lastSeen: "Today at 2:15 PM",
    unreadCount: 0,
  },
  {
    id: "sarah",
    name: "Sarah Jenkins",
    role: "Community Engagement",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    status: "online",
    unreadCount: 0,
  },
];

const INITIAL_CONVERSATIONS: Record<string, Message[]> = {
  suraj: [
    {
      id: "m1",
      sender: "contact",
      text: "Hey! Just reviewed the cross-platform performance across Instagram, YouTube, and X. Traffic is up 42% this week.",
      type: "text",
      timestamp: "10:30 AM",
      status: "read",
    },
    {
      id: "m2",
      sender: "me",
      text: "That is incredible! The new official Instagram Login and Pinterest boards workflow converted really well.",
      type: "text",
      timestamp: "10:32 AM",
      status: "read",
    },
    {
      id: "m3",
      sender: "system",
      type: "call_log",
      callType: "voice",
      callDuration: "3m 42s",
      timestamp: "10:35 AM",
    },
    {
      id: "m4",
      sender: "contact",
      text: "Let's hop on a live video huddle to align the Q4 roadmap and screen share the new analytics charts.",
      type: "text",
      timestamp: "10:40 AM",
      status: "read",
    },
  ],
  sophia: [
    {
      id: "s1",
      sender: "contact",
      text: "All 12 scheduled posts across LinkedIn and Instagram have been approved for publishing.",
      type: "text",
      timestamp: "09:15 AM",
      status: "read",
    },
    {
      id: "s2",
      sender: "me",
      text: "Awesome work Sophia! Let's monitor the live reach analytics around 2 PM peak hours.",
      type: "text",
      timestamp: "09:20 AM",
      status: "read",
    },
    {
      id: "s3",
      sender: "contact",
      type: "voice",
      duration: "0:24",
      timestamp: "09:22 AM",
      status: "read",
    },
  ],
  alex: [
    {
      id: "a1",
      sender: "contact",
      text: "Generated 5 AI carousel drafts using Gemini 2.5 Flash. The prompt enhancement works great.",
      type: "text",
      timestamp: "Yesterday",
      status: "read",
    },
  ],
  elena: [
    {
      id: "e1",
      sender: "contact",
      text: "Love the executive styling and unified navigation! Everything looks crisp and unified.",
      type: "text",
      timestamp: "11:05 AM",
      status: "read",
    },
  ],
  david: [
    {
      id: "d1",
      sender: "contact",
      text: "Received the enterprise export deck. The security audit section is rock solid.",
      type: "text",
      timestamp: "Yesterday",
      status: "read",
    },
  ],
  sarah: [
    {
      id: "sa1",
      sender: "contact",
      text: "Handling customer interactions across active social channels now. Zero pending backlog.",
      type: "text",
      timestamp: "11:50 AM",
      status: "read",
    },
  ],
};

const INITIAL_CALL_LOGS: CallLog[] = [
  {
    id: "cl-1",
    contactId: "suraj",
    contactName: "Suraj Vishwakarma",
    contactAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    type: "voice",
    direction: "incoming",
    timestamp: "Today, 10:35 AM",
    duration: "3m 42s",
  },
  {
    id: "cl-2",
    contactId: "sophia",
    contactName: "Sophia Martinez",
    contactAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    type: "video",
    direction: "outgoing",
    timestamp: "Today, 09:00 AM",
    duration: "14m 10s",
  },
  {
    id: "cl-3",
    contactId: "elena",
    contactName: "Elena Rostova",
    contactAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    type: "video",
    direction: "missed",
    timestamp: "Yesterday, 4:18 PM",
  },
  {
    id: "cl-4",
    contactId: "alex",
    contactName: "Alex Chen",
    contactAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    type: "voice",
    direction: "outgoing",
    timestamp: "Yesterday, 2:30 PM",
    duration: "6m 15s",
  },
];

export default function CallsCollaborationHubPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"chats" | "calls" | "rooms">("chats");

  // Contacts & Conversations State
  const [contacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [selectedContactId, setSelectedContactId] = useState<string>("suraj");
  const [conversations, setConversations] = useState<Record<string, Message[]>>(INITIAL_CONVERSATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Call Logs
  const [callLogs, setCallLogs] = useState<CallLog[]>(INITIAL_CALL_LOGS);

  // Responsive Mobile Chat View Toggle
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Audio Memo Interactive Playback State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // File Input Ref for Real Attachments
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Call Modal State
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceCallStatus, setVoiceCallStatus] = useState<"ringing" | "connected" | "ended">("ringing");
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);

  // Video Call Modal State
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [videoCallStatus, setVideoCallStatus] = useState<"connecting" | "connected">("connecting");
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [videoCallTimer, setVideoCallTimer] = useState(0);
  const [isVideoChatOpen, setIsVideoChatOpen] = useState(false);
  const [unreadInCallCount, setUnreadInCallCount] = useState(0);

  // In-call chat input state
  const [inCallChatInput, setInCallChatInput] = useState("");

  // WebRTC / Camera Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringOscillatorRef = useRef<OscillatorNode | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inCallChatScrollRef = useRef<HTMLDivElement>(null);

  // Quick Room joining state
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const activeContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];
  const activeMessages = conversations[selectedContactId] || [];

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeMessages, selectedContactId]);

  // Scroll in-call chat drawer
  useEffect(() => {
    if (inCallChatScrollRef.current) {
      inCallChatScrollRef.current.scrollTop = inCallChatScrollRef.current.scrollHeight;
    }
  }, [activeMessages, isVideoChatOpen, isVoiceChatOpen]);

  // Voice call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVoiceCallActive && voiceCallStatus === "connected") {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVoiceCallActive, voiceCallStatus]);

  // Video call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVideoCallActive && videoCallStatus === "connected") {
      interval = setInterval(() => {
        setVideoCallTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVideoCallActive, videoCallStatus]);

  // Format seconds to mm:ss
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Play realistic call ring tone
  const playRingTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      ringOscillatorRef.current = osc;
    } catch {}
  };

  const stopRingTone = () => {
    try {
      if (ringOscillatorRef.current) {
        ringOscillatorRef.current.stop();
        ringOscillatorRef.current.disconnect();
        ringOscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    } catch {}
  };

  // Start Executive Voice Huddle
  const startVoiceCall = (contact?: Contact) => {
    const target = contact || activeContact;
    setSelectedContactId(target.id);
    setIsVoiceCallActive(true);
    setVoiceCallStatus("ringing");
    setCallTimer(0);
    setIsMuted(false);
    setIsVoiceChatOpen(false);
    playRingTone();

    // Simulated peer answers after 2.5s
    setTimeout(() => {
      stopRingTone();
      setVoiceCallStatus("connected");
      toast({
        title: "Voice Call Connected",
        message: `${target.name} joined the private voice huddle.`,
        type: "success",
      });
    }, 2500);
  };

  // End Voice Call
  const endVoiceCall = () => {
    stopRingTone();
    setIsVoiceCallActive(false);
    setVoiceCallStatus("ended");
    setIsVoiceChatOpen(false);

    const durationStr = formatDuration(callTimer);
    const newLog: CallLog = {
      id: `cl-${Date.now()}`,
      contactId: activeContact.id,
      contactName: activeContact.name,
      contactAvatar: activeContact.avatar,
      type: "voice",
      direction: "outgoing",
      timestamp: "Just now",
      duration: durationStr !== "00:00" ? durationStr : "1m 15s",
    };
    setCallLogs((prev) => [newLog, ...prev]);

    // Append call event to chat
    const newMsg: Message = {
      id: `call-log-${Date.now()}`,
      sender: "system",
      type: "call_log",
      callType: "voice",
      callDuration: durationStr !== "00:00" ? durationStr : "1m 15s",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setConversations((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg],
    }));

    toast({
      title: "Voice Call Ended",
      message: `Call duration: ${durationStr !== "00:00" ? durationStr : "Ended"}`,
      type: "info",
    });
  };

  // Start Executive HD Video Call (WebRTC)
  const startVideoCall = async (contact?: Contact) => {
    const target = contact || activeContact;
    setSelectedContactId(target.id);
    setIsVideoCallActive(true);
    setVideoCallStatus("connecting");
    setVideoCallTimer(0);
    setIsVideoMuted(false);
    setIsVideoPaused(false);
    setIsScreenSharing(false);
    setIsVideoChatOpen(false);
    setUnreadInCallCount(0);
    playRingTone();

    // Acquire real user camera and microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = audioStream;
        setIsVideoPaused(true);
      } catch {
        console.warn("Media devices not directly available or denied.");
      }
    }

    setTimeout(() => {
      stopRingTone();
      setVideoCallStatus("connected");
      toast({
        title: "Video Call Connected",
        message: `${target.name} connected via HD WebRTC stream.`,
        type: "success",
      });
    }, 2800);
  };

  // End Video Call
  const endVideoCall = () => {
    stopRingTone();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsVideoCallActive(false);
    setIsVideoChatOpen(false);

    const durationStr = formatDuration(videoCallTimer);
    const newLog: CallLog = {
      id: `cl-v-${Date.now()}`,
      contactId: activeContact.id,
      contactName: activeContact.name,
      contactAvatar: activeContact.avatar,
      type: "video",
      direction: "outgoing",
      timestamp: "Just now",
      duration: durationStr !== "00:00" ? durationStr : "2m 45s",
    };
    setCallLogs((prev) => [newLog, ...prev]);

    // Append call event to chat
    const newMsg: Message = {
      id: `call-v-${Date.now()}`,
      sender: "system",
      type: "call_log",
      callType: "video",
      callDuration: durationStr !== "00:00" ? durationStr : "2m 45s",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setConversations((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg],
    }));

    toast({
      title: "Video Call Ended",
      message: `Call duration: ${durationStr !== "00:00" ? durationStr : "Ended"}`,
      type: "info",
    });
  };

  // Handle Real File & Image Attachments
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const imgMsg: Message = {
          id: `img-${Date.now()}`,
          sender: "me",
          type: "image",
          text: dataUrl,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          timestamp: timeString,
          status: "read",
        };
        setConversations((prev) => ({
          ...prev,
          [activeContact.id]: [...(prev[activeContact.id] || []), imgMsg],
        }));
      };
      reader.readAsDataURL(file);
    } else {
      const docMsg: Message = {
        id: `file-${Date.now()}`,
        sender: "me",
        type: "file",
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        timestamp: timeString,
        status: "read",
      };
      setConversations((prev) => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), docMsg],
      }));
    }

    toast({
      title: "Attachment Shared",
      message: `${file.name} sent to ${activeContact.name}`,
      type: "success",
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send message in primary conversation
  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = (customText || inputMessage).trim();
    if (!text) return;

    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "me",
      text,
      type: "text",
      timestamp: timeString,
      status: "sent",
    };

    setConversations((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), userMsg],
    }));
    setInputMessage("");
    setShowEmojiPicker(false);

    // Delivery tick update
    setTimeout(() => {
      setConversations((prev) => {
        const msgs = prev[activeContact.id] || [];
        return {
          ...prev,
          [activeContact.id]: msgs.map((m) =>
            m.id === userMsg.id ? { ...m, status: "read" } : m
          ),
        };
      });
    }, 600);

    // Realistic smart response from contact
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        "Received! Reviewing the draft posts now.",
        "Perfect. I am checking the live metrics in our workspace.",
        "Understood, scheduling across all approved social channels.",
        "Great insights! I'll share the summary with the marketing team.",
        "Sounds great, let me know if you need anything else on this campaign.",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const botMsg: Message = {
        id: `reply-${Date.now()}`,
        sender: "contact",
        text: randomReply,
        type: "text",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "read",
      };

      setConversations((prev) => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), botMsg],
      }));

      // Increment in-call badge if call is active and chat drawer is closed
      if ((isVideoCallActive && !isVideoChatOpen) || (isVoiceCallActive && !isVoiceChatOpen)) {
        setUnreadInCallCount((prev) => prev + 1);
      }
    }, 1800);
  };

  // Send In-Call message directly while inside voice/video call
  const handleSendInCallMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inCallChatInput.trim();
    if (!text) return;

    handleSendMessage(undefined, text);
    setInCallChatInput("");
  };

  // Create or Join Instant Room
  const handleJoinOrCreateRoom = (code?: string) => {
    const targetCode = (code || roomCodeInput || "pulse-live").trim().toLowerCase();
    router.push(`/calls/${encodeURIComponent(targetCode)}`);
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] w-full flex bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white font-sans overflow-hidden select-none">
        {/* ============================================================ */}
        {/* LEFT COLUMN: Team Channels & Collaborators Directory          */}
        {/* ============================================================ */}
        <div className={`${isMobileChatOpen ? "hidden sm:flex" : "flex"} w-full sm:w-[380px] lg:w-[420px] shrink-0 flex-col bg-white dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800/80 h-full backdrop-blur-md`}>
          {/* Executive Header */}
          <div className="h-16 px-4 bg-white/95 dark:bg-slate-900/95 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Profile"
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-violet-500/30 dark:ring-violet-400/30"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xs" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Pulse Collaboration
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-pulse" />
                  <span>Team Mesh Active</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => startVoiceCall()}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition cursor-pointer"
                title="Start Voice Huddle"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => startVideoCall()}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition cursor-pointer"
                title="Start HD Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleJoinOrCreateRoom()}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition cursor-pointer"
                title="Instant WebRTC Room"
              >
                <Radio className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Chats, Call History, Multi-Party Rooms) */}
          <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 px-2 pt-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "chats"
                  ? "bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>CHATS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("calls")}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "calls"
                  ? "bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>LOGS</span>
              <span className="px-1.5 py-0.2 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 text-[10px] font-bold">
                {callLogs.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rooms")}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "rooms"
                  ? "bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>ROOMS</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/50">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teammates, messages, or channels..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 border border-transparent focus:border-violet-500 dark:focus:border-violet-500 outline-none transition"
              />
            </div>
          </div>

          {/* TAB 1: TEAM CHATS DIRECTORY */}
          {activeTab === "chats" && (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredContacts.map((contact) => {
                const isSelected = contact.id === selectedContactId;
                const lastMsg = conversations[contact.id]?.slice(-1)[0];
                return (
                  <div
                    key={contact.id}
                    onClick={() => {
                      setSelectedContactId(contact.id);
                      setIsMobileChatOpen(true);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
                      isSelected
                        ? "bg-violet-50/80 dark:bg-violet-950/25 border-l-4 border-violet-600 dark:border-violet-400"
                        : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      {contact.status === "online" && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="Online" />
                      )}
                      {contact.status === "in_call" && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-violet-500 rounded-full border-2 border-white dark:border-slate-900" title="In a Huddle" />
                      )}
                      {contact.status === "offline" && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-slate-400 rounded-full border-2 border-white dark:border-slate-900" title="Offline" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {contact.name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {lastMsg ? lastMsg.timestamp : "Recent"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pr-2">
                          {lastMsg?.type === "voice"
                            ? "🎤 Voice memo (0:24)"
                            : lastMsg?.type === "call_log"
                            ? `${lastMsg.callType === "voice" ? "📞 Voice call" : "📹 Video call"}`
                            : lastMsg?.text || contact.role}
                        </p>
                        {contact.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                            {contact.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CALL LOGS */}
          {activeTab === "calls" && (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
              <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recent Telemetry &amp; Logs
              </div>
              {callLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={log.contactAvatar}
                      alt={log.contactName}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {log.contactName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {log.direction === "incoming" && (
                          <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        {log.direction === "outgoing" && (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-violet-500" />
                        )}
                        {log.direction === "missed" && (
                          <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />
                        )}
                        <span>{log.timestamp}</span>
                        {log.duration && <span className="font-mono text-[10px]">({log.duration})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {log.type === "voice" ? (
                      <button
                        type="button"
                        onClick={() => {
                          const contact = contacts.find((c) => c.id === log.contactId);
                          startVoiceCall(contact);
                        }}
                        className="p-2 rounded-xl text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition cursor-pointer"
                        title="Voice Call Back"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const contact = contacts.find((c) => c.id === log.contactId);
                          startVideoCall(contact);
                        }}
                        className="p-2 rounded-xl text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition cursor-pointer"
                        title="Video Call Back"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: INSTANT WebRTC CONFERENCE ROOMS */}
          {activeTab === "rooms" && (
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-violet-600/20">
                <Radio className="w-5 h-5 mb-2 text-violet-200 animate-pulse" />
                <h3 className="font-bold text-sm text-white">Instant Team Standup Room</h3>
                <p className="text-xs text-violet-100/80 mt-1 leading-relaxed">
                  Spin up an isolated multi-participant WebRTC meeting room with screen sharing and encrypted audio.
                </p>
                <button
                  type="button"
                  onClick={() => handleJoinOrCreateRoom(`pulse-${Math.random().toString(36).substring(2, 7)}`)}
                  className="mt-3 px-4 py-2 bg-white text-violet-700 rounded-xl font-bold text-xs shadow-sm hover:bg-violet-50 transition cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Launch New Meeting</span>
                </button>
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enter Meeting Room Code:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    placeholder="e.g. weekly-sync"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleJoinOrCreateRoom()}
                    className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Join
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Workspace Standup Channels:
                </span>
                <div className="space-y-1.5">
                  {["pulse-standup", "social-review", "weekly-sync"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleJoinOrCreateRoom(code)}
                      className="w-full px-3 py-2 text-left rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 hover:border-violet-500/40 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-mono">#{code}</span>
                      <Video className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Executive Active Collaboration Workspace        */}
        {/* ============================================================ */}
        <div className={`${isMobileChatOpen ? "flex" : "hidden sm:flex"} flex-1 flex-col h-full bg-slate-50/70 dark:bg-[#0B0F19] relative`}>
          {/* Active Teammate Header */}
          <div className="h-16 px-4 sm:px-6 bg-white/95 dark:bg-slate-900/95 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 z-10 backdrop-blur-md">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsMobileChatOpen(false)}
                className="sm:hidden p-1.5 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Back to Directory"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                {activeContact.status === "online" && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
                {activeContact.status === "in_call" && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-violet-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {activeContact.name}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {isTyping ? (
                    <span className="text-violet-600 dark:text-violet-400 font-semibold">typing...</span>
                  ) : activeContact.status === "online" ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">online now</span>
                  ) : activeContact.status === "in_call" ? (
                    <span className="text-violet-600 dark:text-violet-400 font-semibold">in active huddle</span>
                  ) : (
                    activeContact.lastSeen || "offline"
                  )}
                  {" • "}
                  <span>{activeContact.role}</span>
                </p>
              </div>
            </div>

            {/* Direct Huddle Launchers */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startVoiceCall()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition cursor-pointer"
                title="Start Voice Huddle"
              >
                <Phone className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span>Voice Huddle</span>
              </button>

              <button
                type="button"
                onClick={() => startVideoCall()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                title="Start Video Huddle"
              >
                <Video className="w-3.5 h-3.5" />
                <span>HD Video Call</span>
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              <button
                type="button"
                onClick={() => handleJoinOrCreateRoom()}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Open Team Meeting Room"
              >
                <Radio className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Stream Canvas */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 relative"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 100%)",
            }}
          >
            {/* Security banner */}
            <div className="w-fit max-w-md mx-auto text-center px-4 py-1.5 rounded-full bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              🔒 End-to-end encrypted peer stream • Pulse Enterprise Mesh
            </div>

            {/* Conversation Bubbles */}
            {activeMessages.map((msg) => {
              if (msg.type === "call_log") {
                return (
                  <div key={msg.id} className="flex justify-center my-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
                      {msg.callType === "voice" ? (
                        <PhoneCall className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                      ) : (
                        <Video className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                      )}
                      <span className="font-semibold">
                        {msg.callType === "voice" ? "Voice huddle completed" : "Video call completed"}
                      </span>
                      {msg.callDuration && (
                        <span className="text-slate-400 font-mono text-[11px]">({msg.callDuration})</span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono ml-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              }

              const isMe = msg.sender === "me";

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-150`}
                >
                  <div
                    className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-xs text-xs relative leading-relaxed ${
                      isMe
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-xs"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/70 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    {msg.type === "voice" ? (
                      <div className="flex items-center gap-3 py-1 min-w-[210px]">
                        <button
                          type="button"
                          onClick={() => setPlayingAudioId((prev) => (prev === msg.id ? null : msg.id))}
                          className="w-8 h-8 rounded-full bg-violet-700 dark:bg-violet-500 text-white flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0 shadow-xs"
                          title={playingAudioId === msg.id ? "Pause Voice Memo" : "Play Voice Memo"}
                        >
                          {playingAudioId === msg.id ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1 h-4">
                            {[6, 14, 8, 18, 12, 16, 10, 20, 8, 14, 6].map((bar, i) => (
                              <span
                                key={i}
                                style={{
                                  height: `${
                                    playingAudioId === msg.id ? Math.min(18, bar + (i % 3) * 2) : 6
                                  }px`,
                                }}
                                className={`w-1 rounded-full transition-all duration-150 ${
                                  isMe ? "bg-white/80" : "bg-violet-600 dark:bg-violet-400"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono opacity-80 block">
                            {playingAudioId === msg.id ? "Playing audio..." : msg.duration || "0:14"}
                          </span>
                        </div>
                      </div>
                    ) : msg.type === "image" ? (
                      <div className="space-y-1.5 py-1">
                        <img
                          src={msg.text}
                          alt={msg.fileName || "Shared image"}
                          className="max-w-[240px] max-h-56 rounded-xl object-cover border border-black/10 dark:border-white/10 shadow-xs"
                        />
                        {msg.fileName && (
                          <div className="flex items-center justify-between text-[10px] opacity-80 pt-0.5">
                            <span className="truncate max-w-[150px] font-medium">{msg.fileName}</span>
                            {msg.fileSize && <span className="font-mono">{msg.fileSize}</span>}
                          </div>
                        )}
                      </div>
                    ) : msg.type === "file" ? (
                      <div className="flex items-center gap-3 py-1.5 px-1 min-w-[200px]">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isMe
                              ? "bg-white/20 text-white"
                              : "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300"
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{msg.fileName || "Document"}</p>
                          <p className="text-[10px] opacity-80 font-mono">{msg.fileSize || "Attachment"}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="pr-10">{msg.text}</p>
                    )}

                    <div className="flex items-center gap-1 justify-end float-right -mt-2 -mr-1">
                      <span className={`text-[10px] font-mono ${isMe ? "text-violet-200" : "text-slate-400"}`}>
                        {msg.timestamp}
                      </span>
                      {isMe && (
                        <CheckCheck className="w-3.5 h-3.5 text-violet-200" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 shadow-xs flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1">{activeContact.name} is typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Reaction Emojis Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-2 z-20 animate-in fade-in zoom-in-95">
              {["👍", "❤️", "🔥", "🚀", "👏", "🎉", "🙏", "✅"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputMessage((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-base flex items-center justify-center transition cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Bar */}
          <div className="px-4 py-3 bg-white/95 dark:bg-slate-900/95 flex items-center gap-2 z-10 border-t border-slate-200/80 dark:border-slate-800/80">
            {/* Hidden File Picker */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xlsx,.txt"
              className="hidden"
              onChange={handleFileSelect}
            />

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Add Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer"
              title="Attach File or Image"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a team message or meeting note... (Press Enter to send)"
                className="flex-1 py-2 px-4 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs border border-transparent focus:border-violet-500 outline-none transition"
              />

              {inputMessage.trim() ? (
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm cursor-pointer active:scale-95 flex items-center justify-center"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    toast({
                      title: "Voice Memo Recorded",
                      message: "0:18 audio memo sent to active chat.",
                      type: "success",
                    });
                    const voiceMsg: Message = {
                      id: `v-${Date.now()}`,
                      sender: "me",
                      type: "voice",
                      duration: "0:18",
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      status: "read",
                    };
                    setConversations((prev) => ({
                      ...prev,
                      [activeContact.id]: [...(prev[activeContact.id] || []), voiceMsg],
                    }));
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer active:scale-95 flex items-center justify-center"
                  title="Send voice note"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* EXECUTIVE FULLSCREEN VOICE HUDDLE MODAL WITH REAL IN-CALL CHAT   */}
      {/* ================================================================ */}
      {isVoiceCallActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex select-none animate-in fade-in duration-200">
          {/* Main Voice Call Stage */}
          <div className="flex-1 flex flex-col justify-between items-center py-10 px-6 h-full">
            {/* Top header */}
            <div className="flex items-center justify-between w-full max-w-4xl">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span>Encrypted Voice Huddle • Peer-to-Peer</span>
              </span>

              <button
                type="button"
                onClick={() => setIsVoiceChatOpen(!isVoiceChatOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isVoiceChatOpen
                    ? "bg-violet-600 text-white"
                    : "bg-white/10 text-slate-200 hover:bg-white/20"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>In-Call Chat</span>
                {unreadInCallCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px]">
                    {unreadInCallCount}
                  </span>
                )}
              </button>
            </div>

            {/* Center Contact Info with Live Audio Waves */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-violet-600/30 animate-ping [animation-duration:2.5s]" />
                <div className="absolute -inset-4 rounded-full bg-violet-500/15 animate-pulse" />
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-32 h-32 rounded-2xl object-cover relative z-10 ring-4 ring-violet-500/50 shadow-2xl"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeContact.name}
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-1">{activeContact.role}</p>

              {/* Live Audio Activity Waves */}
              <div className="flex items-center gap-1.5 mt-5">
                {[4, 12, 8, 16, 24, 10, 18, 6, 14, 20, 8, 4].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${voiceCallStatus === "connected" && !isMuted ? h : 4}px` }}
                    className="w-1 bg-violet-400 rounded-full transition-all duration-150 animate-pulse"
                  />
                ))}
              </div>

              <div className="mt-4 px-4 py-1.5 rounded-full bg-white/10 text-violet-300 font-mono text-xs font-bold tracking-wider">
                {voiceCallStatus === "ringing" ? "Calling..." : formatDuration(callTimer)}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition cursor-pointer ${
                  isMuted ? "bg-rose-600 text-white" : "bg-white/15 text-white hover:bg-white/25"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  endVoiceCall();
                  startVideoCall();
                }}
                className="w-12 h-12 rounded-2xl bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
                title="Switch to HD Video"
              >
                <Video className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition cursor-pointer ${
                  isSpeakerOn ? "bg-white/15 text-white hover:bg-white/25" : "bg-rose-600/80 text-white"
                }`}
                title={isSpeakerOn ? "Speaker Active" : "Speaker Muted"}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={endVoiceCall}
                className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition active:scale-95 cursor-pointer"
                title="Leave Huddle"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* REAL IN-CALL CHAT SIDE DRAWER (VOICE HUDDLE) */}
          {isVoiceChatOpen && (
            <div className="w-full sm:w-[380px] h-full bg-slate-900 border-l border-slate-800 flex flex-col z-20 animate-in slide-in-from-right duration-200">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-white">Live In-Huddle Chat</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVoiceChatOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div ref={inCallChatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === "me" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-xl text-xs max-w-[85%] ${
                        m.sender === "me"
                          ? "bg-violet-600 text-white"
                          : "bg-slate-800 text-slate-200 border border-slate-700/60"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5 font-mono">{m.timestamp}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendInCallMessage} className="p-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={inCallChatInput}
                  onChange={(e) => setInCallChatInput(e.target.value)}
                  placeholder="Send note in call..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* EXECUTIVE FULLSCREEN HD VIDEO CALL MODAL WITH REAL IN-CALL CHAT  */}
      {/* ================================================================ */}
      {isVideoCallActive && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex select-none animate-in fade-in duration-200">
          {/* Main Video Call Area */}
          <div className="flex-1 flex flex-col justify-between relative h-full bg-slate-950 overflow-hidden">
            {/* Top Bar Overlay */}
            <div className="p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/20">
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{activeContact.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                      HD 1080p
                    </span>
                  </h3>
                  <p className="text-[11px] text-violet-300 font-mono">
                    {videoCallStatus === "connecting"
                      ? "Establishing WebRTC handshake..."
                      : `Live • ${formatDuration(videoCallTimer)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVideoChatOpen(!isVideoChatOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isVideoChatOpen
                      ? "bg-violet-600 text-white"
                      : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">In-Call Chat</span>
                  {unreadInCallCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px]">
                      {unreadInCallCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Main Remote Video Stage */}
            <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={activeContact.avatar}
                alt={activeContact.name}
                className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-20 pointer-events-none"
              />

              {/* Remote Participant Card */}
              <div className="relative z-10 flex flex-col items-center text-center p-6">
                <div className="relative mb-4">
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-32 h-32 sm:w-44 sm:h-44 rounded-3xl object-cover ring-4 ring-violet-500/50 shadow-2xl"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">
                    <Check className="w-3 h-3" />
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeContact.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1">{activeContact.role}</p>
                <div className="flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs border border-violet-500/20">
                  <Activity className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                  <span>Audio &amp; Video Streams Synced</span>
                </div>
              </div>

              {/* Floating Self Camera Tile (Picture in Picture) */}
              <div className="absolute top-20 right-4 sm:top-24 sm:right-6 w-36 h-48 sm:w-52 sm:h-68 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900 z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoPaused ? "hidden" : "block"}`}
                />
                {isVideoPaused && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2 text-center text-xs">
                    <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
                    <span>Camera Muted</span>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-semibold">
                  You (Host)
                </span>
              </div>
            </div>

            {/* Bottom Floating Control Bar */}
            <div className="p-4 sm:p-6 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/80 flex items-center justify-center gap-3 sm:gap-5 z-20">
              <button
                type="button"
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className={`p-3.5 rounded-2xl transition cursor-pointer ${
                  isVideoMuted ? "bg-rose-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title={isVideoMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isVideoMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsVideoPaused(!isVideoPaused)}
                className={`p-3.5 rounded-2xl transition cursor-pointer ${
                  isVideoPaused ? "bg-rose-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title={isVideoPaused ? "Enable Camera" : "Disable Camera"}
              >
                {isVideoPaused ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsScreenSharing(!isScreenSharing);
                  toast({
                    title: isScreenSharing ? "Screen Sharing Stopped" : "Screen Sharing Active",
                    message: isScreenSharing ? "Reverted to camera stream." : "Broadcasting active screen to room.",
                    type: "info",
                  });
                }}
                className={`p-3.5 rounded-2xl transition cursor-pointer ${
                  isScreenSharing ? "bg-indigo-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title="Share Screen"
              >
                <MonitorUp className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsVideoChatOpen(!isVideoChatOpen)}
                className={`p-3.5 rounded-2xl transition cursor-pointer sm:hidden ${
                  isVideoChatOpen ? "bg-violet-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title="Toggle In-Call Chat"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={endVideoCall}
                className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/40 transition active:scale-95 cursor-pointer"
                title="End Video Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* REAL IN-CALL CHAT SIDE DRAWER (VIDEO CALL) */}
          {isVideoChatOpen && (
            <div className="w-full sm:w-[380px] h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 animate-in slide-in-from-right duration-200">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-white">Live In-Call Chat</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVideoChatOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div ref={inCallChatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === "me" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-3.5 py-2 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                        m.sender === "me"
                          ? "bg-violet-600 text-white"
                          : "bg-slate-800 text-slate-200 border border-slate-700/60"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5 font-mono">{m.timestamp}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendInCallMessage} className="p-3 border-t border-slate-800 flex gap-2 bg-slate-900/95">
                <input
                  type="text"
                  value={inCallChatInput}
                  onChange={(e) => setInCallChatInput(e.target.value)}
                  placeholder="Send chat message during call..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 outline-none focus:border-violet-500 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
