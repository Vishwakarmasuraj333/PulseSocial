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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" /> Executive Report Builder
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Export C-level executive summaries, stakeholder slides, and raw analytics data
            </p>
          </div>

          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold">
            <Download className="w-4 h-4 mr-1.5" /> Generate New Report
          </Button>
        </div>

        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-sm">{r.title}</CardTitle>
                  <p className="text-xs text-slate-400">Coverage: {r.period} · Generated: {r.generatedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Mail className="w-3.5 h-3.5 mr-1" /> Email Stakeholders
                </Button>
                <Button size="sm" className="text-xs bg-slate-900 hover:bg-black text-white">
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
