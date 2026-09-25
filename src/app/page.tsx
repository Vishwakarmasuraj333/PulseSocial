"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Send,
  Calendar,
  MessageSquare,
  BarChart3,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  Zap,
  TrendingUp,
  Sliders,
  Layers,
  Check,
  Star,
  Play,
  Heart,
  Share2,
  MessageCircle,
  Repeat,
  Bookmark,
  ExternalLink,
  ChevronDown,
  Lock,
  Flame,
  Award,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import {
  FacebookIcon,
  XIcon,
  LinkedInIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
  PinterestIcon,
  ThreadsIcon,
  SnapchatIcon,
} from "@/components/icons/PlatformIcons";
import { HeroSocialOrbit } from "@/components/marketing/HeroSocialOrbit";

export default function HomePage() {
  // -------------------------------------------------------------
  // HERO BANNER SLIDER (3 SLIDES)
  // -------------------------------------------------------------
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const heroSlides = [
    {
      id: 0,
      badge: "⚡ Unified Multi-Channel Operations",
      title: "One Command Center.",
      titleHighlight: "Every Social Channel.",
      description:
        "Publish, schedule, and orchestrate campaigns across Instagram, Facebook, X, LinkedIn, TikTok, and YouTube in a single click. Elevate your brand with automated multi-platform sync.",
      ctaPrimary: { label: "Start Free 14-Day Trial", href: "/signup" },
      ctaSecondary: { label: "Sign In to Workspace", href: "/login" },
      stats: [
        { label: "Accounts Synced", value: "8+ Platforms" },
        { label: "Posts Dispatched", value: "14.8M+" },
        { label: "Reach Multiplier", value: "4.2x Organic" },
      ],
      previewType: "composer",
    },
    {
      id: 1,
      badge: "🤖 PulseAI Smart Scheduling",
      title: "Predictive Viral Matrix.",
      titleHighlight: "Peak Hour Auto-Publish.",
      description:
        "Never guess when your audience is online. PulseSocial's algorithmic engine detects the exact peak engagement window for every platform and queues your content automatically.",
      ctaPrimary: { label: "Try Smart Scheduling", href: "/signup" },
      ctaSecondary: { label: "Explore Live Calendar", href: "/login" },
      stats: [
        { label: "Engagement Lift", value: "+78.4%" },
        { label: "Time Saved / Wk", value: "18+ Hours" },
        { label: "Auto-Queue Slots", value: "Unlimited" },
      ],
      previewType: "calendar",
    },
    {
      id: 2,
      badge: "🛡️ Enterprise Omnichannel Inbox",
      title: "Unified Social Inbox.",
      titleHighlight: "Hardware AES-256 Vault.",
      description:
        "Zero dropped customer inquiries. Aggregate direct messages, comments, and mentions from Meta, X, and LinkedIn into a lightning-fast inbox protected by AES-256 token encryption.",
      ctaPrimary: { label: "Protect Your Channels", href: "/signup" },
      ctaSecondary: { label: "Access Team Inbox", href: "/login" },
      stats: [
        { label: "Response Velocity", value: "< 2 mins" },
        { label: "Encryption Tier", value: "AES-256-GCM" },
        { label: "Missed Inquiries", value: "0.00%" },
      ],
      previewType: "inbox",
    },
  ];

  // Auto slide interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  // -------------------------------------------------------------
  // INTERACTIVE COMPOSER PREVIEW STATE
  // -------------------------------------------------------------
  const [selectedNetwork, setSelectedNetwork] = useState<"instagram" | "x" | "linkedin" | "facebook">("instagram");
  const [composerText, setComposerText] = useState(
    "🚀 Scaling our brand presence across all social channels with PulseSocial! One click dispatches our campaign to Instagram, LinkedIn, and X with custom format optimization."
  );

  const samplePresets = [
    {
      label: "🚀 Product Launch",
      text: "We are thrilled to unveil our latest release! Designed for high-velocity creators and teams who value quality, speed, and real metrics. Try it today!",
    },
    {
      label: "💡 Growth Tip",
      text: "Consistency outperforms sporadic virality. Here are 3 habits top social directors maintain every single week to double organic community engagement:",
    },
    {
      label: "🔥 Special Offer",
      text: "Flash access alert: Upgrade your social toolkit today and get 2 months free on our Pro tier. Claim your workspace now before spots fill up!",
    },
  ];

  // -------------------------------------------------------------
  // ROI CALCULATOR STATE
  // -------------------------------------------------------------
  const [accountCount, setAccountCount] = useState<number>(6);
  const [postsPerWeek, setPostsPerWeek] = useState<number>(15);

  const hoursSavedPerMonth = Math.round(accountCount * 2.8 + postsPerWeek * 0.9);
  const dollarsSavedPerMonth = Math.round(hoursSavedPerMonth * 45);

  // -------------------------------------------------------------
  // PRICING TOGGLE STATE
  // -------------------------------------------------------------
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  // -------------------------------------------------------------
  // FAQ ACCORDION STATE
  // -------------------------------------------------------------
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Which social media platforms does PulseSocial connect with?",
      a: "PulseSocial integrates via official partner APIs with Instagram (Business & Creator accounts, Reels, Carousels), Facebook (Pages and Groups), LinkedIn (Personal Profiles and Company Pages), X / Twitter (v2 API with threads), TikTok, YouTube (Channels & Shorts), Pinterest, and Meta Threads.",
    },
    {
      q: "Are the login and sign-up processes instant?",
      a: "Yes! You can create a new workspace in under 30 seconds with email and password or 6-digit OTP verification. You immediately get a 14-day full access trial without needing to enter credit card details.",
    },
    {
      q: "How does the Unified Social Inbox work?",
      a: "Our Unified Inbox consolidates direct messages, post comments, and mentions from Facebook, Instagram, LinkedIn, and X into a single two-pane stream. You can reply directly through our interface without switching between separate browser tabs.",
    },
    {
      q: "How secure are my connected social credentials?",
      a: "We never store your social media passwords. We use official OAuth 2.0 PKCE authentication. All OAuth access and refresh tokens are encrypted at rest with hardware-grade AES-256-GCM encryption in our secure vault.",
    },
    {
      q: "Can I schedule multi-image carousels and video Reels?",
      a: "Absolutely. Our composer provides automatic aspect-ratio validation (1:1, 4:5, 9:16), automated video duration checks, and custom per-platform caption customization before scheduling.",
    },
    {
      q: "Can I invite team members and assign approval workflows?",
      a: "Yes! On our Professional and Business tiers, you can invite team members with specific roles (Admin, Editor, Reviewer, Analyst) to draft posts and enforce mandatory approvals before posts go live.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* 1. Header with direct working Login / Signup */}
      <MarketingHeader />

      {/* ========================================================= */}
      {/* 2. HERO SECTION WITH 3D REVOLVING SOCIAL ORBIT ANIMATION  */}
      {/* ========================================================= */}
      <section className="relative min-h-[760px] lg:min-h-[840px] flex items-center pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-slate-50 dark:bg-[#070A13] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Cosmic Ambient Lighting & Grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-purple-50/50 to-slate-50 dark:from-[#070A13]/90 dark:via-[#090D22]/70 dark:to-[#070A13] -z-10 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[450px] bg-gradient-to-tr from-purple-900/30 via-pink-900/20 to-transparent blur-[140px] -z-10 rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-bl from-purple-900/30 via-indigo-950/25 to-transparent blur-[140px] -z-10 rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Hero Headline, Subtitle, and CTAs */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-200/80 dark:border-rose-500/30 bg-white/80 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-xs backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>All-in-One Social Media Management</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                Social Media Management,{" "}
                <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
                  All in One Place.
                </span>
              </h1>

              {/* Subheading / Description */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Manage LinkedIn, Facebook, Instagram, TikTok, X, YouTube, Pinterest, Threads and other supported social platforms from one powerful workspace. Create, schedule, publish, monitor, analyze and manage your social media content from a single dashboard.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:via-pink-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 dark:border-white/15 hover:border-purple-400 dark:hover:border-purple-500/50 bg-white/90 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-sm sm:text-base shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
                >
                  <span>Book a Demo</span>
                </Link>
              </div>

              {/* Trust Subtext */}
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                No credit card required • Instant setup • 14-day free trial
              </p>

              {/* 9+ Social Networks Connected Badge Pill */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-3.5 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0D1224]/80 backdrop-blur-md shadow-xs">
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-xs">
                      <LinkedInIcon size={14} className="shrink-0" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-xs">
                      <FacebookIcon size={14} className="shrink-0" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-xs">
                      <InstagramIcon size={14} className="shrink-0" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-xs">
                      <TikTokIcon size={14} className="shrink-0" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-xs">
                      <SnapchatIcon size={14} className="shrink-0" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-xs">
                      <XIcon size={14} className="shrink-0" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-xs">
                      <YouTubeIcon size={14} className="shrink-0" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-xs">
                      <PinterestIcon size={14} className="shrink-0" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-xs">
                      <ThreadsIcon size={14} className="shrink-0" />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>9+ Social Networks Connected</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Real-time publishing • Analytics • Scheduling
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Revolving Orbit of All Social Media Icons */}
            <div className="lg:col-span-6 relative flex items-center justify-center mt-8 lg:mt-0 animate-in fade-in zoom-in-95 duration-700">
              <HeroSocialOrbit />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SUPPORTED PLATFORMS MARQUEE & INTERACTIVE ECOSYSTEM     */}
      {/* ========================================================= */}
      <section className="py-14 border-y border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Native Official Partner API Integrations
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Connect Every Channel in Seconds. Zero Password Storage.
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {[
              { id: "instagram", name: "Instagram", icon: InstagramIcon, capability: "Reels & Carousels" },
              { id: "facebook", name: "Facebook", icon: FacebookIcon, capability: "Pages & Groups" },
              { id: "linkedin", name: "LinkedIn", icon: LinkedInIcon, capability: "Articles & PDFs" },
              { id: "x", name: "X (Twitter)", icon: XIcon, capability: "Threads & v2 API" },
              { id: "youtube", name: "YouTube", icon: YouTubeIcon, capability: "Shorts & Videos" },
              { id: "tiktok", name: "TikTok", icon: TikTokIcon, capability: "Short Video Kit" },
              { id: "pinterest", name: "Pinterest", icon: PinterestIcon, capability: "Boards & Pins" },
              { id: "threads", name: "Threads", icon: ThreadsIcon, capability: "Direct Graph API" },
            ].map((platform) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.id}
                  className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 cursor-default"
                >
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">
                    {platform.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 text-center">
                    {platform.capability}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    Live API
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. LIVE INTERACTIVE POST SIMULATOR PLAYGROUND              */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Interactive Live Playground
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            See How Your Content Renders Before Publishing
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Type any headline or message below, toggle between platforms, and experience how PulseSocial automatically validates character limits, media containers, and native elements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Input Panel */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Compose Message
              </label>
              <textarea
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                rows={4}
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                placeholder="Type your social post..."
              />
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                <span>Try quick ideas:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  {composerText.length} characters
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setComposerText(preset.text)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Platform Tab Buttons */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Select Platform Preview
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedNetwork("instagram")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                    selectedNetwork === "instagram"
                      ? "bg-pink-50 dark:bg-pink-950/40 border-pink-500 text-pink-600 dark:text-pink-400 ring-2 ring-pink-500/20"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>Instagram</span>
                </button>

                <button
                  onClick={() => setSelectedNetwork("linkedin")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                    selectedNetwork === "linkedin"
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <LinkedInIcon className="w-4 h-4" />
                  <span>LinkedIn</span>
                </button>

                <button
                  onClick={() => setSelectedNetwork("x")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                    selectedNetwork === "x"
                      ? "bg-slate-100 dark:bg-slate-800 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 ring-2 ring-slate-400/20"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <XIcon className="w-4 h-4" />
                  <span>X (Twitter)</span>
                </button>
              </div>
            </div>

            {/* Direct Connect Action */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Ready to publish live?</span>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
              >
                <span>Publish to All Channels</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Authentic Platform Native Feed Mockup */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Live Native Mockup:
                </span>
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 capitalize">
                  {selectedNetwork}
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Ready to Broadcast
              </span>
            </div>

            {/* INSTAGRAM MOCKUP */}
            {selectedNetwork === "instagram" && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-950 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[2px]">
                      <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-indigo-600">
                        PS
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                        pulsesocial.official
                      </p>
                      <p className="text-[10px] text-slate-400">San Francisco, CA</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-xs font-bold">•••</span>
                </div>

                {/* Media frame */}
                <div className="w-full h-52 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex flex-col items-center justify-center text-white p-6 text-center shadow-inner">
                  <Sparkles className="w-10 h-10 mb-2 opacity-90 animate-bounce" />
                  <p className="font-extrabold text-base tracking-tight">
                    Unified Social Operations
                  </p>
                  <p className="text-xs text-indigo-100 mt-1 max-w-xs">
                    Automated multi-platform scheduling for modern growth teams
                  </p>
                </div>

                {/* Engagement bar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <MessageCircle className="w-5 h-5" />
                    <Share2 className="w-5 h-5" />
                  </div>
                  <Bookmark className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">1,428 likes</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <strong className="font-bold mr-1">pulsesocial.official</strong>
                  {composerText}
                </p>
              </div>
            )}

            {/* LINKEDIN MOCKUP */}
            {selectedNetwork === "linkedin" && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-950 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                      PS
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        PulseSocial Technologies
                        <span className="text-slate-400 font-normal">• 1st</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Enterprise Social Media Infrastructure • 45,200 followers
                      </p>
                      <p className="text-[10px] text-slate-400">12m • Edited • 🌐</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {composerText}
                </p>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      PulseSocial — The Enterprise Social Platform
                    </p>
                    <p className="text-[11px] text-slate-500">pulsesocial.com</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-slate-600 dark:text-slate-400 text-xs font-semibold">
                  <span className="hover:text-blue-600 cursor-pointer">👍 Like</span>
                  <span className="hover:text-blue-600 cursor-pointer">💬 Comment</span>
                  <span className="hover:text-blue-600 cursor-pointer">🔁 Repost</span>
                  <span className="hover:text-blue-600 cursor-pointer">📤 Send</span>
                </div>
              </div>
            )}

            {/* X (TWITTER) MOCKUP */}
            {selectedNetwork === "x" && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-950 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center shrink-0">
                    PS
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        PulseSocial
                      </span>
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                      <span className="text-xs text-slate-400">@pulsesocial • 4m</span>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
                      {composerText}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-slate-500 text-xs max-w-sm">
                      <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                        <MessageCircle className="w-3.5 h-3.5" /> 84
                      </span>
                      <span className="flex items-center gap-1 hover:text-emerald-500 cursor-pointer">
                        <Repeat className="w-3.5 h-3.5" /> 312
                      </span>
                      <span className="flex items-center gap-1 hover:text-pink-500 cursor-pointer">
                        <Heart className="w-3.5 h-3.5" /> 1.2K
                      </span>
                      <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                        <BarChart3 className="w-3.5 h-3.5" /> 48K
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. FOUR DEEP-DIVE CORE FEATURE SHOWCASE                    */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Enterprise Grade Power
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Built to Command Social Scale with Zero Friction
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              Everything high-growth brands and marketing agencies need to author, schedule, analyze, and automate their complete social presence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Universal Composer
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Write once, preview everywhere. Aspect-ratio verification, video duration compliance, and custom hashtags per channel.
                </p>
                <ul className="space-y-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Real-time native truncation</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Multi-image carousel drag & drop</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Automated format transcoding</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/features"
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all"
              >
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Visual Calendar & Queue
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Birds-eye timeline of every scheduled campaign. Switch between Month, Week, and List views with drag & drop rescheduling.
                </p>
                <ul className="space-y-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Color-coded network badges</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>One-click time slot locking</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Team inspection drawers</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/features"
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:gap-2 transition-all"
              >
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Unified Social Inbox
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Never lose a customer lead or high-priority question. Consolidate DMs and comments across all channels in one place.
                </p>
                <ul className="space-y-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Author avatars & thread context</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Inline one-click API replies</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Lead tag & member assignment</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/features"
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all"
              >
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Real API Analytics
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  No estimated guesses. Directly fetch official impressions, reach curves, profile clicks, and audience growth charts.
                </p>
                <ul className="space-y-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Zero simulated fake numbers</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Cross-network performance comparison</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Exportable client PDF & CSV reports</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/features"
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:gap-2 transition-all"
              >
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. INTERACTIVE ROI & TIME-SAVED CALCULATOR                 */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left: Interactive Sliders */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  ROI & Productivity Calculator
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">
                  How Much Time Will PulseSocial Save You?
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-2">
                  Adjust your current social operations volume to calculate your monthly operational savings in hours and budget.
                </p>
              </div>

              {/* Slider 1: Social Accounts */}
              <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span>Connected Social Accounts:</span>
                  <span className="text-sm font-bold text-indigo-300">{accountCount} Accounts</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  value={accountCount}
                  onChange={(e) => setAccountCount(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>2 accounts</span>
                  <span>12 accounts</span>
                  <span>25+ accounts</span>
                </div>
              </div>

              {/* Slider 2: Posts Per Week */}
              <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span>Scheduled Posts per Week:</span>
                  <span className="text-sm font-bold text-indigo-300">{postsPerWeek} Posts / Wk</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={postsPerWeek}
                  onChange={(e) => setPostsPerWeek(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>5 posts</span>
                  <span>40 posts</span>
                  <span>80+ posts</span>
                </div>
              </div>
            </div>

            {/* Right: Calculated Metrics Display */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 text-center space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
                  Estimated Monthly Time Reclaimed
                </p>
                <p className="text-4xl sm:text-5xl font-black text-white mt-1">
                  {hoursSavedPerMonth}{" "}
                  <span className="text-2xl font-bold text-indigo-300">Hours</span>
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Equivalent to ~{(hoursSavedPerMonth / 8).toFixed(1)} full work days saved
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
                  Estimated Agency / Creator Value
                </p>
                <p className="text-3xl font-black text-emerald-400 mt-1">
                  ${dollarsSavedPerMonth.toLocaleString()} / mo
                </p>
              </div>

              <Link
                href="/signup"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg transition active:scale-[0.98]"
              >
                <span>Reclaim Your {hoursSavedPerMonth} Hours Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. TRANSPARENT PRICING SECTION                             */}
      {/* ========================================================= */}
      <section className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Straightforward Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Predictable Plans. Scale As Your Audience Grows.
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              All plans include official OAuth 2.0 PKCE security, unified composer, and zero password requirements.
            </p>

            {/* Monthly vs Annual Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span
                className={`text-xs font-semibold cursor-pointer ${
                  billingCycle === "monthly" ? "text-slate-900 dark:text-white font-bold" : "text-slate-500"
                }`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly Billing
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-hidden"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    billingCycle === "annual" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "annual" ? "text-slate-900 dark:text-white font-bold" : "text-slate-500"
                }`}
                onClick={() => setBillingCycle("annual")}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1: Starter */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Free Starter</h3>
                <p className="text-xs text-slate-500 mt-1">Perfect for solo creators testing multi-network posting.</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs text-slate-400 ml-1">forever</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>3 Connected Social Channels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to 30 Scheduled Posts / Month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Universal Multi-Network Composer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>7-Day Official Metrics History</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup?plan=starter"
                className="mt-8 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs text-center transition"
              >
                Get Started Free
              </Link>
            </div>

            {/* Plan 2: Professional (HIGHLIGHTED) */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 shadow-xl shadow-indigo-500/10 flex flex-col justify-between relative scale-105 z-10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Most Popular
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Professional</h3>
                <p className="text-xs text-slate-500 mt-1">For active brands and growing creators demanding high reach.</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {billingCycle === "annual" ? "$19" : "$24"}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span><strong>10 Connected Channels</strong> (Reels, Shorts, Threads)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span><strong>Unlimited</strong> Scheduled Posts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Unified Social Inbox (DMs & Comments)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>PulseAI Optimal Heatmap Auto-Queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>30-Day Exportable Analytics</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup?plan=pro"
                className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs text-center shadow-md transition active:scale-[0.98]"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Plan 3: Business */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Business Agency</h3>
                <p className="text-xs text-slate-500 mt-1">For multi-brand agencies and teams requiring approval chains.</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {billingCycle === "annual" ? "$55" : "$69"}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>25 Connected Social Channels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unlimited Team Members & Approvals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>White-Label Client PDF Reporting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dedicated Priority Engineering Support</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup?plan=business"
                className="mt-8 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs text-center transition"
              >
                Start 14-Day Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. TESTIMONIALS & SOCIAL PROOF                             */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Trusted by Creators & Agencies
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Loved by 45,000+ Modern Marketers Worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                "PulseSocial replaced 4 different tools for our agency. The multi-platform composer is lightning fast, and our clients love the transparent official metrics reports.",
              author: "Marcus Vance",
              role: "Creative Director, Apex Digital Media",
              metric: "Saved 22 hrs / week",
            },
            {
              quote:
                "The unified inbox alone is worth the subscription. We reply to customer questions from Instagram and X in one tab without ever logging into native apps.",
              author: "Elena Rostova",
              role: "Head of Growth, Lumina Tech",
              metric: "3.8x Faster Response Time",
            },
            {
              quote:
                "Zero password sharing and AES-256 encrypted OAuth token storage gave our enterprise security team the confidence to approve PulseSocial in a single day.",
              author: "Devon Chen",
              role: "VP Marketing Operations, Kinetix Enterprise",
              metric: "100% Security Compliance",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{item.author}</p>
                  <p className="text-[11px] text-slate-500">{item.role}</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-md">
                  {item.metric}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)              */}
      {/* ========================================================= */}
      <section className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Clear Answers
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. HIGH IMPACT CONVERSION CTA BANNER                      */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 sm:p-14 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Instant 14-Day Free Access
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ready to Command All Your Social Channels in One Pulse?
            </h2>
            <p className="text-indigo-100 text-xs sm:text-base leading-relaxed">
              Join over 45,000 creators, digital marketers, and agencies who trust PulseSocial for flawless multi-channel publishing.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-xl transition active:scale-[0.98]"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-950/60 border border-white/20 text-white font-bold text-sm transition active:scale-[0.98]"
              >
                Sign In to Workspace
              </Link>
            </div>
            <p className="text-[11px] text-indigo-200">
              No credit card required • Instant automated workspace setup • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* 11. Comprehensive Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}
