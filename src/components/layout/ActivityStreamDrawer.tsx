"use client";

import React, { useState } from "react";
import {
  Activity,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Share2,
  Users,
  Shield,
  Clock,
  Sparkles,
  Play,
  Pause,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActivityEvent {
  id: string;
  type: "PUBLISHING" | "ACCOUNT" | "TEAM" | "SECURITY";
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatarInitials: string;
  };
  platform?: string;
  status: "SUCCESS" | "INFO" | "WARNING";
}

interface ActivityStreamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityStreamDrawer({ isOpen, onClose }: ActivityStreamDrawerProps) {
  const [filter, setFilter] = useState<string>("ALL");
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/audit");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          setEvents(data.logs);
        }
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchAuditLogs().finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredEvents = events.filter((e) => {
    if (filter === "ALL") return true;
    return e.type === filter;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAuditLogs();
    setIsRefreshing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-[#183247] text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">Live Activity Stream</h3>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE PULSE
                  </span>
                </div>
                <p className="text-[11px] text-white/70">Real-time platform events and sync logs</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition"
                title="Refresh Stream"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {["ALL", "PUBLISHING", "ACCOUNT", "TEAM", "SECURITY"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                    filter === tab
                      ? "bg-slate-800 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsLive(!isLive)}
              className="text-[11px] flex items-center gap-1 text-slate-500 hover:text-slate-800"
              title={isLive ? "Pause auto-refresh" : "Resume stream"}
            >
              {isLive ? (
                <>
                  <Pause className="w-3 h-3 text-amber-500" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-500" />
                  <span>Resume</span>
                </>
              )}
            </button>
          </div>

          {/* Stream Events List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin text-slate-400" />
                <p className="text-xs">Loading activity stream...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Activity className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No activity logs recorded yet</p>
                <p className="text-[11px] text-slate-400">Actions such as publishing, invitations, and channel connections will appear here.</p>
              </div>
            ) : (
              filteredEvents.map((evt) => (
                <div key={evt.id} className="pt-3.5 first:pt-0 group">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-2xs ${
                        evt.type === "PUBLISHING"
                          ? "bg-blue-100 text-blue-700"
                          : evt.type === "ACCOUNT"
                          ? "bg-emerald-100 text-emerald-700"
                          : evt.type === "TEAM"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {evt.user.avatarInitials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {evt.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">{evt.timestamp}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                          {evt.type}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] text-slate-500">By {evt.user.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              Showing {filteredEvents.length} events
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEvents([])}
              className="text-xs h-7 text-slate-600 hover:text-rose-600 hover:border-rose-200"
            >
              Clear Log View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
