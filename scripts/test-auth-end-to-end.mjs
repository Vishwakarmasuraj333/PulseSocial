import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function findOtpCode(targetHash) {
  for (let i = 100000; i <= 999999; i++) {
    const s = i.toString();
    const h = crypto.createHash("sha256").update(s).digest("hex");
    if (h === targetHash) return s;
  }
  return null;
}

async function runTests() {
  console.log("==================================================");
  console.log("STARTING FULL AUTH & OTP END-TO-END VERIFICATION");
  console.log("==================================================");

  const testEmail = `test_user_${Date.now()}@example.com`;
  const testPassword = "SecurePassword123!";
  const testName = "Suraj QA Tester";

  // Test 1: Real Signup
  console.log("\n[TEST 1] Testing /api/auth/signup...");
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
      terms: true,
    }),
  });

  const signupData = await signupRes.json();
  console.log(`Signup Status: ${signupRes.status}`);
  if (signupRes.status !== 201) {
    throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
  }
  console.log("✓ Signup Successful! User ID:", signupData.userId);

  // Test 2: Duplicate Email Rejection
  console.log("\n[TEST 2] Testing duplicate email rejection...");
  const dupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
      terms: true,
    }),
  });
  console.log(`Duplicate Signup Status: ${dupRes.status}`);
  if (dupRes.status !== 409) {
    throw new Error(`Expected 409 Conflict for duplicate email, got ${dupRes.status}`);
  }
  console.log("✓ Duplicate email correctly rejected with 409 Conflict!");

  // Test 3: Invalid OTP Rejection
  console.log("\n[TEST 3] Testing OTP verification with invalid code...");
  const invalidOtpRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: signupData.userId,
      code: "000000",
    }),
  });
  console.log(`Invalid OTP Status: ${invalidOtpRes.status}`);
  if (invalidOtpRes.status !== 400) {
    throw new Error(`Expected 400 for bad OTP, got ${invalidOtpRes.status}`);
  }
  console.log("✓ Bad OTP correctly rejected with 400 Bad Request!");

  // Test 4: Real OTP Verification
  console.log("\n[TEST 4] Retrieving generated OTP hash from DB and resolving code...");
  const otpRecord = await prisma.emailVerificationOTP.findFirst({
    where: { userId: signupData.userId },
    orderBy: { createdAt: "desc" },
  });
  if (!otpRecord) {
    throw new Error("No OTP record found in database!");
  }
  
  const realCode = findOtpCode(otpRecord.codeHash);
  console.log(`Resolved real 6-digit OTP code: ${realCode}`);
  if (!realCode) {
    throw new Error("Failed to resolve 6-digit OTP code");
  }

  console.log("Sending real code to /api/auth/verify-otp...");
  const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: signupData.userId,
      code: realCode,
    }),
  });
  const verifyData = await verifyRes.json();
  const verifyCookie = verifyRes.headers.get("set-cookie");
  console.log(`Verify OTP Status: ${verifyRes.status}`);
  console.log("Verify OTP Response:", verifyData);
  console.log("Session Cookie created on verification:", !!verifyCookie);
  if (verifyRes.status !== 200 || !verifyData.success) {
    throw new Error(`OTP verification failed: ${JSON.stringify(verifyData)}`);
  }
  console.log("✓ Real OTP successfully verified! User is now active and emailVerified: true!");

  // Test 5: Wrong Password Rejection
  console.log("\n[TEST 5] Testing login with wrong password...");
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "WrongPassword999!",
    }),
  });
  console.log(`Wrong password status: ${badLoginRes.status}`);
  if (badLoginRes.status !== 401) {
    throw new Error(`Expected 401 for wrong password, got ${badLoginRes.status}`);
  }
  console.log("✓ Wrong password correctly rejected with 401 Unauthorized!");

  // Test 6: Google Sign-In with Suraj Vishwakarma
  // Test 6: Real Password Login with Suraj Vishwakarma
  console.log("\n[TEST 6] Testing /api/auth/login (itsurya9930@gmail.com)...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "itsurya9930@gmail.com",
      password: "Password123!",
      rememberMe: true,
    }),
  });
  const loginData = await loginRes.json();
  const sessionCookie = loginRes.headers.get("set-cookie");
  console.log(`Login status: ${loginRes.status}`);
  console.log("Login response:", loginData);
  console.log("Session cookie generated:", !!sessionCookie);
  if (loginRes.status !== 200 || !loginData.success) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  console.log("✓ Login works seamlessly and issues auth session cookie!");

  // Test 7: Verify Authenticated Session with /api/auth/me
  console.log("\n[TEST 7] Testing session verification via /api/auth/me...");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      Cookie: sessionCookie || "",
    },
  });
  const meData = await meRes.json();
  console.log(`Me status: ${meRes.status}`);
  console.log("Me profile data:", meData);
  if (meRes.status !== 200 || !meData.user) {
    throw new Error(`Failed to fetch authenticated user profile: ${JSON.stringify(meData)}`);
  }
  console.log(`✓ Authenticated as: ${meData.user.name} (${meData.user.email})!`);

  // Test 8: Check /api/social/google/connect error handling (no 500 crash)
  console.log("\n[TEST 8] Testing /api/social/google/connect alias handling...");
  const socialConnectRes = await fetch(`${BASE_URL}/api/social/google/connect`, {
    redirect: "manual",
    headers: {
      Cookie: sessionCookie || "",
    },
  });
  console.log(`Social google connect status: ${socialConnectRes.status}`);
  if (socialConnectRes.status === 500) {
    throw new Error("Expected non-500 status from /api/social/google/connect");
  }
  console.log("✓ /api/social/google/connect handled without 500 server crash!");

  console.log("\n==================================================");
  console.log("ALL 8 VERIFICATION TESTS PASSED WITH 100% SUCCESS!");
  console.log("==================================================");
}

runTests()
  .catch((err) => {
    console.error("Test Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
