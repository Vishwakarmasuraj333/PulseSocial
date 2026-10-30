"use client";

import React from "react";
import Link from "next/link";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/icons/PlatformIcons";
import {
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  Headphones,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { CONTACT_CONFIG } from "@/lib/constants/contact";

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Social Publishing", href: "/posts/new" },
        { label: "Content Calendar", href: "/calendar" },
        { label: "Social Inbox", href: "/inbox" },
        { label: "Analytics & Reports", href: "/analytics" },
        { label: "Supported Integrations", href: "/platforms" },
        { label: "Industry Solutions", href: "/solutions" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center & Support", href: "/contact" },
        { label: "Documentation & Guides", href: "/resources" },
        { label: "Growth Strategy Blog", href: "/blog" },
        { label: "Platform FAQs", href: "/#faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About PulseSocial", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Pricing & Plans", href: "/pricing" },
      ],
    },
    {
      title: "Legal & Trust",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookie-policy" },
        { label: "User Data Deletion", href: "/data-deletion" },
        { label: "Cookie Preferences", isCookieSettings: true },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Sign In", href: "/login" },
        { label: "Create Free Account", href: "/signup" },
        { label: "Dashboard Workspace", href: "/dashboard" },
      ],
    },
  ];

  const handleOpenCookieSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pulsesocial_open_cookie_settings"));
    }
  };

  return (
    <footer
      aria-label="PulseSocial Site Footer"
      className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 select-none relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ============================================================ */}
        {/* TOP CONTACT & ADVISORY BANNER                                */}
        {/* ============================================================ */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Direct Support &amp; Product Consultation</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Questions about PulseSocial or need custom onboarding?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Connect directly with our engineering and growth advisory team. Fast-response support for creators, teams, and enterprises.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 shrink-0 my-auto">
            <a
              href={`tel:${CONTACT_CONFIG.phone.tel}`}
              className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-2 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{CONTACT_CONFIG.phone.display}</span>
            </a>
            <a
              href={`mailto:${CONTACT_CONFIG.emails.support}`}
              className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-2 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{CONTACT_CONFIG.emails.support}</span>
            </a>
            <Link
              href="/contact"
              className="px-4 py-2.5 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white font-semibold text-xs transition shadow-md shadow-purple-900/30 flex items-center gap-1.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <span>Contact Form</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MAIN NAVIGATION GRID                                         */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          {/* Brand Column (Span 4 on large screens) */}
          <div className="lg:col-span-4 space-y-4">
            <PulseSocialLogo size="md" theme="dark" variant="full" href="/" />
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              PulseSocial is the unified social media management SaaS platform for modern teams, creators, and enterprises. Publish, schedule, collaborate, and analyze from one powerful command center.
            </p>

            {/* Direct Contact Details */}
            <div className="pt-3 space-y-2 text-xs text-slate-300 border-t border-slate-850">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Support:</span>
                <a
                  href={`mailto:${CONTACT_CONFIG.emails.support}`}
                  className="hover:text-purple-400 transition underline underline-offset-2"
                >
                  {CONTACT_CONFIG.emails.support}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Direct Line:</span>
                <a
                  href={`tel:${CONTACT_CONFIG.phone.tel}`}
                  className="hover:text-purple-400 transition font-mono"
                >
                  {CONTACT_CONFIG.phone.display} ({CONTACT_CONFIG.phone.numeric})
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Sales:</span>
                <a
                  href={`mailto:${CONTACT_CONFIG.emails.sales}`}
                  className="hover:text-purple-400 transition underline underline-offset-2"
                >
                  {CONTACT_CONFIG.emails.sales}
                </a>
              </div>
              <div className="text-slate-400 text-[11px] pt-1">
                HQ: {CONTACT_CONFIG.headquarters.display}
              </div>
            </div>

            {/* Verified External Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={CONTACT_CONFIG.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-purple-400"
                aria-label="Follow PulseSocial on X"
              >
                <XIcon size={15} />
              </a>
              <a
                href={CONTACT_CONFIG.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-purple-400"
                aria-label="Connect with PulseSocial on LinkedIn"
              >
                <LinkedInIcon size={15} />
              </a>
              <a
                href={CONTACT_CONFIG.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-purple-400"
                aria-label="Follow PulseSocial on Instagram"
              >
                <InstagramIcon size={15} />
              </a>
              <a
                href={CONTACT_CONFIG.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-purple-400"
                aria-label="PulseSocial on Facebook"
              >
                <FacebookIcon size={15} />
              </a>
              <a
                href={CONTACT_CONFIG.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-purple-400"
                aria-label="PulseSocial YouTube Channel"
              >
                <YouTubeIcon size={15} />
              </a>
            </div>
          </div>

          {/* 5 Nav Link Columns (Span 8 on desktop, 5 clean columns) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 lg:gap-5 xl:gap-8">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-2 text-xs">
                  {section.links.map((link: any) => (
                    <li key={link.label}>
                      {link.isCookieSettings ? (
                        <button
                          type="button"
                          onClick={handleOpenCookieSettings}
                          className="hover:text-white transition-colors cursor-pointer text-left focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-purple-400 rounded flex items-center gap-1.5"
                        >
                          <Sliders className="w-3 h-3 text-purple-400" />
                          <span>{link.label}</span>
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          className="hover:text-white transition-colors inline-block focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-purple-400 rounded"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM COPYRIGHT & COMPLIANCE BAR                             */}
        {/* ============================================================ */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-slate-300 text-center sm:text-left">
            &copy; {currentYear} PulseSocial Inc. All rights reserved. &bull;{" "}
            <span className="font-semibold text-purple-400">
              Developed by Suraj Vishwakarma
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 text-[11px]">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>SOC2 Type II</span>
            </span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>GDPR Compliant</span>
            </span>
            <span>&bull;</span>
            <span>AES-256 Token Vault</span>
            <span>&bull;</span>
            <span>English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default MarketingFooter;
