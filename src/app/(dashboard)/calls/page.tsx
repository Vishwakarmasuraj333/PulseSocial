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
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "online" | "offline" | "typing";
  lastSeen?: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender: "me" | "contact" | "system";
  text?: string;
  type: "text" | "voice" | "call_log" | "image";
  timestamp: string;
  duration?: string; // For voice notes
  callType?: "voice" | "video";
  callDuration?: string;
  status?: "sent" | "delivered" | "read";
}

interface CallLog {
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
    status: "offline",
    lastSeen: "Today at 4:15 PM",
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
    lastSeen: "Yesterday",
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
      text: "Hey! Just reviewed the multi-channel analytics for this week. Traffic is up 42%.",
      type: "text",
      timestamp: "10:30 AM",
      status: "read",
    },
    {
      id: "m2",
      sender: "me",
      text: "That is fantastic! The new Pinterest and Instagram reels workflow worked wonders.",
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
      text: "Can we hop on a quick voice or video call to align on the next product release?",
      type: "text",
      timestamp: "10:40 AM",
      status: "read",
    },
  ],
  sophia: [
    {
      id: "s1",
      sender: "contact",
      text: "All 12 scheduled posts for tomorrow have been reviewed and approved!",
      type: "text",
      timestamp: "09:15 AM",
      status: "read",
    },
    {
      id: "s2",
      sender: "me",
      text: "Awesome work Sophia! Let's monitor the engagement spikes around 2 PM.",
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
      text: "Generated 5 AI carousel drafts using Gemini 3.8. Ready for your review.",
      type: "text",
      timestamp: "Yesterday",
      status: "read",
    },
  ],
  elena: [
    {
      id: "e1",
      sender: "contact",
      text: "Great branding consistency in the latest campaign! The royal purple look is sharp.",
      type: "text",
      timestamp: "11:05 AM",
      status: "read",
    },
  ],
  david: [
    {
      id: "d1",
      sender: "contact",
      text: "Received the Q4 social report. The enterprise stakeholder deck looks great.",
      type: "text",
      timestamp: "Yesterday",
      status: "read",
    },
  ],
  sarah: [
    {
      id: "sa1",
      sender: "contact",
      text: "Replying to pending customer mentions across Facebook & Twitter now.",
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

export default function WhatsAppCallsHubPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Active Tab: "chats" | "calls" | "rooms"
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

  // Voice Call Modal State
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceCallStatus, setVoiceCallStatus] = useState<"ringing" | "connected" | "ended">("ringing");
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Video Call Modal State
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [videoCallStatus, setVideoCallStatus] = useState<"connecting" | "connected">("connecting");
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [videoCallTimer, setVideoCallTimer] = useState(0);

  // WebRTC / Camera Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringOscillatorRef = useRef<OscillatorNode | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

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

  // Voice call timer
  useEffect(() => {
    let interval: any;
    if (isVoiceCallActive && voiceCallStatus === "connected") {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVoiceCallActive, voiceCallStatus]);

  // Video call timer
  useEffect(() => {
    let interval: any;
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
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

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

  // Start WhatsApp Voice Call
  const startVoiceCall = (contact?: Contact) => {
    const target = contact || activeContact;
    setSelectedContactId(target.id);
    setIsVoiceCallActive(true);
    setVoiceCallStatus("ringing");
    setCallTimer(0);
    setIsMuted(false);
    playRingTone();

    // Auto connect after 2.5 seconds simulation
    setTimeout(() => {
      stopRingTone();
      setVoiceCallStatus("connected");
      toast({
        title: "Voice Call Connected",
        message: `Talking with ${target.name}`,
        type: "success",
      });
    }, 2500);
  };

  // End Voice Call
  const endVoiceCall = () => {
    stopRingTone();
    const durationStr = formatDuration(callTimer);
    setIsVoiceCallActive(false);

    // Append to call log
    const newLog: CallLog = {
      id: `cl-${Date.now()}`,
      contactId: activeContact.id,
      contactName: activeContact.name,
      contactAvatar: activeContact.avatar,
      type: "voice",
      direction: "outgoing",
      timestamp: "Just now",
      duration: durationStr !== "00:00" ? durationStr : "1m 12s",
    };
    setCallLogs((prev) => [newLog, ...prev]);

    // Append call event to chat
    const newMsg: Message = {
      id: `call-${Date.now()}`,
      sender: "system",
      type: "call_log",
      callType: "voice",
      callDuration: durationStr !== "00:00" ? durationStr : "1m 12s",
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

  // Start WhatsApp Video Call
  const startVideoCall = async (contact?: Contact) => {
    const target = contact || activeContact;
    setSelectedContactId(target.id);
    setIsVideoCallActive(true);
    setVideoCallStatus("connecting");
    setVideoCallTimer(0);
    setIsVideoMuted(false);
    setIsVideoPaused(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setTimeout(() => {
        setVideoCallStatus("connected");
      }, 1500);
    } catch {
      // Fallback if hardware permissions absent
      setTimeout(() => {
        setVideoCallStatus("connected");
      }, 1500);
    }
  };

  // End Video Call
  const endVideoCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsVideoCallActive(false);
    const durationStr = formatDuration(videoCallTimer);

    // Append to call log
    const newLog: CallLog = {
      id: `cl-${Date.now()}`,
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

  // Send WhatsApp message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
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

    // Deliver tick update
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
    }, 800);

    // Realistic smart response from contact
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        "Got it! I'm reviewing the scheduled posts now.",
        "Perfect. Let's touch base on the video call shortly if needed.",
        "Understood, publishing across all channels as scheduled!",
        "Thanks for the update! The engagement metrics look solid.",
        "Sounds great. I'll share the summary with the marketing team.",
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
    }, 2000);
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
      <div className="h-[calc(100vh-4rem)] w-full flex bg-[#F0F2F5] dark:bg-[#0C1317] font-sans overflow-hidden select-none">
        {/* ============================================================ */}
        {/* LEFT COLUMN: WhatsApp Navigation & Conversations Drawer       */}
        {/* ============================================================ */}
        <div className="w-full sm:w-[380px] lg:w-[420px] shrink-0 flex flex-col bg-white dark:bg-[#111B21] border-r border-slate-200 dark:border-white/10 h-full">
          {/* Top WhatsApp Header */}
          <div className="h-16 px-4 bg-[#F0F2F5] dark:bg-[#202C33] flex items-center justify-between border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#5846A8]/30 dark:ring-amber-400/40"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#5846A8] dark:bg-amber-400 rounded-full border-2 border-white dark:border-[#202C33]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  PulseSocial Hub
                </h2>
                <span className="text-[11px] font-semibold text-[#5846A8] dark:text-amber-400">
                  Calls &amp; Conversations
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => startVoiceCall()}
                className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-[#5846A8] dark:hover:text-amber-400 hover:bg-purple-50 dark:hover:bg-amber-500/10 transition cursor-pointer"
                title="Quick Voice Call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => startVideoCall()}
                className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-[#5846A8] dark:hover:text-amber-400 hover:bg-purple-50 dark:hover:bg-amber-500/10 transition cursor-pointer"
                title="Quick Video Call"
              >
                <Video className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Chats, Calls, Instant Meeting Rooms) */}
          <div className="flex border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111B21]">
            <button
              type="button"
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "chats"
                  ? "border-[#5846A8] text-[#5846A8] dark:border-amber-400 dark:text-amber-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHATS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("calls")}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "calls"
                  ? "border-[#5846A8] text-[#5846A8] dark:border-amber-400 dark:text-amber-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>CALLS</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-[#5846A8] dark:bg-amber-400/20 dark:text-amber-300 text-[10px] font-bold">
                {callLogs.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rooms")}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "rooms"
                  ? "border-[#5846A8] text-[#5846A8] dark:border-amber-400 dark:text-amber-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>ROOMS</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-2.5 bg-white dark:bg-[#111B21] border-b border-slate-100 dark:border-white/5">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or start new conversation..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-[#F0F2F5] dark:bg-[#202C33] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#5846A8] dark:focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* TAB 1: CHATS LIST */}
          {activeTab === "chats" && (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              {filteredContacts.map((contact) => {
                const isSelected = contact.id === selectedContactId;
                const lastMsg = conversations[contact.id]?.slice(-1)[0];
                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
                      isSelected
                        ? "bg-purple-50/80 dark:bg-[#201C14] border-l-3 border-[#5846A8] dark:border-amber-400"
                        : "hover:bg-slate-50 dark:hover:bg-[#1A2228]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {contact.status === "online" && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#5846A8] dark:bg-amber-400 rounded-full border-2 border-white dark:border-[#111B21]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {contact.name}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {lastMsg ? lastMsg.timestamp : "Recent"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate pr-2">
                          {lastMsg?.type === "voice"
                            ? "🎤 Voice message (0:24)"
                            : lastMsg?.type === "call_log"
                            ? `${lastMsg.callType === "voice" ? "📞 Voice call" : "📹 Video call"}`
                            : lastMsg?.text || contact.role}
                        </p>
                        {contact.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[#5846A8] dark:bg-amber-400 text-white dark:text-slate-950 text-[10px] font-bold flex items-center justify-center shrink-0">
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
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              <div className="p-3 bg-slate-50 dark:bg-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Recent Call Logs
              </div>
              {callLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#202C33] transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={log.contactAvatar}
                      alt={log.contactName}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {log.contactName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {log.direction === "incoming" && (
                          <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        {log.direction === "outgoing" && (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        {log.direction === "missed" && (
                          <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />
                        )}
                        <span>{log.timestamp}</span>
                        {log.duration && <span>• {log.duration}</span>}
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
                        className="p-2 rounded-full text-[#5846A8] dark:text-amber-400 hover:bg-purple-50 dark:hover:bg-amber-400/10 transition cursor-pointer"
                        title="Call Back (Voice)"
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
                        className="p-2 rounded-full text-[#5846A8] dark:text-amber-400 hover:bg-purple-50 dark:hover:bg-amber-400/10 transition cursor-pointer"
                        title="Call Back (Video)"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: INSTANT WebRTC ROOMS */}
          {activeTab === "rooms" && (
            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4E3B99] via-[#5846A8] to-[#6C55C4] dark:bg-gradient-to-br dark:from-[#2E220F] dark:to-[#1A1408] dark:border dark:border-amber-500/30 text-white shadow-lg shadow-purple-600/20 dark:shadow-amber-500/10">
                <Radio className="w-6 h-6 mb-2 text-white dark:text-amber-400 animate-pulse" />
                <h3 className="font-bold text-sm text-white dark:text-amber-200">Instant Video Conference</h3>
                <p className="text-xs text-white/80 dark:text-amber-200/70 mt-1 leading-relaxed">
                  Start or enter a secure WebRTC meeting room for multi-member standups.
                </p>
                <button
                  type="button"
                  onClick={() => handleJoinOrCreateRoom(`pulse-${Math.random().toString(36).substring(2, 7)}`)}
                  className="mt-3 px-4 py-2 bg-white text-[#5846A8] dark:bg-amber-400 dark:text-slate-950 rounded-xl font-bold text-xs shadow-md hover:bg-purple-50 dark:hover:bg-amber-300 transition cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New Meeting</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enter Meeting Code:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    placeholder="e.g. pulse-standup"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-[#F0F2F5] dark:bg-[#202C33] text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#5846A8] dark:focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleJoinOrCreateRoom()}
                    className="px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#4E3B99] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    Join
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Preset Team Channels:
                </span>
                <div className="mt-2 space-y-1.5">
                  {["pulse-standup", "social-review", "weekly-sync"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleJoinOrCreateRoom(code)}
                      className="w-full px-3 py-2 text-left rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-amber-500/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#5846A8] dark:hover:text-amber-300 transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-mono">#{code}</span>
                      <Video className="w-3.5 h-3.5 text-[#5846A8] dark:text-amber-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: WhatsApp Active Conversation Canvas             */}
        {/* ============================================================ */}
        <div className="hidden sm:flex flex-1 flex-col h-full bg-[#EFEAE2] dark:bg-[#0B141A] relative">
          {/* WhatsApp Header for Active Contact */}
          <div className="h-16 px-5 bg-[#F0F2F5] dark:bg-[#202C33] flex items-center justify-between border-b border-slate-200 dark:border-white/10 z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {activeContact.status === "online" && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#5846A8] dark:bg-amber-400 rounded-full border border-white dark:border-[#202C33]" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {activeContact.name}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {isTyping ? (
                    <span className="text-[#5846A8] dark:text-amber-400 font-semibold">typing...</span>
                  ) : activeContact.status === "online" ? (
                    <span className="text-[#5846A8] dark:text-amber-400 font-semibold">online</span>
                  ) : (
                    activeContact.lastSeen || "offline"
                  )}
                </p>
              </div>
            </div>

            {/* Direct WhatsApp Voice Call & Video Call Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startVoiceCall()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/10 hover:bg-purple-50 dark:hover:bg-amber-500/15 border border-purple-200/80 dark:border-amber-500/30 text-[#5846A8] dark:text-amber-300 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                title="Start WhatsApp Voice Call"
              >
                <Phone className="w-4 h-4" />
                <span>Voice Call</span>
              </button>

              <button
                type="button"
                onClick={() => startVideoCall()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#4E3B99] via-[#5846A8] to-[#6C55C4] hover:opacity-95 dark:from-amber-400 dark:to-yellow-500 text-white dark:text-slate-950 text-xs font-bold transition shadow-md shadow-purple-600/25 dark:shadow-[0_0_15px_rgba(251,191,36,0.3)] cursor-pointer active:scale-95"
                title="Start WhatsApp Video Call"
              >
                <Video className="w-4 h-4" />
                <span>Video Call</span>
              </button>

              <div className="h-5 w-px bg-slate-300 dark:bg-white/15 mx-1" />

              <button
                type="button"
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
                title="Search conversation"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
                title="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed Area with WhatsApp Wallpaper Pattern */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 relative"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.02) 0%, transparent 100%)",
            }}
          >
            {/* Encryption notice banner */}
            <div className="w-fit max-w-md mx-auto text-center px-4 py-1.5 rounded-lg bg-amber-100/80 dark:bg-[#182229] border border-amber-200/50 dark:border-white/5 text-[11px] text-amber-800 dark:text-amber-200/90 shadow-2xs">
              🔒 Messages and calls are end-to-end encrypted across your PulseSocial team.
            </div>

            {/* Date divider */}
            <div className="flex items-center justify-center my-3">
              <span className="px-3 py-1 rounded-md bg-white/90 dark:bg-[#182229] text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                TODAY
              </span>
            </div>

            {/* Conversation Bubbles */}
            {activeMessages.map((msg) => {
              if (msg.type === "call_log") {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#182229] border border-slate-200/60 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
                      {msg.callType === "voice" ? (
                        <PhoneCall className="w-3.5 h-3.5 text-[#5846A8] dark:text-amber-400" />
                      ) : (
                        <Video className="w-3.5 h-3.5 text-[#5846A8] dark:text-amber-400" />
                      )}
                      <span className="font-semibold">
                        {msg.callType === "voice" ? "Voice call ended" : "Video call ended"}
                      </span>
                      {msg.callDuration && (
                        <span className="text-slate-400 font-mono">({msg.callDuration})</span>
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
                    className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-3.5 py-2 shadow-xs text-xs relative leading-relaxed ${
                      isMe
                        ? "bg-[#EBE7FF] dark:bg-gradient-to-br dark:from-[#2B2315] dark:to-[#1E180E] text-[#221648] dark:text-amber-100 border border-purple-200/70 dark:border-amber-500/30 rounded-tr-xs"
                        : "bg-white dark:bg-[#1E272D] text-slate-900 dark:text-slate-100 rounded-tl-xs"
                    }`}
                  >
                    {msg.type === "voice" ? (
                      <div className="flex items-center gap-3 py-1 min-w-[200px]">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full bg-[#5846A8] hover:bg-[#4E3B99] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 flex items-center justify-center transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="h-1 bg-slate-300 dark:bg-white/20 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-[#5846A8] dark:bg-amber-400" />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-300">
                            {msg.duration || "0:14"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="pr-12">{msg.text}</p>
                    )}

                    <div className="flex items-center gap-1 justify-end float-right -mt-2 -mr-1">
                      <span className="text-[10px] text-slate-500 dark:text-white/60 font-mono">
                        {msg.timestamp}
                      </span>
                      {isMe && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#5846A8] dark:text-amber-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#202C33] text-xs text-slate-500 dark:text-slate-400 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5846A8] dark:bg-amber-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#5846A8] dark:bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#5846A8] dark:bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1">{activeContact.name} is typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Reaction Emojis Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 p-2 rounded-2xl bg-white dark:bg-[#202C33] border border-slate-200 dark:border-white/10 shadow-2xl flex items-center gap-2 z-20 animate-in fade-in zoom-in-95">
              {["👍", "❤️", "🔥", "🚀", "👏", "🎉", "🙏", "✅"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputMessage((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-base flex items-center justify-center transition cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Bottom WhatsApp Message Input Bar */}
          <div className="px-4 py-3 bg-[#F0F2F5] dark:bg-[#202C33] flex items-center gap-2.5 z-10 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Add Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                toast({
                  title: "Attach File",
                  message: "Choose an image, document, or video to share.",
                  type: "info",
                });
              }}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Attach media or document"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 py-2 px-4 rounded-xl bg-white dark:bg-[#2A3942] text-slate-900 dark:text-white placeholder:text-slate-400 text-xs outline-none focus:ring-1 focus:ring-[#5846A8] dark:focus:ring-amber-400 transition"
              />

              {inputMessage.trim() ? (
                <button
                  type="submit"
                  className="p-2.5 rounded-full bg-[#5846A8] hover:bg-[#4E3B99] dark:bg-gradient-to-r dark:from-amber-400 dark:to-yellow-500 text-white dark:text-slate-950 transition shadow-sm cursor-pointer active:scale-95 flex items-center justify-center"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    toast({
                      title: "Voice Note Recorded",
                      message: "0:12 audio snippet ready to send.",
                      type: "success",
                    });
                    const voiceMsg: Message = {
                      id: `v-${Date.now()}`,
                      sender: "me",
                      type: "voice",
                      duration: "0:12",
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      status: "read",
                    };
                    setConversations((prev) => ({
                      ...prev,
                      [activeContact.id]: [...(prev[activeContact.id] || []), voiceMsg],
                    }));
                  }}
                  className="p-2.5 rounded-full bg-[#5846A8] hover:bg-[#4E3B99] dark:bg-gradient-to-r dark:from-amber-400 dark:to-yellow-500 text-white dark:text-slate-950 transition shadow-sm cursor-pointer active:scale-95 flex items-center justify-center"
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
      {/* FULLSCREEN WHATSAPP VOICE CALL MODAL OVERLAY                      */}
      {/* ================================================================ */}
      {isVoiceCallActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between items-center py-12 px-4 animate-in fade-in duration-200 select-none">
          {/* Top header */}
          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5846A8]/25 text-purple-300 dark:bg-amber-400/20 dark:text-amber-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>WhatsApp End-to-End Encrypted Voice Call</span>
            </span>
          </div>

          {/* Center Contact Info with Pulsing Rings */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-[#5846A8]/30 dark:bg-amber-400/20 animate-ping [animation-duration:2s]" />
              <div className="absolute -inset-4 rounded-full bg-[#5846A8]/15 dark:bg-amber-400/10 animate-pulse" />
              <img
                src={activeContact.avatar}
                alt={activeContact.name}
                className="w-32 h-32 rounded-full object-cover relative z-10 ring-4 ring-[#5846A8] dark:ring-amber-400 shadow-2xl"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeContact.name}
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-1">{activeContact.role}</p>

            <div className="mt-4 px-4 py-1.5 rounded-full bg-white/10 text-purple-300 dark:text-amber-300 font-mono text-sm font-bold tracking-wider">
              {voiceCallStatus === "ringing" ? "Ringing..." : formatDuration(callTimer)}
            </div>
          </div>

          {/* Bottom Call Controls */}
          <div className="flex items-center gap-5">
            {/* Mute button */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition cursor-pointer ${
                isMuted
                  ? "bg-rose-600 text-white"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Switch to Video Call */}
            <button
              type="button"
              onClick={() => {
                endVoiceCall();
                startVideoCall();
              }}
              className="w-14 h-14 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
              title="Switch to Video Call"
            >
              <Video className="w-6 h-6" />
            </button>

            {/* Speaker toggle */}
            <button
              type="button"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition cursor-pointer ${
                isSpeakerOn
                  ? "bg-white/15 text-white hover:bg-white/25"
                  : "bg-rose-600/80 text-white"
              }`}
              title={isSpeakerOn ? "Speaker On" : "Speaker Off"}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={endVoiceCall}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition transform active:scale-90 cursor-pointer"
              title="End Voice Call"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FULLSCREEN WHATSAPP VIDEO CALL MODAL OVERLAY (LIVE WebRTC)        */}
      {/* ================================================================ */}
      {isVideoCallActive && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between select-none animate-in fade-in duration-200">
          {/* Main Remote Video Feed */}
          <div className="relative flex-1 w-full h-full bg-[#111B21] overflow-hidden flex items-center justify-center">
            <img
              src={activeContact.avatar}
              alt={activeContact.name}
              className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-30 pointer-events-none"
            />

            {/* Remote Participant Stage */}
            <div className="relative z-10 flex flex-col items-center text-center p-4">
              <img
                src={activeContact.avatar}
                alt={activeContact.name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-[#5846A8]/60 dark:ring-amber-400/60 shadow-2xl mb-4"
              />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeContact.name}
              </h2>
              <p className="text-xs text-purple-300 dark:text-amber-400 mt-1 font-mono">
                {videoCallStatus === "connecting"
                  ? "Connecting live video..."
                  : `Live Video (${formatDuration(videoCallTimer)})`}
              </p>
            </div>

            {/* Floating Picture-in-Picture Local Self Camera Preview */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-36 h-48 sm:w-48 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900 z-20">
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
                  <span>Camera Paused</span>
                </div>
              )}
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-semibold">
                You
              </span>
            </div>
          </div>

          {/* Floating Bottom Control Bar */}
          <div className="p-6 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-4 sm:gap-6 z-20">
            {/* Toggle Mic */}
            <button
              type="button"
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className={`p-3.5 rounded-full transition cursor-pointer ${
                isVideoMuted
                  ? "bg-rose-600 text-white"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
              title={isVideoMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isVideoMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Toggle Camera */}
            <button
              type="button"
              onClick={() => setIsVideoPaused(!isVideoPaused)}
              className={`p-3.5 rounded-full transition cursor-pointer ${
                isVideoPaused
                  ? "bg-rose-600 text-white"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
              title={isVideoPaused ? "Turn On Camera" : "Turn Off Camera"}
            >
              {isVideoPaused ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Screen Share */}
            <button
              type="button"
              onClick={() => {
                setIsScreenSharing(!isScreenSharing);
                toast({
                  title: isScreenSharing ? "Screen Sharing Stopped" : "Screen Sharing Active",
                  message: isScreenSharing ? "Switched to camera." : "Sharing your active screen.",
                  type: "info",
                });
              }}
              className={`p-3.5 rounded-full transition cursor-pointer ${
                isScreenSharing
                  ? "bg-blue-600 text-white"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
              title="Share Screen"
            >
              <MonitorUp className="w-5 h-5" />
            </button>

            {/* End Video Call */}
            <button
              type="button"
              onClick={endVideoCall}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/40 transition active:scale-95 cursor-pointer"
              title="End Video Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
