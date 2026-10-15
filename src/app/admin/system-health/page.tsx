"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Database,
  Server,
  Cpu,
  Clock,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface HealthData {
  status: string;
  timestamp: string;
  database: {
    status: string;
    latencyMs: number;
    provider: string;
  };
  counts: {
    users: { total: number; active: number; suspended: number };
    organizations: number;
    socialAccounts: { total: number; connected: number; expired: number };
    posts: { total: number; published: number; failed: number; scheduled: number };
    syncJobs: { total: number; failed: number };
    auditLogs: number;
    support: { feedback: number; contacts: number };
  };
  system: {
    uptimeSeconds: number;
    nodeVersion: string;
    platform: string;
    memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number };
  };
}

export default function AdminSystemHealthPage() {
  const { toast } = useToast();

  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);

  const fetchHealth = async () => {
    try {
      setPinging(true);
      const res = await fetch("/api/admin/health");
      if (!res.ok) throw new Error("Health check failed");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      toast({
        title: "Health Probe Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
      setPinging(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatUptime = (sec: number) => {
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Infrastructure & System Health
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time PostgreSQL read/write response latencies, memory footprint, and storage volume.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={pinging}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#6F52B5] hover:bg-[#59409A] text-white transition shadow-xs self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${pinging ? "animate-spin" : ""}`} />
          <span>Ping Infrastructure</span>
        </button>
      </div>

      {loading || !data ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6F52B5]" />
          <p className="text-xs">Probing database and memory subsystems...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Database Health Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Database Engine</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                    <Database className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{data.database.latencyMs} ms</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {data.database.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{data.database.provider}</p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                Ping executed via real <code>SELECT 1</code> query
              </div>
            </div>

            {/* Memory & Server Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Runtime Memory</span>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6F52B5]">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {data.system.memory.heapUsedMb} MB
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    of {data.system.memory.heapTotalMb} MB allocated ({data.system.memory.rssMb} MB RSS)
                  </p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                Platform: {data.system.platform} • Node {data.system.nodeVersion}
              </div>
            </div>

            {/* Uptime Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Process Uptime</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatUptime(data.system.uptimeSeconds)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Continuous uptime without restart</p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                Last probe: {new Date(data.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Database Table Volume Breakdown */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Database Table Volumes & Storage Integrity
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Users
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {data.counts.users.total}
                </div>
                <span className="text-[10px] text-slate-400">
                  {data.counts.users.active} active • {data.counts.users.suspended} suspended
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Organizations
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {data.counts.organizations}
                </div>
                <span className="text-[10px] text-slate-400">Active workspaces</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Social Accounts
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {data.counts.socialAccounts.total}
                </div>
                <span className="text-[10px] text-slate-400">
                  {data.counts.socialAccounts.connected} active • {data.counts.socialAccounts.expired} expired
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Social Posts
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {data.counts.posts.total}
                </div>
                <span className="text-[10px] text-slate-400">
                  {data.counts.posts.published} published • {data.counts.posts.failed} failed
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Sync Jobs Executed
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {data.counts.syncJobs.total}
                </div>
                <span className="text-[10px] text-slate-400">
                  {data.counts.syncJobs.failed} failures recorded
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Audit Logs Recorded
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {data.counts.auditLogs}
                </div>
                <span className="text-[10px] text-slate-400">Security event rows</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Feedback Items
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {data.counts.support.feedback}
                </div>
                <span className="text-[10px] text-slate-400">User satisfaction ratings</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Contact Inquiries
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {data.counts.support.contacts}
                </div>
                <span className="text-[10px] text-slate-400">Support tickets submitted</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
