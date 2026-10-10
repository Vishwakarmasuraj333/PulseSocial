import assert from "assert";
import { getPlatformCapability, PLATFORM_CAPABILITIES } from "../../src/lib/social/capabilities";

export async function runCapabilitiesUnitTests() {
  console.log("\n--- [UNIT TEST SUITE 3: CAPABILITY REGISTRY & TRUTHFULNESS] ---");

  // 1. Unconnected Platform Defaults
  const unlinkedInsta = getPlatformCapability("instagram");
  assert.strictEqual(unlinkedInsta.CONNECTED, false, "Unconnected platform must have CONNECTED: false");
  assert.strictEqual(unlinkedInsta.TOKEN_VALID, false, "Unconnected platform must have TOKEN_VALID: false");
  assert.strictEqual(unlinkedInsta.ACCOUNT_SYNCED, false, "Unconnected platform must have ACCOUNT_SYNCED: false");
  console.log("✓ Unconnected default state correctly reports CONNECTED: false.");

  // 2. Truthful Policy Restrictions (e.g. Instagram programmatic likes)
  assert.strictEqual(
    unlinkedInsta.canLike,
    false,
    "Instagram must restrict programmatic likes per Meta Graph API policy"
  );
  assert.strictEqual(
    unlinkedInsta.APPROVAL_REQUIRED,
    true,
    "Instagram must require Meta App Review for publishing"
  );
  console.log("✓ Meta API policy restrictions verified.");

  // 3. X (Twitter) Constraints
  const xCap = getPlatformCapability("x");
  assert.strictEqual(xCap.maxCharacterLimit, 280, "X standard character limit must be 280");
  assert.strictEqual(xCap.canPublish, true, "X must support publishing");
  console.log("✓ X (Twitter) character constraints verified.");

  // 4. Runtime Account State Resolution
  const connectedAccount = {
    status: "CONNECTED",
    tokenExpiresAt: new Date(Date.now() + 86400000), // tomorrow
    lastSyncedAt: new Date(),
  };
  const resolvedCap = getPlatformCapability("linkedin", connectedAccount);
  assert.strictEqual(resolvedCap.CONNECTED, true, "Connected account must evaluate to CONNECTED: true");
  assert.strictEqual(resolvedCap.TOKEN_VALID, true, "Valid token must evaluate to TOKEN_VALID: true");
  assert.strictEqual(resolvedCap.ACCOUNT_SYNCED, true, "Synced account must evaluate to ACCOUNT_SYNCED: true");

  const expiredAccount = {
    status: "EXPIRED",
    tokenExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
    lastSyncedAt: null,
  };
  const expiredCap = getPlatformCapability("linkedin", expiredAccount);
  assert.strictEqual(expiredCap.TOKEN_VALID, false, "Expired token must evaluate to TOKEN_VALID: false");
  console.log("✓ Dynamic runtime account evaluation verified.");
}
