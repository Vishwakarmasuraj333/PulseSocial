"use client";

import React from "react";
import Link from "next/link";
import {
  Send,
  Calendar,
  MessageSquare,
  Clock,
  BarChart3,
  Share2,
  Users,
  Sparkles,
  Shield,
  Layers,
  FileSpreadsheet,
  Radio,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function FeaturesPage() {
  const featureList = [
    {
      id: "publishing",
      title: "Universal Multi-Platform Composer",
      desc: "Write once, preview everywhere. Automatic aspect-ratio verification, video duration checks, and per-platform character counts for Meta, LinkedIn, X, TikTok, and YouTube.",
      icon: Send,
      points: ["Character counter with native truncation rules", "Media drag & drop with automated format conversion", "Drafts, immediate publishing, and recurring queues"],
    },
    {
      id: "calendar",
      title: "Visual Content Calendar",
      desc: "A responsive birds-eye timeline of every piece of scheduled content. Switch between Month, Week, Day, and List views with full drag-and-drop rescheduling.",
      icon: Calendar,
      points: ["Color-coded channel badges", "Immediate rescheduling and time-slot locking", "Detailed inspection drawer for team approvals"],
    },
    {
      id: "inbox",
      title: "Unified Social Inbox",
      desc: "Never miss a customer inquiry, high-intent lead, or comment. Consolidate interactions across Facebook, Instagram, LinkedIn, and X into a single two-pane thread stream.",
      icon: MessageSquare,
      points: ["Real interaction threads with author avatars", "One-click inline replies dispatched directly through official APIs", "Conversation status flags and team member assignment"],
    },
    {
      id: "analytics",
      title: "Real-Time Telemetry & Analytics",
      desc: "True official metrics without fabricated guesswork. Monitor organic impressions, engagement curves, profile clicks, and follower growth with exportable PDF and CSV reports.",
      icon: BarChart3,
      points: ["Cross-channel performance comparison", "Aggregated reach and impression curves", "Zero fake numbers: transparent API data only"],
    },
    {
      id: "security",
      title: "Hardware-Grade AES-256 Vault",
      desc: "All OAuth 2.0 access tokens and refresh tokens are encrypted at rest with AES-256-GCM hardware encryption. We never collect or store third-party user passwords.",
      icon: Shield,
      points: ["Zero password collection", "Cryptographic state and PKCE validation", "Automated token refresh before expiration"],
    },
    {
      id: "team",
      title: "Role-Based Team Collaboration",
      desc: "Safely scale your social team. Assign members granular roles (Owner, Admin, Editor, Analyst, Viewer) with optional mandatory post approvals before publishing.",
      icon: Users,
      points: ["Custom channel access permissions", "Approval workflows for junior copywriters", "Complete audit trail of all workspace actions"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      <MarketingHeader />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Platform Capabilities
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Built for Serious Social Media Operations
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            PulseSocial replaces multiple disconnected point solutions with a single, high-performance workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featureList.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                id={f.id}
                className="scroll-mt-32 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-2">
                    {f.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {f.desc}
                  </p>
                  <ul className="space-y-2.5 mb-6 text-xs text-slate-700 dark:text-slate-300">
                    {f.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Try in workspace</span>
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
