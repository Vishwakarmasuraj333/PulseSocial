"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  BookOpen,
  Sparkles,
  Command,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Share2,
  Calendar,
  BarChart3,
  Layers,
  Inbox,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface PulseHelpGuidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
}

const TABS = [
  { id: "guides", label: "Quick Guides", icon: BookOpen },
  { id: "shortcuts", label: "Shortcuts", icon: Command },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "resources", label: "Resources & Support", icon: Sparkles },
];

const GUIDES = [
  {
    title: "Connecting Your Social Channels",
    desc: "Authorize YouTube, Instagram, LinkedIn, TikTok, X, Facebook, Pinterest & Google Business via official OAuth.",
    href: "/connections",
    icon: Share2,
    badge: "Essential",
  },
  {
    title: "Multi-Platform Post Composer",
    desc: "Draft once, customize per network, and broadcast with automated character cap validation and hashtag suggestions.",
    href: "/posts/new",
    icon: Layers,
    badge: "Publishing",
  },
  {
    title: "Interactive Content Calendar",
    desc: "Drag and drop scheduled posts, manage time slots, and view queue capacity across weekly and monthly grids.",
    href: "/calendar",
    icon: Calendar,
    badge: "Planning",
  },
  {
    title: "Unified Analytics & Engagement",
    desc: "Track follower trends, reach, engagement rates, and top-performing creatives in a single real-time dashboard.",
    href: "/analytics",
    icon: BarChart3,
    badge: "Metrics",
  },
  {
    title: "Unified Multichannel Inbox",
    desc: "Reply to customer DMs, moderate comments, and track brand mentions without switching platform apps.",
    href: "/inbox",
    icon: Inbox,
    badge: "Engagement",
  },
];

const SHORTCUTS = [
  { key: "Ctrl + K", desc: "Open global command palette & search" },
  { key: "Ctrl + N", desc: "Open new post studio composer" },
  { key: "Ctrl + Enter", desc: "Publish or schedule current post draft" },
  { key: "Esc", desc: "Dismiss active modal or popup" },
  { key: "G then D", desc: "Go to Main Dashboard" },
  { key: "G then C", desc: "Go to Content Calendar" },
  { key: "G then A", desc: "Go to Analytics" },
];

const FAQS = [
  {
    q: "How do I connect Instagram or TikTok accounts?",
    a: "Navigate to Social Connections from the sidebar. Click 'Continue with Instagram' or 'Continue with TikTok' to authorize permissions directly through the official provider OAuth dialog.",
  },
  {
    q: "Can I upload high-definition videos and reels?",
    a: "Yes! PulseSocial supports MP4, WebM, and MOV video formats up to 60MB, as well as PNG, JPG, WebP, and animated GIFs.",
  },
  {
    q: "How does PulseAI handle network character caps?",
    a: "PulseAI automatically detects your target platform (e.g. 280 chars for X, 2,200 for Instagram, 3,000 for LinkedIn) and tailors hooks and hashtag density accordingly.",
  },
  {
    q: "Are my social account credentials and tokens secure?",
    a: "Tokens are encrypted using cryptographic standards. Your personal passwords are never stored or accessed.",
  },
];

export function PulseHelpGuidesModal({
  isOpen,
  onClose,
  onOpenFeedback,
}: PulseHelpGuidesModalProps) {
  const [activeTab, setActiveTab] = useState<string>("guides");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!isOpen) return null;

  const filteredGuides = GUIDES.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                PulseSocial Help & Guides
              </h2>
              <p className="text-xs text-slate-400">
                Interactive platform documentation, keyboard shortcuts, and FAQs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-2 rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, shortcuts, FAQs, or workflows..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 shrink-0 ${
                  isActive
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: GUIDES */}
          {activeTab === "guides" && (
            <div className="space-y-3">
              {filteredGuides.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No matching guides found. Try another search term.
                </p>
              ) : (
                filteredGuides.map((guide, idx) => {
                  const Icon = guide.icon;
                  return (
                    <Link
                      key={idx}
                      href={guide.href}
                      onClick={onClose}
                      className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-xs transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                              {guide.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {guide.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-1">
                            {guide.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0" />
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Boost your social publishing speed with global desktop keyboard shortcuts:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SHORTCUTS.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between"
                  >
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {sc.desc}
                    </span>
                    <kbd className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs shrink-0 ml-2">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FAQS */}
          {activeTab === "faqs" && (
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No matching FAQs found.
                </p>
              ) : (
                filteredFaqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-black">Q.</span>
                      {faq.q}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-4 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: RESOURCES & SUPPORT */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="/solutions"
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-blue-500 transition group block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                      Enterprise Solutions
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Explore multi-brand governance, team approval workflows, and audit logging.
                  </p>
                </a>

                <a
                  href="/privacy"
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-blue-500 transition group block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                      Privacy & Security
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Review official OAuth scopes, data retention policies, and account disconnect steps.
                  </p>
                </a>
              </div>

              {/* Direct Feedback banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">Have a feature request or question?</h4>
                  <p className="text-[11px] text-blue-100 mt-0.5">
                    Our team reviews creator feedback every day.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFeedback?.();
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All Systems Operational (v2.8 Production)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
