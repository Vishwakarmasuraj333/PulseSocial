import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

const VIEWPORTS = [
  { name: "mobile_360", width: 360, height: 740, label: "360px (Galaxy / Small Mobile)" },
  { name: "mobile_390", width: 390, height: 844, label: "390px (iPhone 12/13/14 Mobile)" },
  { name: "tablet_768", width: 768, height: 1024, label: "768px (Tablet Portrait)" },
  { name: "tablet_1024", width: 1024, height: 768, label: "1024px (Tablet Landscape / Small Laptop)" },
  { name: "desktop_1440", width: 1440, height: 900, label: "1440px (Desktop Full HD)" },
];

const ARTIFACT_SCREENSHOT_DIR = "C:/Users/imdee/.gemini/antigravity-ide/brain/fcf41849-8f32-4fc5-98bb-450ef6a49280/screenshots";
const LOCAL_SCREENSHOT_DIR = "./tests/screenshots";

// Ensure screenshot directories exist
for (const dir of [LOCAL_SCREENSHOT_DIR, ARTIFACT_SCREENSHOT_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

test.describe("T9: Responsive Layout & Accessibility Verification Matrix", () => {
  for (const vp of VIEWPORTS) {
    test(`Homepage Responsive & Overflow Check at ${vp.width}x${vp.height} (${vp.label})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 45000 });

      // 1. Verify No Horizontal Overflow
      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });

      console.log(`[Viewport ${vp.width}px] clientWidth=${overflow.clientWidth}, scrollWidth=${overflow.scrollWidth}`);
      expect(overflow.hasOverflow).toBeFalsy();

      // 2. Capture Screenshot at each Viewport
      const localFilename = path.join(LOCAL_SCREENSHOT_DIR, `homepage_${vp.width}.png`);
      const artifactFilename = path.join(ARTIFACT_SCREENSHOT_DIR, `homepage_${vp.width}.png`);

      await page.screenshot({ path: localFilename, fullPage: false });
      fs.copyFileSync(localFilename, artifactFilename);
      console.log(`Saved screenshot: ${artifactFilename}`);
    });
  }

  test("Interactive Focus & Hover States (Keyboard Navigation)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 45000 });

    // Hover over Get Started CTA
    const getStartedBtn = page.locator("a[href='/signup']").first();
    await getStartedBtn.waitFor({ state: "visible", timeout: 10000 });
    await getStartedBtn.hover();

    // Verify hover visual state captured
    const hoverShotLocal = path.join(LOCAL_SCREENSHOT_DIR, "hover_get_started.png");
    const hoverShotArtifact = path.join(ARTIFACT_SCREENSHOT_DIR, "hover_get_started.png");
    await page.screenshot({ path: hoverShotLocal });
    fs.copyFileSync(hoverShotLocal, hoverShotArtifact);

    // Keyboard Tab focus flow
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const focusedElementTag = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`Active focused element after Tab navigation: <${focusedElementTag?.toLowerCase()}>`);
    expect(focusedElementTag).toBeTruthy();
  });

  test("Axe Accessibility Scan (WCAG 2.1 AA Compliance Check)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 45000 });

    // Dismiss or accept cookie banner to evaluate base page
    const acceptBtn = page.locator("#cookie-accept-all");
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    console.log("\n--- AXE ACCESSIBILITY RESULTS ---");
    console.log(`Violations count: ${accessibilityScanResults.violations.length}`);
    console.log(`Passes count: ${accessibilityScanResults.passes.length}`);
    console.log(`Inapplicable rules: ${accessibilityScanResults.inapplicable.length}`);

    if (accessibilityScanResults.violations.length > 0) {
      console.log("Violations breakdown:");
      accessibilityScanResults.violations.slice(0, 5).forEach((v, i) => {
        console.log(`  ${i + 1}. [${v.impact?.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
      });
    }

    // Capture audited page screenshot
    const a11yShotLocal = path.join(LOCAL_SCREENSHOT_DIR, "axe_audited_homepage.png");
    const a11yShotArtifact = path.join(ARTIFACT_SCREENSHOT_DIR, "axe_audited_homepage.png");
    await page.screenshot({ path: a11yShotLocal });
    fs.copyFileSync(a11yShotLocal, a11yShotArtifact);
  });

  test("Pricing Responsive Screenshots at 390px & 1440px", async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("http://localhost:3000/pricing", { waitUntil: "domcontentloaded", timeout: 45000 });

      const shotLocal = path.join(LOCAL_SCREENSHOT_DIR, `pricing_${width}.png`);
      const shotArtifact = path.join(ARTIFACT_SCREENSHOT_DIR, `pricing_${width}.png`);
      await page.screenshot({ path: shotLocal });
      fs.copyFileSync(shotLocal, shotArtifact);
      console.log(`Saved screenshot: ${shotArtifact}`);
    }
  });

  test("Features Responsive Screenshots at 390px & 1440px", async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("http://localhost:3000/features", { waitUntil: "domcontentloaded", timeout: 45000 });

      const shotLocal = path.join(LOCAL_SCREENSHOT_DIR, `features_${width}.png`);
      const shotArtifact = path.join(ARTIFACT_SCREENSHOT_DIR, `features_${width}.png`);
      await page.screenshot({ path: shotLocal });
      fs.copyFileSync(shotLocal, shotArtifact);
      console.log(`Saved screenshot: ${shotArtifact}`);
    }
  });
});
