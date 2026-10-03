"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export function PulseFinalCta() {
  return (
    <section className="py-20 sm:py-24 bg-white dark:bg-slate-950 border-t border-b border-slate-100 dark:border-slate-850 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Subtle decorative airplane vector */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-800 dark:text-slate-200">
            <svg className="w-6 h-6 transform -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Build the best social media presence for your brands
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-normal">
          14-day free trial. No credit card required. Sign up in seconds.
        </p>

        <div className="pt-2">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-md bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-md shadow-red-500/25 hover:shadow-red-500/40 cursor-pointer"
          >
            TRY FOR FREE
          </Link>
        </div>
      </div>
    </section>
  );
}
