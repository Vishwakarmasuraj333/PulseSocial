"use client";

import React from "react";
import {
  Sparkles,
  ArrowRight,
  Clock,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Flame,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface AuditRecommendationsWidgetProps {
  onOpenComposer: () => void;
  onOpenAudit: () => void;
}

export function AuditRecommendationsWidget({
  onOpenComposer,
  onOpenAudit,
}: AuditRecommendationsWidgetProps) {
  const { toast } = useToast();
  const router = useRouter();

  const recommendations = [
    {
      id: "rec-1",
      priority: "high",
      title: "Optimal Posting Window in 35 mins",
      desc: "Instagram audience peak engagement occurs between 5:00 PM and 6:30 PM. Publishing now yields +28% higher reach.",
      actionLabel: "Compose Now",
      action: onOpenComposer,
      tag: "Peak Timing",
    },
    {
      id: "rec-2",
      priority: "medium",
      title: "3 Priority Customer Inquiries in Inbox",
      desc: "Incoming direct messages on LinkedIn & X from verified accounts awaiting response.",
      actionLabel: "Open Inbox",
      action: () => router.push("/inbox"),
      tag: "Inbox SLA",
    },
    {
      id: "rec-3",
      priority: "growth",
      title: "Video Posts Surging (+310% Reach)",
      desc: "Your short-form video reels on Instagram & YouTube Shorts delivered 3x engagement over static posts this week.",
      actionLabel: "View Analytics",
      action: () => router.push("/analytics"),
      tag: "Format Insight",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Action Center & Recommendations
            </h3>
            <p className="text-[11px] text-slate-400">
              AI-driven opportunities to maximize reach, cadence, and conversions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAudit}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          View Full Audit
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    rec.priority === "high"
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40"
                      : rec.priority === "medium"
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40"
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                  }`}
                >
                  {rec.tag}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {rec.title}
                </h4>
              </div>

              <button
                type="button"
                onClick={rec.action}
                className="shrink-0 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{rec.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {rec.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
