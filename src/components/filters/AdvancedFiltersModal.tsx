"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import {
  X,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Tag,
  Share2,
} from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";

export interface FilterCriteria {
  platforms: string[]; // ["linkedin", "instagram", ...] or empty for ALL
  campaigns: string[]; // ["launch-2026", ...] or empty for ALL
  approvalStatuses: string[]; // ["PUBLISHED", "SCHEDULED", "PENDING_APPROVAL", "DRAFT"]
  contentTypes: string[]; // ["all", "posts", "reels", "stories", "videos"]
  dateRange: "all" | "today" | "week" | "month" | "scheduled";
}

export const DEFAULT_FILTER_CRITERIA: FilterCriteria = {
  platforms: [],
  campaigns: [],
  approvalStatuses: [],
  contentTypes: [],
  dateRange: "all",
};

export const AVAILABLE_PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", provider: "LINKEDIN" },
  { id: "instagram", name: "Instagram", provider: "INSTAGRAM" },
  { id: "x", name: "X (Twitter)", provider: "TWITTER" },
  { id: "facebook", name: "Facebook", provider: "FACEBOOK" },
  { id: "youtube", name: "YouTube", provider: "YOUTUBE" },
  { id: "threads", name: "Threads", provider: "THREADS" },
  { id: "tiktok", name: "TikTok", provider: "TIKTOK" },
  { id: "pinterest", name: "Pinterest", provider: "PINTEREST" },
  { id: "google", name: "Google Business", provider: "GOOGLE_BUSINESS" },
];

export const AVAILABLE_CAMPAIGNS = [
  { id: "q4-growth", name: "Q4 Brand Growth 2026", color: "bg-purple-500" },
  { id: "product-launch", name: "Pulse AI Platform Launch", color: "bg-blue-500" },
  { id: "community-stories", name: "Customer Stories & Wins", color: "bg-emerald-500" },
  { id: "thought-leadership", name: "Founder Insights & Tips", color: "bg-amber-500" },
  { id: "seasonal-promos", name: "Seasonal Flash Campaign", color: "bg-rose-500" },
];

