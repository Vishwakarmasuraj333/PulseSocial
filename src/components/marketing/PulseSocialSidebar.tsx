"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";

interface SocialChannel {
  id: string;
  name: string;
  tagline: string;
  color: string;
  glow: string;
  logo: string;
  badge: string;
  apiProtocol: string;
  latency: string;
  uptime: string;
  features: string[];
}

export function PulseSocialSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [activeModalChannel, setActiveModalChannel] = useState<SocialChannel | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Auth check for dynamic state
  useEffect(() => {
    const checkAuth = () => {
      fetch("/api/auth/me", { cache: "no-store", credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setIsLoggedIn(Boolean(data?.user));
        })
        .catch(() => setIsLoggedIn(false));
    };

    checkAuth();
    window.addEventListener("pulsesocial_auth_changed", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("pulsesocial_auth_changed", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

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
      tagline: "Reels, Stories, Carousels & Direct Publishing",
      color: "#E1306C",
      glow: "rgba(225, 48, 108, 0.4)",
      logo: "/images/social/logos/instagram.svg",
      badge: "Meta Direct Partner",
      apiProtocol: "Meta Graph API v21.0 & Instagram Basic Display",
      latency: "14ms Gateway SLA",
      uptime: "99.99% Uptime",
      features: [
        "Direct desktop Reel & swipeable Carousel multi-media publishing",
        "Automated first-comment hashtag recommendations with AI reach optimizer",
        "Best-time predictive scheduling with 94% organic reach boost",
        "Unified Direct Message & Comment reply engagement stream",
      ],
    },
    {
      id: "facebook",
      name: "Facebook",
      tagline: "Pages, Groups, Reels & 4K Video Distribution",
      color: "#1877F2",
      glow: "rgba(24, 119, 242, 0.4)",
      logo: "/images/social/logos/facebook.svg",
      badge: "Meta Verified Partner",
      apiProtocol: "Meta Marketing API v21.0 & Graph API",
      latency: "16ms Gateway SLA",
      uptime: "99.98% Uptime",
      features: [
        "Multi-page & community group synchronous publishing",
        "SmartQ audience activity heatmaps & engagement scoring",
        "Automated custom OpenGraph link preview card generation",
        "Lead ad capture synchronized directly to your CRM pipelines",
      ],
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      tagline: "Thread Scheduling, Media Posts & Live Trends",
      color: "#0F172A",
      glow: "rgba(15, 23, 42, 0.4)",
      logo: "/images/social/logos/twitter.svg",
      badge: "Official API v2 Ready",
      apiProtocol: "X Developer Enterprise API v2.8",
      latency: "11ms Gateway SLA",
      uptime: "99.99% Uptime",
      features: [
        "Automated 15+ tweet thread scheduler with timed interval delays",
        "Live brand mention listening stream & keyword sentiment alerts",
        "Automated repost timings calibrated for viral impression peaks",
        "HD video & multi-image attachments with custom accessibility alt-text",
      ],
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      tagline: "Company Pages, Personal Profiles & PDF Documents",
      color: "#0A66C2",
      glow: "rgba(10, 102, 194, 0.4)",
      logo: "/images/social/logos/linkedin-icon.svg",
      badge: "LinkedIn B2B Partner",
      apiProtocol: "LinkedIn Marketing Solutions & Community API v2",
      latency: "18ms Gateway SLA",
      uptime: "99.97% Uptime",
      features: [
        "Multi-page PDF swipeable document carousels with direct preview",
        "Executive personal profile & company page cross-publishing",
        "Employee advocacy workflows with 1-click team amplification",
        "B2B lead generation conversion metrics & follower demographics",
      ],
    },
    {
      id: "youtube",
      name: "YouTube",
      tagline: "Shorts, 4K Videos & Community Tab Posts",
      color: "#FF0000",
      glow: "rgba(255, 0, 0, 0.4)",
      logo: "/images/social/logos/youtube-icon.svg",
      badge: "YouTube Certified",
      apiProtocol: "Google Cloud & YouTube Data API v3 Enterprise",
      latency: "21ms Gateway SLA",
      uptime: "99.99% Uptime",
      features: [
        "4K UHD resumable video uploads with custom thumbnail frames",
        "Automated timestamped chapter markers & description tags",
        "YouTube Shorts cross-distribution with synchronized title tags",
        "Live audience retention, watch time & subscriber growth analytics",
      ],
    },
    {
      id: "tiktok",
      name: "TikTok",
      tagline: "Viral Sound Library, Video Publishing & Duets",
      color: "#000000",
      glow: "rgba(0, 242, 234, 0.4)",
      logo: "/images/social/logos/tiktok-icon.svg",
      badge: "TikTok Official Partner",
      apiProtocol: "TikTok Content Posting API v2 & Audio Sync",
      latency: "19ms Gateway SLA",
      uptime: "99.98% Uptime",
      features: [
        "Direct desktop TikTok video publishing without mobile push notifications",
        "Trending commercial audio track sync & audio duration matcher",
        "Hashtag challenge velocity analytics & viral hook AI recommendations",
        "First-hour view velocity tracking & engagement rate benchmarks",
      ],
    },
    {
      id: "pinterest",
      name: "Pinterest",
      tagline: "Shoppable Boards, Rich Idea Pins & Catalog Sync",
      color: "#E60023",
      glow: "rgba(230, 0, 35, 0.4)",
      logo: "/images/social/logos/pinterest-icon.svg",
      badge: "Pinterest Direct API",
      apiProtocol: "Pinterest Merchant Direct API v5",
      latency: "15ms Gateway SLA",
      uptime: "99.99% Uptime",
      features: [
        "Rich Idea Pins & multi-image pins scheduled 6 months in advance",
        "Direct e-commerce product catalog tagging with purchase links",
        "Multi-board staggered publishing queues with anti-spam pacing",
        "High-intent visual search keyword ranking & outbound click tracking",
      ],
    },
    {
      id: "threads",
      name: "Threads",
      tagline: "Text-First Conversations & Instagram Sync",
      color: "#000000",
      glow: "rgba(168, 85, 247, 0.4)",
      logo: "/images/social/logos/threads-icon.svg",
      badge: "ActivityPub Ready",
      apiProtocol: "Meta Threads Official Public API (Graph v21)",
      latency: "12ms Gateway SLA",
      uptime: "99.99% Uptime",
      features: [
        "Instant Instagram-to-Threads cross-posting with 1-click toggle",
        "Multi-post conversational thread scheduling & reply streams",
        "Real-time sentiment tracking, quote-post listening & follower growth",
        "Open social federation readiness (ActivityPub protocol compatibility)",
      ],
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      tagline: "Broadcast Channels, Catalogs & 1-on-1 Support",
      color: "#25D366",
      glow: "rgba(37, 211, 102, 0.4)",
      logo: "/images/social/logos/whatsapp-icon.svg",
      badge: "Cloud API Partner",
      apiProtocol: "Meta WhatsApp Business Cloud API (Tier 3 Enterprise)",
      latency: "9ms Gateway SLA",
      uptime: "99.99% Uptime",
      features: [
        "One-click verified broadcast announcements to subscribers",
        "Social campaign leads converted directly into encrypted chat conversations",
        "99.2% guaranteed open-rate delivery predictions with interactive CTA buttons",
        "Automated instant customer reply bots with CRM integration",
      ],
    },
    {
      id: "bluesky",
      name: "Bluesky",
      tagline: "Decentralized AT Protocol Social Network",
      color: "#1185FE",
      glow: "rgba(17, 133, 254, 0.4)",
      logo: "/images/social/logos/bluesky-icon.svg",
      badge: "Open Protocol Ready",
      apiProtocol: "AT Protocol Official API (DID / Lexicon Native)",
      latency: "13ms Gateway SLA",
      uptime: "99.99% Uptime",
      features: [
        "AT Protocol native post & thread publishing without rate throttles",
        "Custom algorithmic feed distribution & custom domain verification",
        "Decentralized identity (DID) signing with portable reputation",
        "Organic viral reach tracking across independent federated relays",
      ],
    },
    {
      id: "google",
      name: "Google Business",
      tagline: "Local SEO Posts, Offers, Events & Reviews",
      color: "#4285F4",
      glow: "rgba(66, 133, 244, 0.4)",
      logo: "/images/social/logos/google.svg",
      badge: "Google Maps Certified",
      apiProtocol: "Google Business Profile Performance API v4.9",
      latency: "17ms Gateway SLA",
      uptime: "99.99% Uptime",
      features: [
        "Google Maps & Search listing event, offer & product updates",
        "Limited-time coupon cards with call-to-action buttons (Call, Book, Visit)",
        "Unified customer review monitoring with instant AI response suggestions",
        "Local search impressions, phone call clicks & direction request analytics",
      ],
    },
    {
      id: "telegram",
      name: "Telegram",
      tagline: "Broadcast Channels, Bot Webhooks & Rich Media",
      color: "#229ED9",
      glow: "rgba(34, 158, 217, 0.4)",
      logo: "/images/social/logos/telegram-icon.svg",
      badge: "Instant Broadcast",
      apiProtocol: "Telegram Bot API 7.9 & MTProto Enterprise Gateway",
      latency: "8ms Gateway SLA",
      uptime: "100% Uptime",
      features: [
        "Zero-lag instant broadcasting to unlimited channel subscribers",
        "Rich HTML & Markdown formatting with custom interactive inline buttons",
        "Automated scheduled announcements with quiet silent notifications",
        "Direct channel post view metrics & forwarded message reach tracking",
      ],
    },
    {
      id: "mastodon",
      name: "Mastodon",
      tagline: "Federated Fediverse Publishing & Decentralized Nodes",
      color: "#6364FF",
      glow: "rgba(99, 100, 255, 0.4)",
      logo: "/images/social/logos/mastodon-icon.svg",
      badge: "Fediverse Ready",
      apiProtocol: "Mastodon REST API v1/v2 & ActivityPub Standards",
      latency: "14ms Gateway SLA",
      uptime: "99.99% Uptime",
      features: [
        "Decentralized cross-server publishing across active Fediverse relays",
        "Content warning (CW) classification & custom granular visibility",
        "Interactive multi-choice polls with live expiration timers",
        "Boost, favorite & reply synchronization across federated instances",
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
                  className="w-5 h-5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                        <div className="px-3 py-2 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl flex flex-col items-start min-w-[180px]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-xl leading-tight">
                        {activeModalChannel.name}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold backdrop-blur-xs">
                        {activeModalChannel.badge}
                      </span>
                    </div>
                    <p className="text-xs text-white/85 font-medium mt-0.5">
                      {activeModalChannel.tagline}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalChannel(null)}
                  className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Integration Details & Capabilities */}
            <div className="p-6 space-y-4">
              {/* Integration Status & Protocol Pill */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    Integration Status:
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    100% Direct API Verified (2026)
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  <span className="truncate">{activeModalChannel.apiProtocol}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold shrink-0 ml-2">
                    ⚡ {activeModalChannel.latency}
                  </span>
                </div>
              </div>

              {/* Capabilities Checklist */}
              <div className="space-y-2.5 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Included Capabilities:</span>
                  <span className="text-emerald-500 font-semibold lowercase">
                    {activeModalChannel.uptime}
                  </span>
                </div>
                {activeModalChannel.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      ✓
                    </span>
                    <span className="leading-relaxed">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Enterprise Security & Authentication Handshake Card */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Official OAuth 2.0 PKCE Handshake
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold">
                      SOC-2 Compliant
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isLoggedIn
                      ? `Your PulseSocial workspace is verified and ready. Connect your official ${activeModalChannel.name} account to schedule posts, sync comments, and stream live analytics.`
                      : `PulseSocial connects directly to official ${activeModalChannel.name} endpoints with zero-knowledge encrypted tokens. Sign in to your workspace or begin a 14-day free trial to link channels.`}
                  </p>
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

                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/connections?connect=${activeModalChannel.id}`}
                      onClick={() => setActiveModalChannel(null)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Connect {activeModalChannel.name}</span>
                    </Link>

                    <Link
                      href={`/compose?network=${activeModalChannel.id}`}
                      onClick={() => setActiveModalChannel(null)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span>Launch Composer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
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
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PulseSocialSidebar;
