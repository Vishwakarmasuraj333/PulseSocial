import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { BrandProvider } from "@/context/BrandContext";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";
import { CURRENT_POLICY_VERSION, CONSENT_COOKIE_NAME } from "@/lib/consent/consent-config";

export const metadata: Metadata = {
  title: "PulseSocial — Enterprise Social Media Management Platform",
  description:
    "Unified social media management, direct OAuth connections, multi-network publishing, analytics, and team workflows.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const consentRaw = cookieStore.get(CONSENT_COOKIE_NAME)?.value;
  let initialHasConsent = false;
  let initialConsentState = null;

  if (consentRaw) {
    try {
      const parsed = JSON.parse(consentRaw);
      if (parsed.policyVersion === CURRENT_POLICY_VERSION) {
        initialHasConsent = true;
        initialConsentState = parsed;
      }
    } catch {
      // Invalid JSON or legacy cookie
    }
  }

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className="h-full antialiased font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
        suppressHydrationWarning
      >
        <ToastProvider>
          <BrandProvider>
            {/* Early in DOM order for accessible keyboard flow; SSR-evaluated to eliminate layout shift */}
            <CookieConsentBanner
              initialHasConsent={initialHasConsent}
              initialConsentState={initialConsentState}
            />
            {children}
          </BrandProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
