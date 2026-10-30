import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

console.log("Running comprehensive QA 32-defect verification suite...\n");

const ROOT = process.cwd();

// Helper to read file content
function getFile(relativePath: string): string {
  const fullPath = path.join(ROOT, relativePath);
  return fs.readFileSync(fullPath, "utf8");
}

let passed = 0;
let total = 0;

function test(name: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`[PASS] Defect ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`[FAIL] Defect ${name}:`, err.message);
  }
}

// 1. Announcement Bar Close Button Padding
test("1 - Announcement Bar close button has safe padding", () => {
  const content = getFile("src/components/marketing/PulseAnnouncementBar.tsx");
  assert.ok(content.includes("right-4 sm:right-6 lg:right-8"), "Close button must have right-4 sm:right-6 lg:right-8 padding");
});

// 2. Social Sidebar tab unclipped
test("2 - Floating social dock tab button is unclipped with safe margin", () => {
  const content = getFile("src/components/marketing/PulseSocialSidebar.tsx");
  assert.ok(content.includes("right-2 sm:right-3.5"), "Floating toggle must be offset from screen edge");
  assert.ok(content.includes("rounded-2xl"), "Button must have rounded-2xl to prevent clipping");
});

// 3. Hero stage floating icons spacing
test("3 - Floating platform icons relative spacing", () => {
  const content = getFile("src/components/marketing/PulseHeroStage.tsx");
  assert.ok(content.includes("top-[28%]"), "Telegram and Mastodon top offset normalized");
  assert.ok(content.includes("bottom-[28%]"), "Google and YouTube bottom offset normalized");
});

// 4. Filter pills gap
test("4 - Core Networks and Messaging & Visual pill gap", () => {
  const content = getFile("src/components/marketing/PulseHeroStage.tsx");
  assert.ok(content.includes("gap-4 sm:gap-6"), "Pills container must have gap-4 sm:gap-6");
});

// 5. Showcase platform icons normalized
test("5 - Showcase platform icons dimensions and alignment", () => {
  const content = getFile("src/components/marketing/PulseInstagramShowcase.tsx");
  assert.ok(content.includes('w-[18px] h-[18px]'), "Icons must be normalized to 18px");
});

// 6. Excessive empty space above FAQ
test("6 - Reduced empty space above FAQ", () => {
  const cta = getFile("src/components/marketing/PulseFinalCta.tsx");
  const faq = getFile("src/components/marketing/PulseFaqSection.tsx");
  assert.ok(cta.includes("pt-16 pb-12 sm:pt-20 sm:pb-14"), "PulseFinalCta padding reduced");
  assert.ok(faq.includes("pt-8 sm:pt-10"), "PulseFaqSection top padding reduced");
});

// 7. Pagination dots vertical spacing
test("7 - Pagination dots vertical spacing in showcase", () => {
  const content = getFile("src/components/marketing/PulseInstagramShowcase.tsx");
  assert.ok(content.includes("mt-10 sm:mt-12 pb-2"), "Dots must have generous vertical spacing");
});

// 8. Mobile showcase download buttons spacing
test("8 - Mobile showcase download buttons spacing", () => {
  const content = getFile("src/components/marketing/PulseMobileShowcase.tsx");
  assert.ok(content.includes("pt-6 sm:pt-8 flex flex-wrap"), "Download buttons must have pt-6 sm:pt-8");
});

// 9. FAQ Title Case
test("9 - Frequently Asked Questions Title Case", () => {
  const content = getFile("src/components/marketing/PulseFaqSection.tsx");
  assert.ok(content.includes("Frequently Asked Questions"), "Must use Title Case");
  assert.ok(!content.includes("Frequently asked questions"), "Must not contain lowercase 'asked questions'");
});

// 10. Platform list "and more"
test("10 - Colloquial 'and others' replaced with 'and more'", () => {
  const content = getFile("src/components/marketing/PulseFaqSection.tsx");
  assert.ok(content.includes("TikTok, and more."), "Must use 'TikTok, and more.'");
  assert.ok(!content.includes("TikTok, and others."), "Must not contain 'and others'");
});

// 11 & 12, 14, 15, 17, 18, 20, 21. Shared Footer column grid & ACCOUNT placement
test("11, 12, 14, 15, 17, 18, 20, 21 - Shared Footer 12-column grid and balanced ACCOUNT", () => {
  const content = getFile("src/components/marketing/MarketingFooter.tsx");
  assert.ok(content.includes("grid-cols-1 lg:grid-cols-12"), "Must use 12-column desktop grid");
  assert.ok(content.includes("lg:col-span-4"), "Brand must occupy 4 columns");
  assert.ok(content.includes("lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5"), "Links must occupy 8 columns in 5-col subgrid");
});

// 13. Replace "honest" with "transparent"
test("13 - Features copy: replace 'honest' with 'transparent'", () => {
  const content = getFile("src/app/features/page.tsx");
  assert.ok(content.includes("transparent reconnect notifications"), "Must say 'transparent reconnect notifications'");
  assert.ok(!content.includes("honest reconnect notifications"), "Must not say 'honest'");
});

// 16. Sharper B2B precision integration copy
test("16 - Integration copy B2B precision", () => {
  const feat = getFile("src/app/features/page.tsx");
  const plat = getFile("src/app/platforms/page.tsx");
  assert.ok(
    feat.includes("Every platform integration is built strictly on official public and partner APIs utilizing secure cryptographic OAuth 2.0 flows."),
    "Features page must contain precise B2B copy"
  );
  assert.ok(
    plat.includes("Every platform integration is built strictly on official public and partner APIs utilizing secure cryptographic OAuth 2.0 flows."),
    "Platforms page must contain precise B2B copy"
  );
});

// 19. Solutions copy
test("19 - Solutions page copy begins with 'Whether you\'re a solo creator...'", () => {
  const content = getFile("src/app/solutions/page.tsx");
  assert.ok(content.includes("Whether you're a solo creator"), "Must say 'Whether you\\'re a solo creator'");
});

// 22 & 23. Pricing header spacing & billing toggle
test("22, 23 - Pricing header spacing and billing toggle spacing", () => {
  const content = getFile("src/app/pricing/page.tsx");
  assert.ok(content.includes("pt-24 sm:pt-28 pb-16"), "Pricing main padding must be normalized");
  assert.ok(content.includes("mt-6 sm:mt-8 pt-2 flex items-center justify-center gap-3"), "Billing switcher spacing normalized");
});

// 24. Hyphenation in pricing copy
test("24 - Hyphenation in multi-brand corporate teams", () => {
  const content = getFile("src/app/pricing/page.tsx");
  assert.ok(content.includes("multi-brand corporate teams"), "Must include hyphen in multi-brand");
});

// 25, 26, 27. CTA labels, contrast, and action consistency
test("25, 26, 27 - Pricing CTA labels, contrast, and consistent destinations", () => {
  const content = getFile("src/app/pricing/page.tsx");
  const api = getFile("src/app/api/pricing/route.ts");
  assert.ok(api.includes("ctaLabel:"), "API must return ctaLabel");
  assert.ok(api.includes("ctaHref:"), "API must return ctaHref");
  assert.ok(content.includes("ctaText"), "Pricing card must display ctaText fallback");
  assert.ok(content.includes("bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800"), "Starter/Agency button has high contrast");
  assert.ok(content.includes("&billing=${billingCycle}"), "Must preserve billing cycle in CTA link");
});

// 28. Space between cards and FAQ
test("28 - Space between pricing cards and FAQ reduced", () => {
  const content = getFile("src/app/pricing/page.tsx");
  assert.ok(content.includes("mb-10 sm:mb-12"), "Cards grid margin bottom reduced");
  assert.ok(content.includes("pt-6 sm:pt-8 border-t"), "FAQ top padding reduced");
});

// 29. FAQ question grammar
test("29 - FAQ question grammar: 'on the same social network'", () => {
  const content = getFile("src/app/pricing/page.tsx");
  assert.ok(content.includes("Can I connect multiple accounts on the same social network?"), "Question must use 'on the same'");
});

// 30. Lowercase generic descriptions
test("30 - Lowercase generic names for profiles and pages", () => {
  const content = getFile("src/app/pricing/page.tsx");
  assert.ok(content.includes("Instagram professional profiles"), "Must use lowercase 'professional profiles'");
  assert.ok(content.includes("Facebook pages"), "Must use lowercase 'pages'");
  assert.ok(content.includes("LinkedIn company pages"), "Must use lowercase 'company pages'");
});

// 31. Visible + / - chevron indicators in FAQ
test("31 - Visible + / - indicators in pricing FAQ", () => {
  const content = getFile("src/app/pricing/page.tsx");
  assert.ok(content.includes("<Plus className="), "Must contain Plus icon");
  assert.ok(content.includes("<Minus className="), "Must contain Minus icon");
  assert.ok(content.includes("aria-expanded={isOpen}"), "Must be accessible with aria-expanded");
});

// 32. Vertically balanced support banner
test("32 - Vertically balanced support text and actions", () => {
  const content = getFile("src/components/marketing/MarketingFooter.tsx");
  assert.ok(content.includes("my-auto"), "Action buttons on right must be vertically centered with my-auto");
  assert.ok(content.includes("flex-1"), "Support text block must be flex-1");
});

console.log(`\n========================================`);
console.log(`Test Results: ${passed} / ${total} tests passed.`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}

