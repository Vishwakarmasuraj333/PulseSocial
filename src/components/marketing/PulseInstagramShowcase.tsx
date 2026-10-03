"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Sparkles,
  Share2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import {
  InstagramIcon,
  TikTokIcon,
  LinkedInIcon,
  XIcon,
  PinterestIcon,
  FacebookIcon,
} from "@/components/icons/PlatformIcons";

interface ShowcaseCard {
  id: number;
  image: string;
  caption: string;
  author: string;
  likes: string;
  comments: string;
  tilt: string;
}

interface PlatformShowcase {
  id: string;
  name: string;
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  link: string;
  iconRenderer: () => React.ReactNode;
  cards: ShowcaseCard[];
}

const PLATFORMS_DATA: PlatformShowcase[] = [
  {
    id: "instagram",
    name: "Instagram",
    tag: "INSTAGRAM",
    tagColor: "text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-800",
    title: "Direct scheduling to Instagram? Check.",
    description:
      "Grow your presence on Instagram. Publish your best visuals, monitor your favorite hashtags, and repost user-generated content right from your desktop.",
    link: "/platforms#instagram",
    iconRenderer: () => <InstagramIcon size={18} />,
    cards: [
      {
        id: 0,
        image:
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=700&auto=format&fit=crop&q=85",
        caption: "Fresh morning brew with desk essentials and productive vibes ☕️✨",
        author: "@cafepulse",
        likes: "4.2K",
        comments: "184",
        tilt: "-rotate-2",
      },
      {
        id: 1,
        image:
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=700&auto=format&fit=crop&q=85",
        caption: "Summer treat aesthetics & strawberry glaze artisan collection 🍓🍰",
        author: "@sweetcreatives",
        likes: "8.9K",
        comments: "512",
        tilt: "rotate-0",
      },
      {
        id: 2,
        image:
          "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=700&auto=format&fit=crop&q=85",
        caption: "Vintage seaside bike rides through golden hour sunlit streets 🚲🌊",
        author: "@wanderlust_visuals",
        likes: "6.3K",
        comments: "328",
        tilt: "rotate-2",
      },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok & Shorts",
    tag: "TIKTOK & SHORTS",
    tagColor: "text-slate-900 bg-slate-100 border-slate-300 dark:text-cyan-300 dark:bg-slate-900 dark:border-cyan-800",
    title: "Auto-publish short-form video at peak engagement hours.",
    description:
      "Upload 9:16 vertical videos, add trending audio tags, schedule peak evening drops, and analyze real-time watch-time retention effortlessly.",
    link: "/platforms#tiktok",
    iconRenderer: () => <TikTokIcon size={18} />,
    cards: [
      {
        id: 0,
        image:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&auto=format&fit=crop&q=85",
        caption: "Behind the scenes recording that viral synth hook in studio 🎧🔥",
        author: "@beatmakers_studio",
        likes: "94.2K",
        comments: "1.8K",
        tilt: "-rotate-2",
      },
      {
        id: 1,
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=85",
        caption: "Top 3 lighting hacks every content creator needs to know 💡⚡",
        author: "@creatoracademy",
        likes: "68.4K",
        comments: "1.1K",
        tilt: "rotate-0",
      },
      {
        id: 2,
        image:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700&auto=format&fit=crop&q=85",
        caption: "Golden hour sunset time-lapse from the highest mountain summit 🏔️🌅",
        author: "@urbanexplorers",
        likes: "112K",
        comments: "2.4K",
        tilt: "rotate-2",
      },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    tag: "LINKEDIN",
    tagColor: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
    title: "Scale executive thought leadership & B2B pipeline.",
    description:
      "Share carousel PDFs, long-form industry breakdowns, tag key collaborators, and turn meaningful discussions into authenticated CRM leads.",
    link: "/platforms#linkedin",
    iconRenderer: () => <LinkedInIcon size={18} />,
    cards: [
      {
        id: 0,
        image:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&auto=format&fit=crop&q=85",
        caption: "How our team scaled to $10M ARR with zero venture debt: The 5 core principles 🚀📈",
        author: "@saasfounders",
        likes: "12.4K",
        comments: "842",
        tilt: "-rotate-2",
      },
      {
        id: 1,
        image:
          "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=700&auto=format&fit=crop&q=85",
        caption: "The 2026 playbook for organic B2B audience distribution and retention 📊🎯",
        author: "@growthmatrix",
        likes: "7.8K",
        comments: "492",
        tilt: "rotate-0",
      },
      {
        id: 2,
        image:
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=700&auto=format&fit=crop&q=85",
        caption: "Announcing our automated AI workflow studio for marketing agencies worldwide 🤖💼",
        author: "@techpioneers",
        likes: "16.5K",
        comments: "1.1K",
        tilt: "rotate-2",
      },
    ],
  },
  {
    id: "x",
    name: "X (Twitter)",
    tag: "X (TWITTER)",
    tagColor: "text-slate-800 bg-slate-100 border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700",
    title: "Dominate real-time conversations & cascading threads.",
    description:
      "Draft multi-tweet threads with inline image attachments, schedule breaking commentary, track brand keywords, and quote-post in seconds.",
    link: "/platforms#x",
    iconRenderer: () => <XIcon size={18} />,
    cards: [
      {
        id: 0,
        image:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&auto=format&fit=crop&q=85",
        caption: "10 design heuristics every senior product engineer must master in 2026 🧵👇",
        author: "@productpulse",
        likes: "24.6K",
        comments: "1.9K",
        tilt: "-rotate-2",
      },
      {
        id: 1,
        image:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=85",
        caption: "Deploying to production on Friday? How we achieve 99.999% uptime with automated CI/CD 💻⚡",
        author: "@devinsights",
        likes: "14.2K",
        comments: "820",
        tilt: "rotate-0",
      },
      {
        id: 2,
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=85",
        caption: "Global digital marketing spend breakdown: The multi-platform omnichannel shift 📈🌐",
        author: "@marketsignals",
        likes: "19.8K",
        comments: "1.3K",
        tilt: "rotate-2",
      },
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    tag: "PINTEREST",
    tagColor: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800",
    title: "Drive evergreen organic traffic from visual searches.",
    description:
      "Batch pin high-resolution ideas, schedule boards weeks in advance, and turn passive visual searchers into loyal high-ticket buyers.",
    link: "/platforms#pinterest",
    iconRenderer: () => <PinterestIcon size={18} />,
    cards: [
      {
        id: 0,
        image:
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=700&auto=format&fit=crop&q=85",
        caption: "Cozy scandinavian living room inspiration & warm lighting aesthetics 🛋️🕯️",
        author: "@minimalistliving",
        likes: "28.4K",
        comments: "640",
        tilt: "-rotate-2",
      },
      {
        id: 1,
        image:
          "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=700&auto=format&fit=crop&q=85",
        caption: "Handcrafted artisan ceramic collection launch & studio process 🏺🎨",
        author: "@artisanatelier",
        likes: "36.2K",
        comments: "980",
        tilt: "rotate-0",
      },
      {
        id: 2,
        image:
          "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=700&auto=format&fit=crop&q=85",
        caption: "Urban terrace garden design & indoor botanical styling guide 🌿🪴",
        author: "@greenhabitats",
        likes: "44.9K",
        comments: "1.2K",
        tilt: "rotate-2",
      },
    ],
  },
  {
    id: "facebook",
    name: "Facebook",
    tag: "FACEBOOK",
    tagColor: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
    title: "Engage local communities & convert high-intent buyers.",
    description:
      "Manage Facebook Pages and Groups, automate customer responses, schedule link previews, and maximize organic algorithmic reach.",
    link: "/platforms#facebook",
    iconRenderer: () => <FacebookIcon size={18} />,
    cards: [
      {
        id: 0,
        image:
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=85",
        caption: "Announcing our worldwide community summit 2026: Connect with top digital creators 🤝🌍",
        author: "@globalbrand",
        likes: "18.6K",
        comments: "820",
        tilt: "-rotate-2",
      },
      {
        id: 1,
        image:
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&auto=format&fit=crop&q=85",
        caption: "Weekly creator spotlight: Meet the creative teams revolutionizing social storytelling 🌟🎬",
        author: "@creatorcollective",
        likes: "12.3K",
        comments: "490",
        tilt: "rotate-0",
      },
      {
        id: 2,
        image:
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&auto=format&fit=crop&q=85",
        caption: "Full body HIIT routine you can do anywhere in 20 minutes without equipment ⚡️🏋️‍♂️",
        author: "@fitnessfirst",
        likes: "31.2K",
        comments: "1.7K",
        tilt: "rotate-2",
      },
    ],
  },
];

export function PulseInstagramShowcase() {
  const [activePlatformIndex, setActivePlatformIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const DURATION_MS = 3800;
  const STEP_MS = 50;

  // Smooth continuous auto-switch timer with live progress bar
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActivePlatformIndex((curr) => (curr + 1) % PLATFORMS_DATA.length);
          return 0;
        }
        return prev + (STEP_MS / DURATION_MS) * 100;
      });
    }, STEP_MS);

    return () => clearInterval(interval);
  }, [isPaused]);

  const selectPlatform = (index: number) => {
    setActivePlatformIndex(index);
    setProgress(0);
  };

  const handlePrev = () => {
    setActivePlatformIndex((curr) => (curr - 1 + PLATFORMS_DATA.length) % PLATFORMS_DATA.length);
    setProgress(0);
  };

  const handleNext = () => {
    setActivePlatformIndex((curr) => (curr + 1) % PLATFORMS_DATA.length);
    setProgress(0);
  };

  const activePlatform = PLATFORMS_DATA[activePlatformIndex];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="py-20 sm:py-28 bg-white dark:bg-slate-950 overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        
        {/* Interactive Platform Tabs with Animated Progress Fill */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {PLATFORMS_DATA.map((p, idx) => {
            const isSelected = idx === activePlatformIndex;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPlatform(idx)}
                className={`relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#5846A8] text-white shadow-lg shadow-indigo-500/25 scale-105"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:scale-102"
                }`}
              >
                {/* Progress bar inside active tab */}
                {isSelected && (
                  <span
                    className="absolute left-0 bottom-0 top-0 bg-white/20 transition-all duration-75 pointer-events-none"
                    style={{ width: `${progress}%` }}
                  />
                )}
                <span className="relative z-10">{p.iconRenderer()}</span>
                <span className="relative z-10">{p.name}</span>
                {isSelected && (
                  <span className="relative z-10 w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Animated Header Copy */}
        <div
          key={`header-${activePlatform.id}`}
          className="max-w-3xl mx-auto space-y-3.5 animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="flex items-center justify-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${activePlatform.tagColor}`}
            >
              <span>{activePlatform.tag}</span>
            </span>

            {/* Play/Pause state pill */}
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title={isPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
            >
              {isPaused ? (
                <>
                  <Play className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                  <span>Resume Auto-Play</span>
                </>
              ) : (
                <>
                  <Pause className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                  <span>Auto-Switching</span>
                </>
              )}
            </button>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {activePlatform.title}
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {activePlatform.description}
          </p>

          <div className="pt-2">
            <Link
              href={activePlatform.link}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group"
            >
              <span>Learn more about {activePlatform.name}</span>
              <span className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                ▶
              </span>
            </Link>
          </div>
        </div>

        {/* 3 Staggered Polaroid Cards for Active Platform with Navigation Arrows */}
        <div className="relative flex items-center justify-center">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            className="hidden lg:flex absolute -left-4 z-30 w-11 h-11 rounded-full bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 items-center justify-center text-slate-700 dark:text-slate-300 hover:scale-110 active:scale-95 transition cursor-pointer"
            aria-label="Previous platform"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Cards Row */}
          <div
            key={`cards-${activePlatform.id}`}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 w-full"
          >
            {activePlatform.cards.map((card, idx) => (
              <div
                key={`${activePlatform.id}-${card.id}`}
                style={{ animationDelay: `${idx * 120}ms` }}
                className={`w-72 sm:w-80 bg-white dark:bg-slate-900 p-4 pb-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl transition-all duration-300 transform ${card.tilt} hover:rotate-0 hover:scale-105 hover:z-20 cursor-pointer animate-in fade-in slide-in-from-bottom-4`}
              >
                {/* Card top author badge */}
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-sm">
                      <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300">
                          PS
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                        {card.author}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-blue-500 inline" /> Verified Pulse Partner
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
                    {activePlatform.iconRenderer()}
                  </div>
                </div>

                {/* Photo Media */}
                <div className="w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative group">
                  <img
                    src={card.image}
                    alt={card.caption}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />

                  {/* Floating badge */}
                  <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Scheduled with PulseSocial</span>
                  </div>
                </div>

                {/* Caption text */}
                <p className="mt-3 text-xs text-slate-800 dark:text-slate-200 font-medium text-left line-clamp-2 leading-relaxed">
                  {card.caption}
                </p>

                {/* Interaction metrics row */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span>{card.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{card.comments}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Share2 className="w-3.5 h-3.5 hover:text-slate-700 dark:hover:text-white transition" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            className="hidden lg:flex absolute -right-4 z-30 w-11 h-11 rounded-full bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 items-center justify-center text-slate-700 dark:text-slate-300 hover:scale-110 active:scale-95 transition cursor-pointer"
            aria-label="Next platform"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic cycling indicator dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {PLATFORMS_DATA.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectPlatform(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === activePlatformIndex
                  ? "w-8 bg-indigo-600 shadow-xs"
                  : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
              }`}
              aria-label={`Go to platform ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
