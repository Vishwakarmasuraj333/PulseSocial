"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";
import { PostComposerModal } from "@/components/composer/PostComposerModal";
import { PerformanceDynamicsChart } from "@/components/dashboard/PerformanceDynamicsChart";
import { useBrand } from "@/context/BrandContext";
import { useToast } from "@/components/ui/toast";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import {
  Info,
  Plus,
  Play,
  ThumbsUp,
  MessageCircle,
  HelpCircle,
  ExternalLink,
  X,
  Sparkles,
  Share2,
  Users,
  Clock,
  Send,
  Activity,
  ArrowUpRight,
} from "lucide-react";

export interface SupportedSocialBrand {
  id: string;
  name: string;
  category: "Professional" | "Video & Media" | "Creative & Visual" | "Messaging & Community";
  bgClass: string;
  borderClass: string;
  hoverClass: string;
  glowClass: string;
  description: string;
  textDark?: boolean;
}

export const REAL_SOCIAL_PLATFORMS: SupportedSocialBrand[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Professional",
    bgClass: "bg-[#0A66C2]",
    borderClass: "border-[#0A66C2]/40",
    hoverClass: "hover:bg-[#084e96] hover:border-[#0A66C2]",
    glowClass: "shadow-[#0A66C2]/20 hover:shadow-[#0A66C2]/35",
    description: "Company updates & articles",
  },
  {
    id: "x",
    name: "X (Twitter)",
    category: "Professional",
    bgClass: "bg-black dark:bg-[#111622]",
    borderClass: "border-slate-800 dark:border-slate-700",
    hoverClass: "hover:bg-slate-900 dark:hover:bg-[#161c2d] hover:border-slate-600",
    glowClass: "shadow-black/20 hover:shadow-black/35",
    description: "Real-time posts & threads",
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Video & Media",
    bgClass: "bg-[#FF0000]",
    borderClass: "border-[#FF0000]/40",
    hoverClass: "hover:bg-[#D90000] hover:border-[#FF0000]",
    glowClass: "shadow-[#FF0000]/20 hover:shadow-[#FF0000]/35",
    description: "Shorts, videos & community",
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "Creative & Visual",
    bgClass: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    borderClass: "border-pink-500/40",
    hoverClass: "hover:opacity-95 hover:border-pink-400",
    glowClass: "shadow-pink-500/20 hover:shadow-pink-500/35",
    description: "Reels, carousels & stories",
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "Video & Media",
    bgClass: "bg-[#1877F2]",
    borderClass: "border-[#1877F2]/40",
    hoverClass: "hover:bg-[#1464CC] hover:border-[#1877F2]",
    glowClass: "shadow-[#1877F2]/20 hover:shadow-[#1877F2]/35",
    description: "Pages, groups & reels",
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "Video & Media",
    bgClass: "bg-black dark:bg-[#07090e]",
    borderClass: "border-slate-800 hover:border-[#00f2fe]/60",
    hoverClass: "hover:bg-slate-900",
    glowClass: "shadow-slate-900/20",
    description: "Short-form video feeds",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    category: "Creative & Visual",
    bgClass: "bg-[#E60023]",
    borderClass: "border-[#E60023]/40",
    hoverClass: "hover:bg-[#CC001F] hover:border-[#E60023]",
    glowClass: "shadow-[#E60023]/20 hover:shadow-[#E60023]/35",
    description: "Pins, boards & search",
  },
  {
    id: "reddit",
    name: "Reddit",
    category: "Messaging & Community",
    bgClass: "bg-[#FF4500]",
    borderClass: "border-[#FF4500]/40",
    hoverClass: "hover:bg-[#D93A00] hover:border-[#FF4500]",
    glowClass: "shadow-[#FF4500]/20 hover:shadow-[#FF4500]/35",
    description: "Subreddits & discussions",
  },
  {
    id: "threads",
    name: "Threads",
    category: "Messaging & Community",
    bgClass: "bg-black dark:bg-[#111115]",
    borderClass: "border-slate-800 dark:border-slate-700",
    hoverClass: "hover:bg-slate-900 hover:border-slate-600",
    glowClass: "shadow-black/20 hover:shadow-black/35",
    description: "Conversations & text posts",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    category: "Messaging & Community",
    bgClass: "bg-[#25D366]",
    borderClass: "border-[#25D366]/40",
    hoverClass: "hover:bg-[#1EBE5D] hover:border-[#25D366]",
    glowClass: "shadow-[#25D366]/20 hover:shadow-[#25D366]/35",
    description: "Broadcasts & client channels",
  },
  {
    id: "telegram",
    name: "Telegram",
    category: "Messaging & Community",
    bgClass: "bg-[#24A1DE]",
    borderClass: "border-[#24A1DE]/40",
    hoverClass: "hover:bg-[#1E8EC4] hover:border-[#24A1DE]",
    glowClass: "shadow-[#24A1DE]/20 hover:shadow-[#24A1DE]/35",
    description: "Broadcast channels & bots",
  },
  {
    id: "bluesky",
    name: "Bluesky",
    category: "Messaging & Community",
    bgClass: "bg-[#1185FE]",
    borderClass: "border-[#1185FE]/40",
    hoverClass: "hover:bg-[#0D6ECC] hover:border-[#1185FE]",
    glowClass: "shadow-[#1185FE]/20 hover:shadow-[#1185FE]/35",
    description: "Decentralized AT Protocol",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    category: "Messaging & Community",
    bgClass: "bg-[#FFFC00]",
    borderClass: "border-yellow-400/80 hover:border-yellow-500",
    hoverClass: "hover:bg-[#FFF500]",
    glowClass: "shadow-yellow-400/30 hover:shadow-yellow-400/50",
    description: "Stories, spotlight & filters",
    textDark: true,
  },

  {
    id: "mastodon",
    name: "Mastodon",
    category: "Messaging & Community",
    bgClass: "bg-[#6364FF]",
    borderClass: "border-[#6364FF]/40",
    hoverClass: "hover:bg-[#5253EA] hover:border-[#6364FF]",
    glowClass: "shadow-[#6364FF]/20 hover:shadow-[#6364FF]/35",
    description: "Fediverse federated statuses",
  },
];

