"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
  TikTokIcon,
} from "@/components/icons/PlatformIcons";

export function PulseFeaturesShowcase() {
  const [activeSlot, setActiveSlot] = useState(2);
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [monitorTab, setMonitorTab] = useState<"mentions" | "brand" | "competitors">("mentions");

  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32">
        {/* ========================================================= */}
        {/* FEATURE 1: SCHEDULE (Text Left, Graphic Right)             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
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
            {/* Interactive Schedule Visual Card */}
            <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-lg relative overflow-hidden text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                    Publishing Queue Slots
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  ● 4 Queued Today
                </span>
              </div>

              {/* Time Slots Preview */}
              <div className="mt-4 space-y-3">
                {[
                  {
                    time: "09:00 AM",
                    title: "Product Feature Drop • Carousel",
                    platform: "instagram",
                    platformName: "Instagram",
                    status: "Ready",
                    tag: "Morning Commute",
                    isBest: false,
                  },
                  {
                    time: "12:30 PM",
                    title: "Industry Thought Leadership Post",
                    platform: "linkedin",
                    platformName: "LinkedIn",
                    status: "Ready",
                    tag: "Lunch Peak",
                    isBest: false,
                  },
                  {
                    time: "03:15 PM",
                    title: "Viral Video Reel • Amalfi Visuals",
                    platform: "facebook",
                    platformName: "Facebook & X",
                    status: "AI Recommended",
                    tag: "Best Time (Spike +42%)",
                    isBest: true,
                  },
                  {
                    time: "07:45 PM",
                    title: "Evening Community Q&A Poll",
                    platform: "x",
                    platformName: "X (Twitter)",
                    status: "Queued",
                    tag: "Prime Time",
                    isBest: false,
                  },
                ].map((slot, idx) => (
                  <div
                    key={slot.time}
                    onClick={() => setActiveSlot(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      activeSlot === idx
                        ? "bg-white dark:bg-slate-800 border-indigo-400 shadow-md ring-1 ring-indigo-400/30"
                        : "bg-white/60 dark:bg-slate-850 border-slate-200/60 dark:border-slate-800 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center w-16">
                        <span className="text-xs font-black text-slate-800 dark:text-white">
                          {slot.time}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{slot.title}</span>
                          {slot.isBest && (
                            <span className="px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-black uppercase">
                              ★ Best Time
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{slot.platformName}</span>
                          <span>•</span>
                          <span>{slot.tag}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <Send className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative paper airplane micro-graphic */}
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
            {/* Interactive Calendar Visual Card */}
            <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-lg text-left">
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
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      calendarView === "week"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setCalendarView("month")}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      calendarView === "month"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>

              {/* Calendar Grid Representation */}
              <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
                {["Mon 05", "Tue 06", "Wed 07", "Thu 08", "Fri 09"].map((day, dIdx) => (
                  <div
                    key={day}
                    className="p-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 space-y-2 min-h-[140px]"
                  >
                    <div className="font-bold text-[11px] text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-100 dark:border-slate-800">
                      {day}
                    </div>

                    {dIdx === 0 && (
                      <div className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 text-[10px] text-left">
                        <div className="font-bold text-pink-700 dark:text-pink-300 truncate">
                          Instagram Reel
                        </div>
                        <div className="text-[9px] text-pink-500">10:00 AM</div>
                      </div>
                    )}

                    {dIdx === 1 && (
                      <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10px] text-left shadow-sm">
                        <div className="font-bold text-blue-700 dark:text-blue-300 truncate">
                          LinkedIn Article
                        </div>
                        <div className="text-[9px] text-blue-500">2:15 PM</div>
                      </div>
                    )}

                    {dIdx === 2 && (
                      <>
                        <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[10px] text-left">
                          <div className="font-bold text-sky-700 dark:text-sky-300 truncate">
                            X Thread #1
                          </div>
                          <div className="text-[9px] text-sky-500">11:00 AM</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] text-left">
                          <div className="font-bold text-emerald-700 dark:text-emerald-300 truncate">
                            FB Campaign
                          </div>
                          <div className="text-[9px] text-emerald-500">4:30 PM</div>
                        </div>
                      </>
                    )}

                    {dIdx === 3 && (
                      <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[10px] text-left">
                        <div className="font-bold text-purple-700 dark:text-purple-300 truncate">
                          YouTube Short
                        </div>
                        <div className="text-[9px] text-purple-500">6:00 PM</div>
                      </div>
                    )}

                    {dIdx === 4 && (
                      <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] text-left border-dashed">
                        <div className="font-bold text-amber-700 dark:text-amber-300 truncate">
                          + Drop Card
                        </div>
                        <div className="text-[9px] text-amber-500">Empty Slot</div>
                      </div>
                    )}
                  </div>
                ))}
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
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              CALENDAR
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              The content calendar you always wanted
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Visualise your content pipeline with an intuitive publishing calendar that lets you organize your posts the way you want. Spread your posts across time, and make sure there's never a dull moment for your audience.
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
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              MONITOR
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              A monitoring dashboard that's sticky
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Multiple listening columns help you stay tuned to everything that's relevant. Respond in real-time and engage with your audience as often as you like.
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
            {/* Interactive Monitoring Columns Visual */}
            <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-lg text-left">
              {/* Header tabs */}
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                {(["mentions", "brand", "competitors"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMonitorTab(tab)}
                    className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors ${
                      monitorTab === tab
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
                    }`}
                  >
                    {tab === "mentions" ? "@Mentions (Live)" : tab === "brand" ? "#BrandWatch" : "Competitor Stream"}
                  </button>
                ))}
              </div>

              {/* Feed items */}
              <div className="mt-4 space-y-3">
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
                    "Just automated our entire Q4 marketing calendar using PulseSocial in under 20 minutes. Game changer for boutique agencies!"
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
                    "Does PulseSocial support custom approval workflows for enterprise teams with 15+ sub-brands?"
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Logged to CRM automatically
                    </span>
                    <span className="text-slate-400">Status: In Progress</span>
                  </div>
                </div>
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
            <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-lg text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Social Growth Intelligence
                  </h3>
                  <p className="text-[11px] text-slate-500">Consolidated cross-platform performance</p>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                  +38.4% Lift
                </div>
              </div>

              {/* Graphic charts representation */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                {/* Donut graphic */}
                <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* SVG Circular Donut */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100 dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-pink-500"
                        strokeDasharray="42, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-500"
                        strokeDasharray="30, 100"
                        strokeDashoffset="-42"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-500"
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
                      <span className="text-[9px] text-slate-400 font-medium">Total Enrg</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 flex gap-2 font-medium">
                    <span className="text-pink-500">● IG 42%</span>
                    <span className="text-blue-500">● LI 30%</span>
                    <span className="text-indigo-500">● FB 20%</span>
                  </div>
                </div>

                {/* Growth Bars */}
                <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2.5 flex flex-col justify-center">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span>Organic Reach</span>
                      <span className="text-emerald-500">+124.8%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "88%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span>Engagement Rate</span>
                      <span className="text-blue-500">4.82%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: "72%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span>Click-Throughs</span>
                      <span className="text-indigo-500">18.4K</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: "64%" }} />
                    </div>
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
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              ANALYTICS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              The best-in-class social analytics
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Understand who your audience is and how they engage with you on social media. Go with pre-built reports, or create new ones from scratch based on the stats that matter to you.
            </p>
            <div className="pt-2">
              <Link
                href="/analytics"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group"
              >
                <span>Learn more about reports</span>
                <span className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                  ▶
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Central Action Button (EXPLORE MORE FEATURES) */}
        <div className="text-center pt-8">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-xs"
          >
            <span>EXPLORE MORE FEATURES</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
