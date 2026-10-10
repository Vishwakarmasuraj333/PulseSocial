import assert from "assert";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export async function runPublishingContractTests() {
  console.log("\n--- [INTEGRATION TEST SUITE 7: PUBLISHING & HEALTH CONTRACTS] ---");

  // 1. Health Liveness Probe
  const liveRes = await fetch(`${BASE_URL}/api/health/live`);
  const liveData = await liveRes.json();
  assert.strictEqual(liveRes.status, 200, "Liveness endpoint must return 200 OK");
  assert.strictEqual(liveData.status, "UP", "Liveness status must be UP");
  console.log("✓ GET /api/health/live passed (HTTP 200 OK).");

  // 2. Health Readiness Probe
  const readyRes = await fetch(`${BASE_URL}/api/health/ready`);
  const readyData = await readyRes.json();
  assert.strictEqual(readyRes.status, 200, "Readiness endpoint must return 200 OK");
  assert.strictEqual(readyData.checks.database.status, "UP", "Database readiness probe must be UP");
  assert.ok(readyData.checks.database.latencyMs >= 0, "Database ping must measure latency");
  console.log("✓ GET /api/health/ready passed with live database ping.");

  // 3. Unauthenticated /api/posts rejection
  const unauthPostsRes = await fetch(`${BASE_URL}/api/posts`);
  assert.strictEqual(
    unauthPostsRes.status,
    401,
    "Unauthenticated request to /api/posts must return 401 Unauthorized"
  );
  console.log("✓ Unauthenticated /api/posts access safely blocked.");

  // 4. Cron publisher secret validation
  const unauthCronRes = await fetch(`${BASE_URL}/api/cron/publisher`, {
    method: "POST",
    headers: {
      authorization: "Bearer wrong_unauthorized_token",
    },
  });
  assert.strictEqual(
    unauthCronRes.status,
    401,
    "Cron publisher without correct secret must return 401 Unauthorized"
  );
  console.log("✓ Cron publisher safely protected against unauthorized calls.");
}
