"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Play,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
  CheckCircle2,
  Zap,
  Clock,
  Flame,
  Send,
  Sliders,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
  TikTokIcon,
  PinterestIcon,
  ThreadsIcon,
  TelegramIcon,
  GoogleBusinessIcon,
} from "@/components/icons/PlatformIcons";

interface HeroPost {
  id: string;
  platform: "facebook" | "instagram" | "x" | "linkedin" | "tiktok";
  platformName: string;
  color: string;
  glowColor: string;
  icon: (size: number) => React.ReactNode;
  authorName: string;
  handle: string;
  avatarUrl: string;
  timeTag: string;
  content: string;
  mediaImage: string;
  mediaTag?: string;
  likes: string;
  comments: string;
  shares: string;
  aiBadge: string;
  aiDetail: string;
  crmLeadBadge?: string;
}

interface PulseHeroStageProps {
  onWatchVideo?: () => void;
  onBookDemo?: () => void;
}

export function PulseHeroStage({ onWatchVideo, onBookDemo }: PulseHeroStageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const posts: HeroPost[] = [
    {
      id: "facebook",
      platform: "facebook",
      platformName: "Facebook",
      color: "#1877F2",
      glowColor: "rgba(24, 119, 242, 0.4)",
      icon: (s) => <FacebookIcon size={s} />,
      authorName: "PulseSocial Global",
      handle: "@pulsesocial",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      timeTag: "Today at 2:45 PM • Best Time Predicted",
      content: "Unleash omnichannel storytelling across all platforms in one streamlined command center. Spot trending topics before your competition. 🚀✨",
      mediaImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80",
      mediaTag: "Featured Campaign • High Organic Reach",
      likes: "14.8K",
      comments: "942",
      shares: "1.2K",
      aiBadge: "⚡ AI Spike Detected",
      aiDetail: "Optimal 2:45 PM publishing window (+42% reach)",
      crmLeadBadge: "48 CRM Leads Generated",
    },
    {
      id: "instagram",
      platform: "instagram",
      platformName: "Instagram",
      color: "#E1306C",
      glowColor: "rgba(225, 48, 108, 0.4)",
      icon: (s) => <InstagramIcon size={s} />,
      authorName: "Studio Pulse Lifestyle",
      handle: "@studiopulse",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      timeTag: "Auto-Scheduled Reel • Peak 7:15 PM",
      content: "Sunsets in Amalfi Coast. Capturing golden hour frames with direct desktop publishing via PulseSocial. #visualstorytelling #creator",
      mediaImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      mediaTag: "Reel • 98.4% Audience Retention",
      likes: "29.4K",
      comments: "1,420",
      shares: "3.8K",
      aiBadge: "🔥 Viral Velocity",
      aiDetail: "Algorithm recommends hashtag boost",
      crmLeadBadge: "12 Inbound Brand Inquiries",
    },
    {
      id: "x",
      platform: "x",
      platformName: "X (Twitter)",
      color: "#000000",
      glowColor: "rgba(168, 85, 247, 0.4)",
      icon: (s) => <XIcon size={s} />,
      authorName: "Growth Architect",
      handle: "@growth_eth",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      timeTag: "Queued Thread • 11:30 AM Peak",
      content: "10 AI productivity frameworks every high-performing founder should deploy this quarter. A step-by-step masterclass 🧵👇",
      mediaImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80",
      mediaTag: "Thread Analysis • 420K Impressions",
      likes: "6.8K",
      comments: "812",
      shares: "2.4K",
      aiBadge: "🎯 AI Viral Score: 98/100",
      aiDetail: "Auto-retweet scheduled for +3 hours",
      crmLeadBadge: "34 Newsletter Subscribers",
    },
    {
      id: "linkedin",
      platform: "linkedin",
      platformName: "LinkedIn",
      color: "#0A66C2",
      glowColor: "rgba(10, 102, 194, 0.4)",
      icon: (s) => <LinkedInIcon size={s} />,
      authorName: "Elena Vance",
      handle: "VP of Digital Marketing & Brand Strategy",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
      timeTag: "Executive Thought Leadership • Auto-Sync",
      content: "Why modern marketing teams are replacing fragmented tool stacks with unified AI social operations. The numbers speak for themselves:",
      mediaImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      mediaTag: "Enterprise Whitepaper • 89% Exec Reach",
      likes: "3.2K",
      comments: "418",
      shares: "640",
      aiBadge: "💼 Turn Comments to CRM Leads",
      aiDetail: "8 Enterprise prospect inquiries automatically logged",
      crmLeadBadge: "8 Qualified CRM Deals",
    },
    {
      id: "tiktok",
      platform: "tiktok",
      platformName: "TikTok & Shorts",
      color: "#000000",
      glowColor: "rgba(37, 244, 238, 0.4)",
      icon: (s) => <TikTokIcon size={s} />,
      authorName: "Pulse Creatives",
      handle: "@pulsecreatives",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      timeTag: "Short-form Sync • 4:00 PM",
      content: "Behind the scenes of our 7-figure product launch campaign. Sound on! 🎧⚡ #marketingtips #growthhacks",
      mediaImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      mediaTag: "Trending Audio Synchronized • 240K Views",
      likes: "45.2K",
      comments: "2,310",
      shares: "8.9K",
      aiBadge: "🎵 Audio & Caption AI Sync",
      aiDetail: "Optimal caption keywords generated automatically",
      crmLeadBadge: "62 Brand Collaborations",
    },
  ];

  // Orbiting floating platform nodes surrounding the cards
  const orbitBadges = [
    { id: "instagram", name: "Instagram", icon: (s: number) => <InstagramIcon size={s} />, x: "8%", y: "16%", delay: "0s" },
    { id: "facebook", name: "Facebook", icon: (s: number) => <FacebookIcon size={s} />, x: "24%", y: "6%", delay: "1.2s" },
    { id: "x", name: "X", icon: (s: number) => <XIcon size={s} />, x: "50%", y: "2%", delay: "0.6s" },
    { id: "linkedin", name: "LinkedIn", icon: (s: number) => <LinkedInIcon size={s} />, x: "76%", y: "7%", delay: "1.8s" },
    { id: "youtube", name: "YouTube", icon: (s: number) => <YouTubeIcon size={s} />, x: "92%", y: "22%", delay: "0.4s" },
    { id: "telegram", name: "Telegram", icon: (s: number) => <TelegramIcon size={s} />, x: "5%", y: "52%", delay: "1.5s" },
    { id: "tiktok", name: "TikTok", icon: (s: number) => <TikTokIcon size={s} />, x: "94%", y: "55%", delay: "2.1s" },
    { id: "pinterest", name: "Pinterest", icon: (s: number) => <PinterestIcon size={s} />, x: "12%", y: "82%", delay: "0.9s" },
    { id: "threads", name: "Threads", icon: (s: number) => <ThreadsIcon size={s} />, x: "86%", y: "84%", delay: "1.7s" },
    { id: "google", name: "Google Business", icon: (s: number) => <GoogleBusinessIcon size={s} />, x: "48%", y: "94%", delay: "2.4s" },
  ];

  // Auto rotation timer with progress calculation
  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 4500;
    const tickInterval = 50;
    const step = (tickInterval / intervalTime) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((current) => (current + 1) % posts.length);
          return 0;
        }
        return prev + step;
      });
    }, tickInterval);

    return () => clearInterval(timer);
  }, [isPaused, posts.length]);

  const handleSelectPost = (idx: number) => {
    setActiveIndex(idx);
    setProgress(0);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % posts.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + posts.length) % posts.length);
    setProgress(0);
  };

  const currentPost = posts[activeIndex];
  const prevPost = posts[(activeIndex - 1 + posts.length) % posts.length];
  const nextPost = posts[(activeIndex + 1) % posts.length];

  return (
    <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-slate-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Subtle background ambient mesh */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* ========================================================= */}
        {/* HERO TYPOGRAPHY & HEADLINE (Exact Match from PDF)         */}
        {/* ========================================================= */}
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            AI-Ready Social Media Management <br className="hidden sm:inline" />
            <span className="text-slate-900 dark:text-white">For Your Business</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            PulseSocial's AI predicts the best time to post, spots engagement spikes before they peak, and turns every comment into a CRM lead, automatically.
          </p>

          {/* Action Button Row */}
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onBookDemo || (() => window.location.href = "/contact")}
              className="px-6 sm:px-8 py-3 rounded-md border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-xs cursor-pointer"
            >
              BOOK A DEMO
            </button>

            <Link
              href="/signup"
              className="px-6 sm:px-8 py-3 rounded-md bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-md shadow-red-500/25 hover:shadow-red-500/40 cursor-pointer flex items-center gap-1.5"
            >
              <span>SIGN UP FOR FREE</span>
            </Link>
          </div>

          {/* Watch Video Link with Play Icon */}
          <div className="pt-1 flex items-center justify-center">
            <button
              onClick={onWatchVideo}
              className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 font-semibold text-xs sm:text-sm transition-colors py-1 cursor-pointer group"
            >
              <span className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 shadow-xs group-hover:border-red-500 group-hover:bg-red-50 dark:group-hover:bg-red-950/40 transition-colors">
                <Play className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200 fill-current group-hover:text-red-500 ml-0.5" />
              </span>
              <span>Watch video</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3-CARD ANIMATION STAGE WITH ORBITING FLOATING ICONS       */}
        {/* ========================================================= */}
        <div
          className="relative mt-8 sm:mt-12 max-w-5xl mx-auto h-[480px] sm:h-[530px] md:h-[560px] flex items-center justify-center select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle glowing center radial background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[350px] bg-gradient-to-tr from-sky-400/10 via-indigo-500/10 to-pink-500/10 blur-[90px] rounded-full" />
          </div>

          {/* SVG Orbit Guide Arcs with glowing connectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <ellipse
              cx="50%"
              cy="50%"
              rx="42%"
              ry="45%"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              className="opacity-40 dark:opacity-20"
            />
            <ellipse
              cx="50%"
              cy="50%"
              rx="28%"
              ry="30%"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1"
              strokeDasharray="3 5"
              className="opacity-30 dark:opacity-15"
            />
          </svg>

          {/* ------------------------------------------------------- */}
          {/* FLOATING ORBITING PLATFORM ICONS                        */}
          {/* ------------------------------------------------------- */}
          {orbitBadges.map((badge, idx) => {
            const isRelatedActive = currentPost.platform === badge.id;
            return (
              <button
                key={badge.id}
                onClick={() => {
                  const targetIdx = posts.findIndex((p) => p.platform === badge.id);
                  if (targetIdx !== -1) handleSelectPost(targetIdx);
                }}
                title={`View ${badge.name} Showcase`}
                style={{
                  left: badge.x,
                  top: badge.y,
                  animationDelay: badge.delay,
                }}
                className={`absolute z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md animate-float ${
                  isRelatedActive
                    ? "bg-white dark:bg-slate-800 scale-125 ring-2 ring-indigo-500 shadow-indigo-500/30"
                    : "bg-white/95 dark:bg-slate-850 hover:scale-115 hover:shadow-lg border border-slate-200/90 dark:border-slate-700/80"
                }`}
              >
                <span className="shrink-0">{badge.icon(22)}</span>
                {isRelatedActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-ping" />
                )}
              </button>
            );
          })}

          {/* ------------------------------------------------------- */}
          {/* 3-CARD PERSPECTIVE CAROUSEL STAGE                       */}
          {/* ------------------------------------------------------- */}
          <div className="relative w-full max-w-xl h-full flex items-center justify-center">
            {/* LEFT CARD (Slight tilt & scale down) */}
            <div
              onClick={handlePrev}
              style={{
                transform: "translateX(-140px) scale(0.85) perspective(1000px) rotateY(12deg)",
              }}
              className="hidden md:block absolute w-80 lg:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl opacity-60 hover:opacity-85 transition-all duration-500 cursor-pointer overflow-hidden z-10 select-none"
            >
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <img src={prevPost.avatarUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="text-left text-xs truncate">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{prevPost.authorName}</div>
                  <div className="text-[10px] text-slate-400">{prevPost.timeTag}</div>
                </div>
              </div>
              <div className="h-44 overflow-hidden relative">
                <img src={prevPost.mediaImage} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* CENTER FOCAL ACTIVE CARD (The Showstopper) */}
            <div
              style={{
                boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
              }}
              className="relative z-20 w-[92%] sm:w-[440px] md:w-[460px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 transition-all duration-500 overflow-hidden text-left"
            >
              {/* Card Header with Platform Badge */}
              <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={currentPost.avatarUrl}
                      alt={currentPost.authorName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-xs">
                      {currentPost.icon(15)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {currentPost.authorName}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{currentPost.timeTag}</span>
                    </p>
                  </div>
                </div>

                {/* AI Predictive Status Pill */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>AI Scheduled</span>
                </div>
              </div>

              {/* Card Post Content */}
              <div className="p-3.5 sm:p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                {currentPost.content}
              </div>

              {/* Media Preview Box */}
              <div className="relative h-48 sm:h-52 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                <img
                  src={currentPost.mediaImage}
                  alt="Post preview"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Media overlay tag */}
                {currentPost.mediaTag && (
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{currentPost.mediaTag}</span>
                  </div>
                )}
              </div>

              {/* AI Predictive Insights Banner */}
              <div className="bg-slate-50 dark:bg-slate-850 px-3.5 sm:px-4 py-2.5 border-t border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold truncate">
                  <span className="text-amber-500 font-bold">{currentPost.aiBadge}</span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-slate-500 dark:text-slate-400 truncate">{currentPost.aiDetail}</span>
                </div>
                {currentPost.crmLeadBadge && (
                  <span className="shrink-0 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-[9px] uppercase tracking-wide">
                    {currentPost.crmLeadBadge}
                  </span>
                )}
              </div>

              {/* Social Engagement Metrics Bar */}
              <div className="p-3.5 sm:p-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{currentPost.likes}</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors cursor-pointer">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{currentPost.comments}</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-green-500 transition-colors cursor-pointer">
                    <Share2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{currentPost.shares}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer" />
                  <Send className="w-4 h-4 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer" />
                </div>
              </div>
            </div>

            {/* RIGHT CARD (Slight tilt & scale down) */}
            <div
              onClick={handleNext}
              style={{
                transform: "translateX(140px) scale(0.85) perspective(1000px) rotateY(-12deg)",
              }}
              className="hidden md:block absolute w-80 lg:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl opacity-60 hover:opacity-85 transition-all duration-500 cursor-pointer overflow-hidden z-10 select-none"
            >
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <img src={nextPost.avatarUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="text-left text-xs truncate">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{nextPost.authorName}</div>
                  <div className="text-[10px] text-slate-400">{nextPost.timeTag}</div>
                </div>
              </div>
              <div className="h-44 overflow-hidden relative">
                <img src={nextPost.mediaImage} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Navigation Arrows for Stage */}
          <button
            onClick={handlePrev}
            aria-label="Previous Showcase"
            className="absolute left-2 sm:left-6 z-40 p-2 sm:p-2.5 rounded-full bg-white/95 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Showcase"
            className="absolute right-2 sm:right-6 z-40 p-2 sm:p-2.5 rounded-full bg-white/95 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE CONTROLS: PLATFORM PILLS & PROGRESS BAR       */}
        {/* ========================================================= */}
        <div className="mt-4 sm:mt-6 flex flex-col items-center gap-3">
          {/* Platform Pills row */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {posts.map((post, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={post.id}
                  onClick={() => handleSelectPost(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <span className="shrink-0">{post.icon(14)}</span>
                  <span>{post.platformName}</span>
                </button>
              );
            })}
          </div>

          {/* Progress bar line */}
          <div className="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-75 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
