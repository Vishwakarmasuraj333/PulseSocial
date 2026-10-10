import assert from "assert";
import crypto from "crypto";
import { generateSecureOTP, hashOTP } from "../../src/lib/email/otp";
import { hashPassword, verifyPassword } from "../../src/lib/auth/password";

export async function runOtpAndAuthUnitTests() {
  console.log("\n--- [UNIT TEST SUITE 1: OTP & AUTHENTICATION] ---");

  // 1. OTP Format & Randomness
  const otp1 = generateSecureOTP();
  const otp2 = generateSecureOTP();
  assert.strictEqual(otp1.length, 6, "OTP must be exactly 6 digits");
  assert.strictEqual(otp2.length, 6, "OTP must be exactly 6 digits");
  assert.match(otp1, /^\d{6}$/, "OTP must consist of 6 numeric characters");
  assert.match(otp2, /^\d{6}$/, "OTP must consist of 6 numeric characters");
  assert.ok(parseInt(otp1, 10) >= 100000 && parseInt(otp1, 10) <= 999999, "OTP must be between 100000 and 999999");
  console.log("✓ OTP generation format and numeric bounds verified.");

  // 2. Cryptographic Hashing
  const hash1 = hashOTP(otp1);
  const hash2 = hashOTP(otp1);
  const hash3 = hashOTP(otp2);
  assert.strictEqual(hash1, hash2, "Hashing same OTP must produce identical hash");
  assert.notStrictEqual(hash1, hash3, "Different OTPs must produce different hashes");
  assert.strictEqual(hash1.length, 64, "SHA-256 hash must be 64 hex characters");
  console.log("✓ OTP SHA-256 deterministic hashing verified.");

  // 3. Password Hashing (Bcrypt)
  const password = "SuperSecurePassword123!@#";
  const hashedPassword = await hashPassword(password);
  assert.ok(hashedPassword.startsWith("$2"), "Password hash must be a valid bcrypt hash");
  assert.notStrictEqual(password, hashedPassword, "Password must not equal plaintext hash");

  const isMatchValid = await verifyPassword(password, hashedPassword);
  assert.strictEqual(isMatchValid, true, "Valid password must verify successfully");

  const isWrongRejected = await verifyPassword("WrongPassword999!", hashedPassword);
  assert.strictEqual(isWrongRejected, false, "Invalid password must be rejected");
  console.log("✓ Password bcrypt hashing, salts, and verification verified.");
}
