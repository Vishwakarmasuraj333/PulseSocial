"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Award,
  Users,
  BarChart2,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";

interface Competitor {
  id: string;
  name: string;
  handle: string;
  followers: number;
  growthPct: number;
  postFrequency: string;
  engagementRate: number;
  shareOfVoice: number;
  isSelf?: boolean;
}

export function CompetitorBenchmarkWidget() {
  const { activeBrand } = useBrand();
  const { toast } = useToast();
  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: "self",
      name: activeBrand?.name || "Acme Creative (You)",
      handle: "@acme_creative",
      followers: 128450,
      growthPct: 2.4,
      postFrequency: "14 / wk",
      engagementRate: 4.82,
      shareOfVoice: 34,
      isSelf: true,
    },
    {
      id: "comp-1",
      name: "Nexus Global Media",
      handle: "@nexus_media",
      followers: 142100,
      growthPct: 1.8,
      postFrequency: "10 / wk",
      engagementRate: 3.91,
      shareOfVoice: 28,
    },
    {
      id: "comp-2",
      name: "Vanguard Studios",
      handle: "@vanguard_studio",
      followers: 98600,
      growthPct: 3.1,
      postFrequency: "16 / wk",
      engagementRate: 4.15,
      shareOfVoice: 22,
    },
    {
      id: "comp-3",
      name: "Hyperion Collective",
      handle: "@hyperion_co",
      followers: 84300,
      growthPct: 0.9,
      postFrequency: "6 / wk",
      engagementRate: 2.74,
      shareOfVoice: 16,
    },
  ]);

  const handleAddCompetitor = () => {
    toast({
      title: "Track New Competitor",
      message: "Competitor intelligence tracking limit: 5 competitors on active plan.",
      type: "info",
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Competitor Benchmark & Share of Voice
            </h3>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full">
              Rank #1 in Niche
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            SE Ranking market intelligence comparing audience, engagement velocity, and visibility
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCompetitor}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Competitor</span>
        </button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-semibold">BRAND / COMPETITOR</th>
              <th className="pb-3 font-semibold text-right">AUDIENCE</th>
              <th className="pb-3 font-semibold text-right">30D GROWTH</th>
              <th className="pb-3 font-semibold text-right">CADENCE</th>
              <th className="pb-3 font-semibold text-right">ENGAGEMENT</th>
              <th className="pb-3 font-semibold text-right">SHARE OF VOICE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {competitors.map((c) => (
              <tr
                key={c.id}
                className={`transition ${
                  c.isSelf
                    ? "bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold"
                    : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                }`}
              >
                {/* Brand Info */}
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                        c.isSelf
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {c.name}
                        </span>
                        {c.isSelf && (
                          <span className="text-[9px] uppercase font-black bg-indigo-600 text-white px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{c.handle}</span>
                    </div>
                  </div>
                </td>

                {/* Followers */}
                <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                  {c.followers.toLocaleString()}
                </td>

                {/* Growth */}
                <td className="py-3 text-right">
                  <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    +{c.growthPct}%
                  </span>
                </td>

                {/* Cadence */}
                <td className="py-3 text-right text-slate-700 dark:text-slate-300">
                  {c.postFrequency}
                </td>

                {/* Engagement Rate */}
                <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                  {c.engagementRate}%
                </td>

                {/* Share of Voice Progress Bar */}
                <td className="py-3 text-right">
                  <div className="inline-flex items-center gap-2 justify-end w-32">
                    <div className="w-20 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          c.isSelf ? "bg-indigo-600" : "bg-slate-400 dark:bg-slate-600"
                        }`}
                        style={{ width: `${c.shareOfVoice}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white w-7 text-right">
                      {c.shareOfVoice}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
