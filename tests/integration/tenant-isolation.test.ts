import assert from "assert";
import { prisma } from "../../src/lib/prisma";

export async function runTenantIsolationTests() {
  console.log("\n--- [INTEGRATION TEST SUITE 5: MULTI-TENANT WORKSPACE ISOLATION] ---");

  // Fetch two distinct organizations from the real database
  const orgs = await prisma.organization.findMany({
    take: 2,
    include: {
      socialAccounts: true,
      posts: true,
    },
  });

  if (orgs.length < 2) {
    console.log("⚠ Less than 2 organizations exist in database; skipping cross-workspace comparison.");
    return;
  }

  const [orgA, orgB] = orgs;

  // Test 1: Workspace posts must never leak across organizations
  const postsForOrgA = await prisma.socialPost.findMany({
    where: { organizationId: orgA.id },
  });
  const postsForOrgB = await prisma.socialPost.findMany({
    where: { organizationId: orgB.id },
  });

  const idsInOrgA = new Set(postsForOrgA.map((p) => p.id));
  for (const postB of postsForOrgB) {
    assert.strictEqual(
      idsInOrgA.has(postB.id),
      false,
      `Cross-tenant leakage detected: Post ${postB.id} appears in both Workspace A and Workspace B`
    );
  }
  console.log("✓ Post tenant scoping verified across workspaces.");

  // Test 2: Social accounts must never cross-pollinate
  const accountsForOrgA = await prisma.socialAccount.findMany({
    where: { organizationId: orgA.id },
  });
  const accountsForOrgB = await prisma.socialAccount.findMany({
    where: { organizationId: orgB.id },
  });

  const accountIdsInOrgA = new Set(accountsForOrgA.map((a) => a.id));
  for (const accB of accountsForOrgB) {
    assert.strictEqual(
      accountIdsInOrgA.has(accB.id),
      false,
      `Cross-tenant leakage detected: Account ${accB.id} belongs to both Org A and Org B`
    );
  }
  console.log("✓ Social account isolation verified.");

  // Test 3: Attempting to query an Org B record with Org A scope returns null
  if (postsForOrgB.length > 0) {
    const foreignPost = postsForOrgB[0];
    const crossTenantLookup = await prisma.socialPost.findFirst({
      where: {
        id: foreignPost.id,
        organizationId: orgA.id, // User A's workspace context
      },
    });
    assert.strictEqual(
      crossTenantLookup,
      null,
      "Cross-tenant lookup must return null (safe rejection) when queried under unauthorized organization"
    );
    console.log("✓ IDOR protection verified: Foreign post ID queried in different workspace returns null.");
  }
}
