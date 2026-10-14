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
import { Phone, Mail, MapPin, ArrowUpRight, ShieldCheck, Headphones } from "lucide-react";

export function MarketingFooter() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Supported Platforms", href: "/platforms" },
        { label: "Solutions", href: "/solutions" },
        { label: "Pricing & Plans", href: "/pricing" },
        { label: "Social Composer", href: "/compose" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Blog & Strategy", href: "/blog" },
        { label: "Guides & Tutorials", href: "/resources" },
        { label: "Help Center", href: "/contact" },
        { label: "API Documentation", href: "/docs" },
        { label: "System Status", href: "/status" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About PulseSocial", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Careers", href: "/careers" },
        { label: "Brand Assets", href: "/brand" },
      ],
    },
    {
      title: "Legal & Security",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Security & Governance", href: "/security" },
        { label: "Cookie Policy", href: "/cookie-policy" },
        { label: "Cookie settings", href: "#", isCookieSettings: true },
      ],
    },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ============================================================ */}
        {/* TOP CONTACT & ADVISORY BANNER                                */}
        {/* ============================================================ */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/40 border border-slate-700/60 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Direct Support &amp; Product Consultation</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Questions about SocialPulse or need custom onboarding?
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Connect directly with our engineering and growth advisory team. Available 24/7 with under 15-minute response SLA.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="tel:+18007857362"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-600 transition flex items-center gap-2 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+1 (800) 785-PULSE</span>
            </a>
            <a
              href="mailto:support@pulsesocial.io"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-600 transition flex items-center gap-2 shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>support@pulsesocial.io</span>
            </a>
            <Link
              href="/contact"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-md shadow-purple-600/20 flex items-center gap-1.5"
            >
              <span>Contact Us Form</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <PulseSocialLogo size="md" theme="dark" variant="full" href="/" />
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              PulseSocial is the unified social media management SaaS platform for modern teams, creators, and enterprises. Publish, schedule, collaborate, and analyze from one powerful workspace.
            </p>

            {/* Direct Contact Info Details */}
            <div className="pt-2 space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Support &amp; Inquiries:</span>
                <a href="mailto:support@pulsesocial.io" className="hover:text-purple-400 transition underline underline-offset-2">
                  support@pulsesocial.io
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-semibold text-white">Direct Line:</span>
                <a href="tel:+18007857362" className="hover:text-purple-400 transition font-mono">
                  +1 (800) 785-PULSE (+1 800-785-7362)
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-semibold text-white">Enterprise Sales:</span>
                <a href="mailto:sales@pulsesocial.io" className="hover:text-purple-400 transition underline underline-offset-2">
                  sales@pulsesocial.io
                </a>
              </div>
              <div className="text-slate-400 text-[11px] pt-1">
                HQ: 450 Mission St, Suite 1400, San Francisco, CA 94105 &bull; 24/7 Global Response
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link href="https://twitter.com" target="_blank" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition" aria-label="X">
                <XIcon size={16} />
              </Link>
              <Link href="https://linkedin.com" target="_blank" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition" aria-label="LinkedIn">
                <LinkedInIcon size={16} />
              </Link>
              <Link href="https://instagram.com" target="_blank" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition" aria-label="Instagram">
                <InstagramIcon size={16} />
              </Link>
              <Link href="https://facebook.com" target="_blank" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition" aria-label="Facebook">
                <FacebookIcon size={16} />
              </Link>
              <Link href="https://youtube.com" target="_blank" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition" aria-label="YouTube">
                <YouTubeIcon size={16} />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {section.title}
              </p>
              <ul className="space-y-2 text-xs">
                {section.links.map((link: any) => (
                  <li key={link.label}>
                    {link.isCookieSettings ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (typeof window !== "undefined") {
                            window.dispatchEvent(
                              new CustomEvent("pulsesocial_open_cookie_settings")
                            );
                          }
                        }}
                        className="hover:text-white transition-colors cursor-pointer text-left"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="hover:text-white transition-colors"
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

        {/* Bottom copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-slate-300">
            © {new Date().getFullYear()} PulseSocial Inc. All rights reserved. &bull;{" "}
            <span className="font-semibold text-purple-400">Developed by Suraj Vishwakarma</span>
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>English (US)</span>
            <span>·</span>
            <span>SOC2 Type II Compliant</span>
            <span>·</span>
            <span>Hardware-Grade AES-256 Token Vault</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default MarketingFooter;
