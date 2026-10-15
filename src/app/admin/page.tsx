"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Share2,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Database,
  MessageSquare,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface OverviewData {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    newUsersLast30Days: number;
    totalOrgs: number;
    totalMemberships: number;
    totalAccounts: number;
    connectedAccounts: number;
    totalPosts: number;
    publishedPosts: number;
    scheduledPosts: number;
    draftPosts: number;
    failedPosts: number;
    publishingSuccessRate: number;
    pendingFeedback: number;
    pendingContact: number;
    dbLatencyMs: number;
  };
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
    status: string;
    createdAt: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    resourceType: string;
    resourceId: string | null;
    createdAt: string;
    user: { name: string | null; email: string } | null;
  }>;
  recentPosts: Array<{
    id: string;
    content: string;
    status: string;
    createdAt: string;
    creator: { name: string | null; email: string };
  }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/overview");
      if (!res.ok) {
        throw new Error(`Failed to load admin overview (HTTP ${res.status})`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#6F52B5]" />
        <p className="text-xs text-slate-500 font-medium">Aggregating live administrative data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 max-w-xl mx-auto my-12 text-center">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">Admin Authorization Error</h3>
        <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{error || "Unable to access console."}</p>
        <button
          onClick={fetchOverview}
          className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics, recentUsers, recentAuditLogs, recentPosts } = data;

  const statCards = [
    {
      label: "Registered Users",
      value: metrics.totalUsers,
      subtext: `${metrics.activeUsers} active • ${metrics.suspendedUsers} suspended`,
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Workspaces",
      value: metrics.totalOrgs,
      subtext: `${metrics.totalMemberships} total team memberships`,
      icon: Building2,
      href: "/admin/organizations",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
    },
    {
      label: "Social Channels",
      value: metrics.totalAccounts,
      subtext: `${metrics.connectedAccounts} connected & active`,
      icon: Share2,
      href: "/admin/social-accounts",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Posts Orchestrated",
      value: metrics.totalPosts,
      subtext: `${metrics.publishingSuccessRate}% publishing success rate`,
      icon: FileText,
      href: "/admin/posts",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      label: "Database Ping",
      value: `${metrics.dbLatencyMs}ms`,
      subtext: "PostgreSQL read/write latency",
      icon: Database,
      href: "/admin/system-health",
      color: metrics.dbLatencyMs < 200 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Triage Queue",
      value: metrics.pendingFeedback + metrics.pendingContact,
      subtext: `${metrics.pendingFeedback} feedback • ${metrics.pendingContact} inquiries`,
      icon: MessageSquare,
      href: "/admin/feedback",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time infrastructure health, user access controls, and multi-tenant performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOverview}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-[#6F52B5]/50 dark:hover:border-purple-500/50 transition-all shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </div>
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 flex items-center justify-between">
                  <span>{card.subtext}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#6F52B5]" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Publishing Health & Distribution Breakdown */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Post Publishing Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status across all scheduled and published posts
            </p>
          </div>
          <Link
            href="/admin/posts"
            className="text-xs font-semibold text-[#6F52B5] dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>View All Posts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Published</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {metrics.publishedPosts}
            </div>
            <span className="text-[10px] text-slate-400">Live across networks</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduled</span>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
              {metrics.scheduledPosts}
            </div>
            <span className="text-[10px] text-slate-400">Pending queue execution</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Drafts</span>
            <div className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-1">
              {metrics.draftPosts}
            </div>
            <span className="text-[10px] text-slate-400">Unpublished workspace drafts</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Failed</span>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
              {metrics.failedPosts}
            </div>
            <span className="text-[10px] text-slate-400">Requires retry or token fix</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Users & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Users</h3>
                <p className="text-xs text-slate-400">Newest accounts registered in database</p>
              </div>
              <Link
                href="/admin/users"
                className="text-xs font-semibold text-[#6F52B5] dark:text-purple-400 hover:underline"
              >
                Manage Users
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentUsers.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No registered users found.</p>
              ) : (
                recentUsers.map((u) => (
                  <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {u.name || u.email.split("@")[0]}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate font-mono">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Administrative Audit Trail */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Trail</h3>
                <p className="text-xs text-slate-400">Real security and administrative operations</p>
              </div>
              <Link
                href="/admin/audit-logs"
                className="text-xs font-semibold text-[#6F52B5] dark:text-purple-400 hover:underline"
              >
                All Logs
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentAuditLogs.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No audit events recorded yet.</p>
              ) : (
                recentAuditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                          {log.resourceType}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        By {log.user?.email || "System"}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
