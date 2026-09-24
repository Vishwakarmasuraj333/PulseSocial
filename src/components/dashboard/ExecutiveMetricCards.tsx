"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  MessageSquare,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

interface MetricCardData {
  healthScore: number;
  totalFollowers: number;
  followerGrowth: number;
  totalReach: number;
  totalImpressions: number;
  engagementRate: number;
  inboundResolvedPct: number;
  avgResponseTime: string;
}

interface ExecutiveMetricCardsProps {
  data: MetricCardData;
  comparePeriod: boolean;
  onOpenAudit: () => void;
}

export function ExecutiveMetricCards({
  data,
  comparePeriod,
  onOpenAudit,
}: ExecutiveMetricCardsProps) {
  // Format numbers cleanly
  const formatNum = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. SE Ranking Core: Social Visibility & Health Score Card */}
      <div
        onClick={onOpenAudit}
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Health & Visibility
          </span>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:scale-105 transition-transform">
            <span>Audit Score</span>
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Radial Gauge */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-out"
                strokeDasharray={`${data.healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-base font-extrabold text-slate-900 dark:text-white leading-none">
                {data.healthScore}
              </span>
              <span className="block text-[8px] font-bold text-slate-400 leading-none mt-0.5">/100</span>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Grade A — Optimal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Publishing cadence: 94% <br />
              OAuth Token security: 100%
            </p>
          </div>
        </div>

        {/* Mini progress breakdown */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block">Cadence</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">94%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Audience</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">89%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Sentiment</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">98%</span>
          </div>
        </div>
      </div>

      {/* 2. Total Audience & Followers Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Audience
          </span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatNum(data.totalFollowers)}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              +{data.followerGrowth}%
            </span>
            <span className="text-[11px] text-slate-400">
              {comparePeriod ? "vs previous period" : "steady organic growth"}
            </span>
          </div>
        </div>

        {/* Sparkline curve */}
        <div className="pt-2">
          <svg className="w-full h-8 text-sky-500" viewBox="0 0 100 24" fill="none">
            <path
              d="M0 20 Q 25 18, 40 12 T 70 8 T 100 2"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M0 20 Q 25 18, 40 12 T 70 8 T 100 2 L 100 24 L 0 24 Z"
              fill="currentColor"
              className="opacity-10"
            />
          </svg>
        </div>
      </div>

      {/* 3. Aggregated Reach & Impressions Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Reach & Impressions
          </span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatNum(data.totalReach)}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              +14.8%
            </span>
            <span className="text-[11px] text-slate-400">
              • {formatNum(data.totalImpressions)} impressions
            </span>
          </div>
        </div>

        {/* Visual Channel Distribution Bar */}
        <div className="pt-2 space-y-1.5">
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 w-[38%]" title="Instagram: 38%" />
            <div className="h-full bg-blue-600 w-[28%]" title="Facebook: 28%" />
            <div className="h-full bg-[#0A66C2] w-[20%]" title="LinkedIn: 20%" />
            <div className="h-full bg-black dark:bg-slate-300 w-[14%]" title="X: 14%" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>IG 38%</span>
            <span>FB 28%</span>
            <span>LI 20%</span>
            <span>X 14%</span>
          </div>
        </div>
      </div>

      {/* 4. Engagement & Inbound Resolution Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Engagement & Inbox
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {data.engagementRate}%
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              +0.64%
            </span>
            <span className="text-[11px] text-slate-400">above industry avg (3.8%)</span>
          </div>
        </div>

        {/* Inbound SLA badge */}
        <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">SLA Resolution</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {data.inboundResolvedPct}% ({data.avgResponseTime} avg)
          </span>
        </div>
      </div>
    </div>
  );
}
