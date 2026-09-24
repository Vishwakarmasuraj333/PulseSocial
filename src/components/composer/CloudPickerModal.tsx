"use client";

import React, { useState } from "react";
import { X, Cloud, Check, ExternalLink, HardDrive, Shield } from "lucide-react";
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
    desc: "Import photos and videos directly from your Google Drive",
    iconColor: "text-amber-500",
    connected: false,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    desc: "Sync marketing assets stored in your Dropbox folders",
    iconColor: "text-blue-500",
    connected: false,
  },
  {
    id: "onedrive",
    name: "Microsoft OneDrive",
    desc: "Access business cloud files and creative libraries",
    iconColor: "text-sky-600",
    connected: false,
  },
  {
    id: "box",
    name: "Box",
    desc: "Enterprise secure cloud media management",
    iconColor: "text-indigo-600",
    connected: false,
  },
];

export function CloudPickerModal({
  isOpen,
  onClose,
  onSelectMedia,
}: CloudPickerModalProps) {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = (providerName: string) => {
    setConnecting(providerName);
    setTimeout(() => {
      setConnecting(null);
      toast({
        title: `${providerName} Connected`,
        message: "Loaded 1 sample cloud asset into your composer.",
        type: "success",
      });
      onSelectMedia("/images/office_love_thumbnail.jpg");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Cloud Storage Picker</h3>
              <p className="text-[11px] text-slate-500">
                Connect and import assets from cloud providers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Providers List */}
        <div className="p-6 space-y-3">
          {CLOUD_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition flex items-center justify-between gap-3 bg-white"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center ${provider.iconColor}`}>
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{provider.name}</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">{provider.desc}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleConnect(provider.name)}
                disabled={connecting === provider.name}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 transition cursor-pointer disabled:opacity-50"
              >
                {connecting === provider.name ? "Opening..." : "Connect"}
              </button>
            </div>
          ))}

          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>OAuth 2.0 end-to-end encrypted storage permissions.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
