"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Smartphone, Sparkles, TrendingUp, Users, CheckCircle2 } from "lucide-react";

export function PulseMobileShowcase() {
  return (
    <section className="py-20 sm:py-28 bg-[#111827] text-white overflow-hidden relative">
      {/* Background glow highlights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Dual Phone Mobile Mockup (Left on Desktop) */}
          <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
            <div className="relative flex items-center justify-center">
              {/* Phone 1: Background phone with published posts */}
              <div className="w-56 sm:w-64 h-[440px] bg-slate-900 rounded-[38px] p-3 border-4 border-slate-700 shadow-2xl transform -rotate-6 translate-x-4 opacity-90 hidden sm:block">
                <div className="w-full h-full bg-slate-950 rounded-[28px] p-3 overflow-hidden text-left space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-bold">Published Posts</span>
                    <span className="text-emerald-400">● Live</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-white">Zylker Travels</div>
                    <div className="text-[9px] text-slate-400">What to Do in Switzerland 🇨🇭</div>
                    <div className="h-20 rounded-lg overflow-hidden bg-slate-800">
                      <img
                        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-white">Daily Coffee Drop</div>
                    <div className="text-[9px] text-slate-400">Batch brewed fresh this morning ☕</div>
                  </div>
                </div>
              </div>

              {/* Phone 2: Foreground Primary Phone with Live Audience Metrics (Exact from PDF!) */}
              <div className="relative z-10 w-64 sm:w-72 h-[480px] bg-slate-900 rounded-[42px] p-3.5 border-4 border-slate-600 shadow-2xl text-left">
                {/* Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full" />

                <div className="w-full h-full bg-slate-950 rounded-[32px] p-4 pt-7 overflow-hidden space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-white">Home</div>
                      <div className="text-[10px] text-slate-400">Zylker Travels</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] text-emerald-400 font-bold">Online</span>
                    </div>
                  </div>

                  {/* 4 Colored Metric Tiles Matching PDF */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Blue Tile */}
                    <div className="p-3 rounded-xl bg-[#4F46E5] text-white space-y-0.5 shadow-md">
                      <div className="text-lg sm:text-xl font-black">72K</div>
                      <div className="text-[10px] font-semibold opacity-90 leading-tight">Total Audience</div>
                    </div>

                    {/* Green Tile */}
                    <div className="p-3 rounded-xl bg-[#10B981] text-white space-y-0.5 shadow-md">
                      <div className="text-lg sm:text-xl font-black">9.1K</div>
                      <div className="text-[10px] font-semibold opacity-90 leading-tight">Active Audience</div>
                    </div>

                    {/* Coral Tile */}
                    <div className="p-3 rounded-xl bg-[#F43F5E] text-white space-y-0.5 shadow-md">
                      <div className="text-lg sm:text-xl font-black">3.7K</div>
                      <div className="text-[10px] font-semibold opacity-90 leading-tight">Engagement</div>
                    </div>

                    {/* Orange/Yellow Tile */}
                    <div className="p-3 rounded-xl bg-[#F59E0B] text-white space-y-0.5 shadow-md">
                      <div className="text-lg sm:text-xl font-black">9.8K</div>
                      <div className="text-[10px] font-semibold opacity-90 leading-tight">Organic Reach</div>
                    </div>
                  </div>

                  {/* Quick Queue action bar */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                      <span>Publishing Queue</span>
                      <span className="text-sky-400">4 Ready</span>
                    </div>
                    <div className="text-[9px] text-slate-400 leading-snug">
                      Next post scheduled for 3:15 PM (Instagram + X)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Copy matching PDF */}
          <div className="lg:col-span-6 space-y-5 text-left order-1 lg:order-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Social media management on <br className="hidden sm:inline" />
              the go
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Create compelling posts, add them to a publishing queue, monitor your brand, and better manage your content pipeline — all while you're on the move.{" "}
              <Link href="/mobile" className="text-sky-400 hover:underline font-semibold">
                Learn more
              </Link>
            </p>

            {/* App Store & Google Play Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {/* App Store button */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 transition-colors shadow-md cursor-pointer select-none">
                <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.02.63-2.67 1.38-.56.64-1.06 1.71-0.93 2.74 1.05.08 2.07-.5 2.68-1.25z" />
                </svg>
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">Download on the</div>
                  <div className="text-xs font-bold text-white">App Store</div>
                </div>
              </div>

              {/* Google Play button */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 transition-colors shadow-md cursor-pointer select-none">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186c-.354-.424-.56-.975-.56-1.583V3.397c0-.608.206-1.159.56-1.583zm11.233 11.234l2.427 2.427-11.45 6.47 9.023-8.897zm0-2.096L5.82 2.055l11.45 6.47-2.428 2.427zm1.488 1.488l3.418-1.932c.983-.556.983-1.464 0-2.02l-3.418-1.932-1.942 1.942 1.942 1.942z" />
                </svg>
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">GET IT ON</div>
                  <div className="text-xs font-bold text-white">Google Play</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
