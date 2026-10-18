"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { analyticsService, AnalyticsData } from "@/lib/services";
import { useToast } from "@/components/ui/toast";
import {
  MetricsRow,
} from "@/components/analytics/MetricsRow";
import {
  EngagementAreaChart,
} from "@/components/analytics/EngagementAreaChart";
import {
  PlatformReachChart,
} from "@/components/analytics/PlatformReachChart";
import {
  ContentTypeChart,
} from "@/components/analytics/ContentTypeChart";
import {
  TopPostsList,
} from "@/components/analytics/TopPostsList";
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  Sparkles,
  Share2,
} from "lucide-react";

export type AnalyticsTimeframe = "7d" | "30d" | "90d" | "custom";

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      analyticsService.getMetrics(timeframe === "custom" ? "30d" : timeframe),
      fetch("/api/social/providers").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/social/accounts").then((r) => (r.ok ? r.json() : null)),
    ]).then(([res, provRes, accRes]) => {
      setData(res);
      let connectedList: any[] = [];
      if (provRes?.providers) {
        connectedList = provRes.providers.filter((p: any) => p.isConnected);
      }
      if (connectedList.length === 0 && accRes?.accounts) {
        connectedList = accRes.accounts;
      }
      setConnectedProviders(connectedList);
      setIsLoading(false);
    });
  }, [timeframe]);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Timeframe,TotalReach,TotalImpressions,TotalEngagement,EngagementRate,NewFollowers,PostsPublished\n" +
      `${timeframe},166900,400800,37000,4.3%,2400,35\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pulsesocial_analytics_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    toast({
      title: "Export Completed",
      message: "Analytics CSV report downloaded to your device.",
      type: "success",
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="bg-slate-50 dark:bg-[#0D0D0E] min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-7 font-sans text-slate-800 dark:text-[#9CA3AF]">
        
        {/* ========================================================== */}
        {/* TOP HEADER BAR MATCHING SCREENSHOT 3 EXACTLY               */}
        {/* ========================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Analytics
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#5846A8] dark:bg-amber-500/15 dark:text-[#FBBF24] border border-purple-100 dark:border-[#E08738]/30">
                <Sparkles className="w-3 h-3" />
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
              .
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

            {/* Quick Export Actions */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#17171A] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-white flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Download CSV report"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-[#FBBF24]" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* SECTION 1: TOP METRIC KPI ROW (6 CARDS)                    */}
        {/* ========================================================== */}
        <MetricsRow timeframe={timeframe} />

        {/* ========================================================== */}
        {/* SECTION 2: MID SECTION CHARTS (DUAL SPLIT GRID)            */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Left Widget: Engagement Over Time Spline Area Chart */}
          <EngagementAreaChart />

          {/* Right Widget: Reach by Platform Horizontal Bar Chart */}
          <PlatformReachChart />
        </div>

        {/* ========================================================== */}
        {/* SECTION 3: BOTTOM GRID WIDGETS (DUAL SPLIT GRID)           */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Bottom Left: Content Type Performance Vertical Bar Chart */}
          <ContentTypeChart />

          {/* Bottom Right: Top Performing Posts Cards */}
          <TopPostsList />
        </div>

      </div>
    </AppLayout>
  );
}
