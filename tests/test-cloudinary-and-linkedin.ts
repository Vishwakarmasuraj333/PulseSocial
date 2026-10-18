import "dotenv/config";
import { uploadBufferToCloudinary, generateSignedUploadParams, verifyUploadSignature } from "../src/lib/storage/cloudinary";
import { prisma } from "../src/lib/prisma";
import { decryptToken } from "../src/lib/security/encryption";
import { SOCIAL_API_VERSIONS } from "../src/lib/social/api-versions";

async function runTests() {
  console.log("=== STARTING CLOUDINARY & LINKEDIN INTEGRATION TESTS ===");
  let passed = 0;
  let failed = 0;

  // Test 1: Cloudinary Buffer Upload
  try {
    const dummyImage = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    const result = await uploadBufferToCloudinary(dummyImage, {
      filename: "test_verification.gif",
      mimeType: "image/gif",
      folder: "pulsesocial/test_verification",
    });

    if (result.url && result.url.startsWith("https://res.cloudinary.com/")) {
      console.log("✅ Test 1 Passed: Cloudinary buffer upload succeeded:", result.url);
      passed++;
    } else {
      throw new Error(`Unexpected URL returned: ${result.url}`);
    }
  } catch (err: any) {
    console.error("❌ Test 1 Failed: Cloudinary upload failed:", err.message);
    failed++;
  }

  // Test 2: Signed Upload Signature Generation & Verification
  try {
    const signedParams = generateSignedUploadParams({
      folder: "pulsesocial/test_verification",
    });

    if (signedParams.signature && signedParams.apiKey && signedParams.cloudName) {
      const isValid = verifyUploadSignature(
        { folder: signedParams.folder, timestamp: signedParams.timestamp },
        signedParams.signature
      );
      if (isValid) {
        console.log("✅ Test 2 Passed: Signed upload signature generated & verified successfully.");
        passed++;
      } else {
        throw new Error("Signature verification failed.");
      }
    } else {
      throw new Error("Missing signature fields.");
    }
  } catch (err: any) {
    console.error("❌ Test 2 Failed: Signature verification failed:", err.message);
    failed++;
  }

  // Test 3: LinkedIn Active Version Check
  try {
    if (SOCIAL_API_VERSIONS.LINKEDIN_REST === "202601") {
      console.log("✅ Test 3 Passed: LinkedIn active API version declared correctly:", SOCIAL_API_VERSIONS.LINKEDIN_REST);
      passed++;
    } else {
      throw new Error(`Invalid LinkedIn API version: ${SOCIAL_API_VERSIONS.LINKEDIN_REST}`);
    }
  } catch (err: any) {
    console.error("❌ Test 3 Failed:", err.message);
    failed++;
  }

  // Test 4: Live Connected LinkedIn Account Check
  try {
    const acc = await prisma.socialAccount.findFirst({
      where: { provider: "linkedin" },
      include: { token: true },
    });

    if (acc && acc.token) {
      const token = decryptToken(acc.token.encryptedAccessToken, acc.token.iv, acc.token.tag);
      const res = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const userinfo = await res.json();
        console.log("✅ Test 4 Passed: Live LinkedIn account verified:", userinfo.name, `(${acc.username})`);
        passed++;
      } else {
        throw new Error(`LinkedIn userinfo returned HTTP ${res.status}`);
      }
    } else {
      throw new Error("No connected LinkedIn account found.");
    }
  } catch (err: any) {
    console.error("❌ Test 4 Failed:", err.message);
    failed++;
  }

  console.log(`\n=== TEST SUMMARY: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
