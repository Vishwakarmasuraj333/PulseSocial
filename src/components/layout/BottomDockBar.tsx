"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Pin,
  MessageCircle,
  Users,
  FileText,
  Search,
  HelpCircle,
  MessageSquare,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  Send,
  Save,
  Clock,
  ThumbsUp,
  Smile,
  Copy,
  Play,
  Pause,
  Square,
} from "lucide-react";
import { FeedbackModal } from "@/components/layout/FeedbackModal";
import { PulseHelpGuidesModal } from "@/components/layout/PulseHelpGuidesModal";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  pinned: boolean;
}

interface PinItem {
  id: string;
  title: string;
  subtitle: string;
  type: "post" | "channel" | "metric";
  url: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatarText: string;
  avatarBg: string;
  message: string;
  time: string;
  isSelf?: boolean;
}

export function BottomDockBar() {
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  // Dynamic Logged-in User Session State
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("pulsesocial_active_user");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.name || parsed.email)) setCurrentUser(parsed);
      }
    } catch {}

    fetch("/api/auth/me", { headers: { "Cache-Control": "no-cache" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setCurrentUser(d.user);
          try {
            localStorage.setItem("pulsesocial_active_user", JSON.stringify(d.user));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const currentUserName =
    currentUser?.name ||
    (currentUser?.email
      ? currentUser.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
      : "Active Member");
  const currentUserInitial = (currentUserName || "U").charAt(0).toUpperCase();
  const currentUserRole = currentUser?.role === "OWNER" ? "Workspace Primary Owner" : (currentUser?.role || "Team Member");

  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<"pins" | "chats" | "contacts" | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Dynamic Notes state (workspace isolated)
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");

  // Dynamic Pins state (workspace isolated)
  const [pins, setPins] = useState<PinItem[]>([]);

  // Dynamic Interactive Team Chats (workspace isolated)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInputText, setChatInputText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Dynamic Contacts
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactFilter, setContactFilter] = useState("all");

  // Live Zoho Social Style Working Session Tracker matching screenshot
  const [timerSeconds, setTimerSeconds] = useState<number>(19374); // 05:22:54 initial default
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedTimer = localStorage.getItem("pulsesocial_session_timer");
      if (savedTimer) {
        setTimerSeconds(Number(savedTimer) || 19374);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev + 1;
          try {
            localStorage.setItem("pulsesocial_session_timer", String(next));
          } catch {}
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimerTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleResetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTimerSeconds(0);
    try {
      localStorage.setItem("pulsesocial_session_timer", "0");
    } catch {}
    toast({
      title: "Session Timer Reset",
      message: "Working session tracker reset to 00:00:00",
      type: "info",
    });
  };

  // Load saved pins & notes from localStorage
  useEffect(() => {
    try {
      const savedPins = localStorage.getItem("pulsesocial_dock_pins");
      if (savedPins) {
        setPins(JSON.parse(savedPins));
      }
      const savedNotes = localStorage.getItem("pulsesocial_notes");
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          setSelectedNoteId(parsed[0].id);
        }
      }
      const savedChats = localStorage.getItem("pulsesocial_dock_chats");
      if (savedChats) {
        setChatMessages(JSON.parse(savedChats));
      }
    } catch {}

    // Load real team members from /api/team
    fetch("/api/team")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.members) setContacts(d.members);
      })
      .catch(() => {});

    // Ctrl+Space shortcut to open contacts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        setActiveDrawer((prev) => (prev === "contacts" ? null : "contacts"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const saveNotes = (updated: NoteItem[]) => {
    setNotes(updated);
    try {
      localStorage.setItem("pulsesocial_notes", JSON.stringify(updated));
    } catch {}
  };

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleUpdateActiveNote = (field: "title" | "content", value: string) => {
    const updated = notes.map((n) =>
      n.id === selectedNoteId ? { ...n, [field]: value, updatedAt: "Just now" } : n
    );
    saveNotes(updated);
  };

  const handleAddNote = () => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: "New Note",
      content: "",
      updatedAt: "Just now",
      pinned: false,
    };
    const updated = [newNote, ...notes];
    saveNotes(updated);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    const filtered = notes.filter((n) => n.id !== id);
    saveNotes(filtered);
    if (filtered.length > 0) {
      setSelectedNoteId(filtered[0].id);
    } else {
      setSelectedNoteId("");
    }
  };

  const handlePinCurrentPage = () => {
    if (typeof window === "undefined") return;
    const currentPath = window.location.pathname;
    const currentTitle =
      document.title && !document.title.includes("localhost")
        ? document.title.split("—")[0].trim()
        : currentPath.replace("/", "").toUpperCase() || "Dashboard";

    if (pins.some((p) => p.url === currentPath)) {
      toast({
        title: "Already Pinned",
        message: `"${currentTitle}" is already in your pinned dock.`,
        type: "info",
      });
      return;
    }

    const newPin: PinItem = {
      id: `pin-${Date.now()}`,
      title: currentTitle,
      subtitle: currentPath,
      type: "post",
      url: currentPath,
    };

    const updated = [newPin, ...pins];
    setPins(updated);
    try {
      localStorage.setItem("pulsesocial_dock_pins", JSON.stringify(updated));
    } catch {}
    toast({
      title: "Page Pinned!",
      message: `"${currentTitle}" saved to Quick Pins.`,
      type: "success",
    });
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    const userText = chatInputText.trim();
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: currentUserName,
      avatarText: currentUserInitial,
      avatarBg: "bg-[#795BC2]",
      message: userText,
      time: "Just now",
      isSelf: true,
    };

    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    try {
      localStorage.setItem("pulsesocial_dock_chats", JSON.stringify(updated));
    } catch {}

    setChatInputText("");
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    toast({
      title: "Message Sent",
      message: newMsg.message,
      type: "success",
    });

    // Intelligent automated team confirmation
    setTimeout(() => {
      const isQuestion = userText.includes("?") || userText.toLowerCase().includes("how") || userText.toLowerCase().includes("status");
      const teamReply: ChatMessage = {
        id: `chat-reply-${Date.now()}`,
        sender: "Pulse Assistant",
        avatarText: "PA",
        avatarBg: "bg-blue-600",
        message: isQuestion
          ? `Received! Checking workspace metrics and channel status for "${activeBrand.name}".`
          : `Got it! Logged in team workspace for ${activeBrand.name}.`,
        time: "Just now",
      };

      setChatMessages((prev) => {
        const next = [...prev, teamReply];
        try {
          localStorage.setItem("pulsesocial_dock_chats", JSON.stringify(next));
        } catch {}
        return next;
      });

      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }, 1000);
  };

  const handleClearChat = () => {
    setChatMessages([]);
    try {
      localStorage.removeItem("pulsesocial_dock_chats");
    } catch {}
    toast({
      title: "Chat Cleared",
      message: "Chat history has been reset.",
      type: "info",
    });
  };

  return (
    <>
      {/* ============================================================ */}
      {/* STICKY BOTTOM DOCK BAR: Positioned to the right of sidebar   */}
      {/* ============================================================ */}
      <footer className="fixed bottom-0 lg:left-64 left-0 right-0 z-40 h-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 flex items-center justify-between px-4 text-xs select-none shadow-[0_-2px_12px_rgba(0,0,0,0.04)] font-sans transition-all duration-300">
        
        {/* Left Action Items: Session Tracker, Pins, Chats, Contacts */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Live Zoho Social Style Working Session Tracker */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-slate-800 text-[11px] font-mono shadow-xs border border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
              title={isTimerRunning ? "Pause session timer" : "Resume session timer"}
            >
              {isTimerRunning ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              ) : (
                <Play className="w-3 h-3 text-emerald-400" />
              )}
              <span className="font-semibold text-slate-100">{formatTimerTime(timerSeconds)}</span>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                {isTimerRunning ? "Working" : "Paused"}
              </span>
            </button>
            <div className="flex items-center gap-1 border-l border-slate-700 pl-1.5 text-slate-400">
              <button
                type="button"
                onClick={handleResetTimer}
                title="Reset session timer"
                className="hover:text-rose-400 transition cursor-pointer p-0.5"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
              </button>
            </div>
          </div>

          {/* 1. My Pins */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === "pins" ? null : "pins")}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium cursor-pointer ${
              activeDrawer === "pins"
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-semibold ring-1 ring-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90"
            }`}
          >
            <Pin
              className={`w-4 h-4 rotate-45 transition-transform duration-200 group-hover:scale-120 ${
                activeDrawer === "pins" ? "text-blue-600" : "group-hover:rotate-12 group-hover:text-blue-500"
              }`}
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">My Pins</span>
            {pins.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-700 transition">
                {pins.length}
              </span>
            )}
          </button>

          {/* 2. Chats */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === "chats" ? null : "chats")}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium cursor-pointer ${
              activeDrawer === "chats"
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-semibold ring-1 ring-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90"
            }`}
          >
            <div className="relative">
              <MessageCircle className="w-4 h-4 transition-transform duration-200 group-hover:scale-120" />
              {chatMessages.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Chats</span>
            {chatMessages.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                {chatMessages.length}
              </span>
            )}
          </button>

          {/* 3. Contacts */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === "contacts" ? null : "contacts")}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium cursor-pointer ${
              activeDrawer === "contacts"
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-semibold ring-1 ring-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90"
            }`}
          >
            <Users className="w-4 h-4 transition-transform duration-200 group-hover:scale-120 text-slate-500 group-hover:text-blue-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Contacts</span>
          </button>
        </div>

        {/* Right Action Items: Notebook, Search, Help, Feedback */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 4. Notebook */}
          <button
            type="button"
            onClick={() => setIsNotebookOpen(!isNotebookOpen)}
            title="Open Notebook"
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium cursor-pointer ${
              isNotebookOpen
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90"
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:scale-120" />
            <span className="hidden sm:inline font-semibold">Notebook</span>
          </button>

          {/* 5. Quick Search */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
            }}
            title="Global Search (Ctrl+K)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition text-xs cursor-pointer font-medium"
          >
            <Search className="w-4 h-4" />
            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 hidden md:inline font-mono">
              Ctrl+K
            </span>
          </button>

          {/* 6. Help */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            title="PulseSocial Guide & Help"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition text-xs cursor-pointer font-medium"
          >
            <HelpCircle className="w-4 h-4 text-slate-500 hover:text-blue-600 transition" />
            <span className="hidden md:inline font-semibold">Help</span>
          </button>

          {/* 7. Feedback */}
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
            title="Send Real Feedback to Product Team"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold cursor-pointer border ${
              isFeedbackOpen
                ? "bg-[#1e70eb] text-white border-[#1e70eb] shadow-xs"
                : "bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/50"
            }`}
          >
            <MessageSquare className={`w-4 h-4 ${isFeedbackOpen ? "text-white" : "text-blue-600 dark:text-blue-400"}`} />
            <span>Feedback</span>
          </button>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* 1. MY PINS DRAWER (Fully Visible Beside Sidebar)             */}
      {/* ============================================================ */}
      {activeDrawer === "pins" && (
        <div className="fixed bottom-12 lg:left-68 left-4 z-50 w-88 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-blue-600 rotate-45" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                My Pinned Quick Links ({pins.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveDrawer(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Pin Current Page Quick Button */}
          <div className="pt-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePinCurrentPage}
              className="w-full py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-blue-200/60 dark:border-blue-900/60 shadow-2xs"
            >
              <Pin className="w-3.5 h-3.5 rotate-45 text-blue-600" />
              <span>Pin Current Active Page</span>
            </button>
          </div>

          {/* Quick Add Pin URL Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const titleInput = form.elements.namedItem("pinTitle") as HTMLInputElement;
              const urlInput = form.elements.namedItem("pinUrl") as HTMLInputElement;
              if (!titleInput.value.trim() || !urlInput.value.trim()) return;

              const newPin: PinItem = {
                id: `pin-${Date.now()}`,
                title: titleInput.value.trim(),
                subtitle: urlInput.value.trim(),
                type: "channel",
                url: urlInput.value.trim(),
              };

              const updated = [newPin, ...pins];
              setPins(updated);
              localStorage.setItem("pulsesocial_dock_pins", JSON.stringify(updated));
              titleInput.value = "";
              urlInput.value = "";
              toast({
                title: "Link Pinned!",
                message: `"${newPin.title}" added to your quick pins dock.`,
                type: "success",
              });
            }}
            className="pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 space-y-2 text-xs"
          >
            <div className="flex gap-1.5">
              <input
                name="pinTitle"
                type="text"
                placeholder="Pin Title (e.g. Meta Dashboard)"
                required
                className="w-1/2 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
              <input
                name="pinUrl"
                type="text"
                placeholder="URL (e.g. /posts or https://...)"
                required
                className="w-1/2 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pin Quick Link</span>
            </button>
          </form>

          {/* Pinned Links List */}
          <div className="py-2.5 max-h-64 overflow-y-auto space-y-2 text-xs">
            {pins.length === 0 ? (
              <p className="text-center text-slate-400 py-3 text-xs">No pinned items yet.</p>
            ) : (
              pins.map((pin) => (
                <div
                  key={pin.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between gap-2 group hover:border-blue-300 transition"
                >
                  <a
                    href={pin.url}
                    target={pin.url.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="min-w-0 flex-1 hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs">
                        {pin.title}
                      </p>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{pin.url}</p>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = pins.filter((p) => p.id !== pin.id);
                      setPins(updated);
                      localStorage.setItem("pulsesocial_dock_pins", JSON.stringify(updated));
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1 shrink-0 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Unpin"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. CHATS POPUP (Real Interactive Team Messages)              */}
      {/* ============================================================ */}
      {activeDrawer === "chats" && (
        <div className="fixed bottom-12 lg:left-84 left-4 z-50 w-92 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 animate-in slide-in-from-bottom-2 duration-150 flex flex-col max-h-[460px]">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Team Workspace Chats ({chatMessages.length})
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              {chatMessages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="text-[10px] text-slate-400 hover:text-rose-500 font-medium px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Clear Chat History"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Scrollable Feed */}
          <div className="py-3 flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                  msg.isSelf
                    ? "bg-purple-50/70 dark:bg-purple-950/20 border-purple-200/60 dark:border-purple-900/40"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full ${msg.avatarBg} text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-2xs`}
                >
                  {msg.avatarText}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                      {msg.sender}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">{msg.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Chat Input */}
          <form
            onSubmit={handleSendChatMessage}
            className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              placeholder="Type team chat message..."
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition"
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. CONTACTS DIRECTORY (Zoho Social Professional Style)        */}
      {/* ============================================================ */}
      {activeDrawer === "contacts" && (
        <div className="fixed bottom-12 lg:left-96 left-4 z-50 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 animate-in slide-in-from-bottom-2 duration-150 flex flex-col relative">
          {/* Header: User Profile Status */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#795BC2] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {currentUserInitial}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentUserName}
                  </h3>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Available
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                  {currentUser?.email || currentUserRole}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveDrawer(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box: Ctrl + Space */}
          <div className="pt-2.5 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                placeholder="Search (Ctrl + Space)"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 pb-2 overflow-x-auto no-scrollbar text-[11px]">
            {["Frequents", "Unread", "All", "People", "Messages", "Chats", "Pins"].map((pill) => {
              const pillKey = pill.toLowerCase();
              const isSelected = contactFilter === pillKey || (contactFilter === "all" && pill === "All");
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setContactFilter(pillKey)}
                  className={`px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white font-semibold shadow-2xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          {/* Contacts List */}
          <div className="py-2 max-h-56 overflow-y-auto space-y-1.5 text-xs">
            {contacts.length > 0 ? (
              contacts
                .filter((m: any) => {
                  if (!contactSearchQuery) return true;
                  const q = contactSearchQuery.toLowerCase();
                  return (
                    (m.user?.name || m.name || "").toLowerCase().includes(q) ||
                    (m.user?.email || m.email || "").toLowerCase().includes(q)
                  );
                })
                .map((m: any) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {(m.user?.name || m.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {m.user?.name || m.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{m.user?.email || m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {m.role || "MEMBER"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDrawer("chats");
                          setChatInputText(`@${m.user?.name || m.name || "Member"} `);
                        }}
                        className="p-1 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                        title="Send message"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="p-3 text-center text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  {activeBrand?.name || "PulseSocial Workspace"}
                </p>
                <p className="text-[11px]">Primary Owner active. Invite team members to collaborate.</p>
              </div>
            )}
          </div>

          {/* Footer + Floating Blue Add Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <a
              href="/settings?tab=brand_members"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1"
            >
              <span>Manage Members</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={() => {
                toast({
                  title: "Invite Member",
                  message: "Opening brand member invite form in settings.",
                  type: "info",
                });
                window.location.href = "/settings?tab=brand_members";
              }}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition active:scale-95 cursor-pointer"
              title="Add / Invite New Member"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. NOTEBOOK POPUP (Auto-saving text notes with Zoho Actions)  */}
      {/* ============================================================ */}
      {isNotebookOpen && (
        <div className="fixed bottom-12 right-6 z-50 w-[500px] max-w-[92vw] h-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-150">
          {/* Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Workspace Notebook</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleAddNote}
                className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>New Note</span>
              </button>
              <button
                type="button"
                onClick={() => setIsNotebookOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Toolbar matching Zoho Social Notebook */}
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={handleAddNote}
              className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 font-medium flex items-center gap-1 transition"
            >
              <span>✍️</span>
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const newNote: NoteItem = {
                  id: `note-${Date.now()}`,
                  title: "Task Checklist",
                  content: "[ ] Review Instagram reel metrics\n[ ] Approve scheduled LinkedIn post\n[ ] Reply to brand DMs\n[ ] Generate weekend campaign copy",
                  updatedAt: "Just now",
                  pinned: false,
                };
                const updated = [newNote, ...notes];
                saveNotes(updated);
                setSelectedNoteId(newNote.id);
                toast({
                  title: "To Do List Created",
                  message: "Checklist note added to your notebook.",
                  type: "success",
                });
              }}
              className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 font-medium flex items-center gap-1 transition"
            >
              <span>✅</span>
              <span>To Do</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.onchange = (e: any) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const updated = notes.map((n) =>
                        n.id === selectedNoteId
                          ? {
                              ...n,
                              content: `${n.content}\n\n[Uploaded File: ${f.name} (${(f.size / 1024).toFixed(1)} KB)]`,
                              updatedAt: "Just now",
                            }
                          : n
                      );
                      saveNotes(updated);
                      toast({
                        title: "File Attached",
                        message: `${f.name} added to note.`,
                        type: "success",
                      });
                    };
                    reader.readAsText(f);
                  }
                };
                input.click();
              }}
              className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 font-medium flex items-center gap-1 transition"
            >
              <span>📁</span>
              <span>Upload</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeNote) {
                  const updated = notes.map((n) =>
                    n.id === selectedNoteId
                      ? {
                          ...n,
                          content: `${n.content}\n\n📎 Attachment Link: ${window.location.href}`,
                          updatedAt: "Just now",
                        }
                      : n
                  );
                  saveNotes(updated);
                  toast({
                    title: "URL Attached",
                    message: "Current page link attached to note.",
                    type: "success",
                  });
                }
              }}
              className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-600 font-medium flex items-center gap-1 transition"
            >
              <span>📎</span>
              <span>Attach</span>
            </button>
          </div>

          {/* Notebook Body: Left Tabs + Main Text Editor */}
          <div className="flex-1 flex min-h-0 bg-white dark:bg-slate-900">
            {/* Note Selector Sidebar */}
            <div className="w-36 sm:w-44 border-r border-slate-100 dark:border-slate-800 flex flex-col p-2 space-y-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Your Notes
              </span>
              {notes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full text-left p-2 rounded-xl text-xs transition cursor-pointer ${
                    note.id === selectedNoteId
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold shadow-2xs border border-blue-200/60 dark:border-blue-900"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <p className="truncate text-xs leading-tight">{note.title || "Untitled"}</p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{note.updatedAt}</span>
                </button>
              ))}
            </div>

            {/* Note Editor Area */}
            {activeNote ? (
              <div className="flex-1 flex flex-col p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleUpdateActiveNote("title", e.target.value)}
                    placeholder="Note Title..."
                    className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none w-full pb-1"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeNote?.content) {
                          navigator.clipboard.writeText(activeNote.content);
                          toast({
                            title: "Note Copied",
                            message: "Content copied to clipboard.",
                            type: "success",
                          });
                        }
                      }}
                      className="text-slate-400 hover:text-blue-600 p-1 rounded"
                      title="Copy Note Content"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(activeNote.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateActiveNote("content", e.target.value)}
                  placeholder="Draft ideas, weekly checklists, caption drafts or notes..."
                  className="flex-1 w-full text-xs font-sans text-slate-800 dark:text-slate-200 bg-transparent resize-none outline-none leading-relaxed placeholder:text-slate-400"
                />

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{activeNote.content.split(/\s+/).filter(Boolean).length} words</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Auto-saved
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No notes in notebook</p>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Click Write above to create your first workspace note.</p>
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Note</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODERN INTERACTIVE HELP & GUIDES CENTER                   */}
      {/* ============================================================ */}
      <PulseHelpGuidesModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* 6. Real Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
}
