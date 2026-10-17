"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

export interface EngagementDataPoint {
  date: string;
  comments: number;
  likes: number;
  saves: number;
  shares: number;
}

const ENGAGEMENT_DATA: EngagementDataPoint[] = [
  { date: "Jul 14", comments: 2400, likes: 2200, saves: 3800, shares: 2700 },
  { date: "Jul 15", comments: 750, likes: 450, saves: 980, shares: 700 },
  { date: "Jul 18", comments: 900, likes: 720, saves: 1300, shares: 950 },
  { date: "Jul 20", comments: 1350, likes: 1100, saves: 1850, shares: 1720 },
  { date: "Jul 21", comments: 1420, likes: 1380, saves: 1820, shares: 1800 },
  { date: "Jul 26", comments: 880, likes: 780, saves: 1180, shares: 1020 },
  { date: "Jul 29", comments: 1600, likes: 1540, saves: 2180, shares: 1950 },
  { date: "Aug 2", comments: 500, likes: 420, saves: 650, shares: 580 },
];

export function EngagementAreaChart() {
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const formatYAxis = (val: number) => {
    if (val === 0) return "0";
    if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
    return val.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/7 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#E08738]/30 transition-all flex flex-col justify-between"
    >
      {/* Header with Title and Custom Interactive Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Engagement Over Time
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactions trajectory broken down by reaction category
          </p>
        </div>

        {/* Legend Pills matching Screenshot 3 */}
        <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
          <button
            type="button"
            onClick={() => setActiveMetric(activeMetric === "comments" ? null : "comments")}
            className={`flex items-center gap-1.5 transition cursor-pointer ${
              activeMetric && activeMetric !== "comments" ? "opacity-35" : "opacity-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#FB923C]" />
            <span className="text-slate-600 dark:text-slate-300">comments</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric(activeMetric === "likes" ? null : "likes")}
            className={`flex items-center gap-1.5 transition cursor-pointer ${
              activeMetric && activeMetric !== "likes" ? "opacity-35" : "opacity-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <span className="text-slate-600 dark:text-slate-300">likes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric(activeMetric === "saves" ? null : "saves")}
            className={`flex items-center gap-1.5 transition cursor-pointer ${
              activeMetric && activeMetric !== "saves" ? "opacity-35" : "opacity-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
            <span className="text-slate-600 dark:text-slate-300">saves</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric(activeMetric === "shares" ? null : "shares")}
            className={`flex items-center gap-1.5 transition cursor-pointer ${
              activeMetric && activeMetric !== "shares" ? "opacity-35" : "opacity-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-slate-600 dark:text-slate-300">shares</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={ENGAGEMENT_DATA}
            margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
          >
            <defs>
              {/* Comments Gradient (Orange) */}
              <linearGradient id="gradComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FB923C" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#FB923C" stopOpacity={0.0} />
              </linearGradient>

              {/* Likes Gradient (Blue) */}
              <linearGradient id="gradLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>

              {/* Saves Gradient (Purple) */}
              <linearGradient id="gradSaves" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
              </linearGradient>

              {/* Shares Gradient (Emerald) */}
              <linearGradient id="gradShares" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#94A3B8"
              strokeOpacity={0.15}
            />

            <XAxis
              dataKey="date"
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
              domain={[0, 3600]}
              ticks={[0, 900, 1800, 2700, 3600]}
            />

            {/* Glassmorphism Interactive Crosshair Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xl text-xs space-y-1.5 z-50">
                      <p className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1">
                        {label}
                      </p>
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <span
                            className="font-semibold flex items-center gap-1.5"
                            style={{ color: entry.color }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}:
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {Number(entry.value).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Saves Area (Top Purple Curve) */}
            <Area
              type="monotone"
              dataKey="saves"
              name="saves"
              stroke="#A855F7"
              strokeWidth={2.4}
              fill="url(#gradSaves)"
              fillOpacity={activeMetric && activeMetric !== "saves" ? 0.05 : 1}
              strokeOpacity={activeMetric && activeMetric !== "saves" ? 0.2 : 1}
              isAnimationActive={true}
              animationDuration={900}
            />

            {/* Shares Area (Green Curve) */}
            <Area
              type="monotone"
              dataKey="shares"
              name="shares"
              stroke="#10B981"
              strokeWidth={2.4}
              fill="url(#gradShares)"
              fillOpacity={activeMetric && activeMetric !== "shares" ? 0.05 : 1}
              strokeOpacity={activeMetric && activeMetric !== "shares" ? 0.2 : 1}
              isAnimationActive={true}
              animationDuration={950}
            />

            {/* Comments Area (Orange Curve) */}
            <Area
              type="monotone"
              dataKey="comments"
              name="comments"
              stroke="#FB923C"
              strokeWidth={2.4}
              fill="url(#gradComments)"
              fillOpacity={activeMetric && activeMetric !== "comments" ? 0.05 : 1}
              strokeOpacity={activeMetric && activeMetric !== "comments" ? 0.2 : 1}
              isAnimationActive={true}
              animationDuration={1000}
            />

            {/* Likes Area (Blue Curve) */}
            <Area
              type="monotone"
              dataKey="likes"
              name="likes"
              stroke="#3B82F6"
              strokeWidth={2.4}
              fill="url(#gradLikes)"
              fillOpacity={activeMetric && activeMetric !== "likes" ? 0.05 : 1}
              strokeOpacity={activeMetric && activeMetric !== "likes" ? 0.2 : 1}
              isAnimationActive={true}
              animationDuration={1050}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default EngagementAreaChart;
