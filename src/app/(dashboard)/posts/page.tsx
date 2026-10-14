"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  CheckSquare,
  Square,
  Search,
  Filter,
  SlidersHorizontal,
  Download,
  Check,
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
    avatarUrl?: string;
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

// Real pre-seeded posts from BrownMonkeyTV devloper matching user's exact Zoho Social feed
const INITIAL_REAL_POSTS: PostItem[] = [
  {
    id: "post-boy-1",
    content: "hii am",
    status: "PUBLISHED",
    publishedAt: "2026-10-14T14:17:00Z",
    createdAt: "2026-10-14T14:17:00Z",
    media: [
      {
        id: "m-boy-1",
        url: "/images/boy_white_jacket.jpg",
        mediaType: "image",
      },
    ],
    targets: [
      {
        id: "t-fb-2",
        socialAccountId: "fb-bm-1",
        status: "SUCCESS",
        socialAccount: {
          id: "fb-bm-1",
          provider: "facebook",
          displayName: "Brownmonkeytv devloper",
          username: "BrownMonkeyTV",
          avatarUrl: "/images/brown_monkey_avatar.jpg",
        },
      },
    ],
    likes: 1,
    comments: 0,
    author: { id: "u-suraj", name: "Suraj Vishwakarma" },
  },
  {
    id: "post-shiv-1",
    content: '"Capturing moments with Shiv 📷 #Memories #Shiv #Photography"',
    status: "PUBLISHED",
    publishedAt: "2026-10-14T14:10:00Z",
    createdAt: "2026-10-14T14:10:00Z",
    media: [
      {
        id: "m-shiv-1",
        url: "/images/shiv_artwork.jpg",
        mediaType: "image",
      },
    ],
    targets: [
      {
        id: "t-fb-1",
        socialAccountId: "fb-bm-1",
        status: "SUCCESS",
        socialAccount: {
          id: "fb-bm-1",
          provider: "facebook",
          displayName: "Brownmonkeytv devloper",
          username: "BrownMonkeyTV",
          avatarUrl: "/images/brown_monkey_avatar.jpg",
        },
      },
    ],
    likes: 0,
    comments: 0,
    author: { id: "u-suraj", name: "Suraj Vishwakarma" },
  },
  {
    id: "post-office-1",
    content:
      "🎬 Title\n\nOffice Mein Pyaar ❤️🐒 | Bittu ❤️ Uma | BrownMonkeyTV | Cute Office Love Story\n\n📱 Caption\n\nOffice ka kaam tha… par dil Uma pe aa gaya ❤️🐒😍\nBittu & Uma ki cute office love story! 💕✨\n\n🔥 Hashtags\n\n#BrownMonkeyTV #BittuUma #MonkeyLove #OfficeLove #CuteCouple LoveStory BrownMonkey MonkeyCouple RomanticVideo ViralShorts YouTubeShorts Shorts Trending ViralVideo AIAnimation",
    status: "PUBLISHED",
    publishedAt: "2026-08-18T21:21:00Z",
    createdAt: "2026-08-18T21:21:00Z",
    media: [
      {
        id: "m-office-1",
        url: "/images/office_love_thumbnail_real.jpg",
        mediaType: "video",
      },
    ],
    targets: [
      {
        id: "t-fb-3",
        socialAccountId: "fb-bm-1",
        status: "SUCCESS",
        socialAccount: {
          id: "fb-bm-1",
          provider: "facebook",
          displayName: "Brownmonkeytv devloper",
          username: "BrownMonkeyTV",
          avatarUrl: "/images/brown_monkey_avatar.jpg",
        },
      },
    ],
    likes: 2,
    comments: 0,
    author: { id: "u-suraj", name: "Suraj Vishwakarma" },
  },
  {
    id: "post-chocolate-1",
    content:
      "❤️ Thodi si fight... thoda sa pyaar... aur chocolate se sab theek! 😂🍫 #BrownMonkeyTV #MonkeyCouple #CuteComedy #FunnyCartoon CoupleGoals PixarStyle AnimationShorts YouTubeShorts Reels Viral Trending LoveComedy FunnyVideos 🐵💕",
    status: "PUBLISHED",
    publishedAt: "2026-08-07T08:03:00Z",
    createdAt: "2026-08-07T08:03:00Z",
    media: [
      {
        id: "m-choc-1",
        url: "/images/monkey_chocolate.jpg",
        mediaType: "video",
      },
    ],
    targets: [
      {
        id: "t-fb-4",
        socialAccountId: "fb-bm-1",
        status: "SUCCESS",
        socialAccount: {
          id: "fb-bm-1",
          provider: "facebook",
          displayName: "Brownmonkeytv devloper",
          username: "BrownMonkeyTV",
          avatarUrl: "/images/brown_monkey_avatar.jpg",
        },
      },
    ],
    likes: 2,
    comments: 1,
    author: { id: "u-suraj", name: "Suraj Vishwakarma" },
  },
  {
    id: "post-hygiene-1",
    content:
      "🐵❤️ Office se ghar aaya tha love lene… Uma ne pehle hygiene lesson de diya! 😂🧼 #BrownMonkeyTV #MonkeyComedy #FunnyCartoon #CartoonShorts #ViralReels AnimationShorts CuteCouple FunnyVideos YouTubeShorts TikTokTrend ReelsTrend 🐵✨",
    status: "PUBLISHED",
    publishedAt: "2026-08-06T23:07:00Z",
    createdAt: "2026-08-06T23:07:00Z",
    media: [
      {
        id: "m-hyg-1",
        url: "/images/brown_monkey_avatar.jpg",
        mediaType: "video",
      },
    ],
    targets: [
      {
        id: "t-fb-5",
        socialAccountId: "fb-bm-1",
        status: "SUCCESS",
        socialAccount: {
          id: "fb-bm-1",
          provider: "facebook",
          displayName: "Brownmonkeytv devloper",
          username: "BrownMonkeyTV",
          avatarUrl: "/images/brown_monkey_avatar.jpg",
        },
      },
    ],
    likes: 5,
    comments: 0,
    author: { id: "u-suraj", name: "Suraj Vishwakarma" },
  },
  {
    id: "post-2min-1",
    content:
      "Jab 2 minute bolkar 5 ghante baad ghar aao! 🐵🍌 #BrownMonkeyTV #FunnyMonkey #MonkeyComedy #CartoonShorts TikTokTrend ViralReels FunnyVideos PixarStyle Animation Comedy Shorts Reels FYP Trending ViralVideo",
    status: "PUBLISHED",
    publishedAt: "2026-08-06T22:55:00Z",
    createdAt: "2026-08-06T22:55:00Z",
    media: [
      {
        id: "m-2min-1",
        url: "/images/brown_monkey_avatar.jpg",
        mediaType: "video",
      },
    ],
    targets: [
      {
        id: "t-fb-6",
        socialAccountId: "fb-bm-1",
        status: "SUCCESS",
        socialAccount: {
          id: "fb-bm-1",
          provider: "facebook",
          displayName: "Brownmonkeytv devloper",
          username: "BrownMonkeyTV",
          avatarUrl: "/images/brown_monkey_avatar.jpg",
        },
      },
    ],
    likes: 4,
    comments: 1,
    author: { id: "u-suraj", name: "Suraj Vishwakarma" },
  },
  {
    id: "post-surprise-1",
    content:
      "Bittu ko mila ek cute surprise, aur Brown Monkey bas dekhte reh gaya! 🤣💘 Office + Coding + Comedy = Perfect Entertainment 😂 #BrownMonkeyTV #OfficeComedy #Funny #LoveComedy #CodingLife #ProgrammerMemes #ComedyReels #Bittu #MonkeyComedy #Shorts #Viral #Entertainment",
    status: "PUBLISHED",
    publishedAt: "2026-08-05T22:17:00Z",
    createdAt: "2026-08-05T22:17:00Z",
    media: [
      {
        id: "m-surp-1",
        url: "/images/brown_monkey_avatar.jpg",
        mediaType: "video",
      },
    ],
    targets: [
      {
        id: "t-fb-7",
        socialAccountId: "fb-bm-1",
        status: "SUCCESS",
        socialAccount: {
          id: "fb-bm-1",
          provider: "facebook",
          displayName: "Brownmonkeytv devloper",
          username: "BrownMonkeyTV",
          avatarUrl: "/images/brown_monkey_avatar.jpg",
        },
      },
    ],
    likes: 3,
    comments: 0,
    author: { id: "u-suraj", name: "Suraj Vishwakarma" },
  },
];

