"use client";

import React from "react";
import Link from "next/link";
import {
  Send,
  Calendar,
  MessageSquare,
  BarChart3,
  Users,
  Sparkles,
  Shield,
  Layers,
  Radio,
  Smartphone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function FeaturesPage() {
  const featureList = [
    {
      id: "publishing",
      title: "1. Social Media Publishing and Scheduling",
      desc: "Universal post composer with multi-platform previews, real character counts, automated aspect-ratio verification, video constraints, and instant or queued publishing.",
      icon: Send,
      ctaHref: "/compose",
      ctaLabel: "Open Post Composer",
      points: [
        "Live native previews for Instagram, Facebook, LinkedIn, X, and YouTube",
        "Strict platform limit validation preventing failed publishes",
        "Persistent background worker queue with automatic retry policies",
      ],
    },
    {
      id: "calendar",
      title: "2. Visual Content Calendar",
      desc: "Intuitive publishing calendar to plan and coordinate multi-channel campaigns. Switch across Month, Week, and Day views with fluid drag-and-drop rescheduling.",
      icon: Calendar,
      ctaHref: "/calendar",
      ctaLabel: "Launch Visual Calendar",
      points: [
        "Drag-and-drop rescheduling synchronized to database timestamps",
        "Color-coded channel chips and post status indicators",
        "Timezone-aware scheduling tailored to global audience windows",
      ],
    },
    {
      id: "inbox",
      title: "3. Unified Social Inbox",
      desc: "Consolidate inbound customer comments, mentions, and private messages across all connected channels into a single, high-speed unified response center.",
      icon: MessageSquare,
      ctaHref: "/inbox",
      ctaLabel: "View Social Inbox",
      points: [
        "Real-time synchronized comment threads with authentic author metadata",
        "Direct API-backed reply dispatch with zero mock delays",
        "Unread tracking, teammate assignment, and internal resolution flags",
      ],
    },
    {
      id: "monitor",
      title: "4. Social Listening and Brand Monitoring",
      desc: "Track brand keywords, competitors, hashtags, and industry sentiment across networks to capture high-intent leads and manage reputation in real time.",
      icon: Radio,
      ctaHref: "/monitor",
      ctaLabel: "Open Listening Center",
      points: [
        "Custom keyword, hashtag, and brand mention listening streams",
        "Multi-column live feed interface for instant team awareness",
        "Sentiment filtering to catch critical customer inquiries immediately",
      ],
    },
    {
      id: "analytics",
      title: "5. Cross-Platform Analytics and Reporting",
      desc: "Transparent telemetry and genuine provider metrics. Monitor impressions, reach, engagements, follower growth, and top-performing content without fake data.",
      icon: BarChart3,
      ctaHref: "/analytics",
      ctaLabel: "Explore Analytics",
      points: [
        "Authenticated API metrics with transparent sync timestamps",
        "Explicit engagement rate calculations and multi-platform comparisons",
        "One-click exportable CSV and PDF reports for executive stakeholders",
      ],
    },
    {
      id: "ai-assistant",
      title: "6. AI-Powered Caption and Content Assistance",
      desc: "Harness Google Gemini 2.5 Flash on the server for viral hooks, hashtag optimization, platform repurposing, tone adaptation, and calendar ideas.",
      icon: Sparkles,
      ctaHref: "/ai-assistant",
      ctaLabel: "Try AI Assistant",
      points: [
        "Audience-targeted caption writing and hook variations",
        "Hashtag generator categorized by primary, niche, and branded reach",
        "Saved drafts and full generation audit history in the database",
      ],
    },
    {
      id: "approvals",
      title: "7. Team Collaboration and Post Approvals",
      desc: "Built-in approval workflows preventing unauthorized or unreviewed posts from publishing. Ensure quality control across junior copywriters and clients.",
      icon: Users,
      ctaHref: "/approvals",
      ctaLabel: "Manage Approvals",
      points: [
        "Granular RBAC: Owner, Admin, Manager, Editor, Analyst, and Viewer",
        "Formal draft review requests with rejection notes and revision loops",
        "Immutable audit log tracking every action, user, and IP address",
      ],
    },
    {
      id: "workspaces",
      title: "8. Multi-Brand and Agency Workspaces",
      desc: "Manage multiple client brands or business units under one login with strict data isolation. Never cross-contaminate client social tokens, posts, or metrics.",
      icon: Layers,
      ctaHref: "/brand-boards",
      ctaLabel: "View Brand Workspaces",
      points: [
        "One-click brand switching with dedicated settings and color schemes",
        "Separate OAuth credentials and token isolation per workspace",
        "Client portal mode with customizable permissions and views",
      ],
    },
    {
      id: "security",
      title: "9. Secure Social Account Management",
      desc: "Enterprise hardware-grade token protection. Social access and refresh tokens are encrypted at rest with AES-256-GCM authenticated cipher with key rotation.",
      icon: Shield,
      ctaHref: "/connections",
      ctaLabel: "Inspect Social Connections",
      points: [
        "Every platform integration is built strictly on official public and partner APIs utilizing secure cryptographic OAuth 2.0 flows.",
        "AES-256-GCM encryption with 16-byte random IVs and integrity tags",
        "Automated token refresh before expiry and transparent reconnect notifications",
      ],
    },
    {
      id: "mobile",
      title: "10. Mobile-Responsive Workflows",
      desc: "Responsive web application engineered to operate seamlessly across mobile, tablet, and desktop viewports with fluid touch controls and instant notifications.",
      icon: Smartphone,
      ctaHref: "/dashboard",
      ctaLabel: "Experience Dashboard",
      points: [
        "Full composer, calendar, and inbox navigation on mobile devices",
        "Server-side session synchronization across all logged-in devices",
        "Accessible, high-contrast layouts conforming to WCAG 2.1 AA standards",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      <MarketingHeader />

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Enterprise Social Operations
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            10 Pillars of Modern Social Media Management
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            SocialPulse replaces disconnected point tools with a single unified, production-grade social operations platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featureList.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.id}
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
                        <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href={f.ctaHref}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>{f.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/signup"
                    className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                  >
                    Start Free Trial →
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
