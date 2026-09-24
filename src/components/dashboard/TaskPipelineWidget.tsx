"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Clock,
  User,
  Plus,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  due: string;
  isCompleted: boolean;
  priority: "high" | "medium" | "low";
}

export function TaskPipelineWidget() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "t-1",
      title: "Approve weekend Instagram carousel broadcast",
      assignee: "Suraj",
      due: "Today",
      isCompleted: false,
      priority: "high",
    },
    {
      id: "t-2",
      title: "Reply to verified VIP enterprise inquiry on LinkedIn",
      assignee: "Sarah K.",
      due: "In 2 hours",
      isCompleted: false,
      priority: "high",
    },
    {
      id: "t-3",
      title: "Publish product update thread to X / Twitter",
      assignee: "Alex M.",
      due: "Tomorrow",
      isCompleted: true,
      priority: "medium",
    },
    {
      id: "t-4",
      title: "Review Q4 Social SEO & Hashtag cluster audit",
      assignee: "Suraj",
      due: "Friday",
      isCompleted: false,
      priority: "low",
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newState = !t.isCompleted;
          if (newState) {
            toast({
              title: "Task Completed",
              message: `"${t.title}" marked as done.`,
              type: "success",
            });
          }
          return { ...t, isCompleted: newState };
        }
        return t;
      })
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Task Pipeline & Approvals
            </h3>
            <p className="text-[11px] text-slate-400">
              SE Ranking-style workflow checklist
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {tasks.filter((t) => !t.isCompleted).length} pending
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
              task.isCompleted
                ? "bg-slate-50/40 dark:bg-slate-850/20 border-slate-200/50 dark:border-slate-800 opacity-60"
                : "bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600"
            }`}
          >
            <button
              type="button"
              className="mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0 cursor-pointer"
            >
              {task.isCompleted ? (
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-semibold leading-snug line-clamp-1 ${
                  task.isCompleted
                    ? "line-through text-slate-400 dark:text-slate-500"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                <span className="flex items-center gap-0.5">
                  <User className="w-3 h-3" />
                  {task.assignee}
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                  <Clock className="w-3 h-3" />
                  {task.due}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
