"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Share2,
  FileText,
  PlusCircle,
  Calendar,
  Clock,
  MessageSquare,
  BarChart3,
  PieChart,
  Users,
  Image as ImageIcon,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  CheckCircle2,
  Sun,
  Moon,
  Shield,
  User,
  Plus,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Megaphone,
  CheckSquare,
  Activity,
  Layers,
  Sparkles,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";
import { PostComposerModal } from "@/components/composer/PostComposerModal";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";
import { CreateBrandModal } from "@/components/brand/CreateBrandModal";
import { ActivityStreamDrawer } from "@/components/layout/ActivityStreamDrawer";
import { AnnouncementsModal } from "@/components/layout/AnnouncementsModal";
import { AppsSuiteMenu } from "@/components/layout/AppsSuiteMenu";
import { BottomDockBar } from "@/components/layout/BottomDockBar";
import { PulseAIPanel } from "@/components/ai/PulseAIPanel";
import { authService, UserSession } from "@/lib/services";
import { useBrand } from "@/context/BrandContext";
import { useToast } from "@/components/ui/toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "post_published" | "post_failed" | "account_connected" | "comment" | "mention" | "system";
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { brands, activeBrand, switchBrand, addBrand, deleteBrand } = useBrand();

  // User session
  const [user, setUser] = useState<UserSession | null>(null);

  // Connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);

  // Navigation & Dropdown states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Global modals & drawers
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isAppsSuiteOpen, setIsAppsSuiteOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);

  // Dropdown refs
  const brandMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Load user session
  useEffect(() => {
    async function loadUser() {
      const session = await authService.getSession();
      setUser(session);
    }
    loadUser();
  }, []);

  // Load connected accounts
  const loadAccounts = () => {
    fetch("/api/social/accounts")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.accounts)) {
          setConnectedAccounts(d.accounts);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Load real activity notifications
  useEffect(() => {
    fetch("/api/audit?limit=10")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.logs)) {
          const mapped: NotificationItem[] = d.logs.map((log: any) => ({
            id: log.id,
            title: log.title || log.action?.replace(/_/g, " "),
            description: log.description || "Activity recorded in brand workspace.",
            time: log.timestamp || "Recently",
            read: false,
            type: log.action?.includes("PUBLISH") ? "post_published" : "system",
          }));
          setNotifications(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (brandMenuRef.current && !brandMenuRef.current.contains(target)) {
        setIsBrandMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      router.push("/login");
    }
  };

  // Requested 12 Primary Sidebar Navigation Sections
  const SIDEBAR_ITEMS = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      match: (p: string) => p === "/" || p === "/dashboard",
    },
    {
      label: "Social Accounts",
      href: "/social-accounts",
      icon: Share2,
      match: (p: string) => p.startsWith("/social-accounts"),
      badge: connectedAccounts.length > 0 ? connectedAccounts.length.toString() : undefined,
    },
    {
      label: "Posts",
      href: "/posts",
      icon: FileText,
      match: (p: string) => p === "/posts" || (p.startsWith("/posts") && !p.startsWith("/posts/new")),
    },
    {
      label: "New Post",
      href: "/posts/new",
      icon: PlusCircle,
      match: (p: string) => p.startsWith("/posts/new") || p.startsWith("/compose"),
    },
    {
      label: "Content Calendar",
      href: "/calendar",
      icon: Calendar,
      match: (p: string) => p.startsWith("/calendar"),
    },
    {
      label: "Schedule",
      href: "/posts?filter=SCHEDULED",
      icon: Clock,
      match: (p: string) => p.includes("SCHEDULED"),
    },
    {
      label: "Inbox",
      href: "/inbox",
      icon: MessageSquare,
      match: (p: string) => p.startsWith("/inbox") || p.startsWith("/messages"),
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      match: (p: string) => p.startsWith("/analytics"),
    },
    {
      label: "Reports",
      href: "/reports",
      icon: PieChart,
      match: (p: string) => p.startsWith("/reports"),
    },
    {
      label: "Audience",
      href: "/connections",
      icon: Users,
      match: (p: string) => p.startsWith("/connections"),
    },
    {
      label: "Media Library",
      href: "/media",
      icon: ImageIcon,
      match: (p: string) => p.startsWith("/media"),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      match: (p: string) => p.startsWith("/settings"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      
      {/* ============================================================ */}
      {/* SIDEBAR NAVIGATION: Enterprise Purple Theme (Section 4)     */}
      {/* ============================================================ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-[#EDE9FE] dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20"
        } ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Monogram Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#EDE9FE] dark:border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden group py-1"
          >
            <PulseSocialLogo size={isSidebarOpen ? "md" : "sm"} variant={isSidebarOpen ? "full" : "icon"} />
          </Link>

          {/* Toggle sidebar button (desktop only) */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 hover:text-[#5846A8] hover:bg-[#F5F3FF] dark:hover:bg-slate-800 transition"
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Close mobile drawer */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Brand Badge */}
        {isSidebarOpen && (
          <div className="p-3 mx-3 mt-3 rounded-xl bg-[#F5F3FF] dark:bg-slate-800/60 border border-[#EDE9FE] dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#5846A8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs overflow-hidden">
                {activeBrand?.avatarUrl ? (
                  <img
                    src={activeBrand.avatarUrl}
                    alt={activeBrand.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (activeBrand?.name || "P").charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {activeBrand?.name || "Pulse Workspace"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {connectedAccounts.length} Connected {connectedAccounts.length === 1 ? "Channel" : "Channels"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="p-1 rounded-md text-[#5846A8] hover:bg-white dark:hover:bg-slate-700 transition"
              title="Connect Channel"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.match(pathname);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#F0EAFB] text-[#6F52B5] font-bold shadow-2xs"
                    : "text-[#68627A] hover:text-[#6F52B5] hover:bg-[#F0EBF9]"
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#6F52B5]" : "text-[#9690A5] group-hover:text-[#6F52B5]"}`} />
                {isSidebarOpen && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {isSidebarOpen && item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-[#6F52B5] text-white"
                        : "bg-[#DDD3F4] text-[#6F52B5]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer: Quick Action & Profile preview */}
        <div className="p-3 border-t border-[#EDE9FE] dark:border-slate-800 space-y-2">
          {isSidebarOpen ? (
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-[#F5F3FF] text-[#5846A8] dark:text-purple-300 border border-[#EDE9FE] dark:border-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Connect Platform</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="w-full py-2 rounded-xl text-[#5846A8] hover:bg-[#F5F3FF] flex items-center justify-center"
              title="Connect Platform"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ============================================================ */}
      {/* MAIN CONTAINER: Header + Content (Offset by sidebar)          */}
      {/* ============================================================ */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
      }`}>
        
        {/* ============================================================ */}
        {/* HEADER: Enterprise Clean White Surface (Section 3)           */}
        {/* ============================================================ */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-[#EDE9FE] dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          
          {/* Left: Mobile hamburger & Brand selector */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Workspace Switcher Dropdown */}
            <div className="relative" ref={brandMenuRef}>
              <button
                type="button"
                onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-[#F5F3FF] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <div className="w-5 h-5 rounded-md bg-[#5846A8] text-white flex items-center justify-center text-[10px] font-bold">
                  {(activeBrand?.name || "P").charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] sm:max-w-[180px] truncate">
                  {activeBrand?.name || "Pulse Workspace"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {isBrandMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Workspaces & Brands
                  </div>
                  <div className="space-y-1">
                    {brands.map((b) => (
                      <div
                        key={b.id}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                          b.id === activeBrand.id
                            ? "bg-[#F5F3FF] dark:bg-purple-950/40 text-[#5846A8] dark:text-purple-300 font-bold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            switchBrand(b.id);
                            setIsBrandMenuOpen(false);
                            toast({
                              title: "Workspace Switched",
                              message: `Now managing ${b.name}`,
                              type: "info",
                            });
                          }}
                          className="flex items-center gap-2 truncate flex-1 text-left cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded-md bg-[#5846A8] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate">{b.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBrandMenuOpen(false);
                        setIsCreateBrandOpen(true);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-[#5846A8] dark:text-purple-400 hover:bg-[#F5F3FF] dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Command Palette Trigger */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 text-slate-400 hover:border-[#5846A8]/50 hover:bg-white transition cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search channels, posts, analytics...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-500 dark:text-slate-300">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right: Actions, Badges, Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Connected Social Channels Badge */}
            <Link
              href="/social-accounts"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F5F3FF] dark:bg-purple-950/50 text-[#5846A8] dark:text-purple-300 border border-[#EDE9FE] dark:border-purple-900 transition hover:bg-[#EDE9FE]"
              title="Manage Connected Channels"
            >
              <span className={`w-2 h-2 rounded-full ${connectedAccounts.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
              <span>{connectedAccounts.length} Connected</span>
            </Link>

            {/* + New Post Purple Button */}
            <button
              type="button"
              onClick={() => setIsComposerOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white text-xs font-semibold shadow-xs shadow-purple-900/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Post</span>
            </button>

            {/* Live Activity Stream Button */}
            <button
              type="button"
              onClick={() => setIsActivityOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Live Activity Stream"
            >
              <Activity className="w-4 h-4" />
            </button>

            {/* Notifications Menu */}
            <div className="relative" ref={notifMenuRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notifications</h4>
                    {unreadNotificationsCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="text-[10px] text-[#5846A8] dark:text-purple-400 font-semibold hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="py-2 space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6">No notifications yet</p>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="pt-2 first:pt-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                            {notif.description}
                          </p>
                          <span className="text-[9px] text-slate-400 mt-1 inline-block">{notif.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#5846A8] text-white flex items-center justify-center font-bold text-xs ring-2 ring-purple-100 dark:ring-purple-900">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  <div className="p-3 bg-[#F5F3FF] dark:bg-slate-800/80 rounded-xl mb-1.5">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {user?.name || "PulseSocial User"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {user?.email || "user@pulsesocial.io"}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-purple-100 text-[#5846A8] dark:bg-purple-900 dark:text-purple-300">
                      {user?.role || "ORGANIZATION MEMBER"}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/settings/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account Profile</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Workspace Settings</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleToggleDarkMode}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 text-left font-medium cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
                        <span>Dark Theme</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{isDarkMode ? "On" : "Off"}</span>
                    </button>
                  </div>

                  <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* MAIN BODY: Lavender Surface Canvas with Rounded Layout      */}
        {/* ============================================================ */}
        <main className="flex-1 overflow-y-auto pb-16">
          {children}
        </main>
      </div>

      {/* Sticky Bottom Dock Bar with Notebook, Search, Help */}
      <BottomDockBar />

      {/* Global Modals & Drawers */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
      />

      <UniversalSocialConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={() => {
          setIsConnectModalOpen(false);
          loadAccounts();
          toast({
            title: "Channel Connected",
            message: "Social channel authorized successfully.",
            type: "success",
          });
        }}
      />

      <CreateBrandModal
        isOpen={isCreateBrandOpen}
        onClose={() => setIsCreateBrandOpen(false)}
      />

      <ActivityStreamDrawer
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />

      <AnnouncementsModal
        isOpen={isAnnouncementsOpen}
        onClose={() => setIsAnnouncementsOpen(false)}
      />

      <AppsSuiteMenu
        isOpen={isAppsSuiteOpen}
        onClose={() => setIsAppsSuiteOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenComposer={() => setIsComposerOpen(true)}
        onOpenAddBrand={() => setIsConnectModalOpen(true)}
        onOpenActivity={() => setIsActivityOpen(true)}
      />

      <PulseAIPanel
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
      />
    </div>
  );
}

export default AppLayout;
