"use client";

import React, { useEffect, useState } from "react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { ProductionAuditStatus } from "@/app/api/social/health/route";

export interface PlatformHealthItem {
  platform: string;
  displayName: string;
  apiVersion: string;
  auditStatus: ProductionAuditStatus;
  CONNECTED: boolean;
  TOKEN_VALID: "VALID" | "EXPIRED" | "MISSING";
  ACCOUNT_SYNCED: boolean;
  PUBLISHING_AVAILABLE: boolean;
  LIVE_API_VERIFIED: boolean;
  LIVE_ACCOUNT_TESTED: boolean;
  oauthStatus: "PASS" | "FAIL";
  approvalStatus: "APPROVED" | "REQUIRED" | "NOT_REQUIRED";
  mediaStatus: "READY" | "BLOCKED";
  accountCount: number;
  lastApiCheck: string | null;
  lastError: string | null;
  notes?: string;
}

export function ApiHealthCheckView() {
  const [healthData, setHealthData] = useState<PlatformHealthItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social/health");
      if (res.ok) {
        const data = await res.json();
        setHealthData(data.health || []);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error("Failed to fetch API health:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const getAuditBadge = (status: ProductionAuditStatus) => {
    switch (status) {
      case "LIVE ACCOUNT TESTED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300";
      case "EXTERNAL API VERIFIED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300";
      case "CODE VERIFIED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300";
      case "APPROVAL REQUIRED":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300";
      case "CREDENTIALS REQUIRED":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300";
      case "REAUTH REQUIRED":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300";
      case "BLOCKED":
        return "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300";
    }
  };

  const totalConnected = healthData.filter((h) => h.CONNECTED).length;
  const totalLiveTested = healthData.filter((h) => h.LIVE_ACCOUNT_TESTED).length;
  const totalApprovalRequired = healthData.filter((h) => h.approvalStatus === "REQUIRED").length;
  const totalPublishingAvailable = healthData.filter((h) => h.PUBLISHING_AVAILABLE).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-slate-900/10 border border-purple-200/40 dark:border-purple-800/40">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Integration API Health & Production Truth Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Real-time audit across all 14 platforms. Explicitly distinguishes between code verification, external API verification, live production account testing, and developer approval requirements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Audited at {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Audit
          </button>
        </div>
      </div>

      {/* Principle Callout */}
      <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Production Truth Policy: </span>
          An account showing <span className="font-semibold text-slate-900 dark:text-white">&quot;Connected&quot;</span> does not mean publishing is ready. Publishing requires valid live tokens, completed partner reviews (TikTok, YouTube, Meta), and verified end-to-end API responses.
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Supported Platforms</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">14</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Centralized API Version Config</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Connected Accounts</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalConnected}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Live workspace channels</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Approval Required</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{totalApprovalRequired}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">TikTok, Meta, YouTube audits</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Live Account Tested</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{totalLiveTested}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">Confirmed end-to-end publish</div>
        </div>
      </div>

      {/* 7 Production Truth Audit Classifications (Requirement 1) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            7 Official Production Truth Classifications
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px]">
          <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 block w-fit mb-1">
              CODE VERIFIED
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-[10px] leading-tight block">
              Official endpoints, REST schemas & version headers implemented and verified in code.
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 block w-fit mb-1">
              EXTERNAL API VERIFIED
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-[10px] leading-tight block">
              Live OAuth tokens connected and verified with platform API endpoint handshake.
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 block w-fit mb-1">
              LIVE ACCOUNT TESTED
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-[10px] leading-tight block">
              Real connected production account has successfully published a live post.
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 block w-fit mb-1">
              APPROVAL REQUIRED
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-[10px] leading-tight block">
              Developer partner app review required (TikTok, Meta App Review, YouTube Audit).
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 block w-fit mb-1">
              CREDENTIALS REQUIRED
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-[10px] leading-tight block">
              Missing OAuth Client ID or Client Secret in workspace environment.
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 block w-fit mb-1">
              REAUTH REQUIRED
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-[10px] leading-tight block">
              OAuth access or refresh token has expired or permissions were revoked.
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 col-span-1 sm:col-span-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-300 block w-fit mb-1">
              BLOCKED
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-[10px] leading-tight block">
              Platform developer policy strictly blocks direct public publishing without partner enterprise tier.
            </span>
          </div>
        </div>
      </div>

      {/* Main Compliance Matrix Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <th className="py-3 px-4">Platform & Version</th>
                <th className="py-3 px-3">Audit Classification</th>
                <th className="py-3 px-2 text-center">Connected</th>
                <th className="py-3 px-2 text-center">Token Valid</th>
                <th className="py-3 px-2 text-center">Synced</th>
                <th className="py-3 px-2 text-center">Publishing Available</th>
                <th className="py-3 px-2 text-center">Live API Verified</th>
                <th className="py-3 px-2 text-center">Live Account Tested</th>
                <th className="py-3 px-3">Status Notes / Blockers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading && healthData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-600" />
                    Running real-time platform compliance audit...
                  </td>
                </tr>
              ) : (
                healthData.map((item) => (
                  <tr key={item.platform} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Platform & Version */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                          {renderPlatformIcon(item.platform, "w-5 h-5")}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {item.displayName}
                            {item.accountCount > 0 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                {item.accountCount} {item.accountCount === 1 ? "account" : "accounts"}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {item.apiVersion}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Exact Audit Classification (Point 1) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getAuditBadge(item.auditStatus)}`}>
                        {item.auditStatus}
                      </span>
                    </td>

                    {/* 1. Connected */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.CONNECTED ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      }`}>
                        {item.CONNECTED ? "YES" : "NO"}
                      </span>
                    </td>

                    {/* 2. Token Valid */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.TOKEN_VALID === "VALID"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : item.TOKEN_VALID === "EXPIRED"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      }`}>
                        {item.TOKEN_VALID}
                      </span>
                    </td>

                    {/* 3. Account Synced */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.ACCOUNT_SYNCED
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      }`}>
                        {item.ACCOUNT_SYNCED ? "YES" : "NO"}
                      </span>
                    </td>

                    {/* 4. Publishing Available */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.PUBLISHING_AVAILABLE
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                      }`}>
                        {item.PUBLISHING_AVAILABLE ? "AVAILABLE" : "BLOCKED"}
                      </span>
                    </td>

                    {/* 5. Live API Verified */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.LIVE_API_VERIFIED
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      }`}>
                        {item.LIVE_API_VERIFIED ? "VERIFIED" : "PENDING"}
                      </span>
                    </td>

                    {/* 6. Live Account Tested */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.LIVE_ACCOUNT_TESTED
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {item.LIVE_ACCOUNT_TESTED ? "TESTED" : "NOT TESTED"}
                      </span>
                    </td>

                    {/* Notes / Last Error */}
                    <td className="py-3 px-3 text-[11px] text-slate-500 max-w-xs">
                      {item.lastError ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold line-clamp-1" title={item.lastError}>
                          {item.lastError}
                        </span>
                      ) : (
                        <span className="line-clamp-1" title={item.notes}>
                          {item.notes || "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Truth Legend */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-400">
        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-purple-600" />
          Production Truth Classification Standard:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div><strong className="text-purple-600">CODE VERIFIED:</strong> Adapter and endpoints implemented and build-passing, but awaiting external credentials.</div>
          <div><strong className="text-blue-600">EXTERNAL API VERIFIED:</strong> Real external endpoint tested and authenticated via OAuth.</div>
          <div><strong className="text-emerald-600">LIVE ACCOUNT TESTED:</strong> Real production account has successfully published a live post.</div>
          <div><strong className="text-amber-600">APPROVAL REQUIRED:</strong> Third-party platform partner/app review approval required (TikTok Direct Post, YouTube audit, Meta review).</div>
          <div><strong className="text-slate-600">CREDENTIALS REQUIRED:</strong> Environment variables (client ID / secret) missing in production.</div>
          <div><strong className="text-red-600">BLOCKED:</strong> Restricted by platform vendor policy (e.g. Snapchat).</div>
        </div>
      </div>
    </div>
  );
}
