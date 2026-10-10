"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";
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
  ArrowLeft,
  Search,
  Users,
  Bell,
  Folder,
  Image as ImageIcon,
  Settings,
  Link as LinkIcon,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  ChevronRight,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";
import { CreateBusinessAssetModal } from "@/components/social/CreateBusinessAssetModal";

export interface ConnectedAccountItem {
  id: string;
  provider: string;
  providerAccountId: string;
  displayName: string;
  username: string | null;
  profileImageUrl: string | null;
  accountType?: string;
  status: string;
  syncPosts?: boolean;
  validityDays?: number;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  lastSyncedAt?: string | null;
  tokenExpiresAt?: string | null;
  createdAt: string;
}

export const PLATFORM_NAV_ITEMS = [
  { id: "all", name: "All", icon: "all" },
  { id: "google_business", name: "GBP", icon: "google_business" },
  { id: "facebook", name: "Facebook", icon: "facebook" },
  { id: "instagram", name: "Instagram", icon: "instagram" },
  { id: "threads", name: "Threads", icon: "threads" },
  { id: "linkedin", name: "LinkedIn", icon: "linkedin" },
  { id: "tiktok", name: "TikTok", icon: "tiktok" },
  { id: "pinterest", name: "Pinterest", icon: "pinterest" },
  { id: "youtube", name: "YouTube", icon: "youtube" },
  { id: "community", name: "Community", icon: "telegram" },
  { id: "x", name: "X", icon: "x" },
  { id: "snapchat", name: "Snapchat", icon: "snapchat" },
  { id: "whatsapp", name: "WhatsApp", icon: "whatsapp" },
  { id: "reddit", name: "Reddit", icon: "reddit" },
  { id: "bluesky", name: "Bluesky", icon: "bluesky" },
  { id: "telegram", name: "Telegram", icon: "telegram" },
  { id: "mastodon", name: "Mastodon", icon: "mastodon" },
];

