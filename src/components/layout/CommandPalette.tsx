"use client";
import { isCompanyAdminEmail } from "@/lib/auth/admin-emails";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Share2,
  Calendar,
  Inbox,
  BarChart3,
  Settings,
  Users,
  Building2,
  Zap,
  Activity,
  Moon,
  Sun,
  X,
  CornerDownLeft,
  FileText,
  Clock,
  CheckCircle2,
  FileEdit,
  Shield,
  HelpCircle,
  CreditCard,
  Compass,
  ArrowRight,
  Sliders,
  Sparkles,
  Command as CommandIcon,
  Radio,
  Layers,
  Check,
} from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";

export type CommandCategory =
  | "all"
  | "actions"
  | "accounts"
  | "navigation"
  | "channels"
  | "analytics"
  | "settings";

export interface ConnectedAccountSummary {
  id: string;
  provider: string;
  providerAccountId?: string;
  displayName?: string;
  username?: string;
  profileImageUrl?: string | null;
  status?: string;
  validityDays?: number;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenComposer: () => void;
  onOpenAddBrand: () => void;
  onOpenActivity: () => void;
  onOpenConnectModal?: (platform?: string) => void;
  onToggleTheme?: () => void;
  onOpenHelp?: () => void;
  connectedAccounts?: ConnectedAccountSummary[];
}

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: "actions" | "accounts" | "navigation" | "channels" | "analytics" | "settings";
  categoryLabel: string;
  icon?: React.ElementType;
  platformIcon?: string;
  avatarUrl?: string | null;
  badge?: string;
  shortcut?: string;
  keywords?: string[];
  action: () => void;
}

