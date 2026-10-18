"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Share2,
  FileText,
  CreditCard,
  Activity,
  ShieldCheck,
  MessageSquare,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Database,
  ExternalLink,
  ChevronRight,
  Search,
  Bell,
  RefreshCw,
} from "lucide-react";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<{ latencyMs: number; status: string } | null>(null);

  // Initialize theme and load session
  useEffect(() => {
    try {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        localStorage.getItem("pulsesocial_theme") === "dark";
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }

      const cached = localStorage.getItem("pulsesocial_active_user");
      if (cached) {
        setCurrentUser(JSON.parse(cached));
      }
    } catch {}

    // Check DB ping for admin header
    fetch("/api/admin/health")
      .then((res) => res.json())
      .then((data) => {
        if (data?.database) {
          setDbStatus({
            latencyMs: data.database.latencyMs,
            status: data.database.status,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("pulsesocial_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("pulsesocial_theme", "light");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("pulsesocial_active_user");
    router.push("/login");
  };

  const navigationSections = [
    {
      title: "CORE",
      items: [
        { label: "Overview", href: "/admin", icon: LayoutDashboard },
        { label: "System Health", href: "/admin/system-health", icon: Activity },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Organizations", href: "/admin/organizations", icon: Building2 },
        { label: "Social Accounts", href: "/admin/social-accounts", icon: Share2 },
        { label: "Posts & Publishing", href: "/admin/posts", icon: FileText },
      ],
    },
    {
      title: "COMMERCE & AUDIT",
      items: [
        { label: "Billing & Plans", href: "/admin/billing", icon: CreditCard },
        { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
        { label: "Support & Feedback", href: "/admin/feedback", icon: MessageSquare },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  // Get current breadcrumb title
  const currentNav = navigationSections
    .flatMap((s) => s.items)
    .find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href)
    );

  const adminName = currentUser?.name || currentUser?.email?.split("@")[0] || "Admin";
  const adminEmail = currentUser?.email || "admin@pulsesocial.io";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D0D0E] text-slate-900 dark:text-[#9CA3AF] flex font-sans antialiased transition-colors duration-150">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/80 dark:border-white/7 bg-white/80 dark:bg-[#111113] backdrop-blur-md sticky top-0 h-screen shrink-0 z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80 dark:border-white/7">
          <Link href="/admin" className="flex items-center gap-2.5">
            <PulseSocialLogo size="sm" variant="icon" />
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                PulseSocial
              </span>
              <span className="text-[10px] font-bold text-[#6F52B5] dark:text-[#FBBF24] tracking-wider uppercase mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-[#6F52B5] dark:bg-amber-500/15 dark:text-[#FBBF24] border border-purple-200 dark:border-[#E08738]/30">
            ENTERPRISE
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-[#6B7280] uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#6F52B5] text-white dark:bg-amber-500/15 dark:text-[#FBBF24] dark:border dark:border-[#E08738]/30 shadow-xs font-semibold"
                          : "text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white dark:text-[#FBBF24]" : "text-slate-400 dark:text-[#6B7280]"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/7 space-y-2">
          {/* Return to App Button */}
          <Link
            href="/dashboard"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to App</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400 dark:text-[#6B7280]" />
          </Link>

          {/* Admin User Profile Card */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#17171A] border border-slate-200/60 dark:border-white/7">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#6F52B5] dark:bg-amber-500/20 text-white dark:text-[#FBBF24] font-bold text-xs flex items-center justify-center shrink-0">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {adminName}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-[#6B7280] truncate font-mono">
                  {adminEmail}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-white dark:bg-[#111113] h-full flex flex-col z-10 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-white/7">
              <div className="flex items-center gap-2.5">
                <PulseSocialLogo size="sm" variant="icon" />
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  PulseSocial Admin
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              {navigationSections.map((section) => (
                <div key={section.title}>
                  <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-[#6B7280] uppercase">
                    {section.title}
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === "/admin"
                          ? pathname === "/admin"
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium ${
                            isActive
                              ? "bg-[#6F52B5] text-white dark:bg-amber-500/15 dark:text-[#FBBF24] dark:border dark:border-[#E08738]/30 font-semibold"
                              : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-white/5"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-white/7">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-[#9CA3AF]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to App</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 dark:border-white/7 bg-white/60 dark:bg-[#0D0D0E]/95 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 dark:text-[#6B7280]">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#6B7280]" />
              <span className="font-semibold text-slate-900 dark:text-white">
                {currentNav?.label || "Console"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real DB Status indicator */}
            {dbStatus && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                title="PostgreSQL live ping"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>DB Live: {dbStatus.latencyMs}ms</span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={handleToggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick Return to Dashboard button */}
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#17171A] dark:hover:bg-[#111113] text-slate-700 dark:text-white border border-transparent dark:border-white/10 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </Link>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
