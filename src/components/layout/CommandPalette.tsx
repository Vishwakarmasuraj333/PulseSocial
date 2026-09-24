"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Share2,
  Calendar,
  MessageSquare,
  Inbox,
  BarChart3,
  Bot,
  Settings,
  Users,
  Building2,
  Zap,
  Activity,
  Moon,
  Sun,
  X,
  CornerDownLeft,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenComposer: () => void;
  onOpenAddBrand: () => void;
  onOpenActivity: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Action" | "Tool";
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenComposer,
  onOpenAddBrand,
  onOpenActivity,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const COMMANDS: CommandItem[] = [
    {
      id: "action-new-post",
      title: "Create New Social Post",
      category: "Action",
      icon: Plus,
      shortcut: "N",
      action: () => {
        onClose();
        onOpenComposer();
      },
    },
    {
      id: "action-add-brand",
      title: "Add New Brand / Workspace",
      category: "Action",
      icon: Building2,
      shortcut: "B",
      action: () => {
        onClose();
        onOpenAddBrand();
      },
    },
    {
      id: "action-activity",
      title: "View Live Activity Stream",
      category: "Action",
      icon: Activity,
      shortcut: "A",
      action: () => {
        onClose();
        onOpenActivity();
      },
    },
    {
      id: "nav-posts",
      title: "Go to Posts Manager (Published & Scheduled)",
      category: "Navigation",
      icon: Share2,
      action: () => {
        onClose();
        router.push("/posts");
      },
    },
    {
      id: "nav-messages",
      title: "Go to Direct Messages & Chats",
      category: "Navigation",
      icon: MessageSquare,
      action: () => {
        onClose();
        router.push("/messages");
      },
    },
    {
      id: "nav-inbox",
      title: "Go to Social Inbox & Comments",
      category: "Navigation",
      icon: Inbox,
      action: () => {
        onClose();
        router.push("/inbox");
      },
    },
    {
      id: "nav-connections",
      title: "Go to Social Connections & Accounts",
      category: "Navigation",
      icon: Zap,
      action: () => {
        onClose();
        router.push("/connections");
      },
    },
    {
      id: "nav-calendar",
      title: "Go to Calendar Planner",
      category: "Navigation",
      icon: Calendar,
      action: () => {
        onClose();
        router.push("/calendar");
      },
    },
    {
      id: "nav-ai",
      title: "Open Pulse AI Studio",
      category: "Tool",
      icon: Bot,
      action: () => {
        onClose();
        router.push("/ai-assistant");
      },
    },
    {
      id: "nav-collaborate",
      title: "Go to Team Collaboration & Approvals",
      category: "Navigation",
      icon: Users,
      action: () => {
        onClose();
        router.push("/collaborate");
      },
    },
    {
      id: "nav-reports",
      title: "Go to Analytics & Reports",
      category: "Navigation",
      icon: BarChart3,
      action: () => {
        onClose();
        router.push("/reports");
      },
    },
    {
      id: "nav-settings",
      title: "Go to Settings",
      category: "Navigation",
      icon: Settings,
      action: () => {
        onClose();
        router.push("/settings");
      },
    },
  ];

  const filtered = COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Type a command or search tabs, pages, actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-800"
              autoFocus
            />
            <kbd className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500 border border-slate-200">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No matching commands or pages found for &quot;{query}&quot;
              </div>
            ) : (
              filtered.map((cmd, idx) => {
                const IconComp = cmd.icon;
                const isSelected = idx === selectedIndex;

                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition ${
                      isSelected ? "bg-blue-50 text-blue-900 font-medium" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs truncate">{cmd.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {cmd.category}
                      </span>
                      {cmd.shortcut && (
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500 border border-slate-200">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span>Use <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> to navigate</span>
              <span><kbd className="font-mono">↵</kbd> to select</span>
            </div>
            <span>PulseSocial Command Bar</span>
          </div>
        </div>
      </div>
  );
}
