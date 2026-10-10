import assert from "assert";
import { encryptToken, decryptToken } from "../../src/lib/security/encryption";

export async function runTokenVaultUnitTests() {
  console.log("\n--- [UNIT TEST SUITE 2: AES-256-GCM TOKEN VAULT] ---");

  const rawSecret = "eaae_instagram_live_access_token_super_secret_xyz123";

  // 1. Encryption
  const encryptedPayload = encryptToken(rawSecret);
  assert.ok(encryptedPayload.encrypted, "Encrypted payload must contain ciphertext hex");
  assert.strictEqual(encryptedPayload.iv.length, 32, "IV must be 16 bytes (32 hex characters)");
  assert.strictEqual(encryptedPayload.tag.length, 32, "Auth tag must be 16 bytes (32 hex characters)");
  assert.strictEqual(encryptedPayload.keyVersion, "v1", "Default key version must be v1");
  assert.notStrictEqual(encryptedPayload.encrypted, rawSecret, "Encrypted data must never equal plaintext");
  console.log("✓ AES-256-GCM encryption with 16-byte IV and tag verified.");

  // 2. Decryption
  const decrypted = decryptToken(
    encryptedPayload.encrypted,
    encryptedPayload.iv,
    encryptedPayload.tag,
    encryptedPayload.keyVersion
  );
  assert.strictEqual(decrypted, rawSecret, "Decrypted token must exactly match original plaintext");
  console.log("✓ Authenticated decryption verified.");

  // 3. Tampering Detection
  const tamperedCiphertext =
    encryptedPayload.encrypted.slice(0, -2) +
    (encryptedPayload.encrypted.slice(-2) === "00" ? "ff" : "00");

  let tamperCaught = false;
  try {
    decryptToken(tamperedCiphertext, encryptedPayload.iv, encryptedPayload.tag);
  } catch (err: unknown) {
    tamperCaught = true;
    assert.match(
      (err as Error).message,
      /Decryption error/,
      "Must throw explicit decryption error on corrupted or tampered ciphertext"
    );
  }
  assert.strictEqual(tamperCaught, true, "Tampered ciphertext must be rejected by auth tag");
  console.log("✓ Tamper resistance and authenticated tag validation verified.");

  // 4. Missing / Invalid Key Handling
  let wrongKeyCaught = false;
  try {
    decryptToken(encryptedPayload.encrypted, encryptedPayload.iv, encryptedPayload.tag, "v999_nonexistent_key");
  } catch {
    wrongKeyCaught = true;
  }
  assert.strictEqual(wrongKeyCaught, true, "Mismatching key version must fail decryption");
  console.log("✓ Key version isolation verified.");
}
