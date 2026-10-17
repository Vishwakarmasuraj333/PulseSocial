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
    <div className="bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Project / Brand Identity & Switcher */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl border border-slate-200 dark:border-white/7 bg-slate-50 dark:bg-[#1C1C20] hover:bg-purple-50/60 dark:hover:bg-white/5 transition cursor-pointer text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#5846A8] text-white dark:bg-gradient-to-tr dark:from-[#E08738] dark:to-[#F59E0B] dark:text-[#0F0F11] font-bold flex items-center justify-center text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                {activeBrand?.name ? activeBrand.name.charAt(0).toUpperCase() : "P"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {activeBrand?.name || "Acme Creative Global"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-[#9CA3AF] flex items-center gap-1.5">
                  <span>{activeBrand?.slug ? `${activeBrand.slug}.social` : "project.workspace"}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                  <span className="text-[#5846A8] dark:text-[#FBBF24] font-medium">
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
                <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl backdrop-blur-md z-50 py-2 divide-y divide-slate-100 dark:divide-white/7 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left hover:bg-purple-50/60 dark:hover:bg-white/5 transition cursor-pointer ${
                          b.id === activeBrand?.id
                            ? "bg-purple-50 dark:bg-amber-500/15 text-[#5846A8] dark:text-[#FBBF24] font-semibold"
                            : "text-slate-700 dark:text-[#9CA3AF]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-purple-100 dark:bg-amber-500/20 text-[#5846A8] dark:text-[#FBBF24] font-bold flex items-center justify-center text-xs">
                            {b.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium leading-tight text-slate-900 dark:text-white">{b.name}</p>
                            <p className="text-[10px] text-slate-400">{b.slug}.social</p>
                          </div>
                        </div>
                        {b.id === activeBrand?.id && (
                          <CheckCircle2 className="w-4 h-4 text-[#5846A8] dark:text-[#FBBF24]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Real-time Health Indicator Badge */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-amber-500/15 border border-purple-200 dark:border-amber-500/20 text-xs font-semibold text-[#5846A8] dark:text-[#FBBF24]">
            <span className="w-2 h-2 rounded-full bg-[#5846A8] dark:bg-[#E08738] animate-pulse" />
            <span>Telemetry Live & Connected</span>
          </div>
        </div>

        {/* Right: Date Range Selector + PulseSocial Action Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Time Filter Pills */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#111113] rounded-xl border border-slate-200/80 dark:border-white/7">
            {ranges.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDateRange(r.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                  dateRange === r.id
                    ? "bg-[#5846A8] text-white shadow-2xs font-bold dark:bg-[#E08738] dark:text-[#0F0F11]"
                    : "text-slate-500 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-white hover:bg-purple-50/60 dark:hover:bg-white/5"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Compare Checkbox */}
          <label className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#9CA3AF] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={comparePeriod}
              onChange={(e) => setComparePeriod(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#5846A8] focus:ring-[#5846A8] accent-[#5846A8] dark:text-[#E08738] dark:focus:ring-[#E08738] dark:accent-[#E08738] border-slate-300 dark:border-white/10 dark:bg-[#1C1C20]"
            />
            <span>Compare prev</span>
          </label>

          {/* Action: Run Brand Audit */}
          <button
            type="button"
            onClick={onOpenAudit}
            className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-[#5846A8] dark:text-[#9CA3AF] dark:hover:text-[#FBBF24] rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-white/7 hover:border-purple-300 dark:hover:border-amber-500/40 transition-all duration-150 cursor-pointer hover:scale-105"
            title="Run Profile & SEO Audit"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#E08738]" />
            <span className="hidden md:inline">Brand Audit</span>
          </button>

          {/* Action: Share / Guest Link */}
          <button
            type="button"
            onClick={handleShareGuestLink}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-purple-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 hover:text-[#5846A8] dark:text-[#9CA3AF] dark:hover:text-[#FBBF24] rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-200 dark:border-white/7 hover:border-purple-300 dark:hover:border-amber-500/40 transition-all duration-150 cursor-pointer hover:scale-105"
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
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-purple-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 hover:text-[#5846A8] dark:text-[#9CA3AF] dark:hover:text-[#FBBF24] rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-200 dark:border-white/7 hover:border-purple-300 dark:hover:border-amber-500/40 transition-all duration-150 cursor-pointer hover:scale-105"
            title="Export PDF / CSV Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Export</span>
          </button>

          {/* Primary Action: + New Post */}
          <button
            type="button"
            onClick={onOpenComposer}
            className="px-3.5 py-1.5 bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 hover:shadow-purple-900/35 dark:bg-gradient-to-r dark:from-[#E08738] dark:to-[#F59E0B] dark:hover:from-[#D97706] dark:hover:to-[#E08738] dark:text-[#0F0F11] font-bold rounded-xl text-xs flex items-center gap-1.5 dark:shadow-sm dark:shadow-amber-900/20 dark:hover:shadow-amber-500/25 transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}
