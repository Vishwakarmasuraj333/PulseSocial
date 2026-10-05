"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Sparkles } from "lucide-react";

interface RibbonNetwork {
  id: string;
  name: string;
  tag: string;
  logo: string;
  color: string;
  borderColor: string;
  badge: string;
}

export function PulseSocialRibbon() {
  const networks: RibbonNetwork[] = [
    {
      id: "instagram",
      name: "Instagram",
      tag: "Reels & Direct Carousels",
      logo: "/images/social/logos/instagram.svg",
      color: "#E1306C",
      borderColor: "hover:border-[#E1306C]/50",
      badge: "Meta Verified",
    },
    {
      id: "facebook",
      name: "Facebook",
      tag: "Pages, Groups & Video",
      logo: "/images/social/logos/facebook.svg",
      color: "#1877F2",
      borderColor: "hover:border-[#1877F2]/50",
      badge: "Meta Verified",
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      tag: "Thread Scheduling & Live Q",
      logo: "/images/social/logos/twitter.svg",
      color: "#0F172A",
      borderColor: "hover:border-slate-400",
      badge: "Official API v2",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      tag: "PDF Carousels & Executive",
      logo: "/images/social/logos/linkedin-icon.svg",
      color: "#0A66C2",
      borderColor: "hover:border-[#0A66C2]/50",
      badge: "Enterprise Partner",
    },
    {
      id: "youtube",
      name: "YouTube",
      tag: "Shorts & 4K Video Sync",
      logo: "/images/social/logos/youtube-icon.svg",
      color: "#FF0000",
      borderColor: "hover:border-red-500/50",
      badge: "4K Direct Upload",
    },
    {
      id: "tiktok",
      name: "TikTok",
      tag: "Viral Sound & Trend Sync",
      logo: "/images/social/logos/tiktok-icon.svg",
      color: "#000000",
      borderColor: "hover:border-cyan-400/50",
      badge: "Direct Sync",
    },
    {
      id: "pinterest",
      name: "Pinterest",
      tag: "Idea Pins & Visual Boards",
      logo: "/images/social/logos/pinterest-icon.svg",
      color: "#E60023",
      borderColor: "hover:border-red-600/50",
      badge: "Shopping Ready",
    },
    {
      id: "threads",
      name: "Threads",
      tag: "Conversations & Cross-post",
      logo: "/images/social/logos/threads-icon.svg",
      color: "#000000",
      borderColor: "hover:border-purple-400/50",
      badge: "Direct API",
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      tag: "Broadcasts & Support Chat",
      logo: "/images/social/logos/whatsapp-icon.svg",
      color: "#25D366",
      borderColor: "hover:border-emerald-500/50",
      badge: "Cloud API",
    },
    {
      id: "bluesky",
      name: "Bluesky",
      tag: "Open AT Protocol Social",
      logo: "/images/social/logos/bluesky-icon.svg",
      color: "#1185FE",
      borderColor: "hover:border-sky-400/50",
      badge: "Decentralized",
    },
    {
      id: "mastodon",
      name: "Mastodon",
      tag: "Fediverse Instance Sync",
      logo: "/images/social/logos/mastodon-icon.svg",
      color: "#6364FF",
      borderColor: "hover:border-indigo-400/50",
      badge: "Fediverse 2.0",
    },
    {
      id: "google",
      name: "Google Business",
      tag: "Local Maps & Reviews Sync",
      logo: "/images/social/logos/google.svg",
      color: "#4285F4",
      borderColor: "hover:border-blue-400/50",
      badge: "Local SEO Pro",
    },
    {
      id: "telegram",
      name: "Telegram",
      tag: "Broadcasts & Community Channels",
      logo: "/images/social/logos/telegram-icon.svg",
      color: "#229ED9",
      borderColor: "hover:border-sky-400/50",
      badge: "Bot API",
    },
  ];

  // Exact 2-fold duplicate for seamless 100% glitch-free continuous loop
  const duplicated = [...networks, ...networks];

  return (
    <section aria-label="Supported Social Networks" className="w-full bg-slate-50/90 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80 py-4.5 overflow-hidden relative select-none">
      {/* Edge gradient masks for elegant fade */}
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />

      {/* Infinite scrolling marquee track - smooth slow speed */}
      <div className="animate-marquee-slow flex items-center gap-4 sm:gap-6">
        {duplicated.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer shrink-0 group ${item.borderColor}`}
          >
            {/* Social Icon */}
            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-xs">
              <Image
                src={item.logo}
                alt={item.name}
                width={26}
                height={26}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Platform info */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {item.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {item.badge}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
