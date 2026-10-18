"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  FacebookIcon,
  XIcon,
  LinkedInIcon,
  InstagramIcon,
  ThreadsIcon,
  YouTubeIcon,
} from "@/components/icons/PlatformIcons";
import {
  Cpu,
  Plus,
  Clock,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
  Rss,
  ShieldAlert,
  Repeat,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Sliders,
  TrendingUp,
  Settings2,
  Filter,
  Check,
  ChevronRight,
  RefreshCw,
  BellRing,
} from "lucide-react";

interface QueueSlot {
  id: string;
  name: string;
  category: "Growth & Viral" | "Product Announcement" | "Thought Leadership" | "Community & Weekend";
  time: string;
  timezone: string;
  days: string[];
  platforms: string[];
  status: "ACTIVE" | "PAUSED";
  isPeakWindow: boolean;
  queuedCount: number;
}

interface RssFeed {
  id: string;
  name: string;
  url: string;
  platforms: string[];
  status: "ACTIVE" | "PAUSED";
  lastFetched: string;
  autoPublish: boolean;
}

export default function AutomationPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"queues" | "evergreen" | "rss" | "moderation">("queues");

  // Queue Slots State
  const [queues, setQueues] = useState<QueueSlot[]>([
    {
      id: "q-1",
      name: "Morning Peak Distribution",
      category: "Growth & Viral",
      time: "09:00 AM",
      timezone: "Asia/Kolkata",
      days: ["Mon", "Wed", "Fri"],
      platforms: ["linkedin", "x", "instagram"],
      status: "ACTIVE",
      isPeakWindow: true,
      queuedCount: 6,
    },
    {
      id: "q-2",
      name: "Mid-Day Industry News & Insights",
      category: "Thought Leadership",
      time: "02:30 PM",
      timezone: "Asia/Kolkata",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      platforms: ["linkedin", "threads", "x"],
      status: "ACTIVE",
      isPeakWindow: true,
      queuedCount: 4,
    },
    {
      id: "q-3",
      name: "Evening Community Spotlight",
      category: "Community & Weekend",
      time: "07:15 PM",
      timezone: "Asia/Kolkata",
      days: ["Everyday"],
      platforms: ["instagram", "facebook"],
      status: "ACTIVE",
      isPeakWindow: false,
      queuedCount: 3,
    },
    {
      id: "q-4",
      name: "Weekend Special Feature",
      category: "Product Announcement",
      time: "11:00 AM",
      timezone: "Asia/Kolkata",
      days: ["Sat", "Sun"],
      platforms: ["instagram", "youtube", "facebook"],
      status: "PAUSED",
      isPeakWindow: false,
      queuedCount: 0,
    },
  ]);

  // RSS Feeds State
  const [rssFeeds, setRssFeeds] = useState<RssFeed[]>([
    {
      id: "rss-1",
      name: "Company Blog & Engineering Updates",
      url: "https://pulsesocial.io/blog/rss.xml",
      platforms: ["linkedin", "x"],
      status: "ACTIVE",
      lastFetched: "12 mins ago",
      autoPublish: true,
    },
    {
      id: "rss-2",
      name: "Industry Trends & Product Releases",
      url: "https://techcrunch.com/feed/",
      platforms: ["x", "threads"],
      status: "PAUSED",
      lastFetched: "3 hours ago",
      autoPublish: false,
    },
  ]);

  // Evergreen Config State
  const [evergreenEnabled, setEvergreenEnabled] = useState(true);
  const [minLikesThreshold, setMinLikesThreshold] = useState("250");
  const [recycleIntervalDays, setRecycleIntervalDays] = useState("45");

  // Moderation Rules State
  const [spamFilterEnabled, setSpamFilterEnabled] = useState(true);
  const [autoWelcomeDm, setAutoWelcomeDm] = useState(true);
  const [profanityShield, setProfanityShield] = useState(true);

  // Modal States
  const [isCreateQueueOpen, setIsCreateQueueOpen] = useState(false);
  const [isAddRssOpen, setIsAddRssOpen] = useState(false);
  const [isTriggeringSlot, setIsTriggeringSlot] = useState<string | null>(null);

  // New Queue Form State
  const [newQueueName, setNewQueueName] = useState("");
  const [newQueueTime, setNewQueueTime] = useState("10:00 AM");
  const [newQueueCategory, setNewQueueCategory] = useState<QueueSlot["category"]>("Growth & Viral");
  const [newQueueDays, setNewQueueDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
  const [newQueuePlatforms, setNewQueuePlatforms] = useState<string[]>(["linkedin", "x"]);

  // New RSS Form State
  const [newRssName, setNewRssName] = useState("");
  const [newRssUrl, setNewRssUrl] = useState("");
  const [newRssAutoPublish, setNewRssAutoPublish] = useState(true);

  // Helper for platform icon render
  const renderPlatformIcon = (platform: string, size = 18) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <FacebookIcon size={size} />;
      case "x":
      case "twitter":
        return <XIcon size={size} />;
      case "linkedin":
        return <LinkedInIcon size={size} />;
      case "instagram":
        return <InstagramIcon size={size} />;
      case "threads":
        return <ThreadsIcon size={size} />;
      case "youtube":
        return <YouTubeIcon size={size} />;
      default:
        return <Zap className="w-4 h-4 text-indigo-500" />;
    }
  };

  // Toggle Queue Status
  const toggleQueueStatus = (id: string) => {
    setQueues((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const nextStatus = q.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
          toast({
            title: `Queue Slot ${nextStatus === "ACTIVE" ? "Resumed" : "Paused"}`,
            message: `"${q.name}" is now ${nextStatus.toLowerCase()}.`,
            type: nextStatus === "ACTIVE" ? "success" : "info",
          });
          return { ...q, status: nextStatus };
        }
        return q;
      })
    );
  };

  // Delete Queue Slot
  const deleteQueue = (id: string, name: string) => {
    setQueues((prev) => prev.filter((q) => q.id !== id));
    toast({
      title: "Queue Slot Removed",
      message: `"${name}" has been deleted from your automation schedule.`,
      type: "info",
    });
  };

  // Run Test Trigger
  const triggerTestQueue = (q: QueueSlot) => {
    setIsTriggeringSlot(q.id);
    setTimeout(() => {
      setIsTriggeringSlot(null);
      toast({
        title: "Automation Triggered Successfully",
        message: `Dispatched test payload for "${q.name}" across ${q.platforms.length} connected channels.`,
        type: "success",
      });
    }, 1200);
  };

  // Handle Create Queue Slot Submit
  const handleCreateQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueueName.trim()) {
      toast({
        title: "Slot Name Required",
        message: "Please provide a descriptive name for your queue slot.",
        type: "warning",
      });
      return;
    }

    const created: QueueSlot = {
      id: `q-${Date.now()}`,
      name: newQueueName.trim(),
      category: newQueueCategory,
      time: newQueueTime,
      timezone: "Asia/Kolkata",
      days: newQueueDays.length > 0 ? newQueueDays : ["Mon", "Wed", "Fri"],
      platforms: newQueuePlatforms.length > 0 ? newQueuePlatforms : ["linkedin"],
      status: "ACTIVE",
      isPeakWindow: true,
      queuedCount: 0,
    };

    setQueues((prev) => [created, ...prev]);
    setIsCreateQueueOpen(false);
    setNewQueueName("");
    toast({
      title: "Queue Slot Created!",
      message: `"${created.name}" is now live in your publishing engine.`,
      type: "success",
    });
  };

  // Handle Add RSS Feed Submit
  const handleAddRss = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRssName.trim() || !newRssUrl.trim()) {
      toast({
        title: "Required Fields Missing",
        message: "Please enter both feed name and valid RSS feed URL.",
        type: "warning",
      });
      return;
    }

    const created: RssFeed = {
      id: `rss-${Date.now()}`,
      name: newRssName.trim(),
      url: newRssUrl.trim(),
      platforms: ["linkedin", "x"],
      status: "ACTIVE",
      lastFetched: "Just now",
      autoPublish: newRssAutoPublish,
    };

    setRssFeeds((prev) => [created, ...prev]);
    setIsAddRssOpen(false);
    setNewRssName("");
    setNewRssUrl("");
    toast({
      title: "RSS Feed Connected!",
      message: `Subscribed to "${created.name}". Articles will auto-populate your queue.`,
      type: "success",
    });
  };

  const totalActiveSlots = queues.filter((q) => q.status === "ACTIVE").length;
  const totalQueuedPosts = queues.reduce((acc, q) => acc + q.queuedCount, 0);

  return (
    <AppLayout>
      <div className="bg-slate-50 dark:bg-[#0D0D0E] min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-800 dark:text-[#9CA3AF]">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 dark:border-white/7 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#5846A8] dark:bg-[#E08738] flex items-center justify-center text-white dark:text-[#0F0F11] shadow-xs">
                <Cpu className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Automation &amp; Publishing Queues
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] mt-0.5">
                  Automate schedule windows, evergreen content recycling, and live RSS syndication.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === "rss" ? (
              <Button
                onClick={() => setIsAddRssOpen(true)}
                className="h-9 px-4 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] text-xs font-bold shadow-xs hover:shadow-purple-500/20 dark:hover:shadow-[0_0_16px_rgba(224,135,56,0.35)] transition cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" /> Connect RSS Feed
              </Button>
            ) : (
              <Button
                onClick={() => setIsCreateQueueOpen(true)}
                className="h-9 px-4 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] text-xs font-bold shadow-xs hover:shadow-purple-500/20 dark:hover:shadow-[0_0_16px_rgba(224,135,56,0.35)] transition cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" /> Create Queue Slot
              </Button>
            )}
          </div>
        </div>

        {/* Top KPI Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9CA3AF]">Active Queue Slots</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[#5846A8] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{totalActiveSlots}</span>
              <span className="text-xs font-medium text-[#5846A8] dark:text-[#FBBF24]">of {queues.length} enabled</span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9CA3AF]">Queued Posts</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[#5846A8] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{totalQueuedPosts}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF]">scheduled this week</span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9CA3AF]">Active RSS Feeds</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[#5846A8] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
                <Rss className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{rssFeeds.length}</span>
              <span className="text-xs font-medium text-[#5846A8] dark:text-[#FBBF24]">auto-curating</span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9CA3AF]">Time Saved / Week</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[#5846A8] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">14.5 hrs</span>
              <span className="text-xs font-medium text-[#5846A8] dark:text-[#FBBF24]">automated</span>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-200/90 dark:border-white/7 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("queues")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "queues"
                ? "bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] shadow-xs"
                : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Queue Schedules ({queues.length})
          </button>

          <button
            onClick={() => setActiveTab("evergreen")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "evergreen"
                ? "bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] shadow-xs"
                : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Repeat className="w-3.5 h-3.5" /> Evergreen Recycling
          </button>

          <button
            onClick={() => setActiveTab("rss")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "rss"
                ? "bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] shadow-xs"
                : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Rss className="w-3.5 h-3.5" /> RSS Syndication ({rssFeeds.length})
          </button>

          <button
            onClick={() => setActiveTab("moderation")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "moderation"
                ? "bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] shadow-xs"
                : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Smart Moderation Rules
          </button>
        </div>

        {/* TAB 1: Queue Schedules */}
        {activeTab === "queues" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queues.map((q) => {
                const isActive = q.status === "ACTIVE";
                return (
                  <Card
                    key={q.id}
                    className={`p-5 rounded-2xl transition border shadow-xs ${
                      isActive
                        ? "bg-white dark:bg-[#17171A] border-slate-200/90 dark:border-white/7 hover:border-purple-300 dark:hover:border-[#E08738]/50"
                        : "bg-slate-50/60 dark:bg-[#17171A]/50 border-slate-200/60 dark:border-white/5 opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {q.name}
                          </h3>
                          {q.isPeakWindow && (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-[#FBBF24] border-amber-200 dark:border-amber-500/30 text-[10px] font-semibold py-0 px-2 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5 fill-amber-500" /> Peak Window
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-[#9CA3AF]">
                          {q.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleQueueStatus(q.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isActive
                              ? "bg-purple-50 text-[#5846A8] hover:bg-purple-100 border border-purple-200 dark:bg-amber-500/15 dark:text-[#FBBF24] dark:border-amber-500/30"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 dark:bg-white/5 dark:text-[#9CA3AF] dark:border-white/10"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Play className="w-3 h-3 fill-[#5846A8] dark:fill-[#FBBF24]" /> Active
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 fill-slate-500" /> Paused
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => deleteQueue(q.id, q.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                          title="Delete Queue Slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/7 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-[#6B7280] block font-medium">Publishing Time</span>
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-semibold mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#E08738]" /> {q.time}
                          <span className="text-[10px] text-slate-400 dark:text-[#6B7280] font-normal">({q.timezone.split("/")[1]})</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-[#6B7280] block font-medium">Active Days</span>
                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                          {q.days.map((d) => (
                            <span
                              key={d}
                              className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-[#9CA3AF] rounded text-[10px] font-medium"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/7 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 dark:text-[#6B7280] mr-1 font-medium">Channels:</span>
                        <div className="flex items-center gap-1">
                          {q.platforms.map((p) => (
                            <div
                              key={p}
                              className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center p-0.5"
                              title={p}
                            >
                              {renderPlatformIcon(p, 14)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-[#9CA3AF] font-medium">
                          {q.queuedCount} posts in queue
                        </span>
                        <button
                          onClick={() => triggerTestQueue(q)}
                          disabled={isTriggeringSlot === q.id}
                          className="px-2 py-1 text-[11px] font-semibold text-[#5846A8] hover:text-[#48388d] hover:bg-purple-50 dark:text-[#FBBF24] dark:hover:text-[#F59E0B] dark:hover:bg-amber-500/10 rounded transition flex items-center gap-1"
                        >
                          {isTriggeringSlot === q.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" /> Testing...
                            </>
                          ) : (
                            <>
                              <Play className="w-2.5 h-2.5" /> Test Trigger
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Evergreen Recycling */}
        {activeTab === "evergreen" && (
          <Card className="p-6 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 space-y-6 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-[#5846A8] dark:text-[#E08738]" /> Evergreen Post Recycling Engine
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1 max-w-2xl leading-relaxed">
                  Automatically resurface top-performing social posts after a custom cool-off period. The system rotates hooks and emojis to maintain fresh organic engagement without looking repetitive.
                </p>
              </div>

              <button
                onClick={() => {
                  const nextState = !evergreenEnabled;
                  setEvergreenEnabled(nextState);
                  toast({
                    title: `Evergreen Recycling ${nextState ? "Enabled" : "Disabled"}`,
                    message: nextState
                      ? "High-performing posts will be recycled into empty queue slots."
                      : "Evergreen auto-resurfacing is paused.",
                    type: nextState ? "success" : "info",
                  });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  evergreenEnabled
                    ? "bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] shadow-xs"
                    : "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-[#9CA3AF]"
                }`}
              >
                {evergreenEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/7 bg-slate-50/50 dark:bg-[#111113] space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-white">
                  Minimum Engagement Trigger
                </span>
                <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF]">
                  Only recycle posts that reached this engagement threshold.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minLikesThreshold}
                    onChange={(e) => setMinLikesThreshold(e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold bg-white dark:bg-[#1C1C20] dark:text-white"
                  />
                  <span className="text-xs text-slate-500 dark:text-[#9CA3AF]">likes / reactions</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/7 bg-slate-50/50 dark:bg-[#111113] space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-white">
                  Recycle Cool-off Window
                </span>
                <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF]">
                  Wait interval before a post becomes eligible for re-queuing.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={recycleIntervalDays}
                    onChange={(e) => setRecycleIntervalDays(e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold bg-white dark:bg-[#1C1C20] dark:text-white"
                  />
                  <span className="text-xs text-slate-500 dark:text-[#9CA3AF]">days between reposts</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/7 bg-slate-50/50 dark:bg-[#111113] space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-white">
                  AI Caption Variation
                </span>
                <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF]">
                  Rewrites opening hook using AI to test fresh creative angles.
                </p>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-amber-500/15 dark:text-[#FBBF24] border border-purple-200 dark:border-amber-500/30 font-semibold text-xs py-1 px-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active (Gemini AI Variation)
                </Badge>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() =>
                  toast({
                    title: "Settings Saved",
                    message: "Evergreen recycling preferences updated successfully.",
                    type: "success",
                  })
                }
                className="bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] font-bold rounded-xl text-xs shadow-xs"
              >
                Save Evergreen Rules
              </Button>
            </div>
          </Card>
        )}

        {/* TAB 3: RSS Feeds */}
        {activeTab === "rss" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rssFeeds.map((feed) => (
                <Card
                  key={feed.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[#5846A8] dark:text-[#FBBF24] flex items-center justify-center">
                        <Rss className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {feed.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 dark:text-[#9CA3AF] font-mono truncate max-w-xs block">
                          {feed.url}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={feed.status === "ACTIVE" ? "success" : "secondary"}
                      className="text-[10px] dark:bg-white/10 dark:text-white"
                    >
                      {feed.status}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/7 text-xs flex items-center justify-between text-slate-500 dark:text-[#9CA3AF]">
                    <span>Last checked: {feed.lastFetched}</span>
                    <div className="flex items-center gap-1">
                      {feed.platforms.map((p) => (
                        <div key={p} className="w-5 h-5 flex items-center justify-center">
                          {renderPlatformIcon(p, 14)}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Smart Moderation */}
        {activeTab === "moderation" && (
          <Card className="p-6 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 space-y-5 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#5846A8] dark:text-[#E08738]" /> Inbound Community Moderation &amp; Triggers
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1 leading-relaxed">
                Keep comments and direct messages healthy across all connected social channels automatically.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/7 bg-slate-50/50 dark:bg-[#111113]">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Auto-Hide Link Spam &amp; Promo Bots
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF]">
                    Instantly hide unauthorized crypto, gambling, and promotional URLs in comments.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={spamFilterEnabled}
                  onChange={(e) => setSpamFilterEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#5846A8] dark:accent-[#E08738] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/7 bg-slate-50/50 dark:bg-[#111113]">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Brand Safety &amp; Profanity Shield
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF]">
                    Flag or hide toxic, offensive, or derogatory comments before public viewing.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profanityShield}
                  onChange={(e) => setProfanityShield(e.target.checked)}
                  className="w-4 h-4 accent-[#5846A8] dark:accent-[#E08738] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/7 bg-slate-50/50 dark:bg-[#111113]">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Instant Auto-Responder to New DMs
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-[#9CA3AF]">
                    Send greeting and route support questions to active team members.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoWelcomeDm}
                  onChange={(e) => setAutoWelcomeDm(e.target.checked)}
                  className="w-4 h-4 accent-[#5846A8] dark:accent-[#E08738] rounded cursor-pointer"
                />
              </div>
            </div>
          </Card>
        )}

        {/* MODAL 1: Create Queue Slot */}
        <Dialog
          isOpen={isCreateQueueOpen}
          onClose={() => setIsCreateQueueOpen(false)}
          title="Create New Publishing Queue Slot"
          description="Define a recurring automated schedule window for your social accounts."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateQueue} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Queue Slot Title
              </label>
              <input
                type="text"
                required
                value={newQueueName}
                onChange={(e) => setNewQueueName(e.target.value)}
                placeholder="e.g. Afternoon High Engagement Reel Slot"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] dark:text-white text-xs focus:outline-none focus:border-[#5846A8] dark:focus:border-[#E08738]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Time
                </label>
                <input
                  type="text"
                  value={newQueueTime}
                  onChange={(e) => setNewQueueTime(e.target.value)}
                  placeholder="03:30 PM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] dark:text-white text-xs font-semibold focus:outline-none focus:border-[#5846A8] dark:focus:border-[#E08738]"
                />
              </div>

              <div>
                <label htmlFor="queue-category-select" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Type
                </label>
                <select
                  id="queue-category-select"
                  aria-label="Category Type"
                  value={newQueueCategory}
                  onChange={(e) => setNewQueueCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] dark:text-white text-xs focus:outline-none focus:border-[#5846A8] dark:focus:border-[#E08738]"
                >
                  <option value="Growth &amp; Viral">Growth &amp; Viral</option>
                  <option value="Thought Leadership">Thought Leadership</option>
                  <option value="Product Announcement">Product Announcement</option>
                  <option value="Community &amp; Weekend">Community &amp; Weekend</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Active Days
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  const isSelected = newQueueDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setNewQueueDays(newQueueDays.filter((d) => d !== day));
                        } else {
                          setNewQueueDays([...newQueueDays, day]);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] shadow-2xs font-bold"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-200 dark:hover:bg-white/10"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Channels
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: "linkedin", name: "LinkedIn" },
                  { id: "x", name: "X (Twitter)" },
                  { id: "instagram", name: "Instagram" },
                  { id: "facebook", name: "Facebook" },
                  { id: "threads", name: "Threads" },
                ].map((plat) => {
                  const isChecked = newQueuePlatforms.includes(plat.id);
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setNewQueuePlatforms(newQueuePlatforms.filter((p) => p !== plat.id));
                        } else {
                          setNewQueuePlatforms([...newQueuePlatforms, plat.id]);
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        isChecked
                          ? "border-[#5846A8] bg-purple-50 text-[#5846A8] dark:border-[#E08738] dark:bg-amber-500/15 dark:text-[#FBBF24]"
                          : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      {renderPlatformIcon(plat.id, 14)} {plat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateQueueOpen(false)}
                className="text-xs dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] text-xs font-bold shadow-xs">
                Save &amp; Activate Slot
              </Button>
            </div>
          </form>
        </Dialog>

        {/* MODAL 2: Add RSS Feed */}
        <Dialog
          isOpen={isAddRssOpen}
          onClose={() => setIsAddRssOpen(false)}
          title="Connect RSS Feed for Auto-Publishing"
          description="Syndicate new blog articles, podcasts, or YouTube videos to your social queue automatically."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleAddRss} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Feed Title
              </label>
              <input
                type="text"
                required
                value={newRssName}
                onChange={(e) => setNewRssName(e.target.value)}
                placeholder="e.g. Official Engineering Blog"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] dark:text-white text-xs focus:outline-none focus:border-[#5846A8] dark:focus:border-[#E08738]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                RSS / XML URL
              </label>
              <input
                type="url"
                required
                value={newRssUrl}
                onChange={(e) => setNewRssUrl(e.target.value)}
                placeholder="https://example.com/feed.xml"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] dark:text-white text-xs font-mono focus:outline-none focus:border-[#5846A8] dark:focus:border-[#E08738]"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-[#111113] border border-slate-200/60 dark:border-white/7 rounded-xl">
              <input
                type="checkbox"
                id="rss-auto"
                checked={newRssAutoPublish}
                onChange={(e) => setNewRssAutoPublish(e.target.checked)}
                className="w-4 h-4 accent-[#5846A8] dark:accent-[#E08738] rounded"
              />
              <label htmlFor="rss-auto" className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                Auto-publish directly to active queue slots (otherwise saves as drafts)
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddRssOpen(false)}
                className="text-xs dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] text-xs font-bold shadow-xs">
                Subscribe Feed
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppLayout>
  );
}
