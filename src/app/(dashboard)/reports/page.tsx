"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, Mail, Share2 } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    { id: "1", title: "Monthly Executive Summary", period: "Aug 2026", generatedAt: "Sep 1, 2026", format: "PDF" },
    { id: "2", title: "Audience Growth & Reach Benchmark", period: "Q2 2026", generatedAt: "Jul 1, 2026", format: "PDF" },
    { id: "3", title: "Cross-Platform Engagement Telemetry", period: "Last 30 Days", generatedAt: "Yesterday", format: "CSV" },
  ];

  return (
    <AppLayout>
      <div className="bg-slate-50 dark:bg-[#0D0D0E] min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 dark:text-[#9CA3AF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#5846A8] dark:text-[#E08738]" /> Executive Report Builder
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] mt-0.5">
              Export C-level executive summaries, stakeholder slides, and raw analytics data
            </p>
          </div>

          <Button className="h-9 px-4 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] text-xs font-bold shadow-xs hover:shadow-purple-500/20 dark:hover:shadow-[0_0_16px_rgba(224,135,56,0.35)] transition cursor-pointer">
            <Download className="w-4 h-4 mr-1.5 stroke-[2.5]" /> Generate New Report
          </Button>
        </div>

        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id} className="p-5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-white/7 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[#5846A8] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">{r.title}</CardTitle>
                  <p className="text-xs text-slate-400 dark:text-[#9CA3AF]">Coverage: {r.period} · Generated: {r.generatedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs dark:border-white/10 dark:text-white dark:hover:bg-white/5">
                  <Mail className="w-3.5 h-3.5 mr-1" /> Email Stakeholders
                </Button>
                <Button size="sm" className="text-xs bg-[#5846A8] hover:bg-[#48388d] text-white dark:bg-[#E08738] dark:hover:bg-[#d97706] dark:text-[#0F0F11] font-bold">
                  <Download className="w-3.5 h-3.5 mr-1" /> Download {r.format}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
