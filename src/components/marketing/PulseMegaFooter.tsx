"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FacebookIcon,
  XIcon,
  LinkedInIcon,
  InstagramIcon,
  YouTubeIcon,
  PinterestIcon,
} from "@/components/icons/PlatformIcons";
import { Search, Globe, ShieldCheck, Mail, ArrowUpRight, CheckCircle2 } from "lucide-react";
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
        { label: "Browser Extension", href: "/extension" },
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
        { label: "Pinterest", href: "/platforms#pinterest" },
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

        {/* Contact Email & Social Icons Row (Matching PDF page 15) */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-slate-400" />
            <a
              href="mailto:support@pulsesocial.com"
              className="hover:text-white transition-colors underline underline-offset-2"
            >
              support@pulsesocial.com
            </a>
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
            <Link href="https://pinterest.com" target="_blank" className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition" aria-label="Pinterest">
              <PinterestIcon size={14} />
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
            <select className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 outline-none cursor-pointer">
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
              <option>日本語</option>
            </select>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="hover:text-slate-300">Contact Us</Link>
            <span>•</span>
            <Link href="/security" className="hover:text-slate-300">Security</Link>
            <span>•</span>
            <Link href="/compliance" className="hover:text-slate-300">Compliance</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-slate-300">Cookie Policy</Link>
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
