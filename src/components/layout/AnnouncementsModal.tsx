"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Megaphone,
  X,
  Sparkles,
  ArrowRight,
  Zap,
  Bot,
  MessageSquare,
  BarChart3,
  CheckCircle,
} from "lucide-react";

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RELEASES = [
  {
    version: "v2.6.0",
    badge: "MAJOR",
    title: "AI Social Copilot 2.0 with Sentiment Adaptation",
    description:
      "Generate platform-tailored hooks, hashtags, and carousel slides in 1-click. Automatically matches brand tone across Facebook, Instagram, and LinkedIn.",
    icon: Bot,
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    actionText: "Try AI Assistant",
    actionRoute: "/ai-assistant",
  },
  {
    version: "v2.5.4",
    badge: "NEW",
    title: "Unified Omnichannel Direct Messages",
    description:
      "Reply directly to Facebook Messenger, Instagram DMs, and Twitter mentions from a single synchronized conversation inbox with saved canned responses.",
    icon: MessageSquare,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    actionText: "Open Messages",
    actionRoute: "/messages",
  },
  {
    version: "v2.5.0",
    badge: "ENHANCED",
    title: "Real-Time Channel Health & Auto-Refresh Tokens",
    description:
      "Direct OAuth 2.0 connections now automatically detect expiration and allow 1-click reauthorization without losing scheduling queues.",
    icon: Zap,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    actionText: "View Connections",
    actionRoute: "/connections",
  },
  {
    version: "v2.4.8",
    badge: "UPDATED",
    title: "Audience Engagement & ROI Heatmaps",
    description:
      "Granular hourly engagement analysis showing the exact highest-converting publishing slots for each connected network.",
    icon: BarChart3,
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    actionText: "View Reports",
    actionRoute: "/reports",
  },
];

export function AnnouncementsModal({ isOpen, onClose }: AnnouncementsModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#183247] text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">What&apos;s New in PulseSocial</h3>
                <p className="text-[11px] text-white/70">Latest product updates and enterprise releases</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Release List */}
          <div className="p-6 overflow-y-auto space-y-4 divide-y divide-slate-100 flex-1">
            {RELEASES.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="pt-4 first:pt-0">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 ${item.color}`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                          {item.version}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {item.badge}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-2.5">
                        <button
                          onClick={() => {
                            onClose();
                            router.push(item.actionRoute);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                        >
                          <span>{item.actionText}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">PulseSocial v2.6 Enterprise Edition</span>
            <Button size="sm" onClick={onClose} className="text-xs bg-slate-800 hover:bg-slate-900 text-white">
              Got it
            </Button>
          </div>
        </div>
      </div>
  );
}
