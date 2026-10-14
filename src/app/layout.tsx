import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { BrandProvider } from "@/context/BrandContext";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pulsesocial1.vercel.app";

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SocialPulse — Professional Social Media Management SaaS | Plan, Publish, Monitor & Analyze",
    template: "%s | SocialPulse",
  },
  description:
    "SocialPulse is the unified social media management platform for modern brands and agencies. Plan, create, schedule, publish, monitor, and measure cross-platform social performance from one organized workspace.",
  keywords: [
    "social media management",
    "social media scheduler",
    "social inbox",
    "social listening",
    "brand monitoring",
    "social media analytics",
    "multi-brand workspace",
    "content calendar",
    "SocialPulse",
  ],
  authors: [{ name: "SocialPulse Engineering Team" }],
  creator: "SocialPulse",
  publisher: "SocialPulse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/PulseSocial_1024x1024_App_Icon.png", sizes: "1024x1024", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/PulseSocial_1024x1024_App_Icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "SocialPulse",
    title: "SocialPulse — Your Entire Social Media Workflow. One Powerful Platform.",
    description:
      "Plan, create, schedule, publish, monitor, and measure your social media performance from one organized workspace.",
    images: [
      {
        url: `${siteUrl}/PulseSocial_1024x1024_App_Icon.png`,
        width: 1024,
        height: 1024,
        alt: "SocialPulse Professional Social Media Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialPulse — Your Entire Social Media Workflow. One Powerful Platform.",
    description:
      "Plan, create, schedule, publish, monitor, and measure your social media performance from one organized workspace.",
    images: [`${siteUrl}/PulseSocial_1024x1024_App_Icon.png`],
    creator: "@SocialPulseHQ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "SocialPulse",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "Professional social media management SaaS platform for scheduling, publishing, monitoring, and cross-platform analytics.",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "0",
        highPrice: "99",
        offerCount: "4",
      },
      featureList: [
        "Social media publishing and scheduling",
        "Visual content calendar",
        "Unified social inbox",
        "Social listening and brand monitoring",
        "Cross-platform analytics and reporting",
        "AI-powered caption and content assistance",
        "Team collaboration and post approvals",
        "Multi-brand and agency workspaces",
        "Secure social account management",
        "Mobile-responsive workflows",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "SocialPulse",
      url: siteUrl,
      logo: `${siteUrl}/PulseSocial_1024x1024_App_Icon.png`,
      sameAs: [
        "https://twitter.com/SocialPulseHQ",
        "https://www.linkedin.com/company/socialpulse-hq",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="h-full antialiased font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
        suppressHydrationWarning
      >
        <ToastProvider>
          <BrandProvider>
            {children}
          </BrandProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

