"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Send,
  BarChart3,
  MessageSquare,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";

interface AccountDetails {
  id: string;
  provider: string;
  providerAccountId: string;
  displayName: string;
  username: string | null;
  profileImageUrl: string | null;
  accountType: string | null;
  status: string;
  scopes: string;
  metadata?: string | null;
  lastSyncedAt: string | null;
  tokenExpiresAt: string | null;
  createdAt: string;
  profile?: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
    bio?: string | null;
    websiteUrl?: string | null;
  } | null;
  token?: {
    expiresAt?: string | null;
    updatedAt?: string;
  } | null;
}

export default function SocialAccountDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const accountId = params?.id as string;
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isReconnectModalOpen, setIsReconnectModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadAccount = useCallback(async () => {
    if (!accountId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/social/accounts/${accountId}`);
      if (!res.ok) {
        throw new Error("Account not found or access denied");
      }
      const data = await res.json();
      setAccount(data.account);
    } catch (err: unknown) {
      toast({
        title: "Load Error",
        message: (err as Error).message || "Could not retrieve account details.",
        type: "error",
      });
      router.push("/social-accounts");
    } finally {
      setIsLoading(false);
    }
  }, [accountId, router, toast]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleSyncNow = async () => {
    if (!account) return;
    setIsSyncing(true);
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
      await loadAccount();
    } catch (err: unknown) {
      toast({
        title: "Sync Error",
        message: (err as Error).message || "Could not sync account with provider.",
        type: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!account) return;
    setIsDisconnecting(true);
    try {
      const res = await fetch(`/api/social/accounts/${account.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Disconnect failed");

      toast({
        title: "Account Disconnected",
        message: `${account.displayName} has been disconnected.`,
        type: "info",
      });
      router.push("/social-accounts");
    } catch (err: unknown) {
      toast({
        title: "Disconnect Error",
        message: (err as Error).message || "Failed to disconnect account.",
        type: "error",
      });
      setIsDisconnecting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            Loading authenticated account details...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (!account) return null;

  // Calculate validity
  let validityLabel = "Active";
  if (account.tokenExpiresAt) {
    const diffDays = Math.ceil(
      (new Date(account.tokenExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    validityLabel = diffDays > 0 ? `${diffDays} days remaining` : "Expired";
  } else if (
    account.provider === "telegram" ||
    account.provider === "mastodon" ||
    account.provider === "bluesky"
  ) {
    validityLabel = "Permanent (Bot / API Key)";
  }

  // Parse authorized scopes
  let parsedScopes: string[] = [];
  try {
    parsedScopes = JSON.parse(account.scopes);
    if (!Array.isArray(parsedScopes)) parsedScopes = [];
  } catch {
    parsedScopes = account.scopes ? [account.scopes] : [];
  }

  // Format last synced
  const formatTimeAgo = (dateStr?: string | null) => {
    if (!dateStr) return "Never";
    try {
      const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link
            href="/social-accounts"
            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Social Accounts</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            {account.displayName}
          </span>
        </div>

        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-xs">
                {account.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={account.profileImageUrl}
                    alt={account.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-slate-700 dark:text-slate-200">
                    {account.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 p-0.5 shadow-sm flex items-center justify-center">
                {renderPlatformIcon(account.provider, 18)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {account.displayName}
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {account.status}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {account.accountType || "Page"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {account.username ? `@${account.username}` : `ID: ${account.providerAccountId}`} &bull; Last synced:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatTimeAgo(account.lastSyncedAt)}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReconnectModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reconnect</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>

        {/* 3-Column Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Audience Reach
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {typeof account.profile?.followersCount === "number"
                ? account.profile.followersCount.toLocaleString()
                : "—"}
            </div>
            <p className="text-[11px] text-slate-400">
              Verified live followers retrieved via official provider API
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Published Posts
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {typeof account.profile?.postsCount === "number"
                ? account.profile.postsCount.toLocaleString()
                : "—"}
            </div>
            <p className="text-[11px] text-slate-400">
              Total historical media objects on account
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Token Validity
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {validityLabel}
            </div>
            <p className="text-[11px] text-slate-400">
              Encrypted AES-256 OAuth access token status
            </p>
          </div>
        </div>

        {/* Capabilities Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Platform Capabilities</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-indigo-600" />
                  Publishing
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Direct publishing, scheduling, and carousel distribution supported via official API.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                  Analytics
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Live API
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Real-time reach, impression metrics, and engagement rate calculation.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  Unified Inbox
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                  Webhooks
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Inbound comments and reply streams ingested securely via verified webhooks.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Scopes */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authorized Scopes & Security Enclave</span>
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Access tokens are encrypted at rest with AES-256-GCM. Tokens are never transmitted to client browsers, and API operations enforce strict workspace-level isolation to prevent unauthorized cross-tenant operations.
            </p>
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Granted Scopes
            </span>
            <div className="flex flex-wrap gap-2">
              {parsedScopes.length > 0 ? (
                parsedScopes.map((scope, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {scope}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Standard user permissions</span>
              )}
            </div>
          </div>
        </div>

        {/* Disconnect Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Disconnect Social Account?
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Disconnecting <strong>{account.displayName}</strong> will permanently revoke publishing access and remove encrypted authentication credentials for this workspace. Scheduled posts for this channel will be paused.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDisconnecting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isDisconnecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reconnect Modal */}
        <UniversalSocialConnectModal
          isOpen={isReconnectModalOpen}
          initialPlatformId={account.provider}
          onClose={() => setIsReconnectModalOpen(false)}
          onSuccess={() => {
            setIsReconnectModalOpen(false);
            loadAccount();
            toast({
              title: "Account Reconnected",
              message: `${account.displayName} re-authenticated successfully.`,
              type: "success",
            });
          }}
        />
      </div>
    </AppLayout>
  );
}
