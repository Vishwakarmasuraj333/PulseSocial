"use client";

import React, { useState } from "react";
import { X, ExternalLink, Sparkles, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface CanvaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (url: string) => void;
}

export function CanvaModal({ isOpen, onClose, onSelectMedia }: CanvaModalProps) {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);

  if (!isOpen) return null;

  const handleLaunchCanva = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      toast({
        title: "Canva Design Imported",
        message: "Successfully loaded your latest Canva graphic.",
        type: "success",
      });
      onSelectMedia("/images/office_love_thumbnail.jpg");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-center p-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00c4cc] to-[#7d2ae8] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-cyan-500/20">
          C
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">Connect to Canva</h3>
          <p className="text-xs text-slate-500 mt-1">
            Create banners, stories, and social graphics directly in Canva and export them back to PulseSocial.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Access your Canva Pro or Free brand templates</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export high-resolution PNG & MP4 directly</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero file downloads needed</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunchCanva}
            disabled={connecting}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#00c4cc] to-[#7d2ae8] hover:opacity-95 text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
          >
            {connecting ? "Opening Canva..." : "Launch Canva Editor"}
          </button>
        </div>
      </div>
    </div>
  );
}
