"use client";

import React, { useState } from "react";

export function PulseAnalyticsVisual() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const referrers = [
    { label: "Search", value: 897, width: "78%" },
    { label: "Page Internal", value: 207, width: "24%" },
    { label: "Newsfeed", value: 401, width: "42%" },
    { label: "None", value: 159, width: "18%" },
  ];

  return (
    <div className="relative w-full max-w-[560px] h-[360px] sm:h-[400px] select-none flex items-center justify-center">
      {/* ======================================================== */}
      {/* 1. BACKGROUND SVG GRID WITH CLEAR VISIBLE Y-AXIS & CURVE */}
      {/* ======================================================== */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 560 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Y-Axis Line */}
        <line x1="60" y1="60" x2="60" y2="300" stroke="#CBD5E1" strokeWidth="1" />

        {/* 150 Level */}
        <text x="32" y="74" fontSize="12" fill="#94A3B8" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="500">
          150
        </text>
        <line x1="60" y1="70" x2="520" y2="70" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />

        {/* 100 Level */}
        <text x="32" y="144" fontSize="12" fill="#94A3B8" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="500">
          100
        </text>
        <line x1="60" y1="140" x2="520" y2="140" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />

        {/* 50 Level */}
        <text x="39" y="214" fontSize="12" fill="#94A3B8" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="500">
          50
        </text>
        <line x1="60" y1="210" x2="520" y2="210" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />

        {/* 0 Baseline */}
        <text x="46" y="284" fontSize="12" fill="#94A3B8" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="500">
          0
        </text>
        <line x1="60" y1="280" x2="520" y2="280" stroke="#CBD5E1" strokeWidth="1" />

        {/* Dynamic Smooth Orange/Golden Wavy Trend Curve (matching Zoho screenshot) */}
        <path
          d="M 60 215 C 90 205 110 185 140 185 C 175 185 195 240 230 245 C 275 250 295 210 330 215 C 365 220 380 280 420 280 C 455 280 475 220 500 180"
          stroke="#F59E0B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Subtle glow / shadow for the curve */}
        <path
          d="M 60 215 C 90 205 110 185 140 185 C 175 185 195 240 230 245 C 275 250 295 210 330 215 C 365 220 380 280 420 280 C 455 280 475 220 500 180"
          stroke="#FBBF24"
          strokeWidth="1.5"
          strokeOpacity="0.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Final Golden Dot with Outer Pulse Halo */}
        <circle cx="500" cy="180" r="9" fill="#FBBF24" fillOpacity="0.25" className="animate-ping" />
        <circle cx="500" cy="180" r="7" fill="#FBBF24" fillOpacity="0.4" />
        <circle cx="500" cy="180" r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
      </svg>

      {/* ======================================================== */}
      {/* 2. FOREGROUND CARD: PAGE VIEWS VIA INTERNAL REFERRER     */}
      {/* Positioned at left: 88px so it never overlaps the axis   */}
      {/* ======================================================== */}
      <div className="absolute left-[84px] sm:left-[96px] top-[45px] z-10 w-[300px] sm:w-[340px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35)] p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
        {/* Clean Title */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
            Page Views via Internal Referrer
          </h3>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* 4 Horizontal Data Bars */}
        <div className="space-y-4">
          {referrers.map((ref, idx) => (
            <div
              key={ref.label}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="flex items-center justify-between gap-3 text-[11px] group cursor-pointer"
            >
              {/* Category Label */}
              <span
                className={`w-24 shrink-0 transition-colors font-medium ${
                  hoveredIndex === idx
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {ref.label}
              </span>

              {/* Bar Container */}
              <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-500 rounded-full transition-all duration-700 ease-out group-hover:brightness-110 shadow-xs"
                  style={{ width: ref.width }}
                />
              </div>

              {/* Numerical Value */}
              <span className="w-8 text-right font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {ref.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. 2.5K 3-COLOR DONUT PIE CHART (Top Right of Card)      */}
      {/* ======================================================== */}
      <div className="absolute right-[40px] sm:right-[50px] top-[15px] z-20 transition-transform duration-300 hover:scale-105 group cursor-pointer">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-white dark:bg-slate-900 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 p-2">
          {/* Circular Donut Ring (Coral, Yellow, Teal) */}
          <svg className="w-full h-full transform -rotate-90 group-hover:rotate-0 transition-transform duration-700 ease-out" viewBox="0 0 36 36">
            {/* Background ring */}
            <path
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="4.2"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Coral / Rose Segment */}
            <path
              strokeDasharray="42, 100"
              strokeWidth="4.2"
              stroke="#F43F5E"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Yellow Segment */}
            <path
              strokeDasharray="32, 100"
              strokeDashoffset="-42"
              strokeWidth="4.2"
              stroke="#FBBF24"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Teal / Cyan Segment */}
            <path
              strokeDasharray="26, 100"
              strokeDashoffset="-74"
              strokeWidth="4.2"
              stroke="#2DD4BF"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>

          {/* Centered 2.5K Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">
              2.5K
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
