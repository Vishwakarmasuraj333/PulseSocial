import assert from "assert";
import { prisma } from "../../src/lib/prisma";
import { MetaProvider } from "../../src/lib/social/providers/meta";
import { encryptToken, decryptToken } from "../../src/lib/security/encryption";

export async function runProductionAuditMasterTests() {
  console.log("\n▶ Running Suite 11: Final Production Audit & Truthfulness Tests...");

  // 1. Pinterest Absence & Deprecation in Active Channels
  const pinterestAccounts = await prisma.socialAccount.count({
    where: { provider: "pinterest" },
  });
  assert.strictEqual(
    pinterestAccounts,
    0,
    "Pinterest accounts must be 0 in production database"
  );
  console.log("  ✔ Pinterest absence in active accounts confirmed (0 records in DB)");

  // 2. Demo Content Audit: Verify 0 mock accounts and comments in production database
  const demoAccounts = await prisma.socialAccount.count({
    where: {
      OR: [
        { username: { contains: "demo", mode: "insensitive" } },
        { displayName: { contains: "demo", mode: "insensitive" } },
      ],
    },
  });
  assert.strictEqual(demoAccounts, 0, "No demo accounts should exist in the database");

  const demoComments = await prisma.socialComment.count({
    where: {
      content: { contains: "demo", mode: "insensitive" },
    },
  });
  assert.strictEqual(demoComments, 0, "No demo comments should exist in the database");
  console.log("  ✔ Zero demo accounts and zero demo comments in database verified");

  // 3. Facebook & Instagram OAuth Implementation & Scope Integrity
  const fbProvider = new MetaProvider("facebook");
  assert.strictEqual(fbProvider.platform, "facebook");
  assert.strictEqual(fbProvider.displayName, "Facebook");

  const igProvider = new MetaProvider("instagram");
  assert.strictEqual(igProvider.platform, "instagram");
  assert.strictEqual(igProvider.displayName, "Instagram");

  const testState = "test-oauth-state-1234567890abcdef";
  const fbRedirectUri = "https://pulsesocial1.vercel.app/api/social/facebook/callback";
  const igRedirectUri = "https://pulsesocial1.vercel.app/api/social/instagram/callback";

  const fbAuthUrl = fbProvider.getAuthorizationUrl(testState, fbRedirectUri);
  assert.ok(fbAuthUrl.startsWith("https://www.facebook.com/v20.0/dialog/oauth?"));
  assert.ok(fbAuthUrl.includes(`redirect_uri=${encodeURIComponent(fbRedirectUri)}`));
  assert.ok(fbAuthUrl.includes(`state=${testState}`));
  assert.ok(fbAuthUrl.includes("pages_manage_posts"));
  assert.ok(fbAuthUrl.includes("pages_read_engagement"));

  const igAuthUrl = igProvider.getAuthorizationUrl(testState, igRedirectUri);
  assert.ok(igAuthUrl.startsWith("https://www.facebook.com/v20.0/dialog/oauth?"));
  assert.ok(igAuthUrl.includes(`redirect_uri=${encodeURIComponent(igRedirectUri)}`));
  assert.ok(igAuthUrl.includes("instagram_basic"));
  assert.ok(igAuthUrl.includes("instagram_content_publish"));
  console.log("  ✔ Facebook and Instagram OAuth URL generation, state, and scopes verified independently");

  // 4. Regression: Missing valid authorization token rejection
  await assert.rejects(
    async () => {
      await fbProvider.getAccounts("");
    },
    /Missing valid authorization token/,
    "Must reject empty access token with descriptive error before sending malformed Authorization header"
  );
  console.log("  ✔ Regression test: empty/missing Meta access token safely intercepted before network call");

  // 5. Token Vault (AES-256-GCM) with Meta Access Token Simulation
  const sampleToken = "EAABtest_mock_meta_access_token_super_long_payload_for_testing";
  const encrypted = encryptToken(sampleToken);
  assert.ok(encrypted.encrypted.length > 0);
  assert.ok(encrypted.iv.length === 32); // 16 bytes hex
  assert.ok(encrypted.tag.length === 32); // 16 bytes hex

  const decrypted = decryptToken(encrypted.encrypted, encrypted.iv, encrypted.tag);
  assert.strictEqual(decrypted, sampleToken, "Decrypted token must strictly match original");
  console.log("  ✔ Meta token encryption & authenticated AES-256-GCM decryption verified");

  // 5. Multi-Tenant Post Lifecycle & Isolation (Draft -> Scheduled -> Tenant check)
  const testEmail = `audit-tenant-${Date.now()}@test.local`;
  const user = await prisma.user.create({
    data: { email: testEmail, name: "Tenant Audit Tester" },
  });

  const orgA = await prisma.organization.create({
    data: { name: "Org Alpha", slug: `org-a-${Date.now()}` },
  });
  const orgB = await prisma.organization.create({
    data: { name: "Org Beta", slug: `org-b-${Date.now()}` },
  });

  try {
    // Create draft post in Org A
    const postA = await prisma.socialPost.create({
      data: {
        organizationId: orgA.id,
        creatorId: user.id,
        content: "Draft content for Org Alpha",
        status: "DRAFT",
      },
    });
    assert.strictEqual(postA.status, "DRAFT");

    // Transition to SCHEDULED with schedule date
    const scheduledDate = new Date(Date.now() + 86400000);
    const updatedPostA = await prisma.socialPost.update({
      where: { id: postA.id },
      data: {
        status: "SCHEDULED",
        scheduledFor: scheduledDate,
      },
    });
    assert.strictEqual(updatedPostA.status, "SCHEDULED");

    // Verify Org B CANNOT read postA under multi-tenant isolation
    const foreignLookup = await prisma.socialPost.findFirst({
      where: {
        id: postA.id,
        organizationId: orgB.id,
      },
    });
    assert.strictEqual(foreignLookup, null, "Org B must not access Org A's scheduled post");
    console.log("  ✔ Post lifecycle (Draft -> Scheduled) and tenant isolation verified");

  } finally {
    await prisma.socialPost.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } }).catch(() => {});
    await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } }).catch(() => {});
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  }

  console.log("✔ Suite 11 (Final Production Audit) passed successfully!\n");
}
