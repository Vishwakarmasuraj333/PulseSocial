"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function PulseSuiteTopNav() {
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  const suiteApps = [
    { label: "Marketing Plus", href: "/marketing-plus" },
    { label: "Backstage", href: "/backstage" },
    { label: "CRM", href: "/crm" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Commerce", href: "/commerce" },
    { label: "Thrive", href: "/thrive" },
  ];

  return (
    <div className="hidden md:block bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 py-1.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-6 font-medium">
          <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            PulseSuite
          </span>

          {suiteApps.map((app) => (
            <Link
              key={app.label}
              href={app.href}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {app.label}
            </Link>
          ))}

          <div className="relative">
            <button
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className="flex items-center gap-0.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <span>All Products</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isProductsOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs">
                <Link
                  href="/products/analytics"
                  className="block px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
                >
                  Pulse Analytics
                </Link>
                <Link
                  href="/products/desk"
                  className="block px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
                >
                  Pulse Desk
                </Link>
                <Link
                  href="/products/flow"
                  className="block px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
                >
                  Pulse Flow Automations
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
          >
            Sign In
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link
            href="/contact"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
}
