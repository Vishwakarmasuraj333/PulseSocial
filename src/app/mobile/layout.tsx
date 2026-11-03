import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PulseSocial on Mobile — iOS & Android PWA Command Center",
  description:
    "Experience PulseSocial on your iPhone, iPad, and Android devices. Multi-network post composer, publishing queues, and real-time audience analytics anywhere.",
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
