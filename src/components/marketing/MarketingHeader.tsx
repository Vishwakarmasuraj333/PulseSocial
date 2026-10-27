"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  BookOpen,
  HelpCircle,
  FileText,
  LayoutDashboard,
  LogOut,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";

export function MarketingHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
    activeOrganization?: { id: string; name: string } | null;
  } | null>(null);

  const resourcesRef = useRef<HTMLDivElement>(null);

  const checkAuth = () => {
    fetch("/api/auth/me", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user && typeof data.user.id === "string" && data.user.id.length > 0) {
          setIsLoggedIn(true);
          setCurrentUser(data.user);
          try {
            localStorage.setItem("pulsesocial_active_user", JSON.stringify(data.user));
          } catch {}
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
          try {
            localStorage.removeItem("pulsesocial_active_user");
          } catch {}
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        setCurrentUser(null);
      });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    setIsLoggedIn(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem("pulsesocial_active_user");
      localStorage.removeItem("pulsesocial_active_brand");
      sessionStorage.clear();
      document.cookie =
        "pulsesocial_auth_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0;";
      document.cookie =
        "pulsesocial_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0;";
    } catch {}
    window.dispatchEvent(new Event("pulsesocial_auth_changed"));
    window.location.href = "/?logout=true";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("logout") === "true") {
        setIsLoggedIn(false);
        setCurrentUser(null);
        try {
          localStorage.removeItem("pulsesocial_active_user");
          localStorage.removeItem("pulsesocial_active_brand");
          sessionStorage.clear();
        } catch {}
        fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
        window.history.replaceState({}, "", window.location.pathname);
        return;
      }
    }

    checkAuth();

    const handleAuthEvent = () => checkAuth();
    window.addEventListener("pulsesocial_auth_changed", handleAuthEvent);
    window.addEventListener("storage", handleAuthEvent);
    return () => {
      window.removeEventListener("pulsesocial_auth_changed", handleAuthEvent);
      window.removeEventListener("storage", handleAuthEvent);
    };
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setIsResourcesOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsResourcesOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/platforms", label: "Platforms" },
    { href: "/solutions", label: "Solutions" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ];

  const resourceLinks = [
    {
      href: "/blog",
      label: "Engineering & Growth Blog",
      description: "Social media strategies, algorithm updates, and system architecture",
      icon: BookOpen,
    },
    {
      href: "/resources",
      label: "Guides & Documentation",
      description: "Official guides, provider setup walkthroughs, and developer docs",
      icon: FileText,
    },
    {
      href: "/contact",
      label: "Technical Support Desk",
      description: "Direct assistance, API troubleshooting, and enterprise onboarding",
      icon: HelpCircle,
    },
  ];

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-40 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 dark:bg-[#0D0D0E]/95 backdrop-blur-md shadow-xs border-b border-slate-200/90 dark:border-white/10 py-2.5 sm:py-3"
          : "bg-white/90 dark:bg-[#0D0D0E]/90 backdrop-blur-md shadow-2xs border-b border-slate-200/60 dark:border-white/7 py-3 sm:py-3.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Brand Identity Logo */}
        <div className="flex items-center gap-8">
          <PulseSocialLogo size="md" variant="full" href="/" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-[#5846A8] dark:text-[#FBBF24] bg-purple-50 dark:bg-amber-500/10 border border-purple-200/80 dark:border-amber-500/25 font-bold shadow-2xs"
                      : "text-slate-700 dark:text-slate-300 hover:text-[#5846A8] dark:hover:text-[#FBBF24] hover:bg-purple-50 dark:hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Resources Dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button
                type="button"
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                aria-expanded={isResourcesOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                  isResourcesOpen || pathname.startsWith("/blog") || pathname.startsWith("/resources")
                    ? "text-[#5846A8] dark:text-[#FBBF24] bg-purple-50 dark:bg-amber-500/10 border border-purple-200/80 dark:border-amber-500/25 font-bold shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:text-[#5846A8] dark:hover:text-[#FBBF24] hover:bg-purple-50 dark:hover:bg-white/5"
                }`}
              >
                <span>Resources</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isResourcesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isResourcesOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200 dark:border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="space-y-1">
                    {resourceLinks.map((r) => {
                      const Icon = r.icon;
                      return (
                        <Link
                          key={r.href}
                          href={r.href}
                          onClick={() => setIsResourcesOpen(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-white/5 transition group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-amber-500/10 text-[#5846A8] dark:text-[#FBBF24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#5846A8] dark:group-hover:text-[#FBBF24] transition-colors">
                              {r.label}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {r.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Theme Switcher & Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Global Theme Switcher */}
          <ThemeSwitcher />

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-[#6366F1] to-[#5846A8] hover:opacity-95 text-white shadow-md shadow-purple-600/25 text-xs font-bold hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 group"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#5846A8] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-xl transition duration-150"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-[#6366F1] to-[#5846A8] hover:opacity-95 text-white shadow-md shadow-purple-600/25 text-xs font-bold hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls: Theme + Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeSwitcher />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-[#111113]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="space-y-1" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 text-sm font-bold rounded-xl transition ${
                    isActive
                      ? "text-[#5846A8] dark:text-[#FBBF24] bg-purple-50 dark:bg-amber-500/10 border border-purple-200 dark:border-amber-500/25"
                      : "text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1">
              <span className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Resources & Support
              </span>
              {resourceLinks.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-white/5 rounded-lg transition"
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col gap-2.5">
            {isLoggedIn ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 via-[#6366F1] to-[#5846A8] text-white shadow-md shadow-purple-600/25 transition flex items-center justify-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 text-center text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-white/5 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 via-[#6366F1] to-[#5846A8] text-white shadow-md shadow-purple-600/25 transition flex items-center justify-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default MarketingHeader;
