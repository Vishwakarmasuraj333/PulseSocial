"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import {
  X,
  Plus,
  Search,
  Star,
  Flag,
  AtSign,
  MessageSquare,
  ThumbsUp,
  RefreshCw,
  ExternalLink,
  MoreVertical,
  Filter,
} from "lucide-react";

interface StreamColumn {
  id: string;
  type: "mentions" | "reviews" | "page_search";
  title: string;
  platform: string;
  items: Array<{
    id: string;
    author: string;
    authorHandle: string;
    avatarUrl?: string;
    content: string;
    time: string;
    likes?: number;
    rating?: number;
  }>;
}

export default function MonitorPage() {
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  const [columns, setColumns] = useState<StreamColumn[]>([]);
  const [isColumnTypeModalOpen, setIsColumnTypeModalOpen] = useState(true);
  const [activePlatform, setActivePlatform] = useState<string>("facebook");
  const [connectedChannels, setConnectedChannels] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/social/accounts")
      .then((r) => r.json())
      .then((d) => {
        if (d.accounts && d.accounts.length > 0) {
          setConnectedChannels(d.accounts);
          setActivePlatform(d.accounts[0].provider || "facebook");
        }
      })
      .catch(() => {});
  }, []);

  const handleAddColumn = (type: "mentions" | "reviews" | "page_search") => {
    let title = "Mentions";
    let sampleItems: any[] = [];

    if (type === "mentions") {
      title = `@ Mentions`;
      sampleItems = [
        {
          id: "m-1",
          author: "Digital Growth Lab",
          authorHandle: "@growthlab",
          content: `Checking out the new platform workflow. Really excited to collaborate with ${activeBrand?.name || "the brand"}!`,
          time: "10 mins ago",
          likes: 4,
        },
      ];
    } else if (type === "reviews") {
      title = `⭐ Reviews`;
      sampleItems = [
        {
          id: "r-1",
          author: "Ananya Rao",
          authorHandle: "@ananyarao",
          content: "Prompt response and great customer assistance! 5/5 experience.",
          time: "1 hour ago",
          rating: 5,
        },
      ];
    } else if (type === "page_search") {
      title = `🚩 Page Search`;
      sampleItems = [
        {
          id: "s-1",
          author: "Tech Insights",
          authorHandle: "@techinsights",
          content: `Discovering active discussions and industry trends around ${activeBrand?.name || "our products"}.`,
          time: "3 hours ago",
          likes: 12,
        },
      ];
    }

    const newCol: StreamColumn = {
      id: `col-${Date.now()}`,
      type,
      title,
      platform: activePlatform,
      items: sampleItems,
    };

    setColumns((prev) => [...prev, newCol]);
    setIsColumnTypeModalOpen(false);
    toast({
      title: "Column Added",
      message: `${title} column added to your live monitoring dashboard.`,
      type: "success",
    });
  };

  const handleRemoveColumn = (id: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AppLayout>
      <div className="bg-slate-50 dark:bg-[#0D0D0E] min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 flex flex-col font-sans relative max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-[#9CA3AF]">
        
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Monitor
            </h1>
            <span className="text-xs text-slate-500 dark:text-[#6B7280] font-normal hidden sm:inline">
              Track live mentions, page reviews, and keyword streams in real-time
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsColumnTypeModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] dark:bg-[#E08738] dark:hover:bg-[#D97706] text-white dark:text-[#0F0F11] text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Column</span>
          </button>
        </div>

        {/* Stream Columns Area */}
        {columns.length > 0 ? (
          <div className="flex-1 flex gap-5 overflow-x-auto pb-4 items-start">
            {columns.map((col) => (
              <div
                key={col.id}
                className="w-80 sm:w-88 shrink-0 bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 rounded-2xl shadow-xs overflow-hidden flex flex-col max-h-[calc(100vh-180px)]"
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/7 flex items-center justify-between bg-slate-50/60 dark:bg-[#111113]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
                      {renderPlatformIcon(col.platform, 18)}
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {col.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(col.id)}
                      className="p-1 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      title="Remove column"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column Items */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {col.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-white/7 bg-white dark:bg-[#111113] shadow-2xs space-y-2 hover:border-slate-300 dark:hover:border-white/15 transition"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-white">
                            {item.author.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block leading-tight">
                              {item.author}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-[#6B7280] font-mono">
                              {item.authorHandle}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-[#6B7280]">{item.time}</span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-[#9CA3AF] leading-relaxed">
                        {item.content}
                      </p>

                      {item.rating && (
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                        </div>
                      )}

                      {item.likes !== undefined && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-[#6B7280] pt-1">
                          <ThumbsUp className="w-3 h-3 text-[#5846A8] dark:text-[#FBBF24]" />
                          <span>{item.likes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty background prompt */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#17171A]">
            <p className="text-base text-slate-600 dark:text-[#9CA3AF] font-medium">
              Keep adding more columns to monitor the contents of your brand.
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: "Select a column type"                                */}
        {/* ============================================================ */}
        {isColumnTypeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white dark:bg-[#17171A] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden text-slate-900 dark:text-white animate-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Select a column type
                </h3>
                <button
                  type="button"
                  onClick={() => setIsColumnTypeModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-label: Platform identifier */}
              <div className="px-6 pb-3">
                <span className="text-[11px] font-bold text-slate-400 dark:text-[#6B7280] uppercase tracking-wider">
                  {activePlatform.toUpperCase()} PAGE
                </span>
              </div>

              {/* Options List */}
              <div className="px-6 pb-6 space-y-3">
                
                {/* 1. Mentions */}
                <button
                  type="button"
                  onClick={() => handleAddColumn("mentions")}
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 dark:border-white/7 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/70 dark:hover:bg-white/5 transition cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-amber-500/15 border border-[#FFEDD5] dark:border-amber-500/30 flex items-center justify-center text-[#EA580C] dark:text-[#FBBF24] shrink-0 group-hover:scale-105 transition-transform">
                    <AtSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white block">
                      Mentions
                    </span>
                    <span className="text-xs text-slate-500 dark:text-[#9CA3AF]">
                      Track public mentions and customer tags
                    </span>
                  </div>
                </button>

                {/* 2. Reviews */}
                <button
                  type="button"
                  onClick={() => handleAddColumn("reviews")}
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 dark:border-white/7 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/70 dark:hover:bg-white/5 transition cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] dark:bg-purple-500/15 border border-[#DDD6FE] dark:border-purple-500/30 flex items-center justify-center text-[#7C3AED] dark:text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white block">
                      Reviews
                    </span>
                    <span className="text-xs text-slate-500 dark:text-[#9CA3AF]">
                      Monitor customer recommendations and ratings
                    </span>
                  </div>
                </button>

                {/* 3. Page Search */}
                <button
                  type="button"
                  onClick={() => handleAddColumn("page_search")}
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 dark:border-white/7 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/70 dark:hover:bg-white/5 transition cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F4F0FC] dark:bg-amber-500/15 border border-[#DDD3F4] dark:border-amber-500/30 flex items-center justify-center text-[#6F52B5] dark:text-[#FBBF24] shrink-0 group-hover:scale-105 transition-transform">
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white block">
                      Page Search
                    </span>
                    <span className="text-xs text-slate-500 dark:text-[#9CA3AF]">
                      Search keyword occurrences across page posts
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
