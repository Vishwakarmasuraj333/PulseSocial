const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const EVIDENCE_DIR = path.join(__dirname, "..", "SCREENSHOT_EVIDENCE");
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "desktop_1440", width: 1440, height: 900 },
  { name: "tablet_ipad_pro_1024", width: 1024, height: 1366 },
  { name: "mobile_iphone16_393", width: 393, height: 852 },
];

const ROUTES = [
  { path: "/", label: "home_dashboard" },
  { path: "/solutions", label: "solutions_page_defect20" },
  { path: "/pricing", label: "pricing_page" },
  { path: "/contact", label: "contact_page_defects33_39" },
  { path: "/blog", label: "blog_page_defects40_44" },
  { path: "/resources", label: "resources_page" },
  { path: "/features", label: "features_page" },
  { path: "/platforms", label: "platforms_page" },
];

async function capture() {
  console.log("Starting screenshot capture...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2, // High DPI / Retina
    });
    const page = await context.newPage();

    for (const r of ROUTES) {
      const url = `http://localhost:3000${r.path}`;
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
        await page.waitForTimeout(600); // Allow animations to settle

        const filename = `${r.label}_${vp.name}.png`;
        const filePath = path.join(EVIDENCE_DIR, filename);
        await page.screenshot({ path: filePath, fullPage: false });
        console.log(`Captured: ${filename}`);

        // For solutions & contact, also take footer screenshot
        if (r.path === "/solutions") {
          const footer = await page.$("footer");
          if (footer) {
            await footer.screenshot({
              path: path.join(EVIDENCE_DIR, `defect20_footer_solutions_${vp.name}.png`),
            });
            console.log(`Captured footer: defect20_footer_solutions_${vp.name}.png`);
          }
        }
      } catch (err) {
        console.warn(`Failed capturing ${url} on ${vp.name}:`, err.message);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log("Screenshot evidence capture complete!");
}

capture().catch((err) => {
  console.error("Capture fatal error:", err);
  process.exit(1);
});
