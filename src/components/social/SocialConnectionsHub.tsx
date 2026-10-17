"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Share2,
  ChevronDown,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";

export interface ConnectedAccountItem {
  id: string;
  provider: string;
  displayName: string;
  username?: string | null;
  profileImageUrl?: string | null;
  status?: string;
  validityDays?: number;
  lastSyncedAt?: string | null;
  tokenExpiresAt?: string | null;
  followersCount?: number | null;
  accountType?: string;
}

export interface NetworkCatalogEntry {
  id: string;
  name: string;
  description: string;
  category: "Professional" | "Social & Video" | "Messaging & Fediverse";
  isConfigured: boolean;
}

export const SUPPORTED_NETWORKS_CATALOG: NetworkCatalogEntry[] = [
  { id: "instagram", name: "Instagram", description: "Reels, Photos, Stories & Carousels", category: "Social & Video", isConfigured: true },
  { id: "facebook", name: "Facebook", description: "Pages, Video, Scheduled Posts", category: "Social & Video", isConfigured: true },
  { id: "threads", name: "Threads", description: "Conversational Microblogging & Media", category: "Social & Video", isConfigured: true },
  { id: "linkedin", name: "LinkedIn", description: "Articles, Documents & Company Updates", category: "Professional", isConfigured: true },
  { id: "tiktok", name: "TikTok", description: "Short-Form Video & Audio Publishing", category: "Social & Video", isConfigured: true },
  { id: "snapchat", name: "Snapchat", description: "Spotlight, Stories & Audience Reach", category: "Social & Video", isConfigured: true },
  { id: "youtube", name: "YouTube", description: "Videos, Shorts & Community Posts", category: "Social & Video", isConfigured: true },
  { id: "x", name: "X (Twitter)", description: "Real-time Posts, Threads & Media", category: "Professional", isConfigured: true },
  { id: "google_business", name: "Google Business Profile", description: "Search & Maps Local Updates", category: "Professional", isConfigured: true },
  { id: "whatsapp", name: "WhatsApp Business", description: "Broadcast Messaging & Client Updates", category: "Messaging & Fediverse", isConfigured: true },
  { id: "reddit", name: "Reddit", description: "Subreddit Submissions, Text & Links", category: "Messaging & Fediverse", isConfigured: true },
  { id: "pinterest", name: "Pinterest", description: "Visual Pins, Boards & Analytics", category: "Social & Video", isConfigured: true },
  { id: "bluesky", name: "Bluesky", description: "Decentralized AT Protocol Posts", category: "Messaging & Fediverse", isConfigured: true },
  { id: "telegram", name: "Telegram", description: "Channel Broadcasts & Media Drops", category: "Messaging & Fediverse", isConfigured: true },
  { id: "mastodon", name: "Mastodon", description: "Decentralized Fediverse Statuses", category: "Messaging & Fediverse", isConfigured: true },
];

interface SocialConnectionsHubProps {
  connectedAccounts: ConnectedAccountItem[];
  onOpenConnectModal: (platformId?: string) => void;
  onRefreshAccounts: () => void;
}

