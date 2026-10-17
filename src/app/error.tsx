"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GLOBAL_APP_ERROR]", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-6 bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-100 selection:bg-purple-600 selection:text-white transition-colors duration-200">
      <header className="w-full max-w-5xl flex items-center justify-between py-2">
        <PulseSocialLogo size="md" variant="full" href="/" />
      </header>

      <main className="w-full max-w-md mx-auto my-auto text-center space-y-6 p-8 rounded-2xl bg-white dark:bg-[#14141A] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-900/5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Something unexpected occurred
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {error?.message || "An unexpected system error occurred while rendering this page."}
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#E08738] to-[#D97706] hover:brightness-105 text-slate-950 text-sm font-bold shadow-md shadow-amber-500/25 transition active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-semibold border border-slate-200 dark:border-white/10 transition active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </main>

      <footer className="w-full max-w-5xl text-center py-4 text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} PulseSocial Corporation. All systems monitored.
      </footer>
    </div>
  );
}
