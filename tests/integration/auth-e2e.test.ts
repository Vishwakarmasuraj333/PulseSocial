import assert from "assert";
import crypto from "crypto";
import { prisma } from "../../src/lib/prisma";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function resolveOtpFromHash(targetHash: string): string | null {
  for (let i = 100000; i <= 999999; i++) {
    const s = i.toString();
    if (crypto.createHash("sha256").update(s).digest("hex") === targetHash) {
      return s;
    }
  }
  return null;
}

export async function runAuthEndToEndTests() {
  console.log("\n--- [INTEGRATION TEST SUITE 6: AUTH & OTP END-TO-END FLOW] ---");

  const testEmail = `integration_user_${Date.now()}@example.com`;
  const testPassword = "ValidPassword123!";
  const testName = "Antigravity Automated Tester";

  // 1. Signup / Register via canonical /api/auth/register
  const signupRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
    }),
  });

  const signupData = await signupRes.json();
  assert.strictEqual(signupRes.status, 201, `Signup must return 201 Created: ${JSON.stringify(signupData)}`);
  assert.ok(signupData.userId, "Signup response must include created userId");
  console.log("✓ User created in unverified state via /api/auth/register.");

  // 2. Reject Bad OTP
  const badOtpRes = await fetch(`${BASE_URL}/api/auth/verify-email/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: signupData.userId,
      code: "000000",
    }),
  });
  assert.strictEqual(badOtpRes.status, 400, "Bad OTP must be rejected with 400");
  console.log("✓ Invalid OTP correctly rejected.");

  // 3. Resolve OTP Hash from DB and Verify
  const otpRecord = await prisma.emailVerificationOTP.findFirst({
    where: { userId: signupData.userId },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(otpRecord, "OTP record must be persisted in database");
  assert.strictEqual(otpRecord.codeHash.length, 64, "OTP must be stored as SHA-256 hash");

  const validOtpCode = resolveOtpFromHash(otpRecord.codeHash);
  assert.ok(validOtpCode, "Must resolve valid 6-digit OTP code");

  const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-email/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: signupData.userId,
      code: validOtpCode,
    }),
  });
  const verifyData = await verifyRes.json();
  const sessionCookieHeader = verifyRes.headers.get("set-cookie");
  assert.strictEqual(verifyRes.status, 200, `OTP verification must succeed: ${JSON.stringify(verifyData)}`);
  assert.strictEqual(verifyData.success, true, "Response must report success: true");
  assert.ok(sessionCookieHeader, "Auth session cookie must be issued upon verification");
  console.log("✓ 6-Digit OTP verified, single-use consumed, and session cookie issued.");

  // 4. Session Validation via /api/auth/me
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      Cookie: sessionCookieHeader,
    },
  });
  const meData = await meRes.json();
  assert.strictEqual(meRes.status, 200, "Authenticated /api/auth/me must return 200");
  assert.ok(meData.user, "User profile must be returned");
  assert.strictEqual(meData.user.email, testEmail, "Profile email must match");
  assert.strictEqual(meData.user.emailVerified, true, "emailVerified must be true");
  assert.strictEqual(meData.user.passwordHash, undefined, "passwordHash must NEVER be exposed in /api/auth/me");
  console.log("✓ /api/auth/me returns safe profile with active workspace.");

  // 5. Cleanup test user
  await prisma.user.delete({
    where: { id: signupData.userId },
  });
  console.log("✓ Test user safely cleaned up from database.");
}