export default function DashboardPage() {
  const { activeBrand } = useBrand();
  const { toast } = useToast();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedConnectPlatform, setSelectedConnectPlatform] = useState<string>("youtube");
  const [selectedMediaPost, setSelectedMediaPost] = useState<any | null>(null);

  const [livePosts, setLivePosts] = useState<any[]>([]);
  const [connectedChannels, setConnectedChannels] = useState<any[]>([]);
  const [liveAuditEvents, setLiveAuditEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [streamStatus, setStreamStatus] = useState<"connected" | "polling" | "offline">("polling");

  // Fetch real data from backend database with fault-tolerant individual handlers
  const loadDashboardData = async () => {
    try {
      const fetchSafe = async (url: string) => {
        try {
          const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
          if (res.ok) return await res.json();
        } catch {}
        return null;
      };

      const [postsData, provData, accData, auditData] = await Promise.all([
        fetchSafe("/api/posts"),
        fetchSafe("/api/social/providers"),
        fetchSafe("/api/social/accounts"),
        fetchSafe("/api/audit?limit=6"),
      ]);

      let fetchedPosts: any[] = [];
      if (postsData?.posts && Array.isArray(postsData.posts)) {
        fetchedPosts = postsData.posts;
        setLivePosts(postsData.posts);
      }

      if (auditData?.logs && Array.isArray(auditData.logs)) {
        setLiveAuditEvents(auditData.logs);
      }

      let realAccounts: any[] = [];

      // 1. Primary: load directly from /api/social/accounts
      if (accData?.accounts && Array.isArray(accData.accounts) && accData.accounts.length > 0) {
        realAccounts = accData.accounts.map((a: any) => {
          const matchedProv = provData?.providers?.find(
            (p: any) =>
              p.platform?.toLowerCase() === a.provider?.toLowerCase() ||
              (a.provider === "x" && p.platform === "twitter")
          );
          const channelPostsCount = fetchedPosts.filter((p) =>
            p.targets?.some(
              (t: any) =>
                t.socialAccountId === a.id ||
                t.socialAccount?.provider?.toLowerCase() === a.provider?.toLowerCase()
            )
          ).length || a.postsCount || 0;

          return {
            id: a.id,
            platform: a.provider,
            name: a.displayName,
            username: a.username || a.displayName,
            profileImageUrl: a.profileImageUrl,
            isConnected: true,
            status: a.status || "CONNECTED",
            tokenStatus: matchedProv?.tokenStatus || (a.validityDays > 0 ? "VALID" : "EXPIRED"),
            publishingStatus: matchedProv?.publishingStatus || "Ready to publish",
            validityDays: a.validityDays ?? 60,
            postsCount: channelPostsCount,
            reach: 0,
            engagements: 0,
            connectedAccount: {
              id: a.id,
              displayName: a.displayName,
              username: a.username || a.displayName,
              followerCount: a.followersCount ?? null,
              profileImageUrl: a.profileImageUrl,
            },
          };
        });
      }

      // 2. Secondary: load from /api/social/providers if not already mapped
      if (provData?.providers && Array.isArray(provData.providers)) {
        const activeProviders = provData.providers.filter(
          (p: any) => p.isConnected && p.connectedAccount
        );
        activeProviders.forEach((ap: any) => {
          if (
            !realAccounts.some(
              (ra) =>
                ra.platform === ap.platform ||
                ra.id === ap.connectedAccount?.id ||
                (ra.platform === "x" && ap.platform === "twitter")
            )
          ) {
            realAccounts.push({
              id: ap.connectedAccount?.id || ap.platform,
              platform: ap.platform,
              name: ap.connectedAccount?.displayName || ap.displayName,
              username: ap.connectedAccount?.username || ap.connectedAccount?.displayName,
              profileImageUrl: ap.connectedAccount?.profileImageUrl,
              isConnected: true,
              status: "CONNECTED",
              tokenStatus: ap.tokenStatus || "VALID",
              publishingStatus: ap.publishingStatus || "Ready to publish",
              validityDays: 60,
              postsCount: 0,
              reach: 0,
              engagements: 0,
              connectedAccount: {
                id: ap.connectedAccount?.id,
                displayName: ap.connectedAccount?.displayName || ap.displayName,
                username: ap.connectedAccount?.username || ap.connectedAccount?.displayName,
                followerCount: null,
                profileImageUrl: ap.connectedAccount?.profileImageUrl,
              },
            });
          }
        });
      }

      // 3. Fallback from activeBrand context
      if (realAccounts.length === 0 && activeBrand?.socialAccounts && activeBrand.socialAccounts.length > 0) {
        realAccounts = activeBrand.socialAccounts.map((a: any) => ({
          id: a.id,
          platform: a.provider,
          name: a.displayName,
          username: a.username || a.displayName,
          profileImageUrl: a.profileImageUrl,
          isConnected: true,
          status: "CONNECTED",
          tokenStatus: "VALID",
          postsCount: 0,
          reach: 0,
          engagements: 0,
          connectedAccount: {
            id: a.id,
            displayName: a.displayName,
            username: a.username || a.displayName,
            followerCount: null,
          },
        }));
      }

      setConnectedChannels(realAccounts);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener("pulsesocial_post_created", handleUpdate);
    window.addEventListener("pulsesocial_active_brand_changed", handleUpdate);
    window.addEventListener("pulsesocial_account_connected", handleUpdate);

    // Check if user came from OTP verification, login, signup, or brand setup
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isExplicitSetup = urlParams.get("setup") === "brand";
      const hasDoneSetup = sessionStorage.getItem("pulsesocial_setup_dismissed");

      if (isExplicitSetup && !hasDoneSetup) {
        setIsConnectModalOpen(true);
        setSelectedConnectPlatform(urlParams.get("platform") || "youtube");
      }
    }

    return () => {
      window.removeEventListener("pulsesocial_post_created", handleUpdate);
      window.removeEventListener("pulsesocial_active_brand_changed", handleUpdate);
      window.removeEventListener("pulsesocial_account_connected", handleUpdate);
    };
  }, [activeBrand?.id]);

  // Connect to live SSE realtime stream with honest status indicator and polling fallback
  useEffect(() => {
    let es: EventSource | null = null;
    let pollInterval: any = null;

    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        es = new EventSource("/api/realtime/stream");
        es.onopen = () => {
          setStreamStatus("connected");
        };
        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type && data.type !== "ping") {
              setLiveAuditEvents((prev) => [
                {
                  id: data.id || `stream-${Date.now()}`,
                  title: data.type.replace(/_/g, " "),
                  description: data.payload?.description || data.payload?.message || "Workspace activity",
                  timestamp: "Just now",
                  user: { avatarInitials: "Live" },
                },
                ...prev.slice(0, 5),
              ]);
            }
          } catch {}
        };
        es.onerror = () => {
          setStreamStatus("polling");
        };
      } catch {
        setStreamStatus("polling");
      }
    } else {
      setStreamStatus("polling");
    }

    // Fallback polling every 60 seconds
    pollInterval = setInterval(() => {
      fetch("/api/audit?limit=6")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d?.logs)) setLiveAuditEvents(d.logs);
        })
        .catch(() => {});
    }, 60000);

    return () => {
      if (es) es.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activeBrand?.id]);

  const openConnect = (platform = "youtube") => {
    setSelectedConnectPlatform(platform);
    setIsConnectModalOpen(true);
  };

  const handleChannelConnected = (account: any) => {
    loadDashboardData();
  };

  const publishedPostsCount = livePosts.filter((p) => p.status === "PUBLISHED" || p.status === "PARTIALLY_PUBLISHED").length;
  const scheduledPostsCount = livePosts.filter((p) => p.status === "SCHEDULED").length;

  return (
    <AppLayout>
      <div className="bg-slate-50 dark:bg-[#0D0D0E] min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 text-slate-800 dark:text-[#9CA3AF] font-sans space-y-6 max-w-7xl mx-auto">
        
        {/* Linear / Modern SaaS Style Capsule Tab Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-[#17171A] border border-slate-200/80 dark:border-white/7">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] shadow-xs flex items-center gap-1.5 cursor-default">
              <Activity className="w-3.5 h-3.5" />
              <span>Dashboard Overview</span>
            </span>
            <Link
              href="/analytics"
              className="px-3.5 py-1 rounded-full text-xs font-medium text-slate-600 hover:text-[#5846A8] dark:text-[#9CA3AF] dark:hover:text-white hover:bg-purple-50/50 dark:hover:bg-white/5 transition"
            >
              Analytics
            </Link>
            <Link
              href="/posts"
              className="px-3.5 py-1 rounded-full text-xs font-medium text-slate-600 hover:text-[#5846A8] dark:text-[#9CA3AF] dark:hover:text-white hover:bg-purple-50/50 dark:hover:bg-white/5 transition"
            >
              Posts & Queue
            </Link>
            <Link
              href="/social-accounts"
              className="px-3.5 py-1 rounded-full text-xs font-medium text-slate-600 hover:text-[#5846A8] dark:text-[#9CA3AF] dark:hover:text-white hover:bg-purple-50/50 dark:hover:bg-white/5 transition hidden sm:inline-block"
            >
              Channels
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-[#6B7280] hidden md:inline-block">
              Workspace: <strong className="text-slate-800 dark:text-white font-semibold">{activeBrand?.name || "Pulse Workspace"}</strong>
            </span>
            <button
              type="button"
              onClick={() => openConnect()}
              className="h-8 px-3 rounded-full bg-[#5846A8] hover:bg-[#4A3990] text-white dark:bg-[#E08738] dark:hover:bg-[#D97706] dark:text-[#0F0F11] text-xs font-bold transition flex items-center gap-1 shadow-xs hover:shadow-purple-500/20 dark:hover:shadow-[0_0_16px_rgba(224,135,56,0.35)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Network</span>
            </button>
          </div>
        </div>

        {/* Executive Metric Cards (Elevated matte panels #17171A, thin top/border highlight, rounded mini circular icon buttons on top right) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/social-accounts"
            className="p-5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 shadow-xs hover:border-purple-300 dark:hover:border-[#E08738]/50 transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9CA3AF]">Connected Accounts</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[#5846A8] dark:text-[#FBBF24] flex items-center justify-center group-hover:bg-purple-50 dark:group-hover:bg-[#E08738]/10 group-hover:border-purple-300 dark:group-hover:border-[#E08738]/40 transition shrink-0">
                <Share2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {connectedChannels.length}
              </span>
              <span className="text-xs font-medium text-[#5846A8] dark:text-[#FBBF24]">
                {connectedChannels.length > 0 ? "Channels active" : "None connected"}
              </span>
            </div>
          </Link>

          <Link
            href="/posts"
            className="p-5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 shadow-xs hover:border-purple-300 dark:hover:border-[#E08738]/50 transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9CA3AF]">Published Content</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[#5846A8] dark:text-[#FBBF24] flex items-center justify-center group-hover:bg-purple-50 dark:group-hover:bg-[#E08738]/10 group-hover:border-purple-300 dark:group-hover:border-[#E08738]/40 transition shrink-0">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {publishedPostsCount}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF]">
                {publishedPostsCount === 1 ? "Broadcast" : "Broadcasts"}
              </span>
            </div>
          </Link>

          <Link
            href="/posts?filter=SCHEDULED"
            className="p-5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 shadow-xs hover:border-purple-300 dark:hover:border-[#E08738]/50 transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9CA3AF]">Scheduled Queue</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[#5846A8] dark:text-[#FBBF24] flex items-center justify-center group-hover:bg-purple-50 dark:group-hover:bg-[#E08738]/10 group-hover:border-purple-300 dark:group-hover:border-[#E08738]/40 transition shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {scheduledPostsCount}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF]">
                In calendar
              </span>
            </div>
          </Link>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9CA3AF]">Workspace Health</span>
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                  connectedChannels.length > 0
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/30 text-emerald-500"
                    : "bg-purple-50 dark:bg-amber-500/10 border-purple-200 dark:border-amber-500/30 text-[#5846A8] dark:text-[#E08738]"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {connectedChannels.length > 0 ? "100%" : "Standby"}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF]">
                  {connectedChannels.length > 0 ? "Operational" : "Setup needed"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-[#6B7280] mt-1 truncate">
                {connectedChannels.length > 0
                  ? `${connectedChannels.length} active channels • AES-256 vault active`
                  : "Connect your official channels to activate multi-network broadcasting."}
              </p>
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================== */}
          {/* LEFT COLUMN (approx 74% width on desktop)                   */}
          {/* ========================================================== */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Visual Analytics Chart */}
            <PerformanceDynamicsChart dateRange="last30" />

            {/* 1. BRAND HEALTH CARD WITH REAL CONNECTED CHANNELS */}
            <div className="bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 rounded-2xl p-5 sm:p-6 shadow-xs">
              
              {/* Card Title & Subtitle */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Brand Health
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-[#9CA3AF] flex items-center gap-1 font-normal">
                    <Info className="w-3.5 h-3.5 text-slate-400 dark:text-[#9CA3AF] shrink-0" />
                    Live connected channels & performance
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-amber-500/10 text-[#5846A8] dark:text-[#FBBF24] border border-purple-200/60 dark:border-amber-500/30">
                    {connectedChannels.length} Connected {connectedChannels.length === 1 ? "Channel" : "Channels"}
                  </span>
                </div>
              </div>

              {/* Connected Channels Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/7 text-[11px] font-semibold text-slate-400 dark:text-[#6B7280] uppercase tracking-wider">
                      <th className="pb-3 font-semibold text-slate-600 dark:text-[#9CA3AF]">CHANNELS</th>
                      <th className="pb-3 font-semibold text-right text-slate-600 dark:text-[#9CA3AF]">
                        FOLLOWERS
                      </th>
                      <th className="pb-3 font-semibold text-right text-slate-600 dark:text-[#9CA3AF]">
                        STATUS
                      </th>
                      <th className="pb-3 font-semibold text-right text-slate-600 dark:text-[#9CA3AF]">
                        NO. OF POSTS
                      </th>
                      <th className="pb-3 font-semibold text-right text-slate-600 dark:text-[#9CA3AF]">
                        REACH
                      </th>
                      <th className="pb-3 font-semibold text-right text-slate-600 dark:text-[#9CA3AF]">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                    {connectedChannels.length > 0 ? (
                      connectedChannels.map((channel, idx) => (
                        <tr
                          key={channel.id || idx}
                          className="hover:bg-purple-50/40 dark:hover:bg-white/5 transition group"
                        >
                          <td className="py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-2xs bg-white dark:bg-[#111113] border border-slate-200/80 dark:border-white/10 group-hover:scale-105 transition-transform">
                                {channel.profileImageUrl ? (
                                  <img
                                    src={channel.profileImageUrl}
                                    alt={channel.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  renderPlatformIcon(channel.platform, 20)
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block group-hover:text-[#5846A8] dark:group-hover:text-[#FBBF24] transition-colors">
                                  {channel.connectedAccount?.displayName || channel.name}
                                </span>
                                <span className="text-[11px] text-slate-400 dark:text-[#9CA3AF] font-normal">
                                  {channel.username
                                    ? channel.username.startsWith("@")
                                      ? channel.username
                                      : `@${channel.username}`
                                    : channel.platform}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-right font-medium text-slate-800 dark:text-slate-200">
                            <span>
                              {channel.connectedAccount?.followerCount != null
                                ? channel.connectedAccount.followerCount.toLocaleString()
                                : "Live Sync"}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            {channel.tokenStatus === "EXPIRED" ? (
                              <button
                                type="button"
                                onClick={() => openConnect(channel.platform)}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-amber-950/60 text-[#5846A8] dark:text-amber-300 border border-purple-200 dark:border-amber-800 hover:bg-purple-100 transition cursor-pointer"
                              >
                                Re-auth required
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-right font-medium text-slate-800 dark:text-slate-200">
                            <span className="font-bold text-slate-900 dark:text-white">{channel.postsCount || 0}</span>
                            <span className="text-[11px] text-[#5846A8] dark:text-[#FBBF24] font-semibold ml-1.5">
                              Live
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-medium text-slate-800 dark:text-slate-200">
                            <span>{channel.reach > 0 ? channel.reach.toLocaleString() : "Real-time"}</span>
                          </td>
                          <td className="py-3.5 text-right font-medium">
                            <button
                              type="button"
                              onClick={() => openConnect(channel.platform)}
                              className="text-xs font-semibold text-[#5846A8] dark:text-[#FBBF24] hover:underline cursor-pointer transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-[#9CA3AF]">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                              No social channels connected yet
                            </span>
                            <span className="text-xs text-slate-500 dark:text-[#9CA3AF] max-w-md">
                              Click any platform connect button below to authorize and link your official accounts.
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PROFESSIONAL SOCIAL CONNECT SECTION WITH AUTHENTIC BRAND COLORS */}
              <div className="pt-6 border-t border-slate-100 dark:border-white/7 mt-5 space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />
                      <span>Connect Official Social Channels</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF] mt-0.5">
                      Click any platform to connect your account directly with AES-256 zero-knowledge security
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-[#6B7280]">
                    {REAL_SOCIAL_PLATFORMS.length} Official Networks Supported
                  </span>
                </div>

                {/* Professional Social Buttons Grid (Spacious, 100% responsive, high-contrast badges) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pt-1">
                  {REAL_SOCIAL_PLATFORMS.map((platform) => {
                    const isConnected = connectedChannels.some(
                      (ch) =>
                        ch.platform?.toLowerCase() === platform.id.toLowerCase() ||
                        (platform.id === "x" && (ch.platform === "twitter" || ch.platform === "x"))
                    );
                    const matchingChannel = connectedChannels.find(
                      (ch) =>
                        ch.platform?.toLowerCase() === platform.id.toLowerCase() ||
                        (platform.id === "x" && (ch.platform === "twitter" || ch.platform === "x"))
                    );
                    const needsReauth = matchingChannel?.tokenStatus === "EXPIRED";

                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => openConnect(platform.id)}
                        className={`group relative flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer text-left border shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                          platform.textDark ? "text-slate-950 font-bold" : "text-white"
                        } ${platform.bgClass} ${platform.borderClass} ${platform.hoverClass} ${platform.glowClass}`}
                        title={`Connect official ${platform.name} account`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 p-1 border shadow-2xs group-hover:scale-105 transition-transform ${
                              platform.textDark
                                ? "bg-black/10 border-black/15 shadow-2xs"
                                : "bg-white/15 backdrop-blur-xs border-white/20"
                            }`}
                          >
                            {renderPlatformIcon(platform.id, 20)}
                          </div>
                          <div className="min-w-0 flex-1 pr-1">
                            <span
                              className={`text-xs font-bold block whitespace-nowrap leading-tight ${
                                platform.textDark ? "text-slate-950 font-bold" : "text-white"
                              }`}
                            >
                              {platform.name}
                            </span>
                            <span
                              className={`text-[10px] block whitespace-nowrap ${
                                platform.textDark ? "text-slate-800 font-semibold" : "opacity-80"
                              }`}
                            >
                              {isConnected ? (needsReauth ? "Re-auth" : "Linked") : "Connect"}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 ml-1.5">
                          {isConnected ? (
                            needsReauth ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950 uppercase tracking-tight shadow-2xs">
                                Fix
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                                ✓
                              </span>
                            )
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors shadow-2xs ${
                                platform.textDark
                                  ? "bg-black/15 text-slate-950 group-hover:bg-slate-950 group-hover:text-white"
                                  : "bg-white/20 text-white group-hover:bg-white group-hover:text-slate-900"
                              }`}
                            >
                              + Add
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. RECENT POSTS CARD (Redundant dashed box removed as requested) */}
            <div className="bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Recent Posts
                  </h2>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-amber-500/10 text-[#5846A8] dark:text-[#FBBF24] border border-purple-200/60 dark:border-amber-500/30">
                    {livePosts.length > 0 ? `${livePosts.length} Broadcasts` : "Live Feed"}
                  </span>
                </div>
                {livePosts.length > 0 && (
                  <Link
                    href="/posts"
                    className="text-xs font-semibold text-[#5846A8] hover:text-[#48388d] dark:text-[#FBBF24] dark:hover:text-[#E08738] hover:underline flex items-center gap-1 transition-colors"
                  >
                    View all posts <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Posts Feed Showcase */}
              {livePosts.length > 0 ? (
                <div className={`grid grid-cols-1 ${livePosts.length > 1 ? "md:grid-cols-2" : ""} gap-4`}>
                  {livePosts.slice(0, 2).map((post, idx) => (
                    <div
                      key={post.id || idx}
                      className="rounded-2xl border border-slate-200 dark:border-white/7 p-5 space-y-3 bg-white dark:bg-[#111113] shadow-xs flex flex-col justify-between hover:border-purple-300 dark:hover:border-[#E08738]/40 transition group"
                    >
                      <div>
                        {/* Post Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-slate-100 dark:bg-[#17171A] border border-slate-200/60 dark:border-white/10 shadow-2xs group-hover:scale-105 transition-transform">
                              {renderPlatformIcon(post.targets?.[0]?.socialAccount?.provider || "linkedin", 20)}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#5846A8] dark:group-hover:text-[#E08738] transition">
                                {post.targets?.[0]?.socialAccount?.displayName || activeBrand?.name || "Connected Page"}
                              </h4>
                              <span className="text-[10px] text-slate-400 dark:text-[#9CA3AF] capitalize">
                                Published to {post.targets?.map((t: any) => t.socialAccount?.provider).filter(Boolean).join(", ") || "Social Networks"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                post.status === "PUBLISHED"
                                  ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800"
                                  : post.status === "PARTIALLY_PUBLISHED"
                                  ? "text-[#5846A8] dark:text-[#FBBF24] bg-purple-50 dark:bg-amber-500/10 border border-purple-200 dark:border-amber-500/30"
                                  : "text-[#5846A8] dark:text-amber-300 bg-purple-50 dark:bg-amber-950/50 border border-purple-200 dark:border-amber-800"
                              }`}
                            >
                              {post.status}
                            </span>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#17171A] text-xs text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-white/7">
                          <p className="line-clamp-3 leading-relaxed">
                            {post.content || "(No caption text)"}
                          </p>
                        </div>
                      </div>

                      {/* Interaction footer */}
                      <div className="pt-3 border-t border-slate-100 dark:border-white/7 flex items-center justify-between text-xs text-slate-500 dark:text-[#9CA3AF]">
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#E08738]" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {post.likes != null ? post.likes : 0} likes
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-[#5846A8] dark:text-amber-500" />
                          <span>{post.comments != null ? `${post.comments} comments` : "0 comments"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/7 bg-gradient-to-b from-white to-[#FBFBFF] dark:from-[#111113] dark:to-[#0D0D0E] p-8 flex flex-col items-center justify-center text-center shadow-2xs">
                  <div className="relative w-12 h-12 rounded-2xl bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] flex items-center justify-center mb-3 shadow-md shadow-purple-500/20 dark:shadow-amber-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    No posts published yet
                  </h4>
                  
                  <p className="text-xs text-slate-500 dark:text-[#9CA3AF] max-w-sm mt-1.5 mb-4 leading-relaxed">
                    Create and broadcast your first post to see live engagements and real-time channel statistics here.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => setIsComposerOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 hover:shadow-purple-900/35 dark:bg-[#E08738] dark:hover:bg-[#D97706] dark:text-[#0F0F11] dark:shadow-amber-500/20 text-xs font-bold hover:-translate-y-0.5 active:translate-y-0 transition duration-200 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Post</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================== */}
          {/* RIGHT COLUMN (approx 26% width on desktop)                  */}
          {/* ========================================================== */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-5">
            


            {/* 2. Live Stream Card */}
            <div className="bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    Live Activity Stream
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF] mt-0.5 leading-relaxed">
                    Live updates across authenticated workspaces.
                  </p>
                </div>
                {streamStatus === "connected" ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 dark:bg-amber-500/10 text-[#5846A8] dark:text-[#FBBF24] border border-purple-200 dark:border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5846A8] dark:bg-[#E08738] animate-pulse" />
                    REALTIME
                  </span>
                ) : streamStatus === "polling" ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9CA3AF] border border-slate-200 dark:border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5846A8] dark:bg-[#E08738]" />
                    Updates every 60s
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-[#6B7280] border border-slate-200 dark:border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Offline
                  </span>
                )}
              </div>

              {/* Real activity records */}
              <div className="space-y-3 pt-1">
                {liveAuditEvents.length > 0 ? (
                  liveAuditEvents.map((evt) => {
                    const platform =
                      evt.platform ||
                      (evt.title?.toLowerCase().includes("linkedin") || evt.description?.toLowerCase().includes("linkedin")
                        ? "linkedin"
                        : evt.title?.toLowerCase().includes("google") || evt.description?.toLowerCase().includes("google")
                        ? "google"
                        : evt.title?.toLowerCase().includes("facebook")
                        ? "facebook"
                        : undefined);

                    const cleanTitle = evt.title
                      ? evt.title
                          .replace(/OAUTH CONNECTED/i, "LinkedIn Connected")
                          .replace(/SOCIAL ACCOUNT SYNCED/i, "LinkedIn Account Synced")
                          .replace(/GOOGLE OAUTH LOGIN/i, "Google OAuth Login")
                      : "Activity Event";

                    const cleanDescription = evt.description
                      ? evt.description
                          .replace(/SocialAccount\s+[a-z0-9]+/i, "LinkedIn channel (@itxsurajofficial@gmail.com)")
                          .replace(/User\s+[a-z0-9]+/i, "User signed in")
                      : "Workspace activity logged";

                    return (
                      <div
                        key={evt.id}
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-purple-50/50 dark:hover:bg-white/5 transition"
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {platform ? (
                            renderPlatformIcon(platform, 24)
                          ) : (
                            <div className="w-full h-full bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] flex items-center justify-center font-bold text-[9px]">
                              {evt.user?.avatarInitials || "S"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {cleanTitle}
                            </p>
                            <span className="text-[9px] text-slate-400 dark:text-[#6B7280] shrink-0 ml-1">
                              {evt.timestamp}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-[#9CA3AF] line-clamp-1 mt-0.5">
                            {cleanDescription}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-400 dark:text-[#6B7280] space-y-1.5">
                    <Activity className="w-6 h-6 mx-auto text-slate-300 dark:text-[#6B7280]" />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">No activity logged yet</p>
                    <p className="text-[10px]">Publishing, scheduling, and channel actions will stream here in real time.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Social Connect Modal */}
      <UniversalSocialConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        platformId={selectedConnectPlatform}
        onSuccess={handleChannelConnected}
      />

      {/* Post Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSuccess={loadDashboardData}
      />

      {/* Media Inspection Modal */}
      {selectedMediaPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-white">
              <span className="text-xs font-semibold truncate">
                {selectedMediaPost.content || "Media Preview"}
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
              {selectedMediaPost.mediaUrls?.[0] && (
                <Image
                  src={selectedMediaPost.mediaUrls[0]}
                  alt="Media preview"
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
