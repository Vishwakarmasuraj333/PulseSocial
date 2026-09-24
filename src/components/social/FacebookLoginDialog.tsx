"use client";

import React, { useState } from "react";
import Image from "next/image";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useBrand } from "@/context/BrandContext";
import { useToast } from "@/components/ui/toast";
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface FacebookLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FacebookLoginDialog({
  isOpen,
  onClose,
  onSuccess,
}: FacebookLoginDialogProps) {
  const { activeBrand } = useBrand();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isOpen) return null;

  const handleLaunchOfficialOAuth = () => {
    setIsRedirecting(true);
    toast({
      title: "Redirecting to Meta",
      message: "Opening official Facebook OAuth 2.0 authorization screen...",
      type: "info",
    });
    // Direct redirect to real Facebook OAuth authorization endpoint
    window.location.href = "/api/social/facebook/connect";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold">
              f
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Official Facebook Authorization</h3>
              <p className="text-[11px] text-slate-500">Secure Meta Graph API OAuth 2.0</p>
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
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-[#1877F2] shrink-0" />
            <span>
              PulseSocial connects directly to Meta Graph API. We never see or store your Facebook password.
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">
              Authorizing will grant PulseSocial permission to:
            </p>
            <ul className="space-y-1.5 pl-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Publish approved posts & reels to your selected Facebook Pages</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Read engagement metrics, reach, and performance analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Manage inbox comments and direct interactions</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Connecting for workspace: <b className="text-slate-700 font-semibold">{activeBrand.name}</b>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isRedirecting}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunchOfficialOAuth}
            disabled={isRedirecting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <span>{isRedirecting ? "Connecting to Meta..." : "Authorize on Facebook"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
