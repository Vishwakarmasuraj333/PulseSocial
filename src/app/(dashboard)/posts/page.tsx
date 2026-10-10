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
  Trash2,
  RefreshCw,
  MoreVertical,
  Copy,
  Eye,
  Megaphone,
  CheckSquare,
  Square,
  Search,
  Filter,
  List,
  SlidersHorizontal,
  Smile,
  Paperclip,
  SendHorizonal,
  MessageSquare,
  Heart,
  MessageSquareReply,
  Users,
  Loader2,
} from "lucide-react";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";
import { PostEngagementDetailsModal } from "@/components/social/PostEngagementDetailsModal";

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

  // Social Planner Header Tabs
  const [socialPlannerTab, setSocialPlannerTab] = useState<
    "planner" | "content" | "comments" | "statistics" | "listening"
  >("planner");

  // Modals & Real Data
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isChannelPopoverOpen, setIsChannelPopoverOpen] = useState(false);
  const [channelSearchQuery, setChannelSearchQuery] = useState("");

  // Comments feed state
  const [commentsPlatform, setCommentsPlatform] = useState<string>("all");
  const [commentsPosts, setCommentsPosts] = useState<any[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({});
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [composerPrefill, setComposerPrefill] = useState<{ content: string; mediaUrl?: string } | null>(null);
  const [selectedMediaPost, setSelectedMediaPost] = useState<PostItem | null>(null);
  const [selectedPostForDetails, setSelectedPostForDetails] = useState<PostItem | null>(null);
  const [activeActionMenuPostId, setActiveActionMenuPostId] = useState<string | null>(null);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [detailsPlatformTab, setDetailsPlatformTab] = useState<string>("all");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [connectedChannels, setConnectedChannels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCommentsFeed = async (platform = "all") => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/comments?platform=${platform}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCommentsPosts(data.posts || []);
      }
    } catch {
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSendComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setIsSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          message: text,
          authorName: activeBrand?.name || "PulseSocial",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");

      toast({
        title: "Comment Published",
        message: "Your comment has been submitted.",
        type: "success",
      });
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      loadCommentsFeed(commentsPlatform);
    } catch (err: unknown) {
      toast({
        title: "Comment Error",
        message: (err as Error).message || "Could not publish comment.",
        type: "error",
      });
    } finally {
      setIsSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

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

    const handleCreated = () => {
      loadPostsAndChannels();
    };
    window.addEventListener("pulsesocial_post_created", handleCreated);
    return () => window.removeEventListener("pulsesocial_post_created", handleCreated);
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveActionMenuPostId(null);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const handleClonePost = (post: PostItem) => {
    setComposerPrefill({
      content: post.content,
      mediaUrl: post.media?.[0]?.url,
    });
    setIsComposerOpen(true);
    setActiveActionMenuPostId(null);
  };

  const handleToggleSelectAll = (allIds: string[]) => {
    if (selectedPostIds.length === allIds.length && allIds.length > 0) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(allIds);
    }
  };

  const handleToggleSelectPost = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        toast({
          title: "Post Deleted",
          message: "The post was permanently removed.",
          type: "success",
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

  const handleRetryPublish = async (post: PostItem) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: post.content,
          targetAccountIds: post.targets?.map((t) => t.socialAccountId) || [],
          action: "PUBLISH_NOW",
          mediaUrls: post.media?.map((m) => m.url) || [],
        }),
      });
      if (res.ok) {
        toast({
          title: "Broadcast Retried",
          message: "Post broadcast updated to published.",
          type: "success",
        });
        loadPostsAndChannels();
      }
    } catch {}
  };

  // Category counts
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const approvalsCount = posts.filter((p) => p.status === "PENDING_APPROVAL").length;
  const unpublishedCount = posts.filter((p) => p.status === "FAILED").length;
  const draftsCount = posts.filter((p) => p.status === "DRAFT").length;

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
    // 4. Search query
    if (searchQuery.trim().length > 0) {
      if (!post.content.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return false;
      }
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
        {/* Top Marketing & Social Planner Header matching Screenshots */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-6 overflow-x-auto scrollbar-none text-xs">
                <span className="font-bold text-slate-900 dark:text-white shrink-0">
                  Marketing
                </span>
                <div className="flex items-center gap-5 text-slate-600 dark:text-slate-400 font-semibold shrink-0">
                  <span className="text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 py-3.5">
                    Social Planner
                  </span>
                  <Link href="/snippets" className="hover:text-slate-900 dark:hover:text-white transition">Snippets</Link>
                  <Link href="/brand-boards" className="hover:text-slate-900 dark:hover:text-white transition">Brand Boards</Link>
                  <Link href="/links" className="hover:text-slate-900 dark:hover:text-white transition">Trigger Links</Link>
                  <span className="text-slate-400 dark:text-slate-500 cursor-default flex items-center gap-1">
                    Emails <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">Coming soon</span>
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 cursor-default flex items-center gap-1">
                    Countdown Timers <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">Coming soon</span>
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 cursor-default flex items-center gap-1">
                    Affiliate Manager <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">Coming soon</span>
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 cursor-default flex items-center gap-1">
                    Ad Manager <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">Coming soon</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Social Planner Subtabs Row */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 py-2">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSocialPlannerTab("planner")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    socialPlannerTab === "planner"
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Planner
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlannerTab("content")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    socialPlannerTab === "content"
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Content
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSocialPlannerTab("comments");
                    loadCommentsFeed(commentsPlatform);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                    socialPlannerTab === "comments"
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <span>Comments</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlannerTab("statistics")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    socialPlannerTab === "statistics"
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Statistics
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlannerTab("listening")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    socialPlannerTab === "listening"
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Social Listening
                </button>
                <Link
                  href="/social-accounts"
                  className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 transition"
                >
                  Settings
                </Link>
              </div>

              {/* Action buttons on right */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Socials</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Post</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {socialPlannerTab === "comments" ? (
          /* ============================================================ */
          /* COMMENTS VIEW (Screenshot 2 exact match)                     */
          /* ============================================================ */
          <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto p-4 sm:p-6 gap-6">
            <aside className="w-full md:w-60 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
                Channels
              </span>
              {[
                { id: "all", name: "All Channels", icon: "all", unread: 2 },
                { id: "facebook", name: "Facebook", icon: "facebook", unread: 0 },
                { id: "instagram", name: "Instagram", icon: "instagram", unread: 2 },
                { id: "linkedin", name: "LinkedIn", icon: "linkedin", unread: 0 },
                { id: "tiktok", name: "TikTok", icon: "tiktok", unread: 0 },
                { id: "bluesky", name: "Bluesky", icon: "bluesky", unread: 0 },
                { id: "threads", name: "Threads", icon: "threads", unread: 0 },
                { id: "pinterest", name: "Pinterest", icon: "pinterest", unread: 0 },
                { id: "youtube", name: "YouTube", icon: "youtube", unread: 0 },
              ].map((ch) => {
                const isSelected = commentsPlatform === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setCommentsPlatform(ch.id);
                      loadCommentsFeed(ch.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {ch.id !== "all" ? (
                        <div className="w-4 h-4 flex items-center justify-center">
                          {renderPlatformIcon(ch.icon, 16)}
                        </div>
                      ) : (
                        <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">@</span>
                      )}
                      <span>{ch.name}</span>
                    </div>

                    {ch.unread > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                        {ch.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </aside>

            <main className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Post Comments & Engagement
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Moderate and reply directly to live user comments across authorized social channels.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loadCommentsFeed(commentsPlatform)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${commentsLoading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {commentsLoading ? (
                <div className="py-16 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-xs text-slate-400">Loading comment streams...</p>
                </div>
              ) : commentsPosts.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 space-y-3">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No active comment threads
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When followers comment on your published posts, they will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {commentsPosts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 bg-slate-50/40 dark:bg-slate-850/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                            {post.content}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString()} &bull; {post.comments?.length || 0} comments
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 pl-3 border-l-2 border-indigo-200 dark:border-indigo-900/60 pt-1">
                        {post.comments?.map((comment: any) => (
                          <div key={comment.id} className="text-xs space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {comment.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(comment.postedAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">
                              {comment.message}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendComment(post.id);
                            }
                          }}
                          placeholder={`Comment as ${activeBrand?.name || "PulseSocial"}...`}
                          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendComment(post.id)}
                          disabled={isSubmittingComment[post.id] || !commentInputs[post.id]?.trim()}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          {isSubmittingComment[post.id] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <SendHorizonal className="w-3.5 h-3.5" />
                          )}
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        ) : (
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "published"
                    ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Send className="w-4 h-4 text-slate-500" />
                  <span>Published Posts</span>
                </div>
                {publishedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    {publishedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("scheduled")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "scheduled"
                    ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Scheduled Posts</span>
                </div>
                {scheduledCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                    {scheduledCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("approvals")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "approvals"
                    ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  <span>Approvals</span>
                </div>
                {approvalsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                    {approvalsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("unpublished")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "unpublished"
                    ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-slate-500" />
                  <span>Unpublished Posts</span>
                </div>
                {unpublishedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                    {unpublishedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("drafts")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "drafts"
                    ? "bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Drafts</span>
                </div>
                {draftsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                    {draftsCount}
                  </span>
                )}
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

            {/* Top Toolbar matching Screenshot 1 */}
            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Filter views</span>
                  <span className="font-bold text-[#5846A8] dark:text-purple-300">All</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toast({
                      title: "Advanced Filters",
                      message: "Filter posts by date, tags, and campaigns.",
                      type: "info",
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span>Filters</span>
                </button>

                {/* Date range display */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-850">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>19 / 04 / 2026</span>
                  <span className="text-slate-400">—</span>
                  <span>19 / 10 / 2026</span>
                </div>

                {/* Channel Avatars Pill with Popover matching Screenshot 3 */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsChannelPopoverOpen(!isChannelPopoverOpen)}
                    className="flex items-center -space-x-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {connectedChannels.slice(0, 4).map((acc) => (
                      <div
                        key={acc.id}
                        className="w-5 h-5 rounded-full overflow-hidden border border-white dark:border-slate-900 bg-slate-200 flex items-center justify-center shrink-0"
                        title={acc.displayName}
                      >
                        {renderPlatformIcon(acc.provider, 14)}
                      </div>
                    ))}
                    {connectedChannels.length > 4 ? (
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 pl-2">
                        +{connectedChannels.length - 4}
                      </span>
                    ) : connectedChannels.length === 0 ? (
                      <span className="text-[11px] text-slate-400 font-medium px-1">
                        + Add Channel
                      </span>
                    ) : null}
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-1.5" />
                  </button>

                  {/* Channel Group Popover matching Screenshot 3 */}
                  {isChannelPopoverOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                      {/* Search */}
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

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            toast({
                              title: "Channel Groups",
                              message: "Organize channels into client-specific groups.",
                              type: "info",
                            });
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition text-center"
                        >
                          + Create new group
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsChannelPopoverOpen(false);
                            setIsConnectModalOpen(true);
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition text-center"
                        >
                          + Add new social
                        </button>
                      </div>

                      {/* Channels List with Checkboxes */}
                      <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-50 dark:divide-slate-800/60">
                        {connectedChannels.length === 0 ? (
                          <p className="text-[11px] text-slate-400 text-center py-4">No channels connected yet</p>
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

                      {/* Footer */}
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
              </div>

              {/* Right: View mode and Search */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-850">
                  <button
                    type="button"
                    className="p-1.5 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-2xs"
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/calendar"
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                    title="Calendar View"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by caption (min 3 chars)"
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50/50 dark:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-[#5846A8] text-slate-800 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* POSTS TABLE LIST VIEW (Matching Exact Screenshot Columns)    */}
            {/* ============================================================ */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/60 dark:bg-slate-850/60 select-none">
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={sortedPosts.length > 0 && selectedPostIds.length === sortedPosts.length}
                        onChange={() => handleToggleSelectAll(sortedPosts.map((p) => p.id))}
                        className="rounded border-slate-300 text-[#5846A8] focus:ring-[#5846A8] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>CAPTION</span>
                      </span>
                    </th>
                    <th className="py-3 px-4 font-semibold w-24">MEDIA</th>
                    <th className="py-3 px-4 font-semibold w-32">STATUS</th>
                    <th className="py-3 px-4 font-semibold w-28">TYPE</th>
                    <th className="py-3 px-4 font-semibold w-36">DATE</th>
                    <th className="py-3 px-4 font-semibold w-28">SOCIAL</th>
                    <th className="py-3 px-4 font-semibold text-right w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {sortedPosts.length > 0 ? (
                    sortedPosts.map((post) => {
                      const publishedDate = post.publishedAt || post.scheduledFor || post.createdAt;
                      const dateObj = new Date(publishedDate);
                      const dateFormatted = dateObj.toLocaleDateString("en-GB", {
                        day: "2-digit",
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

                      return (
                        <tr
                          key={post.id}
                          onClick={() => setSelectedPostForDetails(post)}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition group cursor-pointer"
                        >
                          {/* Checkbox */}
                          <td
                            className="py-3.5 px-4 text-center align-middle"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPostIds.includes(post.id)}
                              onChange={(e) => handleToggleSelectPost(post.id, e as any)}
                              className="rounded border-slate-300 text-[#5846A8] focus:ring-[#5846A8] cursor-pointer"
                            />
                          </td>

                          {/* Caption */}
                          <td className="py-3.5 px-4 align-middle max-w-md">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 shrink-0">🎤</span>
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-[#5846A8] transition">
                                {post.content}
                              </span>
                            </div>
                          </td>

                          {/* Media Thumbnail */}
                          <td className="py-3.5 px-4 align-middle">
                            {mediaItem?.url ? (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPostForDetails(post);
                                }}
                                className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 relative shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs group/thumb"
                              >
                                <Image
                                  src={mediaItem.url}
                                  alt="Media"
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <div className="w-4 h-4 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xs">
                                    <Play className="w-2.5 h-2.5 fill-slate-900 pl-0.5" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                                post.status === "PUBLISHED"
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60"
                                  : post.status === "SCHEDULED"
                                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60"
                                  : post.status === "FAILED"
                                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60"
                              }`}
                            >
                              {post.status === "PUBLISHED" && <Send className="w-3 h-3" />}
                              {post.status === "SCHEDULED" && <Clock className="w-3 h-3" />}
                              {post.status === "FAILED" && <AlertTriangle className="w-3 h-3" />}
                              <span>{post.status.charAt(0) + post.status.slice(1).toLowerCase()}</span>
                            </span>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                            Native post
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                            <div className="text-xs">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                {dateFormatted}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {timeFormatted}
                              </span>
                            </div>
                          </td>

                          {/* Social */}
                          <td className="py-3.5 px-4 align-middle">
                            <div className="relative inline-flex items-center">
                              <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs shadow-2xs">
                                {activeBrand?.name ? activeBrand.name.charAt(0).toUpperCase() : "P"}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full overflow-hidden bg-white dark:bg-slate-900 border border-white dark:border-slate-800 flex items-center justify-center shadow-xs">
                                {renderPlatformIcon(provider, 12)}
                              </div>
                            </div>
                          </td>

                          {/* Actions Three Dots */}
                          <td
                            className="py-3.5 px-4 align-middle text-right relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenuPostId(
                                  activeActionMenuPostId === post.id ? null : post.id
                                );
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeActionMenuPostId === post.id && (
                              <div className="absolute right-4 top-10 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 animate-in fade-in zoom-in-95 text-left text-xs font-medium">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPostForDetails(post);
                                    setActiveActionMenuPostId(null);
                                  }}
                                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Preview</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleClonePost(post)}
                                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Clone</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    toast({
                                      title: "Run as Ad",
                                      message: "Boost and campaign budget initialized for this post.",
                                      type: "info",
                                    });
                                    setActiveActionMenuPostId(null);
                                  }}
                                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                                >
                                  <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Run as Ad</span>
                                </button>

                                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeletePost(post.id);
                                    setActiveActionMenuPostId(null);
                                  }}
                                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
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
                            onClick={() => {
                              setComposerPrefill(null);
                              setIsComposerOpen(true);
                            }}
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
      )}
      </div>

      {/* Post Composer Modal with Clone Support */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => {
          setIsComposerOpen(false);
          setComposerPrefill(null);
        }}
        initialContent={composerPrefill?.content}
        initialMediaUrl={composerPrefill?.mediaUrl}
        onSuccess={loadPostsAndChannels}
      />

      {/* Real Social Engagement & Post Details Modal */}
      <PostEngagementDetailsModal
        isOpen={Boolean(selectedPostForDetails)}
        post={selectedPostForDetails}
        onClose={() => setSelectedPostForDetails(null)}
        onClone={(post) => handleClonePost(post)}
        onDelete={(postId) => {
          handleDeletePost(postId);
          setSelectedPostForDetails(null);
        }}
      />

      {/* Universal Social Connect Modal */}
      <UniversalSocialConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={() => {
          setIsConnectModalOpen(false);
          loadPostsAndChannels();
        }}
      />
    </AppLayout>
  );
}
