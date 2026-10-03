"use client";

import React from "react";
import { Check } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  TikTokIcon,
  WhatsAppIcon,
  SnapchatIcon,
  ThreadsIcon,
  PinterestIcon,
} from "@/components/icons/PlatformIcons";

export function AuthShowcaseHero() {
  return (
    <div className="hidden md:flex w-1/2 bg-[#9674D4] min-h-screen items-center justify-center p-6 lg:p-12 relative overflow-hidden select-none">
      {/* ---------------------------------------------------- */}
      {/* FLOATING OUTLINE ICONS AROUND TABLET (Side-by-side)  */}
      {/* ---------------------------------------------------- */}
      {/* Top Left: Chat bubble with 'i' */}
      <div className="absolute left-6 lg:left-14 top-14 opacity-75">
        <svg
          width="44"
          height="40"
          viewBox="0 0 46 42"
          fill="none"
          stroke="#EAE0FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 5 C5 2 7 1 12 1 L34 1 C39 1 41 2 41 5 L41 27 C41 30 39 31 34 31 L20 31 L12 39 L13 31 L8 31 C6 31 5 30 5 27 Z" />
          <line x1="23" y1="12" x2="23" y2="23" strokeWidth="2.5" />
          <circle cx="23" cy="8" r="1.5" fill="#EAE0FF" stroke="none" />
        </svg>
      </div>

      {/* Mid Left: 24/7 Support Globe */}
      <div className="absolute left-4 lg:left-10 top-1/2 -translate-y-16 opacity-75">
        <div className="relative w-14 h-14">
          <svg viewBox="0 0 56 56" fill="none" stroke="#EAE0FF" strokeWidth="1.8" className="w-full h-full">
            <circle cx="28" cy="28" r="24" />
            <ellipse cx="28" cy="28" rx="12" ry="24" />
            <line x1="4" y1="28" x2="52" y2="28" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-[#9674D4] px-1 text-[11px] font-bold text-white tracking-wider border border-white/60 rounded">
              24
            </span>
          </div>
        </div>
      </div>

      {/* Lower Left: Analytics Bar & Line Chart Card */}
      <div className="absolute left-6 lg:left-14 bottom-16 opacity-75">
        <div className="w-16 h-12 rounded-lg border-2 border-[#EAE0FF] p-1.5 flex flex-col justify-between">
          <svg viewBox="0 0 50 30" fill="none" stroke="#EAE0FF" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 22 L14 16 L24 20 L36 8 L46 12" />
            <line x1="10" y1="28" x2="10" y2="24" strokeWidth="3" />
            <line x1="20" y1="28" x2="20" y2="22" strokeWidth="3" />
            <line x1="30" y1="28" x2="30" y2="18" strokeWidth="3" />
            <line x1="40" y1="28" x2="40" y2="14" strokeWidth="3" />
          </svg>
        </div>
      </div>

      {/* Top Right: Speech bubble with dots */}
      <div className="absolute right-6 lg:left-auto lg:right-14 top-14 opacity-75">
        <svg
          width="44"
          height="34"
          viewBox="0 0 44 34"
          fill="none"
          stroke="#EAE0FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="40" height="26" rx="13" />
          <circle cx="15" cy="15" r="2" fill="#EAE0FF" stroke="none" />
          <circle cx="22" cy="15" r="2" fill="#EAE0FF" stroke="none" />
          <circle cx="29" cy="15" r="2" fill="#EAE0FF" stroke="none" />
        </svg>
      </div>

      {/* Mid Right: Headset */}
      <div className="absolute right-4 lg:right-10 top-1/2 -translate-y-16 opacity-75">
        <svg
          width="46"
          height="46"
          viewBox="0 0 46 46"
          fill="none"
          stroke="#EAE0FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 24 C10 14 16 7 23 7 C30 7 36 14 36 24" />
          <rect x="6" y="22" width="7" height="14" rx="3.5" />
          <rect x="33" y="22" width="7" height="14" rx="3.5" />
          <path d="M33 33 C33 39 27 41 23 41" />
          <circle cx="21" cy="41" r="2" fill="#EAE0FF" stroke="none" />
        </svg>
      </div>

      {/* Lower Right: Schedule Calendar */}
      <div className="absolute right-6 lg:right-14 bottom-16 opacity-75">
        <div className="w-14 h-14 rounded-xl border-2 border-[#EAE0FF] p-1.5 flex flex-col justify-between">
          <div className="border-b border-[#EAE0FF] pb-1 flex justify-between items-center text-[7.5px] font-bold text-white uppercase tracking-wider">
            <span>Schedule</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div className="w-2 h-2 rounded-2xs bg-white/60" />
            <div className="w-2 h-2 rounded-2xs bg-white/60" />
            <div className="w-2 h-2 rounded-2xs bg-white/90" />
            <div className="w-2 h-2 rounded-2xs bg-white/60" />
            <div className="w-2 h-2 rounded-2xs bg-white/90" />
            <div className="w-2 h-2 rounded-2xs bg-white/60" />
          </div>
        </div>
      </div>

      {/* Bottom Right Corner: 4-Pointed Sparkle Star */}
      <div className="absolute right-12 bottom-6 opacity-80">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#EAE0FF">
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
        </svg>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAIN VISUAL COLUMN: TITLE + TABLET + OVERLAPPING MONITOR */}
      {/* ---------------------------------------------------- */}
      <div className="w-full max-w-[560px] flex flex-col items-center relative z-10 pb-8">
        {/* Header: All Social App Link Social Management */}
        <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mb-8 text-center drop-shadow-sm">
          All Social App Link Social Management
        </h2>

        {/* Tablet Frame */}
        <div className="relative w-full rounded-[30px] border-2 border-white/70 p-5 bg-white/10 backdrop-blur-xs shadow-2xl">
          {/* 3x3 Grid of 9 Social Connection Cards */}
          <div className="grid grid-cols-3 gap-3.5">
            {/* 1. LinkedIn */}
            <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
              <div className="flex items-center justify-between">
                <LinkedInIcon className="w-5 h-5 text-[#0A66C2]" />
                <div className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
              </div>
            </div>

            {/* 2. Twitter / X */}
            <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
              <div className="flex items-center justify-between">
                <XIcon className="w-4 h-4 text-black" />
                <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[8px] font-black tracking-tighter">
                  •••
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
              </div>
            </div>

            {/* 3. Instagram */}
            <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
              <div className="flex items-center justify-between">
                <InstagramIcon className="w-5 h-5" />
                <div className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
              </div>
            </div>

            {/* 4. Facebook */}
            <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
              <div className="flex items-center justify-between">
                <FacebookIcon className="w-5 h-5 text-[#1877F2]" />
                <div className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
              </div>
            </div>

            {/* 5. Pinterest */}
            <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
              <div className="flex items-center justify-between">
                <PinterestIcon className="w-5 h-5" />
                <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[8px] font-black tracking-tighter">
                  •••
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
              </div>
            </div>

            {/* 6. TikTok */}
            <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
              <div className="flex items-center justify-between">
                <TikTokIcon className="w-5 h-5 text-black" />
                <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                  +
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
              </div>
            </div>

            {/* 7. Threads */}
            <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
              <div className="flex items-center justify-between">
                <ThreadsIcon className="w-5 h-5 text-black" />
                <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[8px] font-black tracking-tighter">
                  •••
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
              </div>
            </div>

            {/* 8. WhatsApp */}
            <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
              <div className="flex items-center justify-between">
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                <div className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
              </div>
            </div>

            {/* 9. Snapchat */}
            <div className="bg-white rounded-xl p-3 shadow-md border border-white/60 flex flex-col justify-between h-[84px] transition hover:shadow-lg">
              <div className="flex items-center justify-between">
                <SnapchatIcon className="w-5 h-5 text-[#FFFC00]" />
                <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                  +
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Accounts Linked</div>
                <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">Post Performance</div>
              </div>
            </div>
          </div>

          {/* OVERLAPPING COMPUTER MONITOR WITH SPECIALIST & FLOATING BADGE */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[270px] sm:w-[290px] drop-shadow-2xl z-20">
            <div className="relative">
              {/* Floating Circular Checkmark Badge on left */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-white z-30">
                <Check className="w-5 h-5 text-[#8F74BD] stroke-[3]" />
              </div>

              {/* Monitor SVG */}
              <svg viewBox="0 0 290 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <defs>
                  <linearGradient id="monitorScreenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E1738" />
                    <stop offset="100%" stopColor="#2A1F4E" />
                  </linearGradient>
                  <linearGradient id="specialistShirt" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6C4EA8" />
                    <stop offset="100%" stopColor="#553A8C" />
                  </linearGradient>
                </defs>

                {/* Oval Base & Neck */}
                <ellipse cx="145" cy="222" rx="65" ry="7" fill="#FFFFFF" />
                <path d="M135 186 L130 220 L160 220 L155 186 Z" fill="#FFFFFF" />

                {/* Monitor Screen Frame (White rounded bezel) */}
                <rect
                  x="25"
                  y="10"
                  width="240"
                  height="178"
                  rx="20"
                  fill="url(#monitorScreenGrad)"
                  stroke="#FFFFFF"
                  strokeWidth="5"
                />

                {/* Customer Support Specialist Character */}
                {/* Torso / Purple Shirt */}
                <path d="M90 186 C90 128 115 110 145 110 C175 110 200 128 200 186 Z" fill="url(#specialistShirt)" />

                {/* Stylized Twin Pigtails / Buns (Black Hair) */}
                <circle cx="118" cy="62" r="14" fill="#111119" />
                <circle cx="172" cy="62" r="14" fill="#111119" />

                {/* Neck and Head */}
                <rect x="139" y="88" width="12" height="20" fill="#FFFFFF" rx="2" />
                <ellipse cx="145" cy="74" rx="16" ry="20" fill="#FFFFFF" />

                {/* Hair Front / Bangs */}
                <path d="M129 70 C129 55 140 50 145 50 C155 50 161 55 161 70 C154 62 136 62 129 70 Z" fill="#111119" />

                {/* Friendly Smile & Facial features */}
                <circle cx="139" cy="73" r="1.5" fill="#2E284A" />
                <circle cx="151" cy="73" r="1.5" fill="#2E284A" />
                <path d="M141 80 Q145 83 149 80" stroke="#2E284A" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                {/* Left Arm & Hand Raised Making Peace / Wave Symbol */}
                <path
                  d="M96 186 C88 165 85 140 85 115 C85 92 89 75 92 62"
                  stroke="#FFFFFF"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="94" cy="58" r="6" fill="#FFFFFF" />
                <line x1="88" y1="56" x2="85" y2="40" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="94" y1="54" x2="94" y2="36" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="100" y1="56" x2="103" y2="40" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
