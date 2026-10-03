import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Eye, Database, Globe } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | PulseSocial",
  description: "Privacy Policy and Data Protection declaration for PulseSocial platform.",
};

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Privacy Policy
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Last updated: October 2026 • Effective immediately for all PulseSocial users
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 text-sm space-y-6 leading-relaxed">
          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>1. Overview & Commitment</span>
            </h2>
            <p>
              PulseSocial (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides an enterprise social media management SaaS platform that enables brands, businesses, and creators to connect social networks, compose posts, analyze audience telemetry, and automate workflows.
            </p>
            <p>
              We are committed to protecting your personal information and your right to privacy in strict compliance with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and Meta Platform Terms.
            </p>
          </section>

          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>2. Information We Collect</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>
                <strong>Account Credentials:</strong> Your name, email address, password hash, and organization membership.
              </li>
              <li>
                <strong>Social Network Tokens (OAuth):</strong> When you connect Facebook Pages, Instagram, LinkedIn, X, or YouTube, we receive short-lived and long-lived OAuth access tokens. These tokens are stored encrypted at rest using hardware-grade <strong>AES-256-GCM encryption</strong>.
              </li>
              <li>
                <strong>Public Profile & Page Telemetry:</strong> Page names, IDs, profile pictures, follower counters, and post engagement analytics fetched via official Graph APIs.
              </li>
              <li>
                <strong>We NEVER Collect:</strong> We never collect, see, or store your personal passwords to any third-party social network (such as your Facebook or Instagram password).
              </li>
            </ul>
          </section>

          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span>3. How We Use Your Data</span>
            </h2>
            <p>
              We process data solely to provide the services requested by you, including:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li>Publishing and scheduling authorized content to your connected accounts.</li>
              <li>Aggregating engagement metrics (likes, impressions, comments) in your unified analytics dashboard.</li>
              <li>Providing AI content generation suggestions through Google Gemini 3.8 Flash.</li>
              <li>Detecting security threats and maintaining audit logs.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>4. Data Retention & Deletion</span>
            </h2>
            <p>
              You maintain full ownership of your data at all times. You can disconnect your social accounts or request complete erasure of your data at any time.
            </p>
            <p>
              For automated instructions on requesting data deletion under Meta Platform policies, please visit our dedicated{" "}
              <Link href="/data-deletion" className="text-purple-400 underline font-semibold">
                User Data Deletion Instructions page
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white">5. Contact Information</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to our privacy officer at:
            </p>
            <p className="font-mono text-purple-300">
              Email: itsurya9930@gmail.com<br />
              Platform: PulseSocial SaaS Platform
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
