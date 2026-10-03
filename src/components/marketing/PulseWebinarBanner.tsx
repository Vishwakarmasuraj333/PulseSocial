"use client";

import React from "react";
import Link from "next/link";
import { Play, Calendar, Sparkles } from "lucide-react";

export function PulseWebinarBanner() {
  return (
    <section className="py-10 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Live Interactive Workshop
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Don't miss our live webinar on PulseSocial
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 font-normal">
              Learn advanced AI multi-channel publishing workflows, automated CRM lead routing, and ROI reporting.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              href="/webinars"
              className="inline-flex items-center px-6 py-2.5 rounded-md bg-[#EF4444] hover:bg-[#DC2626] text-white font-black text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-500/30"
            >
              REGISTER NOW
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
