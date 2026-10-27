"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export function PulseAnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 dark:bg-[#181512] border-b border-blue-400/30 dark:border-white/10 text-white text-xs sm:text-sm font-medium py-2 px-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center pr-6 sm:pr-0">
        <span className="text-white">
          Introducing <strong className="font-bold underline decoration-white/60">Linkthread</strong> by PulseSocial: Your entire digital presence, one link away
        </span>
        <Link
          href="/features#linkthread"
          className="inline-flex items-center gap-1 font-bold bg-white text-blue-700 hover:bg-blue-50 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 px-2.5 py-0.5 rounded-full text-xs shadow-xs transition-all ml-1 uppercase tracking-wide group"
        >
          <span>TRY NOW</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
