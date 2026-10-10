import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { prisma } from "../../src/lib/prisma";
import { CURRENT_POLICY_VERSION, CONSENT_COOKIE_NAME } from "../../src/lib/consent/consent-config";

const VIEWPORTS = [
  { name: "mobile-360", width: 360, height: 740 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

/**
 * Helper to ensure the banner is visible and ready
 */
async function waitForBannerHydration(page: Page) {
  const banner = page.locator("aside[aria-label='Cookie consent']");
  await banner.waitFor({ state: "visible", timeout: 35000 });
  return banner;
}

test.describe("T3: Real Cookie Consent Banner & Preferences Dialog Engine", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    // Hide Next.js dev tools floating pill so it doesn't overlap mobile buttons or intercept clicks
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.innerHTML = `
        nextjs-portal,
        [data-nextjs-dev-tools-button],
        [data-nextjs-toast],
        button[aria-label="Open Next.js Dev Tools"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `;
      document.head?.appendChild(style);
      document.addEventListener("DOMContentLoaded", () => {
        document.head?.appendChild(style);
      });
    });
  });

  // Test 1: Fresh Context & Compact Banner State
  test("1. Fresh visitor: banner is visible, compact, and preferences dialog is closed", async ({
    page,
    context,
  }) => {
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    const banner = await waitForBannerHydration(page);

    // Preferences dialog must NOT be open by default
    const dialog = page.locator("div[role='dialog'][aria-labelledby='cookie-preferences-title']");
    await expect(dialog).toHaveCount(0);

    // Verify Title and Text
    await expect(banner.locator("h2")).toHaveText("Your privacy choices");
    await expect(banner).toContainText("We use essential cookies to keep you signed in and secure.");

    // Verify Links open in same tab
    const cookiePolicyLink = banner.locator("a[href='/cookie-policy']");
    const privacyPolicyLink = banner.locator("a[href='/privacy']");
    await expect(cookiePolicyLink).toBeVisible();
    await expect(privacyPolicyLink).toBeVisible();
    expect(await cookiePolicyLink.getAttribute("target")).toBeNull();
    expect(await privacyPolicyLink.getAttribute("target")).toBeNull();

    // Verify Only essential cookies exist before user action
    const cookies = await context.cookies();
    const optionalCookieNames = cookies.map((c) => c.name).filter((n) => n === "_pk_id" || n === "_pk_ses");
    expect(optionalCookieNames.length).toBe(0);
  });

  // Test 2: Reject all vs Accept all Equal Prominence Contract
  test("2. Reject all and Accept all have identical width, height, and font-weight", async ({
    page,
  }) => {
    // Test on desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    const banner = await waitForBannerHydration(page);
    const rejectBtn = banner.locator("#cookie-reject-all");
    const acceptBtn = banner.locator("#cookie-accept-all");

    await expect(rejectBtn).toBeVisible();
    await expect(acceptBtn).toBeVisible();

    const rejectBox = await rejectBtn.boundingBox();
    const acceptBox = await acceptBtn.boundingBox();
    expect(rejectBox).not.toBeNull();
    expect(acceptBox).not.toBeNull();

    // Equal Height and Width
    expect(Math.round(rejectBox!.height)).toBe(Math.round(acceptBox!.height));
    expect(Math.round(rejectBox!.width)).toBe(Math.round(acceptBox!.width));

    // Equal Font Weight and Styling
    const rejectStyles = await rejectBtn.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { fontWeight: s.fontWeight, fontSize: s.fontSize, borderStyle: s.borderStyle };
    });
    const acceptStyles = await acceptBtn.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { fontWeight: s.fontWeight, fontSize: s.fontSize, borderStyle: s.borderStyle };
    });

    expect(rejectStyles.fontWeight).toBe(acceptStyles.fontWeight);
    expect(rejectStyles.fontSize).toBe(acceptStyles.fontSize);
    expect(rejectStyles.borderStyle).toBe(acceptStyles.borderStyle);
  });

  // Test 3: Reject All Action & Persistence without Flash
  test("3. Reject all closes banner, sets decision, and persists across reload with no flash", async ({
    page,
    context,
  }) => {
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    const banner = await waitForBannerHydration(page);
    const rejectBtn = banner.locator("#cookie-reject-all");
    await rejectBtn.click();

    // Banner closes
    await expect(page.locator("aside[aria-label='Cookie consent']")).toHaveCount(0, { timeout: 45000 });

    // Verify cookie set
    const cookies = await context.cookies();
    const consentCookie = cookies.find((c) => c.name === CONSENT_COOKIE_NAME);
    expect(consentCookie).toBeDefined();
    const parsed = JSON.parse(decodeURIComponent(consentCookie!.value));
    expect(parsed.decision).toBe("REJECT_ALL");
    expect(parsed.necessary).toBe(true);
    expect(parsed.preferences).toBe(false);
    expect(parsed.analytics).toBe(false);

    // Reload page: returning visitor must NOT see banner flash
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("aside[aria-label='Cookie consent']")).toHaveCount(0);
  });

  // Test 4: Accept All Action & Database ConsentRecord Persistence
  test("4. Accept all sets cookie flags and creates ConsentRecord in DB", async ({
    page,
    context,
  }) => {
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    const banner = await waitForBannerHydration(page);
    const acceptBtn = banner.locator("#cookie-accept-all");
    await acceptBtn.click();

    // Banner closes
    await expect(page.locator("aside[aria-label='Cookie consent']")).toHaveCount(0, { timeout: 45000 });

    // Verify cookie flags
    const cookies = await context.cookies();
    const consentCookie = cookies.find((c) => c.name === CONSENT_COOKIE_NAME);
    expect(consentCookie).toBeDefined();
    expect(consentCookie?.sameSite).toBe("Lax");
    expect(consentCookie?.path).toBe("/");

    const parsed = JSON.parse(decodeURIComponent(consentCookie!.value));
    expect(parsed.decision).toBe("ACCEPT_ALL");
    expect(parsed.preferences).toBe(true);
    expect(parsed.analytics).toBe(true);

    // Verify row in DB
    const latestRecord = await prisma.consentRecord.findFirst({
      where: { decision: "ACCEPT_ALL", policyVersion: CURRENT_POLICY_VERSION },
      orderBy: { timestamp: "desc" },
    });
    expect(latestRecord).not.toBeNull();
    expect(latestRecord?.preferences).toBe(true);
    expect(latestRecord?.analytics).toBe(true);
  });

  // Test 5: Preferences Dialog Customize, Accordion Cookie List, and Selective Save
  test("5. Customize opens dialog, displays single-source tables, toggles one category, and saves", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    const banner = await waitForBannerHydration(page);

    // Open Customize
    const customizeBtn = banner.locator("#cookie-customize");
    await customizeBtn.click();

    const dialog = page.locator("div[role='dialog'][aria-labelledby='cookie-preferences-title']");
    await dialog.waitFor({ state: "visible", timeout: 15000 });
    await expect(dialog).toBeVisible();

    // Verify Dialog Title and Metadata
    await expect(dialog.locator("#cookie-preferences-title")).toHaveText("Cookie preferences");
    await expect(dialog).toContainText(`Policy version: ${CURRENT_POLICY_VERSION}`);

    // Verify Strictly Necessary is Always Active and locked
    await expect(dialog).toContainText("Always active");

    // Expand cookie list accordion
    const viewCookiesBtn = dialog.locator("button:has-text('View cookies')").first();
    await viewCookiesBtn.click();
    const table = dialog.locator("table").first();
    await expect(table).toBeVisible();
    await expect(table).toContainText("pulsesocial_auth_session");

    // Toggle Preferences ON, leave Analytics OFF
    const prefSwitch = dialog.locator("#switch-preferences");
    await expect(prefSwitch).toBeVisible();
    await expect(prefSwitch).toContainText("Off");
    await prefSwitch.click();
    await expect(prefSwitch).toContainText("On");

    // Click 'Save my choices'
    const saveBtn = dialog.locator("#dialog-save-choices");
    await saveBtn.click();

    // Dialog closes
    await expect(dialog).toHaveCount(0, { timeout: 45000 });

    // Verify DB record has preferences=true, analytics=false
    const customRecord = await prisma.consentRecord.findFirst({
      where: { decision: "CUSTOM", preferences: true, analytics: false },
      orderBy: { timestamp: "desc" },
    });
    expect(customRecord).not.toBeNull();
  });

  // Test 6: Footer Reopen Link and Consent Withdrawal
  test("6. Footer 'Cookie settings' link reopens dialog with saved state; withdraw clears choices", async ({
    page,
    context,
  }) => {
    // 1. First accept all to establish saved state
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
    const banner = await waitForBannerHydration(page);
    const acceptBtn = banner.locator("#cookie-accept-all");
    await acceptBtn.click();
    await expect(page.locator("aside[aria-label='Cookie consent']")).toHaveCount(0, { timeout: 45000 });

    // 2. Click footer link 'Cookie settings'
    const footerLink = page.locator("button:has-text('Cookie settings')").first();
    await footerLink.scrollIntoViewIfNeeded();
    await footerLink.click();

    // Preferences Dialog reopens
    const dialog = page.locator("div[role='dialog'][aria-labelledby='cookie-preferences-title']");
    await expect(dialog).toBeVisible({ timeout: 20000 });

    // Dialog is prefilled with saved state (Preferences On, Analytics On)
    const prefSwitch = dialog.locator("#switch-preferences");
    const analyticsSwitch = dialog.locator("#switch-analytics");
    await expect(prefSwitch).toContainText("On");
    await expect(analyticsSwitch).toContainText("On");

    // 3. Click 'Reject all' to withdraw optional consent
    const dialogRejectBtn = dialog.locator("#dialog-reject-all");
    await dialogRejectBtn.click();
    await expect(dialog).toHaveCount(0, { timeout: 45000 });

    // Verify withdrawal in DB
    const withdrawnRecord = await prisma.consentRecord.findFirst({
      where: { decision: "REJECT_ALL" },
      orderBy: { timestamp: "desc" },
    });
    expect(withdrawnRecord).not.toBeNull();
    expect(withdrawnRecord?.preferences).toBe(false);
    expect(withdrawnRecord?.analytics).toBe(false);
  });

  // Test 7: Accessibility - Focus Trap, Escape Key, Focus Return, and Sec-GPC
  test("7. Accessibility: Esc closes dialog, focus returns to trigger, and Sec-GPC keeps analytics off", async ({
    browser,
  }) => {
    // Test Sec-GPC header support
    const gpcContext = await browser.newContext({
      extraHTTPHeaders: {
        "Sec-GPC": "1",
      },
    });
    const gpcPage = await gpcContext.newPage();
    await gpcPage.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    const banner = await waitForBannerHydration(gpcPage);
    const customizeBtn = banner.locator("#cookie-customize");
    await customizeBtn.click();

    const dialog = gpcPage.locator("div[role='dialog'][aria-labelledby='cookie-preferences-title']");
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Sec-GPC active badge or analytics default OFF
    const analyticsSwitch = dialog.locator("#switch-analytics");
    await expect(analyticsSwitch).toContainText("Off");

    // Verify focus is inside the dialog
    const activeElementInside = await dialog.evaluate((d) => d.contains(document.activeElement));
    expect(activeElementInside).toBe(true);

    // Press Escape key -> Dialog closes without saving
    await gpcPage.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);

    // Focus returns to the trigger (Customize button)
    const isCustomizeFocused = await customizeBtn.evaluate((el) => el === document.activeElement);
    expect(isCustomizeFocused).toBe(true);

    await gpcContext.close();
  });

  // Test 8: Policy Version Bump Re-prompt
  test("8. Outdated policy version cookie forces re-consent prompt", async ({
    page,
    context,
  }) => {
    // Set old policy version cookie
    await context.addCookies([
      {
        name: CONSENT_COOKIE_NAME,
        value: encodeURIComponent(
          JSON.stringify({
            necessary: true,
            preferences: true,
            analytics: true,
            decision: "ACCEPT_ALL",
            policyVersion: "2024-01", // Old version
            timestamp: new Date().toISOString(),
          })
        ),
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    // Outdated policy must cause banner to appear again
    const banner = await waitForBannerHydration(page);
    await expect(banner).toBeVisible();
  });

  // Test 9: Failed API Call Keeps UI Open and Displays Retry Button
  test("9. Failed API call keeps UI open, shows error banner, and allows Retry", async ({
    page,
  }) => {
    let callCount = 0;
    // Intercept POST /api/consent and simulate 500 error on first attempt
    await page.route("**/api/consent", async (route) => {
      if (route.request().method() === "POST") {
        callCount++;
        if (callCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ success: false, error: "Database temporary connection timeout" }),
          });
          return;
        }
      }
      await route.continue();
    });

    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
    const banner = await waitForBannerHydration(page);

    const acceptBtn = banner.locator("#cookie-accept-all");
    await acceptBtn.click();

    // Banner MUST stay open
    await expect(banner).toBeVisible();

    // Error alert must be shown with retry button
    const errorAlert = banner.locator("[role='alert']");
    await expect(errorAlert).toBeVisible({ timeout: 15000 });
    await expect(errorAlert).toContainText("Unable to save your privacy choices");
    const retryBtn = banner.locator("button:has-text('Retry')");
    await expect(retryBtn).toBeVisible();

    // Clicking Retry now succeeds (callCount === 2)
    await retryBtn.click();
    await expect(page.locator("aside[aria-label='Cookie consent']")).toHaveCount(0, { timeout: 45000 });
  });

  // Test 10: Responsive Layout & Real Visual Screenshots
  test("10. Responsive capture across 360, 390, 768, 1024, 1440 viewports", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
    const banner = await waitForBannerHydration(page);
    await expect(banner).toBeVisible();

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300); // Allow responsive CSS transitions to settle

      // Screenshot banner
      await page.screenshot({
        path: `tests/screenshots/consent_banner_${vp.width}.png`,
        fullPage: false,
      });

      // Open preferences dialog and screenshot
      const customizeBtn = banner.locator("#cookie-customize");
      await customizeBtn.scrollIntoViewIfNeeded();
      await customizeBtn.click();
      const dialog = page.locator("div[role='dialog'][aria-labelledby='cookie-preferences-title']");
      await dialog.waitFor({ state: "visible", timeout: 15000 });
      await expect(dialog).toBeVisible();

      await page.screenshot({
        path: `tests/screenshots/consent_dialog_${vp.width}.png`,
        fullPage: false,
      });

      // Close for next iteration
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    }
  });

  // Test 11: Axe-core Accessibility Audit (Fail on serious or critical)
  test("11. Axe-core accessibility scan on banner and dialog must have 0 serious or critical violations", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    const banner = await waitForBannerHydration(page);

    // 1. Audit banner
    const bannerScan = await new AxeBuilder({ page })
      .include("aside[aria-label='Cookie consent']")
      .analyze();

    const bannerViolations = bannerScan.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    expect(bannerViolations).toEqual([]);

    // 2. Open dialog and audit dialog
    const customizeBtn = banner.locator("#cookie-customize");
    await customizeBtn.click();
    const dialog = page.locator("div[role='dialog'][aria-labelledby='cookie-preferences-title']");
    await dialog.waitFor({ state: "visible", timeout: 15000 });
    await expect(dialog).toBeVisible();

    const dialogScan = await new AxeBuilder({ page })
      .include("div[role='dialog'][aria-labelledby='cookie-preferences-title']")
      .analyze();

    const dialogViolations = dialogScan.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    expect(dialogViolations).toEqual([]);
  });
});
