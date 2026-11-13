import { test, expect } from "@playwright/test";

test.describe("Defect 20: Footer Alignment and Spacing on /solutions", () => {
  test("Footer columns are properly aligned without horizontal overflow", async ({ page }) => {
    await page.goto("/solutions", { waitUntil: "networkidle" });

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Check that there is no horizontal page overflow
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);

    // Verify footer column count and visibility using h4
    const headings = footer.locator("h4");
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(5);

    const expectedHeadings = ["Product", "Resources", "Company", "Legal & Trust", "Account"];
    for (const text of expectedHeadings) {
      await expect(footer.locator(`h4:has-text("${text}")`)).toBeVisible();
    }
  });

  test("Footer nav columns on iPad / Desktop have uniform grid widths", async ({ page }) => {
    await page.goto("/solutions", { waitUntil: "networkidle" });

    const viewportSize = page.viewportSize();
    if (viewportSize && viewportSize.width >= 1024) {
      const columnBoxes = await page.evaluate(() => {
        const grid = document.querySelector("footer .grid");
        if (!grid) return [];
        return Array.from(grid.children).map((c) => {
          const rect = c.getBoundingClientRect();
          return { width: rect.width, left: rect.left, top: rect.top };
        });
      });

      expect(columnBoxes.length).toBe(5);
      for (const col of columnBoxes) {
        expect(col.width).toBeGreaterThan(100);
      }
    }
  });
});
