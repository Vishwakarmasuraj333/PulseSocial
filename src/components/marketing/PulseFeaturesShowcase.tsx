"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PulseScheduleVisual } from "@/components/marketing/PulseScheduleVisual";
import { PulseCalendarVisual } from "@/components/marketing/PulseCalendarVisual";
import { PulseMonitorVisual } from "@/components/marketing/PulseMonitorVisual";
import { PulseAnalyticsVisual } from "@/components/marketing/PulseAnalyticsVisual";
import {
  FacebookIcon,
  XIcon,
  LinkedInIcon,
  GoogleBusinessIcon,
  InstagramIcon,
  YouTubeIcon,
} from "@/components/icons/PlatformIcons";

interface FeatureDisplayProps {
  id: string;
  videoSrc: string;
  posterSrc: string;
  alt: string;
  interactiveComponent: React.ReactNode;
  brandOverlay?: React.ReactNode;
  maxWidth?: string;
}

function FeatureDisplay({
  videoSrc,
  posterSrc,
  alt,
  interactiveComponent,
  maxWidth = "max-w-[620px]",
}: FeatureDisplayProps) {
  const [mode, setMode] = useState<"interactive" | "video">("interactive");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (mode !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }, [mode, videoSrc]);

  return (
    <div className={`w-full ${maxWidth} flex flex-col items-center select-none group/display`}>
      {/* View Switcher Controls (Dedicated Top Toolbar - Zero Overlap on Graphic Content) */}
      <div className="w-full flex items-center justify-center sm:justify-end mb-4">
        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 p-1 shadow-xs text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setMode("interactive")}
            className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              mode === "interactive"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
            title="Interact directly with sharp live controls"
          >
            Interactive Preview
          </button>
          <button
            type="button"
            onClick={() => setMode("video")}
            className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              mode === "video"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
            title="Watch animated walkthrough loop"
          >
            Video Demo
          </button>
        </div>
      </div>

      {mode === "video" ? (
        <div className="relative w-full flex items-center justify-center rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white">
          <video
            ref={videoRef}
            className="w-full h-auto object-contain block select-none pointer-events-none"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={posterSrc}
            aria-label={alt}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center animate-in fade-in duration-300">
          {interactiveComponent}
        </div>
      )}
    </div>
  );
}

