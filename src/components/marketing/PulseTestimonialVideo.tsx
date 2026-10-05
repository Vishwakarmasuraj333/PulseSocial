"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle2, TrendingUp } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  quote: string;
  metric: string;
  metricLabel: string;
}

interface PulseTestimonialVideoProps {
  onWatchVideo?: () => void;
}

export function PulseTestimonialVideo({ onWatchVideo }: PulseTestimonialVideoProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials: Testimonial[] = [
    {
      id: 0,
      name: "Jon Tromans",
      role: "Digital Marketing Trainer",
      company: "The Marketing Training Hub",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&auto=format&fit=crop&q=80",
      quote:
        "I spend a lot of time in the training room, and I can't stop to post something because I'm working. PulseSocial helps me keep all my social media channels really busy without lifting a finger.",
      metric: "18 hrs/wk",
      metricLabel: "Time Saved",
    },
    {
      id: 1,
      name: "Sarah Jenkins",
      role: "VP of Marketing",
      company: "Bloom Digital Agency",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=320&auto=format&fit=crop&q=80",
      quote:
        "Managing 24 client accounts without missing a single comment used to require 4 coordinators. With PulseSocial's unified inbox and automated queues, our team productivity tripled in 30 days.",
      metric: "3.2x",
      metricLabel: "Team Output",
    },
    {
      id: 2,
      name: "Marco Silva",
      role: "Head of Growth",
      company: "TechFlow Media",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=320&auto=format&fit=crop&q=80",
      quote:
        "The best-time predictive scheduling is shockingly accurate. Our organic LinkedIn impressions rose by 140% in just two weeks without spending a single dollar on boosted ads.",
      metric: "+140%",
      metricLabel: "Organic Reach",
    },
    {
      id: 3,
      name: "Elena Rostova",
      role: "Social Media Director",
      company: "Luxe Brands Global",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&auto=format&fit=crop&q=80",
      quote:
        "PulseSocial's visual calendar and real-time listening stream gave us complete brand peace of mind across 9 markets simultaneously. It is simply in a league of its own.",
      metric: "99.8%",
      metricLabel: "Response Rate",
    },
  ];

  // Automatic slide transition every 4.5 seconds (pauses when user hovers)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  const handleNext = () => setCurrentIdx((prev) => (prev + 1) % testimonials.length);
  const handlePrev = () => setCurrentIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const item = testimonials[currentIdx];

  return (
    <section
      className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-[#e8f6ed] via-[#eef9f2] to-[#e6f5eb] dark:from-[#052219] dark:via-[#092b21] dark:to-[#052018] text-slate-800 dark:text-slate-100 select-none transition-colors duration-500"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative ambient glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 relative z-10">
        {/* Rating Stars & Trust Pill */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Rated 4.9/5 by 50,000+ Social Media Professionals
          </span>
        </div>

        {/* Clean Avatar Showcase (Image Only - Video Removed) */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative group">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-[0_12px_35px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-105">
              <img
                src={item.avatarUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            </div>

            {/* Verified badge */}
            <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-900">
              <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
            </span>
          </div>

          {/* Metric Pill Badge */}
          <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-800/95 border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {item.metric} {item.metricLabel}
            </span>
          </div>
        </div>

        {/* Testimonial Quote with Smooth Fade */}
        <div className="max-w-2xl mx-auto space-y-4 min-h-[140px] sm:min-h-[120px] flex flex-col justify-center">
          <p className="text-lg sm:text-2xl font-normal text-slate-800 dark:text-slate-100 leading-relaxed italic transition-all duration-500 key={item.id}">
            &ldquo;{item.quote}&rdquo;
          </p>

          <div className="space-y-0.5 pt-2">
            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {item.name}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {item.role} &bull; <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.company}</span>
            </p>
          </div>
        </div>

        {/* Automatic Slider Controls & Navigation */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous customer story"
              className="w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Slide Indicators with Active Progress Pill */}
            <div className="flex items-center gap-2 px-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  aria-label={`Go to story ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIdx === i
                      ? "w-8 bg-slate-900 dark:bg-white shadow-xs"
                      : "w-2.5 bg-slate-400/60 hover:bg-slate-600 dark:hover:bg-slate-300"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              aria-label="Next customer story"
              className="w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Auto-advancing &bull; Hover to pause
          </span>
        </div>
      </div>
    </section>
  );
}