export default function SocialAccountsPage() {
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  // Navigation Subtabs
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    | "social_accounts"
    | "communities"
    | "pinterest"
    | "notifications"
    | "social_categories"
    | "watermark"
    | "global_settings"
    | "manage_links"
  >("social_accounts");

  // Filter state
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Data state
  const [accounts, setAccounts] = useState<ConnectedAccountItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectModalPlatform, setConnectModalPlatform] = useState<string | null>(null);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<ConnectedAccountItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load accounts from API
  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/social/accounts", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch {
      toast({
        title: "Connection Error",
        message: "Could not load social accounts.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAccounts();

    const handleOAuthSuccess = (event: MessageEvent) => {
      if (event.data?.type === "PULSESOCIAL_CHANNEL_CONNECTED") {
        toast({
          title: "Account Connected",
          message: `${event.data.account?.displayName || "Account"} connected successfully.`,
          type: "success",
        });
        loadAccounts();
      }
    };

    const handleBrandChange = () => {
      loadAccounts();
    };

    window.addEventListener("message", handleOAuthSuccess);
    window.addEventListener("pulsesocial_active_brand_changed", handleBrandChange);
    return () => {
      window.removeEventListener("message", handleOAuthSuccess);
      window.removeEventListener("pulsesocial_active_brand_changed", handleBrandChange);
    };
  }, [loadAccounts, toast]);

  // Toggle Sync Posts switch
  const handleToggleSync = async (account: ConnectedAccountItem) => {
    const nextSync = !account.syncPosts;
    setAccounts((prev) =>
      prev.map((a) => (a.id === account.id ? { ...a, syncPosts: nextSync } : a))
    );

    try {
      const res = await fetch("/api/social/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id, syncPosts: nextSync }),
      });
      if (!res.ok) throw new Error("Update failed");

      toast({
        title: nextSync ? "Post Sync Enabled" : "Post Sync Paused",
        message: `Sync for ${account.displayName} has been updated.`,
        type: "success",
      });
    } catch {
      // Revert on error
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, syncPosts: !nextSync } : a))
      );
      toast({
        title: "Update Error",
        message: "Could not toggle post sync status.",
        type: "error",
      });
    }
  };

  // Re-sync account now
  const handleSyncAccount = async (account: ConnectedAccountItem) => {
    setSyncingAccountId(account.id);
    try {
      const res = await fetch(`/api/social/accounts/${account.id}/sync`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");

      toast({
        title: "Account Synchronized",
        message: `${account.displayName} refreshed successfully.`,
        type: "success",
      });
      await loadAccounts();
    } catch (err: unknown) {
      toast({
        title: "Sync Error",
        message: (err as Error).message || "Could not sync account.",
        type: "error",
      });
    } finally {
      setSyncingAccountId(null);
    }
  };

  // Delete account
  const handleConfirmDelete = async () => {
    if (!deleteConfirmAccount) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/social/accounts?id=${deleteConfirmAccount.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disconnect account");

      toast({
        title: "Account Disconnected",
        message: `${deleteConfirmAccount.displayName} has been removed.`,
        type: "info",
      });
      setDeleteConfirmAccount(null);
      await loadAccounts();
    } catch (err: unknown) {
      toast({
        title: "Disconnect Failed",
        message: (err as Error).message || "Could not delete account.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // Platform filter
      if (selectedPlatform !== "all") {
        if (selectedPlatform === "community") {
          if (acc.provider !== "telegram") return false;
        } else if (acc.provider.toLowerCase() !== selectedPlatform.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === "active" && acc.status !== "CONNECTED") return false;
      if (statusFilter === "expired" && acc.status === "CONNECTED") return false;

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = acc.displayName.toLowerCase().includes(q);
        const matchesUser = acc.username?.toLowerCase().includes(q);
        const matchesProvider = acc.provider.toLowerCase().includes(q);
        if (!matchesName && !matchesUser && !matchesProvider) return false;
      }

      return true;
    });
  }, [accounts, selectedPlatform, statusFilter, searchQuery]);

  return (
    <AppLayout>
      <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-[calc(100vh-60px)] font-sans">
        
        {/* Top Marketing / Social Planner Sub-Navigation Bar matching Screenshot */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-6 overflow-x-auto scrollbar-none text-xs">
                <span className="font-bold text-slate-900 dark:text-white shrink-0">
                  Marketing
                </span>
                <div className="flex items-center gap-5 text-slate-600 dark:text-slate-400 font-semibold shrink-0">
                  <Link
                    href="/posts"
                    className="text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 py-3.5"
                  >
                    Social Planner
                  </Link>
                  <Link href="/snippets" className="hover:text-slate-900 dark:hover:text-white transition">
                    Snippets
                  </Link>
                  <Link href="/brand-boards" className="hover:text-slate-900 dark:hover:text-white transition">
                    Brand Boards
                  </Link>
                  <Link href="/links" className="hover:text-slate-900 dark:hover:text-white transition">
                    Trigger Links
                  </Link>
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
          </div>
        </div>

        {/* Back Link Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Social planner settings</span>
          </Link>
        </div>

        {/* Two-Column Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* ============================================================ */}
            {/* LEFT SIDEBAR: Social Planner Settings Tabs (Screenshot exact) */}
            {/* ============================================================ */}
            <aside className="w-full lg:w-60 shrink-0">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs space-y-1">
                
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab("social_accounts")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeSettingsTab === "social_accounts"
                      ? "bg-[#eef4ff] text-[#1877F2] dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                  }`}
                >
                  <span className="text-sm font-bold">@</span>
                  <span>Social accounts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSettingsTab("communities")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeSettingsTab === "communities"
                      ? "bg-[#eef4ff] text-[#1877F2] dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Communities</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSettingsTab("pinterest")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeSettingsTab === "pinterest"
                      ? "bg-[#eef4ff] text-[#1877F2] dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {renderPlatformIcon("pinterest", 16)}
                  </div>
                  <span>Pinterest</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSettingsTab("notifications")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeSettingsTab === "notifications"
                      ? "bg-[#eef4ff] text-[#1877F2] dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSettingsTab("social_categories")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeSettingsTab === "social_categories"
                      ? "bg-[#eef4ff] text-[#1877F2] dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>Social categories</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSettingsTab("watermark")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeSettingsTab === "watermark"
                      ? "bg-[#eef4ff] text-[#1877F2] dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Watermark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSettingsTab("global_settings")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeSettingsTab === "global_settings"
                      ? "bg-[#eef4ff] text-[#1877F2] dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Global settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSettingsTab("manage_links")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeSettingsTab === "manage_links"
                      ? "bg-[#eef4ff] text-[#1877F2] dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-4 h-4" />
                    <span>Manage links</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    New
                  </span>
                </button>
              </div>
            </aside>

            {/* ============================================================ */}
            {/* RIGHT MAIN PANEL: Active Tab Content                         */}
            {/* ============================================================ */}
            <main className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              
              {/* TAB 1: SOCIAL ACCOUNTS (MAIN VIEW MATCHING SCREENSHOT) */}
              {activeSettingsTab === "social_accounts" && (
                <div className="space-y-6">
                  
                  {/* Panel Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Social Integration
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Connect multiple social accounts securely to publish and sync real posts.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsAssetModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Create Page / Asset</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setConnectModalPlatform(null);
                          setIsConnectModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-[0.98]"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Connect Social</span>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Scrollable Platform Filter Tabs */}
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-1">
                    <div className="flex items-center gap-6 overflow-x-auto scrollbar-thin pb-2">
                      {PLATFORM_NAV_ITEMS.map((item) => {
                        const isSelected = selectedPlatform === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedPlatform(item.id)}
                            className={`flex items-center gap-2 text-xs font-bold shrink-0 transition relative py-1 cursor-pointer ${
                              isSelected
                                ? "text-[#1877F2] dark:text-blue-400"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            {item.id !== "all" && (
                              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                {renderPlatformIcon(item.icon, 16)}
                              </div>
                            )}
                            <span>{item.name}</span>

                            {isSelected && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2] rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Secondary Filter & Search Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Status Pills */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStatusFilter("all")}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          statusFilter === "all"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("active")}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          statusFilter === "active"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("expired")}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          statusFilter === "expired"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                        }`}
                      >
                        Expired
                      </button>
                    </div>

                    {/* Search Input & View Toggle */}
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for a social"
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-850">
                        <button
                          type="button"
                          onClick={() => setViewMode("table")}
                          className={`p-1.5 rounded-lg transition ${
                            viewMode === "table"
                              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                          title="Table View"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("grid")}
                          className={`p-1.5 rounded-lg transition ${
                            viewMode === "grid"
                              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                          title="Card Grid View"
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ============================================================ */}
                  {/* REAL DATA TABLE (Matching Reference Screenshot EXACTLY)      */}
                  {/* ============================================================ */}
                  {isLoading ? (
                    <div className="py-16 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <p className="text-xs font-semibold text-slate-500">
                        Retrieving authenticated social accounts...
                      </p>
                    </div>
                  ) : filteredAccounts.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="max-w-md mx-auto space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          No connected social accounts found
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Connect your Facebook Pages, Instagram Professional profiles, LinkedIn, YouTube, or Google Business accounts to publish and sync posts.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setConnectModalPlatform(null);
                          setIsConnectModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Connect Social Account</span>
                      </button>
                    </div>
                  ) : viewMode === "table" ? (
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f8fafc] dark:bg-slate-850/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-4 flex items-center gap-2">
                              <span>@</span>
                              <span>Social Account</span>
                            </th>
                            <th className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Status</span>
                              </div>
                            </th>
                            <th className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] border border-slate-300 dark:border-slate-600 px-1 rounded">
                                  A
                                </span>
                                <span>Type</span>
                              </div>
                            </th>
                            <th className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Validity</span>
                              </div>
                            </th>
                            <th className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                                <span>Sync posts</span>
                              </div>
                            </th>
                            <th className="py-3 px-4 text-right">
                              <RefreshCw className="w-3.5 h-3.5 text-slate-400 inline-block" />
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {filteredAccounts.map((account) => {
                            const isSyncing = syncingAccountId === account.id;

                            return (
                              <tr
                                key={account.id}
                                className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition group"
                              >
                                {/* Column 1: Social Account Avatar + Badge + Name */}
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="relative shrink-0">
                                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                                        {account.profileImageUrl ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img
                                            src={account.profileImageUrl}
                                            alt={account.displayName}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {account.displayName.charAt(0).toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 p-0.5 shadow-2xs flex items-center justify-center">
                                        {renderPlatformIcon(account.provider, 14)}
                                      </div>
                                    </div>

                                    <div className="min-w-0">
                                      <Link
                                        href={`/social-accounts/${account.id}`}
                                        className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate block max-w-xs"
                                      >
                                        {account.displayName}
                                      </Link>
                                      {account.username && (
                                        <span className="text-[11px] text-slate-400 block truncate">
                                          @{account.username}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Column 2: Status */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF8ED] text-[#22C55E] dark:bg-emerald-950/60 dark:text-emerald-400">
                                    {account.status === "CONNECTED" ? "Connected" : account.status}
                                  </span>
                                </td>

                                {/* Column 3: Type */}
                                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                                  {account.accountType || "Page"}
                                </td>

                                {/* Column 4: Validity */}
                                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                                  {account.validityDays !== undefined
                                    ? account.validityDays > 300
                                      ? "Permanent"
                                      : `${account.validityDays} days`
                                    : "42 days"}
                                </td>

                                {/* Column 5: Sync Posts Toggle Switch */}
                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSync(account)}
                                    className="focus:outline-none cursor-pointer inline-flex items-center justify-center"
                                    title={account.syncPosts !== false ? "Disable Post Sync" : "Enable Post Sync"}
                                  >
                                    <div
                                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition duration-200 ease-in-out ${
                                        account.syncPosts !== false
                                          ? "bg-[#1877F2]"
                                          : "bg-slate-300 dark:bg-slate-700"
                                      }`}
                                    >
                                      <div
                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ease-in-out ${
                                          account.syncPosts !== false ? "translate-x-4" : "translate-x-0"
                                        }`}
                                      />
                                    </div>
                                  </button>
                                </td>

                                {/* Column 6: Action Buttons (Sync + Delete) */}
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleSyncAccount(account)}
                                      disabled={isSyncing}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                                      title="Sync posts & profile data"
                                    >
                                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-indigo-600" : ""}`} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmAccount(account)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                      title="Disconnect social account"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>

                                    <Link
                                      href={`/social-accounts/${account.id}`}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                      title="View account security & permissions"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Card Grid View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAccounts.map((account) => {
                        const isSyncing = syncingAccountId === account.id;

                        return (
                          <div
                            key={account.id}
                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                                    {account.profileImageUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={account.profileImageUrl}
                                        alt={account.displayName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {account.displayName.charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 p-0.5 shadow-2xs flex items-center justify-center">
                                    {renderPlatformIcon(account.provider, 14)}
                                  </div>
                                </div>

                                <div>
                                  <Link
                                    href={`/social-accounts/${account.id}`}
                                    className="font-bold text-xs text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition block truncate max-w-[160px]"
                                  >
                                    {account.displayName}
                                  </Link>
                                  <span className="text-[11px] text-slate-400 block">
                                    {account.accountType || "Page"}
                                  </span>
                                </div>
                              </div>

                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                {account.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <span>Sync Posts</span>
                              <button
                                type="button"
                                onClick={() => handleToggleSync(account)}
                                className="focus:outline-none cursor-pointer inline-flex items-center"
                              >
                                <div
                                  className={`w-8 h-4 flex items-center rounded-full p-0.5 transition duration-200 ease-in-out ${
                                    account.syncPosts !== false
                                      ? "bg-[#1877F2]"
                                      : "bg-slate-300 dark:bg-slate-700"
                                  }`}
                                >
                                  <div
                                    className={`bg-white w-3 h-3 rounded-full shadow-md transform transition duration-200 ease-in-out ${
                                      account.syncPosts !== false ? "translate-x-4" : "translate-x-0"
                                    }`}
                                  />
                                </div>
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-slate-400">
                                Validity: {account.validityDays ? `${account.validityDays}d` : "42d"}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSyncAccount(account)}
                                  disabled={isSyncing}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                                  title="Sync account"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-indigo-600" : ""}`} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmAccount(account)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                                  title="Disconnect"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: COMMUNITIES */}
              {activeSettingsTab === "communities" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Communities</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Connect private community spaces including Discord servers, Telegram channels, and Slack communities.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#24A1DE] text-white flex items-center justify-center">
                            {renderPlatformIcon("telegram", 20)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Telegram Channel / Bot</h3>
                            <span className="text-[11px] text-slate-500">Official Telegram Bot API</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Supported</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Broadcast approved posts, announcements, and rich media directly to your public or private Telegram channels.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setConnectModalPlatform("telegram");
                          setIsConnectModalOpen(true);
                        }}
                        className="w-full py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition"
                      >
                        Connect Telegram Community
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
                            {renderPlatformIcon("whatsapp", 20)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">WhatsApp Business Broadcast</h3>
                            <span className="text-[11px] text-slate-500">Cloud API Verified</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Supported</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Integrate verified WhatsApp Business Cloud API for multi-client announcements and verified broadcasts.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setConnectModalPlatform("whatsapp");
                          setIsConnectModalOpen(true);
                        }}
                        className="w-full py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition"
                      >
                        Connect WhatsApp Cloud API
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PINTEREST */}
              {activeSettingsTab === "pinterest" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pinterest Settings</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Configure default boards, Rich Pin metadata synchronization, and destination link tracking.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Pinterest Board Provisioning</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      You can create and manage Pinterest boards directly via official Pinterest API v5.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAssetModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#E60023] hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create New Pinterest Board</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: NOTIFICATIONS */}
              {activeSettingsTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Social Planner Notifications</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Choose when and how you receive alerts for post publishing, failed broadcasts, and token expirations.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Publishing Failure Alerts</p>
                        <p className="text-[11px] text-slate-500">Send instant notification if a provider API rejects a scheduled post.</p>
                      </div>
                      <span className="text-xs font-bold text-indigo-600">Enabled</span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Token Expiration Reminder (7 Days Prior)</p>
                        <p className="text-[11px] text-slate-500">Warn workspace members before OAuth tokens expire to avoid publishing gaps.</p>
                      </div>
                      <span className="text-xs font-bold text-indigo-600">Enabled</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SOCIAL CATEGORIES */}
              {activeSettingsTab === "social_categories" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Social Categories</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Group and tag your scheduled posts by campaign, topic, or format.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        toast({
                          title: "New Category",
                          message: "Created new campaign category.",
                          type: "success",
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { name: "Promotions & Offers", color: "bg-purple-100 text-purple-700" },
                      { name: "Behind the Scenes", color: "bg-emerald-100 text-emerald-700" },
                      { name: "Educational Tips", color: "bg-blue-100 text-blue-700" },
                      { name: "Product Announcements", color: "bg-amber-100 text-amber-700" },
                    ].map((cat, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${cat.color}`}>
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-400">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: WATERMARK */}
              {activeSettingsTab === "watermark" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Watermark Settings</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Automatically burn brand watermarks onto scheduled images and video reels before dispatch.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Enable Auto-Watermark
                      </span>
                      <span className="text-xs font-bold text-slate-400">Off by default</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Upload your PNG logo with transparent background to overlay on all outbound media.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 7: GLOBAL SETTINGS */}
              {activeSettingsTab === "global_settings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Global Publishing Settings</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Configure UTM parameter tagging, default timezones, and link shortening across all social networks.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Default UTM Campaign Parameter
                      </label>
                      <input
                        type="text"
                        defaultValue="utm_source={platform}&utm_medium=social&utm_campaign=pulsesocial"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono bg-white dark:bg-slate-900"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: MANAGE LINKS */}
              {activeSettingsTab === "manage_links" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Links</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Track link clicks, bio link trees, and custom branded short domains.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Link in Bio & Custom Tracking URLs
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Create short links with real click tracking to embed into Instagram bios and X tweets.
                    </p>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Disconnect Social Account?
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to disconnect <strong>{deleteConfirmAccount.displayName}</strong>? This will revoke publishing access and delete encrypted OAuth credentials for this workspace.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmAccount(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Disconnect Account</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Universal Social Connect Modal */}
        <UniversalSocialConnectModal
          isOpen={isConnectModalOpen}
          initialPlatformId={connectModalPlatform || undefined}
          onClose={() => {
            setIsConnectModalOpen(false);
            setConnectModalPlatform(null);
          }}
          onSuccess={() => {
            setIsConnectModalOpen(false);
            setConnectModalPlatform(null);
            loadAccounts();
          }}
        />

        {/* Create Page / Business Asset Modal */}
        <CreateBusinessAssetModal
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
          onConnectExisting={(platformId) => {
            setConnectModalPlatform(platformId);
            setIsConnectModalOpen(true);
          }}
        />
      </div>
    </AppLayout>
  );
}
