"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  Plus,
  ArrowRight,
  Sun,
  Moon,
  MessageSquare,
  Layers,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Repeat2,
  Bookmark,
  CheckCircle2,
  Zap,
  Globe,
  SlidersHorizontal,
} from "lucide-react";

export interface GeminiChatPanelProps {
  brandName: string;
  industry?: string;
  onApply: (data: {
    caption: string;
    firstComment?: string;
    hashtags?: string[];
    location?: string;
    imageUrl?: string;
  }) => void;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface ChatSession {
  id: string;
  title: string;
  icon: string;
  messages: ChatMessage[];
}

const DEFAULT_SESSIONS: ChatSession[] = [
  {
    id: "session-1",
    title: "Viral X (Twitter) Launch",
    icon: "🚀",
    messages: [
      {
        id: "msg-init-1",
        role: "assistant",
        content: `Hi Suraj! 👋 I'm **Google Gemini**, your real-time AI Social Media Copilot.

I can help you craft:
• **Viral X (Twitter) Posts & Threads** with high-converting hooks
• **Engaging Social Copy** with hashtags and CTAs
• **Audience Insights & Content Strategies** in English or conversational Hinglish

What would you like to create or publish today?`,
        timestamp: new Date(),
      },
    ],
  },
  {
    id: "session-2",
    title: "AI vs Developers Strategy",
    icon: "🌐",
    messages: [
      {
        id: "msg-init-2",
        role: "assistant",
        content: `Welcome! Ready to break down how AI agents and developers collaborate in 2026. Give me your angle, and I'll generate a punchy, thought-provoking post for your audience.`,
        timestamp: new Date(),
      },
    ],
  },
  {
    id: "session-3",
    title: "Growth & Math ROI Analysis",
    icon: "📈",
    messages: [
      {
        id: "msg-init-3",
        role: "assistant",
        content: `Let's analyze your content distribution and engagement ROI. What metrics or channels should we focus on?`,
        timestamp: new Date(),
      },
    ],
  },
  {
    id: "session-4",
    title: "Vibe Coding Experience",
    icon: "⚡",
    messages: [
      {
        id: "msg-init-4",
        role: "assistant",
        content: `Vibe coding in full flow! Want to draft a real-time build-in-public update for X? Just tell me what you shipped!`,
        timestamp: new Date(),
      },
    ],
  },
];

const QUICK_SUGGESTIONS = [
  "🚀 Draft a viral X post about launching our social workspace",
  "🔥 5 killer opening hooks to stop the scroll",
  "🎯 Write an engaging thread on building in public",
  "⚡ Create a short Hinglish caption with hashtags",
];

const SAMPLE_REAL_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
];

