"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, BarChart2, Heart, Users, FileText, TrendingUp, CheckCircle2 } from "lucide-react";

export interface MetricCardItem {
  id: string;
  title: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  icon: React.ElementType;
  sparklineType: "curve1" | "curve2" | "curve3" | "curve4" | "lineHorizontal" | "lineDiagonal";
}

interface MetricsRowProps {
  timeframe?: "7d" | "30d" | "90d" | "custom";
  summary?: {
    totalFollowers: number | null;
    totalImpressions: number;
    totalReach: number;
    totalEngagement: number;
    engagementRate: number;
    postsPublished: number;
    scheduledPosts: number;
    commentsCount: number;
    messagesCount: number;
    totalClicks: number;
    dataSource: string;
    isDataAvailable: boolean;
  } | null;
  isLoading?: boolean;
}

export function MetricsRow({ timeframe = "30d", summary, isLoading = false }: MetricsRowProps) {
  const formatNum = (val: number | null | undefined): string => {
    if (val === null || val === undefined || val === 0) return "0";
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  const metrics: MetricCardItem[] = [
    {
      id: "reach",
      title: "Total Reach",
      value: formatNum(summary?.totalReach),
      trend: summary?.totalReach && summary.totalReach > 0 ? "Live exposure" : "Real-time sync",
      trendPositive: Boolean(summary?.totalReach && summary.totalReach > 0),
      icon: Eye,
      sparklineType: "curve1",
    },
    {
      id: "impressions",
      title: "Total Impressions",
      value: formatNum(summary?.totalImpressions),
      trend: summary?.totalImpressions && summary.totalImpressions > 0 ? "Verified views" : "Real-time sync",
      trendPositive: Boolean(summary?.totalImpressions && summary.totalImpressions > 0),
      icon: BarChart2,
      sparklineType: "curve2",
    },
    {
      id: "engagement",
      title: "Total Engagement",
      value: formatNum(summary?.totalEngagement),
      trend: summary?.totalEngagement && summary.totalEngagement > 0 ? "Comments & likes" : "Real-time sync",
      trendPositive: Boolean(summary?.totalEngagement && summary.totalEngagement > 0),
      icon: Heart,
      sparklineType: "curve3",
    },
    {
      id: "rate",
      title: "Engagement Rate",
      value: `${(summary?.engagementRate ?? 0).toFixed(1)}%`,
      trend: summary?.engagementRate && summary.engagementRate > 0 ? "Verified rate" : "Real-time sync",
      trendPositive: Boolean(summary?.engagementRate && summary.engagementRate > 0),
      icon: BarChart2,
      sparklineType: "curve4",
    },
    {
      id: "followers",
      title: "Total Audience",
      value: formatNum(summary?.totalFollowers),
      trend: summary?.totalFollowers && summary.totalFollowers > 0 ? "Linked profiles" : "Channels linked",
      trendPositive: Boolean(summary?.totalFollowers && summary.totalFollowers > 0),
      icon: Users,
      sparklineType: "lineHorizontal",
    },
    {
      id: "posts",
      title: "Posts Published",
      value: `${summary?.postsPublished ?? 0}`,
      trend: summary?.postsPublished && summary.postsPublished > 0 ? "Active in DB" : "No posts yet",
      trendPositive: Boolean(summary?.postsPublished && summary.postsPublished > 0),
      icon: FileText,
      sparklineType: "lineDiagonal",
    },
  ];

  const renderSparkline = (type: MetricCardItem["sparklineType"], hasData: boolean) => {
    const strokeColor = hasData ? "#38BDF8" : "#94A3B8";
    const strokeOpacity = hasData ? "1" : "0.45";

    switch (type) {
      case "curve1":
        return (
          <svg className="w-16 h-8 overflow-visible" viewBox="0 0 64 24" fill="none">
            <path
              d="M 2 12 Q 10 18, 18 10 T 34 14 T 50 8 T 62 12"
              stroke={strokeColor}
              strokeOpacity={strokeOpacity}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "curve2":
        return (
          <svg className="w-16 h-8 overflow-visible" viewBox="0 0 64 24" fill="none">
            <path
              d="M 2 14 Q 12 6, 20 16 T 36 8 T 52 14 T 62 6"
              stroke={strokeColor}
              strokeOpacity={strokeOpacity}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "curve3":
        return (
          <svg className="w-16 h-8 overflow-visible" viewBox="0 0 64 24" fill="none">
            <path
              d="M 2 8 Q 12 16, 22 10 T 38 14 T 50 6 T 62 10"
              stroke={strokeColor}
              strokeOpacity={strokeOpacity}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "curve4":
        return (
          <svg className="w-16 h-8 overflow-visible" viewBox="0 0 64 24" fill="none">
            <path
              d="M 2 16 Q 10 8, 20 14 T 36 10 T 48 16 T 62 12"
              stroke={strokeColor}
              strokeOpacity={strokeOpacity}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "lineHorizontal":
        return (
          <svg className="w-16 h-8 overflow-visible" viewBox="0 0 64 24" fill="none">
            <line
              x1="6"
              y1="12"
              x2="58"
              y2="12"
              stroke={strokeColor}
              strokeOpacity={strokeOpacity}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        );
      case "lineDiagonal":
        return (
          <svg className="w-16 h-8 overflow-visible" viewBox="0 0 64 24" fill="none">
            <line
              x1="6"
              y1="18"
              x2="58"
              y2="6"
              stroke={strokeColor}
              strokeOpacity={strokeOpacity}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
      {metrics.map((item, idx) => {
        const IconComponent = item.icon;
        const hasRealNumber = item.value !== "0" && item.value !== "0.0%";

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: idx * 0.07,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 rounded-2xl p-4 sm:p-4.5 shadow-xs hover:border-[#E08738]/40 dark:hover:border-[#E08738]/50 transition-all flex flex-col justify-between group cursor-default"
          >
            {/* Top row: Icon + Sparkline */}
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/7 text-slate-400 dark:text-[#E08738] flex items-center justify-center shrink-0 group-hover:text-[#E08738] dark:group-hover:text-[#FBBF24] transition-colors">
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                {renderSparkline(item.sparklineType, hasRealNumber)}
              </div>
            </div>

            {/* Middle: Title & Big Value */}
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {item.title}
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {isLoading ? (
                  <span className="inline-block w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                ) : (
                  item.value
                )}
              </h2>
            </div>

            {/* Bottom: Real Telemetry Indicator */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px]">
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  hasRealNumber
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                {item.trend}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                · real telemetry
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default MetricsRow;
