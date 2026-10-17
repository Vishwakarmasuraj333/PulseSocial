"use client";

import React from "react";
import { motion } from "framer-motion";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";

export interface PlatformReachItem {
  id: string;
  name: string;
  reach: number;
  reachFormatted: string;
  percentage: number;
  gradientClass?: string;
  solidColor?: string;
}

const PLATFORM_REACH_DATA: PlatformReachItem[] = [
  {
    id: "instagram",
    name: "Instagram",
    reach: 31200,
    reachFormatted: "31.2K",
    percentage: 97.5, // vs 32K max
    gradientClass: "bg-gradient-to-r from-[#E1306C] via-[#FD1D1D] to-[#F77737]",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    reach: 25400,
    reachFormatted: "25.4K",
    percentage: 79.3,
    solidColor: "#0EA5E9",
  },
  {
    id: "facebook",
    name: "Facebook",
    reach: 31800,
    reachFormatted: "31.8K",
    percentage: 99.3,
    solidColor: "#1877F2",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    reach: 29100,
    reachFormatted: "29.1K",
    percentage: 90.9,
    solidColor: "#0077B5",
  },
  {
    id: "tiktok",
    name: "TikTok",
    reach: 28000,
    reachFormatted: "28.0K",
    percentage: 87.5,
    solidColor: "#00F2FE",
  },
  {
    id: "youtube",
    name: "YouTube",
    reach: 24300,
    reachFormatted: "24.3K",
    percentage: 75.9,
    solidColor: "#FF0000",
  },
];

export function PlatformReachChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/7 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#E08738]/30 transition-all flex flex-col justify-between"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Reach by Platform
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Audience exposure distribution across active connected channels
        </p>
      </div>

      {/* Horizontal Rounded Pill Bars List */}
      <div className="space-y-4 my-auto pt-1">
        {PLATFORM_REACH_DATA.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-3 group">
            {/* Platform Label + Icon */}
            <div className="w-24 sm:w-28 flex items-center gap-2 shrink-0">
              <span className="w-4 h-4 flex items-center justify-center shrink-0">
                {renderPlatformIcon(item.id, 16)}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                {item.name}
              </span>
            </div>

            {/* Horizontal Bar Track */}
            <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{
                  duration: 0.9,
                  delay: 0.35 + idx * 0.08,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className={`h-full rounded-full transition-all duration-300 ${
                  item.gradientClass ? item.gradientClass : ""
                }`}
                style={item.solidColor ? { backgroundColor: item.solidColor } : {}}
              />
            </div>

            {/* Value tooltip badge */}
            <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 w-10 text-right shrink-0 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              {item.reachFormatted}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom X-Axis Ticks (0, 8K, 16K, 24K, 32K matching screenshot) */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono font-medium text-slate-400 pl-28 sm:pl-32 pr-10">
        <span>0</span>
        <span>8K</span>
        <span>16K</span>
        <span>24K</span>
        <span>32K</span>
      </div>
    </motion.div>
  );
}

export default PlatformReachChart;
