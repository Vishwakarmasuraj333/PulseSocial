import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", titleFragment: "PulseSocial" },
  { path: "/features", titleFragment: "Features" },
  { path: "/platforms", titleFragment: "Platforms" },
  { path: "/solutions", titleFragment: "Solutions" },
  { path: "/pricing", titleFragment: "Pricing" },
  { path: "/contact", titleFragment: "Contact" },
  { path: "/blog", titleFragment: "Blog" },
  { path: "/resources", titleFragment: "Resources" },
];

test.describe("Marketing & Public Routes Smoke Tests", () => {
  for (const route of ROUTES) {
    test(`Route ${route.path} responds 200 and loads essential content`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);

      // Verify page body is rendered and not an error boundary
      await expect(page.locator("body")).toBeVisible();
      const bodyText = await page.textContent("body");
      expect(bodyText).not.toContain("Internal Server Error");
      expect(bodyText).not.toContain("Application error: a client-side exception has occurred");

      // Verify footer is present
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
    });
  }
});
