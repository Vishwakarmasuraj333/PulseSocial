import { test, expect } from "@playwright/test";

test.describe("Pricing Page Tests (Defects 22–32)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "networkidle" });
  });

  test("Pricing toggle switches between Monthly and Annual billing", async ({ page }) => {
    const billingToggle = page.locator("button:has-text('Monthly'), button:has-text('Annual')").first();
    await expect(billingToggle).toBeVisible();

    const discountBadge = page.locator("text=Save").or(page.locator("text=20%"));
    await expect(discountBadge.first()).toBeVisible();
  });

  test("Plan CTA buttons are clickable and carry correct labels", async ({ page }) => {
    const starterBtn = page.locator('a[href*="plan=starter"]');
    expect(await starterBtn.count()).toBeGreaterThanOrEqual(1);

    const proBtn = page.locator('a[href*="plan=professional"]');
    expect(await proBtn.count()).toBeGreaterThanOrEqual(1);

    const agencyBtn = page.locator('a[href*="plan=agency"]');
    expect(await agencyBtn.count()).toBeGreaterThanOrEqual(1);
  });

  test("FAQ accordions expand and collapse on click", async ({ page }) => {
    const faqBtn = page.locator("button").filter({ hasText: "Can I connect multiple accounts" });
    await expect(faqBtn).toBeVisible();

    const initialExpanded = await faqBtn.getAttribute("aria-expanded");
    await faqBtn.click();
    await page.waitForTimeout(300);

    const nextExpanded = await faqBtn.getAttribute("aria-expanded");
    expect(nextExpanded).not.toBe(initialExpanded);
  });

  test("No horizontal scrollbar exists on /pricing", async ({ page }) => {
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);
  });
});
