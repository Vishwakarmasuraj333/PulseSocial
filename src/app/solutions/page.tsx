"use client";

import React from "react";
import Link from "next/link";
import { Users, Building2, Briefcase, Sparkles, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function SolutionsPage() {
  const solutions = [
    {
      title: "Content Creators & Solo Founders",
      desc: "Stop tab-hopping across 6 apps. Draft once, customize for your core platforms, schedule a month in advance, and focus on building your audience.",
      icon: Sparkles,
      tag: "Creators",
      benefits: ["Unified calendar with visual drag-and-drop", "AI caption generation with tailored tone", "Automated link embeds and first-comment pinning"],
    },
    {
      title: "Marketing Agencies & Social Managers",
      desc: "Manage multiple brands without account mix-ups. Switch between client workspaces seamlessly, assign approver privileges, and share live client review links.",
      icon: Briefcase,
      tag: "Agencies",
      benefits: ["Isolated client workspaces and brand palettes", "Client post approval workflows before dispatch", "Automated executive summary exports (PDF & CSV)"],
    },
    {
      title: "Fast-Growing Small & Medium Businesses",
      desc: "Turn social media from a time-sink into a reliable customer acquisition channel. Track what content drives profile clicks and reply to customer inquiries instantly.",
      icon: TrendingUp,
      tag: "SMBs",
      benefits: ["Two-pane social inbox for lead capture", "Customer review monitoring on Google Business", "Team member roles with custom channel access"],
    },
    {
      title: "Enterprise Brands & Global Teams",
      desc: "Enterprise-grade governance, hardware token vaults, and audit logs. Comply with regulatory requirements while scaling global multi-region social teams.",
      icon: Building2,
      tag: "Enterprises",
      benefits: ["AES-256-GCM hardware-grade OAuth vault", "SOC2 compliance and complete audit trail", "Dedicated account managers and custom API access"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      <MarketingHeader />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Tailored Solutions
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Designed for the Way You Work
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Whether you are a solo creator scheduling weekly content or a global marketing agency managing 50 client brands, PulseSocial scales to your exact needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {s.tag}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-2">
                    {s.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {s.desc}
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-slate-700 dark:text-slate-300">
                    {s.benefits.map((b) => (
                      <div key={b} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Get started with this workflow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
