"use client";

import React from "react";
import { Star } from "lucide-react";

export function PulseAwardsGrid() {
  const awards = [
    {
      id: "constellation",
      description: "Shortlist for Social Engagement and Listening Platforms 2026",
    },
    {
      id: "forbes",
      description: "Best Social Media Management Tools 2026: For Individual Creators",
    },
    {
      id: "software-advice",
      description: "Best in Front Runners 2026 for Brand Management",
    },
    {
      id: "capterra",
      description: "Shortlist for Social Media Marketing 2026",
    },
    {
      id: "getapp",
      description: "Category Leaders 2026 for Social Media Analytics Tool",
    },
  ];

  const ratingPlatforms = [
    {
      name: "Trustpilot",
      score: "4.8",
      max: "5",
      icon: (
        <span className="text-[#00B67A] font-black text-base sm:text-lg flex items-center">
          <Star className="w-4 sm:w-5 h-4 sm:h-5 fill-[#00B67A] text-[#00B67A] mr-1.5" />
          Trustpilot
        </span>
      ),
    },
    {
      name: "Capterra",
      score: "4.7",
      max: "5",
      icon: (
        <span className="text-[#102A43] dark:text-sky-300 font-extrabold text-sm sm:text-base flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-xs inline-block mr-1.5 transform rotate-45" />
          Capterra
        </span>
      ),
    },
    {
      name: "Gartner",
      score: "4.6",
      max: "5",
      icon: (
        <span className="font-black tracking-tight text-slate-900 dark:text-white text-base sm:text-lg">
          Gartner.
        </span>
      ),
    },
    {
      name: "Gartner Peer Insights",
      score: "4.5",
      max: "5",
      icon: (
        <div className="flex flex-col text-left leading-none">
          <span className="font-extrabold text-[12px] sm:text-[13px] text-slate-900 dark:text-slate-100">Gartner</span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">peer insights.</span>
        </div>
      ),
    },
    {
      name: "GetApp",
      score: "4.7",
      max: "5",
      icon: (
        <span className="text-teal-600 dark:text-teal-400 font-extrabold text-sm sm:text-base flex items-center">
          <span className="text-sm mr-1 font-black leading-none">»</span> GetApp
        </span>
      ),
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-950 border-t border-b border-slate-100 dark:border-slate-850 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* ROW 1: 5-COLUMN INDUSTRY ACCREDITATIONS (Pre-slider clean)*/}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 items-start text-center">
          {/* 1. Constellation Research */}
          <div className="flex flex-col items-center justify-start space-y-2 p-3 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-all duration-300 hover:scale-105 group cursor-pointer">
            <div className="h-14 flex items-center justify-center transition-transform group-hover:scale-110">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <div className="w-8 h-8 rounded-full border-2 border-purple-600 flex items-center justify-center relative shadow-xs">
                  <div className="w-3.5 h-3.5 rounded-full bg-purple-600" />
                  <div className="absolute -inset-1 rounded-full border border-purple-400/50" />
                </div>
                <div className="text-left leading-tight">
                  <div className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    constellation
                  </div>
                  <div className="text-[8px] text-purple-600 dark:text-purple-400 font-bold tracking-[2px] uppercase">
                    RESEARCH
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-[170px]">
              Shortlist for Social Engagement and Listening Platforms 2026
            </p>
          </div>

          {/* 2. Forbes ADVISOR */}
          <div className="flex flex-col items-center justify-start space-y-2 p-3 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-all duration-300 hover:scale-105 group cursor-pointer">
            <div className="h-14 flex items-center justify-center transition-transform group-hover:scale-110">
              <div className="text-center">
                <span className="font-serif font-black text-2xl tracking-tight text-slate-900 dark:text-white">
                  Forbes
                </span>
                <span className="block text-[9px] font-bold tracking-[2px] text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                  ADVISOR
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-[170px]">
              Best Social Media Management Tools 2026: For Individual Creators
            </p>
          </div>

          {/* 3. Software Advice Front Runners */}
          <div className="flex flex-col items-center justify-start space-y-2 p-3 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-all duration-300 hover:scale-105 group cursor-pointer">
            <div className="h-14 flex items-center justify-center transition-transform group-hover:scale-110">
              <div className="w-[124px] bg-[#1E293B] rounded-lg shadow-sm border border-slate-700 overflow-hidden text-center">
                <div className="bg-[#EA580C] text-white text-[8px] font-bold py-0.5 tracking-wider uppercase">
                  Software Advice
                </div>
                <div className="px-1 py-1.5 leading-tight">
                  <div className="text-[10px] font-black uppercase tracking-tight text-white">
                    FRONT RUNNERS
                  </div>
                  <div className="text-[8px] text-amber-300 font-bold mt-0.5">2026</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-[170px]">
              Best in Front Runners 2026 for Brand Management
            </p>
          </div>

          {/* 4. Capterra Shortlist */}
          <div className="flex flex-col items-center justify-start space-y-2 p-3 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-all duration-300 hover:scale-105 group cursor-pointer">
            <div className="h-14 flex items-center justify-center transition-transform group-hover:scale-110">
              <div className="w-[124px] bg-[#0F172A] rounded-lg shadow-sm border border-slate-700 overflow-hidden text-center">
                <div className="bg-[#0284C7] text-white text-[8px] font-bold py-0.5 tracking-wider uppercase flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 inline-block rotate-45" />
                  Capterra
                </div>
                <div className="px-1 py-1 leading-tight">
                  <div className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                    SHORTLIST
                  </div>
                  <div className="text-[8px] text-slate-300 font-bold">2026</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-[170px]">
              Shortlist for Social Media Marketing 2026
            </p>
          </div>

          {/* 5. GetApp Category Leaders */}
          <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-start space-y-2 p-3 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-all duration-300 hover:scale-105 group cursor-pointer">
            <div className="h-14 flex items-center justify-center transition-transform group-hover:scale-110">
              <div className="w-[124px] bg-[#134E4A] rounded-lg shadow-sm border border-teal-700 overflow-hidden text-center">
                <div className="bg-[#0D9488] text-white text-[8px] font-bold py-0.5 tracking-wider uppercase flex items-center justify-center gap-0.5">
                  <span className="font-black">»</span> GetApp
                </div>
                <div className="px-1 py-1 leading-tight">
                  <div className="text-[9px] font-black uppercase text-white">
                    Category Leaders
                  </div>
                  <div className="text-[8px] text-teal-200 font-bold">2026</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-[170px]">
              Category Leaders 2026 for Social Media Analytics Tool
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: VERIFIED RATINGS & REVIEWS (Pre-slider clean grid) */}
        {/* ========================================================= */}
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 items-center">
            {ratingPlatforms.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 shadow-xs hover:shadow-md hover:scale-105 hover:bg-white dark:hover:bg-slate-850 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center">{item.icon}</div>
                <div className="flex items-baseline gap-0.5 text-right font-black">
                  <span className="text-base sm:text-lg text-slate-900 dark:text-white">
                    {item.score}
                  </span>
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
