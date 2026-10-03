import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Terms of Service | PulseSocial",
  description: "Terms of Service and User Agreement for PulseSocial.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to PulseSocial Home</span>
        </Link>

        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Terms of Service
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Last updated: October 2026 • Governs your use of PulseSocial
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 text-sm space-y-6 leading-relaxed">
          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>1. Acceptance of Terms</span>
            </h2>
            <p>
              By accessing, registering, or using PulseSocial, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
          </section>

          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>2. Third-Party Platform Terms</span>
            </h2>
            <p>
              PulseSocial integrates with external APIs provided by Meta Platforms, Inc. (Facebook, Instagram), LinkedIn Corporation, X Corp, Google LLC, and others. Your use of these services through PulseSocial is subject to their respective terms:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li>Meta Terms of Service and Platform Terms</li>
              <li>Google API Services User Data Policy and YouTube Terms</li>
              <li>LinkedIn Developer Agreement</li>
              <li>X Developer Terms</li>
            </ul>
          </section>

          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white">3. User Responsibilities & Acceptable Use</h2>
            <p>
              You agree not to use PulseSocial to publish unlawful, abusive, defamatory, harassing, or spam content. You are solely responsible for all content authored, scheduled, or published through your account.
            </p>
          </section>

          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white">4. Termination</h2>
            <p>
              You may terminate your account at any time. Upon termination, we will revoke and purge your stored tokens and scheduled posts from our database.
            </p>
          </section>

          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white">5. Contact</h2>
            <p>
              For legal inquiries regarding these terms, contact: <span className="font-mono text-purple-300">itsurya9930@gmail.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
