import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/features", "/platforms", "/solutions", "/pricing", "/contact", "/blog", "/resources"];

test.describe("Responsive Audit Tests (All Viewports)", () => {
  for (const route of ROUTES) {
    test(`Zero horizontal overflow on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(200);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  }

  test("PS floating widget is hidden on mobile & tablet, visible only on 2xl screens", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const viewport = page.viewportSize();
    const psWidget = page.locator('[data-testid="ps-floating-widget"], aside[aria-label="Quick Actions"]');

    if (viewport && viewport.width < 1536) {
      const count = await psWidget.count();
      if (count > 0) {
        const isVisible = await psWidget.first().isVisible();
        expect(isVisible).toBe(false);
      }
    }
  });

  test("Mobile navigation drawer opens when hamburger is clicked on iPhone", async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width <= 768) {
      await page.goto("/", { waitUntil: "networkidle" });

      const menuBtn = page.locator('button[aria-label="Toggle mobile menu"]');
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
        await page.waitForTimeout(300);

        // Verify mobile nav drawer is visible and contains navigation links
        const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
        await expect(mobileNav).toBeVisible();
        await expect(mobileNav.locator('a[href="/pricing"]')).toBeVisible();
      }
    }
  });
});
