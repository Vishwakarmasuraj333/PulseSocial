"use client";

import React from "react";
import Link from "next/link";

interface PulseSocialLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "with-tagline" | "monogram";
  theme?: "dark" | "light" | "auto";
  className?: string;
  href?: string | null;
}

export function PulseSocialLogo({
  size = "md",
  variant = "full",
  theme = "auto",
  className = "",
  href,
}: PulseSocialLogoProps) {
  const iconSizes = {
    sm: { w: 28, h: 28 },
    md: { w: 36, h: 36 },
    lg: { w: 44, h: 44 },
    xl: { w: 56, h: 56 },
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const currentIcon = iconSizes[size];

  // Premium Geometric PS Monogram (P + S)
  const logoIcon = (
    <div
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{ width: currentIcon.w, height: currentIcon.h }}
      role="img"
      aria-label="PulseSocial PS Logo"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 rounded-2xl bg-indigo-600/20 opacity-40 blur-md pointer-events-none" />

      {/* Modern Professional PS Monogram Emblem */}
      <svg
        width={currentIcon.w}
        height={currentIcon.h}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="psPurpleBrand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="50%" stopColor="#5846A8" />
            <stop offset="100%" stopColor="#795BC2" />
          </linearGradient>

          <linearGradient id="psPurpleAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDD3F4" />
            <stop offset="100%" stopColor="#A78BDF" />
          </linearGradient>
        </defs>

        {/* Squircle Rounded Base (Professional Royal Purple / Navy) */}
        <rect x="3" y="3" width="58" height="58" rx="16" fill="url(#psPurpleBrand)" />

        {/* Subtle Glass Highlight */}
        <path
          d="M4 18 C4 10 10 4 18 4 L46 4 C54 4 60 10 60 18 L60 22 C40 20 20 25 4 30 Z"
          fill="white"
          fillOpacity="0.16"
        />

        {/* Letter 'P' (Left) in Crisp White */}
        <path
          d="M18 46 L18 18 L28 18 C33.5 18 37 21.5 37 26.5 C37 31.5 33.5 35 28 35 L18 35"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter 'S' (Right) in Lavender/Purple Accent */}
        <path
          d="M47 22 C44 18 38 18 35 21 C32 24 34.5 28 40.5 30.5 C46.5 33 48.5 36.5 46.5 41 C44.5 45.5 37.5 46.5 31.5 44"
          fill="none"
          stroke="url(#psPurpleAccent)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Connecting Pulse Nodes */}
        <circle cx="28" cy="26.5" r="2.5" fill="#A78BDF" />
        <circle cx="46.5" cy="41" r="2.5" fill="#DDD3F4" stroke="#FFFFFF" strokeWidth="0.8" />
        <circle cx="18" cy="46" r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );

  const isLightBackground = theme === "light" || (theme === "auto" && true);

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {logoIcon}

      {variant !== "icon" && variant !== "monogram" && (
        <div className="flex flex-col">
          <div className="flex items-center leading-none">
            <span
              className={`font-extrabold font-sans ${textSizes[size]} tracking-tight ${
                theme === "dark"
                  ? "text-white"
                  : theme === "light"
                  ? "text-slate-900"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              Pulse
              <span
                className={
                  theme === "dark"
                    ? "text-[#A78BDF]"
                    : theme === "light"
                    ? "text-[#6F52B5]"
                    : "text-[#6F52B5] dark:text-[#A78BDF]"
                }
              >
                Social
              </span>
            </span>
          </div>
          {variant === "with-tagline" && (
            <span
              className={`text-[10px] font-medium tracking-wide mt-0.5 ${
                theme === "dark"
                  ? "text-slate-300"
                  : theme === "light"
                  ? "text-slate-500"
                  : "text-slate-500 dark:text-slate-300"
              }`}
            >
              Enterprise Social Operations
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}

export default PulseSocialLogo;
