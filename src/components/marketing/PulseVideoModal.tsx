"use client";

import React, { useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Sparkles } from "lucide-react";

interface PulseVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PulseVideoModal({ isOpen, onClose }: PulseVideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden text-white">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-xs sm:text-sm text-slate-200">
              PulseSocial AI Product Walkthrough & Masterclass
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Canvas / Simulation */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80"
            alt="Product tour preview"
            className="w-full h-full object-cover opacity-60"
          />

          {/* Central Play/Pause Trigger */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>
            <p className="mt-4 text-xs font-bold text-white bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-xs">
              ⚡ Watch how AI best-time scheduling works in real-time
            </p>
          </div>

          {/* Bottom Player Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="text-[11px] font-mono text-slate-400">01:24 / 03:40</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                1080p HD
              </span>
              <Maximize2 className="w-4 h-4 cursor-pointer hover:text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
