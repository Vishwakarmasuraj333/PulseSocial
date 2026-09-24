"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Plus, Clock, Zap, CheckCircle2 } from "lucide-react";

export default function AutomationPage() {
  const [queues] = useState([
    { id: "1", name: "Morning Broadcast Slot", time: "09:00 AM UTC", days: "Mon, Wed, Fri", status: "ACTIVE" },
    { id: "2", name: "Afternoon High Engagement", time: "03:30 PM UTC", days: "Everyday", status: "ACTIVE" },
    { id: "3", name: "Weekend Product Spotlight", time: "11:00 AM UTC", days: "Sat, Sun", status: "PAUSED" },
  ]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-600" /> Automation &amp; Publishing Queues
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Define scheduled queue slots, RSS automation and auto-publish triggers
            </p>
          </div>

          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> Create Queue Slot
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {queues.map((q) => (
            <Card key={q.id} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{q.name}</CardTitle>
                <Badge variant={q.status === "ACTIVE" ? "success" : "secondary"}>
                  {q.status}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> {q.time}
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> {q.days}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
