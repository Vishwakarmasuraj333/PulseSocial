"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { PostComposerModal } from "@/components/composer/PostComposerModal";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { postService, ScheduledPost } from "@/lib/services";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Search,
  FileClock,
  Clock,
  Trash2,
  Edit,
  Sparkles,
  Send,
  Calendar,
  Share2,
} from "lucide-react";

export default function DraftsPage() {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    async function loadDrafts() {
      setIsLoading(true);
      try {
        const data = await postService.getPosts({ status: "DRAFT" });
        setDrafts(data);
      } catch {
        // Empty state gracefully
      } finally {
        setIsLoading(false);
      }
    }
    loadDrafts();
  }, []);

  const handleDeleteDraft = async (id: string) => {
    try {
      await postService.deletePost(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      toast({
        title: "Draft Removed",
        message: "The post draft has been deleted.",
        type: "info",
      });
    } catch {
      toast({
        title: "Error",
        message: "Failed to delete draft.",
        type: "error",
      });
    }
  };

  const filteredDrafts = drafts.filter((d) =>
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileClock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span>Drafts</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Unfinished ideas, staged campaigns, and ready-to-schedule posts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsComposerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Draft</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved drafts..."
            className="w-full bg-transparent text-sm border-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        ) : filteredDrafts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrafts.map((draft) => (
              <div
                key={draft.id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      {draft.platforms.map((p) => (
                        <div key={p} className="w-5 h-5">
                          {renderPlatformIcon(p, 16)}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      Draft
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-3 leading-relaxed mb-4">
                    {draft.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Saved {new Date(draft.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsComposerOpen(true)}
                      className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition"
                      title="Continue Editing"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <FileClock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No saved drafts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              When you start writing in the post composer and save your progress, your drafts will appear here.
            </p>
            <button
              onClick={() => setIsComposerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Draft</span>
            </button>
          </div>
        )}

        {isComposerOpen && (
          <PostComposerModal
            isOpen={isComposerOpen}
            onClose={() => setIsComposerOpen(false)}
          />
        )}
      </div>
    </AppLayout>
  );
}
