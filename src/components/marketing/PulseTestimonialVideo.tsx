"use client";

import React, { useState } from "react";
import { Play, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatarUrl: string;
  quote: string;
  videoDuration?: string;
}

interface PulseTestimonialVideoProps {
  onWatchVideo?: () => void;
}

export function PulseTestimonialVideo({ onWatchVideo }: PulseTestimonialVideoProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 0,
      name: "Jon Tromans",
      role: "Digital Marketing Trainer",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
      quote:
        "\"I spend a lot of time in the training room, and I can't stop to post something because I'm working. PulseSocial helps me keep all my social media channels really busy.\"",
      videoDuration: "1:45 min",
    },
    {
      id: 1,
      name: "Sarah Jenkins",
      role: "VP Marketing, Bloom Agency",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80",
      quote:
        "\"Managing 24 client accounts without missing a single comment used to require 4 full-time coordinators. With PulseSocial's automated queues and sentiment filters, our productivity tripled in 30 days.\"",
      videoDuration: "2:10 min",
    },
    {
      id: 2,
      name: "Marco Silva",
      role: "Head of Growth, TechFlow Media",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80",
      quote:
        "\"The best-time predictive scheduling is shockingly accurate. Our organic LinkedIn impressions rose by 140% in just two weeks without spending a dollar on boosted posts.\"",
      videoDuration: "1:30 min",
    },
  ];

  const handleNext = () => setCurrentIdx((prev) => (prev + 1) % testimonials.length);
  const handlePrev = () => setCurrentIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const item = testimonials[currentIdx];

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-[#e6f4ea] dark:bg-emerald-950/20 text-slate-800 dark:text-slate-100">
      {/* Curved background top & bottom accents */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
        {/* Video Circle Play Button Avatar */}
        <div className="flex justify-center">
          <div
            onClick={onWatchVideo}
            className="group relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-2xl cursor-pointer"
          >
            <img
              src={item.avatarUrl}
              alt={item.name}
              className="w-full h-full object-cover grayscale-20 group-hover:scale-110 transition-transform duration-500"
            />
            {/* Play Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
              <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-115 transition-transform duration-200">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-slate-900 ml-0.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-base sm:text-xl lg:text-2xl font-normal text-slate-800 dark:text-slate-100 leading-relaxed italic">
            {item.quote}
          </p>

          <div className="space-y-0.5">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {item.name}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {item.role}
            </p>
          </div>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next testimonial"
            className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
