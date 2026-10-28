"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { analyticsService, AnalyticsData } from "@/lib/services";
import { useToast } from "@/components/ui/toast";
import { MetricsRow } from "@/components/analytics/MetricsRow";
import { EngagementAreaChart } from "@/components/analytics/EngagementAreaChart";
import { PlatformReachChart } from "@/components/analytics/PlatformReachChart";
import { ContentTypeChart } from "@/components/analytics/ContentTypeChart";
import { TopPostsList } from "@/components/analytics/TopPostsList";
import {
  FileSpreadsheet,
  Sparkles,
  RefreshCw,
  Plus,
  Radio,
} from "lucide-react";

export type AnalyticsTimeframe = "7d" | "30d" | "90d" | "custom";
export type AnalyticsTab = "overview" | "posts" | "audience" | "engagement";

export default function AnalyticsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const getInitialTab = (): AnalyticsTab => {
    const tabParam = (searchParams.get("tab") || "").toLowerCase();
    if (tabParam === "posts") return "posts";
    if (tabParam === "audience") return "audience";
    if (tabParam === "engagement") return "engagement";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<AnalyticsTab>(getInitialTab());
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = (searchParams.get("tab") || "").toLowerCase();
    if (tabParam === "posts") setActiveTab("posts");
    else if (tabParam === "audience") setActiveTab("audience");
    else if (tabParam === "engagement") setActiveTab("engagement");
    else setActiveTab("overview");
  }, [searchParams]);

  const handleTabChange = (t: AnalyticsTab) => {
    setActiveTab(t);
    const url = t === "overview" ? "/analytics" : `/analytics?tab=${t}`;
    router.push(url, { scroll: false });
  };

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await analyticsService.getMetrics(timeframe === "custom" ? "30d" : timeframe);
      setData(res);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const handleExportCSV = () => {
    const reach = data?.summary?.totalReach ?? 0;
    const impressions = data?.summary?.totalImpressions ?? 0;
    const engagement = data?.summary?.totalEngagement ?? 0;
    const rate = `${(data?.summary?.engagementRate ?? 0).toFixed(1)}%`;
    const followers = data?.summary?.totalFollowers ?? 0;
    const posts = data?.summary?.postsPublished ?? 0;

    const csvContent =
      "data:text/csv;charset=utf-8,Timeframe,TotalReach,TotalImpressions,TotalEngagement,EngagementRate,TotalAudience,PostsPublished\n" +
      `${timeframe},${reach},${impressions},${engagement},${rate},${followers},${posts}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pulsesocial_analytics_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    toast({
      title: "Export Completed",
      message: `Analytics report for ${timeframe} downloaded with real telemetry.`,
      type: "success",
    });
  };

  return (
    <AppLayout>
      <div className="bg-slate-50 dark:bg-[#0D0D0E] min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-7 font-sans text-slate-800 dark:text-[#9CA3AF]">
        
        {/* ========================================================== */}
        {/* TOP HEADER BAR WITH LIVE TELEMETRY STATUS                  */}
        {/* ========================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Analytics
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#5846A8] dark:bg-amber-500/15 dark:text-[#FBBF24] border border-purple-100 dark:border-[#E08738]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5846A8] dark:bg-[#FBBF24] animate-pulse" />
                Real-Time Telemetry
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#6B7280] mt-1">
              Cross-platform performance overview for the last{" "}
              {timeframe === "7d"
                ? "7 days"
                : timeframe === "90d"
                ? "90 days"
                : timeframe === "custom"
                ? "custom range"
                : "30 days"}
              {" · "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {data?.platforms?.length ?? 0}{" "}
                {data?.platforms?.length === 1 ? "Channel" : "Channels"} Linked
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Time Filter Pill Buttons */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#17171A] border border-slate-200/80 dark:border-white/7 shadow-2xs">
              {(["7d", "30d", "90d", "custom"] as const).map((t) => {
                const isActive = timeframe === t;
                const label = t === "custom" ? "Custom" : t;

                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isActive
                        ? "bg-white text-slate-900 dark:bg-amber-500/15 dark:text-[#FBBF24] border-transparent dark:border-[#E08738]/30 shadow-xs"
                        : "text-slate-500 dark:text-[#9CA3AF] border-transparent hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Reload button */}
            <button
              type="button"
              onClick={loadAnalytics}
              disabled={isLoading}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#17171A] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-white flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
              title="Refresh Analytics Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#E08738]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Quick Export Actions */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#17171A] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-white flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Download CSV report with real metrics"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-[#FBBF24]" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* View Category Subtabs (Overview, Posts, Audience, Engagement) */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
          {[
            { id: "overview", label: "Overview" },
            { id: "posts", label: "Post Analytics" },
            { id: "audience", label: "Audience & Channels" },
            { id: "engagement", label: "Engagement Telemetry" },
          ].map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as AnalyticsTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isTabActive
                    ? "bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================== */}
        {/* SECTION 1: TOP METRIC KPI ROW (REAL DB COUNTS)             */}
        {/* ========================================================== */}
        {(activeTab === "overview" || activeTab === "audience") && (
          <MetricsRow
            timeframe={timeframe}
            summary={data?.summary}
            isLoading={isLoading}
          />
        )}

        {/* ========================================================== */}
        {/* SECTION 2: CHARTS (ENGAGEMENT & PLATFORM REACH)            */}
        {/* ========================================================== */}
        {(activeTab === "overview" || activeTab === "engagement" || activeTab === "audience") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Left Widget: Engagement Over Time Spline Area Chart */}
            {(activeTab === "overview" || activeTab === "engagement") && (
              <EngagementAreaChart
                data={data?.engagementBreakdown}
                totalEngagement={data?.summary?.totalEngagement ?? 0}
                isLoading={isLoading}
              />
            )}

            {/* Right Widget: Reach by Platform Horizontal Bar Chart */}
            {(activeTab === "overview" || activeTab === "audience") && (
              <PlatformReachChart
                platforms={data?.platforms}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* SECTION 3: BOTTOM GRID (CONTENT TYPES & TOP POSTS)         */}
        {/* ========================================================== */}
        {(activeTab === "overview" || activeTab === "posts") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Bottom Left: Content Type Performance Vertical Bar Chart */}
            <ContentTypeChart
              contentTypes={data?.contentTypes}
              totalPosts={data?.summary?.postsPublished ?? 0}
              isLoading={isLoading}
            />

            {/* Bottom Right: Top Performing Posts Cards */}
            <TopPostsList
              posts={data?.topPosts}
              isLoading={isLoading}
            />
          </div>
        )}

      </div>
    </AppLayout>
  );
}
