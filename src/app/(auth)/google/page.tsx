"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, ShieldCheck, ChevronDown, ChevronUp, ExternalLink, Check } from "lucide-react";

interface GoogleAccountOption {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isDefault?: boolean;
}

const DEFAULT_ACCOUNTS: GoogleAccountOption[] = [
  {
    id: "suraj",
    name: "Suraj Vishwakarma",
    email: "suraj@pulsesocial.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isDefault: true,
  },
  {
    id: "admin",
    name: "PulseSocial Workspace Lead",
    email: "admin@pulsesocial.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
];

export default function GoogleSignInPage() {
  const router = useRouter();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Custom Google account input mode
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  // Developer configuration dropdown
  const [showDevGuide, setShowDevGuide] = useState(false);

  const handleSelectAccount = async (account: GoogleAccountOption) => {
    setSelectedAccountId(account.id);
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/google/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email,
          name: account.name,
          avatarUrl: account.avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in with Google.");
      }

      window.location.href = data.redirectTo || "/dashboard";
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Google authentication failed.");
      setIsSubmitting(false);
      setSelectedAccountId(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes("@")) {
      setErrorMessage("Please enter a valid Google email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/google/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customEmail.trim(),
          name: customName.trim() || customEmail.split("@")[0],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in with Google.");
      }

      window.location.href = data.redirectTo || "/dashboard";
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Google authentication failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 font-sans p-4 select-none">
      <div className="w-full max-w-[448px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8 sm:p-10 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Google G Brand Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <svg className="w-10 h-10 mb-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>

          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Choose an account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            to continue to <strong className="font-semibold text-violet-600 dark:text-violet-400">PulseSocial</strong>
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Account Selection List */}
        {!isCustomMode ? (
          <div className="space-y-2 mb-6">
            {DEFAULT_ACCOUNTS.map((acc) => {
              const isSelected = selectedAccountId === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSelectAccount(acc)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                    isSelected
                      ? "border-violet-500 bg-violet-50/70 dark:bg-violet-950/20"
                      : "border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {acc.name}
                        </span>
                        {acc.isDefault && (
                          <span className="px-1.5 py-0.2 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 text-[10px] font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {acc.email}
                      </p>
                    </div>
                  </div>

                  {isSelected && isSubmitting ? (
                    <Loader2 className="w-4 h-4 text-violet-600 animate-spin shrink-0 ml-2" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 ml-2">
                      <div className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Option to use another Google account */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsCustomMode(true)}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium">Use another Google account</span>
              </div>
            </button>
          </div>
        ) : (
          /* Custom Google Account Form */
          <form onSubmit={handleCustomSubmit} className="space-y-3.5 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Google Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !customEmail.trim()}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Sign in"}
              </button>
            </div>
          </form>
        )}

        {/* Security & Permissions Disclaimer */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-center mb-6">
          To continue, Google will share your name, email address, language preference, and profile picture with PulseSocial.
        </p>

        {/* Back to Standard Sign In */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDevGuide(!showDevGuide)}
            className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>Cloud OAuth Config</span>
            {showDevGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Developer Guide Dropdown */}
        {showDevGuide && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Production Google Cloud Credentials</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              To route through Google&apos;s live OAuth server in production, add your credentials in <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">.env</code>:
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[10px] space-y-1 overflow-x-auto select-all">
              <div>GOOGLE_CLIENT_ID=&quot;your_id.apps.googleusercontent.com&quot;</div>
              <div>GOOGLE_CLIENT_SECRET=&quot;your_secret&quot;</div>
              <div>GOOGLE_REDIRECT_URI=&quot;http://localhost:3000/api/auth/google/callback&quot;</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
