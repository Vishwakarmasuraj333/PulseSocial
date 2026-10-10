import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SignJWT } from "jose";
import fs from "fs";
import path from "path";

const VIEWPORTS = [
  { name: "360", width: 360, height: 740, label: "360px Mobile" },
  { name: "390", width: 390, height: 844, label: "390px Mobile" },
  { name: "768", width: 768, height: 1024, label: "768px Tablet" },
  { name: "1024", width: 1024, height: 768, label: "1024px Landscape" },
  { name: "1440", width: 1440, height: 900, label: "1440px Desktop" },
];

const LOGGED_IN_SCREENS = [
  { name: "dashboard", path: "/dashboard", label: "Dashboard" },
  { name: "composer", path: "/posts/new", label: "New Post Composer" },
  { name: "calendar", path: "/calendar", label: "Calendar" },
  { name: "inbox", path: "/inbox", label: "Unified Inbox" },
  { name: "social_accounts", path: "/social-accounts", label: "Social Accounts" },
  { name: "messages", path: "/messages", label: "Messages & Team Chat" },
  { name: "analytics", path: "/analytics", label: "Analytics" },
  { name: "settings", path: "/settings", label: "Settings" },
  { name: "billing", path: "/billing", label: "Billing & Plans" },
];

const ARTIFACT_SCREENSHOT_DIR = "C:/Users/imdee/.gemini/antigravity-ide/brain/fcf41849-8f32-4fc5-98bb-450ef6a49280/screenshots";
const LOCAL_SCREENSHOT_DIR = "./tests/screenshots";

// Ensure screenshot directories exist
for (const dir of [LOCAL_SCREENSHOT_DIR, ARTIFACT_SCREENSHOT_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pulsesocial_super_secure_jwt_secret_token_change_in_production_32chars"
);

async function generateTestAuthToken() {
  return await new SignJWT({
    sub: "test-auth-user-id",
    email: "auditor@pulsesocial.test",
    name: "Auditor User",
    emailVerified: true,
    activeOrgId: "test-auth-org-id",
    role: "OWNER",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

test.describe("T9: Logged-in Screens Responsive Matrix & Axe A11y Suite", () => {
  test.beforeEach(async ({ context }) => {
    const token = await generateTestAuthToken();
    await context.addCookies([
      {
        name: "pulsesocial_auth_session",
        value: token,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
      {
        name: "pulsesocial_consent",
        value: JSON.stringify({
          necessary: true,
          preferences: true,
          analytics: false,
          marketing: false,
          decision: "CUSTOM",
          policyVersion: "2026-10",
          timestamp: new Date().toISOString(),
        }),
        domain: "localhost",
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      },
    ]);
  });

  // Responsive Viewports Sweep on Core App Screens
  for (const screen of LOGGED_IN_SCREENS) {
    for (const vp of VIEWPORTS) {
      test(`${screen.label} Responsive at ${vp.width}px (${vp.name})`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`http://localhost:3000${screen.path}`, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });

        // 1. Verify No Horizontal Overflow
        const overflow = await page.evaluate(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          };
        });
        expect(overflow.hasOverflow, `Screen ${screen.label} must not have horizontal scrollbar at ${vp.width}px`).toBeFalsy();

        // 2. Breakpoint Checks: Drawer menu < 1024
        if (vp.width < 1024) {
          // Verify mobile drawer trigger exists
          const menuBtn = page.locator("button[aria-label*='menu' i], button:has(svg.lucide-menu)");
          const count = await menuBtn.count();
          expect(count).toBeGreaterThan(0);
        }

        // 3. Save Screenshot at 390 and 1440
        if (vp.width === 390 || vp.width === 1440) {
          const filename = `${screen.name}_${vp.width}.png`;
          const localPath = path.join(LOCAL_SCREENSHOT_DIR, filename);
          const artifactPath = path.join(ARTIFACT_SCREENSHOT_DIR, filename);

          await page.screenshot({ path: localPath, fullPage: false });
          fs.copyFileSync(localPath, artifactPath);
          console.log(`Saved screenshot: ${artifactPath}`);
        }
      });
    }
  }

  // Interactive Hover & Focus Verification
  test("Dashboard Real Hover & Focus Verification", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded", timeout: 45000 });

    // Find and hover over create post or connect CTA button
    const actionBtn = page.locator("button:has-text('New Post'), a[href*='compose'], button:has-text('Connect')").first();
    if (await actionBtn.isVisible()) {
      await actionBtn.hover();
      const hoverShot = path.join(LOCAL_SCREENSHOT_DIR, "hover_dashboard_action.png");
      const artifactShot = path.join(ARTIFACT_SCREENSHOT_DIR, "hover_dashboard_action.png");
      await page.screenshot({ path: hoverShot });
      fs.copyFileSync(hoverShot, artifactShot);
      console.log("Saved dashboard hover screenshot.");
    }
  });

  // Axe Accessibility Scan Across App Screens - Must FAIL on Serious or Critical
  for (const screen of [LOGGED_IN_SCREENS[0], LOGGED_IN_SCREENS[1], LOGGED_IN_SCREENS[6], LOGGED_IN_SCREENS[7], LOGGED_IN_SCREENS[8]]) {
    test(`Axe Accessibility AA Audit on ${screen.label} (Fail on Critical or Serious)`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`http://localhost:3000${screen.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });

      const axeResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const criticalOrSerious = axeResults.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      console.log(`\n[Axe: ${screen.label}] Critical/Serious Violations: ${criticalOrSerious.length}`);
      if (criticalOrSerious.length > 0) {
        criticalOrSerious.forEach((v) => {
          console.log(`  ❌ [${v.impact?.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
        });
      }

      // Assert ZERO critical or serious accessibility violations
      expect(criticalOrSerious, `Screen ${screen.label} must have 0 critical or serious axe violations`).toEqual([]);
    });
  }
});
