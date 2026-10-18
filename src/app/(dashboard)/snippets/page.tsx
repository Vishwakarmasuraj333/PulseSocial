"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBrand } from "@/context/BrandContext";
import { useToast } from "@/components/ui/toast";
import {
  FileCode,
  Plus,
  Copy,
  Check,
  Hash,
  Trash2,
  Search,
  Sparkles,
  MessageSquare,
  Bookmark,
} from "lucide-react";

interface SnippetItem {
  id: string;
  title: string;
  category: "hashtags" | "cta" | "signature" | "general";
  content: string;
  usageCount: number;
}

const DEFAULT_SNIPPETS: SnippetItem[] = [
  {
    id: "snip-1",
    title: "Brand Official Signature",
    category: "signature",
    content: "🚀 Follow Pulse Media for daily digital marketing strategies, creator growth hacks, and agency insights.",
    usageCount: 42,
  },
  {
    id: "snip-2",
    title: "Viral High-Reach Growth Tags",
    category: "hashtags",
    content: "#MarketingStrategy #SocialMediaGrowth #DigitalMarketing #CreatorEconomy #SaaS #GrowthHacking",
    usageCount: 88,
  },
  {
    id: "snip-3",
    title: "Link-in-Bio First Comment CTA",
    category: "cta",
    content: "💬 Drop a comment below if you want the complete playbook! Link is live in our bio.",
    usageCount: 31,
  },
  {
    id: "snip-4",
    title: "Podcast & YouTube Show Premiere",
    category: "general",
    content: "🎙️ Catch the full episode with behind-the-scenes founder stories streaming now on our official channel.",
    usageCount: 19,
  },
];

export default function SnippetsPage() {
  const { activeBrand } = useBrand();
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<SnippetItem[]>(DEFAULT_SNIPPETS);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"hashtags" | "cta" | "signature" | "general">("hashtags");
  const [newContent, setNewContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSnippets = snippets.filter((s) => {
    if (filterCat !== "all" && s.category !== filterCat) return false;
    if (
      search &&
      !s.title.toLowerCase().includes(search.toLowerCase()) &&
      !s.content.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreateSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newSnip: SnippetItem = {
      id: `snip-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      usageCount: 0,
    };

    setSnippets([newSnip, ...snippets]);
    setNewTitle("");
    setNewContent("");
    setIsCreateOpen(false);
    toast({
      title: "Snippet Saved",
      message: `"${newSnip.title}" ready to insert into posts.`,
      type: "success",
    });
  };

  const handleCopy = (content: string, id: string) => {
    setCopiedId(id);
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(content);
    }
    toast({
      title: "Copied to Clipboard",
      message: "Snippet content copied.",
      type: "success",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setSnippets(snippets.filter((s) => s.id !== id));
    toast({
      title: "Snippet Deleted",
      message: "Content snippet removed.",
      type: "info",
    });
  };

  return (
    <AppLayout>
      <div className="bg-slate-50 dark:bg-[#0D0D0E] min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 dark:text-[#9CA3AF]">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/7 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-[#FBBF24]">
                <FileCode className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Reusable Content Snippets
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1">
              Store recurring hashtag clouds, official signatures, and call-to-actions for {activeBrand.name}.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/social-accounts"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#17171A] border border-slate-200 dark:border-white/7 text-slate-700 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-white/5 transition"
            >
              Social Planner Settings
            </Link>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] shadow-md shadow-purple-900/20 dark:shadow-amber-900/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Snippet</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#17171A] p-3 rounded-2xl border border-slate-200/90 dark:border-white/7 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["all", "hashtags", "cta", "signature", "general"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                  filterCat === cat
                    ? "bg-[#5846A8] text-white dark:bg-[#E08738] dark:text-[#0F0F11] font-bold shadow-xs"
                    : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-64 px-2">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search snippets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Snippets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSnippets.map((snippet) => (
            <div
              key={snippet.id}
              className="bg-white dark:bg-[#17171A] rounded-2xl border border-slate-200/90 dark:border-white/7 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {snippet.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#9CA3AF]">
                    {snippet.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#111113] p-3 rounded-xl border border-slate-100 dark:border-white/7 font-mono leading-relaxed whitespace-pre-wrap select-all">
                  {snippet.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/7 text-xs">
                <span className="text-[11px] text-slate-400 dark:text-[#6B7280]">
                  Used in {snippet.usageCount} post{snippet.usageCount === 1 ? "" : "s"}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(snippet.content, snippet.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-amber-500/15 text-[#5846A8] dark:text-[#FBBF24] hover:bg-purple-100 text-xs font-semibold transition cursor-pointer"
                  >
                    {copiedId === snippet.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-purple-600 dark:text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Snippet</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(snippet.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                    title="Delete Snippet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Snippet Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#17171A] rounded-2xl border border-slate-200/90 dark:border-white/10 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Create Content Snippet</h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSnippet} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Snippet Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Summer Promo Hashtag Cloud"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111113] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#E08738]/20 focus:border-[#E08738]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111113] text-slate-900 dark:text-white outline-none cursor-pointer focus:border-[#E08738]"
                  >
                    <option value="hashtags">Hashtags Bundle</option>
                    <option value="cta">Call to Action (CTA)</option>
                    <option value="signature">Brand Signature</option>
                    <option value="general">General Caption</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Snippet Content
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write text or paste hashtags to insert with 1-click..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111113] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#E08738]/20 focus:border-[#E08738] font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] shadow-md shadow-purple-900/20 dark:shadow-amber-900/20 cursor-pointer"
                  >
                    Save Snippet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