// Sub-component for highlighted search matches
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim()) return <>{text}</>;
  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            className="bg-amber-100 dark:bg-amber-500/20 text-[#D97706] dark:text-[#FBBF24] font-semibold px-0.5 rounded-xs"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenComposer,
  onOpenAddBrand,
  onOpenActivity,
  onOpenConnectModal,
  onToggleTheme,
  onOpenHelp,
  connectedAccounts = [],
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CommandCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  useEffect(() => {
    try {
      const cached = localStorage.getItem("pulsesocial_active_user");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.email) setCurrentUserEmail(parsed.email);
      }
    } catch {}
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setSelectedCategory("all");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Master Comprehensive Command Registry
  const ALL_COMMANDS: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // --- ⚡ ACTIONS ---
      {
        id: "act-new-post",
        title: "Create New Social Post",
        description: "Open the studio composer modal to draft, attach media, and broadcast live",
        category: "actions",
        categoryLabel: "Quick Actions",
        icon: Plus,
        badge: "Primary CTA",
        shortcut: "Ctrl + N",
        keywords: ["compose", "publish", "draft", "new post", "schedule", "share", "write", "post", "status"],
        action: () => {
          onClose();
          onOpenComposer();
        },
      },
      {
        id: "act-connect-channel",
        title: "Connect Social Channel",
        description: "Launch the 14-network integration console (Meta, LinkedIn, YouTube, TikTok, X, etc.)",
        category: "actions",
        categoryLabel: "Quick Actions",
        icon: Share2,
        badge: "14 Networks",
        shortcut: "Ctrl + C",
        keywords: ["integrate", "oauth", "facebook", "instagram", "youtube", "linkedin", "tiktok", "channels", "add social"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal();
        },
      },
      {
        id: "act-new-workspace",
        title: "Create New Brand / Workspace",
        description: "Provision an isolated brand environment with distinct social channels and team members",
        category: "actions",
        categoryLabel: "Quick Actions",
        icon: Building2,
        badge: "Tenant",
        shortcut: "Ctrl + B",
        keywords: ["workspace", "brand", "client", "agency", "team", "organization", "new brand"],
        action: () => {
          onClose();
          onOpenAddBrand();
        },
      },
      {
        id: "act-live-stream",
        title: "Open Live Activity Stream",
        description: "Monitor real-time publishing dispatches, token syncs, and database audit logs",
        category: "actions",
        categoryLabel: "Quick Actions",
        icon: Activity,
        badge: "Realtime",
        shortcut: "Ctrl + A",
        keywords: ["audit", "logs", "stream", "history", "realtime", "events", "telemetry", "activity"],
        action: () => {
          onClose();
          onOpenActivity();
        },
      },
      {
        id: "act-toggle-theme",
        title: "Toggle Light / Dark Mode",
        description: "Switch seamlessly between rich dark mode and crisp high-contrast light theme",
        category: "actions",
        categoryLabel: "Quick Actions",
        icon: Sun,
        badge: "Appearance",
        keywords: ["dark", "light", "theme", "night", "sun", "moon", "contrast", "mode", "toggle"],
        action: () => {
          onClose();
          if (onToggleTheme) onToggleTheme();
        },
      },
      {
        id: "act-help-guides",
        title: "Open Documentation & Guides",
        description: "Browse step-by-step setup walkthroughs, API docs, and troubleshooting tips",
        category: "actions",
        categoryLabel: "Quick Actions",
        icon: HelpCircle,
        badge: "Support",
        keywords: ["docs", "manual", "guide", "faq", "help", "support", "tutorial", "setup"],
        action: () => {
          onClose();
          if (onOpenHelp) onOpenHelp();
        },
      },
    ];

    // --- 🌐 DYNAMIC ACTIVE CONNECTED ACCOUNTS ---
    if (connectedAccounts && connectedAccounts.length > 0) {
      connectedAccounts.forEach((acc) => {
        const name = acc.displayName || acc.username || acc.provider;
        const providerName = acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1);
        list.push({
          id: `acc-${acc.id}`,
          title: `${providerName}: ${name}`,
          description: `Active ${providerName} channel • ${acc.validityDays ? `${acc.validityDays}d validity` : "Authorized"} • Manage channel`,
          category: "accounts",
          categoryLabel: "Connected Accounts",
          platformIcon: acc.provider.toLowerCase(),
          avatarUrl: acc.profileImageUrl,
          badge: "Active",
          keywords: [
            acc.provider.toLowerCase(),
            name.toLowerCase(),
            acc.username ? acc.username.toLowerCase() : "",
            "account",
            "channel",
            "connected",
          ].filter(Boolean),
          action: () => {
            onClose();
            router.push("/social-accounts");
          },
        });
      });
    }

    // --- 🧭 NAVIGATION & QUEUE ---
    list.push(
      {
        id: "nav-dashboard",
        title: "Dashboard Overview",
        description: "Executive metrics, brand health overview, recent posts, and live activity",
        category: "navigation",
        categoryLabel: "Navigation & Queue",
        icon: Compass,
        shortcut: "G + D",
        keywords: ["home", "overview", "executive", "metrics", "kpi", "dashboard", "main"],
        action: () => {
          onClose();
          router.push("/dashboard");
        },
      },
      {
        id: "nav-all-posts",
        title: "All Posts & Master Queue",
        description: "View, filter, edit, and organize all published, scheduled, and draft posts",
        category: "navigation",
        categoryLabel: "Navigation & Queue",
        icon: FileText,
        shortcut: "G + P",
        keywords: ["posts", "queue", "list", "feed", "timeline", "all posts", "manage"],
        action: () => {
          onClose();
          router.push("/posts");
        },
      },
      {
        id: "nav-published-posts",
        title: "Published Posts Filter",
        description: "Inspect live published broadcasts with external direct social links and likes/comments",
        category: "navigation",
        categoryLabel: "Navigation & Queue",
        icon: CheckCircle2,
        keywords: ["published", "live", "sent", "history", "broadcasts", "completed"],
        action: () => {
          onClose();
          router.push("/posts?filter=PUBLISHED");
        },
      },
      {
        id: "nav-scheduled-posts",
        title: "Scheduled Queue Filter",
        description: "Review pending posts queued for future broadcast with calendar scheduling slots",
        category: "navigation",
        categoryLabel: "Navigation & Queue",
        icon: Clock,
        keywords: ["scheduled", "queue", "future", "upcoming", "timed", "pending"],
        action: () => {
          onClose();
          router.push("/posts?filter=SCHEDULED");
        },
      },
      {
        id: "nav-drafts",
        title: "Drafts Manager",
        description: "Resume unfinished captions, media attachments, and preliminary post concepts",
        category: "navigation",
        categoryLabel: "Navigation & Queue",
        icon: FileEdit,
        keywords: ["drafts", "unpublished", "wip", "saved", "ideas", "working"],
        action: () => {
          onClose();
          router.push("/drafts");
        },
      },
      {
        id: "nav-calendar",
        title: "Content Calendar Planner",
        description: "Visual month and week calendar grid with drag-and-drop scheduling",
        category: "navigation",
        categoryLabel: "Navigation & Queue",
        icon: Calendar,
        shortcut: "G + C",
        keywords: ["calendar", "schedule", "planner", "agenda", "timeline", "month", "week"],
        action: () => {
          onClose();
          router.push("/calendar");
        },
      },
      {
        id: "nav-inbox",
        title: "Unified Social Inbox",
        description: "Consolidated messages, comments, mentions, and reader engagement across platforms",
        category: "navigation",
        categoryLabel: "Navigation & Queue",
        icon: Inbox,
        shortcut: "G + I",
        keywords: ["inbox", "messages", "comments", "replies", "dms", "engagement", "mentions"],
        action: () => {
          onClose();
          router.push("/inbox");
        },
      },
      {
        id: "nav-social-accounts",
        title: "Social Accounts & Channels Hub",
        description: "Manage OAuth authorization status, token validity, and channel connections",
        category: "navigation",
        categoryLabel: "Navigation & Queue",
        icon: Zap,
        keywords: ["accounts", "channels", "connections", "oauth", "tokens", "profiles", "socials"],
        action: () => {
          onClose();
          router.push("/social-accounts");
        },
      }
    );

    // --- 🔗 SOCIAL CHANNELS (DIRECT INTEGRATION LAUNCHERS) ---
    list.push(
      {
        id: "chan-youtube",
        title: "Connect YouTube Channel",
        description: "Google OAuth 2.0: 4K video uploads, YouTube Shorts, and audience retention metrics",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "youtube",
        badge: "Google OAuth",
        keywords: ["youtube", "video", "shorts", "google", "broadcast", "yt"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("youtube");
        },
      },
      {
        id: "chan-facebook",
        title: "Connect Facebook Page",
        description: "Meta Graph API v21.0: Facebook Business Pages, photos, video reels, and reach insights",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "facebook",
        badge: "Meta API",
        keywords: ["facebook", "meta", "fb", "page", "reels", "meta graph"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("facebook");
        },
      },
      {
        id: "chan-instagram",
        title: "Connect Instagram Professional",
        description: "Meta Graph API v21.0: 10-slide photo carousels, video Reels, and auto-first comments",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "instagram",
        badge: "Meta API",
        keywords: ["instagram", "ig", "reels", "carousel", "meta", "photos", "insta"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("instagram");
        },
      },
      {
        id: "chan-linkedin",
        title: "Connect LinkedIn Profile & Pages",
        description: "REST Posts API: 3,000-character thought leadership articles, documents & company updates",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "linkedin",
        badge: "Professional",
        keywords: ["linkedin", "b2b", "professional", "company", "career", "in"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("linkedin");
        },
      },
      {
        id: "chan-x",
        title: "Connect X (Twitter) Account",
        description: "Twitter API v2 (PKCE): 280-char microblogging, multi-tweet threads, and media",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "x",
        badge: "API v2 PKCE",
        keywords: ["x", "twitter", "tweet", "threads", "retweet", "microblog"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("x");
        },
      },
      {
        id: "chan-threads",
        title: "Connect Threads Profile",
        description: "Meta Threads API: 500-character conversations, images, and short video clips",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "threads",
        badge: "Meta API",
        keywords: ["threads", "instagram", "meta", "microblog", "meta threads"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("threads");
        },
      },
      {
        id: "chan-tiktok",
        title: "Connect TikTok Account",
        description: "Content Posting API: Short-form creator video uploads, captions, and view counts",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "tiktok",
        badge: "Video API",
        keywords: ["tiktok", "short video", "vertical", "viral", "reels", "music"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("tiktok");
        },
      },
      {
        id: "chan-pinterest",
        title: "Connect Pinterest Business",
        description: "Pinterest API v5: Visual vertical Pins, destination links, boards, and analytics",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "pinterest",
        badge: "API v5",
        keywords: ["pinterest", "pins", "boards", "visual", "ecommerce", "pin"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("pinterest");
        },
      },
      {
        id: "chan-bluesky",
        title: "Connect Bluesky Account",
        description: "AT Protocol: Decentralized microblogging, custom feeds, and federation",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "bluesky",
        badge: "AT Protocol",
        keywords: ["bluesky", "bsky", "atproto", "federation", "decentralized"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("bluesky");
        },
      },
      {
        id: "chan-mastodon",
        title: "Connect Mastodon Instance",
        description: "ActivityPub: Federated open social network, instance posts, and hashtag reach",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "mastodon",
        badge: "ActivityPub",
        keywords: ["mastodon", "activitypub", "fediverse", "decentralized", "instance"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("mastodon");
        },
      },
      {
        id: "chan-telegram",
        title: "Connect Telegram Channel / Bot",
        description: "Telegram Bot API: Instant channel broadcasting, rich formatting, and notifications",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "telegram",
        badge: "Bot API",
        keywords: ["telegram", "channel", "group", "broadcast", "bot"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("telegram");
        },
      },
      {
        id: "chan-reddit",
        title: "Connect Reddit Community",
        description: "Reddit OAuth: Subreddit posting, karma tracking, and community discussion",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "reddit",
        badge: "OAuth 2.0",
        keywords: ["reddit", "subreddit", "karma", "community", "forum"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("reddit");
        },
      },
      {
        id: "chan-snapchat",
        title: "Connect Snapchat Profile",
        description: "Snap Kit: Spotlight videos, public stories, and audience reach tracking",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "snapchat",
        badge: "Snap Kit",
        keywords: ["snapchat", "snap", "spotlight", "stories", "ghost"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("snapchat");
        },
      },
      {
        id: "chan-whatsapp",
        title: "Connect WhatsApp Business",
        description: "WhatsApp Cloud API: Verified broadcast campaigns, client channels, and updates",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "whatsapp",
        badge: "Cloud API",
        keywords: ["whatsapp", "messaging", "chat", "broadcast", "wa"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("whatsapp");
        },
      },
      {
        id: "chan-google-business",
        title: "Connect Google Business Profile",
        description: "Google Business API: Local business search updates, offers, events, and reviews",
        category: "channels",
        categoryLabel: "Social Networks",
        platformIcon: "google_business",
        badge: "Google API",
        keywords: ["google", "business", "maps", "local", "reviews", "search", "gmb"],
        action: () => {
          onClose();
          if (onOpenConnectModal) onOpenConnectModal("google_business");
        },
      }
    );

    // --- 📊 TELEMETRY & ANALYTICS ---
    list.push(
      {
        id: "ana-performance",
        title: "Performance Dynamics & Telemetry",
        description: "Cross-platform impressions, audience reach trajectory, and engagement rate metrics",
        category: "analytics",
        categoryLabel: "Analytics & AI",
        icon: BarChart3,
        badge: "Telemetry",
        keywords: ["analytics", "metrics", "telemetry", "reach", "impressions", "engagement", "charts", "performance", "kpis"],
        action: () => {
          onClose();
          router.push("/analytics");
        },
      },
      {
        id: "ana-ai-studio",
        title: "Gemini AI Social Assistant",
        description: "AI caption generator, viral hook optimizer, and multi-platform content repurposer",
        category: "analytics",
        categoryLabel: "Analytics & AI",
        icon: Sparkles,
        badge: "Gemini 1.5",
        keywords: ["ai", "gemini", "assistant", "generate", "hooks", "writer", "copy", "caption", "viral"],
        action: () => {
          onClose();
          router.push("/ai-assistant");
        },
      }
    );

    // --- ⚙️ SETTINGS & ADMINISTRATION ---
    list.push(
      {
        id: "set-profile",
        title: "Account Profile & Security",
        description: "Manage your name, avatar, email, password, and active login sessions",
        category: "settings",
        categoryLabel: "Settings & Administration",
        icon: Settings,
        keywords: ["profile", "account", "security", "password", "email", "avatar", "auth"],
        action: () => {
          onClose();
          router.push("/settings/profile");
        },
      },
      {
        id: "set-workspace",
        title: "Workspace Settings",
        description: "Configure workspace brand defaults, time zone, and organization details",
        category: "settings",
        categoryLabel: "Settings & Administration",
        icon: Sliders,
        keywords: ["workspace", "settings", "timezone", "brand", "defaults", "config"],
        action: () => {
          onClose();
          router.push("/settings");
        },
      },
      {
        id: "set-team",
        title: "Team & Role-Based Access (RBAC)",
        description: "Invite teammates, manage roles (Owner, Admin, Member), and member permissions",
        category: "settings",
        categoryLabel: "Settings & Administration",
        icon: Users,
        keywords: ["team", "users", "members", "invite", "rbac", "roles", "permissions", "collaborate"],
        action: () => {
          onClose();
          router.push("/team");
        },
      },
      {
        id: "set-billing",
        title: "Subscription & Billing Plans",
        description: "Manage Starter, Professional, or Enterprise tiers with Stripe customer billing",
        category: "settings",
        categoryLabel: "Settings & Administration",
        icon: CreditCard,
        keywords: ["billing", "subscription", "plans", "stripe", "upgrade", "pricing", "invoices", "payment", "card"],
        action: () => {
          onClose();
          router.push("/billing");
        },
      },
      {
        id: "set-admin",
        title: "Admin Master Console",
        description: "System health monitoring, platform audit logs, database telemetry, and user management",
        category: "settings",
        categoryLabel: "Settings & Administration",
        icon: Shield,
        badge: "Admin Only",
        keywords: ["admin", "superadmin", "audit", "system", "health", "console", "master"],
        action: () => {
          onClose();
          router.push("/admin");
        },
      }
    );

    return list;
  }, [
    connectedAccounts,
    currentUserEmail,
    onClose,
    onOpenComposer,
    onOpenAddBrand,
    onOpenActivity,
    onOpenConnectModal,
    onToggleTheme,
    onOpenHelp,
    router,
  ]);

  // Filter commands by search query and category
  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase().trim();

    return ALL_COMMANDS.filter((cmd) => {
      // Category filter
      if (selectedCategory !== "all" && cmd.category !== selectedCategory) {
        return false;
      }

      // Query filter
      if (!q) return true;

      const titleMatch = cmd.title.toLowerCase().includes(q);
      const descMatch = cmd.description.toLowerCase().includes(q);
      const catMatch = cmd.categoryLabel.toLowerCase().includes(q);
      const keywordMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(q));

      return titleMatch || descMatch || catMatch || keywordMatch;
    });
  }, [ALL_COMMANDS, query, selectedCategory]);

  // Reset selectedIndex on query or category change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.querySelector<HTMLElement>(
      `[data-cmd-index="${selectedIndex}"]`
    );
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  // Available categories list for tabs
  const categoriesList = useMemo(() => {
    const cats: { id: CommandCategory; label: string; count: number }[] = [
      { id: "all", label: "All", count: ALL_COMMANDS.length },
      {
        id: "actions",
        label: "⚡ Actions",
        count: ALL_COMMANDS.filter((c) => c.category === "actions").length,
      },
    ];

    const accCount = ALL_COMMANDS.filter((c) => c.category === "accounts").length;
    if (accCount > 0) {
      cats.push({ id: "accounts", label: "🌐 Accounts", count: accCount });
    }

    cats.push(
      {
        id: "navigation",
        label: "🧭 Navigation",
        count: ALL_COMMANDS.filter((c) => c.category === "navigation").length,
      },
      {
        id: "channels",
        label: "🔗 Channels",
        count: ALL_COMMANDS.filter((c) => c.category === "channels").length,
      },
      {
        id: "analytics",
        label: "📊 Analytics",
        count: ALL_COMMANDS.filter((c) => c.category === "analytics").length,
      },
      {
        id: "settings",
        label: "⚙️ Settings",
        count: ALL_COMMANDS.filter((c) => c.category === "settings").length,
      }
    );

    return cats;
  }, [ALL_COMMANDS]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(filteredCommands.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          (prev - 1 + filteredCommands.length) % Math.max(filteredCommands.length, 1)
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const active = filteredCommands[selectedIndex];
        if (active) {
          active.action();
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        const catKeys = categoriesList.map((c) => c.id);
        const currentIdx = catKeys.indexOf(selectedCategory);
        const nextIdx = e.shiftKey
          ? (currentIdx - 1 + catKeys.length) % catKeys.length
          : (currentIdx + 1) % catKeys.length;
        setSelectedCategory(catKeys[nextIdx]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, selectedCategory, categoriesList, onClose]);

  if (!isOpen) return null;

  // Selected item for preview details
  const activeItem = filteredCommands[selectedIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="PulseSocial Command Console"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-12 sm:pt-20 p-3 sm:p-5 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#17171A] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-white/10 w-full max-w-2xl lg:max-w-3xl overflow-hidden flex flex-col text-slate-900 dark:text-white animate-in zoom-in-95 duration-150 transition-all ring-1 ring-amber-500/15"
      >
        {/* ======================================================== */}
        {/* TOP SEARCH BAR                                           */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-4.5 border-b border-slate-200/80 dark:border-white/7 flex items-center gap-3 bg-slate-50/80 dark:bg-[#111113]">
          <div className="w-10 h-10 rounded-2xl bg-[#5846A8] text-white shadow-md shadow-purple-900/20 dark:bg-gradient-to-br dark:from-[#E08738] dark:to-[#F59E0B] dark:text-[#0F0F11] dark:shadow-amber-900/20 flex items-center justify-center shrink-0 font-bold">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actions, pages, connected accounts, social networks..."
              className="w-full bg-transparent border-none text-sm sm:text-base font-semibold placeholder:text-slate-400 placeholder:font-normal dark:placeholder:text-[#6B7280] text-slate-900 dark:text-white outline-hidden focus:outline-hidden"
            />
          </div>

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-1 rounded-lg bg-white dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold text-slate-500 dark:text-[#9CA3AF] shadow-2xs">
              ESC
            </kbd>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/5 transition cursor-pointer"
            title="Close command console"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* CATEGORY FILTER TABS                                     */}
        {/* ======================================================== */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/7 bg-slate-50/40 dark:bg-[#0D0D0E]/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {categoriesList.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold tracking-tight whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isCatActive
                    ? "bg-[#E08738] text-[#0F0F11] shadow-xs"
                    : "bg-white dark:bg-[#1C1C20] text-slate-600 dark:text-[#9CA3AF] border border-slate-200 dark:border-white/7 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                    isCatActive
                      ? "bg-black/20 text-[#0F0F11] font-bold"
                      : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* SUGGESTED FAST ACTIONS (SHOWN WHEN SEARCH IS EMPTY)      */}
        {/* ======================================================== */}
        {!query && selectedCategory === "all" && (
          <div className="px-4 pt-3 pb-1 border-b border-slate-100 dark:border-white/7 bg-gradient-to-r from-amber-50/30 via-transparent to-amber-50/20 dark:from-amber-950/20 dark:to-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-[#FBBF24] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Suggested Quick Actions
              </span>
              <span className="text-[10px] text-slate-400 dark:text-[#6B7280] font-medium">
                Frequently Used
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenComposer();
                }}
                className="p-2 rounded-xl bg-white dark:bg-[#1C1C20] border border-slate-200/80 dark:border-white/7 hover:border-amber-400 dark:hover:border-[#E08738] flex items-center gap-2 text-left transition cursor-pointer shadow-2xs group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-[#E08738] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    New Post
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-[#6B7280] truncate">Studio modal</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/calendar");
                }}
                className="p-2 rounded-xl bg-white dark:bg-[#1C1C20] border border-slate-200/80 dark:border-white/7 hover:border-amber-400 dark:hover:border-[#E08738] flex items-center gap-2 text-left transition cursor-pointer shadow-2xs group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    Calendar
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-[#6B7280] truncate">Visual planner</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenConnectModal) onOpenConnectModal();
                }}
                className="p-2 rounded-xl bg-white dark:bg-[#1C1C20] border border-slate-200/80 dark:border-white/7 hover:border-amber-400 dark:hover:border-[#E08738] flex items-center gap-2 text-left transition cursor-pointer shadow-2xs group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    Connect
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-[#6B7280] truncate">14 networks</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/ai-assistant");
                }}
                className="p-2 rounded-xl bg-white dark:bg-[#1C1C20] border border-slate-200/80 dark:border-white/7 hover:border-amber-400 dark:hover:border-[#E08738] flex items-center gap-2 text-left transition cursor-pointer shadow-2xs group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-[#FBBF24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    Gemini AI
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-[#6B7280] truncate">Viral hooks</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COMMANDS RESULTS LIST                                    */}
        {/* ======================================================== */}
        <div
          ref={listRef}
          className="max-h-[360px] sm:max-h-[420px] overflow-y-auto p-2.5 space-y-1"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-[#E08738] mx-auto flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No matching results for &quot;{query}&quot;
                </p>
                <p className="text-xs text-slate-400 dark:text-[#9CA3AF] max-w-xs mx-auto mt-1">
                  Try searching with keywords like <span className="text-[#E08738] dark:text-[#FBBF24] font-semibold">&quot;post&quot;</span>, <span className="text-[#E08738] dark:text-[#FBBF24] font-semibold">&quot;youtube&quot;</span>, <span className="text-[#E08738] dark:text-[#FBBF24] font-semibold">&quot;linkedin&quot;</span>, or <span className="text-[#E08738] dark:text-[#FBBF24] font-semibold">&quot;theme&quot;</span>.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {["Post", "YouTube", "Calendar", "Instagram", "Settings", "Analytics"].map(
                  (hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => setQuery(hint)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#1C1C20] text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10 dark:hover:text-[#FBBF24] transition cursor-pointer"
                    >
                      {hint}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const IconComponent = cmd.icon;
              const isSelected = idx === selectedIndex;

              // Check if we need to show a category header (when viewing "all" or search)
              const prevItem = filteredCommands[idx - 1];
              const showCategoryHeader =
                selectedCategory === "all" &&
                (!prevItem || prevItem.categoryLabel !== cmd.categoryLabel);

              return (
                <React.Fragment key={cmd.id}>
                  {showCategoryHeader && (
                    <div className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-[#6B7280] flex items-center justify-between">
                      <span>{cmd.categoryLabel}</span>
                    </div>
                  )}

                  <button
                    data-cmd-index={idx}
                    type="button"
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-amber-50/80 dark:bg-white/5 border border-amber-300 dark:border-[#E08738]/50 shadow-xs"
                        : "hover:bg-slate-50/80 dark:hover:bg-white/3 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                      {/* Avatar / Platform icon / Lucide icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105 overflow-hidden ${
                          cmd.avatarUrl
                            ? "border border-amber-300 dark:border-[#E08738]/40"
                            : cmd.platformIcon
                            ? "bg-white dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10"
                            : isSelected
                            ? "bg-[#E08738] text-[#0F0F11] font-bold"
                            : "bg-slate-100 dark:bg-[#1C1C20] text-slate-600 dark:text-[#9CA3AF] border border-slate-200/80 dark:border-white/7"
                        }`}
                      >
                        {cmd.avatarUrl ? (
                          <img
                            src={cmd.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : cmd.platformIcon ? (
                          renderPlatformIcon(cmd.platformIcon, 20)
                        ) : IconComponent ? (
                          <IconComponent className="w-4 h-4" />
                        ) : (
                          <CommandIcon className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                              isSelected
                                ? "text-[#D97706] dark:text-[#FBBF24]"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            <HighlightMatch text={cmd.title} query={query} />
                          </span>
                          {cmd.badge && (
                            <span
                              className={`px-1.5 py-0.2 rounded-md text-[9.5px] font-bold uppercase tracking-wider shrink-0 ${
                                isSelected
                                  ? "bg-[#E08738] text-[#0F0F11]"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-[#FBBF24] border border-amber-200/60 dark:border-amber-500/30"
                              }`}
                            >
                              {cmd.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF] truncate mt-0.5 leading-tight">
                          <HighlightMatch text={cmd.description} query={query} />
                        </p>
                      </div>
                    </div>

                    {/* Right side shortcut badge or Jump indicator */}
                    <div className="flex items-center gap-2 shrink-0">
                      {cmd.shortcut && (
                        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-white dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10 text-[10px] font-mono font-semibold text-slate-500 dark:text-[#9CA3AF] shadow-2xs">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#0F0F11] dark:text-[#0F0F11] bg-[#E08738] px-2.5 py-1 rounded-lg border border-[#E08738] shadow-2xs">
                          <span>Open</span>
                          <CornerDownLeft className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
                      )}
                    </div>
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* ======================================================== */}
        {/* CONSOLE FOOTER WITH ACTIVE DETAILS & KEYBINDINGS         */}
        {/* ======================================================== */}
        <footer className="px-5 py-3 bg-slate-50/90 dark:bg-[#111113] border-t border-slate-200/80 dark:border-white/7 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-[#9CA3AF]">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-white dark:bg-[#1C1C20] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                ↑
              </kbd>
              <kbd className="font-mono bg-white dark:bg-[#1C1C20] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                ↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-white dark:bg-[#1C1C20] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                ↵
              </kbd>
              <span>Select</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="font-mono bg-white dark:bg-[#1C1C20] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                Tab
              </kbd>
              <span>Switch Tabs</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="font-mono bg-white dark:bg-[#1C1C20] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                ESC
              </kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-amber-600 dark:text-[#E08738] font-bold">
            <span className="text-[10px] font-mono text-slate-400 dark:text-[#6B7280] font-normal">
              {filteredCommands.length} results
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              PulseConsole
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default CommandPalette;
