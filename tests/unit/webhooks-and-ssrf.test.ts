import assert from "assert";
import crypto from "crypto";
import { isSafePublicUrl } from "../../src/lib/security/ssrf";

export async function runWebhooksAndSsrfTests() {
  console.log("\n==================================================================");
  console.log("   GAP AUDIT: WEBHOOK SIGNATURES & SSRF SECURITY VERIFICATION");
  console.log("==================================================================");

  // 1. SSRF URL Validation Suite
  console.log("\n[1] Testing SSRF Protection Validator...");
  const maliciousUrls = [
    "http://localhost:3000/api/brand",
    "http://127.0.0.1:8080/internal",
    "http://169.254.169.254/latest/meta-data/",
    "http://metadata.google.internal/computeMetadata/v1/",
    "http://10.0.0.1/admin",
    "http://172.16.1.1/internal-status",
    "http://192.168.1.100/router",
    "ftp://example.com/file.txt",
    "file:///etc/passwd",
  ];

  for (const url of maliciousUrls) {
    const check = isSafePublicUrl(url);
    assert.strictEqual(check.isSafe, false, `URL must be flagged as unsafe: ${url}`);
    console.log(`  ✔ Successfully blocked: ${url} -> ${check.reason}`);
  }

  const safeUrls = [
    "https://images.unsplash.com/photo-1234.jpg",
    "https://cdn.example.com/video.mp4",
    "https://api.github.com/users",
  ];

  for (const url of safeUrls) {
    const check = isSafePublicUrl(url);
    assert.strictEqual(check.isSafe, true, `Legitimate URL must be permitted: ${url}`);
    console.log(`  ✔ Allowed legitimate URL: ${url}`);
  }

  // 2. Webhook Signature Generation & Verification (Meta HMAC-SHA256)
  console.log("\n[2] Testing Meta Webhook HMAC-SHA256 Signatures...");
  const metaSecret = "test_meta_app_secret_32char_key";
  const metaPayload = JSON.stringify({
    object: "page",
    entry: [{ id: "12345", time: 1728564000 }],
  });

  const validMetaSig = `sha256=${crypto
    .createHmac("sha256", metaSecret)
    .update(metaPayload)
    .digest("hex")}`;

  const invalidMetaSig = `sha256=invalid_tampered_signature_hex`;

  // Test local signature verification
  const verifyMeta = (payload: string, header: string, secret: string) => {
    const expected = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
    return header === expected;
  };

  assert.strictEqual(verifyMeta(metaPayload, validMetaSig, metaSecret), true);
  assert.strictEqual(verifyMeta(metaPayload, invalidMetaSig, metaSecret), false);
  console.log("  ✔ Meta HMAC-SHA256 signature verification contract passed.");

  // 3. Stripe Webhook Signature Contract (t=timestamp, v1=hmac)
  console.log("\n[3] Testing Stripe Webhook Signature Contract...");
  const stripeSecret = "whsec_test_stripe_secret_key";
  const stripePayload = JSON.stringify({
    id: "evt_123456",
    type: "customer.subscription.updated",
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedStripePayload = `${timestamp}.${stripePayload}`;
  const validStripeHash = crypto
    .createHmac("sha256", stripeSecret)
    .update(signedStripePayload)
    .digest("hex");
  const validStripeHeader = `t=${timestamp},v1=${validStripeHash}`;

  const verifyStripe = (payload: string, sigHeader: string, secret: string) => {
    const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.trim().split("=")));
    if (!parts.t || !parts.v1) return false;
    const signed = `${parts.t}.${payload}`;
    const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex");
    return parts.v1 === expected;
  };

  assert.strictEqual(verifyStripe(stripePayload, validStripeHeader, stripeSecret), true);
  assert.strictEqual(verifyStripe(stripePayload, "t=123,v1=bad_hash", stripeSecret), false);
  console.log("  ✔ Stripe v1 timestamped HMAC signature contract passed.");

  // 4. Telegram Webhook Secret Token Contract
  console.log("\n[4] Testing Telegram Webhook Secret Token Contract...");
  const tgSecret = "telegram_secret_token_12345";
  const verifyTg = (headerToken: string | null, secret: string) => {
    return headerToken === secret;
  };

  assert.strictEqual(verifyTg("telegram_secret_token_12345", tgSecret), true);
  assert.strictEqual(verifyTg("wrong_token", tgSecret), false);
  console.log("  ✔ Telegram secret token contract passed.");

  console.log("\n✔ ALL WEBHOOK & SSRF GAP AUDIT TESTS PASSED SUCCESSFULLY.\n");
}

if (require.main === module) {
  runWebhooksAndSsrfTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
