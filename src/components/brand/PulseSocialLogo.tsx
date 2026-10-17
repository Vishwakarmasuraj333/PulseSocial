"use client";

import React, { useId } from "react";
import Link from "next/link";

export type LogoThemeMode = "dark" | "light" | "system" | "auto";

interface PulseSocialLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "with-tagline" | "monogram";
  theme?: LogoThemeMode;
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
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");

  const iconSizes = {
    xs: { w: 22, h: 22, rx: 6 },
    sm: { w: 28, h: 28, rx: 8 },
    md: { w: 36, h: 36, rx: 11 },
    lg: { w: 44, h: 44, rx: 13 },
    xl: { w: 56, h: 56, rx: 16 },
  };

  const textSizes = {
    xs: "text-xs",
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const currentIcon = iconSizes[size];
  const brandGradLightId = `psBrandGradLight_${reactId}`;
  const brandGradDarkId = `psBrandGradDark_${reactId}`;
  const accentGradId = `psAccentGrad_${reactId}`;

  // Premium PS Monogram with Dual-Identity:
  // - Light Mode: Signature Royal Purple (#5846A8, #7B61FF)
  // - Dark Mode: Signature Chocolate Golden Amber (#78350F, #B45309, #E08738, #F59E0B)
  const isExplicitDark = theme === "dark";
  const isExplicitLight = theme === "light";

  const logoIcon = (
    <div
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{ width: currentIcon.w, height: currentIcon.h }}
      role="img"
      aria-label="PulseSocial PS Logo"
    >
      {/* Ambient background glow: Purple in Light, Amber in Dark */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-60 blur-md pointer-events-none transition-all duration-300 ${
          isExplicitDark
            ? "bg-[#E08738]/30"
            : isExplicitLight
            ? "bg-[#5846A8]/30"
            : "bg-[#5846A8]/30 dark:bg-[#E08738]/30"
        }`}
      />

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
          {/* Light Mode: Royal Purple Gradient */}
          <linearGradient id={brandGradLightId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A185A" />
            <stop offset="35%" stopColor="#3F2B7B" />
            <stop offset="70%" stopColor="#5846A8" />
            <stop offset="100%" stopColor="#7B61FF" />
          </linearGradient>

          {/* Dark Mode: Chocolate Golden Amber Gradient */}
          <linearGradient id={brandGradDarkId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="35%" stopColor="#B45309" />
            <stop offset="70%" stopColor="#E08738" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <linearGradient id={accentGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>

        {/* Squircle Rounded Base */}
        {/* Light Mode Rect (Royal Purple) */}
        {!isExplicitDark && (
          <rect
            x="3"
            y="3"
            width="58"
            height="58"
            rx="16"
            fill={`url(#${brandGradLightId})`}
            stroke="rgba(123, 97, 255, 0.45)"
            strokeWidth="1.2"
            className={isExplicitLight ? "block" : "block dark:hidden"}
          />
        )}

        {/* Dark Mode Rect (Chocolate Amber) */}
        {!isExplicitLight && (
          <rect
            x="3"
            y="3"
            width="58"
            height="58"
            rx="16"
            fill={`url(#${brandGradDarkId})`}
            stroke="rgba(245, 158, 11, 0.45)"
            strokeWidth="1.2"
            className={isExplicitDark ? "block" : "hidden dark:block"}
          />
        )}

        {/* Subtle Glass Top Highlight */}
        <path
          d="M4 18 C4 10 10 4 18 4 L46 4 C54 4 60 10 60 18 L60 22 C40 20 20 25 4 30 Z"
          fill="white"
          fillOpacity="0.18"
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

        {/* Letter 'S' (Right) in Theme Accent Gradient */}
        <path
          d="M47 22 C44 18 38 18 35 21 C32 24 34.5 28 40.5 30.5 C46.5 33 48.5 36.5 46.5 41 C44.5 45.5 37.5 46.5 31.5 44"
          fill="none"
          stroke={`url(#${accentGradId})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Connecting Pulse Nodes */}
        <circle
          cx="28"
          cy="26.5"
          r="2.5"
          className="fill-[#A78BFA] dark:fill-[#FBBF24]"
        />
        <circle
          cx="46.5"
          cy="41"
          r="2.5"
          className="fill-[#DDD6FE] dark:fill-[#FEF3C7]"
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />
        <circle cx="18" cy="46" r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );

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
              {/* "Social" Text styling: Royal Purple in Light, Golden Amber/Chocolate in Dark */}
              <span
                className={`ml-0.5 font-extrabold ${
                  isExplicitDark
                    ? "text-[#E08738]"
                    : isExplicitLight
                    ? "text-[#5846A8]"
                    : "text-[#5846A8] dark:text-[#E08738]"
                }`}
              >
                Social
              </span>
            </span>
          </div>

          {variant === "with-tagline" && (
            <span
              className={`text-[10px] font-medium tracking-wide mt-0.5 ${
                theme === "dark"
                  ? "text-slate-400"
                  : theme === "light"
                  ? "text-slate-500"
                  : "text-slate-500 dark:text-slate-400"
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
