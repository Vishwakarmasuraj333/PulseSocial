"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 shadow-xl shadow-indigo-500/10">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-3">
        404 · Page Not Found
      </div>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-white">
        Lost in the Pulse Stream?
      </h1>
      <p className="text-slate-400 max-w-md text-sm leading-relaxed mb-8">
        The social dashboard or resource you requested could not be located. It might have moved or the link may have expired.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/posts/new">
          <Button variant="outline" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go to Post Composer
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/25 flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
