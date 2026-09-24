"use client";

import React, { useState } from "react";
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
  };

  const metrics = [
    {
      id: "reach",
      label: "Reach & Impressions",
      badge: summary.totalReach > 0 ? `${summary.totalReach.toLocaleString()} total` : "0 reach",
    },
    {
      id: "followers",
      label: "Audience Growth",
      badge: `${(summary.totalFollowers || 0).toLocaleString()} audience`,
    },
    {
      id: "engagement",
      label: "Interactions & Clicks",
      badge: `${summary.engagementRate || 0}% rate`,
    },
    {
      id: "inbound",
      label: "Inbound Inquiries",
      badge: `${(summary.commentsCount || 0) + (summary.messagesCount || 0)} inquiries`,
    },
  ];

  const platforms = [
    { id: "all", label: "All Networks" },
    { id: "instagram", label: "Instagram" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "x", label: "X" },
    { id: "facebook", label: "Facebook" },
  ];

  // Derive chart points from real trends or week baseline
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const trends = analyticsData?.trends;
  let data: any[] = [];

  if (Array.isArray(trends) && trends.length > 0) {
    data = trends.map((t: any) => ({
      date: t.date.slice(5),
      total: activeMetric === "reach" ? t.reach : activeMetric === "engagement" ? t.engagement : t.impressions,
      instagram: Math.floor(t.reach * 0.4),
      facebook: Math.floor(t.reach * 0.3),
      linkedin: Math.floor(t.reach * 0.2),
      x: Math.floor(t.reach * 0.1),
      rate: summary.engagementRate,
      interactions: t.engagement,
      growth: 0,
      received: 0,
      resolved: 0,
    }));
  } else {
    // Clean authentic baseline when no historical metric entries exist yet
    data = days.map((day) => ({
      date: day,
      total: summary.totalReach > 0 ? Math.round(summary.totalReach / 7) : 0,
      instagram: 0,
      facebook: 0,
      linkedin: 0,
      x: 0,
      rate: summary.engagementRate,
      interactions: 0,
      growth: 0,
      received: 0,
      resolved: 0,
    }));
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Top Header: Title, Metric Switcher & Chart Type */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Performance Dynamics
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              SE Ranking Visualizer
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated cross-platform visibility and trajectory over selected period
          </p>
        </div>

        {/* Chart View Toggle: Area vs Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartType === "area"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Area Curve"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartType === "bar"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Bar Columns"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {metrics.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMetric(m.id as any)}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              activeMetric === m.id
                ? "border-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs"
                : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-850/40"
            }`}
          >
            <span
              className={`text-xs font-bold block ${
                activeMetric === m.id
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {m.label}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 inline-block">
              {m.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Platform Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-400 mr-1">Filter by network:</span>
        {platforms.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedPlatform(p.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              selectedPlatform === p.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-semibold"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750"
            }`}
          >
            {p.id !== "all" && renderPlatformIcon(p.id, 14)}
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="secondaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey={activeMetric === "reach" ? "total" : activeMetric === "followers" ? "total" : activeMetric === "engagement" ? "interactions" : "received"}
                name={activeMetric.toUpperCase()}
                stroke="#6366F1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#primaryGrad)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey={activeMetric === "reach" ? "total" : activeMetric === "followers" ? "growth" : activeMetric === "engagement" ? "interactions" : "received"}
                fill="#6366F1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
