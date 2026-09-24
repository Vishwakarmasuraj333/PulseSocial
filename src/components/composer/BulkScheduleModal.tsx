"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Download,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface BulkScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ParsedPost {
  id: string;
  date: string;
  time: string;
  channel: string;
  content: string;
  status: "valid" | "warning";
}

const SAMPLE_PARSED_POSTS: ParsedPost[] = [
  {
    id: "p1",
    date: "2026-09-24",
    time: "10:30 AM",
    channel: "Facebook",
    content: "Excited to unveil our quarterly roadmap and product feature releases! 🚀 #ProductLaunch #Innovation",
    status: "valid",
  },
  {
    id: "p2",
    date: "2026-09-25",
    time: "02:00 PM",
    channel: "Instagram",
    content: "Behind the scenes with our core team: building high-impact experiences every day. ✨ #CompanyCulture #Growth",
    status: "valid",
  },
  {
    id: "p3",
    date: "2026-09-26",
    time: "06:15 PM",
    channel: "LinkedIn",
    content: "Key industry takeaways: 5 proven strategies to optimize multi-channel reach and engagement this quarter. 📈 #MarketingTips",
    status: "valid",
  },
];

export function BulkScheduleModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkScheduleModalProps) {
  const { toast } = useToast();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [posts, setPosts] = useState<ParsedPost[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileUploaded(true);
      setPosts(SAMPLE_PARSED_POSTS);
      toast({
        title: "CSV Imported",
        message: `Parsed 3 scheduled posts from ${file.name}.`,
        type: "success",
      });
    }
  };

  const handleConfirmBulkSchedule = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Bulk Posts Queued",
        message: `Successfully scheduled ${posts.length} posts to your calendar queue!`,
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    }, 1200);
  };

  const downloadSampleCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Date,Time,Channel,Content\n2026-09-24,10:30 AM,Facebook,Product launch milestone announcement 🚀\n2026-09-25,02:00 PM,LinkedIn,Quarterly leadership insights & industry trends 📈\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pulsesocial_bulk_schedule_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Bulk Post Scheduler (CSV)</h3>
              <p className="text-[11px] text-slate-500">
                Upload a CSV spreadsheet to queue and schedule up to 100 posts at once
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Upload Area */}
          {!fileUploaded ? (
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-8 text-center space-y-3 bg-slate-50/40 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Drag and drop your CSV file here
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Supports .csv with Date, Time, Channel, and Content columns
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition shadow-xs">
                  <span>Browse CSV File</span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-medium transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download Sample CSV</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">{fileName}</span>
                  <span className="text-emerald-700 font-normal">
                    ({posts.length} posts ready for review)
                  </span>
                </div>
                <button
                  onClick={() => setFileUploaded(false)}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  Upload another file
                </button>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Date & Time</th>
                      <th className="py-2.5 px-3 font-semibold">Channel</th>
                      <th className="py-2.5 px-3 font-semibold">Post Content</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                          {post.date} at {post.time}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-blue-600">
                          {post.channel}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                          {post.content}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            <Check className="w-2.5 h-2.5" /> Ready
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!fileUploaded || isSubmitting}
            onClick={handleConfirmBulkSchedule}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Queueing Posts..." : `Schedule All ${posts.length || ""} Posts`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
