"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { FolderOpen, Upload, Search, Trash2, Copy, Tag } from "lucide-react";

export default function MediaLibraryPage() {
  const { toast } = useToast();
  const [activeFolder, setActiveFolder] = useState("all");

  const [assets, setAssets] = useState([
    {
      id: "1",
      fileName: "hero_launch_creative.png",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      type: "IMAGE",
      folder: "campaigns",
      size: "1.4 MB",
      date: "Sep 20, 2026",
    },
    {
      id: "2",
      fileName: "analytics_preview.png",
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
      type: "IMAGE",
      folder: "product",
      size: "820 KB",
      date: "Sep 18, 2026",
    },
    {
      id: "3",
      fileName: "creator_lifestyle.png",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      type: "IMAGE",
      folder: "social",
      size: "2.1 MB",
      date: "Sep 15, 2026",
    },
  ]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", message: "Asset URL copied to clipboard", type: "success" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Brand Media Library
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Secure object storage abstraction for creative images, video assets and brand photography
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold">
              <Upload className="w-4 h-4 mr-1.5" /> Upload Asset
            </Button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden group hover:shadow-md transition">
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                <Image
                  src={asset.url}
                  alt={asset.fileName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {asset.fileName}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{asset.folder}</span>
                  <span>{asset.size}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleCopyUrl(asset.url)}
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3 h-3" /> Copy URL
                  </button>
                  <Button
                    size="sm"
                    onClick={() => (window.location.href = `/posts/new`)}
                    className="text-xs h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    Use in Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
