import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download PulseSocial Mobile App — iOS & Android",
  description:
    "Download and install PulseSocial on your mobile device. Instant 1-click PWA setup and private beta early access.",
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

