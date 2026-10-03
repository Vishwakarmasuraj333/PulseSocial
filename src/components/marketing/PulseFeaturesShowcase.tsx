"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar as CalendarIcon,
  MessageSquare,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
  Share2,
  Flame,
  Send,
  Sliders,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Eye,
  Radio,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
  TikTokIcon,
  PinterestIcon,
} from "@/components/icons/PlatformIcons";

export function PulseFeaturesShowcase() {
  // Auto-switch states
  const [activeSlot, setActiveSlot] = useState(2);
  const [calendarDayIndex, setCalendarDayIndex] = useState(1);
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [monitorTab, setMonitorTab] = useState<"mentions" | "brand" | "competitors">("mentions");

  // 1. Auto-switch Schedule Slot every 2.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlot((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // 2. Auto-switch Calendar active day every 2.6s
  useEffect(() => {
    const timer = setInterval(() => {
      setCalendarDayIndex((prev) => (prev + 1) % 5);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  // 3. Auto-switch Monitor tabs every 3.6s
  useEffect(() => {
    const tabs: ("mentions" | "brand" | "competitors")[] = ["mentions", "brand", "competitors"];
    const timer = setInterval(() => {
      setMonitorTab((prev) => {
        const nextIdx = (tabs.indexOf(prev) + 1) % tabs.length;
        return tabs[nextIdx];
      });
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const scheduleSlots = [
    {
      time: "09:00 AM",
      title: "Product Feature Drop • Carousel",
      platform: "instagram",
      platformName: "Instagram",
      tag: "Morning Commute",
      isBest: false,
      reach: "3.4K Reach",
    },
    {
      time: "12:30 PM",
      title: "Industry Thought Leadership Post",
      platform: "linkedin",
      platformName: "LinkedIn",
      tag: "Lunch Peak",
      isBest: false,
      reach: "5.1K Reach",
    },
    {
      time: "03:15 PM",
      title: "Viral Video Reel • Amalfi Visuals",
      platform: "meta",
      platformName: "Facebook & X",
      tag: "Best Time (Spike +42%)",
      isBest: true,
      reach: "18.9K Reach",
    },
    {
      time: "07:45 PM",
      title: "Evening Community Q&A Poll",
      platform: "x",
      platformName: "X (Twitter)",
      tag: "Prime Time",
      isBest: false,
      reach: "7.2K Reach",
    },
  ];

  const calendarDays = [
    { day: "Mon 05", cardTitle: "Instagram Reel", time: "10:00 AM", color: "pink" },
    { day: "Tue 06", cardTitle: "LinkedIn Article", time: "2:15 PM", color: "blue" },
    { day: "Wed 07", cardTitle: "X Thread #1", time: "11:00 AM", color: "sky", secondCard: { title: "FB Campaign", time: "4:30 PM" } },
    { day: "Thu 08", cardTitle: "YouTube Short", time: "6:00 PM", color: "purple" },
    { day: "Fri 09", cardTitle: "Pinterest Idea Pin", time: "1:30 PM", color: "rose" },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32">
        {/* ========================================================= */}
        {/* FEATURE 1: SCHEDULE (Text Left, Graphic Right)             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              SCHEDULE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Flexible scheduling that saves you time
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Schedule your posts for times when your audience is most active. Choose from our best-time predictions, or create your own publishing schedule.
            </p>
            <div className="pt-2">
              <Link
                href="/features#publishing"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group"
              >
                <span>Learn more about publishing</span>
                <span className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                  ▶
                </span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 flex justify-center">
            {/* Interactive Schedule Visual Card with Auto-cycling slots */}
            <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xl relative overflow-hidden text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                    Publishing Queue Slots
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  4 Queued Today
                </span>
              </div>

              {/* Time Slots Preview with Auto-switch highlighted focus */}
              <div className="mt-4 space-y-3">
                {scheduleSlots.map((slot, idx) => {
                  const isCurrent = idx === activeSlot;
                  return (
                    <div
                      key={slot.time}
                      onClick={() => setActiveSlot(idx)}
                      className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? "bg-white dark:bg-slate-850 border-indigo-500 dark:border-indigo-400 shadow-md ring-2 ring-indigo-500/20 scale-[1.02]"
                          : "bg-white/60 dark:bg-slate-850/60 border-slate-200/70 dark:border-slate-800 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isCurrent
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {slot.time}
                            </span>
                            {slot.isBest && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> Best Time
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                              {slot.reach}
                            </span>
                          </div>
                          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                            {slot.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                              {slot.platformName}
                            </span>
                            <span>•</span>
                            <span>{slot.tag}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold animate-pulse">
                            Active Slot
                          </span>
                        ) : (
                          <Send className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Auto-dispatched with zero browser tabs needed
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Custom schedule active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FEATURE 2: CALENDAR (Graphic Left, Text Right)             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 flex justify-center order-2 lg:order-1">
            {/* Interactive Calendar Visual Card with Day-by-Day Highlight */}
            <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xl text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Publishing Calendar — October 2026
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Drag and drop cards across dates to reschedule instantly
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    onClick={() => setCalendarView("week")}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                      calendarView === "week"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setCalendarView("month")}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                      calendarView === "month"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>

              {/* Calendar Grid Representation with active rotating focus */}
              <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
                {calendarDays.map((col, dIdx) => {
                  const isDayActive = dIdx === calendarDayIndex;
                  return (
                    <div
                      key={col.day}
                      onClick={() => setCalendarDayIndex(dIdx)}
                      className={`p-2 rounded-xl transition-all duration-300 border space-y-2 min-h-[140px] cursor-pointer ${
                        isDayActive
                          ? "bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-2 ring-indigo-500/25 scale-[1.03]"
                          : "bg-white/70 dark:bg-slate-850 border-slate-200/70 dark:border-slate-800"
                      }`}
                    >
                      <div
                        className={`font-bold text-[11px] pb-1 border-b ${
                          isDayActive
                            ? "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900"
                            : "text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800"
                        }`}
                      >
                        {col.day}
                      </div>

                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] text-left">
                        <div className="font-bold text-indigo-700 dark:text-indigo-300 truncate">
                          {col.cardTitle}
                        </div>
                        <div className="text-[9px] text-indigo-500 font-semibold">{col.time}</div>
                      </div>

                      {col.secondCard && (
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] text-left">
                          <div className="font-bold text-emerald-700 dark:text-emerald-300 truncate">
                            {col.secondCard.title}
                          </div>
                          <div className="text-[9px] text-emerald-500">{col.secondCard.time}</div>
                        </div>
                      )}

                      {isDayActive && (
                        <div className="pt-1 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
                          ● Selected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Multi-channel color coding active</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Synchronized across all 8 networks
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 text-left order-1 lg:order-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              CALENDAR
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              The content calendar you always wanted
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Visualise your content pipeline with an intuitive publishing calendar that lets you organize your posts the way you want. Spread your posts across time, and make sure there&apos;s never a dull moment for your audience.
            </p>
            <div className="pt-2">
              <Link
                href="/calendar"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group"
              >
                <span>Learn more about content calendar</span>
                <span className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                  ▶
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FEATURE 3: MONITOR (Text Left, Graphic Right)              */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              MONITOR
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              A monitoring dashboard that&apos;s sticky
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Multiple listening columns help you stay tuned to everything that&apos;s relevant. Respond in real-time and engage with your audience as often as you like.
            </p>
            <div className="pt-2">
              <Link
                href="/monitor"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group"
              >
                <span>Learn more about monitoring</span>
                <span className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                  ▶
                </span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 flex justify-center">
            {/* Interactive Monitoring Columns Visual with Tab Auto-Switch */}
            <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xl text-left">
              {/* Header tabs with auto-switch indicator */}
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                {(["mentions", "brand", "competitors"] as const).map((tab) => {
                  const isSelected = monitorTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setMonitorTab(tab)}
                      className={`relative px-3.5 py-1.5 rounded-lg font-bold capitalize transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
                      }`}
                    >
                      {tab === "mentions"
                        ? "@Mentions (Live)"
                        : tab === "brand"
                        ? "#BrandWatch"
                        : "Competitor Stream"}
                    </button>
                  );
                })}
              </div>

              {/* Feed items for active tab */}
              <div className="mt-4 space-y-3 min-h-[220px]">
                {monitorTab === "mentions" && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                            JD
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Jordan Davies
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1.5">@jordandavies • 3m ago</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[9px]">
                          + Positive Sentiment
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                        &quot;Just automated our entire Q4 marketing calendar using PulseSocial in under 20 minutes. Game changer for boutique agencies!&quot;
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline">
                          ⚡ Quick Reply in 1-Click
                        </span>
                        <span className="text-slate-400">Assigned to Sarah</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                            MK
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Maya Kim
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1.5">@mayakim_saas • 12m ago</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[9px]">
                          Lead Inquiry
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                        &quot;Does PulseSocial support custom approval workflows for enterprise teams with 15+ sub-brands?&quot;
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          ✓ Logged to CRM automatically
                        </span>
                        <span className="text-slate-400">Status: In Progress</span>
                      </div>
                    </div>
                  </div>
                )}

                {monitorTab === "brand" && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-xs">
                            #P
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              #PulseSocialLaunch
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1.5">Trending in SaaS • 1.4K posts</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[9px]">
                          Viral Spike +180%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                        &quot;Switched our entire social team from Buffer to PulseSocial today. The AI Caption Engine 3.8 is lightyears ahead!&quot;
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          ✓ Auto-Retweet Queued
                        </span>
                        <span className="text-slate-400">High Influence User</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                            AI
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Brand Sentiment Health
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1.5">Last 24 Hours</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[9px]">
                          98.4% Positive
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                        Real-time natural language processing detected 342 positive mentions, 4 questions, and 0 critical complaints.
                      </p>
                    </div>
                  </div>
                )}

                {monitorTab === "competitors" && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-xs">
                            VS
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Market Share Shift
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1.5">Competitor Watch</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[9px]">
                          Market Opportunity
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                        &quot;Looking for an alternative to Hootsuite with real-time multi-account analytics that doesn&apos;t cost $250/mo.&quot;
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline">
                          ⚡ Send Comparison Guide
                        </span>
                        <span className="text-slate-400">High Intent Prospect</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Streaming live updates across all platforms
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Zero missed comments
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FEATURE 4: ANALYTICS (Graphic Left, Text Right)            */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 flex justify-center order-2 lg:order-1">
            {/* Interactive Analytics Visual Card */}
            <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xl text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Social Growth Intelligence
                  </h3>
                  <p className="text-[11px] text-slate-500">Consolidated cross-platform performance</p>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold animate-pulse">
                  +38.4% Lift
                </div>
              </div>

              {/* Graphic charts representation */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                {/* Donut graphic */}
                <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100 dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-pink-500 transition-all duration-1000"
                        strokeDasharray="42, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-500 transition-all duration-1000"
                        strokeDasharray="30, 100"
                        strokeDashoffset="-42"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-500 transition-all duration-1000"
                        strokeDasharray="20, 100"
                        strokeDashoffset="-72"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-base font-black text-slate-800 dark:text-white leading-none">
                        2.5K
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">Total Engr</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-pink-500" /> IG 42%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> LI 30%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" /> FB 20%
                    </span>
                  </div>
                </div>

                {/* Key stats cards */}
                <div className="space-y-2">
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">Organic Reach</div>
                    <div className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
                      +124.8%
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> vs previous 30d
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">Engagement Rate</div>
                    <div className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
                      4.82%
                    </div>
                    <div className="text-[10px] text-indigo-600 font-semibold">Top 5% in industry</div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">Click-Throughs</div>
                    <div className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
                      18.4K
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">+22.4% MoM</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Automated scheduled PDF & CSV reports</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Export Ready
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 text-left order-1 lg:order-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              ANALYTICS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              An analytics dashboard to measure your performance
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Track key performance metrics and analyze patterns in your audience&apos;s activity. Make decisions backed by data and improve your social ROI with every post.
            </p>
            <div className="pt-2">
              <Link
                href="/analytics"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group"
              >
                <span>Learn more about analytics</span>
                <span className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                  ▶
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
