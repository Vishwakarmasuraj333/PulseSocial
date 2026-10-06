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
  PinterestIcon,
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
  brandOverlay,
  maxWidth = "max-w-[620px]",
}: FeatureDisplayProps) {
  const [mode, setMode] = useState<"video" | "interactive">("video");
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
    <div className={`w-full ${maxWidth} relative select-none group/display`}>
      {/* View Switcher Controls (60fps Animation vs Interactive UI) */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full border border-slate-200/90 dark:border-slate-800 p-0.5 sm:p-1 shadow-sm text-[10px] sm:text-[11px] font-semibold">
        <button
          onClick={() => setMode("video")}
          className={`px-2 sm:px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            mode === "video"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="Watch continuous 60fps loop animation"
        >
          🎬 60fps Animation
        </button>
        <button
          onClick={() => setMode("interactive")}
          className={`px-2 sm:px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            mode === "interactive"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="Interact directly with controls"
        >
          ⚡ Interactive
        </button>
      </div>

      {mode === "video" ? (
        <div className="relative w-full flex items-center justify-center transition-transform duration-500 hover:scale-[1.015]">
          <video
            ref={videoRef}
            className="w-full h-auto object-contain block select-none pointer-events-none drop-shadow-sm"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={posterSrc}
            aria-label={alt}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* Authentic PulseSocial PS Monogram Brand Overlays (Replaces foreign logos) */}
          {brandOverlay}
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
              brandOverlay={
                /* Seamless PulseSocial PS Logo Channel Row overlaying video */
                <div
                  className="absolute pointer-events-none z-20 flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl shadow-xs"
                  style={{
                    top: "20.4%",
                    left: "5.8%",
                    width: "33.5%",
                    height: "5.8%",
                  }}
                >
                  {[
                    { icon: <FacebookIcon size={9} />, bg: "#1877F2" },
                    { icon: <XIcon size={9} />, bg: "#000000" },
                    { icon: <LinkedInIcon size={9} />, bg: "#0A66C2" },
                    { icon: <GoogleBusinessIcon size={9} />, bg: "#1668e3" },
                    { icon: <InstagramIcon size={9} />, bg: "#E1306C" },
                    { icon: <YouTubeIcon size={9} />, bg: "#FF0000" },
                    { icon: <PinterestIcon size={9} />, bg: "#E60023" },
                  ].map((ch, idx) => (
                    <div
                      key={idx}
                      className="relative w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#4F46E5] flex items-center justify-center text-white text-[8px] font-black shrink-0"
                    >
                      <span className="scale-75">PS</span>
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full text-white flex items-center justify-center p-0.5"
                        style={{ backgroundColor: ch.bg }}
                      >
                        {ch.icon}
                      </span>
                    </div>
                  ))}
                </div>
              }
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
              brandOverlay={
                <>
                  {/* Overlay for @PulseSocial in Mentions column */}
                  <div
                    className="absolute pointer-events-none z-20 flex items-center bg-white px-1 text-[10px] sm:text-[11px] font-bold text-[#1668e3]"
                    style={{
                      top: "18.3%",
                      left: "5.8%",
                      height: "2.8%",
                    }}
                  >
                    @PulseSocial
                  </div>

                  {/* Overlay for PulseSocial's Posts column header */}
                  <div
                    className="absolute pointer-events-none z-20 flex items-center bg-white pl-1 text-[11px] sm:text-[12px] font-bold text-slate-800"
                    style={{
                      top: "13.4%",
                      left: "56.8%",
                      height: "2.6%",
                      width: "35%",
                    }}
                  >
                    PulseSocial&apos;s Posts
                  </div>

                  {/* Overlay for PulseSocial author name and PS avatar */}
                  <div
                    className="absolute pointer-events-none z-20 flex items-center gap-1.5 bg-white pl-0.5"
                    style={{
                      top: "18.6%",
                      left: "53.6%",
                      height: "4.4%",
                      width: "36%",
                    }}
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#4F46E5] flex items-center justify-center text-white text-[9px] font-black shrink-0 shadow-xs">
                      PS
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-bold text-slate-900">PulseSocial</span>
                  </div>
                </>
              }
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
