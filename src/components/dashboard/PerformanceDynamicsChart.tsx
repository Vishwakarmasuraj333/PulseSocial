"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  BarChart2,
  Activity,
  Layers,
  Sparkles,
  Plus,
  Eye,
  Users,
  MessageSquare,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Send,
} from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";

interface PerformanceDynamicsChartProps {
  dateRange: string;
}

export function PerformanceDynamicsChart({ dateRange }: PerformanceDynamicsChartProps) {
  const [activeMetric, setActiveMetric] = useState<"reach" | "followers" | "engagement" | "inbound">("reach");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();

    const handleThemeChange = (e: any) => {
      if (e?.detail?.resolved) {
        setIsDark(e.detail.resolved === "dark");
      } else {
        updateTheme();
      }
    };

    window.addEventListener("pulsesocial_theme_change", handleThemeChange);
    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("pulsesocial_theme_change", handleThemeChange);
      observer.disconnect();
    };
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`/api/analytics?platform=${selectedPlatform}`)
      .then((res) => res.json())
      .then((d) => {
        if (isMounted && d.summary) {
          setAnalyticsData(d);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPlatform, dateRange]);

  const summary = analyticsData?.summary || {
    totalFollowers: 0,
    totalReach: 0,
    totalEngagement: 0,
    engagementRate: 0,
    inbound: 0,
    commentsCount: 0,
    messagesCount: 0,
    isDataAvailable: false,
  };

  const hasAccounts = Array.isArray(analyticsData?.accounts) && analyticsData.accounts.length > 0;
  const primaryAccount = hasAccounts ? analyticsData.accounts[0] : null;
  const hasRealData = Boolean(summary.isDataAvailable);

  // Clean, professional metric cards with real data integration
  const metrics = [
    {
      id: "reach",
      label: "Reach & Impressions",
      icon: Eye,
      value: summary.totalReach > 0 ? summary.totalReach.toLocaleString() : summary.totalImpressions > 0 ? summary.totalImpressions.toLocaleString() : "0",
      status: summary.totalReach > 0 ? "Total unique reach" : "Awaiting first post broadcast",
      highlight: summary.totalReach > 0,
    },
    {
      id: "followers",
      label: "Audience & Profile",
      icon: Users,
      value: summary.totalFollowers && summary.totalFollowers > 0 ? summary.totalFollowers.toLocaleString() : hasAccounts ? (primaryAccount?.displayName || "Connected") : "0",
      status: hasAccounts ? `${(primaryAccount?.provider ? primaryAccount.provider.charAt(0).toUpperCase() + primaryAccount.provider.slice(1) : "LinkedIn")} Profile Active` : "No accounts linked",
      highlight: hasAccounts,
    },
    {
      id: "engagement",
      label: "Interactions & Clicks",
      icon: TrendingUp,
      value: `${(summary.engagementRate || 0).toFixed(1)}%`,
      status: summary.engagementRate > 0 ? "Average interaction rate" : "Tracking active upon publishing",
      highlight: summary.engagementRate > 0,
    },
    {
      id: "inbound",
      label: "Inbound Inquiries",
      icon: MessageSquare,
      value: String((summary.commentsCount || 0) + (summary.messagesCount || 0)),
      status: (summary.commentsCount || 0) + (summary.messagesCount || 0) > 0 ? "Comments & direct messages" : "Unified inbox synchronized",
      highlight: ((summary.commentsCount || 0) + (summary.messagesCount || 0)) > 0,
    },
  ];

  // Dynamically build filter chips only for connected providers
  const connectedProviders: string[] = hasAccounts
    ? Array.from(new Set<string>(analyticsData.accounts.map((a: any) => String(a.provider))))
    : [];

  const platforms: { id: string; label: string }[] = [
    { id: "all", label: "All Networks" },
    ...connectedProviders.map((p: string) => ({
      id: p,
      label: p.charAt(0).toUpperCase() + p.slice(1).replace(/_/g, " "),
    })),
  ];

  // Derive chart points strictly from real trends
  const trends = analyticsData?.trends;
  let chartData: any[] = [];

  if (hasAccounts && Array.isArray(trends) && trends.length > 0 && hasRealData) {
    chartData = trends.map((t: any) => ({
      date: t.date.slice(5),
      total: activeMetric === "reach" ? t.reach : activeMetric === "engagement" ? t.engagement : t.impressions,
      rate: summary.engagementRate,
      interactions: t.engagement,
      growth: 0,
      received: 0,
    }));
  }

  return (
    <div className="bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Top Header: Title, Live Status Badge & Chart Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/7 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Performance Dynamics
            </h2>
            <span className="text-[11px] font-semibold text-[#5846A8] dark:text-[#FBBF24] bg-purple-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-purple-200/60 dark:border-amber-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5846A8] dark:bg-[#E08738] animate-pulse" />
              Live Channel Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1">
            Real-time cross-platform reach, audience metrics, and engagement trajectory across verified channels.
          </p>
        </div>

        {/* Chart View Toggle: Area vs Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#111113] rounded-xl border border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartType === "area"
                  ? "bg-white dark:bg-[#1C1C20] text-[#5846A8] dark:text-[#FBBF24] shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-[#9CA3AF] dark:hover:text-white"
              }`}
              title="Area Curve View"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartType === "bar"
                  ? "bg-white dark:bg-[#1C1C20] text-[#5846A8] dark:text-[#FBBF24] shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-[#9CA3AF] dark:hover:text-white"
              }`}
              title="Bar Column View"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          const isSelected = activeMetric === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveMetric(m.id as any)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-xs ${
                isSelected
                  ? "border-[#5846A8] bg-purple-50 text-[#5846A8] ring-1 ring-purple-500/30 dark:border-[#E08738] dark:bg-amber-500/15 dark:text-[#FBBF24] dark:ring-[#E08738]/30 shadow-xs"
                  : "border-slate-200/80 dark:border-white/7 hover:border-purple-300 dark:hover:border-[#E08738]/40 hover:bg-purple-50/40 dark:hover:bg-white/5 bg-slate-50/70 dark:bg-[#111113]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9CA3AF] truncate">
                  {m.label}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected
                      ? "text-[#5846A8] dark:text-[#FBBF24]"
                      : "text-slate-400 dark:text-[#9CA3AF]"
                  }`}
                />
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {m.value}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-[#9CA3AF] font-medium mt-0.5 truncate">
                {m.status}
              </div>
            </button>
          );
        })}
      </div>

      {/* Platform Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-[#6B7280] mr-1">Filter by network:</span>
        {platforms.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedPlatform(p.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 hover:scale-[1.03] ${
              selectedPlatform === p.id
                ? "bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] font-bold shadow-xs"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9CA3AF] hover:bg-purple-50 hover:text-[#5846A8] dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            {p.id !== "all" && renderPlatformIcon(p.id, 14)}
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Main Chart Area or Connected Channel Performance Hub */}
      <div className="w-full min-h-[300px] pt-1">
        {chartData.length > 0 ? (
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDark ? "#E08738" : "#5846A8"} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={isDark ? "#E08738" : "#5846A8"} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-white/5" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1C1C20" : "#FFFFFF",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
                      borderRadius: "12px",
                      color: isDark ? "#FFFFFF" : "#0F172A",
                      fontSize: "12px",
                      boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.6)" : "0 10px 25px -5px rgba(88, 70, 168, 0.15)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name={activeMetric.toUpperCase()}
                    stroke={isDark ? "#E08738" : "#5846A8"}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#primaryGrad)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-white/5" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1C1C20" : "#FFFFFF",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
                      borderRadius: "12px",
                      color: isDark ? "#FFFFFF" : "#0F172A",
                      fontSize: "12px",
                      boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.6)" : "0 10px 25px -5px rgba(88, 70, 168, 0.15)",
                    }}
                  />
                  <Bar dataKey="total" fill={isDark ? "#E08738" : "#5846A8"} radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : hasAccounts ? (
          <div className="w-full p-6 sm:p-7 rounded-2xl border border-purple-500/20 dark:border-white/7 bg-gradient-to-b from-purple-500/5 via-white to-white dark:from-white/2 dark:via-[#17171A] dark:to-[#17171A] shadow-xs space-y-5">
            {/* Account Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/10 dark:border-white/7">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111113] shadow-md border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0">
                  {renderPlatformIcon(primaryAccount?.provider || "linkedin", 26)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {primaryAccount?.displayName || "Suraj Vishwakarma"}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Channel Live & Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-0.5">
                    {primaryAccount?.username || "LinkedIn Professional Channel"} &middot; Authorized for Posts, Images & Video Broadcasting
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/posts/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#4A3990] text-white dark:bg-[#E08738] dark:hover:bg-[#D97706] dark:text-[#0F0F11] text-xs font-bold transition shadow-md hover:shadow-purple-500/20 dark:hover:shadow-[0_0_16px_rgba(224,135,56,0.35)] cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast First Post</span>
                </Link>
              </div>
            </div>

            {/* Real-time Feature Readiness Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#111113] border border-slate-200/70 dark:border-white/7 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Direct Content Publishing</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF] leading-relaxed pl-6">
                  Compose text, high-res photos, and videos with native formatting. Posts publish directly to your feed.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#111113] border border-slate-200/70 dark:border-white/7 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Cloudinary Media CDN</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF] leading-relaxed pl-6">
                  Enterprise storage connected. All media uploads are securely hosted on global CDN without serverless disk limits.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#111113] border border-slate-200/70 dark:border-white/7 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Live Metrics Sync</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF] leading-relaxed pl-6">
                  Impressions, reactions, and engagement curves calculate automatically as your published content interacts with viewers.
                </p>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-[#9CA3AF]">
              <span className="text-[11px]">
                Tip: Schedule posts across multiple days to view cumulative audience growth trajectory over time.
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/social-accounts"
                  className="font-semibold text-[#5846A8] dark:text-[#FBBF24] hover:underline inline-flex items-center gap-1"
                >
                  <span>+ Connect More Channels</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-gradient-to-b from-slate-50/70 to-white dark:from-[#111113] dark:to-[#0D0D0E] shadow-2xs">
            <div className="w-13 h-13 rounded-2xl bg-purple-50 dark:bg-amber-500/10 text-[#5846A8] dark:text-[#FBBF24] border border-purple-200/60 dark:border-amber-500/30 flex items-center justify-center mb-3.5 shadow-sm">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Connect a Social Channel to See Real Data
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#9CA3AF] max-w-md mt-1.5 mb-5 leading-relaxed">
              No analytics stream is active. Link your LinkedIn, Facebook, Instagram, YouTube, or X channels to synchronize authentic performance metrics.
            </p>
            <Link
              href="/social-accounts"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5846A8] hover:bg-[#4A3990] text-white dark:bg-[#E08738] dark:hover:bg-[#D97706] dark:text-[#0F0F11] text-xs font-bold transition-all shadow-md hover:shadow-purple-500/20 dark:hover:shadow-[0_0_16px_rgba(224,135,56,0.35)] cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Connect Channel</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
