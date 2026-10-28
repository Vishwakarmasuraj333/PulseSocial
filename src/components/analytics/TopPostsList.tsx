"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Eye, X, MessageSquare, Plus, FileText, Sparkles } from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";

export interface TopPostItem {
  id: string;
  platform: string;
  platformLabel: string;
  caption: string;
  fullContent: string;
  publishedAt: string;
  likes: string;
  reach: string;
  rate: string;
  comments?: string;
  thumbnailUrl?: string;
}

interface TopPostsListProps {
  posts?: TopPostItem[];
  isLoading?: boolean;
}

export function TopPostsList({ posts = [], isLoading = false }: TopPostsListProps) {
  const [selectedPost, setSelectedPost] = useState<TopPostItem | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.42, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/7 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#E08738]/30 transition-all flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E08738]" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Top Performing Posts
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 dark:text-[#9CA3AF]">
          {posts.length > 0 ? "Ranked by Engagement" : "Live Ranking"}
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center">
            <FileText className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              No Published Posts Yet
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">
              Publish content to your connected accounts from Posts & Queue. Your top-performing posts and reactions will rank here in real time.
            </p>
          </div>
          <Link
            href="/posts"
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/7 bg-slate-50/60 dark:bg-[#141416] hover:bg-white dark:hover:bg-[#1C1C20] hover:border-[#E08738]/40 dark:hover:border-[#E08738]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              {/* Media preview or placeholder */}
              <div className="relative w-full h-24 rounded-xl bg-slate-200/80 dark:bg-[#1C1C20] flex items-center justify-center overflow-hidden">
                {post.thumbnailUrl ? (
                  <img
                    src={post.thumbnailUrl}
                    alt="Post preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full p-2.5 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-3 bg-slate-100 dark:bg-white/5">
                    {post.fullContent}
                  </div>
                )}

                {/* Platform badge on top right */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center gap-1 text-[10px] font-bold text-slate-800 dark:text-slate-200 z-20 shadow-2xs">
                  {renderPlatformIcon(post.platform, 12)}
                  <span>{post.platform === "twitter" ? "X" : post.platformLabel}</span>
                </div>
              </div>

              {/* Post Caption */}
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                  {post.caption}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1 font-medium">
                  {post.publishedAt}
                </span>
              </div>

              {/* Metrics Chips */}
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-800 text-slate-500 font-mono">
                <span className="flex items-center gap-1 font-bold text-rose-500">
                  <Heart className="w-3 h-3 fill-rose-500" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-400" />
                  {post.reach}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {post.rate}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expand Drawer / Modal for Post Details */}
      <AnimatePresence>
        {selectedPost && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setSelectedPost(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {renderPlatformIcon(selectedPost.platform, 18)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedPost.platformLabel} Post
                    </h4>
                    <p className="text-[10px] text-slate-400">{selectedPost.publishedAt}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedPost.thumbnailUrl && (
                <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={selectedPost.thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                {selectedPost.fullContent}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Likes</p>
                  <p className="text-base font-bold text-rose-500 font-mono mt-0.5">
                    {selectedPost.likes}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Reach</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {selectedPost.reach}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Comments</p>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {selectedPost.comments || "0"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TopPostsList;