export const AVAILABLE_APPROVAL_STATUSES = [
  { id: "PUBLISHED", label: "Published & Live", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200" },
  { id: "SCHEDULED", label: "Scheduled for Future", icon: Clock, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200" },
  { id: "PENDING_APPROVAL", label: "Pending Approval", icon: AlertCircle, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200" },
  { id: "DRAFT", label: "Drafts & Scratchpad", icon: FileText, color: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200" },
  { id: "FAILED", label: "Failed / Needs Action", icon: AlertCircle, color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200" },
];

export const AVAILABLE_CONTENT_TYPES = [
  { id: "posts", label: "Static Feed Posts", desc: "Single/multi image & text updates" },
  { id: "reels", label: "Reels & Shorts (9:16)", desc: "Vertical short-form video content" },
  { id: "stories", label: "24h Stories", desc: "Ephemeral visual moments" },
  { id: "videos", label: "Longform Video", desc: "Landscape video publications" },
];

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCriteria: FilterCriteria;
  onApply: (criteria: FilterCriteria) => void;
  totalPostsCount?: number;
  filteredPostsCount?: number;
}

export function AdvancedFiltersModal({
  isOpen,
  onClose,
  activeCriteria,
  onApply,
  totalPostsCount,
  filteredPostsCount,
}: AdvancedFiltersModalProps) {
  const [draft, setDraft] = useState<FilterCriteria>(activeCriteria);

  useEffect(() => {
    if (isOpen) {
      setDraft(activeCriteria);
    }
  }, [isOpen, activeCriteria]);

  const togglePlatform = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(id)
        ? prev.platforms.filter((p) => p !== id)
        : [...prev.platforms, id],
    }));
  };

  const toggleCampaign = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      campaigns: prev.campaigns.includes(id)
        ? prev.campaigns.filter((c) => c !== id)
        : [...prev.campaigns, id],
    }));
  };

  const toggleApprovalStatus = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      approvalStatuses: prev.approvalStatuses.includes(id)
        ? prev.approvalStatuses.filter((s) => s !== id)
        : [...prev.approvalStatuses, id],
    }));
  };

  const toggleContentType = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(id)
        ? prev.contentTypes.filter((t) => t !== id)
        : [...prev.contentTypes, id],
    }));
  };

  const handleReset = () => {
    setDraft(DEFAULT_FILTER_CRITERIA);
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const activeCount =
    draft.platforms.length +
    draft.campaigns.length +
    draft.approvalStatuses.length +
    draft.contentTypes.length +
    (draft.dateRange !== "all" ? 1 : 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#17171A] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 ring-1 ring-amber-500/15 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/7 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E08738] to-[#F59E0B] flex items-center justify-center text-[#0F0F11] font-bold shadow-md shadow-amber-900/20">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">Advanced Post Filters</h3>
                  {activeCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E08738] text-[#0F0F11]">
                      {activeCount} Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF]">
                  Filter posts by platform, campaign, and approval status in real-time.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Filter Form Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* 1. Filter by Platform */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#E08738] dark:text-[#FBBF24]" />
                  <span>Social Platforms</span>
                </label>
                {draft.platforms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, platforms: [] }))}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                  >
                    Select All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_PLATFORMS.map((plat) => {
                  const isChecked = draft.platforms.includes(plat.id);
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => togglePlatform(plat.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition cursor-pointer text-left ${
                        isChecked
                          ? "bg-amber-500/10 dark:bg-amber-500/15 border-[#E08738] text-amber-700 dark:text-[#FBBF24] shadow-2xs font-bold"
                          : "bg-white dark:bg-[#1C1C20] border-slate-200 dark:border-white/7 text-slate-700 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="shrink-0">{renderPlatformIcon(plat.provider, 15)}</div>
                      <span className="truncate flex-1">{plat.name}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#E08738] dark:text-[#FBBF24] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Filter by Approval Status */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Approval & Publication Status</span>
                </label>
                {draft.approvalStatuses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, approvalStatuses: [] }))}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                  >
                    Reset Statuses
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_APPROVAL_STATUSES.map((status) => {
                  const isChecked = draft.approvalStatuses.includes(status.id);
                  const Icon = status.icon;
                  return (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => toggleApprovalStatus(status.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs transition cursor-pointer text-left ${
                        isChecked
                          ? `${status.color} font-bold shadow-2xs ring-1 ring-offset-0 ring-[#E08738]/40`
                          : "bg-white dark:bg-[#1C1C20] border-slate-200 dark:border-white/7 text-slate-700 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 font-medium">{status.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Filter by Campaign */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Workspace Campaigns</span>
                </label>
                {draft.campaigns.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, campaigns: [] }))}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                  >
                    All Campaigns
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CAMPAIGNS.map((camp) => {
                  const isChecked = draft.campaigns.includes(camp.id);
                  return (
                    <button
                      key={camp.id}
                      type="button"
                      onClick={() => toggleCampaign(camp.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition cursor-pointer ${
                        isChecked
                          ? "bg-[#E08738] text-[#0F0F11] border-[#E08738] font-bold shadow-xs"
                          : "bg-white dark:bg-[#1C1C20] border-slate-200 dark:border-white/7 text-slate-700 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${camp.color}`} />
                      <span>{camp.name}</span>
                      {isChecked && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Filter by Content Format */}
            <div className="space-y-2.5">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#E08738] dark:text-[#FBBF24]" />
                <span>Content Format</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABLE_CONTENT_TYPES.map((type) => {
                  const isChecked = draft.contentTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleContentType(type.id)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isChecked
                          ? "bg-amber-500/10 dark:bg-amber-500/15 border-[#E08738] text-amber-700 dark:text-[#FBBF24] font-bold"
                          : "bg-white dark:bg-[#1C1C20] border-slate-200 dark:border-white/7 text-slate-700 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="text-xs font-semibold">{type.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-[#6B7280] font-normal line-clamp-1">{type.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-[#111113] border-t border-slate-100 dark:border-white/7 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-200/60 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#E08738] to-[#F59E0B] hover:brightness-105 text-[#0F0F11] text-xs font-bold shadow-md shadow-amber-900/20 transition cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
