import assert from "assert";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export async function runRealtimeIntegrationTests() {
  console.log("\n--- [INTEGRATION TEST SUITE 9: REAL-TIME SSE & COOKIE CONSENT ENDPOINTS] ---");

  // 1. Realtime SSE: Unauthenticated rejection
  const sseUnauthRes = await fetch(`${BASE_URL}/api/realtime/stream`);
  assert.strictEqual(
    sseUnauthRes.status,
    401,
    "GET /api/realtime/stream without active session must return 401 Unauthorized"
  );
  console.log("✓ GET /api/realtime/stream correctly protected against unauthenticated listeners.");

  // 2. Cookie Consent GET endpoint
  const consentGetRes = await fetch(`${BASE_URL}/api/consent`);
  assert.strictEqual(consentGetRes.status, 200, "GET /api/consent must return 200 OK");
  const consentGetData = await consentGetRes.json();
  assert.strictEqual(consentGetData.success, true, "GET /api/consent must report success");
  assert.strictEqual(consentGetData.consent.necessary, true, "Necessary cookies must be true");
  console.log("✓ GET /api/consent returns compliant default consent state.");

  // 3. Cookie Consent POST endpoint (Accept All)
  const consentPostRes = await fetch(`${BASE_URL}/api/consent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      decision: "ACCEPT_ALL",
    }),
  });
  assert.strictEqual(consentPostRes.status, 200, "POST /api/consent must return 200 OK");
  const consentPostData = await consentPostRes.json();
  assert.strictEqual(consentPostData.consent.analytics, true, "Accept all must enable analytics");
  assert.strictEqual(consentPostData.consent.decision, "ACCEPT_ALL", "Decision must be ACCEPT_ALL");
  const setCookieHeader = consentPostRes.headers.get("set-cookie");
  assert.ok(setCookieHeader && setCookieHeader.includes("pulsesocial_consent"), "pulsesocial_consent cookie must be set");
  console.log("✓ POST /api/consent records acceptance and sets pulsesocial_consent cookie server-side.");

  // 4. Cookie Consent DELETE endpoint (Withdraw)
  const consentDeleteRes = await fetch(`${BASE_URL}/api/consent`, {
    method: "DELETE",
  });
  assert.strictEqual(consentDeleteRes.status, 200, "DELETE /api/consent must return 200 OK");
  const consentDeleteData = await consentDeleteRes.json();
  assert.strictEqual(consentDeleteData.consent.decision, "WITHDRAWN", "Decision must be WITHDRAWN");
  assert.strictEqual(consentDeleteData.consent.analytics, false, "Withdrawal must disable analytics");
  console.log("✓ DELETE /api/consent withdraws consent and disables non-essential cookies.");
}
