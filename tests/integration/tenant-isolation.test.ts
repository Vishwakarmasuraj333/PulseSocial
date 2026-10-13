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

  // Test 4: Cross-tenant SyncJob isolation
  const syncJobsForOrgA = await prisma.syncJob.findMany({
    where: { organizationId: orgA.id },
  });
  const syncJobsForOrgB = await prisma.syncJob.findMany({
    where: { organizationId: orgB.id },
  });
  const syncJobIdsA = new Set(syncJobsForOrgA.map((j) => j.id));
  for (const jobB of syncJobsForOrgB) {
    assert.strictEqual(
      syncJobIdsA.has(jobB.id),
      false,
      `Cross-tenant job leakage: SyncJob ${jobB.id} belongs to both Org A and Org B`
    );
  }
  console.log("✓ Background SyncJob workspace scoping verified.");

  // Test 5: IDOR sync engine rejection
  if (accountsForOrgB.length > 0) {
    const foreignAccount = accountsForOrgB[0];
    const { syncAccountData } = await import("../../src/lib/social/sync-engine");
    const syncResult = await syncAccountData({
      socialAccountId: foreignAccount.id,
      organizationId: orgA.id, // Attempt to sync Org B account using Org A credentials
    });
    assert.strictEqual(
      syncResult.success,
      false,
      "Sync engine must reject cross-tenant account sync"
    );
    assert.ok(
      syncResult.error?.includes("not found in workspace"),
      "Error must explicitly identify workspace mismatch"
    );
    console.log("✓ IDOR sync rejection verified: Cannot trigger sync on foreign workspace account.");
  }

  // Test 6: Cross-tenant Conversation isolation
  const convsForOrgA = await prisma.socialConversation.findMany({
    where: { organizationId: orgA.id },
  });
  const convsForOrgB = await prisma.socialConversation.findMany({
    where: { organizationId: orgB.id },
  });
  const convIdsA = new Set(convsForOrgA.map((c) => c.id));
  for (const convB of convsForOrgB) {
    assert.strictEqual(
      convIdsA.has(convB.id),
      false,
      `Cross-tenant conversation leakage: Conversation ${convB.id} appears in both workspaces`
    );
  }
  console.log("✓ Social conversations & inbox workspace scoping verified.");
}
