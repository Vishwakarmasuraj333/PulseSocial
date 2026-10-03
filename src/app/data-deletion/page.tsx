import React from "react";
import Link from "next/link";
import { Trash2, ArrowLeft, ShieldCheck, Mail, CheckCircle2, RefreshCw } from "lucide-react";

export const metadata = {
  title: "User Data Deletion Instructions | PulseSocial",
  description: "Official instructions for deleting your Facebook and PulseSocial account data.",
};

export default function DataDeletionPage() {
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
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                User Data Deletion Instructions
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Compliant with Meta Platform Terms & GDPR Article 17 (Right to Erasure)
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>How to Delete Your Data from PulseSocial</span>
            </h2>
            <p>
              PulseSocial values your privacy and provides full control over your data. According to Meta Platform policies for Facebook and Instagram Login apps, users have the right to request deletion of any data associated with their Facebook account.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              Method 1: Disconnect via Facebook Account Settings (Instant)
            </h3>
            <p>
              You can instantly revoke PulseSocial&apos;s access and delete cached data directly from your Facebook settings:
            </p>
            <ol className="list-decimal list-inside space-y-2 bg-slate-800/60 p-5 rounded-xl border border-slate-700/60">
              <li>Log in to your Facebook profile.</li>
              <li>Go to <strong>Settings & Privacy</strong> &rarr; <strong>Settings</strong>.</li>
              <li>In the left sidebar, click on <strong>Apps and Websites</strong>.</li>
              <li>Locate <strong>pulsesocial</strong> in the list of active apps.</li>
              <li>Click <strong>Remove</strong> next to PulseSocial.</li>
              <li>Check the box to confirm you want to delete all posts, videos, or events published on your behalf, then click <strong>Remove</strong>.</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              Method 2: In-App Disconnection (PulseSocial Dashboard)
            </h3>
            <ol className="list-decimal list-inside space-y-2 bg-slate-800/60 p-5 rounded-xl border border-slate-700/60">
              <li>Log in to your PulseSocial dashboard at <code>https://pulsesocial1.vercel.app/login</code>.</li>
              <li>Navigate to <strong>Social Accounts</strong> or <strong>Connections</strong>.</li>
              <li>Locate the connected Facebook Page or Instagram account.</li>
              <li>Click the <strong>Disconnect</strong> button.</li>
              <li>All encrypted OAuth tokens, cached profile data, and scheduled draft posts will be permanently purged from our database immediately.</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              Method 3: Email Deletion Request (Complete Account Purge)
            </h3>
            <p>
              If you want us to manually delete all traces of your account, email, and historical logs, send an email to our data privacy team:
            </p>
            <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/30 flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Email Data Privacy Officer:</p>
                <p className="text-xs font-mono text-purple-300">itsurya9930@gmail.com</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Subject: &quot;Data Deletion Request - [Your Name / Page Name]&quot;
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Your request will be acknowledged within 24 hours and all data will be purged within 48 hours in compliance with Meta guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
