import React from "react";

export default function DashboardLoading() {
  return (
    <div className="w-full flex-1 p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
      {/* Top Banner Skeleton */}
      <div className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5" />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 p-4 flex flex-col justify-between"
          >
            <div className="h-4 w-24 bg-slate-300/60 dark:bg-slate-700/60 rounded" />
            <div className="h-7 w-32 bg-slate-300/80 dark:bg-slate-700/80 rounded" />
            <div className="h-3 w-16 bg-slate-300/50 dark:bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-200/60 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 p-6" />
        <div className="h-80 rounded-2xl bg-slate-200/60 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 p-6" />
      </div>

      {/* Channels / Posts List Skeleton */}
      <div className="h-64 rounded-2xl bg-slate-200/60 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 p-6" />
    </div>
  );
}
