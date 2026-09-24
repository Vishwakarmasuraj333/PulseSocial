import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { BrandProvider } from "@/context/BrandContext";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ToastProvider>
          <BrandProvider>{children}</BrandProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
