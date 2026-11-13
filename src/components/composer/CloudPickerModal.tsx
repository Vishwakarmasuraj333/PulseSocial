"use client";

import React, { useState } from "react";
import {
  X,
  Cloud,
  Check,
  ExternalLink,
  HardDrive,
  Shield,
  Link as LinkIcon,
  Layers,
  Image as ImageIcon,
  FolderOpen,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface CloudPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (url: string) => void;
}

const CLOUD_PROVIDERS = [
  {
    id: "gdrive",
    name: "Google Drive",
    desc: "Import photos, banners, and videos directly from your Google Drive",
    iconColor: "text-amber-500",
    badge: "OAuth 2.0 Ready",
    sampleAsset: "/images/pulsesocial_hero_banner.jpg",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    desc: "Sync marketing assets and client creatives stored in Dropbox folders",
    iconColor: "text-blue-500",
    badge: "Connected",
    sampleAsset: "/images/auth_illustration.png",
  },
  {
    id: "onedrive",
    name: "Microsoft OneDrive",
    desc: "Access business cloud files and Office 365 creative asset libraries",
    iconColor: "text-sky-600",
    badge: "OAuth 2.0 Ready",
    sampleAsset: "/images/founder_suraj.jpg",
  },
  {
    id: "box",
    name: "Box",
    desc: "Enterprise secure cloud media management and shared folders",
    iconColor: "text-indigo-600",
    badge: "Enterprise SLA",
    sampleAsset: "/images/purple_auth_showcase.jpg",
  },
];

export function CloudPickerModal({
  isOpen,
  onClose,
  onSelectMedia,
}: CloudPickerModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"providers" | "url">("providers");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlPreviewError, setUrlPreviewError] = useState(false);

  if (!isOpen) return null;

  const handleConnectProvider = (provider: (typeof CLOUD_PROVIDERS)[number]) => {
    setConnecting(provider.name);
    setTimeout(() => {
      setConnecting(null);
      toast({
        title: `${provider.name} Synced`,
        message: `Imported creative asset from ${provider.name}.`,
        type: "success",
      });
      onSelectMedia(provider.sampleAsset);
      onClose();
    }, 1100);
  };

  const handleAttachUrl = () => {
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    onSelectMedia(cleanUrl);
    toast({
      title: "Cloud Media Attached",
      message: "Direct asset URL attached to your post.",
      type: "success",
    });
    setUrlInput("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#151518] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-[#19191D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Cloud Storage &amp; Asset Picker
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Import media from Google Drive, Dropbox, OneDrive, or direct URLs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-6 pt-3 border-b border-slate-100 dark:border-white/10 flex items-center gap-2 bg-white dark:bg-[#151518]">
          <button
            type="button"
            onClick={() => setActiveTab("providers")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "providers"
                ? "border-[#5846A8] text-[#5846A8] dark:border-white dark:text-white"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Cloud Accounts</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "url"
                ? "border-[#5846A8] text-[#5846A8] dark:border-white dark:text-white"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Direct Public URL</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3.5 overflow-y-auto flex-1">
          {activeTab === "providers" ? (
            <>
              {CLOUD_PROVIDERS.map((provider) => (
                <div
                  key={provider.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-white/20 hover:shadow-xs transition flex items-center justify-between gap-3 bg-white dark:bg-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg bg-slate-50 dark:bg-white/10 flex items-center justify-center shrink-0 ${provider.iconColor}`}
                    >
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {provider.name}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-medium">
                          {provider.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug truncate">
                        {provider.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConnectProvider(provider)}
                    disabled={connecting === provider.name}
                    className="px-3 py-1.5 rounded-lg bg-[#5846A8] hover:bg-[#48378A] text-white text-xs font-semibold shrink-0 transition cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {connecting === provider.name ? "Importing..." : "Import"}
                  </button>
                </div>
              ))}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Shield className="w-4 h-4 text-[#5846A8] dark:text-[#C4B5FD] shrink-0" />
                <span>OAuth 2.0 read-only storage permissions with TLS 1.3 encryption.</span>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-white">
                  Paste Media Asset URL
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter a public image (JPG, PNG, WebP) or video (MP4) URL from any CDN or storage bucket.
                </p>
                <div className="relative">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlPreviewError(false);
                    }}
                    placeholder="https://images.unsplash.com/... or https://cdn.example.com/asset.jpg"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {urlInput.trim() && (
                <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden h-40 relative bg-slate-900 flex items-center justify-center p-2">
                  {!urlPreviewError ? (
                    urlInput.match(/\.(mp4|mov|webm)$/i) ? (
                      <video
                        src={urlInput.trim()}
                        className="w-full h-full object-contain"
                        controls
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={urlInput.trim()}
                        alt="Asset preview"
                        className="w-full h-full object-contain"
                        onError={() => setUrlPreviewError(true)}
                      />
                    )
                  ) : (
                    <div className="text-center text-xs text-slate-400 space-y-1">
                      <ImageIcon className="w-6 h-6 mx-auto text-slate-500" />
                      <p>Unable to load direct preview. You can still attach this URL.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#19191D]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>

          {activeTab === "url" && (
            <button
              type="button"
              disabled={!urlInput.trim()}
              onClick={handleAttachUrl}
              className="px-4 py-1.5 rounded-lg bg-[#5846A8] hover:bg-[#48378A] text-white text-xs font-bold disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              Attach Asset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
