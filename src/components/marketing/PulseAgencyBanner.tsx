"use client";

import React from "react";
import Link from "next/link";
import { Users, Shield, CheckCircle2, ArrowRight, Building2, Sparkles } from "lucide-react";

export function PulseAgencyBanner() {
  return (
    <section className="py-20 sm:py-24 bg-[#fef3c7]/80 dark:bg-amber-950/20 text-slate-800 dark:text-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              PulseSocial for Agencies
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Manage social media for all your clients with a single platform that's perfect for agencies. Set up your agency-branded social media dashboard and invite your clients to be a part of it.
            </p>
            <div className="pt-2">
              <Link
                href="/solutions#agencies"
                className="inline-flex items-center px-6 sm:px-8 py-3 rounded-md border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-xs"
              >
                <span>LEARN MORE</span>
              </Link>
            </div>
          </div>

          {/* Right Agency Interactive Visual Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 p-5 sm:p-6 shadow-xl text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    Apex Media Group • Multi-Client Portal
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                  Agency Tier
                </span>
              </div>

              {/* Client List Switcher */}
              <div className="space-y-2">
                {[
                  { name: "Nordic Coffee Co.", accounts: "4 Channels", status: "All Approved", active: true },
                  { name: "Velocity EV Motors", accounts: "6 Channels", status: "2 Pending Review", active: false },
                  { name: "Lumina Skincare Global", accounts: "8 Channels", status: "Scheduled", active: false },
                ].map((client) => (
                  <div
                    key={client.name}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                      client.active
                        ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
                        : "bg-slate-50 dark:bg-slate-850 border-slate-200/60 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {client.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{client.accounts}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  White-label custom domain active
                </span>
                <span className="text-slate-400">Unlimited client seats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
