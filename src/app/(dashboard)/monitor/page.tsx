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
      <div className="bg-[#f2f5f8] dark:bg-slate-950 min-h-[calc(100vh-60px)] p-4 sm:p-6 flex flex-col font-sans relative">
        
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Monitor
            </h1>
            <span className="text-xs text-slate-500 font-normal hidden sm:inline">
              Track live mentions, page reviews, and keyword streams in real-time
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsColumnTypeModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
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
                className="w-80 sm:w-88 shrink-0 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden flex flex-col max-h-[calc(100vh-160px)]"
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-850">
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
                      className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {item.author.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block leading-tight">
                              {item.author}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.authorHandle}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
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
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                          <ThumbsUp className="w-3 h-3 text-blue-600" />
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
          /* Empty background prompt matching screenshot 2 */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
            <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
              Keep adding more columns to monitor the contents of your brand.
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: "Select a column type" (Exact Match to Screenshot 2)   */}
        {/* ============================================================ */}
        {isColumnTypeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Select a column type
                </h3>
                <button
                  type="button"
                  onClick={() => setIsColumnTypeModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-label: Platform identifier */}
              <div className="px-6 pb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {activePlatform.toUpperCase()} PAGE
                </span>
              </div>

              {/* Options List Matching Screenshot 2 */}
              <div className="px-6 pb-6 space-y-3">
                
                {/* 1. Mentions */}
                <button
                  type="button"
                  onClick={() => handleAddColumn("mentions")}
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shrink-0 group-hover:scale-105 transition-transform">
                    <AtSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">
                      Mentions
                    </span>
                    <span className="text-xs text-slate-500">
                      Track public mentions and customer tags
                    </span>
                  </div>
                </button>

                {/* 2. Reviews */}
                <button
                  type="button"
                  onClick={() => handleAddColumn("reviews")}
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] shrink-0 group-hover:scale-105 transition-transform">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">
                      Reviews
                    </span>
                    <span className="text-xs text-slate-500">
                      Monitor customer recommendations and ratings
                    </span>
                  </div>
                </button>

                {/* 3. Page Search */}
                <button
                  type="button"
                  onClick={() => handleAddColumn("page_search")}
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] shrink-0 group-hover:scale-105 transition-transform">
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">
                      Page Search
                    </span>
                    <span className="text-xs text-slate-500">
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
