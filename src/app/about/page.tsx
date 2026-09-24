"use client";

import React from "react";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Shield, Sparkles, Globe, Users, Zap, CheckCircle2, ArrowRight, Lock } from "lucide-react";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "100% Official API Access",
      desc: "We strictly connect through official developer platforms (Meta Graph, LinkedIn OAuth, X API, TikTok Login Kit). Zero scraping, zero password collection.",
    },
    {
      icon: Lock,
      title: "Hardware-Grade Security",
      desc: "All third-party access tokens and refresh tokens are encrypted at rest using AES-256-GCM. We never store social network login credentials.",
    },
    {
      icon: Globe,
      title: "Unified Cross-Platform Reach",
      desc: "Publishing and engaging across 9+ social networks should not require 9 browser tabs. PulseSocial unifies content pipelines effortlessly.",
    },
    {
      icon: Users,
      title: "Enterprise Collaboration",
      desc: "Built with granular roles (Owner, Admin, Editor, Analyst, Viewer) so teams can collaborate on scheduled posts with complete peace of mind.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <MarketingHeader />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
            <span>Our Mission</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
            Manage Every Social. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
              From One Place.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-5 leading-relaxed">
            PulseSocial was born out of frustration with fragmented social media tools that require users to share social account passwords or rely on unstable browser automation. We built a production-grade, secure SaaS workspace where teams can plan, compose, schedule, and analyze their digital footprint with total trust.
          </p>
        </div>

        {/* Pillars / Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {v.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Architecture Guarantee */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-2xl relative overflow-hidden mb-20">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Zero Compromise
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              A Platform Engineered for Privacy & Scale
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              PulseSocial strictly verifies third-party OAuth states on every callback to prevent CSRF exploits. We maintain rigorous token refresh handling and immediate token revocation upon channel disconnect.
            </p>
            <div className="pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                <span>Launch Your Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
