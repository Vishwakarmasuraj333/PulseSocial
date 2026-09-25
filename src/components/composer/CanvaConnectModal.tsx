"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { CanvaIcon } from "@/components/icons/PlatformIcons";
import {
  X,
  ExternalLink,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Layers,
  Sparkles,
  Download,
  Trash2,
} from "lucide-react";

interface CanvaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (mediaUrl: string, title?: string) => void;
}

export function CanvaConnectModal({
  isOpen,
  onClose,
  onSelectMedia,
}: CanvaConnectModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  const [redirectUri, setRedirectUri] = useState("http://localhost:3000/api/integrations/canva/callback");
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  // Designs
  const [designs, setDesigns] = useState<any[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [exportingDesignId, setExportingDesignId] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"designs" | "create" | "settings">("designs");

  // Fetch status on open
  const checkStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/integrations/canva/status");
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(data.isConfigured);
        setIsConnected(data.isConnected);
        setConnectedAccount(data.account);
        if (data.redirectUri) setRedirectUri(data.redirectUri);

        if (data.isConnected) {
          fetchDesigns();
        }
      }
    } catch (err) {
      console.error("Failed to check Canva status:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesigns = async () => {
    try {
      setLoadingDesigns(true);
      const res = await fetch("/api/integrations/canva/designs");
      if (res.ok) {
        const data = await res.json();
        setDesigns(data.designs || []);
      }
    } catch (err) {
      console.error("Failed to fetch Canva designs:", err);
    } finally {
      setLoadingDesigns(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  // Listen for OAuth postMessage
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "CANVA_CONNECTED") {
        if (e.data.success) {
          toast({
            title: "Canva Connected",
            message: "Your Canva account has been successfully connected to PulseSocial.",
            type: "success",
          });
          checkStatus();
        } else {
          toast({
            title: "Connection Failed",
            message: e.data.message || "Failed to authorize Canva connection.",
            type: "error",
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Initiate OAuth flow
  const handleConnectCanva = async () => {
    try {
      const res = await fetch("/api/integrations/canva/connect", {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "CANVA_CREDENTIALS_MISSING") {
          setIsConfigured(false);
          toast({
            title: "Canva API Keys Needed",
            message: "Configure CANVA_CLIENT_ID and CANVA_CLIENT_SECRET in .env to connect your real Canva account.",
            type: "warning",
          });
          return;
        }
        throw new Error(data.message || "Failed to start Canva authorization");
      }

      if (data.authUrl) {
        const width = 600;
        const height = 750;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          data.authUrl,
          "CanvaOAuth",
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
        );

        if (!popup) {
          window.location.href = data.authUrl;
        }
      }
    } catch (err: any) {
      toast({
        title: "Connection Error",
        message: err.message || "Could not launch Canva authentication.",
        type: "error",
      });
    }
  };

  // Disconnect Canva
  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Canva account?")) return;
    try {
      const res = await fetch("/api/integrations/canva/status", { method: "DELETE" });
      if (res.ok) {
        setIsConnected(false);
        setConnectedAccount(null);
        setDesigns([]);
        toast({
          title: "Canva Disconnected",
          message: "Canva account was removed.",
          type: "info",
        });
      }
    } catch {
      toast({
        title: "Error",
        message: "Failed to disconnect Canva account.",
        type: "error",
      });
    }
  };

  // Export and attach design
  const handleExportDesign = async (designId: string, title?: string) => {
    try {
      setExportingDesignId(designId);
      toast({
        title: "Exporting from Canva",
        message: "Preparing high-resolution design asset...",
        type: "info",
      });

      const res = await fetch("/api/integrations/canva/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export", designId, format: "jpg" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || "Export failed");
      }

      const data = await res.json();
      if (data.downloadUrl) {
        onSelectMedia(data.downloadUrl, title || "Canva Design");
        toast({
          title: "Design Attached!",
          message: "Imported high-resolution Canva graphic into your post.",
          type: "success",
        });
        onClose();
      }
    } catch (err: any) {
      toast({
        title: "Export Failed",
        message: err.message || "Could not export design from Canva.",
        type: "error",
      });
    } finally {
      setExportingDesignId(null);
    }
  };

  // Create new design
  const handleCreateDesign = async (preset: "instagram_post" | "facebook_post" | "twitter_post" | "social_story") => {
    try {
      toast({
        title: "Creating in Canva",
        message: "Setting up new design canvas...",
        type: "info",
      });

      const res = await fetch("/api/integrations/canva/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          designType: preset,
          title: `PulseSocial Design - ${new Date().toLocaleDateString()}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.edit_url) {
          window.open(data.edit_url, "_blank");
          toast({
            title: "Opened in Canva",
            message: "Your new design has opened in Canva. When finished, return here to export it!",
            type: "success",
          });
          setTimeout(fetchDesigns, 3000);
        }
      } else {
        // Direct Canva template fallback
        const urls = {
          instagram_post: "https://www.canva.com/create/instagram-posts/",
          facebook_post: "https://www.canva.com/create/facebook-posts/",
          twitter_post: "https://www.canva.com/create/twitter-posts/",
          social_story: "https://www.canva.com/create/stories/",
        };
        window.open(urls[preset] || "https://www.canva.com", "_blank");
      }
    } catch {
      window.open("https://www.canva.com", "_blank");
    }
  };

  const copyRedirectUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
    toast({
      title: "Redirect URI Copied",
      message: "Add this Redirect URI in your Canva Developers Console.",
      type: "info",
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      className="p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white text-slate-800"
    >
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-xs shrink-0 flex items-center justify-center bg-white border border-slate-100">
              <CanvaIcon size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Canva Connect</h3>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Canva Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Create, customize, and directly import professional social graphics from Canva.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-xs">Connecting with Canva...</p>
            </div>
          ) : !isConnected ? (
            /* Unconnected State */
            <div className="max-w-md mx-auto py-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C4CC]/10 via-[#7D2AE8]/10 to-[#7D2AE8]/20 flex items-center justify-center mx-auto border border-[#00C4CC]/20 shadow-xs">
                <CanvaIcon size={44} />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  Connect Your Canva Account
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Authorize PulseSocial via official Canva OAuth 2.0 to access your designs, launch
                  the editor, and seamlessly attach high-res creatives to your posts.
                </p>
              </div>

              {/* Security Banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Official Canva Connect API Integration
                </div>
                <p className="text-[11px] text-slate-500">
                  Secured with PKCE verification and AES-256 token encryption. No passwords stored.
                </p>
              </div>

              {/* Developer Credentials Helper if not configured */}
              {!isConfigured && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-left text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Configure Canva Developer Credentials
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed mb-2">
                    Create an app at{" "}
                    <a
                      href="https://www.canva.com/developers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-amber-900"
                    >
                      canva.com/developers
                    </a>{" "}
                    and set your Client ID and Client Secret in <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code>.
                  </p>
                  <div className="flex items-center gap-2 bg-white/90 p-2 rounded border border-amber-200 text-[11px]">
                    <span className="text-slate-400 font-mono truncate flex-1">{redirectUri}</span>
                    <button
                      type="button"
                      onClick={copyRedirectUri}
                      className="px-2 py-1 bg-amber-200/60 hover:bg-amber-200 text-amber-900 font-semibold rounded flex items-center gap-1 transition"
                    >
                      {copiedRedirect ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedRedirect ? "Copied" : "Copy URI"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Connect Button */}
              <button
                type="button"
                onClick={handleConnectCanva}
                className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs tracking-wide shadow-md transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#00C4CC] via-[#5C32E6] to-[#7D2AE8] hover:opacity-95"
              >
                <CanvaIcon size={18} />
                <span>Connect Canva</span>
              </button>
            </div>
          ) : (
            /* Connected State */
            <div className="space-y-5">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("designs")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeTab === "designs"
                        ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    My Canva Designs ({designs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("create")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeTab === "create"
                        ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    + Create New Design
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeTab === "settings"
                        ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Settings
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchDesigns}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 transition"
                  title="Refresh designs"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingDesigns ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* TAB 1: DESIGNS GRID */}
              {activeTab === "designs" && (
                <div>
                  {loadingDesigns ? (
                    <div className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                      <p className="text-xs">Fetching your Canva creations...</p>
                    </div>
                  ) : designs.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-3">
                      <Layers className="w-10 h-10 mx-auto text-slate-300" />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">No Canva designs found yet</p>
                        <p className="text-[11px] text-slate-400">
                          Create a new social creative in Canva and it will appear here instantly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("create")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create in Canva
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {designs.map((design) => {
                        const isExporting = exportingDesignId === design.id;
                        return (
                          <div
                            key={design.id}
                            className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col"
                          >
                            <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                              {design.thumbnail?.url ? (
                                <Image
                                  src={design.thumbnail.url}
                                  alt={design.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                                  <Layers className="w-8 h-8" />
                                </div>
                              )}

                              {/* Hover action overlay */}
                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                                <button
                                  type="button"
                                  disabled={isExporting}
                                  onClick={() => handleExportDesign(design.id, design.title)}
                                  className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold shadow hover:bg-blue-50 transition flex items-center gap-1.5"
                                >
                                  {isExporting ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                  ) : (
                                    <Download className="w-3.5 h-3.5 text-blue-600" />
                                  )}
                                  <span>{isExporting ? "Exporting..." : "Attach"}</span>
                                </button>
                                {design.urls?.edit_url && (
                                  <a
                                    href={design.urls.edit_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition"
                                    title="Edit in Canva"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="p-2.5">
                              <h5 className="font-semibold text-xs text-slate-800 truncate" title={design.title}>
                                {design.title}
                              </h5>
                              <p className="text-[10px] text-slate-400">
                                {design.updated_at
                                  ? `Updated ${new Date(design.updated_at).toLocaleDateString()}`
                                  : "Canva Design"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREATE NEW DESIGN PRESETS */}
              {activeTab === "create" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        id: "instagram_post",
                        title: "Instagram Square Post",
                        size: "1080 × 1080 px",
                        desc: "Ideal for Instagram, Facebook, and Threads feeds",
                        color: "from-pink-500 to-amber-400",
                      },
                      {
                        id: "facebook_post",
                        title: "Facebook & LinkedIn Post",
                        size: "1200 × 630 px",
                        desc: "Landscape optimized for feed visibility",
                        color: "from-blue-600 to-indigo-600",
                      },
                      {
                        id: "twitter_post",
                        title: "X (Twitter) Post",
                        size: "1200 × 675 px",
                        desc: "16:9 banner proportion for timeline engagement",
                        color: "from-slate-800 to-slate-950",
                      },
                      {
                        id: "social_story",
                        title: "Social Story & Reel",
                        size: "1080 × 1920 px",
                        desc: "9:16 full-screen vertical story/reel canvas",
                        color: "from-purple-600 to-violet-500",
                      },
                    ].map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleCreateDesign(template.id as any)}
                        className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 text-left transition flex items-start gap-3 group cursor-pointer shadow-2xs"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${template.color} text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs`}
                        >
                          <Layers className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-xs text-slate-800 group-hover:text-blue-600 transition">
                              {template.title}
                            </h5>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition" />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 block">{template.size}</span>
                          <p className="text-[11px] text-slate-500 mt-1 leading-tight">{template.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS & ACCOUNT INFO */}
              {activeTab === "settings" && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Connected Account
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">
                        {connectedAccount?.displayName || "Canva Account"}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        ID: {connectedAccount?.providerAccountId || "canva_user"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Disconnect Canva
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Token Status: <b className="text-emerald-600 font-semibold">Active & Auto-Refreshing</b>
                    </span>
                    <button
                      type="button"
                      onClick={handleConnectCanva}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Reconnect Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