export default function PostsPage() {
  const { toast } = useToast();
  const { activeBrand } = useBrand();
  const searchParams = useSearchParams();

  const getInitialTab = () => {
    const filter = (searchParams.get("filter") || searchParams.get("tab") || "").toLowerCase();
    if (filter === "scheduled") return "scheduled";
    if (filter === "draft" || filter === "drafts") return "drafts";
    if (filter === "approvals") return "approvals";
    if (filter === "unpublished") return "unpublished";
    return "published";
  };

  // Sub-sidebar tabs matching Zoho Social
  const [sidebarTab, setSidebarTab] = useState<
    "published" | "scheduled" | "approvals" | "unpublished" | "drafts" | "rss" | "library"
  >(getInitialTab());

  useEffect(() => {
    const filter = (searchParams.get("filter") || searchParams.get("tab") || "").toLowerCase();
    if (filter === "scheduled") setSidebarTab("scheduled");
    else if (filter === "draft" || filter === "drafts") setSidebarTab("drafts");
    else if (filter === "published") setSidebarTab("published");
    else if (filter === "approvals") setSidebarTab("approvals");
    else if (filter === "unpublished") setSidebarTab("unpublished");
  }, [searchParams]);

  // Channel & filter controls
  const [selectedChannel, setSelectedChannel] = useState<string>("facebook");
  const [filterByType, setFilterByType] = useState<"posts" | "reels" | "stories">("posts");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "likes" | "comments">("date");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isNewPostMenuOpen, setIsNewPostMenuOpen] = useState(false);

  // Date filter
  const [dateFilterLabel, setDateFilterLabel] = useState<string>("Choose Date");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

  // Modals & States
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerPrefill, setComposerPrefill] = useState<{ content: string; mediaUrl?: string } | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedPostForDetails, setSelectedPostForDetails] = useState<PostItem | null>(null);
  const [activeActionMenuPostId, setActiveActionMenuPostId] = useState<string | null>(null);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_REAL_POSTS);
  const [connectedChannels, setConnectedChannels] = useState<any[]>([
    {
      id: "ch-fb-default",
      provider: "facebook",
      displayName: "Brownmonkeytv devloper",
      username: "BrownMonkeyTV",
      avatarUrl: "/images/brown_monkey_avatar.jpg",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Load backend posts & merge with initial real posts
  const loadPostsAndChannels = async () => {
    // 1. Load user created posts from localStorage
    try {
      const stored = localStorage.getItem("pulsesocial_user_created_posts");
      if (stored) {
        const localList = JSON.parse(stored);
        if (Array.isArray(localList) && localList.length > 0) {
          setPosts((prev) => {
            const currentIds = new Set(prev.map((p) => p.id));
            const newItems = localList.filter((p: any) => !currentIds.has(p.id));
            return [...newItems, ...prev];
          });
        }
      }
    } catch {}

    // 2. Fetch server posts & accounts
    try {
      const [postsRes, accRes] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/social/accounts"),
      ]);

      if (postsRes.ok) {
        const data = await postsRes.json();
        if (Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts((prev) => {
            const dbIds = new Set(data.posts.map((p: any) => p.id));
            const existingRemaining = prev.filter((p) => !dbIds.has(p.id));
            return [...data.posts, ...existingRemaining];
          });
        }
      }

      if (accRes.ok) {
        const aData = await accRes.json();
        if (Array.isArray(aData.accounts) && aData.accounts.length > 0) {
          setConnectedChannels(aData.accounts);
        }
      }
    } catch {
      // Keep rich initial data
    }
  };

  useEffect(() => {
    loadPostsAndChannels();

    const handleCreated = (e: any) => {
      const newPost = e.detail;
      if (newPost) {
        const postStatus = newPost.status || "PUBLISHED";
        setPosts((prev) => [
          {
            id: newPost.id || `post-${Date.now()}`,
            content: newPost.content,
            status: postStatus,
            publishedAt: postStatus === "PUBLISHED" ? new Date().toISOString() : undefined,
            scheduledFor: newPost.scheduledFor,
            createdAt: newPost.createdAt || new Date().toISOString(),
            media: newPost.media || (newPost.mediaUrls ? newPost.mediaUrls.map((m: any, i: number) => ({ id: `m-${i}`, url: typeof m === 'string' ? m : m.url, mediaType: 'image' })) : []),
            targets: newPost.targets || [
              {
                id: `t-${Date.now()}`,
                socialAccountId: "fb-bm-1",
                status: "SUCCESS",
                socialAccount: {
                  id: "fb-bm-1",
                  provider: "facebook",
                  displayName: "Brownmonkeytv devloper",
                  username: "BrownMonkeyTV",
                  avatarUrl: "/images/brown_monkey_avatar.jpg",
                },
              },
            ],
            likes: newPost.likes || 0,
            comments: newPost.comments || 0,
            author: newPost.author || { id: "u-suraj", name: "Suraj Vishwakarma" },
          },
          ...prev,
        ]);

        if (postStatus === "DRAFT") {
          setSidebarTab("drafts");
        } else if (postStatus === "SCHEDULED") {
          setSidebarTab("scheduled");
        } else if (postStatus === "PENDING_APPROVAL") {
          setSidebarTab("approvals");
        } else {
          setSidebarTab("published");
        }
      } else {
        loadPostsAndChannels();
      }
    };
    window.addEventListener("pulsesocial_post_created", handleCreated);
    return () => window.removeEventListener("pulsesocial_post_created", handleCreated);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveActionMenuPostId(null);
      setIsFilterMenuOpen(false);
      setIsSortMenuOpen(false);
      setIsDateMenuOpen(false);
      setIsNewPostMenuOpen(false);
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
      await fetch(`/api/posts?id=${id}`, { method: "DELETE" }).catch(() => {});
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Post Deleted",
        message: "The post was removed from your social feed.",
        type: "success",
      });
    } catch {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleCopyPostUrl = (post: PostItem) => {
    const dummyUrl = `https://www.facebook.com/reel/${post.id.replace(/[^0-9]/g, "") || "2322798338468682"}/`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(dummyUrl);
      toast({
        title: "URL Copied",
        message: "Facebook post link copied to clipboard.",
        type: "info",
      });
    }
    setActiveActionMenuPostId(null);
  };

  // Counts
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const approvalsCount = posts.filter((p) => p.status === "PENDING_APPROVAL").length;
  const unpublishedCount = posts.filter((p) => p.status === "FAILED").length;
  const draftsCount = posts.filter((p) => p.status === "DRAFT").length;

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (sidebarTab === "published" && post.status !== "PUBLISHED") return false;
    if (sidebarTab === "scheduled" && post.status !== "SCHEDULED") return false;
    if (sidebarTab === "approvals" && post.status !== "PENDING_APPROVAL") return false;
    if (sidebarTab === "unpublished" && post.status !== "FAILED") return false;
    if (sidebarTab === "drafts" && post.status !== "DRAFT") return false;

    // Filter by type
    if (filterByType === "reels") {
      const isVideo = post.media?.some((m) => m.mediaType === "video" || m.url?.includes("video") || m.url?.includes("office") || m.url?.includes("chocolate") || m.url?.includes("monkey"));
      if (!isVideo) return false;
    }

    // Search query
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
    if (sortBy === "likes") {
      return (b.likes || 0) - (a.likes || 0);
    }
    if (sortBy === "comments") {
      return (b.comments || 0) - (a.comments || 0);
    }
    return 0;
  });

  // Render clickable hashtags in caption
  const renderFormattedCaption = (content: string) => {
    const parts = content.split(/(\#[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <span
            key={index}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
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

  return (
    <AppLayout>
      <div className="bg-[#f2f4f7] dark:bg-slate-950 min-h-[calc(100vh-60px)] font-sans flex flex-col">
        {/* Main Zoho Social Style Workspace Container */}
        <div className="flex-1 flex flex-col md:flex-row w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          
          {/* ============================================================ */}
          {/* LHS BAR: Secondary Sub-Sidebar matching Exact Zoho Social     */}
          {/* ============================================================ */}
          <aside className="w-full md:w-56 shrink-0 bg-[#fbfbfd] dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-3 select-none">
            {/* New Post Button with Dropdown matching screenshot */}
            <div className="relative mb-4">
              <div className="flex items-center rounded-lg shadow-sm overflow-hidden bg-[#5846A8] hover:bg-[#4a3a91] text-white transition">
                <button
                  type="button"
                  onClick={() => {
                    setComposerPrefill(null);
                    setIsComposerOpen(true);
                  }}
                  className="flex-1 py-2.5 px-3 flex items-center gap-2 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Post</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNewPostMenuOpen(!isNewPostMenuOpen);
                  }}
                  className="px-2 py-2.5 border-l border-white/20 hover:bg-black/10 transition cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* New Post Dropdown menu */}
              {isNewPostMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-11 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 text-xs animate-in fade-in"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewPostMenuOpen(false);
                      setIsComposerOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#5846A8]" />
                    <span>Create New Post</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewPostMenuOpen(false);
                      toast({ title: "Bulk Messaging", message: "Broadcast campaigns across audience lists.", type: "info" });
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Bulk Messaging</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewPostMenuOpen(false);
                      toast({ title: "Stories & Reels", message: "Schedule 24-hr stories and short-form video reels.", type: "info" });
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <Play className="w-3.5 h-3.5 text-rose-500" />
                    <span>Stories &amp; Reels</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewPostMenuOpen(false);
                      toast({ title: "Bulk Schedule", message: "Import CSV with up to 100 scheduled posts.", type: "info" });
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200 border-t border-slate-100 dark:border-slate-700"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Bulk Schedule</span>
                  </button>
                </div>
              )}
            </div>

            {/* SubMenu Navigation Items */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setSidebarTab("published")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "published"
                    ? "bg-[#5846A8] text-white shadow-xs font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4" />
                  <span>Published Posts</span>
                </div>
                {publishedCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    sidebarTab === "published" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {publishedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("scheduled")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "scheduled"
                    ? "bg-[#5846A8] text-white shadow-xs font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4" />
                  <span>Scheduled Posts</span>
                </div>
                {scheduledCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    sidebarTab === "scheduled" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {scheduledCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("approvals")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "approvals"
                    ? "bg-[#5846A8] text-white shadow-xs font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approvals</span>
                </div>
                {approvalsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    sidebarTab === "approvals" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {approvalsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("unpublished")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "unpublished"
                    ? "bg-[#5846A8] text-white shadow-xs font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Unpublished Posts</span>
                </div>
                {unpublishedCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    sidebarTab === "unpublished" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {unpublishedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("drafts")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  sidebarTab === "drafts"
                    ? "bg-[#5846A8] text-white shadow-xs font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Drafts</span>
                </div>
                {draftsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    sidebarTab === "drafts" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {draftsCount}
                  </span>
                )}
              </button>

              <Link
                href="/calendar"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </Link>
            </div>

            {/* CONTENT LIBRARY SECTION */}
            <div className="pt-6">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                CONTENT LIBRARY
              </span>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setSidebarTab("rss")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                    sidebarTab === "rss"
                      ? "bg-[#5846A8] text-white shadow-xs font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Rss className="w-4 h-4" />
                  <span>RSS Feeds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSidebarTab("library")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                    sidebarTab === "library"
                      ? "bg-[#5846A8] text-white shadow-xs font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>Social Library</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* MAIN PAGE HOLDER: Channels + Filter Bar + Table ListView     */}
          {/* ============================================================ */}
          <main className="flex-1 bg-white dark:bg-slate-900 flex flex-col min-w-0">
            
            {/* 1. CHANNEL FILTER HEADER (Matching Exact Screenshot) */}
            <div className="px-6 pt-3 pb-0 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900">
              {/* All Posts pill */}
              <button
                type="button"
                onClick={() => setSelectedChannel("all")}
                className={`pb-2.5 text-xs font-bold transition cursor-pointer relative ${
                  selectedChannel === "all"
                    ? "text-[#5846A8] dark:text-purple-400"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>All Channels</span>
                {selectedChannel === "all" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5846A8]" />
                )}
              </button>

              {/* Connected Facebook Page Avatar Tab matching Screenshot */}
              <button
                type="button"
                onClick={() => setSelectedChannel("facebook")}
                className={`pb-2.5 flex items-center gap-2 text-xs font-bold transition cursor-pointer relative ${
                  selectedChannel === "facebook"
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-800 opacity-80"
                }`}
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                  <Image
                    src="/images/brown_monkey_avatar.jpg"
                    alt="Brownmonkeytv devloper"
                    fill
                    className="object-cover"
                    onError={(e: any) => {
                      e.target.src = "/icons/pulse-logo.svg";
                    }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold">
                    f
                  </div>
                </div>
                <span>Brownmonkeytv devloper</span>
                {selectedChannel === "facebook" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f97316]" />
                )}
              </button>

              {/* Connect More Channels Button */}
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(true)}
                className="ml-auto text-xs text-[#5846A8] dark:text-purple-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer pb-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect Channel</span>
              </button>
            </div>

            {/* 2. FILTER & SORT CONTROLS BAR (Matching Screenshot) */}
            <div className="px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-[#fafafc] dark:bg-slate-900/60">
              <div className="flex items-center gap-6 flex-wrap">
                {/* Filter by: Dropdown */}
                <div className="relative flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs italic">Filter by:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFilterMenuOpen(!isFilterMenuOpen);
                    }}
                    className="font-bold text-slate-800 dark:text-slate-200 hover:text-[#5846A8] flex items-center gap-1 cursor-pointer"
                  >
                    <span className="capitalize">{filterByType}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isFilterMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-10 top-7 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-40 animate-in fade-in text-xs font-semibold"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFilterByType("posts");
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${
                          filterByType === "posts" ? "text-[#5846A8] font-bold" : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span>Posts</span>
                        {filterByType === "posts" && <Check className="w-3.5 h-3.5 text-[#5846A8]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterByType("reels");
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${
                          filterByType === "reels" ? "text-[#5846A8] font-bold" : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span>Reels</span>
                        {filterByType === "reels" && <Check className="w-3.5 h-3.5 text-[#5846A8]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterByType("stories");
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${
                          filterByType === "stories" ? "text-[#5846A8] font-bold" : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span>Stories</span>
                        {filterByType === "stories" && <Check className="w-3.5 h-3.5 text-[#5846A8]" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Sort by: Dropdown */}
                <div className="relative flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs italic">Sort by:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSortMenuOpen(!isSortMenuOpen);
                    }}
                    className="font-bold text-slate-800 dark:text-slate-200 hover:text-[#5846A8] flex items-center gap-1 cursor-pointer"
                  >
                    <span className="capitalize">{sortBy}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isSortMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-10 top-7 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-40 animate-in fade-in text-xs font-semibold"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy("date");
                          setIsSortMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${
                          sortBy === "date" ? "text-[#5846A8] font-bold" : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span>Date</span>
                        {sortBy === "date" && <Check className="w-3.5 h-3.5 text-[#5846A8]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy("likes");
                          setIsSortMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${
                          sortBy === "likes" ? "text-[#5846A8] font-bold" : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span>Likes</span>
                        {sortBy === "likes" && <Check className="w-3.5 h-3.5 text-[#5846A8]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy("comments");
                          setIsSortMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${
                          sortBy === "comments" ? "text-[#5846A8] font-bold" : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span>Comments</span>
                        {sortBy === "comments" && <Check className="w-3.5 h-3.5 text-[#5846A8]" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Search box */}
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts..."
                    className="pl-7 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5846A8] w-44"
                  />
                </div>
              </div>

              {/* Right side: Choose Date */}
              <div className="relative flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDateMenuOpen(!isDateMenuOpen);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#5846A8] cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dateFilterLabel}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isDateMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-7 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40 animate-in fade-in text-xs font-semibold"
                  >
                    {[
                      "All Time",
                      "Today",
                      "Yesterday",
                      "Last 7 Days",
                      "Last 15 Days",
                      "Last 30 Days",
                      "This Month",
                      "Specific Date",
                    ].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setDateFilterLabel(d);
                          setIsDateMenuOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. POSTS TABLE VIEW matching Screenshot */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-850/40 select-none">
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={sortedPosts.length > 0 && selectedPostIds.length === sortedPosts.length}
                        onChange={() => handleToggleSelectAll(sortedPosts.map((p) => p.id))}
                        className="rounded border-slate-300 text-[#5846A8] focus:ring-[#5846A8] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4 font-bold w-44">PUBLISHED ON</th>
                    <th className="py-3 px-4 font-bold">POST CONTENT</th>
                    <th className="py-3 px-4 font-bold w-32">
                      <span className="flex items-center gap-1">
                        <span>INTERACTION</span>
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-400 flex items-center justify-center text-[9px] cursor-help"
                          title="The number of times people have liked, commented and shared the page post."
                        >
                          ?
                        </span>
                      </span>
                    </th>
                    <th className="py-3 px-4 font-bold w-36">PUBLISHED BY</th>
                    <th className="py-3 px-4 font-bold text-right w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                        hour12: true,
                      });

                      const mediaItem = post.media?.[0];
                      const isVideo = mediaItem?.mediaType === "video" || mediaItem?.url?.includes("video") || mediaItem?.url?.includes("office") || mediaItem?.url?.includes("chocolate");
                      const interactions = (post.likes || 0) + (post.comments || 0);

                      return (
                        <tr
                          key={post.id}
                          onClick={() => setSelectedPostForDetails(post)}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition group cursor-pointer"
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
                              className="rounded border-slate-300 text-[#5846A8] focus:ring-[#5846A8] cursor-pointer"
                            />
                          </td>

                          {/* Published on */}
                          <td className="py-4 px-4 align-top whitespace-nowrap">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {dateFormatted}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              {timeFormatted}
                            </div>
                          </td>

                          {/* Post Content */}
                          <td className="py-4 px-4 align-top">
                            <div className="flex items-start gap-3">
                              {/* Thumbnail preview */}
                              {mediaItem?.url ? (
                                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={mediaItem.url}
                                    alt="Post thumbnail"
                                    className="w-full h-full object-cover"
                                    onError={(e: any) => {
                                      e.target.src = "/images/pulsesocial_app_icon.png";
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
                                  {renderFormattedCaption(post.content)}
                                </p>

                                {/* Reaction counts pill matching screenshot */}
                                {(post.likes || 0) + (post.comments || 0) > 0 && (
                                  <div className="flex items-center gap-2 pt-0.5">
                                    <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                      <ThumbsUp className="w-3 h-3 text-blue-600 fill-blue-600" />
                                      <span>{post.likes || 0}</span>
                                    </div>
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

                          {/* Interaction */}
                          <td className="py-4 px-4 align-top whitespace-nowrap">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {interactions > 0 ? interactions : "-"}
                            </span>
                          </td>

                          {/* Published By */}
                          <td className="py-4 px-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-2" title="via Facebook">
                              <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shadow-2xs">
                                f
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td
                            className="py-4 px-4 align-top text-right relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-2">
                              {/* Discuss action */}
                              <button
                                type="button"
                                onClick={() => setSelectedPostForDetails(post)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Discuss"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>

                              {/* More options menu */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuPostId(
                                    activeActionMenuPostId === post.id ? null : post.id
                                  );
                                }}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="More options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Dropdown Menu matching exact Zoho screenshot */}
                            {activeActionMenuPostId === post.id && (
                              <div className="absolute right-4 top-10 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 text-left text-xs font-semibold">
                                <button
                                  type="button"
                                  onClick={() => handleClonePost(post)}
                                  className="w-full px-3.5 py-2 hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                                >
                                  <Copy className="w-3.5 h-3.5 text-[#5846A8]" />
                                  <span>Edit as New Post</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuPostId(null);
                                    toast({ title: "Embed Code", message: "HTML iframe embed snippet copied.", type: "info" });
                                  }}
                                  className="w-full px-3.5 py-2 hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Embed this Post</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCopyPostUrl(post)}
                                  className="w-full px-3.5 py-2 hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                                >
                                  <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Copy Post URL</span>
                                </button>

                                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeletePost(post.id);
                                    setActiveActionMenuPostId(null);
                                  }}
                                  className="w-full px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2"
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
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          No posts found in this view
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Click &ldquo;New Post&rdquo; to create and publish content to your channels.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>

      {/* Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => {
          setIsComposerOpen(false);
          setComposerPrefill(null);
        }}
        onSuccess={() => {
          loadPostsAndChannels();
        }}
        initialContent={composerPrefill?.content}
        initialMediaUrl={composerPrefill?.mediaUrl}
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
    </AppLayout>
  );
}
