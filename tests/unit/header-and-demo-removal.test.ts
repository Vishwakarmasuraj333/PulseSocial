import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

export async function runHeaderAndDemoRemovalUnitTests() {
  console.log("\n--- [UNIT TEST SUITE 18: PROFESSIONAL HEADER REDESIGN & DEMO REMOVAL] ---");

  const marketingHeaderPath = path.resolve(
    process.cwd(),
    "src/components/marketing/MarketingHeader.tsx"
  );
  const appLayoutPath = path.resolve(
    process.cwd(),
    "src/components/layout/AppLayout.tsx"
  );
  const dashboardPath = path.resolve(
    process.cwd(),
    "src/app/(dashboard)/dashboard/page.tsx"
  );

  const marketingHeaderContent = fs.readFileSync(marketingHeaderPath, "utf-8");
  const appLayoutContent = fs.readFileSync(appLayoutPath, "utf-8");
  const dashboardContent = fs.readFileSync(dashboardPath, "utf-8");

  // Test 1: Public Header has valid routes and Get Started CTA
  console.log("▶ Test 1: Verifying public website navigation routes & Get Started CTA...");
  assert.ok(
    marketingHeaderContent.includes('href: "/features"'),
    "Features link must resolve to /features"
  );
  assert.ok(
    marketingHeaderContent.includes('href: "/platforms"'),
    "Platforms link must resolve to /platforms"
  );
  assert.ok(
    marketingHeaderContent.includes('href: "/pricing"'),
    "Pricing link must resolve to /pricing"
  );
  assert.ok(
    marketingHeaderContent.includes('href: "/contact"'),
    "Contact link must resolve to /contact"
  );
  assert.ok(
    marketingHeaderContent.includes("Get Started"),
    "Public header primary CTA must be 'Get Started'"
  );
  assert.ok(
    marketingHeaderContent.includes("<ThemeSwitcher"),
    "Public header must include ThemeSwitcher for light/dark mode"
  );
  assert.ok(
    !marketingHeaderContent.includes("(14-Day Free Trial)"),
    "Public header must not contain duplicate or fabricated free trial labels"
  );
  console.log("  ✔ Public website header navigation and CTA verified.");

  // Test 2: Authenticated Header has dynamic breadcrumbs
  console.log("▶ Test 2: Verifying dynamic breadcrumbs in dashboard header...");
  assert.ok(
    appLayoutContent.includes("getBreadcrumb"),
    "AppLayout must define dynamic breadcrumb calculation"
  );
  assert.ok(
    appLayoutContent.includes("breadcrumb.section"),
    "Header must render breadcrumb section"
  );
  assert.ok(
    appLayoutContent.includes("breadcrumb.title"),
    "Header must render breadcrumb title"
  );
  console.log("  ✔ Dashboard header dynamic breadcrumbs verified.");

  // Test 3: Authenticated Header session truthful verification (No hardcoded Google SSO claim)
  console.log("▶ Test 3: Verifying session truthfulness and removal of hardcoded Google SSO claim...");
  assert.ok(
    !appLayoutContent.includes("Logged in via Google SSO"),
    "Header user menu must not hardcode 'Logged in via Google SSO'"
  );
  assert.ok(
    appLayoutContent.includes("Verified Authenticated Session"),
    "Header user menu must display truthful 'Verified Authenticated Session'"
  );
  console.log("  ✔ Authenticated session truthful label verified.");

  // Test 4: Help & Quick Guides integrated into dashboard header
  console.log("▶ Test 4: Verifying Help & Quick Guides modal integration in dashboard header...");
  assert.ok(
    appLayoutContent.includes("PulseHelpGuidesModal"),
    "AppLayout must import and render PulseHelpGuidesModal"
  );
  assert.ok(
    appLayoutContent.includes("isHelpOpen"),
    "AppLayout must track isHelpOpen state"
  );
  console.log("  ✔ Help & Quick Guides modal integration verified.");

  // Test 5: Dashboard Channel Icons verified includes Snapchat, free of GBP
  console.log("▶ Test 5: Verifying dashboard channel icons include Snapchat, free of GBP...");
  assert.ok(
    !dashboardContent.includes('"google_business"'),
    "Dashboard REAL_SOCIAL_PLATFORMS must not contain google_business/GBP"
  );
  assert.ok(
    dashboardContent.includes('"snapchat"'),
    "Dashboard REAL_SOCIAL_PLATFORMS must include verified platform snapchat"
  );
  assert.ok(
    dashboardContent.includes('"pinterest"'),
    "Dashboard REAL_SOCIAL_PLATFORMS must include verified platform pinterest"
  );
  assert.ok(
    dashboardContent.includes('"reddit"'),
    "Dashboard REAL_SOCIAL_PLATFORMS must include verified platform reddit"
  );
  console.log("  ✔ Dashboard channel icons verified with Snapchat included.");

  // Test 6: Single Unified Footer (No double footers / BottomDockBar regression)
  console.log("▶ Test 6: Verifying single unified footer & elimination of BottomDockBar double footer...");
  assert.ok(
    !appLayoutContent.includes("<BottomDockBar"),
    "AppLayout must not render <BottomDockBar /> to avoid double footer conflict"
  );
  assert.ok(
    !appLayoutContent.includes("import { BottomDockBar }"),
    "AppLayout must not import BottomDockBar"
  );
  assert.ok(
    appLayoutContent.includes("<DashboardFooter />"),
    "AppLayout must render the single unified <DashboardFooter />"
  );

  const footerPath = path.resolve(
    process.cwd(),
    "src/components/layout/DashboardFooter.tsx"
  );
  const footerContent = fs.readFileSync(footerPath, "utf-8");
  assert.ok(
    footerContent.includes("Systems Operational"),
    "DashboardFooter must show live system operational status"
  );
  assert.ok(
    footerContent.includes("FeedbackModal"),
    "DashboardFooter must integrate direct user FeedbackModal"
  );
  assert.ok(
    footerContent.includes("SOC2 Type II"),
    "DashboardFooter must display compliance badge"
  );
  console.log("  ✔ Single unified dashboard footer verified with zero duplicate dock bars.");

  console.log("✔ [SUITE 18: HEADER REDESIGN & DEMO REMOVAL UNIT TESTS PASSED]");
}
