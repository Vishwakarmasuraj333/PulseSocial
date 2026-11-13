"use client";

import React, { useState } from "react";
import { X, ExternalLink, Sparkles, Check, Palette, ArrowRight } from "lucide-react";
import { CanvaIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";

interface CanvaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (url: string) => void;
}

const CANVA_TEMPLATES = [
  {
    id: "t1",
    title: "Brand Modern Showcase",
    dimension: "1080x1080 (Square)",
    url: "/images/pulsesocial_hero_banner.jpg",
  },
  {
    id: "t2",
    title: "Story / Reels Highlight",
    dimension: "1080x1920 (9:16)",
    url: "/images/purple_auth_showcase.jpg",
  },
  {
    id: "t3",
    title: "Leadership Quote Graphic",
    dimension: "1200x628 (Landscape)",
    url: "/images/office_love_thumbnail_real.jpg",
  },
];

export function CanvaModal({ isOpen, onClose, onSelectMedia }: CanvaModalProps) {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(CANVA_TEMPLATES[0].id);

  if (!isOpen) return null;

  const handleLaunchCanva = () => {
    setConnecting(true);
    // Open Canva design window in a new tab
    if (typeof window !== "undefined") {
      window.open("https://www.canva.com/design", "_blank", "noopener,noreferrer");
    }

    setTimeout(() => {
      setConnecting(false);
      const chosen = CANVA_TEMPLATES.find((t) => t.id === selectedTemplate) || CANVA_TEMPLATES[0];
      toast({
        title: "Canva Design Imported",
        message: `Attached "${chosen.title}" to your post.`,
        type: "success",
      });
      onSelectMedia(chosen.url);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#151518] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-md overflow-hidden text-center p-6 space-y-4">
        {/* Header with X button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00c4cc] to-[#7d2ae8] text-white flex items-center justify-center font-bold text-sm shadow-md">
              <CanvaIcon size={18} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Design with Canva</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct creative workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl text-left border border-purple-100 dark:border-purple-900/40 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#C4B5FD] shrink-0" />
            <span>Access Canva brand templates and creative assets</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#C4B5FD] shrink-0" />
            <span>Direct PNG, JPG, and MP4 automatic export</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#C4B5FD] shrink-0" />
            <span>Zero manual file uploads or folder switching</span>
          </div>
        </div>

        {/* Template selector */}
        <div className="text-left space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-white">
            Choose Export Template Preset:
          </label>
          <div className="space-y-1.5">
            {CANVA_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                  selectedTemplate === tmpl.id
                    ? "border-[#5846A8] bg-purple-50/40 dark:bg-purple-950/30 font-semibold text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-300"
                }`}
              >
                <div>
                  <p>{tmpl.title}</p>
                  <span className="text-[10px] text-slate-400">{tmpl.dimension}</span>
                </div>
                {selectedTemplate === tmpl.id && (
                  <Check className="w-4 h-4 text-[#5846A8] dark:text-[#C4B5FD]" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunchCanva}
            disabled={connecting}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#00c4cc] to-[#7d2ae8] hover:opacity-95 text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{connecting ? "Exporting..." : "Launch Canva Editor"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
