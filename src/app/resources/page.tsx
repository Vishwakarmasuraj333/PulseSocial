"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, FileText, HelpCircle, Code, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function ResourcesPage() {
  const resourceCategories = [
    {
      title: "Getting Started & Tutorials",
      desc: "Step-by-step guides on connecting social networks, organizing publishing queues, and configuring team approver roles.",
      icon: BookOpen,
      links: [
        { label: "Connecting your first Facebook Page & Instagram account", href: "/onboarding/social-connect" },
        { label: "Setting up automated weekly publishing time slots", href: "/calendar" },
        { label: "Inviting team members and configuring role boundaries", href: "/team" },
      ],
    },
    {
      title: "Official API Documentation",
      desc: "Technical documentation covering Meta Graph API, LinkedIn Community Management, X v2 endpoints, and webhooks.",
      icon: Code,
      links: [
        { label: "OAuth 2.0 State & PKCE Authorization Architecture", href: "/docs" },
        { label: "Inbound Webhook Verification & Real-time Synchronization", href: "/docs" },
        { label: "AES-256 Hardware Encryption Vault Security Whitepaper", href: "/security" },
      ],
    },
    {
      title: "Help Center & Troubleshooting",
      desc: "Answers to common token expiration questions, Instagram Professional account switching, and rate limit best practices.",
      icon: HelpCircle,
      links: [
        { label: "How to fix 'Instagram Token Expired' alerts", href: "/social-accounts" },
        { label: "Resolving Meta Business Page permission missing error", href: "/contact" },
        { label: "Contact dedicated technical engineering support", href: "/contact" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      <MarketingHeader />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Resources & Documentation
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Knowledge Center & Developer Guides
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Everything you need to master multi-network publishing, configure official APIs, and grow your digital audience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resourceCategories.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                    {c.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {c.desc}
                  </p>

                  <ul className="space-y-3 text-xs">
                    {c.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center justify-between group"
                        >
                          <span className="truncate pr-2">{link.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
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
