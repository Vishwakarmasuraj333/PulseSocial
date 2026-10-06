"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function PulseBackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (totalHeight > 0) {
        const progress = Math.min(
          100,
          Math.max(0, (currentScroll / totalHeight) * 100)
        );
        setScrollProgress(progress);
      }

      if (currentScroll > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-5 sm:bottom-7 sm:right-7 z-40 select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        title="Scroll to top of page"
        className="group relative flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#5846A8] via-[#6348B8] to-[#714EC8] hover:from-[#4C3A94] hover:to-[#6240B9] text-white border border-purple-300/30 shadow-[0_10px_25px_-3px_rgba(88,70,168,0.45)] hover:shadow-[0_16px_35px_-4px_rgba(88,70,168,0.6)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden ring-1 ring-white/20"
      >
        {/* Sleek horizontal progress line at bottom (purple & white theme) */}
        <div
          className="absolute bottom-0 left-0 h-[2.5px] bg-white transition-all duration-150 rounded-full"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Crisp white rounded icon square with purple arrow */}
        <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-lg bg-white text-[#5846A8] flex items-center justify-center shadow-xs shrink-0 group-hover:-translate-y-0.5 transition-transform duration-200">
          <ArrowUp className="w-3.5 h-3.5 stroke-[2.75]" />
        </div>

        {/* Professional white typography */}
        <span className="text-xs sm:text-sm font-bold tracking-tight text-white drop-shadow-2xs">
          Back to Top
        </span>

        {/* Scroll Progress percentage chip */}
        <span className="hidden sm:inline-flex items-center text-[10px] font-bold font-mono text-purple-100 bg-white/20 px-1.5 py-0.5 rounded-md border border-white/25">
          {Math.round(scrollProgress)}%
        </span>
      </button>
    </div>
  );
}
