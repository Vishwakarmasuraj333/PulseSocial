"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export function PulseAnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-[#0284C7] dark:bg-[#0369A1] text-white text-xs sm:text-sm font-medium py-2 px-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center pr-6 sm:pr-0">
        <span className="text-white/95">
          Introducing <strong className="font-bold underline decoration-sky-200">Linkthread</strong> by PulseSocial: Your entire digital presence, one link away
        </span>
        <Link
          href="/features#linkthread"
          className="inline-flex items-center gap-1 font-bold text-sky-100 hover:text-white underline underline-offset-2 ml-1 text-xs uppercase tracking-wide group"
        >
          <span>TRY NOW</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
