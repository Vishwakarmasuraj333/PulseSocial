"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";
import {
  Search,
  Send,
  Smile,
  Paperclip,
  CheckCheck,
  MoreVertical,
  User,
  Clock,
  Sparkles,
  ArrowLeft,
  X,
} from "lucide-react";

interface Message {
  id: string;
  sender: "customer" | "agent";
  text: string;
  timestamp: string;
}

interface Thread {
  id: string;
  name: string;
  avatarUrl: string;
  platform: "facebook" | "instagram";
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Message[];
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const requestedUser = searchParams.get("user");
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch real messages from API
  useEffect(() => {
    let isMounted = true;
    async function loadThreads() {
      try {
        setLoading(true);
        const res = await fetch("/api/inbox/conversations?type=messages");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.conversations)) {
            const mapped: Thread[] = data.conversations.map((c: any) => ({
              id: c.id,
              name: c.senderName || "Unknown Contact",
              avatarUrl: c.senderAvatar || "",
              platform: c.platform || "facebook",
              lastMessage: c.lastMessage || "",
              time: c.lastMessageAt || "Recent",
              unread: (c.unreadCount || 0) > 0,
              messages: Array.isArray(c.messages)
                ? c.messages.map((m: any) => ({
                    id: m.id,
                    sender: m.isMe ? "agent" : "customer",
                    text: m.text || "",
                    timestamp: m.timestamp || "Recent",
                  }))
                : [],
            }));
            setThreads(mapped);

            if (requestedUser) {
              const match = mapped.find(
                (t) => t.name.toLowerCase() === requestedUser.toLowerCase()
              );
              if (match) {
                setSelectedThreadId(match.id);
              }
            } else if (mapped.length > 0) {
              setSelectedThreadId(mapped[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load conversation threads:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadThreads();
    return () => {
      isMounted = false;
    };
  }, [requestedUser]);

  const activeThread = threads.find((t) => t.id === selectedThreadId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeThread || isSending) return;

    const messageText = inputMessage.trim();
    setIsSending(true);

    const tempMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "agent",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Optimistically append message
    const updatedThreads = threads.map((t) => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          lastMessage: messageText,
          time: tempMsg.timestamp,
          messages: [...t.messages, tempMsg],
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setInputMessage("");

    try {
      // Extract numeric/real ID if prefixed with msg-
      const rawId = activeThread.id.startsWith("msg-")
        ? activeThread.id.replace("msg-", "")
        : activeThread.id;

      const res = await fetch(`/api/inbox/${rawId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          type: "MESSAGE",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to deliver message via platform API");
      }

      toast({
        title: "Message Sent",
        message: `Delivered to ${activeThread.name} on ${activeThread.platform}.`,
        type: "success",
      });
    } catch (err: unknown) {
      toast({
        title: "Delivery Note",
        message:
          (err as Error).message ||
          "Message logged locally; direct platform dispatch requires verified channel credentials.",
        type: "error",
      });
    } finally {
      setIsSending(false);
    }
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f2f5f8] dark:bg-slate-950 min-h-[calc(100vh-56px)] flex flex-col font-sans">
      
      {/* Subheader with Facebook Orange Highlight Tab (Matching Screenshot 2) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative pb-2 border-b-2 border-orange-500 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs">
              <svg width="14" height="20" viewBox="0 0 12 20" fill="currentColor">
                <path d="M8.1 20V10.9h3.1l.46-3.6H8.1V5c0-1.04.29-1.75 1.78-1.75h1.9V.05C11.45 0 10.33 0 9.02 0 6.28 0 4.4 1.67 4.4 4.75v2.55H1.3v3.6h3.1V20h3.7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          <span>{activeBrand?.name || "Direct Channels"} · Multi-Platform Inbox</span>
        </div>
      </div>

      {/* Main Split Grid: Left Sidebar Threads + Right Chat/Mailbox */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Threads Column */}
        <aside className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 select-none">
          {/* Search Threads */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">No conversations yet</p>
                <p className="text-[11px]">Messages sent to your connected social channels will appear here automatically.</p>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`w-full text-left p-3 sm:px-4 flex items-start gap-3 transition cursor-pointer ${
                    thread.id === selectedThreadId
                      ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-blue-600"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {/* Avatar with platform overlay */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
                      {thread.avatarUrl ? (
                        <img
                          src={thread.avatarUrl}
                          alt={thread.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        thread.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center ring-1 ring-white dark:ring-slate-900">
                      <svg width="6" height="10" viewBox="0 0 12 20" fill="currentColor">
                        <path d="M8.1 20V10.9h3.1l.46-3.6H8.1V5c0-1.04.29-1.75 1.78-1.75h1.9V.05C11.45 0 10.33 0 9.02 0 6.28 0 4.4 1.67 4.4 4.75v2.55H1.3v3.6h3.1V20h3.7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs truncate ${
                          thread.unread
                            ? "font-bold text-slate-900 dark:text-white"
                            : "font-medium text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {thread.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">{thread.time}</span>
                    </div>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        thread.unread
                          ? "font-semibold text-slate-900 dark:text-slate-200"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {thread.lastMessage || "No messages"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Right Pane: Mailbox Empty State (Screenshot 2) OR Interactive Chat */}
        <main className="flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
          {activeThread ? (
            /* Interactive Chat View */
            <div className="flex-1 flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-3 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedThreadId(null)}
                    className="md:hidden p-1 rounded text-slate-500 hover:text-slate-800"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs">
                      {activeThread.avatarUrl ? (
                        <img
                          src={activeThread.avatarUrl}
                          alt={activeThread.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        activeThread.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {activeThread.name}
                    </h3>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active on Facebook
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedThreadId(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Close Chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-[#f8fafc] dark:bg-slate-950">
                {activeThread.messages.map((msg) => {
                  const isAgent = msg.sender === "agent";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAgent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] sm:max-w-md p-3 rounded-2xl text-xs space-y-1 shadow-2xs ${
                          isAgent
                            ? "bg-blue-600 text-white rounded-br-xs"
                            : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-xs"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 text-[9px] ${
                            isAgent ? "text-blue-100" : "text-slate-400"
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isAgent && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Reply to ${activeThread.name} on Facebook...`}
                  className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          ) : (
            /* Screenshot 2 Clean Mailbox Illustration & Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="max-w-md space-y-5">
                
                {/* Clean Vector Mailbox Illustration Matching Screenshot 2 */}
                <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                  {/* Soft ambient ellipse */}
                  <div className="w-44 h-16 bg-sky-100/70 dark:bg-sky-950/40 rounded-[100%] absolute bottom-4 blur-xs" />

                  {/* Mailbox SVG matching screenshot */}
                  <svg width="180" height="150" viewBox="0 0 180 150" fill="none" className="relative z-10 drop-shadow-sm">
                    {/* Mailbox stand pole */}
                    <path d="M115 80V140" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                    <path d="M118 85V140" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

                    {/* Mailbox Body */}
                    <path
                      d="M60 80C60 55 75 35 105 35H125C135 35 145 45 145 60V80C145 88 138 95 130 95H75C66 95 60 88 60 80Z"
                      fill="#FFFFFF"
                      stroke="#1E293B"
                      strokeWidth="2.5"
                    />

                    {/* Mailbox Inner depth */}
                    <ellipse cx="75" cy="65" rx="15" ry="25" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2" />

                    {/* Mail Envelope sticking out */}
                    <g transform="translate(68, 45) rotate(-15)">
                      <rect x="0" y="0" width="48" height="32" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                      <path d="M2 2L24 18L46 2" stroke="#2563EB" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </g>

                    {/* Red Mailbox Flag */}
                    <path d="M125 45V20" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M125 20H138L134 26L138 32H125Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Exact Text from Screenshot 2 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    We&apos;ll keep your messages right here as and when they come in :-)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Meanwhile, head to the{" "}
                    <Link
                      href="/connections"
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Connections
                    </Link>{" "}
                    tab to see whom you can interact with.
                  </p>
                </div>

                {/* Direct CTA */}
                <div className="pt-2">
                  <Link
                    href="/connections"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f71d3] hover:bg-blue-600 text-white text-xs font-semibold shadow-2xs transition"
                  >
                    <span>Go to Connections</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading messages...</div>}>
        <MessagesContent />
      </Suspense>
    </AppLayout>
  );
}
