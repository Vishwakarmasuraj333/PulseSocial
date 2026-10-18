"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  AlertTriangle,
  Folder,
  Sun,
  Moon,
  Shield,
  ShieldCheck,
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
  Home,
  FileEdit,
  AtSign,
  TrendingUp,
  Wand2,
  Palette,
  CreditCard,
  Sliders,
  LayoutGrid,
  Link2,
  FileCode,
  Zap,
} from "lucide-react";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { PostComposerModal } from "@/components/composer/PostComposerModal";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";
import { CreateBrandModal } from "@/components/brand/CreateBrandModal";
import { ActivityStreamDrawer } from "@/components/layout/ActivityStreamDrawer";
import { AnnouncementsModal } from "@/components/layout/AnnouncementsModal";
import { AppsSuiteMenu } from "@/components/layout/AppsSuiteMenu";
import { PulseAIPanel } from "@/components/ai/PulseAIPanel";
import { authService, UserSession } from "@/lib/services";
import { useBrand } from "@/context/BrandContext";
import { useToast } from "@/components/ui/toast";
import { SocialConnectionsHub } from "@/components/social/SocialConnectionsHub";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { DashboardFooter } from "@/components/layout/DashboardFooter";
import { PulseHelpGuidesModal } from "@/components/layout/PulseHelpGuidesModal";

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

  // User profile computed attributes (strictly real and dynamic)
  const realName =
    user?.name ||
    (user?.email
      ? user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "Active Member");
  const realEmail = user?.email || "";
  const initial = (realName || "U").charAt(0).toUpperCase();
  const realRole = user?.role
    ? user.role.toUpperCase() === "OWNER"
      ? "WORKSPACE OWNER"
      : user.role.toUpperCase() === "ADMIN"
      ? "WORKSPACE ADMIN"
      : `${user.role.toUpperCase()} MEMBER`
    : "ORGANIZATION OWNER";

  // Connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);

  // Navigation & Dropdown states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Notifications & Real Inbox Counts
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [inboxUnreadCount, setInboxUnreadCount] = useState<number>(0);

  // Global modals & drawers
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isAppsSuiteOpen, setIsAppsSuiteOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedConnectPlatform, setSelectedConnectPlatform] = useState<string | undefined>(undefined);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPostsDropdownOpen, setIsPostsDropdownOpen] = useState(true);
  const [isSidebarNewPostOpen, setIsSidebarNewPostOpen] = useState(false);
  const [composerInitialOption, setComposerInitialOption] = useState<"now" | "schedule" | "queue" | "smartq" | undefined>(undefined);
  const [postStatusCounts, setPostStatusCounts] = useState<{
    failed: number;
    approvals: number;
    scheduled: number;
    drafts: number;
    published: number;
    total: number;
  }>({ failed: 0, approvals: 0, scheduled: 0, drafts: 0, published: 0, total: 0 });

  const searchParams = useSearchParams();
  const searchStr = searchParams ? searchParams.toString() : "";
  const fullPath = searchStr ? `${pathname}?${searchStr}` : pathname;

  const isPostsRoute =
    pathname.startsWith("/posts") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/drafts") ||
    pathname.startsWith("/scheduled") ||
    pathname.startsWith("/published") ||
    pathname.startsWith("/approvals");

  useEffect(() => {
    if (isPostsRoute) {
      setIsPostsDropdownOpen(true);
    }
  }, [pathname, isPostsRoute]);

  // Dynamic Page Breadcrumbs
  const getBreadcrumb = (path: string): { section: string; title: string } => {
    if (path === "/dashboard") return { section: "Overview", title: "Executive Dashboard" };
    if (path.startsWith("/posts/new")) return { section: "Studio", title: "Post Composer" };
    if (path.startsWith("/posts")) return { section: "Publishing", title: "Posts & Queue" };
    if (path.startsWith("/social-accounts")) return { section: "Channels", title: "Social Integrations" };
    if (path.startsWith("/calendar")) return { section: "Planning", title: "Content Calendar" };
    if (path.startsWith("/inbox")) return { section: "Community", title: "Unified Inbox" };
    if (path.startsWith("/analytics")) return { section: "Telemetry", title: "Analytics & Telemetry" };
    if (path.startsWith("/team")) return { section: "Workspace", title: "Team & Permissions" };
    if (path.startsWith("/settings/profile")) return { section: "Account", title: "Profile & Security" };
    if (path.startsWith("/settings")) return { section: "Workspace", title: "Workspace Settings" };
    if (path.startsWith("/billing")) return { section: "Workspace", title: "Subscription & Plans" };
    if (path.startsWith("/ai-assistant") || path === "/ai") return { section: "AI Studio", title: "AI Assistant" };
    if (path.startsWith("/canva")) return { section: "Creation", title: "Canva Studio" };
    if (path.startsWith("/notifications")) return { section: "Engagement", title: "Notifications" };
    if (path.startsWith("/admin")) return { section: "Administration", title: "Admin Console" };
    return { section: "PulseSocial", title: "Workspace" };
  };

  const breadcrumb = getBreadcrumb(pathname);

  // Dropdown refs
  const brandMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const sidebarNewPostRef = useRef<HTMLDivElement>(null);

  // Load real user session with immediate cache retrieval
  useEffect(() => {
    try {
      const cached = localStorage.getItem("pulsesocial_active_user");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.email || parsed.name)) {
          setUser(parsed);
        }
      }
    } catch {}

    async function loadUser() {
      try {
        const session = await authService.getSession();
        if (session) {
          setUser(session);
          try {
            localStorage.setItem("pulsesocial_active_user", JSON.stringify(session));
          } catch {}
        }
      } catch {}
    }
    loadUser();
  }, []);

  // Theme synchronization and persistence (Section 4)
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("pulsesocial_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove("dark");
      }
    } catch {}
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

    const handleUpdate = () => {
      loadAccounts();
    };

    window.addEventListener("pulsesocial_active_brand_changed", handleUpdate);
    window.addEventListener("message", (e) => {
      if (e.data?.type === "PULSESOCIAL_CHANNEL_CONNECTED") {
        loadAccounts();
      }
    });
    return () => {
      window.removeEventListener("pulsesocial_active_brand_changed", handleUpdate);
    };
  }, []);

  // Load real unread inbox items count
  const loadInboxUnread = () => {
    fetch("/api/inbox/unread")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.unreadCount === "number") {
          setInboxUnreadCount(d.unreadCount);
        }
      })
      .catch(() => {});
  };

  // Load real notifications from database
  const loadNotifications = () => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.notifications)) {
          setNotifications(d.notifications);
        }
      })
      .catch(() => {});
  };

  // Load real post counts for sidebar badges
  const loadPostCounts = () => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.posts)) {
          setPostStatusCounts({
            failed: d.posts.filter((p: any) => p.status === "FAILED").length,
            approvals: d.posts.filter((p: any) => p.status === "PENDING_APPROVAL").length,
            scheduled: d.posts.filter((p: any) => p.status === "SCHEDULED").length,
            drafts: d.posts.filter((p: any) => p.status === "DRAFT").length,
            published: d.posts.filter((p: any) => p.status === "PUBLISHED").length,
            total: d.posts.length,
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadInboxUnread();
    loadNotifications();
    loadPostCounts();

    const handleUpdate = () => {
      loadInboxUnread();
      loadNotifications();
      loadPostCounts();
    };

    window.addEventListener("pulsesocial_active_brand_changed", handleUpdate);
    window.addEventListener("pulsesocial_post_created", handleUpdate);
    window.addEventListener("pulsesocial_posts_updated", handleUpdate);
    return () => {
      window.removeEventListener("pulsesocial_active_brand_changed", handleUpdate);
      window.removeEventListener("pulsesocial_post_created", handleUpdate);
      window.removeEventListener("pulsesocial_posts_updated", handleUpdate);
    };
  }, [activeBrand?.id]);

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
      if (sidebarNewPostRef.current && !sidebarNewPostRef.current.contains(target)) {
        setIsSidebarNewPostOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSidebarNewPostOpen(false);
        setIsBrandMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch {}
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        try {
          localStorage.setItem("pulsesocial_theme", "dark");
        } catch {}
      } else {
        document.documentElement.classList.remove("dark");
        try {
          localStorage.setItem("pulsesocial_theme", "light");
        } catch {}
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

  // Categorized Sidebar Navigation Sections (Exact Master Prompt SaaS Structure)
  const SIDEBAR_SECTIONS = [
    {
      title: "OVERVIEW",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          match: (p: string) => p === "/dashboard",
        },
      ],
    },
    {
      title: "PUBLISHING",
      items: [
        {
          label: "Posts & Queue",
          icon: FileText,
          href: "/posts",
          isDropdown: true,
          match: (p: string) =>
            p.startsWith("/posts") ||
            p.startsWith("/calendar") ||
            p.startsWith("/drafts") ||
            p.startsWith("/scheduled") ||
            p.startsWith("/published") ||
            p.startsWith("/approvals"),
          children: [
            {
              label: "All Posts",
              href: "/posts",
              icon: FileText,
              match: (p: string) => (p === "/posts" || p === "/posts/") && !p.includes("filter="),
            },
            {
              label: "Published Posts",
              href: "/posts?filter=PUBLISHED",
              icon: CheckCircle2,
              match: (p: string) => p.includes("filter=PUBLISHED") || p.includes("filter=published"),
              badge: postStatusCounts.published > 0 ? postStatusCounts.published.toString() : undefined,
            },
            {
              label: "Scheduled Posts",
              href: "/posts?filter=SCHEDULED",
              icon: Clock,
              match: (p: string) => p.includes("filter=SCHEDULED") || p.includes("filter=scheduled"),
              badge: postStatusCounts.scheduled > 0 ? postStatusCounts.scheduled.toString() : undefined,
            },
            {
              label: "Drafts",
              href: "/posts?filter=DRAFT",
              icon: FileEdit,
              match: (p: string) => p.startsWith("/drafts") || p.includes("filter=DRAFT") || p.includes("filter=draft"),
              badge: postStatusCounts.drafts > 0 ? postStatusCounts.drafts.toString() : undefined,
            },
            {
              label: "Unpublished / Failed Posts",
              href: "/posts?filter=FAILED",
              icon: AlertTriangle,
              match: (p: string) => p.includes("filter=FAILED") || p.includes("filter=unpublished") || p.includes("filter=failed"),
              badge: postStatusCounts.failed > 0 ? postStatusCounts.failed.toString() : undefined,
              badgeColor: "rose",
            },
            {
              label: "Approvals",
              href: "/posts?filter=PENDING_APPROVAL",
              icon: ShieldCheck,
              match: (p: string) => p.startsWith("/approvals") || p.includes("filter=PENDING_APPROVAL") || p.includes("filter=approvals"),
              badge: postStatusCounts.approvals > 0 ? postStatusCounts.approvals.toString() : undefined,
            },
            {
              label: "Content Calendar",
              href: "/calendar",
              icon: Calendar,
              match: (p: string) => p.startsWith("/calendar"),
            },
          ],
        },
      ],
    },
    {
      title: "ENGAGEMENT",
      items: [
        {
          label: "Inbox",
          href: "/inbox",
          icon: MessageSquare,
          match: (p: string) => p === "/inbox" && !p.includes("tab="),
          badge: inboxUnreadCount > 0 ? inboxUnreadCount.toString() : undefined,
        },
        {
          label: "Comments",
          href: "/inbox?tab=comments",
          icon: MessageCircle,
          match: (p: string) => p.startsWith("/comments") || p.includes("tab=comments"),
        },
        {
          label: "Mentions",
          href: "/inbox?tab=mentions",
          icon: AtSign,
          match: (p: string) => p.startsWith("/mentions") || p.includes("tab=mentions"),
        },
        {
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          match: (p: string) => p.startsWith("/notifications") || p.includes("tab=all"),
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount.toString() : undefined,
        },
      ],
    },
    {
      title: "MARKETING",
      items: [
        {
          label: "Social Planner",
          href: "/social-accounts",
          icon: Sliders,
          match: (p: string) => p.startsWith("/social-planner") || (p.startsWith("/social-accounts") && !p.includes("action=connect")),
          badge: connectedAccounts.length > 0 ? connectedAccounts.length.toString() : undefined,
        },
        {
          label: "Brand Boards",
          href: "/brand-boards",
          icon: LayoutGrid,
          match: (p: string) => p.startsWith("/brand-boards"),
        },
        {
          label: "Trigger Links",
          href: "/links",
          icon: Link2,
          match: (p: string) => p.startsWith("/links") || p.startsWith("/trigger-links"),
        },
        {
          label: "Snippets",
          href: "/snippets",
          icon: FileCode,
          match: (p: string) => p.startsWith("/snippets"),
        },
        {
          label: "Automation",
          href: "/automation",
          icon: Zap,
          match: (p: string) => p.startsWith("/automation"),
        },
      ],
    },
    {
      title: "ANALYTICS",
      items: [
        {
          label: "Overview",
          href: "/analytics",
          icon: BarChart3,
          match: (p: string) => p === "/analytics" && !p.includes("tab="),
        },
        {
          label: "Post Analytics",
          href: "/analytics?tab=posts",
          icon: TrendingUp,
          match: (p: string) => p.startsWith("/analytics") && p.includes("tab=posts"),
        },
        {
          label: "Audience",
          href: "/analytics?tab=audience",
          icon: Users,
          match: (p: string) => p.startsWith("/analytics") && p.includes("tab=audience"),
        },
        {
          label: "Engagement",
          href: "/analytics?tab=engagement",
          icon: Activity,
          match: (p: string) => p.startsWith("/analytics") && p.includes("tab=engagement"),
        },
        {
          label: "Reports",
          href: "/reports",
          icon: PieChart,
          match: (p: string) => p.startsWith("/reports"),
        },
      ],
    },
    {
      title: "SOCIAL ACCOUNTS",
      items: [
        {
          label: "Connected Accounts",
          href: "/social-accounts",
          icon: Share2,
          match: (p: string) => p === "/social-accounts" && !p.includes("action="),
          badge: connectedAccounts.length > 0 ? connectedAccounts.length.toString() : undefined,
        },
        {
          label: "Add Social Account",
          href: "/social-accounts?action=connect",
          icon: Plus,
          match: (p: string) => p.includes("action=connect"),
        },
      ],
    },
    {
      title: "AI & CREATION",
      items: [
        {
          label: "AI Studio",
          href: "/ai",
          icon: Sparkles,
          match: (p: string) => p === "/ai",
        },
        {
          label: "Gemini AI",
          href: "/ai-assistant",
          icon: Wand2,
          match: (p: string) => p.startsWith("/ai-assistant"),
        },
        {
          label: "Canva",
          href: "/canva",
          icon: Palette,
          match: (p: string) => p.startsWith("/canva") || p.includes("action=canva"),
        },
        {
          label: "Media Library",
          href: "/media",
          icon: Folder,
          match: (p: string) => p.startsWith("/media"),
        },
      ],
    },
    {
      title: "WORKSPACE",
      items: [
        {
          label: "Team",
          href: "/team",
          icon: Users,
          match: (p: string) => p.startsWith("/team"),
        },
        {
          label: "Settings",
          href: "/settings",
          icon: Settings,
          match: (p: string) => p === "/settings" && !p.includes("tab="),
        },
        {
          label: "Billing",
          href: "/billing",
          icon: CreditCard,
          match: (p: string) => p.startsWith("/billing"),
        },
      ],
    },
    ...(user?.role?.toUpperCase() === "OWNER" ||
    user?.role?.toUpperCase() === "ADMIN" ||
    ["admin@pulsesocial.io", "itsurya9930@gmail.com", "itxsurajofficial@gmail.com"].includes(
      user?.email?.toLowerCase() || ""
    )
      ? [
          {
            title: "ADMINISTRATION",
            items: [
              {
                label: "Admin Console",
                href: "/admin",
                icon: Shield,
                match: (p: string) => p.startsWith("/admin"),
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D0D0E] text-slate-900 dark:text-[#9CA3AF] flex font-sans transition-colors duration-200">
      
      {/* ============================================================ */}
      {/* SIDEBAR NAVIGATION: Matte Obsidian & Warm Amber SaaS Sidebar  */}
      {/* ============================================================ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#111113] border-r border-slate-200 dark:border-white/7 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20"
        } ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Monogram Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-white/7">
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
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 hover:text-[#5846A8] dark:hover:text-[#E08738] hover:bg-purple-50 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer hover:scale-105"
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Close mobile drawer */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Primary Action: + New Post Button (Royal Purple in Light, Golden Amber in Dark) with working Dropdown */}
        <div className="px-3 pt-3 pb-1 shrink-0 relative" ref={sidebarNewPostRef}>
          {isSidebarOpen ? (
            <div className="relative">
              <div className="flex items-center rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:hover:brightness-105 dark:text-slate-950 font-bold dark:shadow-amber-500/25 transition-all overflow-hidden hover:-translate-y-0.5 active:translate-y-0 active:scale-95 duration-200">
                <button
                  type="button"
                  onClick={() => {
                    setComposerInitialOption("now");
                    setIsComposerOpen(true);
                  }}
                  className="flex-1 py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition text-white dark:text-slate-950"
                  title="Create New Social Post (Modal)"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Post</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSidebarNewPostOpen(!isSidebarNewPostOpen);
                  }}
                  aria-expanded={isSidebarNewPostOpen}
                  className="px-2 py-2.5 border-l border-white/20 dark:border-black/15 hover:bg-white/10 dark:hover:bg-black/10 transition cursor-pointer text-white dark:text-slate-950"
                  title="More creation options"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Working Sidebar New Post Dropdown */}
              {isSidebarNewPostOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 right-0 top-12 bg-white dark:bg-[#1C1C20] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md py-1.5 z-50 text-xs font-semibold animate-in fade-in zoom-in-95"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarNewPostOpen(false);
                      setComposerInitialOption("now");
                      setIsComposerOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-white/8 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#E08738]" />
                    <span>Create Post</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarNewPostOpen(false);
                      setComposerInitialOption("schedule");
                      setIsComposerOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-white/8 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#5846A8] dark:text-amber-500" />
                    <span>Schedule Post</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarNewPostOpen(false);
                      setComposerInitialOption("now");
                      setIsComposerOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-white/8 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Create Draft</span>
                  </button>
                  <div className="border-t border-slate-100 dark:border-white/10 my-1" />
                  <Link
                    href="/calendar"
                    onClick={() => setIsSidebarNewPostOpen(false)}
                    className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-white/8 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#5846A8] dark:text-amber-500" />
                    <span>Content Calendar</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarNewPostOpen(false);
                      setIsConnectModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-white/8 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#E08738]" />
                    <span>Connect Channel</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setComposerInitialOption("now");
                setIsComposerOpen(true);
              }}
              className="w-10 h-10 mx-auto rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:hover:brightness-105 dark:text-slate-950 font-bold dark:shadow-amber-500/25 flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-200"
              title="Create New Social Post (Modal)"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {SIDEBAR_SECTIONS.map((section, sIdx) => (
            <div key={section.title} className="space-y-1">
              {isSidebarOpen ? (
                <div className="text-[10px] font-bold text-slate-400 dark:text-[#6B7280] uppercase tracking-wider px-3 pt-1 pb-0.5">
                  {section.title}
                </div>
              ) : sIdx > 0 ? (
                <div className="my-2 border-t border-slate-100 dark:border-white/7" />
              ) : null}

              {section.items.map((item: any) => {
                const Icon = item.icon;
                const isItemActive = item.match(fullPath);

                if (item.isDropdown) {
                  return (
                    <div key={item.label} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isSidebarOpen) {
                            setIsSidebarOpen(true);
                            setIsPostsDropdownOpen(true);
                          } else {
                            setIsPostsDropdownOpen((prev) => !prev);
                          }
                        }}
                        aria-expanded={isPostsDropdownOpen}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                          isItemActive
                            ? "bg-purple-50 text-[#5846A8] border border-purple-200/80 font-bold shadow-2xs dark:bg-[#241C14] dark:border dark:border-[#E08738]/50 dark:text-[#FBBF24]"
                            : "text-slate-600 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-white hover:bg-purple-50/60 dark:hover:bg-white/5"
                        }`}
                        title={!isSidebarOpen ? item.label : undefined}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isItemActive ? "text-[#5846A8] dark:text-[#FBBF24]" : "text-slate-400 dark:text-[#9CA3AF] group-hover:text-[#5846A8] dark:group-hover:text-white"}`} />
                          {isSidebarOpen && <span className="truncate flex-1 text-left">{item.label}</span>}
                        </div>
                        {isSidebarOpen && (
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                              isPostsDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>

                      {/* Dropdown Children */}
                      {isPostsDropdownOpen && isSidebarOpen && item.children && (
                        <div className="pl-3.5 pr-1 py-1 space-y-0.5 border-l-2 border-slate-200 dark:border-white/10 ml-4 animate-in fade-in duration-150">
                          {item.children.map((sub: any) => {
                            const SubIcon = sub.icon;
                            const isSubActive = sub.match(fullPath);
                            return (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                                  isSubActive
                                    ? "bg-[#5846A8] text-white font-bold shadow-2xs dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:text-slate-950"
                                    : "text-slate-600 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-white hover:bg-purple-50/60 dark:hover:bg-white/5 font-medium"
                                }`}
                              >
                                <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? "text-white dark:text-slate-950" : "text-slate-400 dark:text-[#9CA3AF]"}`} />
                                <span className="truncate flex-1">{sub.label}</span>
                                {sub.badge && (
                                  <span
                                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                      isSubActive
                                        ? "bg-white/25 text-white dark:bg-black/20 dark:text-slate-950 font-extrabold"
                                        : sub.badgeColor === "rose"
                                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                                        : "bg-purple-100 text-[#5846A8] dark:bg-[#E08738]/20 dark:text-[#FBBF24]"
                                    }`}
                                  >
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isItemActive
                        ? "bg-purple-50 text-[#5846A8] font-bold border border-purple-200/80 shadow-2xs dark:bg-[#241C14] dark:border dark:border-[#E08738]/50 dark:text-[#FBBF24]"
                        : "text-slate-600 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-white hover:bg-purple-50/60 dark:hover:bg-white/5"
                    }`}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isItemActive ? "text-[#5846A8] dark:text-[#FBBF24]" : "text-slate-400 dark:text-[#9CA3AF] group-hover:text-[#5846A8] dark:group-hover:text-white"}`} />
                    {isSidebarOpen && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {isSidebarOpen && item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isItemActive
                            ? "bg-[#5846A8] text-white dark:bg-gradient-to-r dark:from-[#F59E0B] dark:to-[#D97706] dark:text-slate-950"
                            : "bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Quick Action & Profile preview */}
        <div className="p-3 border-t border-slate-200 dark:border-white/7 space-y-2">
          {isSidebarOpen ? (
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#17171A] hover:bg-purple-50/80 dark:hover:bg-white/8 text-[#5846A8] dark:text-[#FBBF24] border border-purple-200/80 dark:border-white/7 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer hover:-translate-y-0.5 active:scale-95 duration-200"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Connect Platform</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="w-full py-2 rounded-xl text-[#5846A8] dark:text-[#FBBF24] hover:bg-purple-50/80 dark:hover:bg-white/8 flex items-center justify-center cursor-pointer transition"
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
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
        {/* HEADER: Enterprise Matte Obsidian & Warm Amber Header        */}
        {/* ============================================================ */}
        <header className="h-16 shrink-0 bg-white dark:bg-[#0D0D0E]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/7 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          
          {/* Left: Mobile hamburger & Brand selector */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Workspace Switcher Dropdown */}
            <div className="relative shrink-0" ref={brandMenuRef}>
              <button
                type="button"
                onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
                className="h-9 flex items-center gap-2 px-3 rounded-xl bg-slate-50 dark:bg-[#17171A] hover:bg-purple-50/60 dark:hover:bg-white/5 border border-slate-200 dark:border-white/7 transition cursor-pointer text-xs font-semibold text-slate-800 dark:text-white shrink-0"
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#7B61FF] to-[#5846A8] text-white dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:text-slate-950 flex items-center justify-center text-[10px] font-extrabold overflow-hidden shrink-0 shadow-2xs">
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
                <span className="max-w-[140px] sm:max-w-[200px] truncate">
                  {activeBrand?.name || "Pulse Workspace"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {isBrandMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 rounded-xl bg-white dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-md p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-[#6B7280] uppercase tracking-wider">
                    Workspaces & Brands
                  </div>
                  <div className="space-y-1.5">
                    {brands.map((b) => (
                      <div
                        key={b.id}
                        className={`w-full p-2.5 rounded-xl text-xs transition border ${
                          b.id === activeBrand.id
                            ? "bg-purple-50 dark:bg-amber-500/15 border-purple-200 dark:border-amber-500/30 text-slate-900 dark:text-white font-medium"
                            : "hover:bg-slate-50 dark:hover:bg-white/5 border-transparent text-slate-700 dark:text-slate-300"
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
                          className="flex items-start gap-2.5 w-full text-left cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] font-extrabold flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-2xs mt-0.5">
                            {b.avatarUrl ? (
                              <img
                                src={b.avatarUrl}
                                alt={b.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              b.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="truncate block font-bold text-slate-900 dark:text-white">
                                {b.name}
                              </span>
                              {b.id === activeBrand.id && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-[#5846A8] dark:bg-[#E08738] dark:text-[#0F0F11] shrink-0 ml-1">
                                  Current
                                </span>
                              )}
                            </div>

                            {/* Stacked Vertical Channel Rows (One below the other per user request) */}
                            {((b.socialAccounts && b.socialAccounts.length > 0) || (b.id === activeBrand.id && connectedAccounts.length > 0)) ? (
                              <div className="flex flex-col gap-1.5 mt-2 w-full">
                                {(b.socialAccounts && b.socialAccounts.length > 0 ? b.socialAccounts : connectedAccounts).map((acc) => (
                                  <div
                                    key={acc.id}
                                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg bg-slate-100/80 dark:bg-black/40 border border-slate-200/80 dark:border-white/10 hover:border-purple-300 dark:hover:border-amber-500/40 transition text-left"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-5 h-5 rounded-md bg-white dark:bg-[#17171A] flex items-center justify-center shrink-0 shadow-2xs border border-slate-200/60 dark:border-white/10">
                                        {renderPlatformIcon(acc.provider, 13)}
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate leading-tight">
                                          {acc.displayName || acc.provider}
                                        </span>
                                        <span className="text-[9px] text-slate-400 block truncate">
                                          {acc.username ? (acc.username.startsWith("@") ? acc.username : `@${acc.username}`) : acc.provider}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                                      <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        Active
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">
                                0 channels connected
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBrandMenuOpen(false);
                        setIsCreateBrandOpen(true);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-[#5846A8] dark:text-[#FBBF24] hover:bg-purple-50 dark:hover:bg-white/8 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Accessible breadcrumb (hidden visually per user request to expand search bar) */}
            <div className="sr-only" aria-hidden="true">
              <span>{breadcrumb.section}</span>
              <span>/</span>
              <span>{breadcrumb.title}</span>
            </div>
          </div>

          {/* Center: Command Palette Search Bar (Expanded, Linear/Raycast/Stripe Executive Style) */}
          <div className="flex items-center flex-1 max-w-xl lg:max-w-2xl mx-3 sm:mx-6 min-w-[200px]">
            <button
              type="button"
              id="global-header-search-bar"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="h-10 w-full flex items-center justify-between px-3.5 sm:px-4 text-xs rounded-xl border border-slate-200/90 dark:border-white/7 bg-slate-50/80 dark:bg-[#17171A] text-slate-500 dark:text-[#9CA3AF] hover:border-purple-400/80 dark:hover:border-[#E08738]/60 hover:bg-white dark:hover:bg-[#1C1C20] hover:shadow-xs transition-all duration-150 cursor-pointer shadow-2xs group"
              title="Search channels, posts, analytics (Ctrl + K)"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-4 h-4 text-slate-400 dark:text-[#9CA3AF] group-hover:text-[#5846A8] dark:group-hover:text-[#E08738] transition-colors shrink-0" />
                <span className="truncate text-slate-500 dark:text-[#9CA3AF] font-normal sm:text-xs">
                  Search channels, posts, queue, analytics...
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/10 rounded text-slate-500 dark:text-slate-300 shadow-2xs group-hover:border-purple-300 dark:group-hover:border-amber-500/40 transition-colors">
                  Ctrl
                </kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/10 rounded text-slate-500 dark:text-slate-300 shadow-2xs group-hover:border-purple-300 dark:group-hover:border-amber-500/40 transition-colors">
                  K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Actions, Badges, Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 justify-end">
            
            {/* Single Unified Social Connections Hub */}
            <SocialConnectionsHub
              connectedAccounts={connectedAccounts}
              onOpenConnectModal={(plat) => {
                setSelectedConnectPlatform(plat);
                setIsConnectModalOpen(true);
              }}
              onRefreshAccounts={loadAccounts}
            />

            {/* Professional '+ Add Social' Action Button (Signature Purple in Light, Warm Amber in Dark) */}
            <button
              type="button"
              id="header-add-social-btn"
              onClick={() => {
                setSelectedConnectPlatform(undefined);
                setIsConnectModalOpen(true);
              }}
              className="h-9 px-3 sm:px-3.5 rounded-xl border border-purple-200 bg-purple-50/90 text-[#5846A8] hover:bg-purple-100 hover:border-purple-300 shadow-2xs hover:shadow-purple-500/20 dark:border-white/10 dark:bg-white/5 dark:text-[#FBBF24] dark:hover:bg-[#E08738] dark:hover:text-[#0F0F11] dark:hover:border-[#E08738] dark:hover:shadow-[0_0_16px_rgba(224,135,56,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-bold text-xs shrink-0 group"
              title="Connect a new social network (14+ official platforms)"
            >
              <div className="w-4 h-4 rounded-full bg-purple-500/15 group-hover:bg-purple-500/25 dark:bg-amber-500/20 dark:group-hover:bg-amber-500/30 flex items-center justify-center transition-colors">
                <Plus className="w-3 h-3 text-[#5846A8] dark:text-[#FBBF24] group-hover:text-[#48388d] dark:group-hover:text-[#0F0F11] stroke-[2.5] transition-colors" />
              </div>
              <span className="tracking-tight">Add Social</span>
            </button>

            {/* Primary CTA: + New Post (Royal Purple in Light, Golden Amber in Dark) */}
            <button
              type="button"
              id="header-new-post-btn"
              onClick={() => setIsComposerOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 hover:shadow-purple-900/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:hover:brightness-105 dark:text-slate-950 dark:shadow-amber-500/25 dark:hover:shadow-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Create a new publication"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="font-bold">New Post</span>
            </button>

            {/* Quick Utility Icons: Theme Toggle, Activity, Help, Notifications */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Global Theme Switcher: Direct Light / Dark / System Mode */}
              <ThemeSwitcher />

              {/* Live Activity Stream Button */}
              <button
                type="button"
                onClick={() => setIsActivityOpen(true)}
                className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-white hover:bg-purple-50/70 dark:hover:bg-white/5 transition duration-200 cursor-pointer shrink-0 hover:scale-105"
                title="Live Activity Stream"
              >
                <Activity className="w-4 h-4" />
              </button>

              {/* Help & Documentation Guide Modal Button */}
              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-white hover:bg-purple-50/70 dark:hover:bg-white/5 transition duration-200 cursor-pointer shrink-0 hover:scale-105"
                title="Help & Quick Guides"
                aria-label="Open Help and Guides"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Notifications Menu */}
              <div className="relative shrink-0" ref={notifMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="h-9 w-9 relative flex items-center justify-center rounded-xl text-slate-500 dark:text-[#9CA3AF] hover:text-[#5846A8] dark:hover:text-white hover:bg-purple-50/70 dark:hover:bg-white/5 transition duration-200 cursor-pointer hover:scale-105"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#5846A8] dark:bg-[#E08738] ring-2 ring-white dark:ring-[#0D0D0E]" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-md p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notifications</h4>
                      {unreadNotificationsCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllNotificationsRead}
                          className="text-[10px] text-[#5846A8] hover:text-[#48388d] dark:text-[#FBBF24] dark:hover:text-[#E08738] font-semibold hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="py-2 space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
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
            </div>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="h-9 flex items-center gap-2 p-1 rounded-xl hover:bg-purple-50/70 dark:hover:bg-white/5 transition duration-200 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] flex items-center justify-center font-extrabold text-xs ring-2 ring-purple-500/30 dark:ring-amber-500/30 shadow-xs">
                  {initial}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[120px]">
                    {realName}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-[#9CA3AF] leading-tight truncate max-w-[120px]">
                    {realRole}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-md p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-[#17171A] rounded-xl mb-1.5 border border-slate-200/80 dark:border-white/10">
                    <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
                      {realName}
                    </p>
                    {realEmail && (
                      <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF] truncate mt-0.5 font-mono">
                        {realEmail}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded bg-purple-100 text-[#5846A8] dark:bg-[#E08738] dark:text-[#0F0F11] shadow-2xs">
                        {realRole}
                      </span>
                      {user?.activeOrganization?.name && (
                        <span className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-[#5846A8] border border-purple-200 dark:bg-amber-500/15 dark:text-[#FBBF24] dark:border-amber-500/30 truncate max-w-[210px]" title={user.activeOrganization.name}>
                          🏢 {user.activeOrganization.name}
                        </span>
                      )}
                    </div>
                    {/* Authenticated Session Indicator */}
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200/60 dark:border-white/10 text-[10px] text-slate-600 dark:text-[#9CA3AF]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Verified Authenticated Session</span>
                    </div>
                  </div>

                  {/* Connected Social Channels in Active Workspace */}
                  {connectedAccounts.length > 0 && (
                    <div className="px-2 py-2 mb-1 rounded-xl bg-slate-50/80 dark:bg-[#17171A] border border-slate-100 dark:border-white/10">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-[#6B7280] uppercase tracking-wider">
                          Connected Channels
                        </span>
                        <Link
                          href="/social-accounts"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="text-[9px] font-bold text-[#5846A8] dark:text-[#FBBF24] hover:underline hover:scale-105 transition-transform"
                        >
                          Manage
                        </Link>
                      </div>
                      <div className="space-y-1">
                        {connectedAccounts.map((acc) => (
                          <div
                            key={acc.id}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-[#111113] border border-slate-200/80 dark:border-white/10 shadow-2xs hover:border-purple-300 dark:hover:border-amber-500/40 transition-colors"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                                {renderPlatformIcon(acc.provider, 16)}
                              </div>
                              <span className="truncate max-w-[110px] font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                                {acc.displayName || acc.provider}
                              </span>
                            </div>
                            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                              ACTIVE
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <Link
                      href="/settings/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-white/8 transition-all text-slate-700 dark:text-slate-300 hover:text-[#5846A8] dark:hover:text-white font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account Profile</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-white/8 transition-all text-slate-700 dark:text-slate-300 hover:text-[#5846A8] dark:hover:text-white font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Workspace Settings</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleToggleDarkMode}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-white/8 transition-all text-slate-700 dark:text-slate-300 hover:text-[#5846A8] dark:hover:text-white text-left font-medium cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        {isDarkMode ? <Sun className="w-3.5 h-3.5 text-[#E08738]" /> : <Moon className="w-3.5 h-3.5 text-[#5846A8]" />}
                        <span>Dark Theme</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{isDarkMode ? "On" : "Off"}</span>
                    </button>

                    {(user?.role?.toUpperCase() === "OWNER" ||
                      user?.role?.toUpperCase() === "ADMIN" ||
                      ["admin@pulsesocial.io", "itsurya9930@gmail.com", "itxsurajofficial@gmail.com"].includes(
                        user?.email?.toLowerCase() || ""
                      )) && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-50 dark:bg-amber-950/40 hover:bg-purple-100 dark:hover:bg-amber-900/60 transition text-[#5846A8] dark:text-amber-300 font-bold"
                      >
                        <span className="flex items-center gap-2.5">
                          <Shield className="w-3.5 h-3.5 text-[#5846A8] dark:text-amber-400" />
                          <span>Admin Console</span>
                        </span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#5846A8] text-white dark:bg-gradient-to-r dark:from-[#F59E0B] dark:to-[#D97706] dark:text-slate-950">
                          Admin
                        </span>
                      </Link>
                    )}
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

        <main className="flex-1 overflow-y-auto flex flex-col justify-between bg-slate-50 dark:bg-[#0D0D0E] text-slate-900 dark:text-[#9CA3AF]">
          <div className="flex-1">{children}</div>
          <DashboardFooter />
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => {
          setIsComposerOpen(false);
          setComposerInitialOption(undefined);
        }}
        initialPublishingOption={composerInitialOption}
      />

      <UniversalSocialConnectModal
        isOpen={isConnectModalOpen}
        initialPlatformId={selectedConnectPlatform}
        onClose={() => {
          setIsConnectModalOpen(false);
          setSelectedConnectPlatform(undefined);
        }}
        onSuccess={() => {
          setIsConnectModalOpen(false);
          setSelectedConnectPlatform(undefined);
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
        onOpenAddBrand={() => setIsCreateBrandOpen(true)}
        onOpenActivity={() => setIsActivityOpen(true)}
        onOpenConnectModal={(plat) => {
          setSelectedConnectPlatform(plat);
          setIsConnectModalOpen(true);
        }}
        onToggleTheme={handleToggleDarkMode}
        onOpenHelp={() => setIsHelpOpen(true)}
        connectedAccounts={connectedAccounts}
      />

      <PulseAIPanel
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
      />

      <PulseHelpGuidesModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default AppLayout;
