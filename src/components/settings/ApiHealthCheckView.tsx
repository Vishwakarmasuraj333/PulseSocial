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
} from "lucide-react";

export interface PlatformHealthItem {
  platform: string;
  displayName: string;
  apiVersion: string;
  status: string;
  oauthStatus: "PASS" | "FAIL";
  tokenStatus: "VALID" | "EXPIRED" | "NOT_CONNECTED";
  accountSyncStatus: "PASS" | "FAIL" | "NOT_SYNCED";
  publishingStatus: "READY" | "BLOCKED" | "APPROVAL_REQUIRED";
  approvalStatus: "APPROVED" | "REQUIRED" | "NOT_REQUIRED";
  mediaStatus: "READY" | "BLOCKED";
  isConnected: boolean;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRODUCTION READY":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300";
      case "REAL API CONNECTED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300";
      case "APPROVAL REQUIRED":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300";
      case "REAUTH REQUIRED":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300";
      case "BLOCKED":
        return "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300";
    }
  };

  const totalConnected = healthData.filter((h) => h.isConnected).length;
  const totalApproved = healthData.filter((h) => h.approvalStatus === "APPROVED" || h.approvalStatus === "NOT_REQUIRED").length;
  const totalApprovalRequired = healthData.filter((h) => h.approvalStatus === "REQUIRED").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-slate-900/10 border border-purple-200/40 dark:border-purple-800/40">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Official Platform API Health & Compliance Audit
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Real-time verification of OAuth credentials, token lifecycle, publishing approvals, and platform API compliance across all 14 supported networks. Zero credentials or secret tokens are ever exposed to client interfaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Checked at {lastUpdated}
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Supported Networks</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">14</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Centralized API Version Matrix</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Connected Accounts</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalConnected}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Live workspace tokens</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Approval Required</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{totalApprovalRequired}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">App Review / Partner Audit</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Security & Isolation</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">100%</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">AES-256 GCM Encrypted</div>
        </div>
      </div>

      {/* Main Compliance Matrix Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <th className="py-3 px-4">Platform / Version</th>
                <th className="py-3 px-3">Compliance Status</th>
                <th className="py-3 px-3">OAuth</th>
                <th className="py-3 px-3">Token</th>
                <th className="py-3 px-3">Account Sync</th>
                <th className="py-3 px-3">Publishing</th>
                <th className="py-3 px-3">Approval</th>
                <th className="py-3 px-3">Media</th>
                <th className="py-3 px-3">Last API Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading && healthData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-600" />
                    Auditing live platform compliance...
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

                    {/* Overall Compliance Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* OAuth Config */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.oauthStatus === "PASS"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {item.oauthStatus === "PASS" ? "PASS" : "FAIL"}
                      </span>
                    </td>

                    {/* Token Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.tokenStatus === "VALID"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : item.tokenStatus === "EXPIRED"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {item.tokenStatus}
                      </span>
                    </td>

                    {/* Account Sync */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.accountSyncStatus === "PASS"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : item.accountSyncStatus === "FAIL"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {item.accountSyncStatus}
                      </span>
                    </td>

                    {/* Publishing Readiness */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.publishingStatus === "READY"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : item.publishingStatus === "APPROVAL_REQUIRED"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                        }`}
                      >
                        {item.publishingStatus}
                      </span>
                    </td>

                    {/* Approval Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.approvalStatus === "REQUIRED"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                            : item.approvalStatus === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {item.approvalStatus}
                      </span>
                    </td>

                    {/* Media Upload */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.mediaStatus === "READY"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {item.mediaStatus}
                      </span>
                    </td>

                    {/* Last Check / Error */}
                    <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {item.lastApiCheck ? (
                        new Date(item.lastApiCheck).toLocaleDateString()
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Notes & Policy Safeguards */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-400">
        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-purple-600" />
          Production Verification Rules Enforced:
        </div>
        <ul className="list-disc pl-5 space-y-1 text-[11px]">
          <li><strong>Zero Mocking:</strong> Connected status only reflects genuine database records with live encrypted OAuth credentials.</li>
          <li><strong>Direct Post Approvals:</strong> TikTok, YouTube, Meta, and Snapchat strictly declare required third-party verification audits without claiming premature production readiness.</li>
          <li><strong>Version Sunset Protection:</strong> LinkedIn uses active REST Posts API (202401) and Meta uses Graph API v20.0 with centralized version constants.</li>
          <li><strong>Admin-Safe Diagnostics:</strong> External tokens, client secrets, and decryption keys are strictly isolated on backend servers and never sent over the wire.</li>
        </ul>
      </div>
    </div>
  );
}
