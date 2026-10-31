"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export function PulseAnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#4E3B99] via-[#5846A8] to-[#6C55C4] dark:bg-[#181512] border-b border-[#7B61FF]/30 dark:border-[#E08738]/35 text-white dark:text-[#FEF3C7] text-xs sm:text-sm font-medium py-2 px-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center pr-10 sm:pr-12">
        <span className="text-white dark:text-[#FEF3C7]">
          Introducing <strong className="font-bold underline decoration-white/70 dark:decoration-[#FBBF24]/70 dark:text-[#FDE68A]">Linkthread</strong> by PulseSocial: Your entire digital presence, one link away
        </span>
        <Link
          href="/features#linkthread"
          className="inline-flex items-center gap-1 font-bold bg-white text-[#5846A8] hover:bg-purple-50 dark:bg-gradient-to-r dark:from-amber-400 dark:to-yellow-500 dark:text-slate-950 dark:hover:from-amber-300 dark:hover:to-yellow-400 dark:shadow-[0_0_12px_rgba(251,191,36,0.35)] px-2.5 py-0.5 rounded-full text-xs shadow-xs transition-all ml-1 uppercase tracking-wide group"
        >
          <span>TRY NOW</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-6 sm:right-10 lg:right-14 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white hover:bg-white/10 dark:text-[#FEF3C7]/75 dark:hover:text-[#FEF3C7] dark:hover:bg-white/10 rounded-lg transition cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
