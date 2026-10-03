"use client";

import React from "react";
import { Star, Award, ShieldCheck, CheckCircle } from "lucide-react";

export function PulseAwardsGrid() {
  const awards = [
    {
      title: "constellation",
      subtitle: "RESEARCH",
      badgeType: "text-logo",
      description: "Shortlist for Social Engagement and Listening Platforms 2026",
    },
    {
      title: "Forbes",
      subtitle: "ADVISOR",
      badgeType: "serif-logo",
      description: "Best Social Media Management Tools 2026: For Individual Creators",
    },
    {
      title: "FRONT RUNNERS",
      year: "2026",
      source: "Software Advice",
      badgeType: "shield",
      description: "Best in Front Runners 2026 for Brand Management",
    },
    {
      title: "Capterra",
      subtitle: "SHORTLIST 2026",
      badgeType: "capterra-shield",
      description: "Shortlist for Social Media Marketing 2026",
    },
    {
      title: "GetApp",
      subtitle: "Category Leaders 2026",
      badgeType: "getapp-hexagon",
      description: "Category Leaders 2026 for Social Media Analytics Tool",
    },
  ];

  const ratingPlatforms = [
    {
      name: "Trustpilot",
      score: "4.8",
      max: "5",
      icon: (
        <span className="text-[#00B67A] font-black text-lg flex items-center">
          <Star className="w-5 h-5 fill-[#00B67A] text-[#00B67A] mr-1" />
          Trustpilot
        </span>
      ),
    },
    {
      name: "Capterra",
      score: "4.7",
      max: "5",
      icon: (
        <span className="text-[#203a43] dark:text-sky-300 font-bold text-base flex items-center">
          <span className="w-3.5 h-3.5 bg-blue-500 rounded-sm inline-block mr-1.5 transform rotate-45" />
          Capterra
        </span>
      ),
    },
    {
      name: "Gartner",
      score: "4.6",
      max: "5",
      icon: <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">Gartner.</span>,
    },
    {
      name: "Gartner Peer Insights",
      score: "4.5",
      max: "5",
      icon: (
        <div className="flex flex-col text-left leading-none">
          <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">Gartner</span>
          <span className="text-[9px] text-slate-500">peer insights.</span>
        </div>
      ),
    },
    {
      name: "GetApp",
      score: "4.7",
      max: "5",
      icon: (
        <span className="text-teal-600 dark:text-teal-400 font-bold text-sm flex items-center">
          <span className="text-xs mr-1">»</span> GetApp
        </span>
      ),
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-950 border-t border-b border-slate-100 dark:border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* ROW 1: INDUSTRY ACCREDITATION BADGES (Exact from PDF)     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 items-start text-center">
          {/* 1. Constellation Research */}
          <div className="flex flex-col items-center justify-start space-y-2 p-3">
            <div className="h-14 flex items-center justify-center">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <div className="w-7 h-7 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                </div>
                <div className="text-left leading-tight">
                  <div className="font-bold text-xs uppercase tracking-wider">constellation</div>
                  <div className="text-[9px] text-slate-400 tracking-widest uppercase">RESEARCH</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-[160px]">
              Shortlist for Social Engagement and Listening Platforms 2026
            </p>
          </div>

          {/* 2. Forbes ADVISOR */}
          <div className="flex flex-col items-center justify-start space-y-2 p-3">
            <div className="h-14 flex items-center justify-center">
              <div className="text-left">
                <span className="font-serif font-black text-xl tracking-tight text-slate-900 dark:text-white">
                  Forbes
                </span>
                <span className="block text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase">
                  ADVISOR
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-[160px]">
              Best Social Media Management Tools 2026: For Individual Creators
            </p>
          </div>

          {/* 3. Software Advice Front Runners */}
          <div className="flex flex-col items-center justify-start space-y-2 p-3">
            <div className="h-14 flex items-center justify-center">
              <div className="bg-[#1E293B] text-white px-3 py-1.5 rounded-sm text-[9px] font-bold text-center leading-tight shadow-sm border border-slate-700">
                <div className="text-[8px] text-amber-400 tracking-wider">Software Advice</div>
                <div className="text-[11px] font-black uppercase tracking-tight text-white">FRONT RUNNERS</div>
                <div className="text-[8px] text-slate-300">2026</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-[160px]">
              Best in Front Runners 2026 for Brand Management
            </p>
          </div>

          {/* 4. Capterra Shortlist */}
          <div className="flex flex-col items-center justify-start space-y-2 p-3">
            <div className="h-14 flex items-center justify-center">
              <div className="bg-[#0F172A] text-white px-3.5 py-1.5 rounded-sm text-center leading-tight shadow-sm border border-slate-700">
                <div className="text-[11px] font-black tracking-tight text-sky-400 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-amber-400 inline-block rotate-45" />
                  Capterra
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-200">SHORTLIST</div>
                <div className="text-[8px] text-slate-400">2026</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-[160px]">
              Shortlist for Social Media Marketing 2026
            </p>
          </div>

          {/* 5. GetApp Category Leaders */}
          <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-start space-y-2 p-3">
            <div className="h-14 flex items-center justify-center">
              <div className="bg-[#134E4A] text-white px-3.5 py-1.5 rounded-sm text-center leading-tight shadow-sm border border-teal-700">
                <div className="text-[10px] font-bold text-teal-300 flex items-center justify-center gap-0.5">
                  <span>»</span> GetApp
                </div>
                <div className="text-[9px] font-bold uppercase text-white">Category Leaders</div>
                <div className="text-[8px] text-teal-200">2026</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-[160px]">
              Category Leaders 2026 for Social Media Analytics Tool
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: VERIFIED REVIEWS & RATINGS (Exact from PDF)        */}
        {/* ========================================================= */}
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 items-center">
            {ratingPlatforms.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 transition-all hover:bg-slate-100/80 dark:hover:bg-slate-850"
              >
                <div className="flex items-center">{item.icon}</div>
                <div className="flex items-baseline gap-0.5 text-right font-black">
                  <span className="text-base sm:text-lg text-slate-900 dark:text-white">{item.score}</span>
                  <span className="text-xs text-slate-400 font-normal">/{item.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
