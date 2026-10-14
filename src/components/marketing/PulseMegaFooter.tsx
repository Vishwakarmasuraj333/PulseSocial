"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FacebookIcon,
  XIcon,
  LinkedInIcon,
  InstagramIcon,
  YouTubeIcon,
} from "@/components/icons/PlatformIcons";
import { Search, Globe, ShieldCheck, Mail, ArrowUpRight, CheckCircle2, Phone, MapPin } from "lucide-react";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";

export function PulseMegaFooter() {
  const [searchQuery, setSearchQuery] = useState("");

  const footerGroups = [
    {
      title: "Features",
      links: [
        { label: "Publishing", href: "/features#publishing" },
        { label: "Scheduling", href: "/features#scheduling" },
        { label: "Monitoring", href: "/features#monitoring" },
        { label: "Analytics", href: "/features#analytics" },
        { label: "Collaboration", href: "/features#collaboration" },
        { label: "Inbox", href: "/inbox" },
        { label: "Social Media Automation", href: "/features#automation" },
        { label: "Pulse AI Assistant", href: "/features#ai" },
        { label: "CRM Integration", href: "/features#crm" },
        { label: "Desk Integration", href: "/features#desk" },
        { label: "Canva Integration", href: "/features#canva" },
        { label: "Mobile Apps", href: "/mobile" },
        { label: "Browser Extension (Coming Soon)", href: "#" },
      ],
    },
    {
      title: "Compare",
      links: [
        { label: "Hootsuite Alternative", href: "/compare/hootsuite" },
        { label: "Sprout Social Alternative", href: "/compare/sprout-social" },
        { label: "Buffer Alternative", href: "/compare/buffer" },
        { label: "Metricool Alternative", href: "/compare/metricool" },
        { label: "Compare All Platforms", href: "/compare" },
      ],
    },
    {
      title: "Channels",
      links: [
        { label: "Facebook", href: "/platforms#facebook" },
        { label: "X (formerly Twitter)", href: "/platforms#x" },
        { label: "LinkedIn", href: "/platforms#linkedin" },
        { label: "Instagram", href: "/platforms#instagram" },
        { label: "WhatsApp", href: "/platforms#whatsapp" },
        { label: "Google Business Profile", href: "/platforms#google" },
        { label: "YouTube", href: "/platforms#youtube" },
        { label: "TikTok", href: "/platforms#tiktok" },
        { label: "Mastodon", href: "/platforms#mastodon" },
        { label: "Threads", href: "/platforms#threads" },
        { label: "Bluesky", href: "/platforms#bluesky" },
        { label: "Telegram", href: "/platforms#telegram" },
        { label: "Snapchat", href: "/platforms#snapchat" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "Agencies", href: "/solutions#agencies" },
        { label: "Remote Teams", href: "/solutions#teams" },
        { label: "Individuals", href: "/solutions#individuals" },
        { label: "Travel Agencies", href: "/solutions#travel" },
        { label: "Retail", href: "/solutions#retail" },
        { label: "Ecommerce", href: "/solutions#ecommerce" },
        { label: "Financial Services", href: "/solutions#finance" },
        { label: "Real Estate", href: "/solutions#real-estate" },
        { label: "Small Business", href: "/solutions#smb" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "User Guide", href: "/resources" },
        { label: "Navigating Social", href: "/blog" },
        { label: "Glossary", href: "/resources/glossary" },
        { label: "Videos", href: "/resources/videos" },
        { label: "Webinars", href: "/webinars" },
        { label: "Blogs", href: "/blog" },
        { label: "Community", href: "/community" },
        { label: "Compare Plans", href: "/pricing" },
        { label: "What's New", href: "/changelog" },
        { label: "FAQs", href: "#faq" },
      ],
    },
    {
      title: "Quick links",
      links: [
        { label: "Request a demo", href: "/contact" },
        { label: "Customers", href: "/customers" },
        { label: "Events", href: "/events" },
        { label: "GDPR and PulseSocial", href: "/privacy#gdpr" },
        { label: "Contact Us", href: "/contact" },
        { label: "Request a Callback", href: "/contact#callback" },
      ],
    },
    {
      title: "More on Social Media",
      links: [
        { label: "All-in-one Social Media Tool", href: "/features" },
        { label: "Social Media Management", href: "/features#management" },
        { label: "Social Media Analytics", href: "/features#analytics" },
        { label: "Social Media Marketing", href: "/features#marketing" },
        { label: "Social Selling Guide", href: "/blog/social-selling" },
        { label: "Instagram Marketing", href: "/blog/instagram-guide" },
        { label: "Social Media Tools", href: "/features#tools" },
        { label: "X (formerly Twitter) Hashtags", href: "/blog/hashtags" },
        { label: "Social Media Calendar", href: "/calendar" },
        { label: "Tips on Social Media Automation", href: "/blog/automation-tips" },
        { label: "Social Media for Customer Service", href: "/solutions#customer-service" },
      ],
    },
    {
      title: "Free Tools",
      links: [
        { label: "Linkthread", href: "/features#linkthread" },
        { label: "SocialToolkit", href: "/tools" },
        { label: "Free Edition", href: "/pricing#free" },
      ],
    },
    {
      title: "Developer Tools",
      links: [
        { label: "PulseSocial MCP", href: "/docs/mcp" },
        { label: "REST APIs & Webhooks", href: "/docs/api" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-16 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ============================================================ */}
        {/* TOP CONTACT & GLOBAL SUPPORT HUB                             */}
        {/* ============================================================ */}
        <div className="pb-10 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>24/7 Global Support &amp; Customer Advisory</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Get in Touch with PulseSocial Specialists
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Have questions about official OAuth permissions, high-volume publishing, or custom enterprise SLA contracts? Our engineering and product support team is ready to help.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Contact Support Team</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="tel:+18007857362"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Helpline</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* 1. Direct Helpline */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/40 transition group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Toll-Free Helpline</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Live 24/7
                  </span>
                </div>
              </div>
              <a
                href="tel:+18007857362"
                className="text-xs font-bold text-white hover:text-purple-300 transition block font-mono"
              >
                +1 (800) 785-PULSE
              </a>
              <p className="text-[10px] text-slate-400 mt-0.5">
                +1 (800) 785-7362 &bull; Direct phone assistance
              </p>
            </div>

            {/* 2. Support & Helpdesk */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/40 transition group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Support Desk</h4>
                  <span className="text-[10px] text-purple-400 font-semibold">Response &lt; 15 mins</span>
                </div>
              </div>
              <a
                href="mailto:support@pulsesocial.io"
                className="text-xs font-bold text-white hover:text-purple-300 transition block underline underline-offset-2"
              >
                support@pulsesocial.io
              </a>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Publishing, OAuth &amp; workspace troubleshooting
              </p>
            </div>

            {/* 3. Sales & Enterprise Advisory */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/40 transition group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sales &amp; Demos</h4>
                  <span className="text-[10px] text-indigo-400 font-semibold">Enterprise Team</span>
                </div>
              </div>
              <a
                href="mailto:sales@pulsesocial.io"
                className="text-xs font-bold text-white hover:text-purple-300 transition block underline underline-offset-2"
              >
                sales@pulsesocial.io
              </a>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Custom agency pricing, SLAs &amp; procurement
              </p>
            </div>

            {/* 4. Global HQ & Office */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/40 transition group">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Global HQ</h4>
                  <span className="text-[10px] text-cyan-400 font-semibold">San Francisco, CA</span>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-200">
                450 Mission St, Suite 1400
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                San Francisco, CA 94105, United States
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Link Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors block text-slate-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Email, Phone & Social Icons Row */}
        <div className="pt-8 border-t border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">Support:</span>
              <a
                href="mailto:support@pulsesocial.io"
                className="hover:text-white transition-colors underline underline-offset-2 font-medium"
              >
                support@pulsesocial.io
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Helpline:</span>
              <a
                href="tel:+18007857362"
                className="hover:text-white transition-colors font-medium"
              >
                +1 (800) 785-PULSE (+1 800-785-7362)
              </a>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>450 Mission St, Suite 1400, San Francisco, CA 94105</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="https://twitter.com" target="_blank" className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition" aria-label="X">
              <XIcon size={14} />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition" aria-label="LinkedIn">
              <LinkedInIcon size={14} />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition" aria-label="Instagram">
              <InstagramIcon size={14} />
            </Link>
            <Link href="https://youtube.com" target="_blank" className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition" aria-label="YouTube">
              <YouTubeIcon size={14} />
            </Link>
          </div>
        </div>

        {/* Security & Compliance Badges Row (Page 15) */}
        <div className="pt-6 border-t border-slate-800 text-center space-y-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Choose Privacy. Choose PulseSocial.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 opacity-75">
            <span className="px-3 py-1 rounded border border-slate-700 text-[10px] font-bold text-slate-300">
              ISO/IEC 27001
            </span>
            <span className="px-3 py-1 rounded border border-slate-700 text-[10px] font-bold text-slate-300">
              SOC 2 Type II
            </span>
            <span className="px-3 py-1 rounded border border-slate-700 text-[10px] font-bold text-slate-300">
              GDPR Compliant
            </span>
            <span className="px-3 py-1 rounded border border-slate-700 text-[10px] font-bold text-slate-300">
              HIPAA Ready
            </span>
            <span className="px-3 py-1 rounded border border-slate-700 text-[10px] font-bold text-slate-300">
              CCPA Verified
            </span>
          </div>
        </div>

        {/* Search Bar & Language Selector Row */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search for product overviews, FAQs, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-9 rounded-lg bg-slate-800 text-white text-xs placeholder-slate-400 border border-slate-700 focus:outline-none focus:border-slate-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Globe className="w-4 h-4 text-slate-400" />
            <select
              id="footer-language-select"
              aria-label="Select language"
              className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 outline-none cursor-pointer"
            >
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
              <option>日本語</option>
            </select>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="hover:text-slate-200">Contact Us</Link>
            <span>•</span>
            <Link href="/security" className="hover:text-slate-200">Security</Link>
            <span>•</span>
            <Link href="/compliance" className="hover:text-slate-200">Compliance</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-200">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-slate-200">Privacy Policy</Link>
            <span>•</span>
            <Link href="/cookie-policy" className="hover:text-slate-200">Cookie Policy</Link>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("pulsesocial_open_cookie_settings"));
                }
              }}
              className="hover:text-slate-200 underline cursor-pointer"
            >
              Cookie settings
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            © {new Date().getFullYear()}, PulseSocial Corporation. All Rights Reserved. &bull;{" "}
            <span className="text-slate-300 font-semibold">Developed by Suraj Vishwakarma</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
