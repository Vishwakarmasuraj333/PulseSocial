"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, BarChart2, Heart, Users, FileText, TrendingUp } from "lucide-react";

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
}

export function MetricsRow({ timeframe = "30d" }: MetricsRowProps) {
  const metrics: MetricCardItem[] = [
    {
      id: "reach",
      title: "Total Reach",
      value: timeframe === "7d" ? "42.8K" : timeframe === "90d" ? "512.4K" : "166.9K",
      trend: "+4.2% vs last period",
      trendPositive: true,
      icon: Eye,
      sparklineType: "curve1",
    },
    {
      id: "impressions",
      title: "Total Impressions",
      value: timeframe === "7d" ? "98.5K" : timeframe === "90d" ? "1.2M" : "400.8K",
      trend: "+5.8% vs last period",
      trendPositive: true,
      icon: BarChart2,
      sparklineType: "curve2",
    },
    {
      id: "engagement",
      title: "Total Engagement",
      value: timeframe === "7d" ? "8.9K" : timeframe === "90d" ? "114.2K" : "37.0K",
      trend: "+3.1% vs last period",
      trendPositive: true,
      icon: Heart,
      sparklineType: "curve3",
    },
    {
      id: "rate",
      title: "Engagement Rate",
      value: "4.3%",
      trend: "+0.8% vs last period",
      trendPositive: true,
      icon: BarChart2,
      sparklineType: "curve4",
    },
    {
      id: "followers",
      title: "New Followers",
      value: timeframe === "7d" ? "620" : timeframe === "90d" ? "7.8K" : "2.4K",
      trend: "+6.2% vs last period",
      trendPositive: true,
      icon: Users,
      sparklineType: "lineHorizontal",
    },
    {
      id: "posts",
      title: "Posts Published",
      value: timeframe === "7d" ? "12" : timeframe === "90d" ? "108" : "35",
      trend: "+2.5% vs last period",
      trendPositive: true,
      icon: FileText,
      sparklineType: "lineDiagonal",
    },
  ];

  // Render authentic SVG mini sparklines matching reference screenshot
  const renderSparkline = (type: MetricCardItem["sparklineType"]) => {
    switch (type) {
      case "curve1":
        return (
          <svg className="w-16 h-8 overflow-visible" viewBox="0 0 64 24" fill="none">
            <path
              d="M 2 12 Q 10 18, 18 10 T 34 14 T 50 8 T 62 12"
              stroke="#38BDF8"
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
              stroke="#38BDF8"
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
              stroke="#38BDF8"
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
              stroke="#38BDF8"
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
              stroke="#38BDF8"
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
              stroke="#38BDF8"
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
                {renderSparkline(item.sparklineType)}
              </div>
            </div>

            {/* Middle: Title & Big Value */}
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {item.title}
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {item.value}
              </h2>
            </div>

            {/* Bottom: Trend Indicator */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px]">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                {item.trend.split(" ")[0]}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                vs last period
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default MetricsRow;
