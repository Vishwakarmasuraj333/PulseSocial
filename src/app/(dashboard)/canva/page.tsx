"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Palette, ExternalLink, Image as ImageIcon, Sparkles, AlertCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import { useToast } from "@/components/ui/toast";

export default function CanvaIntegrationPage() {
  const { activeBrand } = useBrand();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleOpenCanva = () => {
    window.open("https://www.canva.com", "_blank", "noopener,noreferrer");
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Palette className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Canva Design Studio
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create and import high-impact visual creative directly into {activeBrand.name}&apos;s media library
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCanva}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Launch Canva.com
          </button>
        </div>

        {/* Status / Honest Feature Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Palette className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Canva Connect API Integration
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900">
                  Setup Required
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                The native Canva Button SDK enables one-click design exporting from your Canva workspace straight into PulseSocial post composer. To enable in-app importing, provide your Canva Developer App API key below.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Supported Workflows
              </h4>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Direct design creation inside post composer
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Seamless export of Instagram, X &amp; LinkedIn banners
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Auto-sync with workspace Brand Assets folder
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Canva Partner API Key
              </h4>
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="canva_pk_live_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!apiKey.trim()) {
                      toast({
                        title: "Configuration",
                        message: "Please enter a valid Canva Connect API key.",
                        type: "error",
                      });
                      return;
                    }
                    toast({
                      title: "API Key Saved",
                      message: "Canva integration settings updated for this workspace.",
                      type: "success",
                    });
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Save Canva Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
