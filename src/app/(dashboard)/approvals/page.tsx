"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CheckSquare, Check, X, MessageSquare, Clock } from "lucide-react";

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [queue, setQueue] = useState([
    {
      id: "app_1",
      author: "Alex Designer",
      content: "5 proven tactics to grow organic social engagement without increasing ad spend in 2026. Review deck attached.",
      submittedAt: "Today, 10:15 AM",
      targets: "LinkedIn, X, Facebook",
      status: "IN_REVIEW",
    },
  ]);

  const handleApprove = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
    toast({ title: "Approved", message: "Broadcast approved and moved to publishing queue.", type: "success" });
  };

  const handleReject = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
    toast({ title: "Changes Requested", message: "Sent back to author with reviewer feedback.", type: "warning" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" /> Post Approval Pipeline
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-tier review workflow for team drafts prior to public broadcasting
          </p>
        </div>

        <div className="space-y-4">
          {queue.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-400">
              No pending broadcasts awaiting review. All clear!
            </div>
          ) : (
            queue.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">In Review</Badge>
                      <span className="text-xs text-slate-400">Submitted by {item.author} · {item.submittedAt}</span>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                      {item.content}
                    </p>
                    <p className="text-xs text-slate-400">Channels: {item.targets}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(item.id)}
                      className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Request Changes
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(item.id)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Approve &amp; Queue
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
