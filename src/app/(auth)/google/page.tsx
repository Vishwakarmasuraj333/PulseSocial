"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

export default function GoogleSignInRedirectPage() {
  useEffect(() => {
    window.location.replace("/api/auth/google");
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 font-sans p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#5846A8] mx-auto" />
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          Redirecting to Google OAuth...
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          You are being forwarded to Google&apos;s official encrypted sign-in portal.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5846A8] dark:text-purple-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
