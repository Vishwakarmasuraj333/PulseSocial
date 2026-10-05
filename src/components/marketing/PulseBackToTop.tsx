"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function PulseBackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (totalHeight > 0) {
        setScrollProgress((currentScroll / totalHeight) * 100);
      }

      if (currentScroll > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
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
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={scrollToTop}
        aria-label="Scroll back to top of page"
        title="Back to Top"
        className="group relative flex items-center gap-2 p-2.5 sm:px-3.5 sm:py-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-white shadow-[0_8px_30px_rgba(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:border-[#6F52B5] dark:hover:border-indigo-400 hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {/* Subtle circular scroll progress indicator */}
        <svg className="w-5 h-5 sm:w-5 sm:h-5 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-200 dark:text-slate-800"
            strokeWidth="3"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-[#6F52B5] dark:text-[#A78BDF] transition-all duration-150"
            strokeDasharray={`${scrollProgress}, 100`}
            strokeWidth="3.2"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>

        {/* Center Arrow Icon */}
        <ArrowUp className="w-4 h-4 text-[#6F52B5] dark:text-[#A78BDF] group-hover:-translate-y-0.5 transition-transform duration-200" />

        {/* Responsive text label (hidden on small mobile to stay compact) */}
        <span className="hidden md:inline text-xs font-bold text-slate-700 dark:text-slate-200 pr-0.5">
          Top
        </span>
      </button>
    </div>
  );
}
