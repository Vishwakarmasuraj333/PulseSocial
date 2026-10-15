"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";

interface SocialAccountItem {
  id: string;
  provider: string;
  displayName: string;
  username: string | null;
  profileImageUrl: string | null;
  accountType: string;
  status: string;
  connectedAt: string;
  lastSyncedAt: string | null;
  tokenExpiresAt: string | null;
  isTokenExpired: boolean;
  hasToken: boolean;
  organization: { id: string; name: string; slug: string };
  counts: { postsPublished: number; comments: number; messages: number; syncJobs: number };
}

export default function AdminSocialAccountsPage() {
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<SocialAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Syncing action state
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Disconnect Modal
  const [disconnectingAccount, setDisconnectingAccount] = useState<SocialAccountItem | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (providerFilter) params.append("provider", providerFilter);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", "10");

      const res = await fetch(`/api/admin/social-accounts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load accounts");
      const data = await res.json();
      setAccounts(data.accounts || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err: any) {
      toast({
        title: "Error Loading Accounts",
        message: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, providerFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAccounts();
  };

  // Trigger manual sync
  const handleTriggerSync = async (acc: SocialAccountItem) => {
    try {
      setSyncingId(acc.id);
      const res = await fetch(`/api/admin/social-accounts/${acc.id}/sync`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Sync request failed");
      const data = await res.json();

      toast({
        title: "Channel Synchronized",
        message: data.message || `Successfully synced ${acc.displayName}`,
        type: "success",
      });
      fetchAccounts();
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setSyncingId(null);
    }
  };

  // Disconnect Account
  const handleDisconnect = async () => {
    if (!disconnectingAccount) return;
    try {
      setIsDisconnecting(true);
      const res = await fetch(`/api/admin/social-accounts/${disconnectingAccount.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to disconnect account");

      toast({
        title: "Account Disconnected",
        message: `${disconnectingAccount.displayName} has been disconnected.`,
        type: "info",
      });
      setDisconnectingAccount(null);
      fetchAccounts();
    } catch (err: any) {
      toast({
        title: "Disconnect Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Connected Social Accounts ({totalCount})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit OAuth token integrity, check sync health, and trigger administrative synchronization.
          </p>
        </div>

        <button
          onClick={fetchAccounts}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-2xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channel or username..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#6F52B5]/40"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Provider Filter */}
          <select
            value={providerFilter}
            onChange={(e) => {
              setProviderFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="">All Networks</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="x">X (Twitter)</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="pinterest">Pinterest</option>
            <option value="mastodon">Mastodon</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="CONNECTED">Connected</option>
            <option value="EXPIRED">Token Expired</option>
            <option value="DISCONNECTED">Disconnected</option>
          </select>
        </div>
      </div>

      {/* Social Accounts Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Channel</th>
                <th className="px-4 py-3.5">Platform</th>
                <th className="px-4 py-3.5">Workspace</th>
                <th className="px-4 py-3.5">Token Health</th>
                <th className="px-4 py-3.5">Last Synced</th>
                <th className="px-4 py-3.5">Sync Jobs</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#6F52B5]" />
                    <span>Loading channels...</span>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No social channels connected.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                          {acc.profileImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={acc.profileImageUrl}
                              alt={acc.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-xs text-slate-600 dark:text-slate-300">
                              {acc.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {acc.displayName}
                          </p>
                          {acc.username && (
                            <p className="text-[11px] text-slate-400 truncate">
                              @{acc.username}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 capitalize">
                        <span className="w-4 h-4 flex items-center justify-center shrink-0">
                          {renderPlatformIcon(acc.provider, 16)}
                        </span>
                        <span>{acc.provider}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {acc.organization.name}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {acc.isTokenExpired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          <ShieldAlert className="w-3 h-3" />
                          <span>EXPIRED</span>
                        </span>
                      ) : acc.hasToken ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <ShieldCheck className="w-3 h-3" />
                          <span>VALID & SECURE</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">NO TOKEN RECORD</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      {acc.lastSyncedAt
                        ? new Date(acc.lastSyncedAt).toLocaleString()
                        : "Never synced"}
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {acc.counts.syncJobs} jobs
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTriggerSync(acc)}
                          disabled={syncingId === acc.id}
                          title="Trigger Sync Now"
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-[#6F52B5] dark:text-purple-300 hover:bg-purple-100 transition flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${syncingId === acc.id ? "animate-spin" : ""}`}
                          />
                          <span>Sync</span>
                        </button>

                        <button
                          onClick={() => setDisconnectingAccount(acc)}
                          title="Disconnect Channel"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      {disconnectingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setDisconnectingAccount(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 z-10 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Disconnect Channel?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to disconnect <b>{disconnectingAccount.displayName}</b> ({disconnectingAccount.provider}) from <b>{disconnectingAccount.organization.name}</b>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDisconnectingAccount(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
              >
                {isDisconnecting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
