"use client";

import React from "react";
import Image from "next/image";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useRouter } from "next/navigation";

interface ContentLeaderboardTableProps {
  posts: any[];
  onOpenComposer: () => void;
}

export function ContentLeaderboardTable({
  posts,
  onOpenComposer,
}: ContentLeaderboardTableProps) {
  const router = useRouter();

  const displayPosts = posts || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Content Performance Leaderboard
            </h3>
            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full">
              Top Ranked Posts
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked by engagement velocity, viral reach, and audience sentiment
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/posts")}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <span>View All Posts</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-semibold">CONTENT PREVIEW</th>
              <th className="pb-3 font-semibold">PLATFORM</th>
              <th className="pb-3 font-semibold text-right">REACH</th>
              <th className="pb-3 font-semibold text-right">REACTIONS</th>
              <th className="pb-3 font-semibold text-right">COMMENTS</th>
              <th className="pb-3 font-semibold text-right">SHARES</th>
              <th className="pb-3 font-semibold text-right">SENTIMENT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {displayPosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No published posts yet.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenComposer}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      Create First Post
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              displayPosts.map((post: any, idx: number) => {
                const platform =
                  post.platform ||
                  post.targets?.[0]?.socialAccount?.provider ||
                  "facebook";
                const accountName =
                  post.accountName ||
                  post.targets?.[0]?.socialAccount?.displayName ||
                  "Connected Account";
                const reach = post.reach || 0;
                const likes = post.likes || 0;
                const comments = post.comments || 0;
                const shares = post.shares || 0;
                const sentiment = post.sentiment || 100;

                return (
                  <tr
                    key={post.id || idx}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                  >
                    {/* Content snippet */}
                    <td className="py-3.5 max-w-xs sm:max-w-md pr-4">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-[10px] flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <p className="font-semibold text-slate-900 dark:text-white line-clamp-1 leading-snug">
                          {post.content}
                        </p>
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {renderPlatformIcon(platform, 16)}
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 capitalize">
                          {platform}
                        </span>
                      </div>
                    </td>

                    {/* Reach */}
                    <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">
                      {reach.toLocaleString()}
                    </td>

                    {/* Likes */}
                    <td className="py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-sky-500" />
                        {likes.toLocaleString()}
                      </span>
                    </td>

                    {/* Comments */}
                    <td className="py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-indigo-500" />
                        {comments.toLocaleString()}
                      </span>
                    </td>

                    {/* Shares */}
                    <td className="py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-emerald-500" />
                        {shares.toLocaleString()}
                      </span>
                    </td>

                    {/* Sentiment Badge */}
                    <td className="py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span>{sentiment}% Pos</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