export function PulseFeaturesShowcase() {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-white relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-indigo-50/50 via-purple-50/20 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10 pointer-events-none blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32">
        {/* ========================================================= */}
        {/* SECTION HEADER: PUNCHY, MAST & PREMIUM HEADING             */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900/60 text-[#6F52B5] dark:text-[#A78BDF] text-xs font-bold uppercase tracking-wider shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#6F52B5] animate-pulse" />
            <span>Core Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-[46px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.14]">
            One unified platform to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F52B5] via-[#8B6BD6] to-[#0284C7]">
              publish, listen, and grow
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            Everything modern creators, teams, and enterprises need to schedule content, monitor engagement in real-time, and analyze ROI across all your social channels.
          </p>
        </div>

        {/* ========================================================= */}
        {/* FEATURE 1: SCHEDULE (Text Left, Graphic Right)             */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 group/sec">
          <div className="w-full lg:w-[460px] text-left shrink-0 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-[14px] sm:text-[15px] font-bold uppercase tracking-[1.5px] text-[#DF3024] group-hover/sec:scale-105 transition-transform">
              <span className="w-2 h-2 rounded-full bg-[#DF3024] animate-pulse" />
              Schedule
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18]">
              Flexible scheduling that saves you time
            </h2>
            <p className="text-[16px] sm:text-[17px] text-slate-600 dark:text-slate-300 leading-[1.65] font-normal">
              Schedule your posts for times when your audience is most active. Choose from our best-time predictions, or create your own publishing schedule.
            </p>
            <div className="pt-2">
              <Link
                href="/features#publishing"
                className="inline-flex items-center gap-2.5 text-[15px] font-bold text-[#1668e3] hover:text-[#0f52b8] dark:text-[#38bdf8] dark:hover:text-[#7dd3fc] underline underline-offset-4 group transition-colors"
              >
                <span>Learn more about publishing</span>
                <span className="w-6 h-6 rounded-full bg-[#1668e3] dark:bg-[#0284c7] text-white flex items-center justify-center text-xs group-hover:translate-x-1.5 group-hover:scale-110 transition-all shrink-0 shadow-md">
                  ➔
                </span>
              </Link>
            </div>
          </div>

          <div className="w-full lg:max-w-[700px] flex items-center justify-center">
            <FeatureDisplay
              id="schedule"
              videoSrc="/videos/social-schedule-time.mp4"
              posterSrc="/videos/social-schedule-poster.png"
              alt="PulseSocial Flexible Scheduling UI Animation"
              maxWidth="max-w-[660px]"
              interactiveComponent={<PulseScheduleVisual />}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* FEATURE 2: CALENDAR (Graphic Left, Text Right)             */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-10 lg:gap-14 group/sec">
          <div className="w-full lg:w-[460px] text-left shrink-0 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-[14px] sm:text-[15px] font-bold uppercase tracking-[1.5px] text-[#C84A00] group-hover/sec:scale-105 transition-transform">
              <span className="w-2 h-2 rounded-full bg-[#C84A00] animate-pulse" />
              Calendar
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18]">
              The content calendar you always wanted
            </h2>
            <p className="text-[16px] sm:text-[17px] text-slate-600 dark:text-slate-300 leading-[1.65] font-normal">
              Visualise your content pipeline with an intuitive publishing calendar that lets you organize your posts the way you want. Spread your posts across time, and make sure there&apos;s never a dull moment for your audience.
            </p>
            <div className="pt-2">
              <Link
                href="/features#calendar"
                className="inline-flex items-center gap-2.5 text-[15px] font-bold text-[#1668e3] hover:text-[#0f52b8] dark:text-[#38bdf8] dark:hover:text-[#7dd3fc] underline underline-offset-4 group transition-colors"
              >
                <span>Learn more about content calendar</span>
                <span className="w-6 h-6 rounded-full bg-[#1668e3] dark:bg-[#0284c7] text-white flex items-center justify-center text-xs group-hover:translate-x-1.5 group-hover:scale-110 transition-all shrink-0 shadow-md">
                  ➔
                </span>
              </Link>
            </div>
          </div>

          <div className="w-full lg:max-w-[620px] flex items-center justify-center">
            <FeatureDisplay
              id="calendar"
              videoSrc="/videos/social-calendar.mp4"
              posterSrc="/videos/social-calendar-poster.png"
              alt="PulseSocial Publishing Calendar Animation"
              maxWidth="max-w-[620px]"
              interactiveComponent={<PulseCalendarVisual />}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* FEATURE 3: MONITOR (Text Left, Graphic Right)              */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 group/sec">
          <div className="w-full lg:w-[460px] text-left shrink-0 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-[14px] sm:text-[15px] font-bold uppercase tracking-[1.5px] text-[#048052] group-hover/sec:scale-105 transition-transform">
              <span className="w-2 h-2 rounded-full bg-[#048052] animate-pulse" />
              Monitor
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18]">
              A monitoring dashboard that&apos;s sticky
            </h2>
            <p className="text-[16px] sm:text-[17px] text-slate-600 dark:text-slate-300 leading-[1.65] font-normal">
              Multiple listening columns help you stay tuned to everything that&apos;s relevant. Respond in real-time and engage with your audience as often as you like.
            </p>
            <div className="pt-2">
              <Link
                href="/features#inbox"
                className="inline-flex items-center gap-2.5 text-[15px] font-bold text-[#1668e3] hover:text-[#0f52b8] dark:text-[#38bdf8] dark:hover:text-[#7dd3fc] underline underline-offset-4 group transition-colors"
              >
                <span>Learn more about monitoring</span>
                <span className="w-6 h-6 rounded-full bg-[#1668e3] dark:bg-[#0284c7] text-white flex items-center justify-center text-xs group-hover:translate-x-1.5 group-hover:scale-110 transition-all shrink-0 shadow-md">
                  ➔
                </span>
              </Link>
            </div>
          </div>

          <div className="w-full lg:max-w-[580px] flex items-center justify-center">
            <FeatureDisplay
              id="monitor"
              videoSrc="/videos/social-monitor.mp4"
              posterSrc="/videos/social-monitoring-poster.png"
              alt="PulseSocial Live Monitoring Dashboard Animation"
              maxWidth="max-w-[560px]"
              interactiveComponent={<PulseMonitorVisual />}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* FEATURE 4: ANALYTICS (Graphic Left, Text Right)            */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-10 lg:gap-14 group/sec">
          <div className="w-full lg:w-[460px] text-left shrink-0 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-[14px] sm:text-[15px] font-bold uppercase tracking-[1.5px] text-[#C84A00] group-hover/sec:scale-105 transition-transform">
              <span className="w-2 h-2 rounded-full bg-[#C84A00] animate-pulse" />
              Analytics
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18]">
              The best-in-class social analytics
            </h2>
            <p className="text-[16px] sm:text-[17px] text-slate-600 dark:text-slate-300 leading-[1.65] font-normal">
              Understand who your audience is and how they engage with you on social media. Go with pre-built reports, or create new ones from scratch based on the stats that matter to you.
            </p>
            <div className="pt-2">
              <Link
                href="/features#analytics"
                className="inline-flex items-center gap-2.5 text-[15px] font-bold text-[#1668e3] hover:text-[#0f52b8] dark:text-[#38bdf8] dark:hover:text-[#7dd3fc] underline underline-offset-4 group transition-colors"
              >
                <span>Learn more about reports</span>
                <span className="w-6 h-6 rounded-full bg-[#1668e3] dark:bg-[#0284c7] text-white flex items-center justify-center text-xs group-hover:translate-x-1.5 group-hover:scale-110 transition-all shrink-0 shadow-md">
                  ➔
                </span>
              </Link>
            </div>
          </div>

          <div className="w-full lg:max-w-[580px] flex items-center justify-center">
            <FeatureDisplay
              id="analytics"
              videoSrc="/videos/social-analytics.mp4"
              posterSrc="/videos/social-analytics-poster.png"
              alt="PulseSocial Performance Analytics Video Animation"
              maxWidth="max-w-[580px]"
              interactiveComponent={<PulseAnalyticsVisual />}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* EXPLORE MORE FEATURES BUTTON (Exact Zoho Style with Hover) */}
        {/* ========================================================= */}
        <div className="pt-6 sm:pt-10 flex justify-center">
          <Link
            href="/features"
            className="inline-flex items-center justify-center px-11 py-3.5 border-[2px] border-slate-900 dark:border-white text-slate-900 dark:text-white font-extrabold text-[14px] sm:text-[15px] tracking-[1.5px] uppercase rounded-[4px] hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm group"
          >
            <span>Explore more features</span>
            <span className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
