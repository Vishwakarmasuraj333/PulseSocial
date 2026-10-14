"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Bell, CheckCheck, Clock, Share2, AlertCircle, MessageSquare, AtSign, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: string;
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      }
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        toast({
          title: "All Caught Up",
          message: "All notifications marked as read.",
          type: "success",
        });
      }
    } catch {
      toast({
        title: "Action Failed",
        message: "Could not update notifications.",
        type: "error",
      });
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "post_published":
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      case "post_failed":
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case "account_connected":
        return <Share2 className="w-4 h-4 text-indigo-500" />;
      case "comment":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "mention":
        return <AtSign className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Notifications
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time activity telemetry across publishing, comments, and connected channels
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-purple-600" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeFilter === "unread"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/40 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No notifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {activeFilter === "unread"
                ? "You're all caught up with your notifications."
                : "Publishing activity, mentions, and channel updates will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.read && handleMarkRead(item.id)}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-3 cursor-pointer ${
                  !item.read
                    ? "bg-purple-50/40 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-800/40"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                  </div>
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
