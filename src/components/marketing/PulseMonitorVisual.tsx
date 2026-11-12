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
    <div className="relative w-full max-w-[580px] pt-2 pb-4 sm:pb-8 select-none">
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
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse ml-0.5" />
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
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden relative shrink-0">
                    <Image
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                      alt="Eric Upzzfun"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <div className="font-bold text-[11px] text-slate-900 dark:text-white truncate">Eric Upzzfun</div>
                    <div className="text-[9px] text-slate-400">6 Jan 2026 &bull; 04:47 PM</div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[8px] uppercase shrink-0">
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
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden relative shrink-0">
                    <Image
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=80"
                      alt="Anudeep Srikanth"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <div className="font-bold text-[11px] text-slate-900 dark:text-white truncate">Anudeep Srikanth</div>
                    <div className="text-[9px] text-slate-400">7 Feb 2026 &bull; 04:05 PM</div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[8px] uppercase shrink-0">
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
