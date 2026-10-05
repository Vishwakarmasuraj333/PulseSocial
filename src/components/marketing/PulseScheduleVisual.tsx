"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Smile,
  Hash,
  MapPin,
  Settings,
  Info,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  FacebookIcon,
  XIcon,
  LinkedInIcon,
  InstagramIcon,
  YouTubeIcon,
  PinterestIcon,
  GoogleBusinessIcon,
} from "@/components/icons/PlatformIcons";

export function PulseScheduleVisual() {
  const [activeTab, setActiveTab] = useState<"schedule" | "queue">("queue");
  const [selectedSmartQ, setSelectedSmartQ] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [isUserHovering, setIsUserHovering] = useState(false);
  const [activeChannelIdx, setActiveChannelIdx] = useState(0);

  // 7 Connected Social Channels with Authentic PS Monogram Logo
  const channels = [
    {
      id: "facebook",
      name: "Facebook",
      icon: (s: number) => <FacebookIcon size={s} />,
      badgeBg: "#1877F2",
    },
    {
      id: "x",
      name: "X",
      icon: (s: number) => <XIcon size={s} />,
      badgeBg: "#000000",
      counter: "116",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: (s: number) => <LinkedInIcon size={s} />,
      badgeBg: "#0A66C2",
    },
    {
      id: "google",
      name: "Google Business",
      icon: (s: number) => <GoogleBusinessIcon size={s} />,
      badgeBg: "#1668e3",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: (s: number) => <InstagramIcon size={s} />,
      badgeBg: "#E1306C",
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: (s: number) => <YouTubeIcon size={s} />,
      badgeBg: "#FF0000",
    },
    {
      id: "pinterest",
      name: "Pinterest",
      icon: (s: number) => <PinterestIcon size={s} />,
      badgeBg: "#E60023",
    },
  ];

  const smartQOptions = [
    { percent: "92%", text: "Sat, 03 Jan 2026 at 08:00 AM", sub: "Schedule for Jan 03, 08:00 AM CDT" },
    { percent: "85%", text: "Tue, 06 Jan 2026 at 11:30 AM", sub: "Schedule for Jan 06, 11:30 AM CDT" },
    { percent: "77%", text: "Wed, 07 Jan 2026 at 03:21 PM", sub: "Schedule for Jan 07, 03:21 PM CDT" },
    { percent: "62%", text: "Fri, 09 Jan 2026 at 09:02 AM", sub: "Schedule for Jan 09, 09:02 AM CDT" },
    { percent: "52%", text: "Mon, 12 Jan 2026 at 05:50 PM", sub: "Schedule for Jan 12, 05:50 PM CDT" },
  ];

  // Auto-cycle SmartQ predictions like the original animated video
  useEffect(() => {
    if (isUserHovering) return;
    const interval = setInterval(() => {
      setSelectedSmartQ((prev) => (prev + 1) % smartQOptions.length);
      setActiveChannelIdx((prev) => (prev + 1) % channels.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isUserHovering, smartQOptions.length, channels.length]);

  const handleAddToQueue = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2400);
  };

  return (
    <div
      className="relative w-full max-w-[720px] py-4 sm:py-6 select-none"
      onMouseEnter={() => setIsUserHovering(true)}
      onMouseLeave={() => setIsUserHovering(false)}
    >
      {/* ---------------------------------------------------- */}
      {/* HAND-DRAWN DOODLES (Paper Plane & Hourglass)         */}
      {/* ---------------------------------------------------- */}
      {/* Flying Paper Airplane with live floating animation */}
      <div className="absolute -top-3 sm:top-1 right-2 sm:right-6 pointer-events-none z-30 opacity-90 animate-float-slow">
        <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
          <path
            d="M 10 75 Q 45 60 70 30"
            stroke="#EF4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />
          <g transform="translate(68, 8) rotate(-15) scale(0.85)">
            <path
              d="M 0 25 L 35 0 L 18 38 L 14 26 L 0 25 Z"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M 35 0 L 14 26" stroke="#0F172A" strokeWidth="1.8" />
          </g>
        </svg>
      </div>

      {/* Hourglass positioned cleanly below without overlapping the button */}
      <div className="absolute -bottom-8 right-2 sm:right-6 pointer-events-none z-30 opacity-90">
        <svg width="65" height="85" viewBox="0 0 75 95" fill="none">
          <path
            d="M 12 10 L 62 10 M 12 85 L 62 85"
            stroke="#0F172A"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 18 10 C 18 35 32 45 37 47.5 C 42 45 56 35 56 10 M 18 85 C 18 60 32 50 37 47.5 C 42 50 56 60 56 85"
            stroke="#0F172A"
            strokeWidth="3"
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M 24 28 C 24 35 32 40 37 45 C 42 40 50 35 50 28 Z"
            fill="#F59E0B"
            opacity="0.9"
          />
          <line
            x1="37"
            y1="46"
            x2="37"
            y2="70"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            className="animate-sand"
          />
          <path
            d="M 23 83 C 26 73 34 71 37 71 C 40 71 48 73 51 83 Z"
            fill="#F59E0B"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* ---------------------------------------------------- */}
      {/* OVERLAPPING CARDS CONTAINER                          */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-4 sm:gap-2 relative">
        {/* =================================================== */}
        {/* CARD 1: POST COMPOSER PREVIEW (Left Card)           */}
        {/* =================================================== */}
        <div className="w-full max-w-[360px] sm:max-w-[385px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl p-4 sm:p-5 z-10 transition-transform duration-300 hover:scale-[1.01]">
          {/* 1. ROW OF 7 CHANNEL AVATARS WITH PS LOGO (All 7 fully visible) */}
          <div className="flex items-center justify-between gap-1 sm:gap-1.5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
            {channels.map((ch, idx) => {
              const isActive = activeChannelIdx === idx;
              return (
                <div
                  key={ch.id}
                  className="relative group cursor-pointer transition-transform duration-300 shrink-0"
                  onClick={() => setActiveChannelIdx(idx)}
                  title={ch.name}
                >
                  {/* Character limit counter pill for X */}
                  {ch.counter && (
                    <span className="absolute -top-3 -right-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-white text-[9px] font-bold z-20 shadow-xs border border-white dark:border-slate-800 leading-tight">
                      {ch.counter}
                    </span>
                  )}

                  {/* Circular Avatar with Authentic PulseSocial 'PS' Logo */}
                  <div
                    className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#1E3A8A] via-[#2E3788] to-[#4F46E5] flex items-center justify-center p-0.5 shadow-sm border transition-all duration-300 ${
                      isActive
                        ? "border-emerald-500 scale-110 ring-2 ring-emerald-400/40"
                        : "border-white dark:border-slate-800 group-hover:scale-105"
                    }`}
                  >
                    <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
                      <path
                        d="M18 46 L18 18 L28 18 C33.5 18 37 21.5 37 26.5 C37 31.5 33.5 35 28 35 L18 35"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M47 22 C44 18 38 18 35 21 C32 24 34.5 28 40.5 30.5 C46.5 33 48.5 36.5 46.5 41 C44.5 45.5 37.5 46.5 31.5 44"
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Social Network Icon Badge at Bottom-Right */}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white shadow-xs border border-white dark:border-slate-800"
                    style={{ backgroundColor: ch.badgeBg }}
                  >
                    {ch.icon(9)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. TEXT PLACEHOLDER BARS */}
          <div className="mt-4 space-y-2">
            <div className="h-2.5 bg-slate-200 dark:bg-slate-700/80 rounded-full w-5/6 animate-pulse" />
            <div className="h-2.5 bg-slate-200 dark:bg-slate-700/80 rounded-full w-4/6" />
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-2/5" />
          </div>

          {/* 3. POST MEDIA IMAGE */}
          <div className="mt-4 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm relative aspect-[4/3]">
            <Image
              src="/images/social/donuts-post.jpg"
              alt="Scheduled post preview"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 640px) 100vw, 385px"
              priority
            />
          </div>

          {/* 4. COMPOSER ACTION TOOLBAR ICONS */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-4 h-4 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors" />
              <VideoIcon className="w-4 h-4 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors" />
              <Smile className="w-4 h-4 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors" />
              <Hash className="w-4 h-4 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors" />
              <MapPin className="w-4 h-4 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors" />
            </div>
            <Settings className="w-4 h-4 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors" />
          </div>
        </div>

        {/* =================================================== */}
        {/* CARD 2: QUEUE & SMARTQ PANEL (Right Overlapping)   */}
        {/* =================================================== */}
        <div className="w-full max-w-[320px] sm:max-w-[335px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-4 sm:p-5 sm:-ml-2 sm:mt-6 z-20 text-left transition-transform duration-300 hover:scale-[1.01]">
          {/* Header Tabs: Schedule | Queue */}
          <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`font-semibold pb-1.5 transition-colors cursor-pointer ${
                activeTab === "schedule"
                  ? "text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white font-bold"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab("queue")}
              className={`font-semibold pb-1.5 transition-colors cursor-pointer ${
                activeTab === "queue"
                  ? "text-slate-900 dark:text-white border-b-2 border-[#DF3024] font-bold"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Queue
            </button>
          </div>

          {/* CustomQ Block */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span>CustomQ</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Fri, 02 Jan 2026 at 10:00 AM</span>
            </div>
          </div>

          {/* SmartQ Block */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span>SmartQ</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <button className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <span>Next 7 days</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* SmartQ Recommended Slots with Active Animated Highlight */}
            <div className="space-y-1.5">
              {smartQOptions.map((opt, idx) => {
                const isSelected = selectedSmartQ === idx;
                return (
                  <div
                    key={opt.text}
                    onClick={() => setSelectedSmartQ(idx)}
                    className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-lg text-[11px] cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold ring-1 ring-slate-300 dark:ring-slate-700 scale-[1.02] shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "border-[#DF3024] bg-[#DF3024] text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="font-extrabold text-[#DF3024] w-7 shrink-0 text-left">
                      {opt.percent}
                    </span>
                    <span className="truncate">{opt.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule Footer Confirmation & Action */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium transition-all duration-300">
              {smartQOptions[selectedSmartQ].sub}
            </div>

            <button
              onClick={handleAddToQueue}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                isAdded
                  ? "bg-emerald-600 text-white scale-102"
                  : "bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-98"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 animate-bounce" />
                  <span>Added to Queue!</span>
                </>
              ) : (
                <span>Add to CustomQ</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
