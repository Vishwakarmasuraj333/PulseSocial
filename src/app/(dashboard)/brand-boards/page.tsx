"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBrand } from "@/context/BrandContext";
import { useToast } from "@/components/ui/toast";
import {
  LayoutGrid,
  Plus,
  Share2,
  ExternalLink,
  Layers,
  Sparkles,
  Trash2,
  Copy,
  Image as ImageIcon,
  Check,
  Search,
  Filter,
  ArrowRight,
  Pin,
} from "lucide-react";

interface BrandBoardItem {
  id: string;
  title: string;
  category: string;
  itemsCount: number;
  coverImage: string;
  updatedAt: string;
  tags: string[];
}

const DEFAULT_BOARDS: BrandBoardItem[] = [
  {
    id: "board-1",
    title: "Brand Identity & Product Showcase",
    category: "Commercial Realism",
    itemsCount: 14,
    coverImage: "/images/auth_specialist_hero.png",
    updatedAt: "Updated 2h ago",
    tags: ["Visual Assets", "Official Logos", "Product Launch"],
  },
  {
    id: "board-2",
    title: "Viral Social Video Hooks & Reels",
    category: "Short-Form Video",
    itemsCount: 28,
    coverImage: "/images/office_love_thumbnail_real.jpg",
    updatedAt: "Updated Yesterday",
    tags: ["Reels", "TikTok", "Shorts"],
  },
  {
    id: "board-3",
    title: "Seasonal Promotion & Campaign Creatives",
    category: "Promotional",
    itemsCount: 9,
    coverImage: "/images/post_office_scene.jpg",
    updatedAt: "Updated 3 days ago",
    tags: ["Discounts", "Q4 Campaign", "Banners"],
  },
];

export default function BrandBoardsPage() {
  const { activeBrand } = useBrand();
  const { toast } = useToast();
  const [boards, setBoards] = useState<BrandBoardItem[]>(DEFAULT_BOARDS);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Visual Campaign");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredBoards = boards.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newBoard: BrandBoardItem = {
      id: `board-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      itemsCount: 0,
      coverImage: "/images/auth_specialist_hero.png",
      updatedAt: "Just now",
      tags: [newCategory, activeBrand.name || "Brand"],
    };

    setBoards([newBoard, ...boards]);
    setNewTitle("");
    setIsCreateOpen(false);
    toast({
      title: "Board Created",
      message: `"${newBoard.title}" added to your workspace.`,
      type: "success",
    });
  };

  const handleDelete = (id: string) => {
    setBoards(boards.filter((b) => b.id !== id));
    toast({
      title: "Board Removed",
      message: "Brand board deleted.",
      type: "info",
    });
  };

  const handleCopyLink = (id: string) => {
    setCopiedId(id);
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/brand-boards#${id}`);
    }
    toast({
      title: "Link Copied",
      message: "Direct board share URL copied to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppLayout>
      <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-[calc(100vh-60px)] p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5846A8] dark:text-purple-300">
                <LayoutGrid className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Brand Boards
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Curate visual campaigns, dynamic moodboards, and marketing asset collections for {activeBrand.name}.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/social-accounts"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              Social Planner Settings
            </Link>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Board</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 flex-1 px-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search boards by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono pr-2">
            {filteredBoards.length} board{filteredBoards.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoards.map((board) => (
            <div
              key={board.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col"
            >
              {/* Cover Preview Image */}
              <div className="relative h-44 bg-slate-950 overflow-hidden">
                <img
                  src={board.coverImage}
                  alt={board.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide">
                  {board.category}
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-sm truncate drop-shadow-sm">{board.title}</h3>
                  <p className="text-[11px] text-slate-300 drop-shadow-xs">{board.itemsCount} creative assets</p>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {board.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-400">{board.updatedAt}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(board.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#5846A8] hover:bg-purple-50 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Copy Share Link"
                    >
                      {copiedId === board.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(board.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Delete Board"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Create New Brand Board</h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateBoard} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Board Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Summer Q3 Campaign Assets"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none cursor-pointer"
                  >
                    <option value="Visual Campaign">Visual Campaign</option>
                    <option value="Social Video Hooks">Social Video Hooks</option>
                    <option value="Visual Moodboard">Visual Moodboard</option>
                    <option value="Product Photography">Product Photography</option>
                    <option value="Brand Assets">Brand Assets</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 cursor-pointer"
                  >
                    Create Board
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
