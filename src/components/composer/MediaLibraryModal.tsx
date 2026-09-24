"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Search, Check, Upload, Trash2, Folder } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: "image" | "video";
  size: string;
  dimensions: string;
}

const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "m1",
    title: "Brand Campaign Hero Showcase",
    url: "/images/post_office_scene.jpg",
    type: "image",
    size: "1.8 MB",
    dimensions: "1920x1080",
  },
  {
    id: "m2",
    title: "Official Brand Identity Asset",
    url: "/icons/pulse-logo.svg",
    type: "image",
    size: "480 KB",
    dimensions: "800x800",
  },
  {
    id: "m3",
    title: "Quarterly Promotional Banner",
    url: "/images/office_love_thumbnail_real.jpg",
    type: "image",
    size: "2.1 MB",
    dimensions: "1280x720",
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (url: string) => {
    onSelectMedia(url);
    toast({
      title: "Media Selected",
      message: "Asset attached to your post.",
      type: "success",
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const newItem: MediaItem = {
      id: `m_${Date.now()}`,
      title: file.name,
      url: previewUrl,
      type: file.type.startsWith("video") ? "video" : "image",
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      dimensions: "Uploaded File",
    };

    setItems((prev) => [newItem, ...prev]);
    toast({
      title: "Uploaded to Library",
      message: `${file.name} saved to Media Library.`,
      type: "success",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Media Library</h3>
              <p className="text-[11px] text-slate-500">
                Browse and select brand assets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition shadow-xs">
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
                className={`relative group rounded-xl border overflow-hidden cursor-pointer transition flex flex-col bg-white ${
                  isSelected
                    ? "border-blue-600 ring-2 ring-blue-500/20 shadow-md"
                    : "border-slate-200 hover:border-slate-300 shadow-2xs"
                }`}
              >
                <div className="relative h-32 w-full bg-slate-900">
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-white">
                  <p className="text-xs font-medium text-slate-800 truncate" title={item.title}>
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
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500">
            {selectedId ? "1 asset selected" : "Click to select, double click to insert"}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
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
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              Insert Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
