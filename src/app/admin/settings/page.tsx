"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Sparkles,
  Mail,
  Clock,
  Palette,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [platformName, setPlatformName] = useState("PulseSocial");
  const [defaultTimezone, setDefaultTimezone] = useState("UTC");
  const [brandColor, setBrandColor] = useState("#6F52B5");
  const [requireApproval, setRequireApproval] = useState(false);
  const [aiAutoSuggest, setAiAutoSuggest] = useState(true);
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [geminiModel, setGeminiModel] = useState("gemini-1.5-flash");
  const [maxMediaMb, setMaxMediaMb] = useState(25);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      const s = data.settings;
      if (s) {
        setPlatformName(s.platformName || "PulseSocial");
        setDefaultTimezone(s.defaultTimezone || "UTC");
        setBrandColor(s.brandColor || "#6F52B5");
        setRequireApproval(!!s.requireApproval);
        setAiAutoSuggest(s.aiAutoSuggest ?? true);
        setNotificationsEmail(s.notificationsEmail ?? true);
        setGeminiModel(s.geminiAiModel || "gemini-1.5-flash");
        setMaxMediaMb(s.maxMediaUploadMb || 25);
      }
    } catch (err: any) {
      toast({
        title: "Error Loading Settings",
        message: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultTimezone,
          brandColor,
          requireApproval,
          aiAutoSuggest,
          notificationsEmail,
        }),
      });
      if (!res.ok) throw new Error("Failed to save settings");

      toast({
        title: "Settings Saved",
        message: "Platform settings have been updated in the database.",
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Save Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Platform Settings & Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global operational policies, approval workflows, AI runtime, and brand styling tokens.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-2xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Reload</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6F52B5]" />
          <p className="text-xs">Loading platform configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* General & Branding Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Palette className="w-4 h-4 text-[#6F52B5]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Brand & Localization
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={platformName}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 font-medium cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Configured in app metadata</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Default Organization Timezone
                </label>
                <select
                  value={defaultTimezone}
                  onChange={(e) => setDefaultTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Brand Color Accent
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Publishing Governance & AI Policy */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Shield className="w-4 h-4 text-[#6F52B5]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Publishing Governance & Automation
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#6F52B5] focus:ring-[#6F52B5]"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Require Approval For Member Posts
                  </span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">
                    When active, posts scheduled by regular members must be approved by a workspace owner or admin before queueing.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiAutoSuggest}
                  onChange={(e) => setAiAutoSuggest(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#6F52B5] focus:ring-[#6F52B5]"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Enable Gemini AI Auto-Suggestions
                  </span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">
                    Allows team members to use Gemini-powered headline, hashtag, and tone optimization in the post composer.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEmail}
                  onChange={(e) => setNotificationsEmail(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#6F52B5] focus:ring-[#6F52B5]"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    System Email Notifications
                  </span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">
                    Dispatch transactional email alerts on publishing failures, token expirations, and team invitations.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Infrastructure Specs (Informational) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-[#6F52B5]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Infrastructure Specs & Limits
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  AI Model
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 block">
                  {geminiModel}
                </span>
                <span className="text-[10px] text-slate-400">Google Generative AI</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  Max Media Size
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 block">
                  {maxMediaMb} MB
                </span>
                <span className="text-[10px] text-slate-400">Per image/video upload</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  Session TTL
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 block">
                  24 Hours
                </span>
                <span className="text-[10px] text-slate-400">JWT Token Expiry</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#6F52B5] hover:bg-[#59409A] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
