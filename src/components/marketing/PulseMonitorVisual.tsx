"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MessageSquare, Heart, Repeat2, Share2, ThumbsUp, MoreHorizontal, Sparkles } from "lucide-react";
import { XIcon, FacebookIcon } from "@/components/icons/PlatformIcons";

export function PulseMonitorVisual() {
  const [likesCount, setLikesCount] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);

  // Subtle auto-pulse like counter to simulate active live monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setLikesCount((prev) => (prev >= 48 ? 42 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[580px] pt-4 pb-12 sm:pb-16 select-none">
      {/* ---------------------------------------------------- */}
      {/* HAND-DRAWN DOODLES (Monitor, Coffee Cup, Plant)     */}
      {/* ---------------------------------------------------- */}
      <div className="absolute bottom-0 right-0 sm:right-4 pointer-events-none z-30 opacity-90 animate-float-reverse">
        <svg width="180" height="90" viewBox="0 0 180 90" fill="none">
          {/* Potted Plant (Left) */}
          <path d="M 20 82 L 32 82 L 30 65 L 22 65 Z" stroke="#0F172A" strokeWidth="2" fill="#FFFFFF" />
          <path d="M 26 65 Q 20 50 12 52 M 26 65 Q 26 44 26 40 M 26 65 Q 32 50 40 52" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

          {/* Desktop Computer Monitor (Center) */}
          <rect x="52" y="10" width="76" height="52" rx="4" stroke="#0F172A" strokeWidth="2.5" fill="#FFFFFF" />
          {/* Stand */}
          <path d="M 85 62 L 77 78 L 103 78 L 95 62" stroke="#0F172A" strokeWidth="2.5" fill="#FFFFFF" strokeLinejoin="round" />
          <line x1="70" y1="78" x2="110" y2="78" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          {/* PulseSocial Logo on Screen with Live Beacon */}
          <g transform="translate(76, 22) scale(0.42)">
            <rect width="64" height="64" rx="16" fill="#1E3A8A" />
            <path d="M18 46 L18 18 L28 18 C33.5 18 37 21.5 37 26.5 C37 31.5 33.5 35 28 35 L18 35" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M47 22 C44 18 38 18 35 21 C32 24 34.5 28 40.5 30.5 C46.5 33 48.5 36.5 46.5 41 C44.5 45.5 37.5 46.5 31.5 44" fill="none" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* Coffee Mug with Animated Steam (Right) */}
          <rect x="140" y="54" width="18" height="24" rx="2" stroke="#0F172A" strokeWidth="2" fill="#FFFFFF" />
          <path d="M 158 58 Q 166 64 158 72" stroke="#0F172A" strokeWidth="2" fill="none" />
          <path d="M 145 48 Q 148 42 144 38 M 151 46 Q 154 40 150 36" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
        </svg>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2 STAGGERED LISTENING COLUMNS                        */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 items-start text-left">
        {/* =================================================== */}
        {/* COLUMN 1: MENTIONS & VISITOR POSTS                  */}
        {/* =================================================== */}
        <div className="space-y-4">
          {/* Card 1: Mentions Column */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-lg p-3.5 sm:p-4 transition-transform duration-300 hover:scale-[1.01]">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center p-1">
                  <XIcon size={11} />
                </span>
                <span>Mentions</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              </div>
              <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Calvin Bramyon Tweet */}
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden relative shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                    alt="Calvin Bramyon"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="leading-tight">
                  <div className="font-bold text-[11px] text-slate-900 dark:text-white">Calvin Bramyon</div>
                  <div className="text-[9px] text-slate-400">@calvinbramyon_23 • 10 Jan 2026 12:44 PM</div>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-700 dark:text-slate-300 leading-snug font-normal">
                I just booked our next multi-brand social campaign with{" "}
                <span className="font-bold text-[#1668e3] dark:text-[#38bdf8] bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded">
                  @PulseSocial
                </span>{" "}
                and I&apos;m so excited! 🚀✨
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-[10px] text-slate-400">
                <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1 transition-colors">
                  <MessageSquare className="w-3 h-3" /> Reply
                </span>
                <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1 transition-colors">
                  <Repeat2 className="w-3 h-3" /> Repost
                </span>
                <button
                  onClick={() => {
                    setHasLiked(!hasLiked);
                    setLikesCount((prev) => (hasLiked ? prev - 1 : prev + 1));
                  }}
                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                    hasLiked ? "text-rose-500 font-bold" : "hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-3 h-3 ${hasLiked ? "fill-current" : ""}`} />
                  <span>{likesCount}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Visitor Posts Column */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-lg p-3.5 sm:p-4 transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center p-1">
                  <FacebookIcon size={11} />
                </span>
                <span>Visitor Posts</span>
              </div>
              <span className="text-[9px] text-slate-400 font-semibold">PulseSocial Page</span>
            </div>

            {/* Post 1: Eric Upzzfun */}
            <div className="mt-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden relative shrink-0">
                    <Image
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                      alt="Eric Upzzfun"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-slate-900 dark:text-white">Eric Upzzfun</span>
                    <span className="text-[9px] text-slate-400 ml-1.5">6 Jan 2026 04:47 PM</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[8px] uppercase">
                  Lead
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                Adding all these places into bucketlist &lt;3
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                <span className="hover:text-blue-600 cursor-pointer">Like</span>
                <span className="hover:text-blue-600 cursor-pointer">Comment</span>
              </div>
            </div>

            {/* Post 2: Anudeep Srikanth */}
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden relative shrink-0">
                    <Image
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=80"
                      alt="Anudeep Srikanth"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-slate-900 dark:text-white">Anudeep Srikanth</span>
                    <span className="text-[9px] text-slate-400 ml-1.5">7 Feb 2026 04:05 PM</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[8px] uppercase">
                  Lead
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                Wonderful Experience.
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                <span className="hover:text-blue-600 cursor-pointer">Like</span>
                <span className="hover:text-blue-600 cursor-pointer">Comment</span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* COLUMN 2: PULSESOCIAL POSTS COLUMN                  */}
        {/* =================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xl p-3.5 sm:p-4 text-left transition-transform duration-300 hover:scale-[1.01]">
          {/* Header with PulseSocial Facebook Post */}
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center p-1">
              <FacebookIcon size={11} />
            </span>
            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
              PulseSocial&apos;s Posts
            </span>
          </div>

          {/* Post Author with PS Monogram Logo */}
          <div className="mt-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1E3A8A] via-[#2E3788] to-[#4F46E5] flex items-center justify-center p-0.5 shadow-xs border border-white dark:border-slate-800">
              <span className="text-[9px] font-black text-white">PS</span>
            </div>
            <div>
              <div className="font-bold text-[11px] text-slate-900 dark:text-white">PulseSocial</div>
              <div className="text-[9px] text-slate-400">6 Jan 2026 04:47 PM</div>
            </div>
          </div>

          {/* Post Content */}
          <p className="mt-2 text-[11px] text-slate-800 dark:text-slate-200 font-medium leading-snug">
            What is feminism&apos;s role in contemporary architecture?
          </p>

          {/* Post Photo (Architecture River Bridge) */}
          <div className="mt-2.5 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative aspect-[16/10] shadow-sm">
            <Image
              src="/images/social/social-post2.png"
              alt="Contemporary architecture bridge with historic town"
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Post Engagement Bar */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                <ThumbsUp className="w-3 h-3 text-[#1877F2]" /> Like
              </span>
              <span className="hover:text-blue-600 cursor-pointer">Comment</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-medium">
              <span>👍 4</span>
              <span>💬 6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
