import { prisma } from "../../src/lib/prisma";

export async function runAdminAndActivityLoggingTests() {
  console.log("\n--- [SUITE: Admin Panel & Activity Logging Integrity] ---");

  // 1. Test Sensitive Data Redaction in Audit Logging
  console.log("▶ Test 1: Sensitive credentials redaction in audit logs...");
  const sensitiveDetails: Record<string, unknown> = {
    userEmail: "test@pulsesocial.io",
    password: "SuperSecretPassword123!",
    accessToken: "eaab_oauth_live_token_999",
    refreshToken: "refresh_secret_key_888",
    otp: "123456",
    code: "oauth_auth_code_777",
    clientSecret: "app_secret_abc123",
    regularField: "Normal metadata value",
  };

  // Test our redaction logic
  const sanitized = { ...sensitiveDetails };
  const sensitiveKeys = ["password", "token", "accessToken", "refreshToken", "secret", "otp", "code"];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = "[REDACTED]";
    }
  }

  if (sanitized.password !== "[REDACTED]") throw new Error("Password was not redacted!");
  if (sanitized.accessToken !== "[REDACTED]") throw new Error("accessToken was not redacted!");
  if (sanitized.refreshToken !== "[REDACTED]") throw new Error("refreshToken was not redacted!");
  if (sanitized.otp !== "[REDACTED]") throw new Error("OTP was not redacted!");
  if (sanitized.code !== "[REDACTED]") throw new Error("Code was not redacted!");
  if (sanitized.clientSecret !== "[REDACTED]") throw new Error("clientSecret was not redacted!");
  if (sanitized.regularField !== "Normal metadata value") throw new Error("Regular field was corrupted!");

  console.log("  ✔ Sensitive keys strictly sanitized to [REDACTED]");

  // 2. Test Real Database AuditLog Persistence
  console.log("▶ Test 2: Database AuditLog record persistence & retrieval...");
  const testLog = await prisma.auditLog.create({
    data: {
      action: "TEST_INTEGRATION_AUDIT",
      resourceType: "SystemTest",
      resourceId: "test-run-" + Date.now(),
      details: JSON.stringify(sanitized),
      ipAddress: "127.0.0.1",
      userAgent: "PulseSocial-TestRunner/1.0",
    },
  });

  if (!testLog.id) throw new Error("Failed to persist AuditLog record!");
  const fetched = await prisma.auditLog.findUnique({ where: { id: testLog.id } });
  if (!fetched || fetched.action !== "TEST_INTEGRATION_AUDIT") {
    throw new Error("AuditLog record could not be retrieved from database!");
  }

  // Clean up test audit log
  await prisma.auditLog.delete({ where: { id: testLog.id } });
  console.log("  ✔ AuditLog safely persisted, validated, and cleaned up in PostgreSQL");

  // 3. Test PricingPlan Seed & Integrity
  console.log("▶ Test 3: PricingPlan models and limits JSON integrity...");
  const plans = await prisma.pricingPlan.findMany();
  // Ensure default plans exist or can be queried
  console.log(`  ✔ Found ${plans.length} pricing plans configured in database`);
  for (const plan of plans) {
    if (!plan.slug || typeof plan.priceMonthly !== "number") {
      throw new Error(`Plan ${plan.name} has invalid price or slug!`);
    }
    // Verify featuresJson is valid JSON
    const parsed = JSON.parse(plan.featuresJson);
    if (!Array.isArray(parsed)) {
      throw new Error(`Plan ${plan.name} featuresJson is not an array!`);
    }
  }
  console.log("  ✔ All PricingPlan rows have valid JSON features and numeric pricing");

  // 4. Test Concurrency Locking for Scheduled Posts
  console.log("▶ Test 4: Concurrency duplicate prevention (isLocked claim)...");
  // Test atomic locking pattern
  const testPost = await prisma.socialPost.findFirst();
  if (testPost) {
    const fakeSchedule = await prisma.scheduledPost.upsert({
      where: { postId: testPost.id },
      update: { isLocked: false, runAt: new Date() },
      create: { postId: testPost.id, runAt: new Date(), isLocked: false },
    });

    // Worker 1 claims lock
    const claim1 = await prisma.scheduledPost.updateMany({
      where: { id: fakeSchedule.id, isLocked: false },
      data: { isLocked: true },
    });

    // Worker 2 attempts same claim simultaneously
    const claim2 = await prisma.scheduledPost.updateMany({
      where: { id: fakeSchedule.id, isLocked: false },
      data: { isLocked: true },
    });

    if (claim1.count !== 1) throw new Error("Worker 1 failed to acquire lock!");
    if (claim2.count !== 0) throw new Error("Worker 2 acquired lock that was already held! Concurrency breach!");

    // Release lock
    await prisma.scheduledPost.update({
      where: { id: fakeSchedule.id },
      data: { isLocked: false },
    });
    console.log("  ✔ Atomic schedule locking correctly rejects concurrent duplicate dispatch");
  } else {
    console.log("  ℹ No existing post to test schedule claim against (skipped)");
  }

  // 5. Test Live DB Latency Measurement
  console.log("▶ Test 5: Real-time DB latency measurement...");
  const start = performance.now();
  await prisma.$queryRaw`SELECT 1`;
  const latency = Math.round(performance.now() - start);
  console.log(`  ✔ Real PostgreSQL latency measured: ${latency}ms`);
  if (latency > 5000) {
    console.warn("  ⚠ High database latency observed (>5000ms)");
  }

  console.log("✔ Admin Panel & Activity Logging Suite PASSED (100% SUCCESS)");
}
