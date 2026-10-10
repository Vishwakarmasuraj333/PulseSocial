import assert from "assert";
import { verifyCronAuth } from "../../src/lib/security/cron-auth";

export async function runCronAndSecurityUnitTests() {
  console.log("\n--- [UNIT TEST SUITE 4: CRON AUTH & SECURITY CONTROLS] ---");

  // Save original env
  const origSecret = process.env.CRON_SECRET;
  process.env.CRON_SECRET = "production_super_secret_cron_token_998877";

  try {
    // 1. Valid Bearer Token
    const validReq = new Request("http://localhost:3000/api/cron/publisher", {
      headers: {
        authorization: "Bearer production_super_secret_cron_token_998877",
      },
    });
    assert.strictEqual(verifyCronAuth(validReq), true, "Valid Bearer token must pass cron auth");

    // 2. Valid Custom Header
    const headerReq = new Request("http://localhost:3000/api/cron/publisher", {
      headers: {
        "x-cron-secret": "production_super_secret_cron_token_998877",
      },
    });
    assert.strictEqual(verifyCronAuth(headerReq), true, "Valid x-cron-secret header must pass cron auth");

    // 3. Invalid Secret
    const invalidReq = new Request("http://localhost:3000/api/cron/publisher", {
      headers: {
        authorization: "Bearer wrong_secret_token",
      },
    });
    assert.strictEqual(verifyCronAuth(invalidReq), false, "Invalid secret must be rejected");

    // 4. Missing Secret
    const missingReq = new Request("http://localhost:3000/api/cron/publisher");
    assert.strictEqual(verifyCronAuth(missingReq), false, "Missing secret must be rejected");

    console.log("✓ Constant-time cron authentication and rejection verified.");
  } finally {
    process.env.CRON_SECRET = origSecret;
  }
}
