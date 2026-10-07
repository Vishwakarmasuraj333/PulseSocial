"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Copy,
  Send,
  X,
  Share2,
  SlidersHorizontal,
  Filter,
  List,
  MoreVertical,
  ThumbsUp,
  MessageCircle,
  Play,
  Eye,
  ExternalLink,
  ChevronDown,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";

export interface CalendarPostTarget {
  id: string;
  socialAccountId: string;
  status: string;
  socialAccount: {
    id: string;
    provider: string;
    displayName: string;
    username: string | null;
    profileImageUrl: string | null;
  };
}

export interface CalendarMediaItem {
  id: string;
  url: string;
  mediaType?: string;
}

export interface CalendarPostItem {
  id: string;
  content: string;
  status: "PUBLISHED" | "SCHEDULED" | "DRAFT" | "PENDING_APPROVAL" | "FAILED";
  publishedAt?: string;
  scheduledFor?: string;
  createdAt: string;
  media: CalendarMediaItem[];
  targets: CalendarPostTarget[];
  likes?: number;
  comments?: number;
  shares?: number;
}

export default function CalendarPage() {
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  // Navigation & View state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [posts, setPosts] = useState<CalendarPostItem[]>([]);
  const [connectedChannels, setConnectedChannels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Popover state
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [isChannelPopoverOpen, setIsChannelPopoverOpen] = useState(false);
  const [channelSearchQuery, setChannelSearchQuery] = useState("");
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Expanded Day View & Drawer state
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [selectedPostForDetails, setSelectedPostForDetails] = useState<CalendarPostItem | null>(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

  // Fetch real posts and accounts from API
  const loadPostsAndChannels = async () => {
    setIsLoading(true);
    try {
      const [postsRes, accRes] = await Promise.all([
        fetch("/api/posts", { cache: "no-store" }),
        fetch("/api/social/accounts", { cache: "no-store" }),
      ]);

      if (postsRes.ok) {
        const pData = await postsRes.json();
        if (pData.posts) {
          setPosts(pData.posts);
        }
      }

      if (accRes.ok) {
        const aData = await accRes.json();
        if (aData.accounts) {
          setConnectedChannels(aData.accounts);
        }
      }
    } catch {
      toast({
        title: "Load Error",
        message: "Could not retrieve calendar posts.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPostsAndChannels();

    const handleCreated = () => {
      loadPostsAndChannels();
    };
    window.addEventListener("pulsesocial_post_created", handleCreated);
    return () => window.removeEventListener("pulsesocial_post_created", handleCreated);
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveMenuPostId(null);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevPeriod = () => {
    if (view === "month") setCurrentDate(new Date(year, month - 1, 1));
    else setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
  };

  const nextPeriod = () => {
    if (view === "month") setCurrentDate(new Date(year, month + 1, 1));
    else setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // Filter posts by selected channel if any
  const filteredPosts = useMemo(() => {
    if (selectedPlatform === "ALL") return posts;
    return posts.filter((p) =>
      p.targets?.some(
        (t) => t.socialAccount?.provider?.toLowerCase() === selectedPlatform.toLowerCase()
      )
    );
  }, [posts, selectedPlatform]);

  // Retrieve posts for a specific day in the active month
  const getPostsForDay = (day: number) => {
    return filteredPosts.filter((p) => {
      const d = new Date(p.scheduledFor || p.publishedAt || p.createdAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  // Days for week view
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const getPostsForDate = (date: Date) => {
    return filteredPosts.filter((p) => {
      const d = new Date(p.scheduledFor || p.publishedAt || p.createdAt);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setSelectedPostForDetails(null);
        toast({
          title: "Post Deleted",
          message: "The post was removed from the calendar.",
          type: "info",
        });
      }
    } catch {
      toast({
        title: "Delete Failed",
        message: "Could not delete post.",
        type: "error",
      });
    }
  };

  const formatPostTime = (dateStr?: string) => {
    if (!dateStr) return "@ 12:00 PM";
    try {
      const d = new Date(dateStr);
      return (
        "@ " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
      );
    } catch {
      return "@ 12:00 PM";
    }
  };

  return (
    <AppLayout>
      <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-[calc(100vh-60px)] font-sans">
        
        {/* Top Control Toolbar matching Reference Screenshot */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            
            {/* Left Tools: Filter views All & Filters */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter views</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">All</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toast({
                    title: "Advanced Filters",
                    message: "Filter posts by platform, campaign, and approval status.",
                    type: "info",
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filters</span>
              </button>
            </div>

            {/* Right Tools: Channel Popover Pill + View Switcher */}
            <div className="flex items-center gap-3">
              {/* Channel Avatars Pill with Popover matching Screenshot */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsChannelPopoverOpen(!isChannelPopoverOpen)}
                  className="flex items-center -space-x-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {connectedChannels.slice(0, 5).map((acc) => (
                    <div
                      key={acc.id}
                      className="w-5 h-5 rounded-full overflow-hidden border border-white dark:border-slate-900 bg-slate-200 flex items-center justify-center shrink-0"
                      title={acc.displayName}
                    >
                      {renderPlatformIcon(acc.provider, 14)}
                    </div>
                  ))}
                  {connectedChannels.length > 5 ? (
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 pl-2">
                      +{connectedChannels.length - 5}
                    </span>
                  ) : connectedChannels.length === 0 ? (
                    <span className="text-[11px] text-slate-400 font-medium px-1">
                      No channels
                    </span>
                  ) : null}
                  <ChevronDown className="w-3 h-3 text-slate-400 ml-1.5" />
                </button>

                {/* Channel Popover */}
                {isChannelPopoverOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={channelSearchQuery}
                        onChange={(e) => setChannelSearchQuery(e.target.value)}
                        placeholder="Search channels..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsChannelPopoverOpen(false);
                          setIsConnectModalOpen(true);
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition text-center"
                      >
                        + Add new social
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-50 dark:divide-slate-800/60">
                      {connectedChannels.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-4">
                          No connected channels yet
                        </p>
                      ) : (
                        connectedChannels
                          .filter((c) =>
                            c.displayName.toLowerCase().includes(channelSearchQuery.toLowerCase())
                          )
                          .map((channel) => (
                            <label
                              key={channel.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
                                  {renderPlatformIcon(channel.provider, 16)}
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                                  {channel.displayName}
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                defaultChecked={true}
                                className="rounded text-indigo-600 focus:ring-0"
                              />
                            </label>
                          ))
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setSelectedPlatform("ALL")}
                        className="text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPlatform("ALL")}
                        className="text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        Select all
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* View Switcher: List View / Calendar View */}
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-850">
                <Link
                  href="/posts"
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  className="p-1.5 rounded-md bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  title="Calendar View"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Navigator & Month/Week Switcher Bar */}
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {monthName} {year}
            </h2>

            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={prevPeriod}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextPeriod}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCurrentDate(new Date())}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* Month / Week Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-white dark:bg-slate-900 shadow-2xs">
            <button
              type="button"
              onClick={() => setView("month")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                view === "month"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setView("week")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                view === "week"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CALENDAR GRID VIEW (Matching Reference Screenshot EXACTLY)   */}
        {/* ============================================================ */}
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 pb-12">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">
                Loading calendar posts from active workspace...
              </p>
            </div>
          ) : view === "month" ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              
              {/* Day Header Row: Sun in red, others in dark */}
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center py-3 text-xs font-bold divide-x divide-slate-100 dark:divide-slate-800">
                <div className="text-rose-500">Sun</div>
                <div className="text-slate-700 dark:text-slate-300">Mon</div>
                <div className="text-slate-700 dark:text-slate-300">Tue</div>
                <div className="text-slate-700 dark:text-slate-300">Wed</div>
                <div className="text-slate-700 dark:text-slate-300">Thu</div>
                <div className="text-slate-700 dark:text-slate-300">Fri</div>
                <div className="text-slate-700 dark:text-slate-300">Sat</div>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
                {/* Empty leading offset days */}
                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[180px] bg-slate-50/20 dark:bg-slate-950/20 p-2"
                  />
                ))}

                {/* Real Days of Month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const dayPosts = getPostsForDay(day);
                  const isToday =
                    new Date().getDate() === day &&
                    new Date().getMonth() === month &&
                    new Date().getFullYear() === year;

                  const visiblePosts = dayPosts.slice(0, 1);
                  const extraCount = dayPosts.length - 1;

                  return (
                    <div
                      key={`day-${day}`}
                      className={`min-h-[190px] p-2 sm:p-2.5 flex flex-col justify-between transition hover:bg-slate-50/50 dark:hover:bg-slate-850/40 relative ${
                        isToday ? "bg-indigo-50/20 dark:bg-purple-950/20" : ""
                      }`}
                    >
                      {/* Top Date Number right-aligned */}
                      <div className="flex justify-end mb-1">
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                            isToday
                              ? "bg-indigo-600 text-white font-bold"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {day}
                        </span>
                      </div>

                      {/* Day Post Cards */}
                      <div className="space-y-2 flex-1">
                        {visiblePosts.map((post) => {
                          const primaryTarget = post.targets?.[0];
                          const socialAccount = primaryTarget?.socialAccount;
                          const mediaUrl = post.media?.[0]?.url;

                          return (
                            <div
                              key={post.id}
                              onClick={() => setSelectedPostForDetails(post)}
                              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                            >
                              {/* Header: Time & Three-dots */}
                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                <span className="flex items-center gap-1">
                                  <span>{formatPostTime(post.scheduledFor || post.publishedAt || post.createdAt)}</span>
                                </span>
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuPostId(
                                        activeMenuPostId === post.id ? null : post.id
                                      );
                                    }}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>

                                  {activeMenuPostId === post.id && (
                                    <div
                                      className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 text-xs"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedPostForDetails(post);
                                          setActiveMenuPostId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Preview</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleDeletePost(post.id);
                                          setActiveMenuPostId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Post Title/Snippet */}
                              <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                                {post.content}
                              </p>

                              {/* Media Thumbnail Image Preview */}
                              {mediaUrl && (
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={mediaUrl}
                                    alt="Media preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              {/* Channel Avatars & Status Row */}
                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center -space-x-1.5">
                                    {(post.targets && post.targets.length > 0
                                      ? post.targets
                                      : primaryTarget ? [primaryTarget] : []
                                    ).slice(0, 4).map((target, tIdx) => {
                                      const acc = target?.socialAccount;
                                      return (
                                        <div
                                          key={target?.id || tIdx}
                                          className="relative group/target"
                                          title={`${acc?.displayName || "Account"} (${acc?.provider || "Social"})`}
                                        >
                                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center ring-1 ring-white dark:ring-slate-900">
                                            {acc?.profileImageUrl ? (
                                              // eslint-disable-next-line @next/next/no-img-element
                                              <img
                                                src={acc.profileImageUrl}
                                                alt="channel"
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
                                                {(acc?.displayName || "S").charAt(0).toUpperCase()}
                                              </span>
                                            )}
                                          </div>
                                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs">
                                            {renderPlatformIcon(
                                              acc?.provider || "facebook",
                                              9
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {(post.targets?.length || 0) > 4 && (
                                      <span className="text-[9px] font-bold text-slate-500 pl-2">
                                        +{post.targets.length - 4}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF8ED] text-[#22C55E] dark:bg-emerald-950/60 dark:text-emerald-400">
                                  <span>✓</span>
                                  <span>
                                    {post.status === "PUBLISHED"
                                      ? "Published"
                                      : post.status === "SCHEDULED"
                                      ? "Scheduled"
                                      : "Draft"}
                                  </span>
                                </span>
                              </div>

                              {/* Engagement Metrics Footer: Likes, Shares, Comments */}
                              <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3 text-slate-400" />
                                  <span>{post.likes || 0}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Share2 className="w-3 h-3 text-slate-400" />
                                  <span>{post.shares || 0}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3 text-slate-400" />
                                  <span>{post.comments || 0}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Expandable Link: See X more */}
                      {extraCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedDay(day)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-center w-full pt-1.5 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>See {extraCount} more</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* WEEK VIEW (Matching Screenshot)                              */
            /* ============================================================ */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center py-3 text-xs font-bold divide-x divide-slate-100 dark:divide-slate-800">
                {weekDays.map((d, i) => {
                  const isSun = d.getDay() === 0;
                  return (
                    <div key={i} className={isSun ? "text-rose-500" : "text-slate-700 dark:text-slate-300"}>
                      <span>{d.toLocaleDateString(undefined, { weekday: "short" })}</span>{" "}
                      <span className="font-semibold text-slate-400">({d.getDate()})</span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800 min-h-[420px]">
                {weekDays.map((d, i) => {
                  const dayPosts = getPostsForDate(d);
                  return (
                    <div key={i} className="p-3 space-y-3 hover:bg-slate-50/40 transition">
                      {dayPosts.map((post) => {
                        const primaryTarget = post.targets?.[0];
                        const socialAccount = primaryTarget?.socialAccount;
                        const mediaUrl = post.media?.[0]?.url;

                        return (
                          <div
                            key={post.id}
                            onClick={() => setSelectedPostForDetails(post)}
                            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2"
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                              <span>{formatPostTime(post.scheduledFor || post.publishedAt || post.createdAt)}</span>
                              <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                            </div>

                            <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                              {post.content}
                            </p>

                            {mediaUrl && (
                              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={mediaUrl} alt="Media" className="w-full h-full object-cover" />
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center -space-x-1.5">
                                {(post.targets && post.targets.length > 0
                                  ? post.targets
                                  : primaryTarget ? [primaryTarget] : []
                                ).slice(0, 3).map((target, tIdx) => {
                                  const acc = target?.socialAccount;
                                  return (
                                    <div
                                      key={target?.id || tIdx}
                                      className="relative"
                                      title={`${acc?.displayName || "Account"} (${acc?.provider || "Social"})`}
                                    >
                                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-850 overflow-hidden ring-1 ring-white dark:ring-slate-900 flex items-center justify-center">
                                        {acc?.profileImageUrl ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img
                                            src={acc.profileImageUrl}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
                                            {(acc?.displayName || "S").charAt(0).toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs">
                                        {renderPlatformIcon(acc?.provider || "facebook", 9)}
                                      </div>
                                    </div>
                                  );
                                })}
                                {(post.targets?.length || 0) > 3 && (
                                  <span className="text-[9px] font-bold text-slate-500 pl-1.5">
                                    +{post.targets.length - 3}
                                  </span>
                                )}
                              </div>

                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF8ED] text-[#22C55E] dark:bg-emerald-950/60 dark:text-emerald-400">
                                ✓ Published
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {dayPosts.length === 0 && (
                        <div className="h-32 flex items-center justify-center text-[11px] text-slate-400">
                          No posts
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Slide-over Post Details Drawer (Matching Screenshot 2) */}
        {selectedPostForDetails && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in"
            onClick={() => setSelectedPostForDetails(null)}
          >
            <div
              className="w-full sm:w-[480px] lg:w-[520px] bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Post details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedPostForDetails(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status, Date & Preview link button */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EAF8ED] text-[#22C55E]">
                        ✓ Published
                      </span>
                      <p className="text-xs text-slate-500 mt-1.5">
                        {new Date(
                          selectedPostForDetails.scheduledFor ||
                            selectedPostForDetails.publishedAt ||
                            selectedPostForDetails.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toast({
                          title: "Preview Link Generated",
                          message: "Live post link ready for sharing.",
                          type: "info",
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Preview Link</span>
                    </button>
                  </div>

                  {/* Quick Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-center">
                      <span className="text-xs text-slate-400">Likes</span>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedPostForDetails.likes || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-center">
                      <span className="text-xs text-slate-400">Shares</span>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedPostForDetails.shares || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-center">
                      <span className="text-xs text-slate-400">Comments</span>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedPostForDetails.comments || 0}
                      </p>
                    </div>
                  </div>

                  {/* Target Social Channels */}
                  {selectedPostForDetails.targets && selectedPostForDetails.targets.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Targeted Channels ({selectedPostForDetails.targets.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedPostForDetails.targets.map((tgt) => (
                          <div
                            key={tgt.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs"
                          >
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                              {tgt.socialAccount?.profileImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={tgt.socialAccount.profileImageUrl}
                                  alt="avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-bold">
                                  {(tgt.socialAccount?.displayName || "S").charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {renderPlatformIcon(tgt.socialAccount?.provider || "facebook", 12)}
                              <span className="font-semibold">{tgt.socialAccount?.displayName}</span>
                            </div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                              ● {tgt.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phone Mockup Frame */}
                  <div className="w-full max-w-[340px] mx-auto bg-slate-950 rounded-[32px] p-3 shadow-2xl border-4 border-slate-800 space-y-3 text-white">
                    <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col justify-between p-3">
                      {selectedPostForDetails.media?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedPostForDetails.media[0].url}
                          alt="Post media"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 to-purple-950/60 flex items-center justify-center p-6 text-center text-xs font-medium text-slate-300">
                          {selectedPostForDetails.content}
                        </div>
                      )}

                      <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-xl p-2.5 text-left space-y-1">
                        <span className="text-[11px] font-bold block">
                          @{activeBrand?.slug || "pulsesocial"}
                        </span>
                        <p className="text-[10px] text-slate-200 line-clamp-2 leading-relaxed">
                          {selectedPostForDetails.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDeletePost(selectedPostForDetails.id);
                    setSelectedPostForDetails(null);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  <span>Delete Post</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expand Day Modal */}
        {expandedDay !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setExpandedDay(null)}
          >
            <div
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Posts on {monthName} {expandedDay}, {year}
                </h3>
                <button
                  type="button"
                  onClick={() => setExpandedDay(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {getPostsForDay(expandedDay).map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setExpandedDay(null);
                      setSelectedPostForDetails(post);
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{formatPostTime(post.scheduledFor || post.publishedAt || post.createdAt)}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF8ED] text-[#22C55E]">
                        ✓ {post.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Universal Social Connect Modal */}
        <UniversalSocialConnectModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          onSuccess={() => {
            setIsConnectModalOpen(false);
            loadPostsAndChannels();
          }}
        />
      </div>
    </AppLayout>
  );
}
