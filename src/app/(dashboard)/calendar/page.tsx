"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { postService, ScheduledPost } from "@/lib/services";
import { useToast } from "@/components/ui/toast";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Edit,
  Copy,
  Send,
  X,
  Share2,
  ListFilter,
} from "lucide-react";

export default function CalendarPage() {
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day" | "list">("month");
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  useEffect(() => {
    postService.getPosts().then((data) => setPosts(data));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevPeriod = () => {
    if (view === "month") setCurrentDate(new Date(year, month - 1, 1));
    else if (view === "week") setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    else setCurrentDate(new Date(currentDate.getTime() - 86400000));
  };

  const nextPeriod = () => {
    if (view === "month") setCurrentDate(new Date(year, month + 1, 1));
    else if (view === "week") setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    else setCurrentDate(new Date(currentDate.getTime() + 86400000));
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const getPostsForDay = (day: number) => {
    return posts.filter((p) => {
      const d = new Date(p.scheduledFor || p.createdAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const getPostsForDate = (date: Date) => {
    return posts.filter((p) => {
      const d = new Date(p.scheduledFor || p.createdAt);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });
  };

  const handleDeletePost = async (id: string) => {
    try {
      await postService.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setSelectedPost(null);
      toast({
        title: "Post Deleted",
        message: "The scheduled post was removed from the calendar.",
        type: "info",
      });
    } catch {
      toast({
        title: "Delete Failed",
        message: "Could not delete post.",
        type: "error",
      });
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header & Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Content Calendar
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Visualize scheduled content, campaigns, and cross-network publishing dates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher: Month, Week, Day, List */}
            <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
              {(["month", "week", "day", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 font-semibold capitalize rounded-lg transition cursor-pointer ${
                    view === v
                      ? "bg-[#5846A8] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <Link
              href="/compose"
              className="px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white text-xs font-semibold shadow-xs shadow-purple-900/15 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Post</span>
            </Link>
          </div>
        </div>

        {/* Date Navigator Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevPeriod}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white min-w-[140px] text-center">
              {view === "day"
                ? currentDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                : `${monthName} ${year}`}
            </h2>
            <button
              type="button"
              onClick={nextPeriod}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* ============================================================ */}
        {/* CALENDAR VIEWS: MONTH, WEEK, DAY, LIST                        */}
        {/* ============================================================ */}
        {view === "month" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center py-2 text-xs font-bold text-slate-500">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
              {/* Empty leading days */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-28 sm:h-32 bg-slate-50/30 dark:bg-slate-950/20 p-2" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dayPosts = getPostsForDay(day);
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                return (
                  <div
                    key={`day-${day}`}
                    className={`h-28 sm:h-32 p-2 flex flex-col justify-between transition hover:bg-[#f5f3ff]/40 ${
                      isToday ? "bg-[#f5f3ff]/60 dark:bg-purple-950/20" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? "bg-[#5846A8] text-white shadow-xs"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {day}
                      </span>
                    </div>

                    {/* Posts pills */}
                    <div className="space-y-1 overflow-y-auto max-h-20">
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className="px-2 py-1 rounded bg-[#f5f3ff] dark:bg-slate-800 hover:bg-[#ede9fe] dark:hover:bg-purple-900/60 border border-[#ede9fe] dark:border-purple-800/40 text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate cursor-pointer transition flex items-center gap-1"
                        >
                          {post.platforms.length > 0 && (
                            <span className="w-3.5 h-3.5 shrink-0">
                              {renderPlatformIcon(post.platforms[0], 14)}
                            </span>
                          )}
                          <span className="truncate">{post.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {view === "week" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center py-2.5 text-xs font-bold text-slate-500">
              {weekDays.map((d, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span>{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                  <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                    d.toDateString() === new Date().toDateString() ? "bg-[#5846A8] text-white" : "text-slate-700 dark:text-slate-300"
                  }`}>
                    {d.getDate()}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800 min-h-[380px]">
              {weekDays.map((d, i) => {
                const dayPosts = getPostsForDate(d);
                return (
                  <div key={i} className="p-3 space-y-2 hover:bg-[#f5f3ff]/20 transition">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="p-2 rounded-xl bg-[#f5f3ff] dark:bg-slate-800 hover:bg-[#ede9fe] border border-[#ede9fe] dark:border-purple-800/40 text-xs cursor-pointer transition shadow-2xs space-y-1"
                      >
                        <div className="flex items-center gap-1">
                          {post.platforms.map((p) => (
                            <span key={p} className="w-3.5 h-3.5 inline-block">
                              {renderPlatformIcon(p, 14)}
                            </span>
                          ))}
                        </div>
                        <p className="line-clamp-2 text-[11px] font-medium text-slate-800 dark:text-slate-200">{post.content}</p>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(post.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                    {dayPosts.length === 0 && (
                      <div className="h-full flex items-center justify-center text-[11px] text-slate-300 dark:text-slate-700 py-8">
                        No events
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DAY VIEW */}
        {view === "day" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Schedule for {currentDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </h3>

            {(() => {
              const dayPosts = getPostsForDate(currentDate);
              return dayPosts.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="py-3 px-3 hover:bg-[#f5f3ff]/40 rounded-xl transition flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1 mt-1">
                          {post.platforms.map((p) => (
                            <span key={p} className="w-4 h-4 inline-block">{renderPlatformIcon(p, 16)}</span>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{post.content}</p>
                          <span className="text-[11px] text-slate-400">
                            Time: {new Date(post.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-[#5846A8] dark:bg-purple-950/40 dark:text-purple-300">
                        {post.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No posts scheduled for this day.
                </div>
              );
            })()}
          </div>
        )}

        {view === "list" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="p-4 hover:bg-[#f5f3ff]/30 dark:hover:bg-slate-800/40 transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      {post.platforms.map((p) => (
                        <span key={p} className="w-4 h-4 inline-block">
                          {renderPlatformIcon(p, 16)}
                        </span>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {post.content}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(post.scheduledFor).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {post.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No scheduled posts found.
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* POST DETAILS DRAWER                                          */}
        {/* ============================================================ */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#5846A8]" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Scheduled Post Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPost(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Platforms target badges */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Publishing Target Channels:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {selectedPost.platforms.map((p) => (
                      <span
                        key={p}
                        className="px-2.5 py-1 rounded-full bg-[#f5f3ff] dark:bg-slate-800 text-xs font-medium text-[#5846A8] dark:text-purple-300 flex items-center gap-1 border border-[#ede9fe] dark:border-purple-800/40"
                      >
                        {renderPlatformIcon(p, 14)}
                        <span className="capitalize">{p}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content text */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Post Copy:
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.content}
                  </div>
                </div>

                {/* Scheduled time */}
                <div className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5846A8]" />
                  <span>
                    Scheduled for: {new Date(selectedPost.scheduledFor).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem("pulse_draft", selectedPost.content);
                    window.location.href = "/compose";
                  }}
                  className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white flex items-center justify-center gap-1.5 shadow-xs shadow-purple-900/15 transition cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit in Composer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeletePost(selectedPost.id)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Scheduled Post</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
