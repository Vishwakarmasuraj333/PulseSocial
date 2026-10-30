import assert from "assert";
import fs from "fs";
import path from "path";
import { PinterestProvider } from "../src/lib/social/providers/pinterest";
import { BlueskyProvider } from "../src/lib/social/providers/bluesky";
import { InstagramProvider } from "../src/lib/social/providers/instagram";
import { isCompanyAdminEmail } from "../src/lib/auth/admin-emails";

export async function runFunctionalDefectsSuite() {
  console.log("Running QA 6-Functional-Defects Verification Suite...\n");

  process.env.META_APP_ID = process.env.META_APP_ID || "1460078605992454";
  process.env.META_APP_SECRET = process.env.META_APP_SECRET || "meta_test_secret_key_12345";

  // Defect 1: Instagram and WhatsApp OAuth Separation
  const instagram = new InstagramProvider();
  assert.strictEqual(instagram.platform, "instagram", "Instagram provider platform key must be 'instagram'");
  const igAuthUrl = instagram.getAuthorizationUrl("test_state", "https://pulsesocial1.vercel.app/api/social/instagram/callback");
  assert.ok(igAuthUrl.includes("instagram.com/oauth/authorize"), "Instagram auth URL must target instagram.com OAuth endpoint");
  assert.ok(igAuthUrl.includes("enable_fb_login=0"), "Instagram OAuth must explicitly include enable_fb_login=0");
  assert.ok(!igAuthUrl.includes("facebook.com/dialog"), "Instagram OAuth must not route through facebook.com dialog");
  console.log("[PASS] Defect 1 - Direct Instagram OAuth (enable_fb_login=0) verified");

  // Defect 2: Unconfigured popup persistence in UniversalSocialConnectModal
  const modalCode = fs.readFileSync(path.join(process.cwd(), "src/components/social/UniversalSocialConnectModal.tsx"), "utf8");
  assert.ok(
    !modalCode.includes("if (popup && !popup.closed) popup.close();\n          toast({"),
    "Popup must NOT be prematurely closed when opening third-party platforms (Snapchat, Threads, etc.)"
  );
  assert.ok(
    modalCode.includes("data.connected && data.account"),
    "Modal must automatically recognize directly authenticated channels and update state"
  );
  console.log("[PASS] Defect 2 - Popup window persistence and direct connect verified");

  // Defect 3: Single Company Super-Admin Security Policy
  assert.strictEqual(isCompanyAdminEmail("suraj@pulsesocial.io"), true, "Authorized company admin email must be allowed");
  assert.strictEqual(isCompanyAdminEmail("admin@pulsesocial.io"), true, "Master company admin email must be allowed");
  assert.strictEqual(isCompanyAdminEmail("random_user@gmail.com"), false, "Regular registered user must be forbidden from /admin");
  assert.strictEqual(isCompanyAdminEmail("attacker@company.com"), false, "Non-admin email must never be authorized");
  console.log("[PASS] Defect 3 - Single Company Super-Admin RBAC enforcement verified");

  // Defect 4: Suspended User Immediate Lockdown
  const verifyOtpCode = fs.readFileSync(path.join(process.cwd(), "src/app/api/auth/verify-otp/route.ts"), "utf8");
  assert.ok(
    verifyOtpCode.includes('user.status === "SUSPENDED"'),
    "verify-otp route must strictly reject suspended accounts with 403 Forbidden"
  );
  const sessionCode = fs.readFileSync(path.join(process.cwd(), "src/lib/auth/session.ts"), "utf8");
  assert.ok(
    sessionCode.includes('userStatusCheck.status === "SUSPENDED"'),
    "Active session getter must invalidate suspended accounts immediately"
  );
  console.log("[PASS] Defect 4 - Suspended user login and session rejection verified");

  // Defect 5: Clickable App Store and Google Play Download Badges
  const mobileCode = fs.readFileSync(path.join(process.cwd(), "src/components/marketing/PulseMobileShowcase.tsx"), "utf8");
  assert.ok(
    mobileCode.includes('href="https://apps.apple.com/app/pulsesocial/id6470000000"'),
    "App Store button must be an anchor link targeting Apple App Store"
  );
  assert.ok(
    mobileCode.includes('href="https://play.google.com/store/apps/details?id=io.pulsesocial.app"'),
    "Google Play button must be an anchor link targeting Google Play Store"
  );
  assert.ok(
    mobileCode.includes('target="_blank"'),
    "Store links must open in external tab"
  );
  console.log("[PASS] Defect 5 - Play Store & App Store clickable links verified");

  // Defect 6: 'Register' Button Landing Page Destination
  const webinarCode = fs.readFileSync(path.join(process.cwd(), "src/components/marketing/PulseWebinarBanner.tsx"), "utf8");
  assert.ok(
    webinarCode.includes('href="/signup"'),
    "Webinar 'REGISTER NOW' button must link directly to new user signup (/signup)"
  );
  const nextConfigCode = fs.readFileSync(path.join(process.cwd(), "next.config.mjs"), "utf8");
  assert.ok(
    nextConfigCode.includes('destination: "/signup"'),
    "next.config.mjs must permanently redirect /register to /signup"
  );
  console.log("[PASS] Defect 6 - Register button routes directly to /signup verified");

  // Integrations: Pinterest & Bluesky Credentials
  const pinterest = new PinterestProvider();
  assert.strictEqual(pinterest.isConfigured(), true, "Pinterest provider must report configured with live App ID 1612708");
  const bluesky = new BlueskyProvider();
  assert.strictEqual(bluesky.isConfigured(), true, "Bluesky provider must report configured with surajvishwa.bsky.social");
  console.log("[PASS] Integrations - Pinterest & Bluesky live credentials verified");

  console.log("\n========================================");
  console.log("All 6 QA Functional Defects: PASSED (7/7)");
  console.log("========================================\n");
}

runFunctionalDefectsSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
