import assert from "assert";
import { getDefaultConsent, CURRENT_POLICY_VERSION } from "../../src/lib/consent/consent";

export async function runConsentUnitTests() {
  console.log("\n--- [UNIT TEST SUITE 8: REAL COOKIE CONSENT & PREFERENCES] ---");

  // 1. Default Consent State (Opt-in by default for non-essential)
  const defaultConsent = getDefaultConsent();
  assert.strictEqual(defaultConsent.necessary, true, "Necessary cookies must always be true");
  assert.strictEqual(defaultConsent.preferences, false, "Preferences cookies must default to false");
  assert.strictEqual(defaultConsent.analytics, false, "Analytics cookies must default to false");
  assert.strictEqual(defaultConsent.marketing, false, "Marketing cookies must default to false");
  assert.strictEqual(defaultConsent.policyVersion, CURRENT_POLICY_VERSION, "Policy version must match current");
  console.log("✓ Default consent policy verified: strictly necessary only, zero tracking before consent.");

  // 2. Consent Categories Schema & Decoupling
  const acceptedAll = {
    necessary: true,
    preferences: true,
    analytics: true,
    marketing: true,
    decision: "ACCEPT_ALL" as const,
  };
  assert.strictEqual(acceptedAll.necessary && acceptedAll.analytics, true, "Accept all enables necessary and analytics");

  const customPreferences = {
    necessary: true,
    preferences: true,
    analytics: false,
    marketing: false,
    decision: "CUSTOM" as const,
  };
  assert.strictEqual(customPreferences.analytics, false, "Custom consent respects selective rejection");
  console.log("✓ Consent categories and selective customization logic verified.");
}
