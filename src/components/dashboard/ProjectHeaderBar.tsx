"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  Plus,
  RefreshCw,
  Download,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import { useToast } from "@/components/ui/toast";

interface ProjectHeaderBarProps {
  dateRange: string;
  setDateRange: (range: string) => void;
  comparePeriod: boolean;
  setComparePeriod: (val: boolean) => void;
  onOpenComposer: () => void;
  onOpenConnect: () => void;
  onOpenAudit: () => void;
  connectedCount: number;
}

export function ProjectHeaderBar({
  dateRange,
  setDateRange,
  comparePeriod,
  setComparePeriod,
  onOpenComposer,
  onOpenConnect,
  onOpenAudit,
  connectedCount,
}: ProjectHeaderBarProps) {
  const { activeBrand, brands, switchBrand } = useBrand();
  const { toast } = useToast();
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const ranges = [
    { id: "7d", label: "7D" },
    { id: "14d", label: "14D" },
    { id: "30d", label: "30D" },
    { id: "90d", label: "90D" },
    { id: "ytd", label: "YTD" },
  ];

  const handleExport = (type: "csv" | "pdf") => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export Completed",
        message: `${activeBrand?.name || "Workspace"} Executive Summary (${type.toUpperCase()}) downloaded successfully.`,
        type: "success",
      });
    }, 900);
  };

  const handleShareGuestLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Guest Link Copied",
      message: "Read-only client dashboard link has been copied to your clipboard.",
      type: "info",
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Project / Brand Identity & Switcher */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition cursor-pointer text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-600 via-sky-600 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {activeBrand?.name ? activeBrand.name.charAt(0).toUpperCase() : "P"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {activeBrand?.name || "Acme Creative Global"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span>{activeBrand?.slug ? `${activeBrand.slug}.social` : "project.workspace"}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {connectedCount} channels active
                  </span>
                </div>
              </div>
            </button>

            {/* Brand Dropdown Menu */}
            {isBrandDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsBrandDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-2 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Project / Brand
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          switchBrand(b.id);
                          setIsBrandDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer ${
                          b.id === activeBrand?.id
                            ? "bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-indigo-500/20 text-indigo-600 font-bold flex items-center justify-center text-xs">
                            {b.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium leading-tight">{b.name}</p>
                            <p className="text-[10px] text-slate-400">{b.slug}.social</p>
                          </div>
                        </div>
                        {b.id === activeBrand?.id && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Real-time Health Indicator Badge */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry Live & Connected</span>
          </div>
        </div>

        {/* Right: Date Range Selector + SE Ranking Action Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Time Filter Pills */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            {ranges.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDateRange(r.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  dateRange === r.id
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Compare Checkbox */}
          <label className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={comparePeriod}
              onChange={(e) => setComparePeriod(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span>Compare prev</span>
          </label>

          {/* Action: Run Brand Audit */}
          <button
            type="button"
            onClick={onOpenAudit}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Run Profile & SEO Audit"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">Brand Audit</span>
          </button>

          {/* Action: Share / Guest Link */}
          <button
            type="button"
            onClick={handleShareGuestLink}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Share Guest Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Share</span>
          </button>

          {/* Action: Export Report */}
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Export PDF / CSV Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Export</span>
          </button>

          {/* Primary Action: + New Post */}
          <button
            type="button"
            onClick={onOpenComposer}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-indigo-500/25 transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}
