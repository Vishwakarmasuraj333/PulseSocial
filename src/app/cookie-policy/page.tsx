"use client";

import React from "react";
import Link from "next/link";
import { Cookie, ArrowLeft, Shield, Sliders, CheckCircle2 } from "lucide-react";
import {
  COOKIE_CATEGORIES,
  CURRENT_POLICY_VERSION,
  LAST_POLICY_UPDATE,
} from "@/lib/consent/consent-config";

export default function CookiePolicyPage() {
  const handleOpenSettings = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pulsesocial_open_cookie_settings"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to PulseSocial Home</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenSettings}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Open Cookie Settings</span>
          </button>
        </div>

        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Cookie Policy
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Version {CURRENT_POLICY_VERSION} • Last updated: {LAST_POLICY_UPDATE}
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 text-sm space-y-8 leading-relaxed">
          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>1. Overview & Privacy Principles</span>
            </h2>
            <p>
              PulseSocial (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies and similar storage technologies to operate our platform securely, preserve your user preferences, and collect anonymous aggregate performance telemetry.
            </p>
            <p>
              We believe in explicit, genuine privacy choices. Non-essential cookies are disabled by default until you grant explicit consent. You can view, customize, or withdraw your cookie consent choices at any time by clicking{" "}
              <button
                type="button"
                onClick={handleOpenSettings}
                className="text-purple-400 underline underline-offset-4 hover:text-purple-300 font-semibold cursor-pointer"
              >
                Cookie settings
              </button>{" "}
              in the site footer or this page.
            </p>
            <p>
              For complete details on how we process and protect personal data, please review our{" "}
              <Link
                href="/privacy"
                className="text-purple-400 underline underline-offset-4 hover:text-purple-300 font-semibold"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white">2. Categories of Cookies We Use</h2>

            {COOKIE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-800/40 rounded-2xl border border-slate-800 p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{cat.name}</h3>
                    {cat.alwaysActive && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Always Active
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {cat.alwaysActive ? "Essential" : "Optional (Default: Disabled)"}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{cat.longDescription}</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700/80 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Cookie Name</th>
                        <th className="py-2.5 px-3">Purpose</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {cat.cookies.map((c) => (
                        <tr key={c.name} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">
                            {c.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{c.purpose}</td>
                          <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{c.duration}</td>
                          <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                            {c.firstParty ? "First-party" : "Third-party"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white">3. Global Privacy Control (GPC)</h2>
            <p>
              PulseSocial respects the Global Privacy Control (Sec-GPC) signal transmitted by compatible browsers. When Sec-GPC is detected, analytical cookies are kept strictly disabled by default.
            </p>
          </section>

          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white">4. Managing & Withdrawing Consent</h2>
            <p>
              You can withdraw or adjust your consent choices at any moment. Simply click the &quot;Cookie settings&quot; link in our website footer or reopen this page and click &quot;Open Cookie Settings&quot;. Withdrawing consent immediately deletes optional cookies from your browser session.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