export function GeminiChatPanel({
  brandName,
  industry = "Digital Content",
  onApply,
  onClose,
}: GeminiChatPanelProps) {
  const { toast } = useToast();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>(DEFAULT_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-1");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Right-side preview state
  const [previewPlatform, setPreviewPlatform] = useState<"x" | "instagram" | "linkedin">("x");
  const [previewContent, setPreviewContent] = useState<string>(
    "🚀 Excited to announce our new automated social management workflow with PulseSocial! Seamless scheduling, AI generation, and instant previewing are live. #BuildInPublic #SocialMedia #PulseSocial"
  );
  const [previewImage, setPreviewImage] = useState<string | null>(SAMPLE_REAL_IMAGES[0]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isLoading]);

  // Handle New Chat
  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New Strategy Chat",
      icon: "✨",
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Hi Suraj! New conversation started. What can I write, optimize, or brainstorm for ${brandName} today?`,
          timestamp: new Date(),
        },
      ],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
  };

  // Send message to Gemini API
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    // Update active session with user message
    const updatedMessages = [...activeSession.messages, userMessage];
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: s.messages.length <= 1 ? query.slice(0, 26) + "..." : s.title,
              messages: updatedMessages,
            }
          : s
      )
    );

    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to get reply from Gemini");
      }

      const botReply = data.reply || data.content || "Here is your generated response.";

      const assistantMessage: ChatMessage = {
        id: `gemini-${Date.now()}`,
        role: "assistant",
        content: botReply,
        timestamp: new Date(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, assistantMessage] }
            : s
        )
      );

      // Auto sync preview with generated post if it looks like social copy
      extractAndSetPreview(botReply);
    } catch (err: any) {
      toast({
        title: "Gemini AI Error",
        message: err.message || "Failed to reach Gemini API. Please retry.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract clean post content for the preview
  const extractAndSetPreview = (text: string) => {
    // If text contains quotes or post markers, clean them up
    let clean = text;
    if (text.includes("```")) {
      const match = text.match(/```(?:markdown|text)?\n([\s\S]*?)```/);
      if (match && match[1]) clean = match[1];
    }
    setPreviewContent(clean.trim());
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied!",
      message: "Post copy copied to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyContent = (content: string, imageUrl?: string) => {
    // Extract hashtags if present
    const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    onApply({
      caption: content,
      hashtags,
      imageUrl: imageUrl || previewImage || undefined,
    });
    toast({
      title: "Applied to Composer!",
      message: "Transferred copy & visual directly to your post draft.",
      type: "success",
    });
    if (onClose) onClose();
  };

  // X character calculations
  const charCount = previewContent.length;
  const isOverXLimit = charCount > 280;

  return (
    <div
      className={`w-full h-full min-h-[620px] max-h-[88vh] flex rounded-2xl overflow-hidden transition-colors ${
        isDarkMode
          ? "bg-[#0b0f19] text-slate-100 border border-slate-800"
          : "bg-slate-50 text-slate-900 border border-slate-200"
      }`}
    >
      {/* 1. LEFT SIDEBAR (Matching Screenshot 2) */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-14"
        } transition-all duration-200 flex flex-col border-r shrink-0 ${
          isDarkMode
            ? "bg-[#101625] border-slate-800/80"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-inherit">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition ${
              isDarkMode
                ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            title="Toggle Sidebar"
          >
            <Layers className="w-4 h-4" />
          </button>

          {isSidebarOpen && (
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gemini Chat</span>
            </div>
          )}

          {isSidebarOpen && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-medium">
              v2.5
            </span>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>New Chat</span>}
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-none">
          {isSidebarOpen && (
            <div className="px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Chat history
            </div>
          )}

          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <button
                key={sess.id}
                type="button"
                onClick={() => setActiveSessionId(sess.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition cursor-pointer ${
                  isActive
                    ? isDarkMode
                      ? "bg-slate-800 text-white font-medium shadow-xs"
                      : "bg-indigo-50 text-indigo-900 font-semibold shadow-xs"
                    : isDarkMode
                    ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                title={sess.title}
              >
                <span className="shrink-0 text-sm">{sess.icon}</span>
                {isSidebarOpen && <span className="truncate flex-1">{sess.title}</span>}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Mode Toggle */}
        <div className="p-3 border-t border-inherit">
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition cursor-pointer ${
              isDarkMode
                ? "bg-slate-800/80 hover:bg-slate-800 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {isSidebarOpen && <span>Light mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                {isSidebarOpen && <span>Dark mode</span>}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. MIDDLE CHAT STREAM (Matching Screenshot 2) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${
            isDarkMode
              ? "bg-[#101625]/80 border-slate-800/80"
              : "bg-white/80 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Google Gemini 4-Point Star Sparkle Logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path
                    d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
                    fill="url(#gemini-glow)"
                  />
                  <defs>
                    <linearGradient id="gemini-glow" x1="2" y1="2" x2="22" y2="22">
                      <stop stopColor="#38bdf8" />
                      <stop offset="0.5" stopColor="#818cf8" />
                      <stop offset="1" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">Gemini AI Social Copilot</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live API
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Google Gemini 2.5/Flash • Workspace: {brandName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
              <Globe className="w-3 h-3" />
              <span>Target: X @suraj_pulse</span>
            </span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
          {activeSession.messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-0.5 shrink-0 shadow-sm">
                    <div className="w-full h-full bg-[#101625] rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/20"
                      : isDarkMode
                      ? "bg-[#131b2e] text-slate-200 border border-slate-800/80 rounded-tl-xs shadow-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {/* Actions for Assistant Replies */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                            isDarkMode
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => extractAndSetPreview(msg.content)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                            isDarkMode
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          <span>Sync to Preview</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyContent(msg.content)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold shadow-xs transition cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Apply to Composer</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3 justify-start animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-0.5 shrink-0 animate-pulse">
                <div className="w-full h-full bg-[#101625] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
                </div>
              </div>
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                  isDarkMode ? "bg-[#131b2e] text-slate-400" : "bg-white text-slate-500"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Gemini is thinking and drafting your post...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-1.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {QUICK_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(sug)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
                isDarkMode
                  ? "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/70"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar (Matching Screenshot 2) */}
        <div
          className={`p-3.5 border-t shrink-0 ${
            isDarkMode
              ? "bg-[#101625] border-slate-800/80"
              : "bg-white border-slate-200"
          }`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 relative"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Message Gemini..."
              disabled={isLoading}
              className={`flex-1 py-3 pl-4 pr-12 rounded-full text-xs transition outline-none border focus:ring-2 ${
                isDarkMode
                  ? "bg-[#172138] border-slate-700/80 text-white placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-500"
                  : "bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:ring-indigo-500/20 focus:border-indigo-500"
              }`}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`absolute right-1.5 w-8 h-8 rounded-full flex items-center justify-center transition shadow-md cursor-pointer ${
                inputMessage.trim() && !isLoading
                  ? "bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-indigo-500/30"
                  : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. RIGHT SIDE LIVE PREVIEW (Targeted for Connected X / Socials) */}
      <div
        className={`w-80 lg:w-96 border-l flex flex-col shrink-0 ${
          isDarkMode
            ? "bg-[#0e1422] border-slate-800/80"
            : "bg-slate-100 border-slate-200"
        }`}
      >
        {/* Preview Header */}
        <div
          className={`p-3.5 border-b flex items-center justify-between ${
            isDarkMode ? "border-slate-800/80 bg-[#101625]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs">Live Channel Preview</span>
          </div>

          {/* Platform switcher */}
          <div className="flex items-center gap-1 bg-slate-800/30 p-0.5 rounded-lg border border-slate-700/30 text-[10px]">
            <button
              type="button"
              onClick={() => setPreviewPlatform("x")}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                previewPlatform === "x"
                  ? "bg-black text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              X
            </button>
            <button
              type="button"
              onClick={() => setPreviewPlatform("instagram")}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                previewPlatform === "instagram"
                  ? "bg-rose-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              IG
            </button>
            <button
              type="button"
              onClick={() => setPreviewPlatform("linkedin")}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                previewPlatform === "linkedin"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              IN
            </button>
          </div>
        </div>

        {/* Preview Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {/* Twitter / X Live Card */}
          {previewPlatform === "x" && (
            <div className="bg-black text-white rounded-2xl p-4 border border-slate-800 shadow-lg text-xs space-y-3">
              {/* Profile Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700 relative">
                    <Image
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=suraj_pulse"
                      alt="Suraj Vishwakarma"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-white text-[12px]">Suraj Vishwakarma</span>
                      {/* Verified Badge */}
                      <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                    <span className="text-slate-400 text-[11px]">@suraj_pulse · Connected</span>
                  </div>
                </div>

                <span className="text-slate-500 text-[10px]">Just now</span>
              </div>

              {/* Tweet Body */}
              <div className="text-[12px] leading-relaxed whitespace-pre-wrap text-slate-100">
                {previewContent || "What is happening?!"}
              </div>

              {/* Media Card */}
              {previewImage && (
                <div className="rounded-xl overflow-hidden border border-slate-800 relative h-40 bg-slate-900">
                  <Image
                    src={previewImage}
                    alt="Post visual"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* Character Limit Badge */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono font-bold ${
                      isOverXLimit ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {charCount} / 280
                  </span>
                  {isOverXLimit && (
                    <span className="text-rose-400">({charCount - 280} over limit)</span>
                  )}
                </div>

                <span className="text-slate-400">Post ready</span>
              </div>

              {/* Action Stats */}
              <div className="flex items-center justify-between text-slate-400 pt-1 text-[11px]">
                <span className="flex items-center gap-1 hover:text-sky-400 cursor-pointer">
                  <MessageSquare className="w-3.5 h-3.5" /> 6
                </span>
                <span className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer">
                  <Repeat2 className="w-3.5 h-3.5" /> 14
                </span>
                <span className="flex items-center gap-1 hover:text-rose-400 cursor-pointer">
                  <Heart className="w-3.5 h-3.5" /> 42
                </span>
                <span className="flex items-center gap-1 hover:text-sky-400 cursor-pointer">
                  <Bookmark className="w-3.5 h-3.5" /> 1.3K
                </span>
              </div>
            </div>
          )}

          {/* Instagram Live Card */}
          {previewPlatform === "instagram" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-white dark:bg-black" />
                </div>
                <span className="font-bold">{brandName}</span>
              </div>

              {previewImage && (
                <div className="rounded-xl overflow-hidden relative h-48 bg-slate-100">
                  <Image src={previewImage} alt="Post" fill className="object-cover" unoptimized />
                </div>
              )}

              <p className="text-[11px] leading-relaxed line-clamp-4 whitespace-pre-wrap">
                <span className="font-bold mr-1.5">{brandName}</span>
                {previewContent}
              </p>
            </div>
          )}

          {/* LinkedIn Live Card */}
          {previewPlatform === "linkedin" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                  in
                </div>
                <div>
                  <span className="font-bold block">Suraj Vishwakarma</span>
                  <span className="text-[10px] text-slate-400">Founder • PulseSocial</span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed whitespace-pre-wrap">
                {previewContent}
              </p>
            </div>
          )}

          {/* Visual Picker: Switch real HD image */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Switch High-Res Visual:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {SAMPLE_REAL_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPreviewImage(img)}
                  className={`relative h-12 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                    previewImage === img ? "border-indigo-500 scale-95" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="Thumb" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Preview Footer: Apply to Composer */}
        <div
          className={`p-3.5 border-t space-y-2 ${
            isDarkMode ? "bg-[#101625] border-slate-800/80" : "bg-white border-slate-200"
          }`}
        >
          <button
            type="button"
            onClick={() => handleApplyContent(previewContent, previewImage || undefined)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Attach to Post Composer</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy(previewContent, "full-post")}
            className={`w-full py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer ${
              isDarkMode
                ? "border-slate-800 hover:bg-slate-800/60 text-slate-300"
                : "border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
          >
            Copy Post Content
          </button>
        </div>
      </div>
    </div>
  );
}
