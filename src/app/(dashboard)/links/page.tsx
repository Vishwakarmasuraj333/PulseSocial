"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBrand } from "@/context/BrandContext";
import { useToast } from "@/components/ui/toast";
import {
  Link2,
  Plus,
  ExternalLink,
  Copy,
  Check,
  MousePointerClick,
  TrendingUp,
  Trash2,
  Search,
  Globe,
  Sliders,
  Sparkles,
} from "lucide-react";

interface TriggerLinkItem {
  id: string;
  title: string;
  targetUrl: string;
  slug: string;
  clicks: number;
  utmCampaign: string;
  createdAt: string;
}

const DEFAULT_LINKS: TriggerLinkItem[] = [
  {
    id: "link-1",
    title: "Official Brand Portal Bio Link",
    targetUrl: "https://pulsesocial1.vercel.app",
    slug: "bio",
    clicks: 1420,
    utmCampaign: "social_bio",
    createdAt: "Active",
  },
  {
    id: "link-2",
    title: "Q4 Seasonal Product Launch Discount",
    targetUrl: "https://pulsesocial1.vercel.app/pricing",
    slug: "discount25",
    clicks: 864,
    utmCampaign: "autumn_promo",
    createdAt: "Active",
  },
  {
    id: "link-3",
    title: "Exclusive YouTube Community Reel",
    targetUrl: "https://youtube.com/@PulseMediaGlobal",
    slug: "youtube-vip",
    clicks: 312,
    utmCampaign: "youtube_redirect",
    createdAt: "Active",
  },
];

export default function TriggerLinksPage() {
  const { activeBrand } = useBrand();
  const { toast } = useToast();
  const [links, setLinks] = useState<TriggerLinkItem[]>(DEFAULT_LINKS);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLinks = links.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.slug.toLowerCase().includes(search.toLowerCase()) ||
    l.targetUrl.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget.trim()) return;

    let cleanTarget = newTarget.trim();
    if (!cleanTarget.startsWith("http://") && !cleanTarget.startsWith("https://")) {
      cleanTarget = "https://" + cleanTarget;
    }

    const generatedSlug = newSlug.trim() || Math.random().toString(36).substring(2, 8);

    const newLinkItem: TriggerLinkItem = {
      id: `link-${Date.now()}`,
      title: newTitle.trim(),
      targetUrl: cleanTarget,
      slug: generatedSlug,
      clicks: 0,
      utmCampaign: "social_custom",
      createdAt: "Just now",
    };

    setLinks([newLinkItem, ...links]);
    setNewTitle("");
    setNewTarget("");
    setNewSlug("");
    setIsCreateOpen(false);
    toast({
      title: "Trigger Link Created",
      message: `Shortlink "/${newLinkItem.slug}" is now active.`,
      type: "success",
    });
  };

  const handleCopyLink = (slug: string, id: string) => {
    setCopiedId(id);
    const shortUrl = typeof window !== "undefined" ? `${window.location.origin}/r/${slug}` : `https://pulse.to/${slug}`;
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shortUrl);
    }
    toast({
      title: "Link Copied",
      message: `${shortUrl} copied to clipboard!`,
      type: "success",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
    toast({
      title: "Link Deleted",
      message: "Trigger link removed.",
      type: "info",
    });
  };

  return (
    <AppLayout>
      <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-[calc(100vh-60px)] p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Link2 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Trigger Links & Tracking
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Shorten links, track real-time social clicks, and attach UTM parameters for {activeBrand.name}.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/social-accounts"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              Social Planner Settings
            </Link>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Trigger Link</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Active Links</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{links.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Tracked Clicks</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {links.reduce((acc, l) => acc + l.clicks, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Click-Through Rate</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">18.4%</p>
            </div>
          </div>
        </div>

        {/* Links Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-sm px-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-transparent outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono pr-2">
              {filteredLinks.length} link{filteredLinks.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Title & Shortlink</th>
                  <th className="py-3 px-4">Destination Target</th>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{link.title}</div>
                      <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                        <span>pulse.to/{link.slug}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {link.targetUrl}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80">
                        {link.utmCampaign}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {link.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(link.slug, link.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#5846A8] hover:bg-purple-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Copy Short URL"
                        >
                          {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={link.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Open Destination"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(link.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Delete Link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Create Trigger Link</h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Link Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Summer Promo Instagram Reel Bio"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Destination Target URL
                  </label>
                  <input
                    type="text"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="https://yourwebsite.com/product"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Custom Slug (Optional)
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800">
                      pulse.to/
                    </span>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      placeholder="summer25"
                      className="w-full text-xs px-3.5 py-2.5 rounded-r-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 cursor-pointer"
                  >
                    Save Trigger Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
