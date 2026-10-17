"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  Play,
  ThumbsUp,
  MessageCircle,
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
  CheckSquare,
  Square,
  Search,
  Filter,
  SlidersHorizontal,
  Check,
  Folder,
  Layers,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";
import { PostEngagementDetailsModal } from "@/components/social/PostEngagementDetailsModal";
import {
  AdvancedFiltersModal,
  FilterCriteria,
  DEFAULT_FILTER_CRITERIA,
} from "@/components/filters/AdvancedFiltersModal";

interface PostTarget {
  id: string;
  socialAccountId: string;
  platformPostId?: string | null;
  status: string;
  socialAccount: {
    id: string;
    provider: string;
    displayName: string;
    username: string | null;
    avatarUrl?: string;
    profileImageUrl?: string;
  };
}

export function getLivePostExternalUrl(post: PostItem): string | null {
  const target = post.targets?.[0];
  const provider = (target?.socialAccount?.provider || "").toLowerCase();
  const extId = target?.platformPostId;
  if (!extId) return null;
  if (extId.startsWith("http://") || extId.startsWith("https://")) return extId;

  if (provider === "linkedin") {
    return `https://www.linkedin.com/feed/update/${extId}`;
  }
  if (provider === "facebook") {
    return `https://www.facebook.com/${extId}`;
  }
  if (provider === "x" || provider === "twitter") {
    return `https://x.com/i/status/${extId}`;
  }
  if (provider === "youtube") {
    return `https://www.youtube.com/watch?v=${extId}`;
  }
  if (provider === "instagram") {
    return `https://www.instagram.com/p/${extId}/`;
  }
  return null;
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

type StatusTab = "all" | "published" | "scheduled" | "drafts" | "unpublished" | "approvals";

export default function PostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  const getInitialTab = (): StatusTab => {
    const filter = (searchParams.get("filter") || searchParams.get("tab") || "").toLowerCase();
    if (filter === "scheduled") return "scheduled";
    if (filter === "draft" || filter === "drafts") return "drafts";
    if (filter === "approvals" || filter === "pending_approval") return "approvals";
    if (filter === "unpublished" || filter === "failed") return "unpublished";
    if (filter === "published") return "published";
    return "all";
  };

  const [statusTab, setStatusTab] = useState<StatusTab>(getInitialTab());

  // Synchronize statusTab when URL query parameter changes
  useEffect(() => {
    const filter = (searchParams.get("filter") || searchParams.get("tab") || "").toLowerCase();
    if (filter === "scheduled") setStatusTab("scheduled");
    else if (filter === "draft" || filter === "drafts") setStatusTab("drafts");
    else if (filter === "published") setStatusTab("published");
    else if (filter === "approvals" || filter === "pending_approval") setStatusTab("approvals");
    else if (filter === "unpublished" || filter === "failed") setStatusTab("unpublished");
    else if (filter === "all" || !filter) setStatusTab("all");
  }, [searchParams]);

  // Tab change handler with URL sync
  const handleTabChange = (tab: StatusTab) => {
    setStatusTab(tab);
    setSelectedPostIds([]);

    let filterParam = "";
    if (tab === "published") filterParam = "PUBLISHED";
    else if (tab === "scheduled") filterParam = "SCHEDULED";
    else if (tab === "drafts") filterParam = "DRAFT";
    else if (tab === "unpublished") filterParam = "FAILED";
    else if (tab === "approvals") filterParam = "PENDING_APPROVAL";

    const url = filterParam ? `/posts?filter=${filterParam}` : "/posts";
    router.push(url, { scroll: false });
  };

  // Channel & filter controls (defaults to 'all' for dynamic multi-platform view)
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [filterByType, setFilterByType] = useState<"all" | "posts" | "reels" | "stories">("all");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "likes" | "comments">("date-desc");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isNewPostMenuOpen, setIsNewPostMenuOpen] = useState(false);

  // Date filter
  const [dateFilterLabel, setDateFilterLabel] = useState<string>("Choose Date");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(DEFAULT_FILTER_CRITERIA);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  // Modals & States
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerInitialOption, setComposerInitialOption] = useState<"now" | "schedule" | "queue" | "smartq" | undefined>(undefined);
  const [composerPrefill, setComposerPrefill] = useState<{ content: string; mediaUrl?: string } | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedPostForDetails, setSelectedPostForDetails] = useState<PostItem | null>(null);
  const [activeActionMenuPostId, setActiveActionMenuPostId] = useState<string | null>(null);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [connectedChannels, setConnectedChannels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const connectedChannelsRef = useRef(connectedChannels);

  useEffect(() => {
    connectedChannelsRef.current = connectedChannels;
  }, [connectedChannels]);

  // Load backend posts & accounts dynamically
  const loadPostsAndChannels = async () => {
    try {
      setIsLoading(true);
      const [postsRes, accRes] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/social/accounts"),
      ]);

      let loadedPosts: PostItem[] = [];
      if (postsRes.ok) {
        const data = await postsRes.json();
        if (Array.isArray(data.posts)) {
          loadedPosts = data.posts;
        }
        setApiError(null);
      } else {
        const errData = await postsRes.json().catch(() => ({}));
        setApiError(errData?.error || "Failed to load posts from server.");
      }

      // Ensure any legacy fake posts in localStorage are removed
      try {
        localStorage.removeItem("pulsesocial_user_created_posts");
      } catch {}

      setPosts(loadedPosts);

      if (accRes.ok) {
        const aData = await accRes.json();
        if (Array.isArray(aData.accounts)) {
          setConnectedChannels(aData.accounts);
        }
      }
    } catch (err: any) {
      console.warn("Posts loading warning:", err);
      setApiError(err?.message || "Network error loading posts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPostsAndChannels();

    const handleCreated = (e: any) => {
      loadPostsAndChannels();
    };

    window.addEventListener("pulsesocial_post_created", handleCreated);
    window.addEventListener("pulsesocial_posts_updated", handleCreated);
    return () => {
      window.removeEventListener("pulsesocial_post_created", handleCreated);
      window.removeEventListener("pulsesocial_posts_updated", handleCreated);
    };
  }, []);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveActionMenuPostId(null);
      setIsFilterMenuOpen(false);
      setIsSortMenuOpen(false);
      setIsDateMenuOpen(false);
      setIsNewPostMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveActionMenuPostId(null);
        setIsFilterMenuOpen(false);
        setIsSortMenuOpen(false);
        setIsDateMenuOpen(false);
        setIsNewPostMenuOpen(false);
      }
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClonePost = (post: PostItem) => {
    setComposerPrefill({
      content: post.content,
      mediaUrl: post.media?.[0]?.url,
    });
    setComposerInitialOption("now");
    setIsComposerOpen(true);
    setActiveActionMenuPostId(null);
  };

  const handleEditDraft = (post: PostItem) => {
    setComposerPrefill({
      content: post.content,
      mediaUrl: post.media?.[0]?.url,
    });
    setComposerInitialOption("now");
    setIsComposerOpen(true);
    setActiveActionMenuPostId(null);
  };

  const handleEditScheduled = (post: PostItem) => {
    setComposerPrefill({
      content: post.content,
      mediaUrl: post.media?.[0]?.url,
    });
    setComposerInitialOption("schedule");
    setIsComposerOpen(true);
    setActiveActionMenuPostId(null);
  };

  const handleRetryPost = (post: PostItem) => {
    setComposerPrefill({
      content: post.content,
      mediaUrl: post.media?.[0]?.url,
    });
    setComposerInitialOption("now");
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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setSelectedPostIds((prev) => prev.filter((i) => i !== id));
        toast({
          title: "Post Deleted",
          message: "The post was removed from your social feed.",
          type: "success",
        });
        window.dispatchEvent(new CustomEvent("pulsesocial_posts_updated"));
      } else {
        const err = await res.json().catch(() => ({}));
        toast({
          title: "Delete Failed",
          message: err?.error || "Failed to delete post from server.",
          type: "error",
        });
      }
    } catch {
      toast({
        title: "Delete Failed",
        message: "Network error occurred while deleting post.",
        type: "error",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPostIds.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedPostIds.length} selected post(s)? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setIsBulkDeleting(true);
    try {
      await Promise.all(
        selectedPostIds.map((id) =>
          fetch(`/api/posts?id=${id}`, { method: "DELETE" }).catch(() => {})
        )
      );

      const deletedCount = selectedPostIds.length;
      setPosts((prev) => prev.filter((p) => !selectedPostIds.includes(p.id)));
      setSelectedPostIds([]);

      toast({
        title: "Bulk Delete Successful",
        message: `${deletedCount} post(s) were deleted successfully.`,
        type: "success",
      });

      window.dispatchEvent(new CustomEvent("pulsesocial_posts_updated"));
    } catch {
      toast({
        title: "Bulk Action Notice",
        message: "Finished processing selected post deletions.",
        type: "info",
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleCopyPostUrl = (post: PostItem) => {
    const liveUrl = getLivePostExternalUrl(post) || `${window.location.origin}/posts`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(liveUrl);
      toast({
        title: "Live URL Copied",
        message: `Copied post link: ${liveUrl}`,
        type: "success",
      });
    }
    setActiveActionMenuPostId(null);
  };

  // Real status counts directly from persisted records
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const approvalsCount = posts.filter((p) => p.status === "PENDING_APPROVAL").length;
  const unpublishedCount = posts.filter((p) => p.status === "FAILED").length;
  const draftsCount = posts.filter((p) => p.status === "DRAFT").length;
  const allCount = posts.length;

  // Filter posts based on active status tab, channel, content type, date, search, and criteria
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Status tab filter
      if (statusTab === "published" && post.status !== "PUBLISHED") return false;
      if (statusTab === "scheduled" && post.status !== "SCHEDULED") return false;
      if (statusTab === "approvals" && post.status !== "PENDING_APPROVAL") return false;
      if (statusTab === "unpublished" && post.status !== "FAILED") return false;
      if (statusTab === "drafts" && post.status !== "DRAFT") return false;

      // 2. Channel filter
      if (selectedChannel !== "all") {
        const matchesChannel = post.targets?.some((t) => {
          const accId = t.socialAccountId || t.socialAccount?.id || "";
          const prov = (t.socialAccount?.provider || "").toLowerCase();
          return accId === selectedChannel || prov === selectedChannel.toLowerCase();
        });
        if (!matchesChannel) return false;
      }

      // 3. Filter by type (posts, reels, stories)
      if (filterByType === "reels") {
        const isVideo = post.media?.some(
          (m) =>
            m.mediaType === "video" ||
            m.url?.includes("video") ||
            m.url?.includes("office") ||
            m.url?.includes("chocolate") ||
            m.url?.includes(".mp4")
        );
        if (!isVideo) return false;
      } else if (filterByType === "stories") {
        const hasStoryFlag = (post as any).isStory || post.content.toLowerCase().includes("#story");
        if (!hasStoryFlag) return false;
      }

      // 4. Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesContent = post.content.toLowerCase().includes(q);
        const matchesAuthor = post.author?.name?.toLowerCase().includes(q);
        const matchesPlatform = post.targets?.some(
          (t) =>
            t.socialAccount?.displayName?.toLowerCase().includes(q) ||
            t.socialAccount?.provider?.toLowerCase().includes(q)
        );
        if (!matchesContent && !matchesAuthor && !matchesPlatform) {
          return false;
        }
      }

      // 5. Date filter
      if (dateFilterLabel !== "Choose Date" && dateFilterLabel !== "All Time") {
        const postDate = new Date(post.publishedAt || post.scheduledFor || post.createdAt).getTime();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (dateFilterLabel === "Today") {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          if (postDate < startOfToday.getTime()) return false;
        } else if (dateFilterLabel === "Yesterday") {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const startOfYesterday = new Date(startOfToday.getTime() - oneDay);
          if (postDate < startOfYesterday.getTime() || postDate >= startOfToday.getTime()) return false;
        } else if (dateFilterLabel === "Last 7 Days") {
          if (postDate < now - 7 * oneDay) return false;
        } else if (dateFilterLabel === "Last 15 Days") {
          if (postDate < now - 15 * oneDay) return false;
        } else if (dateFilterLabel === "Last 30 Days") {
          if (postDate < now - 30 * oneDay) return false;
        } else if (dateFilterLabel === "This Month") {
          const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
          if (postDate < startOfMonth) return false;
        }
      }

      // 6. Advanced Platforms filter
      if (filterCriteria.platforms.length > 0) {
        const matchesPlatform = post.targets?.some((t) => {
          const prov = (t.socialAccount?.provider || "").toLowerCase();
          return filterCriteria.platforms.some((plat) => {
            if (plat === "x") return prov.includes("x") || prov.includes("twitter");
            if (plat === "threads") return prov.includes("thread");
            if (plat === "google") return prov.includes("google");
            return prov.includes(plat.toLowerCase());
          });
        });
        if (!matchesPlatform) return false;
      }

      // 7. Advanced Approval Status filter
      if (filterCriteria.approvalStatuses.length > 0) {
        if (!filterCriteria.approvalStatuses.includes(post.status)) {
          return false;
        }
      }

      // 8. Advanced Campaign filter
      if (filterCriteria.campaigns.length > 0) {
        const postCampaign = (post as any).campaignId || (post as any).campaign || "";
        const contentLower = (post.content || "").toLowerCase();
        const matchesCampaign = filterCriteria.campaigns.some((camp) => {
          if (postCampaign === camp) return true;
          if (camp === "q4-growth" && (contentLower.includes("growth") || contentLower.includes("q4"))) return true;
          if (camp === "product-launch" && (contentLower.includes("launch") || contentLower.includes("feature") || contentLower.includes("ai"))) return true;
          if (camp === "community-stories" && (contentLower.includes("community") || contentLower.includes("customer") || contentLower.includes("story"))) return true;
          if (camp === "thought-leadership" && (contentLower.includes("insight") || contentLower.includes("founder") || contentLower.includes("leadership"))) return true;
          if (camp === "seasonal-promos" && (contentLower.includes("sale") || contentLower.includes("promo") || contentLower.includes("discount"))) return true;
          return false;
        });
        if (!matchesCampaign) return false;
      }

      return true;
    });
  }, [posts, statusTab, selectedChannel, filterByType, searchQuery, dateFilterLabel, filterCriteria]);

  // Sort posts
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (sortBy === "date-desc") {
        const dateA = new Date(a.publishedAt || a.scheduledFor || a.createdAt).getTime();
        const dateB = new Date(b.publishedAt || b.scheduledFor || b.createdAt).getTime();
        return dateB - dateA;
      }
      if (sortBy === "date-asc") {
        const dateA = new Date(a.publishedAt || a.scheduledFor || a.createdAt).getTime();
        const dateB = new Date(b.publishedAt || b.scheduledFor || b.createdAt).getTime();
        return dateA - dateB;
      }
      if (sortBy === "likes") {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (sortBy === "comments") {
        return (b.comments || 0) - (a.comments || 0);
      }
      return 0;
    });
  }, [filteredPosts, sortBy]);

  // Clickable hashtags in caption
  const renderFormattedCaption = (content: string) => {
    const parts = content.split(/(\#[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <span
            key={index}
            className="text-[#5846A8] dark:text-[#FBBF24] font-semibold hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery(part);
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Helper status badge renderer
  const renderStatusBadge = (status: PostItem["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Published
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-2.5 h-2.5" />
            Scheduled
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <FileText className="w-2.5 h-2.5" />
            Draft
          </span>
        );
      case "PENDING_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#5846A8] dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <CheckCircle2 className="w-2.5 h-2.5" />
            In Review
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-2.5 h-2.5" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const isAnyFilterActive =
    searchQuery.trim().length > 0 ||
    selectedChannel !== "all" ||
    filterByType !== "all" ||
    dateFilterLabel !== "Choose Date" ||
    filterCriteria.platforms.length > 0 ||
    filterCriteria.approvalStatuses.length > 0 ||
    filterCriteria.campaigns.length > 0;

  const handleResetAllFilters = () => {
    setSearchQuery("");
    setSelectedChannel("all");
    setFilterByType("all");
    setDateFilterLabel("Choose Date");
    setFilterCriteria(DEFAULT_FILTER_CRITERIA);
    toast({
      title: "Filters Cleared",
      message: "Reset all search queries, date ranges, and category filters.",
      type: "info",
    });
  };

  return (
    <AppLayout>
      <div className="bg-slate-50 dark:bg-[#0D0D0E] min-h-[calc(100vh-64px)] font-sans flex flex-col w-full transition-colors duration-200">
        
        {/* ============================================================ */}
        {/* UNIFIED FULL-WIDTH POSTS & QUEUE MAIN WORKSPACE             */}
        {/* ============================================================ */}
        <main className="flex-1 w-full bg-white dark:bg-[#0D0D0E] flex flex-col min-w-0 border-b border-slate-200 dark:border-white/7">

          {/* 1. TOP WORKSPACE HEADER & NEW POST BUTTON */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111113]">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Posts &amp; Queue
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-100 text-[#5846A8] dark:bg-amber-500/15 dark:text-[#FBBF24]">
                  {allCount} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-0.5">
                Manage, schedule, and review social content across your connected networks.
              </p>
            </div>

            {/* Action Buttons: New Post Dropdown + Connect Channel */}
            <div className="flex items-center gap-3">
              {/* Primary New Post Split Button with Real Functional Dropdown */}
              <div className="relative">
                <div className="flex items-center rounded-xl shadow-md shadow-purple-900/20 hover:shadow-purple-900/35 dark:shadow-amber-900/20 overflow-hidden bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-gradient-to-r dark:from-[#E08738] dark:to-[#F59E0B] dark:text-[#0F0F11] font-bold hover:brightness-105 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                  <button
                    type="button"
                    onClick={() => {
                      setComposerPrefill(null);
                      setComposerInitialOption("now");
                      setIsComposerOpen(true);
                    }}
                    className="py-2 px-3.5 flex items-center gap-2 text-xs font-bold cursor-pointer active:scale-95 transition text-white dark:text-[#0F0F11]"
                    title="Open Post Composer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>New Post</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNewPostMenuOpen(!isNewPostMenuOpen);
                    }}
                    aria-expanded={isNewPostMenuOpen}
                    className="px-2.5 py-2 border-l border-white/20 dark:border-black/15 hover:bg-white/10 dark:hover:bg-black/10 transition cursor-pointer text-white dark:text-[#0F0F11]"
                    title="More post creation options"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Real Working New Post Menu */}
                {isNewPostMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-11 w-52 bg-white dark:bg-[#1C1C20] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 py-1.5 z-50 text-xs font-semibold animate-in fade-in zoom-in-95 backdrop-blur-md"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewPostMenuOpen(false);
                        setComposerPrefill(null);
                        setComposerInitialOption("now");
                        setIsComposerOpen(true);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-purple-50 dark:hover:bg-white/5 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />
                      <span>Create Post</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewPostMenuOpen(false);
                        setComposerPrefill({ content: "" });
                        setComposerInitialOption("schedule");
                        setIsComposerOpen(true);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-purple-50 dark:hover:bg-white/5 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#5846A8] dark:text-amber-500" />
                      <span>Schedule Post</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewPostMenuOpen(false);
                        setComposerPrefill({ content: "" });
                        setComposerInitialOption("now");
                        setIsComposerOpen(true);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-purple-50 dark:hover:bg-white/5 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Create Draft</span>
                    </button>
                    <div className="border-t border-slate-100 dark:border-white/10 my-1" />
                    <Link
                      href="/calendar"
                      onClick={() => setIsNewPostMenuOpen(false)}
                      className="w-full px-3.5 py-2 text-left hover:bg-purple-50 dark:hover:bg-white/5 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#5846A8] dark:text-blue-500" />
                      <span>Open Content Calendar</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewPostMenuOpen(false);
                        setIsConnectModalOpen(true);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-purple-50 dark:hover:bg-white/5 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Connect New Channel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. CONNECTED CHANNELS BAR (Responsive Horizontal Scroll) */}
          <div className="px-6 pt-3 pb-0 border-b border-slate-200 dark:border-white/7 flex items-center gap-4 bg-white dark:bg-[#111113] overflow-x-auto no-scrollbar">
            {/* All Channels tab */}
            <button
              type="button"
              onClick={() => setSelectedChannel("all")}
              className={`pb-2.5 text-xs font-bold transition cursor-pointer relative shrink-0 hover:text-[#5846A8] dark:hover:text-white ${
                selectedChannel === "all"
                  ? "text-[#5846A8] dark:text-[#FBBF24]"
                  : "text-slate-500 dark:text-[#9CA3AF]"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>All Channels</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#9CA3AF] font-semibold">
                  {connectedChannels.length}
                </span>
              </div>
              {selectedChannel === "all" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5846A8] dark:bg-[#E08738]" />
              )}
            </button>

            {/* Dynamically Render Real Connected Channels Tabs */}
            {connectedChannels.map((channel) => {
              const isSelected = selectedChannel === channel.provider || selectedChannel === channel.id;
              return (
                <button
                  key={channel.id || channel.provider}
                  type="button"
                  onClick={() => setSelectedChannel(channel.provider)}
                  className={`pb-2.5 flex items-center gap-2 text-xs font-bold transition cursor-pointer relative shrink-0 hover:text-[#5846A8] dark:hover:text-white ${
                    isSelected
                      ? "text-[#5846A8] dark:text-[#FBBF24]"
                      : "text-slate-500 dark:text-[#9CA3AF] opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="relative w-5 h-5 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1C1C20] flex items-center justify-center shadow-2xs">
                    {channel.profileImageUrl ? (
                      <img
                        src={channel.profileImageUrl}
                        alt={channel.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      renderPlatformIcon(channel.provider, 13)
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white dark:bg-[#17171A] ring-1 ring-white dark:ring-white/10 flex items-center justify-center">
                      {renderPlatformIcon(channel.provider, 9)}
                    </div>
                  </div>
                  <span>{channel.displayName || channel.provider}</span>
                  {isSelected && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5846A8] dark:bg-[#E08738]" />
                  )}
                </button>
              );
            })}

            {/* Connect More Channels Button */}
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="ml-auto text-xs text-[#5846A8] dark:text-[#FBBF24] hover:text-[#48388d] dark:hover:text-[#E08738] font-semibold hover:underline flex items-center gap-1 cursor-pointer pb-2 shrink-0 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect Channel</span>
            </button>
          </div>

          {/* 3. POST STATUS HORIZONTAL NAVIGATION TABS (All Posts, Published, Scheduled, Drafts, Failed, Approvals) */}
          <div className="px-6 border-b border-slate-200 dark:border-white/7 bg-[#fafafc] dark:bg-[#111113] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 sm:gap-2 py-2">
              {[
                { key: "all" as StatusTab, label: "All Posts", count: allCount, icon: FileText },
                { key: "published" as StatusTab, label: "Published", count: publishedCount, icon: Send },
                { key: "scheduled" as StatusTab, label: "Scheduled", count: scheduledCount, icon: Clock },
                { key: "drafts" as StatusTab, label: "Drafts", count: draftsCount, icon: FileText },
                {
                  key: "unpublished" as StatusTab,
                  label: "Failed / Unpublished",
                  count: unpublishedCount,
                  icon: AlertTriangle,
                  isAlert: unpublishedCount > 0,
                },
                { key: "approvals" as StatusTab, label: "Approvals", count: approvalsCount, icon: CheckCircle2 },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = statusTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer shrink-0 hover:scale-[1.02] ${
                      isActive
                        ? "bg-[#5846A8] text-white shadow-xs font-bold dark:bg-[#E08738] dark:text-[#0F0F11]"
                        : "text-slate-600 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <TabIcon className={`w-3.5 h-3.5 ${isActive ? "text-white dark:text-[#0F0F11]" : "text-slate-400 dark:text-[#9CA3AF]"}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-black/15 dark:text-[#0F0F11]"
                          : tab.isAlert
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                          : "bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-[#9CA3AF]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}

              {/* Quick Calendar Link */}
              <Link
                href="/calendar"
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-[#FBBF24] hover:bg-purple-50 dark:hover:bg-white/5 transition-colors shrink-0"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Calendar View</span>
              </Link>
            </div>
          </div>

          {/* 4. CONTENT TOOLBAR: Search, Filter by Type, Sort by, Date Range, Advanced Filters */}
          <div className="px-6 py-2.5 border-b border-slate-100 dark:border-white/7 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-600 dark:text-[#9CA3AF] bg-white dark:bg-[#0D0D0E]">
            <div className="flex items-center gap-4 flex-wrap flex-1 min-w-0">
              {/* Search box with real-time text matching */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#6B7280] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts or #tags..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#17171A] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#5846A8] dark:focus:ring-[#E08738] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter by: Content Type */}
              <div className="relative flex items-center gap-1.5">
                <span className="text-slate-400 dark:text-[#6B7280] text-xs italic">Type:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFilterMenuOpen(!isFilterMenuOpen);
                  }}
                  className="font-bold text-slate-800 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-[#FBBF24] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="capitalize">{filterByType === "all" ? "All Types" : filterByType}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isFilterMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-10 top-7 w-36 bg-white dark:bg-[#1C1C20] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 py-1 z-40 animate-in fade-in text-xs font-semibold backdrop-blur-md"
                  >
                    {(["all", "posts", "reels", "stories"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setFilterByType(t);
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-purple-50 dark:hover:bg-white/5 capitalize cursor-pointer transition-colors ${
                          filterByType === t ? "text-[#5846A8] dark:text-[#FBBF24] font-bold bg-purple-50/60 dark:bg-white/5" : "text-slate-700 dark:text-[#9CA3AF]"
                        }`}
                      >
                        <span>{t === "all" ? "All Types" : t}</span>
                        {filterByType === t && <Check className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort by: Date, Likes, Comments */}
              <div className="relative flex items-center gap-1.5">
                <span className="text-slate-400 dark:text-[#6B7280] text-xs italic">Sort:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSortMenuOpen(!isSortMenuOpen);
                  }}
                  className="font-bold text-slate-800 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-[#FBBF24] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="capitalize">
                    {sortBy === "date-desc"
                      ? "Newest Date"
                      : sortBy === "date-asc"
                      ? "Oldest Date"
                      : sortBy === "likes"
                      ? "Most Likes"
                      : "Most Comments"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isSortMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-10 top-7 w-40 bg-white dark:bg-[#1C1C20] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 py-1 z-40 animate-in fade-in text-xs font-semibold backdrop-blur-md"
                  >
                    {[
                      { key: "date-desc" as const, label: "Newest Date" },
                      { key: "date-asc" as const, label: "Oldest Date" },
                      { key: "likes" as const, label: "Most Likes" },
                      { key: "comments" as const, label: "Most Comments" },
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => {
                          setSortBy(s.key);
                          setIsSortMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-purple-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${
                          sortBy === s.key ? "text-[#5846A8] dark:text-[#FBBF24] font-bold bg-purple-50/60 dark:bg-white/5" : "text-slate-700 dark:text-[#9CA3AF]"
                        }`}
                      >
                        <span>{s.label}</span>
                        {sortBy === s.key && <Check className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced Filters Button */}
              <button
                type="button"
                onClick={() => setIsAdvancedFiltersOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer hover:scale-[1.02] ${
                  filterCriteria.platforms.length > 0 ||
                  filterCriteria.approvalStatuses.length > 0 ||
                  filterCriteria.campaigns.length > 0 ||
                  filterCriteria.contentTypes.length > 0
                    ? "bg-purple-50 dark:bg-amber-500/15 border-[#5846A8] dark:border-[#E08738] text-[#5846A8] dark:text-[#FBBF24] shadow-2xs font-bold"
                    : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#17171A] text-slate-700 dark:text-[#9CA3AF] hover:bg-purple-50/60 dark:hover:bg-white/5 hover:border-purple-300 dark:hover:border-white/20"
                }`}
                title="Filter posts by platform, campaign, and approval status"
              >
                <Filter className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />
                <span>Advanced Filters</span>
                {(filterCriteria.platforms.length > 0 ||
                  filterCriteria.approvalStatuses.length > 0 ||
                  filterCriteria.campaigns.length > 0 ||
                  filterCriteria.contentTypes.length > 0) && (
                  <span className="w-4 h-4 rounded-full bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] text-[10px] flex items-center justify-center font-bold">
                    {filterCriteria.platforms.length +
                      filterCriteria.approvalStatuses.length +
                      filterCriteria.campaigns.length +
                      filterCriteria.contentTypes.length}
                  </span>
                )}
              </button>

              {/* Clear active filters button */}
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="text-xs text-[#5846A8] dark:text-[#FBBF24] hover:underline cursor-pointer font-semibold transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Right side: Date Range Filter */}
            <div className="relative flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDateMenuOpen(!isDateMenuOpen);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-white cursor-pointer px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#17171A] hover:border-purple-300 dark:hover:border-white/20 transition-all duration-150"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>{dateFilterLabel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isDateMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-9 w-44 bg-white dark:bg-[#1C1C20] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 py-1.5 z-40 animate-in fade-in text-xs font-semibold backdrop-blur-md"
                >
                  {[
                    "All Time",
                    "Today",
                    "Yesterday",
                    "Last 7 Days",
                    "Last 15 Days",
                    "Last 30 Days",
                    "This Month",
                  ].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDateFilterLabel(d);
                        setIsDateMenuOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-purple-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${
                        dateFilterLabel === d ? "text-[#5846A8] dark:text-[#FBBF24] font-bold" : "text-slate-700 dark:text-[#9CA3AF]"
                      }`}
                    >
                      <span>{d}</span>
                      {dateFilterLabel === d && <Check className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 5. BULK ACTION TOOLBAR (Visible when 1 or more posts are selected) */}
          {selectedPostIds.length > 0 && (
            <div className="px-6 py-2.5 bg-purple-50 dark:bg-[#241C14] border-b border-purple-200 dark:border-[#E08738]/40 flex items-center justify-between gap-4 text-xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#5846A8] dark:text-[#FBBF24]">
                  {selectedPostIds.length} post{selectedPostIds.length > 1 ? "s" : ""} selected
                </span>
                <span className="text-slate-400 dark:text-[#6B7280]">|</span>
                <button
                  type="button"
                  onClick={() => handleToggleSelectAll(sortedPosts.map((p) => p.id))}
                  className="text-slate-600 dark:text-[#9CA3AF] hover:underline font-semibold cursor-pointer"
                >
                  {selectedPostIds.length === sortedPosts.length ? "Deselect all" : `Select all (${sortedPosts.length})`}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBulkDeleting ? "Deleting..." : "Delete Selected"}</span>
                </button>
              </div>
            </div>
          )}

          {/* 6. DESKTOP POSTS TABLE VIEW (hidden on mobile, visible on md+) */}
          <div className="hidden md:block flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/7 text-[11px] font-bold text-slate-500 dark:text-[#9CA3AF] uppercase tracking-wider bg-slate-50/70 dark:bg-[#17171A] select-none">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={sortedPosts.length > 0 && selectedPostIds.length === sortedPosts.length}
                      onChange={() => handleToggleSelectAll(sortedPosts.map((p) => p.id))}
                      className="rounded border-slate-300 dark:border-white/20 text-[#5846A8] focus:ring-[#5846A8] dark:text-[#E08738] dark:focus:ring-[#E08738] accent-[#5846A8] dark:accent-[#E08738] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold w-40">DATE &amp; TIME</th>
                  <th className="py-3 px-4 font-bold">POST CONTENT</th>
                  <th className="py-3 px-4 font-bold w-28 text-center">STATUS</th>
                  <th className="py-3 px-4 font-bold w-28 text-center">
                    <span className="inline-flex items-center gap-1 justify-center">
                      <span>INTERACTION</span>
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-400 dark:border-white/20 text-slate-400 dark:text-[#9CA3AF] flex items-center justify-center text-[9px] cursor-help"
                        title="Sum of real likes and comments recorded for this post"
                      >
                        ?
                      </span>
                    </span>
                  </th>
                  <th className="py-3 px-4 font-bold w-44">PUBLISHED BY</th>
                  <th className="py-3 px-4 font-bold text-right w-20">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/7">
                {sortedPosts.length > 0 ? (
                  sortedPosts.map((post) => {
                    const postTimestamp = post.publishedAt || post.scheduledFor || post.createdAt;
                    const dateObj = new Date(postTimestamp);
                    const dateFormatted = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recent";
                    const timeFormatted = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "";

                    const mediaItem = post.media?.[0];
                    const isVideo =
                      mediaItem?.mediaType === "video" ||
                      mediaItem?.url?.includes("video") ||
                      mediaItem?.url?.includes("office") ||
                      mediaItem?.url?.includes(".mp4");
                    const interactions = (post.likes || 0) + (post.comments || 0);

                    return (
                      <tr
                        key={post.id}
                        onClick={() => setSelectedPostForDetails(post)}
                        className={`hover:bg-purple-50/50 dark:hover:bg-white/5 transition-all duration-150 group cursor-pointer ${
                          selectedPostIds.includes(post.id) ? "bg-purple-50/80 dark:bg-amber-500/15" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td
                          className="py-4 px-4 text-center align-top"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPostIds.includes(post.id)}
                            onChange={(e) => handleToggleSelectPost(post.id, e as any)}
                            className="rounded border-slate-300 dark:border-white/20 text-[#5846A8] focus:ring-[#5846A8] dark:text-[#E08738] dark:focus:ring-[#E08738] accent-[#5846A8] dark:accent-[#E08738] cursor-pointer"
                          />
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <div className="text-xs font-semibold text-slate-800 dark:text-white">
                            {dateFormatted}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-[#6B7280] font-normal">
                            {timeFormatted}
                          </div>
                        </td>

                        {/* Post Content */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-start gap-3">
                            {/* Thumbnail preview */}
                            {mediaItem?.url ? (
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                                <img
                                  src={mediaItem.url}
                                  alt="Post attachment"
                                  className="w-full h-full object-cover"
                                  onError={(e: any) => {
                                    e.target.src = "/icons/pulse-logo.svg";
                                  }}
                                />
                                {isVideo && (
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <div className="w-5 h-5 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xs">
                                      <Play className="w-2.5 h-2.5 fill-slate-900 ml-0.5" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : null}

                            {/* Text & Hashtags */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line line-clamp-3">
                                {renderFormattedCaption(post.content || "(No caption provided)")}
                              </p>

                              {/* Reaction counts */}
                              {(post.likes || 0) + (post.comments || 0) > 0 && (
                                <div className="flex items-center gap-2 pt-0.5">
                                  {post.likes ? (
                                    <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                      <ThumbsUp className="w-3 h-3 text-blue-600 fill-blue-600" />
                                      <span>{post.likes}</span>
                                    </div>
                                  ) : null}
                                  {post.comments ? (
                                    <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                                      <span>{post.comments}</span>
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 align-top text-center whitespace-nowrap">
                          {renderStatusBadge(post.status)}
                        </td>

                        {/* Interaction */}
                        <td className="py-4 px-4 align-top text-center whitespace-nowrap">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {interactions > 0 ? interactions : "-"}
                          </span>
                        </td>

                        {/* Published By */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          {(() => {
                            const target = post.targets?.[0];
                            const prov = target?.socialAccount?.provider || connectedChannels[0]?.provider || "linkedin";
                            const displayName = target?.socialAccount?.displayName || (prov.charAt(0).toUpperCase() + prov.slice(1));
                            const liveUrl = getLivePostExternalUrl(post);

                            return (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs overflow-hidden shrink-0">
                                    {renderPlatformIcon(prov, 14)}
                                  </div>
                                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]" title={displayName}>
                                    {displayName}
                                  </span>
                                </div>

                                {liveUrl ? (
                                  <a
                                    href={liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                                    title="Open verified live post in new tab"
                                  >
                                    <span>View on {prov === "linkedin" ? "LinkedIn" : prov.toUpperCase()}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-slate-400">
                                    {post.status === "PUBLISHED" ? "Internal record" : post.status}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Contextual Actions */}
                        <td
                          className="py-4 px-4 align-top text-right relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Discuss / Details */}
                            <button
                              type="button"
                              onClick={() => setSelectedPostForDetails(post)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#5846A8] dark:hover:text-[#FBBF24] hover:bg-purple-100/80 dark:hover:bg-white/10 transition-all duration-150 cursor-pointer hover:scale-115 active:scale-95"
                              title="View post details and analytics"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            {/* More Options */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenuPostId(
                                  activeActionMenuPostId === post.id ? null : post.id
                                );
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#5846A8] dark:hover:text-[#FBBF24] hover:bg-purple-100/80 dark:hover:bg-white/10 transition-all duration-150 cursor-pointer hover:scale-115 active:scale-95"
                              title="More options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Row Contextual Action Dropdown */}
                          {activeActionMenuPostId === post.id && (
                            <div className="absolute right-4 top-10 w-48 bg-white dark:bg-[#1C1C20] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 py-1.5 z-50 animate-in fade-in zoom-in-95 text-left text-xs font-semibold backdrop-blur-md">
                              {(() => {
                                const liveUrl = getLivePostExternalUrl(post);
                                const prov = post.targets?.[0]?.socialAccount?.provider || "Social App";
                                return liveUrl ? (
                                  <a
                                    href={liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setActiveActionMenuPostId(null)}
                                    className="w-full px-3.5 py-2 hover:bg-purple-50 hover:text-[#5846A8] dark:hover:bg-white/8 dark:hover:text-[#FBBF24] text-blue-600 dark:text-blue-400 flex items-center gap-2 font-bold transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>Open on {prov === "linkedin" ? "LinkedIn" : prov.toUpperCase()}</span>
                                  </a>
                                ) : null;
                              })()}

                              {post.status === "DRAFT" && (
                                <button
                                  type="button"
                                  onClick={() => handleEditDraft(post)}
                                  className="w-full px-3.5 py-2 hover:bg-purple-50 hover:text-[#5846A8] dark:hover:bg-white/8 dark:hover:text-[#FBBF24] text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />
                                  <span>Edit Draft</span>
                                </button>
                              )}

                              {post.status === "SCHEDULED" && (
                                <button
                                  type="button"
                                  onClick={() => handleEditScheduled(post)}
                                  className="w-full px-3.5 py-2 hover:bg-purple-50 hover:text-[#5846A8] dark:hover:bg-white/8 dark:hover:text-[#FBBF24] text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Clock className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />
                                  <span>Edit Schedule</span>
                                </button>
                              )}

                              {post.status === "FAILED" && (
                                <button
                                  type="button"
                                  onClick={() => handleRetryPost(post)}
                                  className="w-full px-3.5 py-2 hover:bg-purple-50 hover:text-[#5846A8] dark:hover:bg-white/8 dark:hover:text-[#FBBF24] text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Retry Post</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleClonePost(post)}
                                className="w-full px-3.5 py-2 hover:bg-purple-50 hover:text-[#5846A8] dark:hover:bg-white/8 dark:hover:text-[#FBBF24] text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />
                                <span>Duplicate Post</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPostForDetails(post);
                                  setActiveActionMenuPostId(null);
                                }}
                                className="w-full px-3.5 py-2 hover:bg-purple-50 hover:text-[#5846A8] dark:hover:bg-white/8 dark:hover:text-[#FBBF24] text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-500" />
                                <span>View Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyPostUrl(post)}
                                className="w-full px-3.5 py-2 hover:bg-purple-50 hover:text-[#5846A8] dark:hover:bg-white/8 dark:hover:text-[#FBBF24] text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Share2 className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />
                                <span>Copy Post Link</span>
                              </button>

                              <div className="border-t border-slate-100 dark:border-white/10 my-1" />

                              <button
                                type="button"
                                onClick={() => {
                                  handleDeletePost(post.id);
                                  setActiveActionMenuPostId(null);
                                }}
                                className="w-full px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Post</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-slate-400">
                      {apiError ? (
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center mb-3 shadow-xs">
                            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                          </div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Unable to load posts
                          </p>
                          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1 mb-4 leading-relaxed">
                            {apiError}
                          </p>
                          <button
                            type="button"
                            onClick={loadPostsAndChannels}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 hover:shadow-purple-900/35 dark:bg-[#E08738] dark:hover:bg-[#D97706] dark:text-[#0F0F11] text-xs font-bold transition shadow-xs cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry</span>
                          </button>
                        </div>
                      ) : isAnyFilterActive ? (
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            No matching posts found
                          </p>
                          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1 mb-4 leading-relaxed">
                            No posts match your active filter criteria. Try resetting your search query or selecting another status tab.
                          </p>
                          <button
                            type="button"
                            onClick={handleResetAllFilters}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#17171A] hover:bg-slate-200 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reset Filters</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-amber-500/10 border border-purple-200 dark:border-amber-500/20 flex items-center justify-center mb-3 shadow-xs">
                            <FileText className="w-6 h-6 text-[#5846A8] dark:text-[#FBBF24]" />
                          </div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            No posts yet
                          </p>
                          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1 mb-4 leading-relaxed">
                            Create your first post to start managing and scheduling your social media content.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setComposerPrefill(null);
                              setComposerInitialOption("now");
                              setIsComposerOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 hover:shadow-purple-900/35 dark:bg-gradient-to-r dark:from-[#E08738] dark:to-[#F59E0B] dark:text-[#0F0F11] dark:shadow-amber-900/20 text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>Create Post</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 7. MOBILE POST CARDS VIEW (visible on < md screens) */}
          <div className="block md:hidden flex-1 p-4 space-y-3">
            {sortedPosts.length > 0 ? (
              sortedPosts.map((post) => {
                const postTimestamp = post.publishedAt || post.scheduledFor || post.createdAt;
                const dateObj = new Date(postTimestamp);
                const dateFormatted = !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recent";
                const mediaItem = post.media?.[0];
                const liveUrl = getLivePostExternalUrl(post);
                const target = post.targets?.[0];
                const prov = target?.socialAccount?.provider || "social";
                const displayName = target?.socialAccount?.displayName || prov;

                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPostForDetails(post)}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-white/7 bg-white dark:bg-[#17171A] shadow-xs space-y-3 cursor-pointer hover:border-purple-300 dark:hover:border-amber-500/40 transition-colors"
                  >
                    {/* Header: Platform, Name, Status, Date */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                          {renderPlatformIcon(prov, 13)}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {displayName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {renderStatusBadge(post.status)}
                        <span className="text-[11px] text-slate-400 dark:text-[#6B7280] font-normal">
                          {dateFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Content & Media Preview */}
                    <div className="flex items-start gap-3">
                      {mediaItem?.url && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-white/10">
                          <img
                            src={mediaItem.url}
                            alt="Attachment"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-xs text-slate-700 dark:text-[#9CA3AF] leading-relaxed font-normal line-clamp-3 flex-1">
                        {renderFormattedCaption(post.content || "(No caption provided)")}
                      </p>
                    </div>

                    {/* Footer: Interactions + Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/7 text-xs">
                      <div className="flex items-center gap-2">
                        {(post.likes || 0) + (post.comments || 0) > 0 ? (
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9CA3AF]">
                            {post.likes || 0} likes · {post.comments || 0} comments
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-[#6B7280]">No interactions yet</span>
                        )}
                        {liveUrl && (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <span>Live Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleClonePost(post)}
                          className="p-1 rounded-md text-slate-400 hover:text-[#5846A8] dark:hover:text-slate-200 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-slate-400 max-w-sm mx-auto px-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-amber-500/10 border border-purple-200 dark:border-amber-500/20 flex items-center justify-center mb-3 mx-auto shadow-xs">
                  <FileText className="w-6 h-6 text-[#5846A8] dark:text-[#FBBF24]" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {isAnyFilterActive ? "No matching posts found" : "No posts yet"}
                </p>
                <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1 mb-4 leading-relaxed">
                  {isAnyFilterActive
                    ? "No posts match your active filter criteria."
                    : "Create your first post to start managing your social media content."}
                </p>
                {isAnyFilterActive ? (
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#17171A] hover:bg-purple-50 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-bold transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setComposerPrefill(null);
                      setComposerInitialOption("now");
                      setIsComposerOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 hover:shadow-purple-900/35 dark:bg-gradient-to-r dark:from-[#E08738] dark:to-[#F59E0B] dark:text-[#0F0F11] dark:shadow-amber-900/20 font-bold text-xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Post</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => {
          setIsComposerOpen(false);
          setComposerPrefill(null);
          setComposerInitialOption(undefined);
        }}
        onSuccess={() => {
          loadPostsAndChannels();
        }}
        initialContent={composerPrefill?.content}
        initialMediaUrl={composerPrefill?.mediaUrl}
        initialPublishingOption={composerInitialOption}
      />

      {/* Connect Modal */}
      <UniversalSocialConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={() => {
          loadPostsAndChannels();
        }}
      />

      {/* Post Details & Discuss Modal */}
      {selectedPostForDetails && (
        <PostEngagementDetailsModal
          isOpen={Boolean(selectedPostForDetails)}
          onClose={() => setSelectedPostForDetails(null)}
          post={selectedPostForDetails as any}
        />
      )}

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        activeCriteria={filterCriteria}
        onApply={(newCriteria) => {
          setFilterCriteria(newCriteria);
          toast({
            title: "Filters Applied",
            message: "Filtered posts by platform, campaign, and approval status.",
            type: "success",
          });
        }}
        totalPostsCount={posts.length}
        filteredPostsCount={filteredPosts.length}
      />
    </AppLayout>
  );
}
