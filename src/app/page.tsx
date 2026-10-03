"use client";

import React, { useState } from "react";
import { PulseAnnouncementBar } from "@/components/marketing/PulseAnnouncementBar";
import { PulseSuiteTopNav } from "@/components/marketing/PulseSuiteTopNav";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { PulseHeroStage } from "@/components/marketing/PulseHeroStage";
import { PulseAwardsGrid } from "@/components/marketing/PulseAwardsGrid";
import { PulseFeaturesShowcase } from "@/components/marketing/PulseFeaturesShowcase";
import { PulseTestimonialVideo } from "@/components/marketing/PulseTestimonialVideo";
import { PulseInstagramShowcase } from "@/components/marketing/PulseInstagramShowcase";
import { PulseAgencyBanner } from "@/components/marketing/PulseAgencyBanner";
import { PulseMobileShowcase } from "@/components/marketing/PulseMobileShowcase";
import { PulseFinalCta } from "@/components/marketing/PulseFinalCta";
import { PulseFaqSection } from "@/components/marketing/PulseFaqSection";
import { PulseWebinarBanner } from "@/components/marketing/PulseWebinarBanner";
import { PulseMegaFooter } from "@/components/marketing/PulseMegaFooter";
import { PulseConciergeModal, PulseStickyConcierge } from "@/components/marketing/PulseConciergeModal";
import { PulseVideoModal } from "@/components/marketing/PulseVideoModal";

export default function HomePage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isConciergeModalOpen, setIsConciergeModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 1. Top Announcement Bar (Linkthread) */}
      <PulseAnnouncementBar />

      {/* 2. Top Suite Bar */}
      <PulseSuiteTopNav />

      {/* 3. Main Navigation Header */}
      <MarketingHeader />

      {/* Main Content Sections (Matching PDF) */}
      <main className="flex-1">
        {/* 4. Hero Section with Rotating Card Switcher & Orbiting Floating Social Icons */}
        <PulseHeroStage
          onWatchVideo={() => setIsVideoModalOpen(true)}
          onBookDemo={() => setIsConciergeModalOpen(true)}
        />

        {/* 5. Industry Awards & Verified Trust Ratings Row */}
        <PulseAwardsGrid />

        {/* 6. Core Features: Schedule, Calendar, Monitor, Analytics */}
        <PulseFeaturesShowcase />

        {/* 7. Video Testimonial Carousel (Jon Tromans) */}
        <PulseTestimonialVideo onWatchVideo={() => setIsVideoModalOpen(true)} />

        {/* 8. Direct Scheduling to Instagram Showcase (3 Polaroid Photos) */}
        <PulseInstagramShowcase />

        {/* 9. PulseSocial for Agencies */}
        <PulseAgencyBanner />

        {/* 10. Mobile App Showcase with Live Audience Metrics */}
        <PulseMobileShowcase />

        {/* 11. Pre-FAQ Final CTA */}
        <PulseFinalCta />

        {/* 12. Complete 8-Item FAQ Accordion */}
        <div id="faq">
          <PulseFaqSection />
        </div>

        {/* 13. Live Webinar Promo Banner */}
        <PulseWebinarBanner />
      </main>

      {/* 14. Comprehensive Mega Footer */}
      <PulseMegaFooter />

      {/* 15. Sticky Floating Concierge & Modal (Page 7 & 15) */}
      <PulseStickyConcierge onOpen={() => setIsConciergeModalOpen(true)} />

      <PulseConciergeModal
        isOpen={isConciergeModalOpen}
        onClose={() => setIsConciergeModalOpen(false)}
      />

      {/* 16. Interactive Video Product Tour Modal */}
      <PulseVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
}
