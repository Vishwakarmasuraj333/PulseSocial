"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, HelpCircle, LifeBuoy, MessageSquare } from "lucide-react";
import { FeedbackModal } from "@/components/layout/FeedbackModal";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <footer
        role="contentinfo"
        aria-label="Dashboard Footer"
        className="mt-auto border-t border-slate-200/80 dark:border-white/7 bg-white/75 dark:bg-[#0D0D0E]/90 backdrop-blur-md px-4 sm:px-6 py-3.5 text-xs text-slate-500 dark:text-[#6B7280] select-none transition-colors"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          {/* Left: Product, Version, Status & Compliance */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">
              PulseSocial
            </span>
            <span className="text-slate-300 dark:text-white/10">·</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-[#E08738] dark:text-[#FBBF24] font-mono text-[10px] font-semibold border border-amber-200/60 dark:border-amber-500/30">
              v2.8 Production
            </span>
            <span className="text-slate-300 dark:text-white/10 hidden sm:inline">·</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Systems Operational</span>
            </span>
            <span className="text-slate-300 dark:text-white/10 hidden md:inline">·</span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-[#9CA3AF]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>SOC2 Type II &bull; AES-256 Vault</span>
            </span>
          </div>

          {/* Right: Functional Internal Links, Feedback Modal Trigger & Copyright */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4 text-xs">
            <Link
              href="/resources"
              className="hover:text-[#E08738] dark:hover:text-[#FBBF24] transition-colors flex items-center gap-1 font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E08738] rounded"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Docs &amp; Guides</span>
            </Link>
            <span className="text-slate-300 dark:text-white/10">·</span>
            <Link
              href="/contact"
              className="hover:text-[#E08738] dark:hover:text-[#FBBF24] transition-colors flex items-center gap-1 font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E08738] rounded"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Support</span>
            </Link>
            <span className="text-slate-300 dark:text-white/10">·</span>
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="hover:text-[#E08738] dark:hover:text-[#FBBF24] transition-colors flex items-center gap-1 font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E08738] rounded cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#E08738]" />
              <span>Feedback</span>
            </button>
            <span className="text-slate-300 dark:text-white/10">·</span>
            <Link
              href="/privacy"
              className="hover:text-[#E08738] dark:hover:text-[#FBBF24] transition-colors font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E08738] rounded"
            >
              Privacy
            </Link>
            <span className="text-slate-300 dark:text-white/10">·</span>
            <Link
              href="/terms"
              className="hover:text-[#E08738] dark:hover:text-[#FBBF24] transition-colors font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E08738] rounded"
            >
              Terms
            </Link>
            <span className="text-slate-300 dark:text-white/10">·</span>
            <span className="text-slate-400 dark:text-[#6B7280] text-[11px]">
              &copy; {currentYear} PulseSocial
            </span>
          </div>
        </div>
      </footer>

      {/* Global Feedback Modal triggered directly from Single Proper Footer */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
}

export default DashboardFooter;
