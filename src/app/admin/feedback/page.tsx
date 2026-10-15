"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Star,
  RefreshCw,
  Mail,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface FeedbackItem {
  id: string;
  userId: string | null;
  rating: number;
  message: string;
  screenshotUrl: string | null;
  status: string;
  createdAt: string;
}

interface ContactItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  attachmentUrl: string | null;
  status: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"feedback" | "contact">("feedback");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [counts, setCounts] = useState({
    totalFeedback: 0,
    totalContacts: 0,
    pendingFeedback: 0,
    pendingContacts: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/feedback");
      if (!res.ok) throw new Error("Failed to load feedback");
      const data = await res.json();
      setFeedback(data.feedback || []);
      setContacts(data.contacts || []);
      setCounts(data.counts || {});
    } catch (err: any) {
      toast({
        title: "Error Loading Queue",
        message: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    newStatus: string,
    type: "feedback" | "contact"
  ) => {
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, type }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      toast({
        title: "Status Updated",
        message: `Marked as ${newStatus}`,
        type: "success",
      });
      fetchItems();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        message: err.message,
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Support & Customer Feedback
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Triage in-app satisfaction ratings, contact form inquiries, and user bug submissions.
          </p>
        </div>

        <button
          onClick={fetchItems}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-2xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={() => setActiveTab("feedback")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === "feedback"
              ? "border-[#6F52B5] text-[#6F52B5] dark:text-purple-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Feedback Submissions ({feedback.length})</span>
          {counts.pendingFeedback > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-purple-100 text-[#6F52B5] font-bold">
              {counts.pendingFeedback} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === "contact"
              ? "border-[#6F52B5] text-[#6F52B5] dark:text-purple-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact Inquiries ({contacts.length})</span>
          {counts.pendingContacts > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-100 text-amber-700 font-bold">
              {counts.pendingContacts} pending
            </span>
          )}
        </button>
      </div>

      {/* Content list */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6F52B5]" />
          <p className="text-xs">Loading queue items...</p>
        </div>
      ) : activeTab === "feedback" ? (
        <div className="space-y-3">
          {feedback.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No feedback submissions received yet.
            </div>
          ) : (
            feedback.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.rating ? "fill-amber-400" : "text-slate-200 dark:text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.rating}/5 Rating
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      • {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    {item.message}
                  </p>

                  {item.screenshotUrl && (
                    <a
                      href={item.screenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6F52B5] hover:underline mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Attached Screenshot</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateStatus(item.id, e.target.value, "feedback")}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="NEW">Status: NEW</option>
                    <option value="REVIEWED">Status: REVIEWED</option>
                    <option value="RESOLVED">Status: RESOLVED</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No contact requests received yet.
            </div>
          ) : (
            contacts.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      &lt;{item.email}&gt;
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      • {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Subject: {item.subject}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {item.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateStatus(item.id, e.target.value, "contact")}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="PENDING">Status: PENDING</option>
                    <option value="REPLIED">Status: REPLIED</option>
                    <option value="CLOSED">Status: CLOSED</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
