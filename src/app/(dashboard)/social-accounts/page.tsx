"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";
import {
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  RefreshCw,
  X,
  Loader2,
  AlertCircle,
  Plus,
  Sliders,
  Check,
  Zap,
} from "lucide-react";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";

export interface PlatformDef {
  id: string;
  name: string;
  description: string;
  ctaLabel: string;
  buttonClass: string;
  scopes: { name: string; description: string }[];
  reviewUrl: string;
  accountTypeLabel: string;
}

export const PLATFORMS: PlatformDef[] = [
  {
    id: "youtube",
    name: "YouTube",
    description: "Connect your YouTube channel and manage publishing from PulseSocial.",
    ctaLabel: "Continue with YouTube",
    buttonClass: "bg-[#FF0000] hover:bg-[#E60000] text-white",
    accountTypeLabel: "Channel",
    reviewUrl: "https://myaccount.google.com/permissions",
    scopes: [
      { name: "View channel information", description: "Read channel statistics, subscriber counts, and channel branding" },
      { name: "Publish content", description: "Upload and schedule approved video and Shorts broadcasts" },
      { name: "Read publishing status", description: "Track video upload processing, reach, and performance stats" },
    ],
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Connect your Facebook Pages to publish posts and engage with followers.",
    ctaLabel: "Continue with Facebook",
    buttonClass: "bg-[#1877F2] hover:bg-blue-700 text-white",
    accountTypeLabel: "Business Page",
    reviewUrl: "https://www.facebook.com/settings?tab=business_tools",
    scopes: [
      { name: "Manage pages", description: "View and select authorized Facebook Business Pages" },
      { name: "Publish posts", description: "Publish and schedule posts, photos, and video reels" },
      { name: "Read engagement", description: "Monitor page follower growth, reach, and analytics" },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Connect your Instagram Professional Account for photo, reel, and story scheduling.",
    ctaLabel: "Continue with Instagram",
    buttonClass: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white",
    accountTypeLabel: "Professional Account",
    reviewUrl: "https://www.instagram.com/accounts/manage_access/",
    scopes: [
      { name: "Read profile information", description: "Access Instagram handle, profile picture, and follower counts" },
      { name: "Publish photos and reels", description: "Schedule and auto-publish creative media to your grid" },
      { name: "Manage comments", description: "Moderate direct comments on published posts" },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Connect your LinkedIn profile or Company Page to share professional updates.",
    ctaLabel: "Continue with LinkedIn",
    buttonClass: "bg-[#0A66C2] hover:bg-blue-800 text-white",
    accountTypeLabel: "Profile / Company Page",
    reviewUrl: "https://www.linkedin.com/psettings/permitted-services",
    scopes: [
      { name: "Authenticate identity", description: "Verify your verified professional LinkedIn profile" },
      { name: "Publish member social content", description: "Post articles, updates, and media on your behalf" },
      { name: "Read page analytics", description: "Track impressions and professional audience demographics" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Connect your TikTok account to manage and schedule short-form video publishing.",
    ctaLabel: "Continue with TikTok",
    buttonClass: "bg-black hover:bg-slate-900 text-white",
    accountTypeLabel: "Creator Account",
    reviewUrl: "https://www.tiktok.com/setting",
    scopes: [
      { name: "Read basic info", description: "Access TikTok nickname, avatar, and verified user identifier" },
      { name: "Upload and publish video", description: "Directly publish videos and Shorts to your feed" },
    ],
  },
  {
    id: "x",
    name: "X (Twitter)",
    description: "Connect your X profile to post updates, threads, and monitor mentions.",
    ctaLabel: "Continue with X",
    buttonClass: "bg-black hover:bg-slate-900 text-white",
    accountTypeLabel: "Profile",
    reviewUrl: "https://twitter.com/settings/connected_apps",
    scopes: [
      { name: "Read timeline", description: "Read your published posts and engagement metrics" },
      { name: "Post tweets and threads", description: "Publish rich media, updates, and schedule tweets" },
      { name: "Read account profile", description: "Retrieve follower metrics and profile verification" },
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    description: "Connect your Pinterest account to publish visual pins and manage boards.",
    ctaLabel: "Continue with Pinterest",
    buttonClass: "bg-[#E60023] hover:bg-red-800 text-white",
    accountTypeLabel: "Business Account",
    reviewUrl: "https://www.pinterest.com/settings/apps",
    scopes: [
      { name: "Read boards", description: "View all public and private boards across your workspace" },
      { name: "Publish visual pins", description: "Create rich visual pins with destination URLs" },
      { name: "Track saves & clicks", description: "Monitor pin engagement, reach, and outbound clicks" },
    ],
  },
  {
    id: "google_business",
    name: "Google Business Profile",
    description: "Connect your Google Business listing to publish local posts and updates.",
    ctaLabel: "Continue with Google",
    buttonClass: "bg-[#4285F4] hover:bg-blue-600 text-white",
    accountTypeLabel: "Business Listing",
    reviewUrl: "https://myaccount.google.com/permissions",
    scopes: [
      { name: "Manage local listings", description: "Access store locations, business hours, and addresses" },
      { name: "Publish local updates", description: "Post updates, offers, and announcements to Google Search and Maps" },
    ],
  },
  {
    id: "mastodon",
    name: "Mastodon",
    description: "Connect your federated Mastodon instance to publish to the fediverse.",
    ctaLabel: "Continue with Mastodon",
    buttonClass: "bg-[#6364FF] hover:bg-[#5657E5] text-white",
    accountTypeLabel: "Federated Account",
    reviewUrl: "https://joinmastodon.org",
    scopes: [
      { name: "Read account feeds", description: "Access toots, mentions, and federated notifications" },
      { name: "Publish toots", description: "Publish federated status updates and media" },
    ],
  },
  {
    id: "snapchat",
    name: "Snapchat",
    description: "Connect your Snapchat Public Profile to publish Stories, Spotlight videos, and track views.",
    ctaLabel: "Continue with Snapchat",
    buttonClass: "bg-[#FFFC00] hover:bg-[#F2EE00] text-black font-bold",
    accountTypeLabel: "Public Profile",
    reviewUrl: "https://accounts.snapchat.com/accounts/welcome",
    scopes: [
      { name: "Public profile", description: "Access display name, Bitmoji avatar, and profile handle" },
      { name: "Publish Stories", description: "Schedule and auto-post Spotlight videos and story clips" },
      { name: "Story analytics", description: "Track impressions, screenshot counts, and viewer reach" },
    ],
  },
  {
    id: "threads",
    name: "Threads",
    description: "Connect your Instagram Threads account for conversational microblogging and replies.",
    ctaLabel: "Continue with Threads",
    buttonClass: "bg-black hover:bg-slate-900 text-white font-semibold",
    accountTypeLabel: "Threads Profile",
    reviewUrl: "https://www.threads.net/settings",
    scopes: [
      { name: "Read profile stats", description: "Access Threads username, follower metrics, and profile bio" },
      { name: "Publish content", description: "Post updates, images, and video threads to your feed" },
      { name: "Read replies", description: "Track conversation threads and reader comments" },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Connect your WhatsApp Business Cloud API to send broadcast messages and client updates.",
    ctaLabel: "Continue with WhatsApp",
    buttonClass: "bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold",
    accountTypeLabel: "Business Account",
    reviewUrl: "https://business.facebook.com/wa/manage/",
    scopes: [
      { name: "Broadcast messaging", description: "Send verified announcements and customer updates" },
      { name: "Profile management", description: "Manage verified business profile information and catalogs" },
    ],
  },
  {
    id: "reddit",
    name: "Reddit",
    description: "Connect your Reddit account to share articles and links to subreddits and track karma.",
    ctaLabel: "Continue with Reddit",
    buttonClass: "bg-[#FF4500] hover:bg-[#E03D00] text-white font-semibold",
    accountTypeLabel: "Reddit Profile",
    reviewUrl: "https://www.reddit.com/prefs/apps",
    scopes: [
      { name: "Verify identity", description: "Authenticate your Reddit username and karma score" },
      { name: "Submit community posts", description: "Publish text, links, and media to targeted subreddits" },
      { name: "Track engagement", description: "Monitor upvote ratios, comments, and post performance" },
    ],
  },
  {
    id: "bluesky",
    name: "Bluesky",
    description: "Connect your Bluesky profile to publish posts to the AT Protocol decentralized network.",
    ctaLabel: "Continue with Bluesky",
    buttonClass: "bg-[#1185FE] hover:bg-[#0D70D8] text-white font-semibold",
    accountTypeLabel: "Bluesky Account",
    reviewUrl: "https://bsky.app",
    scopes: [
      { name: "Read feed", description: "Access public posts, profile details, and replies" },
      { name: "Publish updates", description: "Post toots, images, and links to your feed" },
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Connect your Telegram Channel to broadcast announcements, articles, and rich media.",
    ctaLabel: "Continue with Telegram",
    buttonClass: "bg-[#24A1DE] hover:bg-[#208DC3] text-white font-semibold",
    accountTypeLabel: "Broadcast Channel",
    reviewUrl: "https://t.me",
    scopes: [
      { name: "Channel broadcast", description: "Send announcements, formatted text, and media" },
      { name: "Subscriber metrics", description: "Read audience statistics and channel views" },
    ],
  },
];

export interface ConnectedAccountItem {
  id: string;
  provider: string;
  providerAccountId: string;
  displayName: string;
  accountName?: string;
  username: string | null;
  avatarUrl: string | null;
  profileImageUrl: string | null;
  accountType?: string;
  status: string;
  scopes?: string[];
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  lastSyncedAt?: string | null;
}

export default function SocialConnectionsPage() {
  const { toast } = useToast();

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccountItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  // Modals state
  const [permissionModalPlatform, setPermissionModalPlatform] = useState<PlatformDef | null>(null);
  const [permissionModalAccount, setPermissionModalAccount] = useState<ConnectedAccountItem | null>(null);

  const [disconnectModalPlatform, setDisconnectModalPlatform] = useState<PlatformDef | null>(null);
  const [disconnectModalAccount, setDisconnectModalAccount] = useState<ConnectedAccountItem | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Syncing state
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/social/connections");
      if (res.ok) {
        const data = await res.json();
        setConnectedAccounts(data.connections || []);
      } else {
        // Fallback to /api/social/accounts
        const fallbackRes = await fetch("/api/social/accounts");
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setConnectedAccounts(fallbackData.accounts || []);
        }
      }
    } catch {
      toast({
        title: "Connection Sync Error",
        message: "Could not retrieve live social connections.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  // Listen for real OAuth completion from child popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PULSESOCIAL_CHANNEL_CONNECTED") {
        setConnectingPlatform(null);
        toast({
          title: "Account Connected!",
          message: `${event.data.account?.displayName || "Account"} connected successfully.`,
          type: "success",
        });
        loadConnections();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [toast, loadConnections]);

  const [connectModalPlatform, setConnectModalPlatform] = useState<string | null>(null);

  // Initiate real OAuth authorization through authentic Enterprise Modal
  const handleConnect = (platform: PlatformDef) => {
    setConnectModalPlatform(platform.id);
  };

  // Reconnect flow
  const handleReconnect = (platform: PlatformDef) => {
    setConnectModalPlatform(platform.id);
  };

  // Sync / Refresh flow
  const handleRefresh = async (account: ConnectedAccountItem) => {
    setSyncingAccountId(account.id);
    try {
      const res = await fetch(`/api/social/${account.provider}/refresh`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to refresh account");

      toast({
        title: "Account Refreshed",
        message: `${account.displayName} synchronization complete.`,
        type: "success",
      });
      loadConnections();
    } catch (err: unknown) {
      toast({
        title: "Sync Error",
        message: (err as Error).message || "Could not refresh account.",
        type: "error",
      });
    } finally {
      setSyncingAccountId(null);
    }
  };

  // Confirm Disconnect flow
  const handleConfirmDisconnect = async () => {
    if (!disconnectModalAccount || !disconnectModalPlatform) return;
    setIsDisconnecting(true);

    try {
      const res = await fetch(`/api/social/${disconnectModalPlatform.id}/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: disconnectModalAccount.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Disconnect failed");

      toast({
        title: "Account Disconnected",
        message: `${disconnectModalAccount.displayName} has been disconnected.`,
        type: "info",
      });
      setDisconnectModalAccount(null);
      setDisconnectModalPlatform(null);
      loadConnections();
    } catch (err: unknown) {
      toast({
        title: "Disconnect Failed",
        message: (err as Error).message || "Could not disconnect account.",
        type: "error",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatLastSynced = (dateStr?: string | null) => {
    if (!dateStr) return "Just now";
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return "Just now";
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header matching Specification */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Social Connections
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Connect your social accounts securely and manage publishing permissions from one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConnectModalPlatform("youtube")}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect Channel</span>
            </button>

            <button
              type="button"
              onClick={loadConnections}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORMS.map((platform) => {
            const accountsForPlatform = connectedAccounts.filter(
              (acc) => acc.provider.toLowerCase() === platform.id.toLowerCase()
            );
            const isConnected = accountsForPlatform.length > 0;
            const primaryAccount = accountsForPlatform[0];
            const isConnecting = connectingPlatform === platform.id;

            return (
              <div
                key={platform.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* ======================================================== */}
                {/* 1. DISCONNECTED STATE                                    */}
                {/* ======================================================== */}
                {!isConnected ? (
                  <div className="flex flex-col h-full justify-between space-y-5">
                    <div>
                      {/* Top Bar: Platform Icon + Disconnected Badge */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                          {renderPlatformIcon(platform.id, 28)}
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Disconnected
                        </span>
                      </div>

                      {/* Platform Name & Short Description */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {platform.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {platform.description}
                      </p>
                    </div>

                    {/* Primary Button: Continue with [Platform] */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleConnect(platform)}
                        className={`w-full py-2.5 px-4 rounded-xl ${platform.buttonClass} font-semibold text-xs sm:text-sm shadow-xs transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>{platform.ctaLabel}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ======================================================== */
                  /* 2. CONNECTED STATE (DYNAMICALLY RETRIEVED FROM API)      */
                  /* ======================================================== */
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div>
                      {/* Top Bar: Platform Icon + Connected Badge */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                            {renderPlatformIcon(platform.id, 22)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {platform.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {primaryAccount.accountType || platform.accountTypeLabel}
                            </span>
                          </div>
                        </div>

                        {/* Connected Status Badge with Green Dot */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Connected
                        </span>
                      </div>

                      {/* Account Identity Card */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 my-2">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold text-purple-700 shrink-0">
                          {primaryAccount.avatarUrl || primaryAccount.profileImageUrl ? (
                            <img
                              src={primaryAccount.avatarUrl || primaryAccount.profileImageUrl || ""}
                              alt={primaryAccount.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            primaryAccount.displayName.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {primaryAccount.displayName}
                          </h4>
                          {primaryAccount.username && (
                            <p className="text-xs text-slate-500 truncate">
                              @{primaryAccount.username}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Last Synced Indicator */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                        <Clock className="w-3 h-3" />
                        <span>Last synced: {formatLastSynced(primaryAccount.lastSyncedAt)}</span>
                      </div>
                    </div>

                    {/* Actions: Manage Permissions, Reconnect, Disconnect */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPermissionModalPlatform(platform);
                            setPermissionModalAccount(primaryAccount);
                          }}
                          className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Permissions</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReconnect(platform)}
                          className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reconnect</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleRefresh(primaryAccount)}
                          disabled={syncingAccountId === primaryAccount.id}
                          className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncingAccountId === primaryAccount.id ? "animate-spin" : ""}`} />
                          <span>Sync Data</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDisconnectModalPlatform(platform);
                            setDisconnectModalAccount(primaryAccount);
                          }}
                          className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* PERMISSION MANAGEMENT MODAL (SPEC 13)                     */}
        {/* ======================================================== */}
        {permissionModalPlatform && permissionModalAccount && (
          <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                    {renderPlatformIcon(permissionModalPlatform.id, 28)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {permissionModalPlatform.name} Permissions
                    </h3>
                    <p className="text-xs text-slate-500">
                      {permissionModalAccount.displayName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPermissionModalPlatform(null);
                    setPermissionModalAccount(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Granted Scopes Checklist */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  PulseSocial currently has permission to:
                </p>

                <div className="space-y-2">
                  {permissionModalPlatform.scopes.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          ✓ {s.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {s.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Review on Platform Link */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={permissionModalPlatform.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                >
                  <span>Review on {permissionModalPlatform.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setPermissionModalPlatform(null);
                    setPermissionModalAccount(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DISCONNECT CONFIRMATION MODAL (SPEC 14)                   */}
        {/* ======================================================== */}
        {disconnectModalPlatform && disconnectModalAccount && (
          <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Disconnect {disconnectModalPlatform.name}?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Disconnecting this account will stop PulseSocial from accessing this social account and may disable publishing features for it.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setDisconnectModalAccount(null);
                    setDisconnectModalPlatform(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDisconnect}
                  disabled={isDisconnecting}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Disconnecting…</span>
                    </>
                  ) : (
                    <span>Disconnect</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real Enterprise Multi-Platform Connect Modal */}
        <UniversalSocialConnectModal
          isOpen={!!connectModalPlatform}
          defaultChannelId={connectModalPlatform || undefined}
          onClose={() => setConnectModalPlatform(null)}
          onAccountConnected={() => {
            loadConnections();
            setConnectModalPlatform(null);
          }}
        />

      </div>
    </AppLayout>
  );
}
