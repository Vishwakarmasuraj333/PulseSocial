"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, LayoutDashboard, LogOut } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DASHBOARD_RENDER_ERROR]", error);
  }, [error]);

  return (
    <div className="w-full flex-1 min-h-[60vh] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#15151B] border border-slate-200/90 dark:border-white/10 shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Unable to load dashboard workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {error?.message ||
              "A component or data dependency failed to initialize. Your workspace data remains secure."}
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              Reference code: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5846A8] hover:bg-[#48378E] text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 transition active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Action</span>
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-white/10 transition active:scale-[0.98]"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </Link>

          <Link
            href="/login?logout=true"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold border border-rose-200 dark:border-rose-500/20 transition active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
