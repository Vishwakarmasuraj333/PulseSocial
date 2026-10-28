"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Radio, ArrowUpRight } from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";

export interface PlatformReachItem {
  id: string;
  name: string;
  username?: string;
  profileImageUrl?: string;
  reach: number;
  reachFormatted: string;
  followers?: number;
  followersFormatted?: string;
  percentage: number;
  gradientClass?: string;
  solidColor?: string;
  status?: string;
}

interface PlatformReachChartProps {
  platforms?: PlatformReachItem[];
  isLoading?: boolean;
}

const getPlatformStyle = (id: string) => {
  const p = id.toLowerCase();
  if (p === "instagram") {
    return { gradientClass: "bg-gradient-to-r from-[#E1306C] via-[#FD1D1D] to-[#F77737]" };
  }
  if (p === "twitter" || p === "x") {
    return { solidColor: "#0EA5E9" };
  }
  if (p === "facebook") {
    return { solidColor: "#1877F2" };
  }
  if (p === "linkedin") {
    return { solidColor: "#0077B5" };
  }
  if (p === "tiktok") {
    return { solidColor: "#00F2FE" };
  }
  if (p === "youtube") {
    return { solidColor: "#FF0000" };
  }
  if (p === "pinterest") {
    return { solidColor: "#E60023" };
  }
  return { solidColor: "#5846A8" };
};

export function PlatformReachChart({ platforms = [], isLoading = false }: PlatformReachChartProps) {
  const maxVal = Math.max(...platforms.map((p) => p.reach), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/7 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#E08738]/30 transition-all flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Reach by Platform
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              {platforms.length} {platforms.length === 1 ? "Channel" : "Channels"} Linked
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audience exposure distribution strictly across your verified active channels
          </p>
        </div>

        <Link
          href="/social-accounts"
          className="text-xs font-semibold text-[#5846A8] dark:text-[#FBBF24] hover:underline flex items-center gap-1 shrink-0"
        >
          Manage
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : platforms.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center">
            <Radio className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              No Social Channels Linked Yet
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">
              Connect your YouTube, LinkedIn, X, Facebook, or Instagram to display real cross-platform reach telemetry.
            </p>
          </div>
          <Link
            href="/social-accounts?action=connect"
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Connect First Account
          </Link>
        </div>
      ) : (
        <div className="space-y-4 my-auto pt-1">
          {platforms.map((item, idx) => {
            const style = getPlatformStyle(item.id);
            const displayPercentage =
              maxVal > 0 ? Math.max(12, Math.round((item.reach / maxVal) * 100)) : 100;

            return (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-3 group">
                {/* Platform Label + Icon */}
                <div className="w-28 sm:w-36 flex items-center gap-2 shrink-0">
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    {renderPlatformIcon(item.id, 16)}
                  </span>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {item.name}
                    </span>
                    {item.username && item.username !== item.name && (
                      <span className="text-[10px] text-slate-400 block truncate">
                        @{item.username.replace(/^@/, "")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Horizontal Bar Track */}
                <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${displayPercentage}%` }}
                    transition={{
                      duration: 0.9,
                      delay: 0.2 + idx * 0.08,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      style.gradientClass ? style.gradientClass : ""
                    }`}
                    style={style.solidColor ? { backgroundColor: style.solidColor } : {}}
                  />
                </div>

                {/* Value badge */}
                <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 w-12 text-right shrink-0 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.reachFormatted}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom X-Axis Ticks dynamically scaled */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono font-medium text-slate-400 pl-28 sm:pl-36 pr-12">
        <span>0</span>
        <span>{maxVal >= 1000 ? `${(maxVal * 0.25 / 1000).toFixed(1)}K` : Math.round(maxVal * 0.25)}</span>
        <span>{maxVal >= 1000 ? `${(maxVal * 0.5 / 1000).toFixed(1)}K` : Math.round(maxVal * 0.5)}</span>
        <span>{maxVal >= 1000 ? `${(maxVal * 0.75 / 1000).toFixed(1)}K` : Math.round(maxVal * 0.75)}</span>
        <span>{maxVal >= 1000 ? `${(maxVal / 1000).toFixed(1)}K` : maxVal}</span>
      </div>
    </motion.div>
  );
}

export default PlatformReachChart;
