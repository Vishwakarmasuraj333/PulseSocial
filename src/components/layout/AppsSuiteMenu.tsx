"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Share2,
  MessageSquare,
  Inbox,
  BarChart3,
  Bot,
  Calendar,
  Users,
  Zap,
  FolderClosed,
  Settings,
  X,
  ExternalLink,
} from "lucide-react";

interface AppsSuiteMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUITE_APPS = [
  {
    id: "social",
    name: "Pulse Social",
    description: "Multi-channel publishing & queue",
    icon: Share2,
    href: "/dashboard",
    color: "bg-sky-500/10 text-sky-600 group-hover:bg-sky-500 group-hover:text-white",
  },
  {
    id: "messages",
    name: "Pulse Messages",
    description: "Omnichannel direct chats & DMs",
    icon: MessageSquare,
    href: "/messages",
    color: "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white",
  },
  {
    id: "inbox",
    name: "Pulse Inbox",
    description: "Comments, mentions & sentiment",
    icon: Inbox,
    href: "/inbox",
    color: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
  },
  {
    id: "calendar",
    name: "Pulse Calendar",
    description: "Visual scheduling & slot planner",
    icon: Calendar,
    href: "/calendar",
    color: "bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white",
  },
  {
    id: "ai",
    name: "Pulse AI Studio",
    description: "Generative captions & tone tuning",
    icon: Bot,
    href: "/ai-assistant",
    color: "bg-pink-500/10 text-pink-600 group-hover:bg-pink-500 group-hover:text-white",
  },
  {
    id: "analytics",
    name: "Pulse Analytics",
    description: "Cross-network BI & ROI reports",
    icon: BarChart3,
    href: "/reports",
    color: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
  },
  {
    id: "collaborate",
    name: "Pulse Collaborate",
    description: "Team roles & approval workflows",
    icon: Users,
    href: "/collaborate",
    color: "bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white",
  },
  {
    id: "automation",
    name: "Pulse Automations",
    description: "RSS auto-post, triggers & webhooks",
    icon: Zap,
    href: "/automation",
    color: "bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white",
  },
  {
    id: "media",
    name: "Pulse Media Cloud",
    description: "Centralized digital asset storage",
    icon: FolderClosed,
    href: "/media",
    color: "bg-rose-500/10 text-rose-600 group-hover:bg-rose-500 group-hover:text-white",
  },
  {
    id: "settings",
    name: "Admin Console",
    description: "Security, audit logs & workspace",
    icon: Settings,
    href: "/settings",
    color: "bg-slate-500/10 text-slate-700 group-hover:bg-slate-700 group-hover:text-white",
  },
];

export function AppsSuiteMenu({ isOpen, onClose }: AppsSuiteMenuProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover Grid */}
      <div className="absolute right-0 top-11 w-84 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Pulse Enterprise Suite</h4>
            <p className="text-[10px] text-slate-400">Switch between tools & workspaces</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SUITE_APPS.map((app) => {
            const IconComp = app.icon;
            const isCurrent =
              app.href === "/" ? pathname === "/" : pathname.startsWith(app.href);

            return (
              <Link
                key={app.id}
                href={app.href}
                onClick={onClose}
                className={`group flex items-start gap-2.5 p-2 rounded-lg border transition ${
                  isCurrent
                    ? "bg-slate-50 border-slate-300 ring-1 ring-slate-300"
                    : "border-transparent hover:border-slate-200 hover:bg-slate-50/80"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition ${app.color}`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition truncate">
                      {app.name}
                    </span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                    {app.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>PulseSocial Architecture</span>
          <Link
            href="/settings"
            onClick={onClose}
            className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Manage Suite</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </>
  );
}
