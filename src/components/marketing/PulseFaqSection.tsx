"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: React.ReactNode;
}

export function PulseFaqSection() {
  const [openId, setOpenId] = useState<number | null>(0); // Question 1 open by default matching PDF screenshot!

  const faqs: FAQItem[] = [
    {
      id: 0,
      question: "1. What is social media management software?",
      answer: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
          <p>
            <span className="font-semibold text-slate-800 dark:text-slate-200 underline decoration-slate-300">
              Social media management software
            </span>{" "}
            is an application or software suite module that helps a company interact on social media effectively across multiple communication channels. Good software will help in the process of creating, publishing, scheduling, managing, and analyzing content on social media platforms, such as Facebook, X (formerly Twitter), Instagram, YouTube, Pinterest, LinkedIn, TikTok, and others.
          </p>

          <div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              Why do I need it?
            </h5>
            <p>
              Many businesses lack the time or resources to handle their social media accounts individually. However, this does not negate the need for social media management. People expect to be able to communicate with companies through social media. Social media can help your business reach your customers, gain valuable insights, and grow your brand exponentially. With each passing year, social media is only gaining prominence, becoming the most preferred channel of communication. Your business may be forgotten, lose consumers to competitors, or even miss out on new customers if you don't have a strong social media presence.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              Who is it for?
            </h5>
            <p>
              From individuals and personal profiles, to small and large teams and agencies, everyone can use social media management software to help them manage their business across social media platforms effectively. In a nutshell, social media management software is for anyone who wants to improve their social media presence and ace the social media marketing game.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      question: "2. How do I evaluate social media management software?",
      answer: (
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 space-y-2">
          <p>
            When evaluating social media software, evaluate platform coverage (does it support Meta, LinkedIn, X, TikTok, YouTube in one place?), scheduling reliability, AI capabilities (smart best-time recommendations), team collaboration approval workflows, and unified inbox response times. PulseSocial offers an all-in-one suite with transparent pricing, zero lock-in, and hardware-grade encryption.
          </p>
        </div>
      ),
    },
    {
      id: 2,
      question: "3. What are the key features of a social media management system?",
      answer: (
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 space-y-2">
          <ul className="list-disc list-inside space-y-1.5">
            <li><strong>Unified Multi-Channel Composer:</strong> Draft once and customize formats per network.</li>
            <li><strong>Interactive Visual Calendar:</strong> Drag-and-drop monthly/weekly pipeline planning.</li>
            <li><strong>AI Best-Time Predictor:</strong> Algorithmic audience activity detection.</li>
            <li><strong>Real-time Social Listening & Inbox:</strong> Sentiment-tagged streams and auto-CRM lead capture.</li>
            <li><strong>Deep Analytics & Automated Reports:</strong> Cross-network engagement and ROI tracking.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 3,
      question: "4. What are the benefits of using social media management tools?",
      answer: (
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 space-y-2">
          <p>
            Teams report saving 15-20 hours every week by consolidating disparate native network tabs into one dashboard. Furthermore, consistent scheduling increases organic reach by an average of 42%, while unified inboxes prevent dropped customer inquiries and boost lead conversion rates.
          </p>
        </div>
      ),
    },
    {
      id: 4,
      question: "5. How can I manage multiple social media accounts?",
      answer: (
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 space-y-2">
          <p>
            With PulseSocial, you can link unlimited profiles, brand pages, and business channels under dedicated organization workspaces. Switch between client workspaces seamlessly, assign granular role permissions (Admin, Editor, Approver, Viewer), and publish with total security.
          </p>
        </div>
      ),
    },
    {
      id: 5,
      question: "6. What is PulseSocial? What social media platforms does PulseSocial support?",
      answer: (
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 space-y-2">
          <p>
            PulseSocial is an AI-powered social media command center designed for creators, marketing agencies, and global businesses. We support 14+ major channels including Facebook Pages & Groups, Instagram Business & Creators, LinkedIn Profiles & Company Pages, X (Twitter), YouTube Shorts & Channels, TikTok, Pinterest, Google Business Profile, Threads, Telegram, WhatsApp, and Mastodon.
          </p>
        </div>
      ),
    },
    {
      id: 6,
      question: "7. How do I get started with PulseSocial?",
      answer: (
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 space-y-2">
          <p>
            Getting started takes less than 60 seconds! Click "Sign Up for Free", create your account with no credit card required, connect your social channels with secure OAuth authorization, and begin scheduling your first post right away.
          </p>
        </div>
      ),
    },
    {
      id: 7,
      question: "8. What makes PulseSocial stand out from its competition?",
      answer: (
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 space-y-2">
          <p>
            Unlike traditional legacy tools that charge exorbitant fees per social profile, PulseSocial offers modern AI-first workflows, automated CRM lead capture from comment threads, Canva Connect integration, built-in approval queues for agencies, and uncompromised AES-256 token security at an accessible price.
          </p>
        </div>
      ),
    },
  ];

  const toggleAccordion = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-20 sm:py-24 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white text-center tracking-tight">
          Frequently asked questions
        </h2>

        {/* Accordion List */}
        <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="py-4 sm:py-5">
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none"
                >
                  <span className="pr-4">{faq.question}</span>
                  <span className="shrink-0 text-slate-400">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && <div className="mt-2 text-left">{faq.answer}</div>}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 text-center italic">
          Note: Access to social media platforms via PulseSocial applications is subject to regional restrictions. If a platform is banned in your country, it will not be accessible through PulseSocial applications.
        </p>
      </div>
    </section>
  );
}
