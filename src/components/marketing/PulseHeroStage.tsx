"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, CheckCircle2, Eye, Heart, MessageSquare, Share2, Bookmark, Lock } from "lucide-react";

interface PulseHeroStageProps {
  onWatchVideo?: () => void;
  onBookDemo?: () => void;
}

interface CardItem {
  platform: string;
  networkTag: string;
  logo: string;
  image: string;
  alt: string;
  description: string;
  reach: string;
  badgeGlow: string;
}

export function PulseHeroStage({ onWatchVideo, onBookDemo }: PulseHeroStageProps) {
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [previewPost, setPreviewPost] = useState<CardItem | null>(null);
  const [modalLiked, setModalLiked] = useState(false);
  const [modalLikesCount, setModalLikesCount] = useState(142);

  // Auto-switch between Set 1 and Set 2 every 4.2 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((curr) => (curr === 0 ? 1 : 0));
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused]);

  // 4 Columns: Each column has Pair A (Set 1) and Pair B (Set 2)
  const columns = [
    {
      id: "col-1",
      staggerClass: "translate-y-2 sm:translate-y-6 animate-float-up",
      itemA: {
        platform: "Instagram",
        networkTag: "Reels & Direct Photo Publishing",
        logo: "/images/social/logos/instagram.svg",
        image: "/images/social/social-post1.png",
        alt: "Instagram social post with monastery landscape",
        description: "Direct desktop publishing with carousel and hashtag recommendations.",
        reach: "14.2K Reach",
        badgeGlow: "rgba(225, 48, 108, 0.4)",
      },
      itemB: {
        platform: "Pinterest",
        networkTag: "Rich Idea Pins & Shoppable Boards",
        logo: "/images/social/logos/pinterest-icon.svg",
        image: "/images/social/social-post8.png",
        alt: "Pinterest post with architectural interior bookshelf",
        description: "High-intent visual discovery boards scheduled weeks ahead.",
        reach: "31.2K Monthly Views",
        badgeGlow: "rgba(230, 0, 35, 0.4)",
      },
    },
    {
      id: "col-2",
      staggerClass: "-translate-y-3 sm:-translate-y-6 animate-float-down",
      itemA: {
        platform: "Facebook",
        networkTag: "Pages & Groups Video Distribution",
        logo: "/images/social/logos/facebook.svg",
        image: "/images/social/social-post2.png",
        alt: "Facebook post with mountain hikers",
        description: "Smart queue predictions pinpoint exact audience engagement windows.",
        reach: "22.8K Reach",
        badgeGlow: "rgba(24, 119, 242, 0.4)",
      },
      itemB: {
        platform: "Bluesky",
        networkTag: "Decentralized AT Protocol",
        logo: "/images/social/logos/bluesky-icon.svg",
        image: "/images/social/social-post5.png",
        alt: "Bluesky post by Paul Skinner with seaside arch pavilion",
        description: "Next-generation social protocol with organic viral reach.",
        reach: "8.6K Interactions",
        badgeGlow: "rgba(17, 133, 254, 0.4)",
      },
    },
    {
      id: "col-3",
      staggerClass: "translate-y-1 sm:translate-y-4 animate-float-delayed",
      itemA: {
        platform: "X (Twitter)",
        networkTag: "Thread Scheduling & Live Tracking",
        logo: "/images/social/logos/twitter.svg",
        image: "/images/social/social-post3.png",
        alt: "X post with luxury resort pool",
        description: "Compose multi-tweet viral threads with automated repost timings.",
        reach: "38.5K Reach",
        badgeGlow: "rgba(15, 23, 42, 0.4)",
      },
      itemB: {
        platform: "Threads",
        networkTag: "Meta Connected Conversations",
        logo: "/images/social/logos/threads-icon.svg",
        image: "/images/social/social-post6.png",
        alt: "Threads post by Xavi100x with group of friends smiling",
        description: "Engage real communities with rapid conversational updates.",
        reach: "17.9K Reach",
        badgeGlow: "rgba(168, 85, 247, 0.4)",
      },
    },
    {
      id: "col-4",
      staggerClass: "-translate-y-2 sm:-translate-y-4 animate-float-reverse",
      itemA: {
        platform: "LinkedIn",
        networkTag: "Company Pages & Executive Profiles",
        logo: "/images/social/logos/linkedin-icon.svg",
        image: "/images/social/social-post4.png",
        alt: "LinkedIn post with architectural blocks",
        description: "B2B thought-leadership articles with rich PDF document slides.",
        reach: "9.4K Reach",
        badgeGlow: "rgba(10, 102, 194, 0.4)",
      },
      itemB: {
        platform: "WhatsApp",
        networkTag: "Direct Messaging & Channel Broadcasts",
        logo: "/images/social/logos/whatsapp-icon.svg",
        image: "/images/social/social-post7.png",
        alt: "WhatsApp chat with customer service conversation",
        description: "Turn customer social inquiries into instant CRM closed deals.",
        reach: "99.2% Open Rate",
        badgeGlow: "rgba(37, 211, 102, 0.4)",
      },
    },
  ];

  return (
    <section className="relative pt-16 sm:pt-24 lg:pt-32 pb-0 bg-gradient-to-b from-[#F8F7FF] via-[#F2EEFE] to-[#FAF8FF] dark:from-[#080B14] dark:via-[#0F1426] dark:to-[#070913] text-slate-900 dark:text-white overflow-hidden transition-colors duration-500">
      {/* Dynamic Background Light Orbs & Tech Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] sm:w-[1300px] h-[550px] bg-gradient-to-b from-[#8B6BD6]/25 via-[#6366F1]/15 to-transparent dark:from-[#6F52B5]/35 dark:via-[#4F46E5]/20 dark:to-transparent rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-[#38BDF8]/15 dark:bg-[#0284C7]/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-[#EC4899]/15 dark:bg-[#BE185D]/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#6F52B5_1px,transparent_1px)] dark:bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.14] dark:opacity-[0.16] pointer-events-none" />

      {/* ========================================================= */}
      {/* 1. HERO TYPOGRAPHY & HEADLINE (Enhanced Height & Aesthetic)*/}
      {/* ========================================================= */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-7 pb-16 sm:pb-24 lg:pb-28 relative z-10">
        {/* Floating Tag Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 border border-[#8B6BD6]/30 dark:border-indigo-500/30 text-[#6F52B5] dark:text-[#A78BDF] text-xs font-bold tracking-wide shadow-sm backdrop-blur-md hover:scale-105 transition-transform select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6F52B5] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6F52B5]"></span>
          </span>
          <span>Next-Gen Social Command Center</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
          Manage all your social media. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DF3024] via-[#F59E0B] to-[#6F52B5] dark:from-[#F87171] dark:via-[#FBBF24] dark:to-[#A78BDF]">
            In one place.
          </span>
        </h1>

        <p className="text-base sm:text-xl lg:text-[21px] text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          PulseSocial helps businesses and agencies streamline publishing, engage with audiences, analyze performance, and grow brand presence across all social networks.
        </p>

        {/* Action Button Row */}
        <div className="pt-3 sm:pt-5 flex flex-wrap items-center justify-center gap-3.5 sm:gap-5">
          <button
            onClick={onBookDemo || (() => (window.location.href = "/contact"))}
            className="px-8 sm:px-10 py-3.5 rounded-[6px] border-[2px] border-slate-900 dark:border-white text-slate-900 dark:text-white bg-white/90 dark:bg-slate-900/80 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
          >
            BOOK A DEMO
          </button>

          <Link
            href="/signup"
            className="px-8 sm:px-10 py-3.5 rounded-[6px] bg-[#E42527] hover:bg-[#c81e20] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/50 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 group"
          >
            <span>GET STARTED</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Guarantees Row with Checkmarks */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>15-day free trial</span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>No credit card required</span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Instant setup in 60 seconds</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FULL-WIDTH MINT-GREEN FLOATING CARDS BANNER            */}
      {/* (100% Full Viewport Width, Edge-to-Edge)                  */}
      {/* ========================================================= */}
      <div
        className="w-full bg-gradient-to-b from-[#E7FAF4] via-[#EFFBF7] to-[#E3F8F2] dark:from-[#06241D] dark:via-[#081F1A] dark:to-[#0A2620] border-t border-b border-[#D0ECE4] dark:border-emerald-900/40 py-12 sm:py-16 relative overflow-hidden select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Subtle ambient radial wash */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(167,243,208,0.4),transparent_75%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* ------------------------------------------------------ */}
          {/* STANDALONE BACKGROUND FLOATING ICONS (Only 4, on edges)*/}
          {/* ------------------------------------------------------ */}
          {/* Left Standalone: Telegram */}
          <div className="hidden lg:flex absolute left-4 xl:left-8 top-[35%] -translate-y-1/2 w-11 h-11 items-center justify-center animate-float-up pointer-events-none z-10 transition-transform duration-300 hover:scale-125">
            <Image src="/images/social/logos/telegram-icon.svg" width={42} height={42} alt="Telegram" className="w-10 h-10 drop-shadow-sm" />
          </div>

          {/* Left Standalone: Google Business */}
          <div className="hidden lg:flex absolute left-5 xl:left-10 bottom-[18%] w-11 h-11 items-center justify-center animate-float-down pointer-events-none z-10 transition-transform duration-300 hover:scale-125">
            <Image src="/images/social/logos/google.svg" width={42} height={42} alt="Google Business Profile" className="w-10 h-10 drop-shadow-sm" />
          </div>

          {/* Right Standalone: YouTube */}
          <div className="hidden lg:flex absolute right-5 xl:right-10 bottom-[22%] w-11 h-11 items-center justify-center animate-float-reverse pointer-events-none z-10 transition-transform duration-300 hover:scale-125">
            <Image src="/images/social/logos/youtube-icon.svg" width={42} height={42} alt="YouTube" className="w-10 h-10 drop-shadow-sm" />
          </div>

          {/* Right Standalone: Mastodon */}
          <div className="hidden lg:flex absolute right-4 xl:right-8 top-[32%] w-11 h-11 items-center justify-center animate-float-up pointer-events-none z-10 transition-transform duration-300 hover:scale-125">
            <Image src="/images/social/logos/mastodon-icon.svg" width={42} height={42} alt="Mastodon" className="w-10 h-10 drop-shadow-sm" />
          </div>

          {/* ------------------------------------------------------ */}
          {/* 4 COLUMNS: CARDS & ICONS ALTERNATING IN PLACE          */}
          {/* ------------------------------------------------------ */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-center justify-items-center relative z-20 min-h-[330px] sm:min-h-[350px]">
            {columns.map((col) => (
              <div
                key={col.id}
                className={`w-full max-w-[215px] sm:max-w-[235px] relative ${col.staggerClass}`}
              >
                <div className="relative w-full h-[280px] sm:h-[300px]">
                  {/* Pair A (Active when activeSlide === 0) */}
                  <div
                    onClick={() => setPreviewPost(col.itemA)}
                    className={`absolute inset-0 flex flex-col items-center cursor-pointer transition-all duration-700 ease-in-out ${
                      activeSlide === 0
                        ? "opacity-100 scale-100 pointer-events-auto z-10"
                        : "opacity-0 scale-95 pointer-events-none z-0"
                    } group`}
                  >
                    {/* Icon A */}
                    <div className="mb-2 sm:mb-3 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-115">
                      <Image
                        src={col.itemA.logo}
                        width={40}
                        height={40}
                        alt={`${col.itemA.platform} icon`}
                        className="w-8 sm:w-10 h-8 sm:h-10 drop-shadow-sm"
                      />
                    </div>

                    {/* Card A */}
                    <div className="w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xl shadow-slate-900/10 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl relative">
                      <Image
                        src={col.itemA.image}
                        width={225}
                        height={225}
                        alt={col.itemA.alt}
                        className="w-full h-auto object-cover block"
                        priority
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
                        <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-[11px] font-bold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <Eye className="w-3 h-3 text-emerald-500" />
                          <span>Inspect Post</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pair B (Active when activeSlide === 1) */}
                  <div
                    onClick={() => setPreviewPost(col.itemB)}
                    className={`absolute inset-0 flex flex-col items-center cursor-pointer transition-all duration-700 ease-in-out ${
                      activeSlide === 1
                        ? "opacity-100 scale-100 pointer-events-auto z-10"
                        : "opacity-0 scale-95 pointer-events-none z-0"
                    } group`}
                  >
                    {/* Icon B */}
                    <div className="mb-2 sm:mb-3 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-115">
                      <Image
                        src={col.itemB.logo}
                        width={40}
                        height={40}
                        alt={`${col.itemB.platform} icon`}
                        className="w-8 sm:w-10 h-8 sm:h-10 drop-shadow-sm"
                      />
                    </div>

                    {/* Card B */}
                    <div className="w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xl shadow-slate-900/10 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl relative">
                      <Image
                        src={col.itemB.image}
                        width={225}
                        height={225}
                        alt={col.itemB.alt}
                        className="w-full h-auto object-cover block"
                        priority
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
                        <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-[11px] font-bold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <Eye className="w-3 h-3 text-emerald-500" />
                          <span>Inspect Post</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ------------------------------------------------------ */}
          {/* SLIDE TOGGLE CONTROLS (Dots & Set Labels)              */}
          {/* ------------------------------------------------------ */}
          <div className="relative z-30 mt-6 sm:mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveSlide(0)}
              aria-label="Show Set 1 (Instagram, Facebook, X, LinkedIn)"
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold transition-all duration-300 cursor-pointer ${
                activeSlide === 0
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105"
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeSlide === 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
              <span>Core Networks</span>
            </button>

            <button
              onClick={() => setActiveSlide(1)}
              aria-label="Show Set 2 (Pinterest, Bluesky, Threads, WhatsApp)"
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold transition-all duration-300 cursor-pointer ${
                activeSlide === 1
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105"
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeSlide === 1 ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
              <span>Messaging & Visual</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* POST INSPECTION MODAL (When clicking any post card)       */}
      {/* ========================================================= */}
      {previewPost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewPost(null)}
        >
          <div
            className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-left animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Post Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E3A8A] via-[#2E3788] to-[#4F46E5] flex items-center justify-center text-white font-black text-xs shadow-md">
                    PS
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center p-0.5 shadow-xs border border-slate-100 dark:border-slate-800">
                    <Image
                      src={previewPost.logo}
                      width={16}
                      height={16}
                      alt={previewPost.platform}
                      className="w-3 h-3 object-contain"
                    />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">PulseSocial</span>
                    <CheckCircle2 className="w-3.5 h-3.5 fill-[#1668e3] text-white" />
                    <span className="text-[11px] text-slate-400 font-mono">@pulsesocial_app</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{previewPost.platform} {previewPost.networkTag}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Scheduled via SmartQ</span>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setPreviewPost(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all hover:rotate-90 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Post Image with Hover Micro-Zoom */}
            <div className="mt-4 relative group/img overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800 flex justify-center p-2.5">
              <Image
                src={previewPost.image}
                width={360}
                height={360}
                alt={previewPost.alt}
                className="max-h-[290px] w-auto object-contain rounded-xl shadow-md transition-transform duration-500 group-hover/img:scale-105"
              />
            </div>

            {/* Interactive Social Engagement Row */}
            <div className="mt-3.5 pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setModalLiked(!modalLiked);
                    setModalLikesCount((prev) => (modalLiked ? prev - 1 : prev + 1));
                  }}
                  className={`flex items-center gap-1.5 font-semibold transition-all hover:scale-110 cursor-pointer ${
                    modalLiked ? "text-rose-500" : "hover:text-rose-500"
                  }`}
                  title="Click to react"
                >
                  <Heart className={`w-4 h-4 ${modalLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>{modalLikesCount}</span>
                </button>

                <span className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer hover:scale-105">
                  <MessageSquare className="w-4 h-4" />
                  <span>24</span>
                </span>

                <span className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer hover:scale-105">
                  <Share2 className="w-4 h-4" />
                  <span>48</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] shadow-xs">
                  🚀 {previewPost.reach}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {previewPost.description}
            </p>

            {/* Protected Access Security Notice */}
            <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold">Authentication Required:</span> Direct access to the publishing dashboard requires an active account. Sign up for a 15-day free trial or log in below.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setPreviewPost(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href="/login?redirectTo=/compose"
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                >
                  Log In
                </Link>

                <Link
                  href="/signup?redirectTo=/compose"
                  className="px-5 py-2.5 rounded-xl bg-[#DF3024] hover:bg-[#c82317] text-white font-bold text-xs shadow-md shadow-red-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Sign Up Free to Schedule</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
