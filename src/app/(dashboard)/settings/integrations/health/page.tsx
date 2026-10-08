import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ApiHealthCheckView } from "@/components/settings/ApiHealthCheckView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function IntegrationsHealthPage() {
  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <Link
            href="/settings?tab=integrations"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Integration API Health & Compliance Audit
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Settings &rarr; Integrations &rarr; API Health
            </p>
          </div>
        </div>

        <ApiHealthCheckView />
      </div>
    </AppLayout>
  );
}
