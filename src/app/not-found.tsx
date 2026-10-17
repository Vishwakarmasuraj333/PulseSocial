"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D0D10] text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 text-center transition-colors">
      <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-amber-500/10 border border-purple-200 dark:border-amber-500/30 flex items-center justify-center text-[#5846A8] dark:text-[#E08738] mb-6 shadow-xl shadow-purple-500/10 dark:shadow-amber-500/10">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-amber-500/10 text-[#5846A8] dark:text-[#FBBF24] border border-purple-200 dark:border-amber-500/20 mb-3">
        404 · Page Not Found
      </div>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
        Lost in the Pulse Stream?
      </h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed mb-8">
        The social dashboard or resource you requested could not be located. It might have moved or the link may have expired.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/posts/new">
          <Button variant="outline" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2 font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Go to Post Composer
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button className="bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:hover:brightness-105 dark:text-slate-950 dark:shadow-amber-500/25 font-bold flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
