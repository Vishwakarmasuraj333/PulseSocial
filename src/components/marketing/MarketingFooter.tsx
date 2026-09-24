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
        { label: "Cookie Preferences", href: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <PulseSocialLogo size="md" theme="light" variant="full" href="/" />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              PulseSocial is the unified social media management SaaS platform for modern teams, creators, and enterprises. Publish, schedule, collaborate, and analyze from one powerful workspace.
            </p>
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
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PulseSocial Inc. All rights reserved. Manage Every Social. From One Place.</p>
          <div className="flex items-center gap-4">
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
