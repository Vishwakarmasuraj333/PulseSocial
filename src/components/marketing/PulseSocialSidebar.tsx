"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Radio,
  Sparkles,
} from "lucide-react";

interface SocialChannel {
  id: string;
  name: string;
  tagline: string;
  color: string;
  glow: string;
  logo: string;
  badge: string;
  features: string[];
}

export function PulseSocialSidebar() {
  // Default to collapsed so it never obstructs landing page content
  const [isOpen, setIsOpen] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [activeModalChannel, setActiveModalChannel] = useState<SocialChannel | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setActiveModalChannel(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const channels: SocialChannel[] = [
    {
      id: "instagram",
      name: "Instagram",
      tagline: "Reels, Stories & Direct Carousels",
      color: "#E1306C",
      glow: "rgba(225, 48, 108, 0.4)",
      logo: "/images/social/logos/instagram.svg",
      badge: "Direct Publish",
      features: [
        "Direct desktop Reel & Carousel publishing",
        "Automated first-comment hashtag recommendations",
        "Best-time predictive scheduling with 94% reach boost",
        "Unified Direct Message & Comment reply stream",
      ],
    },
    {
      id: "facebook",
      name: "Facebook",
      tagline: "Pages, Groups & 4K Video Distribution",
      color: "#1877F2",
      glow: "rgba(24, 119, 242, 0.4)",
      logo: "/images/social/logos/facebook.svg",
      badge: "Meta Verified",
      features: [
        "Multi-page & community group syndication",
        "SmartQ audience activity heatmaps",
        "Lead ad capture synchronized to your CRM",
        "Automated link preview customization",
      ],
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      tagline: "Thread Scheduling & Live Tracking",
      color: "#0F172A",
      glow: "rgba(15, 23, 42, 0.4)",
      logo: "/images/social/logos/twitter.svg",
      badge: "API v2 Ready",
      features: [
        "10+ tweet automated thread scheduler with timed delays",
        "Live keyword & brand mention listening stream",
        "Automated repost timings for maximum virality",
        "Media attachments with custom alt text",
      ],
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      tagline: "Company Pages & Executive Profiles",
      color: "#0A66C2",
      glow: "rgba(10, 102, 194, 0.4)",
      logo: "/images/social/logos/linkedin-icon.svg",
      badge: "B2B Partner",
      features: [
        "Multi-page PDF swipeable document carousels",
        "Employee advocacy auto-tagging workflows",
        "Executive personal profile post scheduling",
        "B2B lead generation & connection analytics",
      ],
    },
    {
      id: "youtube",
      name: "YouTube",
      tagline: "Shorts & Long-form Video Sync",
      color: "#FF0000",
      glow: "rgba(255, 0, 0, 0.4)",
      logo: "/images/social/logos/youtube-icon.svg",
      badge: "4K Upload",
      features: [
        "4K UHD direct video uploads with custom thumbnails",
        "Automated timestamped chapter markers",
        "YouTube Shorts multi-platform distribution",
        "Audience retention & subscriber growth graphs",
      ],
    },
    {
      id: "tiktok",
      name: "TikTok",
      tagline: "Viral Sound Trends & Instant Publishing",
      color: "#000000",
      glow: "rgba(0, 242, 234, 0.4)",
      logo: "/images/social/logos/tiktok-icon.svg",
      badge: "Sound Sync",
      features: [
        "Trending commercial audio track library sync",
        "Direct desktop TikTok publishing without app notifications",
        "Hashtag challenge velocity analytics",
        "High-engagement video hook suggestions",
      ],
    },
    {
      id: "pinterest",
      name: "Pinterest",
      tagline: "Shoppable Boards & High-Intent Idea Pins",
      color: "#E60023",
      glow: "rgba(230, 0, 35, 0.4)",
      logo: "/images/social/logos/pinterest-icon.svg",
      badge: "Visual Search",
      features: [
        "Rich Idea Pins scheduled up to 6 months in advance",
        "Direct product tagging for e-commerce stores",
        "Multi-board staggered publishing queues",
        "High-intent search query optimization",
      ],
    },
    {
      id: "threads",
      name: "Threads",
      tagline: "Text-first Connected Conversations",
      color: "#000000",
      glow: "rgba(168, 85, 247, 0.4)",
      logo: "/images/social/logos/threads-icon.svg",
      badge: "Direct Sync",
      features: [
        "Instant Instagram-to-Threads cross-posting",
        "Conversational reply stream management",
        "Text, photo & video thread scheduling",
        "Real-time sentiment and audience engagement",
      ],
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      tagline: "Channel Broadcasts & Direct Support",
      color: "#25D366",
      glow: "rgba(37, 211, 102, 0.4)",
      logo: "/images/social/logos/whatsapp-icon.svg",
      badge: "Cloud API",
      features: [
        "One-click multi-channel broadcast messages",
        "Social leads converted directly to 1-on-1 chat",
        "99.2% open-rate delivery predictions",
        "Automated customer service FAQs",
      ],
    },
    {
      id: "bluesky",
      name: "Bluesky",
      tagline: "Open AT Protocol Social Network",
      color: "#1185FE",
      glow: "rgba(17, 133, 254, 0.4)",
      logo: "/images/social/logos/bluesky-icon.svg",
      badge: "Decentralized",
      features: [
        "AT Protocol native publishing without rate limits",
        "Custom algorithmic feed scheduling",
        "Open-social federation cross-posting",
        "Organic viral reach tracking",
      ],
    },
    {
      id: "google",
      name: "Google Business",
      tagline: "Local SEO Posts, Offers & Reviews",
      color: "#4285F4",
      glow: "rgba(66, 133, 244, 0.4)",
      logo: "/images/social/logos/google.svg",
      badge: "Local SEO",
      features: [
        "Google Maps & Search listing event updates",
        "Limited-time promotional discount cards",
        "Unified customer review monitoring & reply",
        "Local foot-traffic search impressions",
      ],
    },
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* 1. FLOATING SLEEK TOGGLE PILL (Always Visible & Accessible) */}
      {/* ======================================================== */}
      {!isOpen && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 pl-2.5 pr-2 py-3 rounded-l-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-r-0 border-slate-200/90 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:pl-3 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
            title="Open connected social channels dock"
            aria-label="Open connected channels"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:-translate-x-0.5 transition-all" />
            <div className="relative">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#1E3A8A] via-[#2E3788] to-[#4F46E5] flex items-center justify-center text-white font-black text-[11px] shadow-sm">
                PS
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SLIDE-OUT EXPANDED DOCK (Clean, High-Tech Glass Panel) */}
      {/* ======================================================== */}
      {isOpen && (
        <aside
          aria-label="PulseSocial Connected Networks Dock"
          className="fixed right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-40 select-none animate-in slide-in-from-right-4 fade-in duration-300"
        >
          <div className="relative flex items-center">
            {/* Close / Collapse Button on Left Tab */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Collapse Social Sidebar"
              className="absolute -left-7 top-1/2 -translate-y-1/2 w-7 h-12 rounded-l-xl bg-slate-900/95 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xl hover:w-8 active:scale-95 transition-all cursor-pointer border border-r-0 border-slate-700/50 dark:border-slate-300 group"
              title="Collapse dock"
            >
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Vertical Glass Dock Panel */}
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_16px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] ring-1 ring-slate-900/5 max-h-[90vh] overflow-y-auto">
              {/* Header with PS Logo and Close */}
              <div className="flex items-center justify-between w-full px-1 pb-1.5 border-b border-slate-200/70 dark:border-slate-800/90">
                <div className="relative">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#1E3A8A] via-[#2E3788] to-[#4F46E5] flex items-center justify-center text-white font-black text-[10px] shadow-sm">
                    PS
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900 animate-pulse" />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-5 h-5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
                  title="Close sidebar"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Channels List */}
              <div className="flex flex-col gap-1.5">
                {channels.map((ch) => {
                  const isHovered = activeHover === ch.id;

                  return (
                    <div
                      key={ch.id}
                      className="relative flex items-center"
                      onMouseEnter={() => setActiveHover(ch.id)}
                      onMouseLeave={() => setActiveHover(null)}
                    >
                      <button
                        onClick={() => setActiveModalChannel(ch)}
                        aria-label={`Inspect ${ch.name} integration`}
                        className="relative w-8 h-8 rounded-xl bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center transition-all duration-200 ease-out hover:scale-115 hover:-translate-x-1 shadow-xs group cursor-pointer"
                        style={{
                          boxShadow: isHovered ? `0 6px 20px ${ch.glow}` : undefined,
                          borderColor: isHovered ? ch.color : undefined,
                        }}
                      >
                        <Image
                          src={ch.logo}
                          alt={ch.name}
                          width={18}
                          height={18}
                          className="w-4.5 h-4.5 object-contain transition-transform duration-200 group-hover:scale-110"
                        />

                        {isHovered && (
                          <span
                            className="absolute inset-0 rounded-xl animate-ping opacity-20 pointer-events-none"
                            style={{ backgroundColor: ch.color }}
                          />
                        )}
                      </button>

                      {/* Left Slide-out Tooltip */}
                      <div
                        className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 ease-out flex items-center z-50 ${
                          isHovered
                            ? "opacity-100 translate-x-0 scale-100"
                            : "opacity-0 translate-x-2 scale-95 pointer-events-none"
                        }`}
                      >
                        <div className="px-3 py-2 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl flex flex-col items-start min-w-[170px]">
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="font-bold text-xs flex items-center gap-1.5 text-white">
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: ch.color }}
                              />
                              {ch.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-emerald-400 font-mono font-semibold">
                              {ch.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-300 mt-0.5 leading-tight">
                            {ch.tagline}
                          </span>
                        </div>
                        <div className="w-2 h-2 bg-slate-900/95 rotate-45 -ml-1 border-r border-t border-slate-700/80" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ======================================================== */}
      {/* 3. INTERACTIVE CHANNEL SHOWCASE MODAL                     */}
      {/* ======================================================== */}
      {activeModalChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
            {/* Top Brand Banner */}
            <div
              className="p-6 text-white relative overflow-hidden"
              style={{ backgroundColor: activeModalChannel.color }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none scale-150">
                <Image
                  src={activeModalChannel.logo}
                  alt={activeModalChannel.name}
                  width={120}
                  height={120}
                  className="filter brightness-0 invert"
                />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md p-2 flex items-center justify-center border border-white/30 shadow-md">
                    <Image
                      src={activeModalChannel.logo}
                      alt={activeModalChannel.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl leading-tight">
                      {activeModalChannel.name}
                    </h3>
                    <p className="text-xs text-white/80 font-medium">
                      {activeModalChannel.tagline}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalChannel(null)}
                  className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Features & Integration Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  Integration Status:
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Direct API Verified (2026)
                </span>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Included Capabilities:
                </div>
                {activeModalChannel.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Security & Access Protection Notice */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
                <span className="text-sm">🔒</span>
                <div className="leading-snug">
                  <span className="font-bold">Authentication Required:</span> You must sign up for a free 15-day trial or log in to connect your {activeModalChannel.name} accounts and schedule posts.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setActiveModalChannel(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/login?redirectTo=/connections&provider=${activeModalChannel.id}`}
                    onClick={() => setActiveModalChannel(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                  >
                    Log In
                  </Link>

                  <Link
                    href={`/signup?redirectTo=/compose&provider=${activeModalChannel.id}`}
                    onClick={() => setActiveModalChannel(null)}
                    className="px-5 py-2.5 rounded-xl bg-[#DF3024] hover:bg-[#c82317] text-white font-bold text-xs shadow-md shadow-red-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Sign Up Free to Connect</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
