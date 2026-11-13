"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Check,
  Upload,
  Trash2,
  Folder,
  Image as ImageIcon,
  Film,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: "image" | "video";
  size: string;
  dimensions: string;
  category?: "brand" | "campaign" | "product";
}

const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "m1",
    title: "Brand Campaign Hero Showcase",
    url: "/images/pulsesocial_hero_banner.jpg",
    type: "image",
    size: "1.8 MB",
    dimensions: "1920x1080",
    category: "brand",
  },
  {
    id: "m2",
    title: "Official Brand Identity Asset",
    url: "/icon.svg",
    type: "image",
    size: "480 KB",
    dimensions: "800x800",
    category: "brand",
  },
  {
    id: "m3",
    title: "Quarterly Promotional Banner",
    url: "/images/office_love_thumbnail_real.jpg",
    type: "image",
    size: "2.1 MB",
    dimensions: "1280x720",
    category: "campaign",
  },
  {
    id: "m4",
    title: "Platform Connectivity Architecture",
    url: "/images/pulsesocial_connectivity_hero.png",
    type: "image",
    size: "1.2 MB",
    dimensions: "1400x900",
    category: "product",
  },
  {
    id: "m5",
    title: "Multi-Channel Social Animation",
    url: "/images/social-analytics.mp4",
    type: "video",
    size: "3.4 MB",
    dimensions: "1080x1080",
    category: "campaign",
  },
  {
    id: "m6",
    title: "Founder Suraj Vishwakarma",
    url: "/images/founder_suraj.jpg",
    type: "image",
    size: "620 KB",
    dimensions: "800x800",
    category: "brand",
  },
];

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (url: string) => void;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelectMedia,
}: MediaLibraryModalProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[]>(DEFAULT_MEDIA_ITEMS);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "image" | "video">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeFilter === "all" || item.type === activeFilter;
    return matchesSearch && matchesType;
  });

  const handleSelect = (url: string) => {
    onSelectMedia(url);
    toast({
      title: "Media Selected",
      message: "Asset attached to your post.",
      type: "success",
    });
    onClose();
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast({
      title: "Asset Removed",
      message: "Media item removed from active library view.",
      type: "info",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempId = `m_${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video");

    const newItem: MediaItem = {
      id: tempId,
      title: file.name,
      url: previewUrl,
      type: isVideo ? "video" : "image",
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      dimensions: "Uploaded File",
      category: "brand",
    };

    setItems((prev) => [newItem, ...prev]);
    setSelectedId(tempId);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.url) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === tempId ? { ...it, url: data.url, dimensions: "Saved" } : it
          )
        );
        toast({
          title: "Uploaded to Library",
          message: `${file.name} saved to Media Library.`,
          type: "success",
        });
      }
    } catch {
      // Keep local preview URL gracefully
      toast({
        title: "Loaded Locally",
        message: `${file.name} attached for current session.`,
        type: "info",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#151518] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-[#19191D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Media Library</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Browse, upload, and select brand assets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151518] text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1 bg-white dark:bg-black/30 p-0.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[#5846A8] text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("image")}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeFilter === "image"
                  ? "bg-[#5846A8] text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Images</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("video")}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeFilter === "video"
                  ? "bg-[#5846A8] text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Film className="w-3 h-3" />
              <span>Videos</span>
            </button>
          </div>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5846A8] hover:bg-[#48378A] text-white text-xs font-semibold cursor-pointer transition shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Asset</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Media Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isSelected = selectedId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                onDoubleClick={() => handleSelect(item.url)}
                className={`relative group rounded-xl border overflow-hidden cursor-pointer transition flex flex-col bg-white dark:bg-white/5 ${
                  isSelected
                    ? "border-purple-600 ring-2 ring-purple-500/30 shadow-md"
                    : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-2xs"
                }`}
              >
                <div className="relative h-32 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  )}

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#5846A8] text-white rounded-full flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(e, item.id)}
                    className="absolute top-2 left-2 w-6 h-6 rounded-md bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-2.5 bg-white dark:bg-[#151518]">
                  <p
                    className="text-xs font-semibold text-slate-800 dark:text-white truncate"
                    title={item.title}
                  >
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{item.size}</span>
                    <span>{item.dimensions}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#19191D]">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {selectedId ? "1 asset selected" : "Click to select, double click to insert"}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedId}
              onClick={() => {
                const item = items.find((i) => i.id === selectedId);
                if (item) handleSelect(item.url);
              }}
              className="px-4 py-1.5 rounded-lg bg-[#5846A8] hover:bg-[#48378A] text-white text-xs font-bold disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              Insert Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
