"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { InviteTeamModal } from "@/components/team/InviteTeamModal";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";
import {
  List,
  MessageSquare,
  FileText,
  CheckCircle2,
  Megaphone,
  Clock,
  AlertTriangle,
  Mail,
  Users,
  BarChart3,
  Send,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

interface FeedItem {
  id: string;
  author: string;
  avatarLetter: string;
  content: string;
  time: string;
  type: string;
  comments?: Array<{ author: string; text: string; time: string }>;
}

export default function CollaboratePage() {
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [whatsCookingText, setWhatsCookingText] = useState("");
  const [feeds, setFeeds] = useState<FeedItem[]>([]);

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsCookingText.trim()) return;

    const newFeed: FeedItem = {
      id: `feed-${Date.now()}`,
      author: "Suraj (You)",
      avatarLetter: "S",
      content: whatsCookingText.trim(),
      time: "Just now",
      type: "discussions",
      comments: [],
    };

    setFeeds([newFeed, ...feeds]);
    setWhatsCookingText("");
    toast({
      title: "Shared to Team Feed",
      message: "Your update is now visible to all workspace collaborators.",
      type: "success",
    });
  };

  const filteredFeeds = feeds.filter((f) => {
    if (activeFilter === "all") return true;
    return f.type === activeFilter;
  });

  return (
    <AppLayout>
      <div className="bg-[#f2f5f8] dark:bg-slate-950 min-h-[calc(100vh-60px)] font-sans flex flex-col">
        <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto">
          
          {/* ============================================================ */}
          {/* LEFT SIDEBAR: Collaborate Filter Tabs (Matching Screenshot)  */}
          {/* ============================================================ */}
          <aside className="w-full md:w-56 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 select-none">
            {/* All Feeds */}
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                activeFilter === "all"
                  ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
              }`}
            >
              <List className="w-4 h-4 text-slate-500" />
              <span>All Feeds</span>
            </button>

            {/* FILTER BY Header */}
            <div className="pt-5 pb-2">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                FILTER BY
              </span>
            </div>

            {/* Sub-Filters List */}
            <div className="space-y-1">
              {[
                { id: "discussions", label: "Discussions", icon: MessageSquare },
                { id: "drafts", label: "Drafts", icon: FileText },
                { id: "approvals", label: "Approvals", icon: CheckCircle2 },
                { id: "posts", label: "Posts", icon: Megaphone },
                { id: "scheduled", label: "Scheduled Posts", icon: Clock },
                { id: "unpublished", label: "Unpublished Posts", icon: AlertTriangle },
                { id: "messages", label: "Messages", icon: Mail },
                { id: "connections", label: "Connections", icon: Users },
                { id: "reports", label: "Reports", icon: BarChart3 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveFilter(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                      activeFilter === item.id
                        ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ============================================================ */}
          {/* MAIN AREA: "What's cooking?" + Team Illustration (Screenshot) */}
          {/* ============================================================ */}
          <main className="flex-1 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col min-w-0">
            
            {/* Top Post Input: Avatar circle + speech bubble input */}
            <form onSubmit={handlePostNote} className="flex items-center gap-3 max-w-3xl mb-8">
              <div className="w-9 h-9 rounded-full bg-[#8c6b54] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                S
              </div>

              <div className="flex-1 relative flex items-center">
                {/* Speech bubble pointer notch */}
                <div className="w-2.5 h-2.5 bg-white dark:bg-slate-800 border-l border-b border-slate-200 dark:border-slate-700 rotate-45 -mr-1.5 z-10 hidden sm:block" />
                
                <input
                  type="text"
                  value={whatsCookingText}
                  onChange={(e) => setWhatsCookingText(e.target.value)}
                  placeholder="What's cooking?"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:italic focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />

                {whatsCookingText.trim() && (
                  <button
                    type="submit"
                    className="absolute right-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition"
                  >
                    Share
                  </button>
                )}
              </div>
            </form>

            {/* Feeds List or Empty Illustration matching Screenshot */}
            {filteredFeeds.length > 0 ? (
              <div className="max-w-3xl space-y-4">
                {filteredFeeds.map((feed) => (
                  <div
                    key={feed.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#8c6b54] text-white font-bold text-xs flex items-center justify-center">
                        {feed.avatarLetter}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-white">
                          {feed.author}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2">{feed.time}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 pl-9">
                      {feed.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              /* Center Illustration matching Screenshot 3 */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none my-auto">
                <div className="max-w-md space-y-5">
                  
                  {/* Vector Illustration: 3 Team Members with WORK, BETTER, TOGETHER bubbles */}
                  <div className="relative w-72 h-44 mx-auto flex items-center justify-center">
                    <svg width="260" height="160" viewBox="0 0 260 160" fill="none">
                      {/* Thought Bubble 1: WORK */}
                      <g transform="translate(15, 10)">
                        <rect x="0" y="0" width="60" height="32" rx="8" fill="#FFFFFF" stroke="#22C55E" strokeWidth="2" />
                        <path d="M25 32L30 38L35 32" fill="#FFFFFF" stroke="#22C55E" strokeWidth="2" />
                        <text x="30" y="20" fill="#1E293B" fontSize="10" fontWeight="bold" textAnchor="middle">
                          WORK
                        </text>
                      </g>

                      {/* Thought Bubble 2: BETTER */}
                      <g transform="translate(95, 5)">
                        <rect x="0" y="0" width="68" height="32" rx="8" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
                        <path d="M30 32L34 38L38 32" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
                        <text x="34" y="20" fill="#1E293B" fontSize="10" fontWeight="bold" textAnchor="middle">
                          BETTER
                        </text>
                      </g>

                      {/* Thought Bubble 3: TOGETHER */}
                      <g transform="translate(175, 12)">
                        <rect x="0" y="0" width="76" height="32" rx="8" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
                        <path d="M35 32L39 38L43 32" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
                        <text x="38" y="20" fill="#1E293B" fontSize="10" fontWeight="bold" textAnchor="middle">
                          TOGETHER
                        </text>
                      </g>

                      {/* Team Member 1 (Left Woman with Red hair) */}
                      <g transform="translate(25, 55)">
                        <circle cx="25" cy="22" r="16" fill="#FEE2E2" stroke="#1E293B" strokeWidth="2" />
                        <path d="M12 25C12 12 20 8 32 8C38 8 40 14 38 20" stroke="#EF4444" strokeWidth="3" fill="none" strokeLinecap="round" />
                        <path d="M10 60C10 44 20 40 25 40C30 40 40 44 40 60" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
                      </g>

                      {/* Team Member 2 (Center Man with Dark hair) */}
                      <g transform="translate(100, 50)">
                        <circle cx="28" cy="24" r="18" fill="#FEF3C7" stroke="#1E293B" strokeWidth="2" />
                        <path d="M14 20C14 10 24 6 36 6C44 6 46 12 44 18" stroke="#1E293B" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <path d="M12 65C12 48 22 44 28 44C34 44 44 48 44 65" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
                      </g>

                      {/* Team Member 3 (Right Man with Blond hair & bowtie) */}
                      <g transform="translate(175, 52)">
                        <circle cx="25" cy="22" r="16" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2" />
                        <path d="M12 18C12 8 20 6 32 6C38 6 40 10 38 16" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
                        <path d="M10 62C10 46 20 42 25 42C30 42 40 46 40 62" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
                        {/* Bowtie */}
                        <polygon points="21,46 29,46 25,48" fill="#1E293B" />
                        <polygon points="21,50 29,50 25,48" fill="#1E293B" />
                      </g>
                    </svg>
                  </div>

                  {/* Headline */}
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Bring your team on board by inviting them here.
                  </h3>

                  {/* Action Pill Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsInviteModalOpen(true)}
                      className="px-6 py-2 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      Invite Team Members
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Invite Team Modal matching Screenshot 5 */}
      <InviteTeamModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </AppLayout>
  );
}