export function SocialConnectionsHub({
  connectedAccounts,
  onOpenConnectModal,
  onRefreshAccounts,
}: SocialConnectionsHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"connected" | "catalog">("connected");
  const [isDisconnectingId, setIsDisconnectingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  // Filtered connected accounts
  const filteredConnected = useMemo(() => {
    if (!searchQuery.trim()) return connectedAccounts;
    const q = searchQuery.toLowerCase();
    return connectedAccounts.filter(
      (a) =>
        a.displayName.toLowerCase().includes(q) ||
        (a.username && a.username.toLowerCase().includes(q)) ||
        a.provider.toLowerCase().includes(q)
    );
  }, [connectedAccounts, searchQuery]);

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_NETWORKS_CATALOG;
    const q = searchQuery.toLowerCase();
    return SUPPORTED_NETWORKS_CATALOG.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Handle Disconnect
  const handleDisconnect = async (accountId: string, displayName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${displayName}? This will remove publishing capabilities for this account.`)) {
      return;
    }

    setIsDisconnectingId(accountId);
    try {
      const res = await fetch(`/api/social/accounts?id=${accountId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disconnect account");

      toast({
        title: "Account Disconnected",
        message: `${displayName} has been removed safely.`,
        type: "success",
      });
      onRefreshAccounts();
    } catch (err: unknown) {
      toast({
        title: "Disconnect Failed",
        message: (err as Error).message || "Could not disconnect account.",
        type: "error",
      });
    } finally {
      setIsDisconnectingId(null);
    }
  };

  // Handle Refresh Status
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshAccounts();
      toast({
        title: "Accounts Synchronized",
        message: "Latest token health and channel metrics updated.",
        type: "info",
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const count = connectedAccounts.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Trigger Pill: Clean Modern Avatar-Group & Active Status Dot */}
      <button
        type="button"
        id="social-connections-hub-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="h-9 px-2.5 rounded-xl flex items-center gap-2 bg-slate-50 dark:bg-white/5 hover:bg-purple-50/70 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-amber-500/40 transition-all cursor-pointer shadow-2xs group shrink-0 hover:scale-[1.02]"
        title={`Connected Social Accounts (${count}) - Click to manage`}
      >
        {/* Stacked brand icons (Avatar-group style) */}
        {count > 0 ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center -space-x-1.5 shrink-0">
              {connectedAccounts.slice(0, 3).map((acc) => (
                <div
                  key={acc.id}
                  className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-[#111113] overflow-hidden shrink-0 bg-white dark:bg-[#1C1C20] shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform"
                  title={`${acc.displayName} (${acc.provider})`}
                >
                  {renderPlatformIcon(acc.provider, 13)}
                </div>
              ))}
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hidden md:inline">
              {count} {count === 1 ? "Channel" : "Channels"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Share2 className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />
            <span className="hidden sm:inline">Connect Channels</span>
          </div>
        )}

        {/* Small active green status dot */}
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            count > 0 ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-slate-300 dark:bg-slate-600"
          }`}
        />

        {/* Dropdown Chevron arrow */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#5846A8] dark:group-hover:text-[#FBBF24] transition-all duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Enterprise Popover / Dropdown Menu locked strictly to top-full mt-2 */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Social Accounts Hub"
          className="absolute right-0 top-full mt-2 w-[340px] sm:w-[440px] max-w-[94vw] rounded-2xl bg-white dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#5846A8] dark:text-[#FBBF24]" />
                <span>Social Accounts Hub</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized OAuth management across official networks
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#5846A8] dark:hover:text-[#FBBF24] hover:bg-purple-50 dark:hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50 hover:scale-105"
                title="Refresh Status"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#5846A8] dark:text-[#E08738]" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="my-3 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search channels, accounts, handles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#17171A] text-xs focus:outline-none focus:border-[#5846A8] dark:focus:border-[#E08738] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#6B7280] transition-colors"
            />
          </div>

          {/* Navigation Tabs: Connected vs Catalog */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#17171A] rounded-xl mb-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("connected")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer hover:scale-[1.02] ${
                activeTab === "connected"
                  ? "bg-white dark:bg-[#282830] text-[#5846A8] dark:text-[#FBBF24] shadow-2xs font-bold"
                  : "text-slate-500 hover:text-[#5846A8] dark:hover:text-white"
              }`}
            >
              Connected ({count})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer hover:scale-[1.02] ${
                activeTab === "catalog"
                  ? "bg-white dark:bg-[#282830] text-[#5846A8] dark:text-[#FBBF24] shadow-2xs font-bold"
                  : "text-slate-500 hover:text-[#5846A8] dark:hover:text-white"
              }`}
            >
              Network Catalog (15)
            </button>
          </div>

          {/* TAB 1: Connected Accounts List */}
          {activeTab === "connected" && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredConnected.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-amber-500/10 text-[#5846A8] dark:text-[#FBBF24] flex items-center justify-center mx-auto">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No accounts match your query
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Connect your official profiles to publish directly to Instagram, LinkedIn, Facebook, X, etc.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenConnectModal();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:hover:brightness-105 dark:text-slate-950 text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Connect Social Account</span>
                  </button>
                </div>
              ) : (
                filteredConnected.map((acc) => {
                  const isExpired = acc.validityDays !== undefined && acc.validityDays <= 0;
                  const isDisconnecting = isDisconnectingId === acc.id;

                  return (
                    <div
                      key={acc.id}
                      className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-[#17171A] border border-slate-200/80 dark:border-white/10 hover:border-purple-300 dark:hover:border-amber-500/40 hover:bg-purple-50/30 dark:hover:bg-white/5 transition-all duration-150 flex items-center justify-between gap-3 group"
                    >
                      {/* Left: Avatar + Identity */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                            {acc.profileImageUrl ? (
                              <img
                                src={acc.profileImageUrl}
                                alt={acc.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              renderPlatformIcon(acc.provider, 18)
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-[#111113] ring-1 ring-white dark:ring-white/10 flex items-center justify-center shadow-xs">
                            {renderPlatformIcon(acc.provider, 12)}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {acc.displayName}
                            </span>
                            {isExpired ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                                EXPIRED
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 flex items-center gap-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                ACTIVE
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="truncate">
                              {acc.username ? `@${acc.username}` : acc.accountType || acc.provider}
                            </span>
                            {acc.validityDays !== undefined && !isExpired && (
                              <span className="shrink-0 text-slate-400">
                                • {acc.validityDays}d left
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isExpired && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              onOpenConnectModal(acc.provider);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 text-[10px] font-bold hover:bg-rose-200 transition cursor-pointer"
                            title="Reconnect"
                          >
                            Reconnect
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDisconnect(acc.id, acc.displayName)}
                          disabled={isDisconnecting}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer disabled:opacity-50 hover:scale-110"
                          title={`Disconnect ${acc.displayName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Supported Networks Catalog */}
          {activeTab === "catalog" && (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {filteredCatalog.map((net) => {
                const connectedInstance = connectedAccounts.find(
                  (a) => a.provider.toLowerCase() === net.id.toLowerCase()
                );
                const isConnected = Boolean(connectedInstance);

                return (
                  <div
                    key={net.id}
                    className="p-2 rounded-xl bg-slate-50/60 dark:bg-[#17171A] border border-slate-200/60 dark:border-white/10 hover:border-purple-300 dark:hover:border-amber-500/30 hover:bg-purple-50/30 dark:hover:bg-white/5 transition-all duration-150 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-2xs">
                        {renderPlatformIcon(net.id, 16)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {net.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium">
                            {net.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {net.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isConnected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Connected</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            onOpenConnectModal(net.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-[#5846A8] hover:text-white dark:bg-white/5 dark:hover:bg-[#E08738] dark:hover:text-[#0F0F11] text-[#5846A8] dark:text-[#FBBF24] text-[11px] font-semibold transition-all cursor-pointer border border-purple-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-amber-500/40 hover:scale-105"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Popover Footer: Primary Actions */}
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenConnectModal();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:hover:brightness-105 dark:text-slate-950 text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Social Account</span>
            </button>

            <Link
              href="/social-accounts"
              onClick={() => setIsOpen(false)}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-purple-50 hover:text-[#5846A8] hover:border-purple-300 dark:hover:bg-white/8 dark:hover:text-[#FBBF24] text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer hover:scale-102"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
