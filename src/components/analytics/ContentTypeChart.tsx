"use client";

import React from "react";
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
import { Video, Layers, Image as ImageIcon, FileText } from "lucide-react";

export interface ContentTypeItem {
  type: string;
  reach: number;
  engagementRate: string;
  postsCount: number;
  color: string;
}

const CONTENT_TYPE_DATA: ContentTypeItem[] = [
  {
    type: "Video & Reels",
    reach: 14800,
    engagementRate: "6.8%",
    postsCount: 14,
    color: "#0284C7",
  },
  {
    type: "Carousel",
    reach: 11200,
    engagementRate: "5.4%",
    postsCount: 9,
    color: "#3B82F6",
  },
  {
    type: "Single Image",
    reach: 8400,
    engagementRate: "3.9%",
    postsCount: 8,
    color: "#60A5FA",
  },
  {
    type: "Text Posts",
    reach: 4600,
    engagementRate: "2.8%",
    postsCount: 4,
    color: "#93C5FD",
  },
];

export function ContentTypeChart() {
  const formatYAxis = (val: number) => {
    if (val === 0) return "0";
    if (val >= 1000) return `${val / 1000}K`;
    return val.toString();
  };

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
            Average reach and engagement generated per media format
          </p>
        </div>
      </div>

      {/* Vertical Bar Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={CONTENT_TYPE_DATA}
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
              domain={[0, 16000]}
              ticks={[0, 4000, 8000, 12000, 16000]}
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
                        Based on {d.postsCount} published broadcasts
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar
              dataKey="reach"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
              isAnimationActive={true}
              animationDuration={850}
            >
              {CONTENT_TYPE_DATA.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Format summary footer pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
        {CONTENT_TYPE_DATA.map((item) => (
          <div
            key={item.type}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
          >
            <span className="text-slate-600 dark:text-slate-400 truncate font-medium">
              {item.type}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono ml-1">
              {item.engagementRate}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default ContentTypeChart;
