"use client";

import React, { useState } from "react";
import { X, Sparkles, ExternalLink } from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { Button } from "@/components/ui/button";

interface InstagramConnectOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (method: "instagram" | "facebook") => void;
}

export function InstagramConnectOptionModal({
  isOpen,
  onClose,
  onProceed,
}: InstagramConnectOptionModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"instagram" | "facebook">("instagram");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md overflow-hidden shrink-0">
              {renderPlatformIcon("instagram", 24)}
            </div>
            <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">
              Connect Instagram
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle */}
        <div className="px-6 pb-4">
          <p className="text-xs text-slate-500 font-medium">
            Choose how you want to connect your Instagram profile:
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-3.5">
          {/* Option 1: Connect via Instagram */}
          <div
            onClick={() => setSelectedMethod("instagram")}
            className={`p-4 rounded-xl border-2 transition cursor-pointer ${
              selectedMethod === "instagram"
                ? "border-blue-500 bg-blue-50/20"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <input
                  type="radio"
                  name="ig-method"
                  checked={selectedMethod === "instagram"}
                  onChange={() => setSelectedMethod("instagram")}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    Connect via Instagram
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-600 text-white leading-none">
                    NEW
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Use your Instagram login to connect to Social.
                </p>

                {/* Callout box */}
                <div className="mt-3 p-2.5 rounded-lg bg-blue-50/80 border border-blue-100/90 text-[11px] text-slate-600 leading-relaxed italic">
                  * However, you&apos;ll be unable to add location, manage Ad comments or view Impressions and Story stats on Social due to API limitations.
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Connect via Facebook */}
          <div
            onClick={() => setSelectedMethod("facebook")}
            className={`p-4 rounded-xl border-2 transition cursor-pointer ${
              selectedMethod === "facebook"
                ? "border-blue-500 bg-blue-50/20"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <input
                  type="radio"
                  name="ig-method"
                  checked={selectedMethod === "facebook"}
                  onChange={() => setSelectedMethod("facebook")}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-slate-900">
                  Connect via Facebook
                </span>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Use this option if you have linked your Instagram profile to your Facebook page. You will be redirected to Facebook for authorization.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/80 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-semibold h-9 px-4 text-slate-600 hover:text-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onProceed(selectedMethod)}
            className="bg-[#0f71d3] hover:bg-blue-600 text-white font-semibold text-xs h-9 px-6 shadow-xs"
          >
            Proceed
          </Button>
        </div>
      </div>
    </div>
  );
}
