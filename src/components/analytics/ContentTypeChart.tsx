"use client";

import React from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { Layers, Plus } from "lucide-react";

export interface ContentTypeItem {
  type: string;
  reach: number;
  engagementRate: string;
  postsCount: number;
  percentage?: number;
  color: string;
}

interface ContentTypeChartProps {
  contentTypes?: ContentTypeItem[];
  totalPosts?: number;
  isLoading?: boolean;
}

export function ContentTypeChart({
  contentTypes = [],
  totalPosts = 0,
  isLoading = false,
}: ContentTypeChartProps) {
  const formatYAxis = (val: number) => {
    if (val === 0) return "0";
    if (val >= 1000) return `${val / 1000}K`;
    return val.toString();
  };

  const hasAnyPosts =
    totalPosts > 0 || contentTypes.some((ct) => ct.postsCount > 0);

  const maxY = Math.max(
    ...contentTypes.map((c) => c.reach || c.postsCount),
    10
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/7 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#E08738]/30 transition-all flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Content Type Performance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real distribution and reach generated per media format
          </p>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
          {totalPosts} {totalPosts === 1 ? "Post" : "Posts"} Total
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#5846A8] dark:border-[#E08738] border-t-transparent animate-spin" />
        </div>
      ) : !hasAnyPosts ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center">
            <Layers className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              No Published Content Yet
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">
              Publish videos, carousels, single images, or text updates from the composer to see format performance analytics.
            </p>
          </div>
          <Link
            href="/posts"
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create First Post
          </Link>
        </div>
      ) : (
        <>
          {/* Vertical Bar Chart Canvas */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contentTypes}
                margin={{ top: 10, right: 10, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#94A3B8"
                  strokeOpacity={0.15}
                />

                <XAxis
                  dataKey="type"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }}
                  dy={8}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }}
                  tickFormatter={formatYAxis}
                  domain={[0, maxY]}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as ContentTypeItem;
                      return (
                        <div className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">{d.type}</p>
                          <p className="text-slate-500">
                            Total Reach:{" "}
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {d.reach.toLocaleString()}
                            </span>
                          </p>
                          <p className="text-slate-500">
                            Avg Engagement Rate:{" "}
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {d.engagementRate}
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Based on {d.postsCount} published {d.postsCount === 1 ? "post" : "posts"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Bar
                  dataKey="postsCount"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                  isAnimationActive={true}
                  animationDuration={850}
                >
                  {contentTypes.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Format summary footer pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            {contentTypes.map((item) => (
              <div
                key={item.type}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
              >
                <span className="text-slate-600 dark:text-slate-400 truncate font-medium">
                  {item.type} ({item.postsCount})
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono ml-1">
                  {item.engagementRate}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default ContentTypeChart;
