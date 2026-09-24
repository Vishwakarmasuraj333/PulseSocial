"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { PostComposerModal } from "@/components/composer/PostComposerModal";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";
import {
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Rss,
  Folder,
  Play,
  ThumbsUp,
  MessageCircle,
  HelpCircle,
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  ExternalLink,
  X,
  Share2,
} from "lucide-react";

interface PostTarget {
  id: string;
  socialAccountId: string;
  status: string;
  socialAccount: {
    id: string;
    provider: string;
    displayName: string;
    username: string | null;
  };
}

interface PostMediaItem {
  id: string;
  url: string;
  mediaType: string;
}

interface PostItem {
  id: string;
  content: string;
  status: "PUBLISHED" | "SCHEDULED" | "DRAFT" | "PENDING_APPROVAL" | "FAILED";
  publishedAt?: string;
  scheduledFor?: string;
  createdAt: string;
  media: PostMediaItem[];
  targets: PostTarget[];
  likes?: number;
  comments?: number;
  author?: {
    id: string;
    name: string;
  };
}

export default function PostsPage() {
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  // Sidebar navigation subtab
  const [sidebarTab, setSidebarTab] = useState<
    "published" | "scheduled" | "approvals" | "unpublished" | "drafts" | "rss" | "library"
  >("published");

  // Filter & Sort state
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [filterByType, setFilterByType] = useState<string>("posts");
  const [sortBy, setSortBy] = useState<string>("date");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Modals & Real Data
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedMediaPost, setSelectedMediaPost] = useState<PostItem | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [connectedChannels, setConnectedChannels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from backend
  const loadPostsAndChannels = async () => {
    setIsLoading(true);
    try {
      const [postsRes, accRes] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/social/accounts"),
      ]);

      if (postsRes.ok) {
        const data = await postsRes.json();
        if (data.posts) {
          setPosts(data.posts);
        }
      }

      if (accRes.ok) {
        const aData = await accRes.json();
        if (aData.accounts) {
          setConnectedChannels(aData.accounts);
        }
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPostsAndChannels();
  }, []);

  // Filter posts based on active sidebar tab, platform, and filter by
  const filteredPosts = posts.filter((post) => {
    // 1. Sidebar tab filter
    if (sidebarTab === "published" && post.status !== "PUBLISHED") return false;
    if (sidebarTab === "scheduled" && post.status !== "SCHEDULED") return false;
    if (sidebarTab === "approvals" && post.status !== "PENDING_APPROVAL") return false;
    if (sidebarTab === "unpublished" && post.status !== "FAILED") return false;
    if (sidebarTab === "drafts" && post.status !== "DRAFT") return false;

    // 2. Platform filter
    if (selectedPlatform !== "ALL") {
      const hasTarget = post.targets?.some(
        (t) => t.socialAccount?.provider?.toLowerCase() === selectedPlatform.toLowerCase()
      );
      if (!hasTarget) return false;
    }

    // 3. Filter by type
    if (filterByType === "videos") {
      const hasVideo = post.media?.some((m) => m.mediaType === "video" || m.url.endsWith(".mp4"));
      if (!hasVideo) return false;
    }
    if (filterByType === "images") {
      const hasImage = post.media?.some((m) => m.mediaType === "image" || !m.url.endsWith(".mp4"));
      if (!hasImage) return false;
    }

    return true;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA;
    }
    if (sortBy === "interactions") {
      const intA = (a.likes || 0) + (a.comments || 0);
      const intB = (b.likes || 0) + (b.comments || 0);
      return intB - intA;
    }
    return 0;
  });

  return (
    <AppLayout>
      <div className="bg-[#f2f5f8] dark:bg-slate-950 min-h-[calc(100vh-60px)] font-sans flex flex-col">
        <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto">
          
          {/* ============================================================ */}
          {/* LEFT SIDEBAR: Posts Sub-Navigation (Matching Screenshot)     */}
          {/* ============================================================ */}
          <aside className="w-full md:w-56 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 select-none">
            
            {/* Top Post Categories */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSidebarTab("published")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "published"
                    ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                }`}
              >
                <Send className="w-4 h-4 text-slate-500" />
                <span>Published Posts</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("scheduled")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "scheduled"
                    ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                }`}
              >
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Scheduled Posts</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("approvals")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "approvals"
                    ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-slate-500" />
                <span>Approvals</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("unpublished")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "unpublished"
                    ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-slate-500" />
                <span>Unpublished Posts</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("drafts")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "drafts"
                    ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                }`}
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Drafts</span>
              </button>

              <Link
                href="/calendar"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 transition"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Calendar</span>
              </Link>
            </div>

            {/* CONTENT LIBRARY SECTION */}
            <div className="pt-6">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                CONTENT LIBRARY
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSidebarTab("rss")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                    sidebarTab === "rss"
                      ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                  }`}
                >
                  <Rss className="w-4 h-4 text-slate-500" />
                  <span>RSS Feeds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSidebarTab("library")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                    sidebarTab === "library"
                      ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                  }`}
                >
                  <Folder className="w-4 h-4 text-slate-500" />
                  <span>Social Library</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* MAIN CONTENT AREA: Posts List & Platform Filter Bar           */}
          {/* ============================================================ */}
          <main className="flex-1 bg-white dark:bg-slate-900 flex flex-col min-w-0">
            
            {/* Top Connected Platform Filter Bar (Matching Screenshot) */}
            <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedPlatform("ALL")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
                  selectedPlatform === "ALL"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                All Channels
              </button>

              {connectedChannels.map((acc) => {
                const isSelected = selectedPlatform.toLowerCase() === acc.provider.toLowerCase();
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedPlatform(acc.provider)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition cursor-pointer shrink-0 ${
                      isSelected
                        ? "border-[#5846A8] bg-[#f5f3ff] text-[#5846A8] dark:text-purple-300 font-bold shadow-2xs ring-1 ring-[#5846A8]/20"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                      {renderPlatformIcon(acc.provider, 16)}
                    </div>
                    <span className="text-xs capitalize">{acc.displayName}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-Header Filter Bar: Filter by Posts, Sort by Date, Choose Date */}
            <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Left Selectors */}
              <div className="flex items-center gap-4">
                {/* Filter by */}
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span>Filter by:</span>
                  <select
                    value={filterByType}
                    onChange={(e) => setFilterByType(e.target.value)}
                    className="font-semibold text-slate-800 dark:text-white bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value="posts" className="dark:bg-slate-900">Posts</option>
                    <option value="videos" className="dark:bg-slate-900">Videos</option>
                    <option value="images" className="dark:bg-slate-900">Images</option>
                  </select>
                </div>

                {/* Sort by */}
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="font-semibold text-slate-800 dark:text-white bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value="date" className="dark:bg-slate-900">Date</option>
                    <option value="interactions" className="dark:bg-slate-900">Interactions</option>
                  </select>
                </div>
              </div>

              {/* Right: Choose Date Picker */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toast({
                      title: "Date Range Filter",
                      message: "Showing posts across all recorded dates.",
                      type: "info",
                    });
                  }}
                  className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Choose Date</span>
                </button>
              </div>
            </div>

            {/* ============================================================ */}
            {/* POSTS TABLE LIST VIEW (Matching Exact Screenshot Columns)    */}
            {/* ============================================================ */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-850/50">
                    <th className="py-3 px-6 font-semibold w-40">PUBLISHED ON</th>
                    <th className="py-3 px-6 font-semibold">POST CONTENT</th>
                    <th className="py-3 px-6 font-semibold text-center w-28">
                      INTERACTION <HelpCircle className="inline w-3 h-3 text-slate-350 -mt-0.5 ml-0.5" />
                    </th>
                    <th className="py-3 px-6 font-semibold text-center w-28">PUBLISHED BY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {sortedPosts.length > 0 ? (
                    sortedPosts.map((post) => {
                      const publishedDate = post.publishedAt || post.createdAt;
                      const dateObj = new Date(publishedDate);
                      const dateFormatted = dateObj.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                      const timeFormatted = dateObj.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const primaryTarget = post.targets?.[0]?.socialAccount;
                      const provider = primaryTarget?.provider || "facebook";
                      const mediaItem = post.media?.[0];
                      const totalInteractions = (post.likes || 0) + (post.comments || 0);

                      return (
                        <tr
                          key={post.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition group"
                        >
                          {/* Column 1: PUBLISHED ON */}
                          <td className="py-4 px-6 align-top whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                {dateFormatted}
                              </span>
                              <span className="text-[11px] text-slate-400 font-normal">
                                {timeFormatted}
                              </span>
                            </div>
                          </td>

                          {/* Column 2: POST CONTENT (Thumbnail, Title, Content, Reactions) */}
                          <td className="py-4 px-6 align-top">
                            <div className="flex items-start gap-3.5 max-w-xl">
                              {/* Media Thumbnail (if exists) */}
                              {mediaItem?.url && (
                                <div
                                  onClick={() => setSelectedMediaPost(post)}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0 border border-slate-250/80 dark:border-slate-700 cursor-pointer group/media shadow-xs"
                                >
                                  <Image
                                    src={mediaItem.url}
                                    alt="Media preview"
                                    fill
                                    className="object-cover group-hover/media:scale-105 transition duration-200"
                                  />
                                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-80 group-hover/media:opacity-100 transition">
                                    <div className="w-6 h-6 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xs">
                                      <Play className="w-3.5 h-3.5 fill-slate-900 pl-0.5" />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Content Details */}
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed line-clamp-3">
                                  {post.content}
                                </p>

                                {/* Reaction Pills below content */}
                                <div className="flex items-center gap-1.5 pt-1">
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f5f3ff] dark:bg-purple-950/40 text-[#5846A8] dark:text-purple-300 text-[11px] font-semibold border border-[#ede9fe] dark:border-purple-800/40 shadow-2xs">
                                    <ThumbsUp className="w-3 h-3 fill-[#5846A8]" />
                                    <span>{post.likes || totalInteractions || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Column 3: INTERACTION */}
                          <td className="py-4 px-6 text-center align-top font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {totalInteractions || 0}
                          </td>

                          {/* Column 4: PUBLISHED BY (Round platform letter circle) */}
                          <td className="py-4 px-6 text-center align-top">
                            <div className="inline-flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs shadow-2xs">
                                {provider.charAt(0).toLowerCase()}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-full bg-[#f5f3ff] dark:bg-slate-800 text-[#5846A8] flex items-center justify-center">
                            <Send className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                            No {sidebarTab} posts yet
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Publish real content across your connected channels or schedule updates in advance.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsComposerOpen(true)}
                            className="px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white font-semibold text-xs shadow-xs shadow-purple-900/15 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Post</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>

      {/* Post Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSuccess={loadPostsAndChannels}
      />

      {/* Photo / Video Full Inspection Modal */}
      {selectedMediaPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 text-white">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
              <span className="text-xs font-semibold truncate max-w-md">
                {selectedMediaPost.content || "Media Inspection"}
              </span>
              <button
                type="button"
                onClick={() => setSelectedMediaPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
              {selectedMediaPost.media?.[0]?.url && (
                <Image
                  src={selectedMediaPost.media[0].url}
                  alt="Post media"
                  fill
                  className="object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
