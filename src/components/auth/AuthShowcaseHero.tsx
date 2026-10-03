"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Send,
  Zap,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  TikTokIcon,
  YouTubeIcon,
  PinterestIcon,
} from "@/components/icons/PlatformIcons";

export function AuthShowcaseHero() {
  const [activePlatformIndex, setActivePlatformIndex] = useState(0);

  const platforms = [
    { name: "Instagram", icon: <InstagramIcon size={20} />, metric: "+340% Reach", color: "from-pink-500 to-purple-600" },
    { name: "LinkedIn", icon: <LinkedInIcon size={20} />, metric: "4.8x B2B Leads", color: "from-blue-600 to-indigo-700" },
    { name: "X (Twitter)", icon: <XIcon size={20} />, metric: "18.2K Impressions", color: "from-slate-700 to-slate-900" },
    { name: "Facebook", icon: <FacebookIcon size={20} />, metric: "+124% Followers", color: "from-blue-500 to-blue-700" },
    { name: "TikTok", icon: <TikTokIcon size={20} />, metric: "84.5K Views", color: "from-cyan-500 to-pink-500" },
    { name: "Pinterest", icon: <PinterestIcon size={20} />, metric: "22K Visual Saves", color: "from-rose-500 to-red-600" },
    { name: "YouTube", icon: <YouTubeIcon size={20} />, metric: "6.2K Watch Hours", color: "from-red-600 to-rose-700" },
  ];

  // Auto-cycle featured preview platform every 2.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePlatformIndex((prev) => (prev + 1) % platforms.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [platforms.length]);

  const active = platforms[activePlatformIndex];

  return (
    <div className="hidden lg:flex w-1/2 min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#15102a] to-[#0b0819] text-white p-8 lg:p-14 flex-col justify-between select-none">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PulseSocial AI 3.8 Active</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold bg-white/5 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>4.9 / 5 (2,400+ Agencies)</span>
        </div>
      </div>

      {/* Main Glassmorphic Showcase Stage */}
      <div className="relative z-10 my-auto py-8 max-w-lg mx-auto w-full space-y-6">
        {/* Floating Highlight Card */}
        <div className="relative rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 p-6 shadow-2xl shadow-purple-950/50 space-y-5">
          {/* Header of Composer Card */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Smart Multi-Channel Publisher
                </h4>
                <p className="text-[11px] text-purple-200/70">
                  1-Click Dispatch to 7 Connected Networks
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
              ✓ Synchronized
            </span>
          </div>

          {/* Connected Platform Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400">
              Active Target Destinations:
            </span>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p, idx) => {
                const isCurrent = idx === activePlatformIndex;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setActivePlatformIndex(idx)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer ${
                      isCurrent
                        ? "bg-white/25 text-white border border-white/40 shadow-sm scale-105"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span className="text-[11px]">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real Live Preview Simulation Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-white/10">{active.icon}</span>
                <span className="font-semibold text-white">{active.name} Live Post</span>
              </div>
              <span className="text-[11px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                {active.metric}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              &quot;Launching our brand new spring collection across 7 channels simultaneously! Automated with <span className="text-purple-400 font-semibold">@PulseSocial</span> AI Engine in 30 seconds. 🚀✨ #Growth #SocialMedia&quot;
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Policy Compliant
                </span>
                <span className="text-slate-500">•</span>
                <span>Optimized Hook</span>
              </div>
              <span className="text-purple-300 font-mono text-[10px]">Score: 98/100</span>
            </div>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Scheduled</div>
              <div className="text-base font-extrabold text-white mt-0.5">1,420+</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Time Saved</div>
              <div className="text-base font-extrabold text-emerald-400 mt-0.5">18 hrs/wk</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Engagement</div>
              <div className="text-base font-extrabold text-purple-300 mt-0.5">+48.2%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Testimonial / Social Proof */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 p-0.5">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-white text-xs">
              SJ
            </div>
          </div>
          <div>
            <div className="font-semibold text-white">Sarah Jenkins</div>
            <div className="text-[11px] text-slate-400">Head of Growth, Omnia Media (50+ Brands)</div>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-emerald-400 font-semibold block">Enterprise Ready</span>
          <span className="text-[11px] text-slate-500">SSO & MFA Enabled</span>
        </div>
      </div>
    </div>
  );
}
