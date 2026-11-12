"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Send, Flame, Clock, FileText, Calendar as CalendarIcon, Users } from "lucide-react";

export function PulseCalendarVisual() {
  const [view, setView] = useState<"month" | "week">("month");
  const [activeMenu, setActiveMenu] = useState("calendar");
  const [highlightedDay, setHighlightedDay] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const menuItems = [
    { id: "published", label: "Published Posts", icon: Send },
    { id: "promoted", label: "Promoted Posts", icon: Flame },
    { id: "scheduled", label: "Scheduled Posts", icon: Clock },
    { id: "unpublished", label: "Unpublished Posts", icon: FileText },
    { id: "drafts", label: "Drafts", icon: FileText },
    { id: "calendar", label: "Calendar", icon: CalendarIcon, active: true },
    { id: "leads", label: "Facebook Lead Gen", icon: Users },
  ];

  // Auto-cycle highlighted post days to replicate live motion video
  useEffect(() => {
    if (isPaused) return;
    const postDays = [1, 6, 7, 15];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % postDays.length;
      setHighlightedDay(postDays[idx]);
    }, 2600);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      className="relative w-full max-w-[620px] py-2 sm:py-4 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ---------------------------------------------------- */}
      {/* CALENDAR MAIN CARD WITH LEFT CONTEXT MENU            */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-center relative">
        {/* Main Calendar Viewport Card with left padding so context menu never covers dates */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl p-3.5 sm:p-6 text-left sm:pl-44 lg:pl-48">
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white whitespace-nowrap">January 2026</span>
              <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 shrink-0">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setView("month")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  view === "month" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold" : "text-slate-500"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView("week")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  view === "week" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold" : "text-slate-500"
                }`}
              >
                Week
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-5 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider py-2.5 border-b border-slate-100 dark:border-slate-800">
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-2 text-[11px] min-h-[220px]">
            {/* Day 1: With Amber Scheduled Badge */}
            <div
              className={`p-1.5 rounded-lg border min-h-[65px] transition-all duration-300 ${
                highlightedDay === 1
                  ? "border-amber-400 bg-amber-50/60 dark:bg-amber-950/40 ring-1 ring-amber-400/50 shadow-xs"
                  : "border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20"
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500">1</div>
              <div className="mt-1 px-1 sm:px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 border border-amber-300/50 text-[8px] sm:text-[9px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 whitespace-nowrap overflow-hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="sm:hidden">7:35p</span>
                <span className="hidden sm:inline">07:35 PM</span>
              </div>
            </div>

            {/* Day 2 */}
            <div className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 min-h-[65px]">
              <div className="text-[10px] font-bold text-slate-500">2</div>
            </div>

            {/* Day 6: Post Pill with PS Logo */}
            <div
              className={`p-1.5 rounded-lg border min-h-[65px] transition-all duration-300 ${
                highlightedDay === 6
                  ? "border-blue-400 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-400/50 shadow-xs"
                  : "border-slate-100 dark:border-slate-800/80"
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500">6</div>
              <div className="mt-1 px-1 sm:px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 border border-blue-200 text-blue-800 dark:text-blue-300 text-[8px] sm:text-[9px] font-semibold flex items-center gap-1 shadow-xs overflow-hidden">
                {/* PS Avatar Dot */}
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A] shrink-0 flex items-center justify-center text-[5px] text-white font-black">P</span>
                <span className="truncate sm:hidden">Drop</span>
                <span className="truncate hidden sm:inline">Feature Drop</span>
              </div>
            </div>

            {/* Day 7: Post Pill with PS Logo */}
            <div
              className={`p-1.5 rounded-lg border min-h-[65px] transition-all duration-300 ${
                highlightedDay === 7
                  ? "border-blue-400 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-400/50 shadow-xs"
                  : "border-slate-100 dark:border-slate-800/80"
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500">7</div>
              <div className="mt-1 px-1 sm:px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 border border-blue-200 text-blue-800 dark:text-blue-300 text-[8px] sm:text-[9px] font-semibold flex items-center gap-1 shadow-xs overflow-hidden">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A] shrink-0 flex items-center justify-center text-[5px] text-white font-black">P</span>
                <span className="truncate sm:hidden">Reel</span>
                <span className="truncate hidden sm:inline">Amalfi Reel</span>
              </div>
            </div>

            {/* Day 8 */}
            <div className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 min-h-[65px]">
              <div className="text-[10px] font-bold text-slate-500">8</div>
              <div className="mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
            </div>

            {/* Day 9 */}
            <div className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 min-h-[65px]">
              <div className="text-[10px] font-bold text-slate-500">9</div>
            </div>

            {/* Day 13 */}
            <div className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 min-h-[65px]">
              <div className="text-[10px] font-bold text-slate-500">13</div>
              <div className="mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
            </div>

            {/* Day 14 */}
            <div className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 min-h-[65px]">
              <div className="text-[10px] font-bold text-slate-500">14</div>
              <div className="mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
            </div>

            {/* Day 15 */}
            <div
              className={`p-1.5 rounded-lg border min-h-[65px] transition-all duration-300 ${
                highlightedDay === 15
                  ? "border-blue-400 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-400/50 shadow-xs"
                  : "border-slate-100 dark:border-slate-800/80"
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500">15</div>
              <div className="mt-1 px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 border border-blue-200 text-blue-800 dark:text-blue-300 text-[9px] font-semibold flex items-center gap-1 truncate shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A] shrink-0 flex items-center justify-center text-[5px] text-white font-black">P</span>
                <span className="truncate">Webinar Post</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Left Context Menu */}
        <div className="absolute left-0 sm:-left-3 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-2 w-40 lg:w-44 z-20 space-y-1 text-left hidden sm:block">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeMenu === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold border-l-2 border-amber-500"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
