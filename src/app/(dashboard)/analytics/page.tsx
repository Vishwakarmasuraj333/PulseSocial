"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { analyticsService, AnalyticsData } from "@/lib/services";
import { useToast } from "@/components/ui/toast";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  MousePointerClick,
  MessageCircle,
  FileSpreadsheet,
  FileText,
  Filter,
} from "lucide-react";

export default function AnalyticsPage() {
  const { toast } = useToast();

  const [platform, setPlatform] = useState("all");
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      analyticsService.getMetrics(timeframe),
      fetch("/api/social/providers").then((r) => (r.ok ? r.json() : null)),
    ]).then(([res, provRes]) => {
      setData(res);
      if (provRes?.providers) {
        setConnectedProviders(provRes.providers.filter((p: any) => p.isConnected));
      }
      setIsLoading(false);
    });
  }, [timeframe, platform]);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Platform,Metric,Value\n" +
      `${platform},Followers,${data?.totalFollowers || 0}\n` +
      `${platform},EngagementRate,${data?.engagementRate || 0}%\n` +
      `${platform},Reach,${data?.totalReach || 0}\n` +
      `${platform},Impressions,${data?.totalImpressions || 0}\n` +
      `${platform},Clicks,${data?.totalClicks || 0}\n` +
      `${platform},Likes,${data?.totalLikes || 0}\n` +
      `${platform},Comments,${data?.totalComments || 0}\n` +
      `${platform},Shares,${data?.totalShares || 0}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pulsesocial_analytics_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    toast({
      title: "Export Completed",
      message: "CSV report downloaded to your device.",
      type: "success",
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Social Analytics & Insights
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cross-network growth intelligence, follower reach, engagement rate, and campaign ROI.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export buttons */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#5846A8]" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Empty State Banner if no channels connected */}
        {connectedProviders.length === 0 && (
          <div className="p-5 rounded-2xl bg-[#f5f3ff] dark:bg-purple-950/20 border border-[#ede9fe] dark:border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No analytics data available yet.
              </h3>
              <p className="text-xs text-slate-500">
                Connect your social accounts to view live metrics, authentic reach, and cross-channel performance.
              </p>
            </div>
            <Link
              href="/connections"
              className="px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white text-xs font-semibold shadow-xs shadow-purple-900/15 transition w-fit shrink-0 cursor-pointer"
            >
              Connect a social account
            </Link>
          </div>
        )}

        {/* Filters Bar: Platform & Timeframe */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          {/* Platform chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Platforms" },
              { id: "instagram", label: "Instagram" },
              { id: "facebook", label: "Facebook" },
              { id: "linkedin", label: "LinkedIn" },
              { id: "x", label: "X (Twitter)" },
              { id: "tiktok", label: "TikTok" },
              { id: "youtube", label: "YouTube" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                  platform === p.id
                    ? "bg-[#5846A8] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 text-xs">
            {(["7d", "30d", "90d"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 font-semibold rounded-md transition cursor-pointer ${
                  timeframe === t
                    ? "bg-[#f5f3ff] dark:bg-purple-950/60 text-[#5846A8] dark:text-purple-300 font-bold"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 8 KPI CARDS (Section 19)                                     */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* 1. Followers */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Followers</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.totalFollowers ? data.totalFollowers.toLocaleString() : "0"}
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold mt-0.5 block">
              +{data?.followerGrowth || 0}% this period
            </span>
          </div>

          {/* 2. Engagement Rate */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Engagement Rate</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.engagementRate ? `${data.engagementRate}%` : "0.0%"}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Industry benchmark: 3.2%</span>
          </div>

          {/* 3. Reach */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Total Reach</span>
              <Share2 className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.totalReach ? data.totalReach.toLocaleString() : "0"}
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold mt-0.5 block">Unique accounts seen</span>
          </div>

          {/* 4. Impressions */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Impressions</span>
              <Eye className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.totalImpressions ? data.totalImpressions.toLocaleString() : "0"}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Total view count</span>
          </div>

          {/* 5. Clicks */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Link Clicks</span>
              <MousePointerClick className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.totalClicks ? data.totalClicks.toLocaleString() : "0"}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Outbound traffic</span>
          </div>

          {/* 6. Likes */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Likes</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.totalLikes ? data.totalLikes.toLocaleString() : "0"}
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold mt-0.5 block">Positive sentiment</span>
          </div>

          {/* 7. Comments */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Comments</span>
              <MessageCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.totalComments ? data.totalComments.toLocaleString() : "0"}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Conversations started</span>
          </div>

          {/* 8. Shares */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Shares & Retweets</span>
              <Share2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.totalShares ? data.totalShares.toLocaleString() : "0"}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Viral distribution</span>
          </div>
        </div>

        {/* Charts & Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Follower Growth & Engagement Trajectory
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Track multi-platform trajectory over the last {timeframe}.
            </p>

            {/* SVG Visual Chart or Clean Empty State */}
            {data?.chartData && data.chartData.length > 0 ? (
              <div className="w-full h-64 relative flex items-end justify-between border-b border-slate-100 dark:border-slate-800">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5846A8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#5846A8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 160 Q 100 130 200 110 T 400 60 T 600 25 L 600 200 L 0 200 Z"
                    fill="url(#growthGrad)"
                  />
                  <path
                    d="M 0 160 Q 100 130 200 110 T 400 60 T 600 25"
                    fill="none"
                    stroke="#5846A8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                <BarChart3 className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No trajectory metrics recorded</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                  Historical trajectory curves will render as real performance snapshots are gathered from your connected channels.
                </p>
              </div>
            )}
          </div>

          {/* Platform Performance Comparison */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Platform Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Audience share by connected social channel
            </p>

            {connectedProviders.length > 0 ? (
              <div className="space-y-4">
                {connectedProviders.map((item) => {
                  const share = Math.round(100 / connectedProviders.length);
                  return (
                    <div key={item.platform}>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300 capitalize">{item.displayName || item.name}</span>
                        <span className="text-slate-500">{share}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#5846A8]"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No connected channels</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  Connect your social accounts to view authentic channel audience distribution.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
