"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sun, Moon, SunMoon } from "lucide-react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activeResolved, setActiveResolved] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply theme to document element and persist in localStorage
  const applyTheme = (mode: ThemeMode) => {
    setTheme(mode);
    try {
      localStorage.setItem("pulsesocial_theme", mode);
    } catch {}

    let resolved: "light" | "dark" = "dark";
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      resolved = prefersDark ? "dark" : "light";
    } else {
      resolved = mode;
    }

    setActiveResolved(resolved);
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pulsesocial_theme_change", {
          detail: { mode, resolved },
        })
      );
    }
  };

  useEffect(() => {
    setMounted(true);
    let currentMode: ThemeMode = "dark";
    try {
      const saved = localStorage.getItem("pulsesocial_theme") as ThemeMode | null;
      if (saved === "dark" || saved === "light" || saved === "system") {
        currentMode = saved;
      } else {
        currentMode = "dark"; // Default to dark matte obsidian
      }
    } catch {}

    applyTheme(currentMode);

    // Watch OS preference changes when in system mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      try {
        const saved = localStorage.getItem("pulsesocial_theme");
        if (saved === "system") {
          applyTheme("system");
        }
      } catch {}
    };

    // Cross-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "pulsesocial_theme" && e.newValue) {
        if (e.newValue === "light" || e.newValue === "dark" || e.newValue === "system") {
          applyTheme(e.newValue as ThemeMode);
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Close popup menu on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Cycle through the 3 modes: Light -> Dark -> Mix (System) -> Light
  const cycleTheme = () => {
    const sequence: ThemeMode[] = ["light", "dark", "system"];
    const nextIndex = (sequence.indexOf(theme) + 1) % sequence.length;
    applyTheme(sequence[nextIndex]);
  };

  return (
    <div className={`relative shrink-0 ${className}`} ref={containerRef}>
      {/* ============================================================ */}
      {/* SINGLE HIGH-VISIBILITY ICON-ONLY THEME TOGGLE (NO TEXT)       */}
      {/* Dark = Moon | Light = Sun | Mix = SunMoon                     */}
      {/* ============================================================ */}
      <button
        type="button"
        id="theme-switcher-button"
        onClick={cycleTheme}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsMenuOpen(!isMenuOpen);
        }}
        className={`h-9 w-9 relative flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer shadow-2xs border ${
          theme === "dark"
            ? "bg-[#1C1C20] hover:bg-[#25252B] border-[#E08738]/40 hover:border-[#E08738]/70 text-[#E08738] ring-1 ring-[#E08738]/20 shadow-amber-950/20"
            : theme === "light"
            ? "bg-white hover:bg-amber-50/50 border-amber-200 hover:border-amber-300 text-[#D97706] ring-1 ring-amber-300/40 shadow-amber-900/10"
            : "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/50 text-[#E08738] dark:text-[#FBBF24] ring-1 ring-amber-400/30"
        }`}
        title={
          theme === "dark"
            ? "Switch to Light Mode"
            : theme === "light"
            ? "Switch to Dark Mode"
            : "Switch to Dark Mode"
        }
        aria-label="Theme mode switcher"
      >
        {/* LIGHT MODE: Crisp Sun Icon */}
        {theme === "light" && (
          <Sun className="w-4 h-4 text-[#D97706] fill-amber-300/40 rotate-12 transition-transform duration-200" />
        )}

        {/* DARK MODE: Crisp Moon Icon */}
        {theme === "dark" && (
          <Moon className="w-4 h-4 text-[#E08738] fill-[#E08738]/30 -rotate-12 transition-transform duration-200" />
        )}

        {/* MIX MODE: Crisp SunMoon Dual Icon */}
        {theme === "system" && (
          <SunMoon className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24] transition-transform duration-200" />
        )}
      </button>

      {/* ============================================================ */}
      {/* 3-MODE POPUP SELECTOR (ONLY ICONS, NO TEXT, HIGH VISIBILITY) */}
      {/* ============================================================ */}
      {isMenuOpen && (
        <div
          id="theme-switcher-popup"
          className="absolute right-0 top-full mt-2 p-1 rounded-2xl bg-white dark:bg-[#1C1C20] border border-slate-200/90 dark:border-white/10 shadow-2xl backdrop-blur-xl z-50 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150"
          role="group"
          aria-label="Select theme mode"
        >
          {/* 1. Light Mode (Sun Icon Only) */}
          <button
            type="button"
            id="theme-btn-light"
            onClick={() => {
              applyTheme("light");
              setIsMenuOpen(false);
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              theme === "light"
                ? "bg-amber-50 dark:bg-amber-950/60 text-[#D97706] dark:text-amber-300 border border-amber-200 dark:border-amber-800 scale-105 font-bold shadow-xs"
                : "text-slate-400 hover:text-[#D97706] hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
            title="Light Mode (Sun Icon)"
            aria-label="Light Mode"
          >
            <Sun className="w-4 h-4 text-[#D97706] fill-amber-300/30 rotate-12" />
          </button>

          {/* 2. Dark Mode (Moon Icon Only) */}
          <button
            type="button"
            id="theme-btn-dark"
            onClick={() => {
              applyTheme("dark");
              setIsMenuOpen(false);
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-[#17171A] text-[#E08738] border border-[#E08738]/50 ring-1 ring-[#E08738]/30 scale-105 font-bold shadow-xs"
                : "text-slate-400 hover:text-[#E08738] hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
            title="Dark Mode (Moon Icon)"
            aria-label="Dark Mode"
          >
            <Moon className="w-4 h-4 text-[#E08738] fill-[#E08738]/30 -rotate-12" />
          </button>

          {/* 3. Mix Mode (SunMoon Icon Only) */}
          <button
            type="button"
            id="theme-btn-system"
            onClick={() => {
              applyTheme("system");
              setIsMenuOpen(false);
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              theme === "system"
                ? "bg-amber-500/20 text-[#D97706] dark:text-[#FBBF24] border border-amber-500/40 ring-1 ring-amber-400/30 scale-105 font-bold shadow-xs"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
            title="Mix Mode (SunMoon Icon: Syncs dynamically with OS)"
            aria-label="Mix Mode"
          >
            <SunMoon className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24]" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
