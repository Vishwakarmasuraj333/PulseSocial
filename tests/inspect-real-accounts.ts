import { prisma } from "../src/lib/prisma";
import { decryptToken } from "../src/lib/security/encryption";

async function inspectSocialAccounts() {
  console.log("==================================================================");
  console.log("   PHASE 4: REAL SOCIAL ACCOUNTS & CAPABILITIES AUDIT");
  console.log("==================================================================");

  const accounts = await prisma.socialAccount.findMany({
    include: {
      profile: true,
      token: true,
      postTargets: { take: 5 },
      actions: { take: 5 },
      snapshots: { take: 5 },
    },
  });

  console.log(`Found ${accounts.length} social account records in database:`);
  for (const acc of accounts) {
    console.log(`\n• Provider: ${acc.provider.toUpperCase()} | Account ID: ${acc.id}`);
    console.log(`  - Display Name: ${acc.displayName}`);
    console.log(`  - Username: ${acc.username || "(none)"}`);
    console.log(`  - Provider Account ID: ${acc.providerAccountId}`);
    console.log(`  - Account Type: ${acc.accountType || "N/A"}`);
    console.log(`  - Status: ${acc.status}`);
    console.log(`  - Scopes: ${acc.scopes}`);
    console.log(`  - Connected At: ${acc.connectedAt?.toISOString()}`);
    console.log(`  - Last Synced At: ${acc.lastSyncedAt?.toISOString() || "(never)"}`);

    if (acc.profile) {
      console.log(`  - Profile Metrics:`);
      console.log(`    * Followers: ${acc.profile.followersCount !== null ? acc.profile.followersCount : "null (honest unmeasured)"}`);
      console.log(`    * Following: ${acc.profile.followingCount !== null ? acc.profile.followingCount : "null (honest unmeasured)"}`);
      console.log(`    * Posts: ${acc.profile.postsCount !== null ? acc.profile.postsCount : "null (honest unmeasured)"}`);
    }

    if (acc.token) {
      console.log(`  - Token Vault:`);
      console.log(`    * Key Version: ${acc.token.keyVersion}`);
      console.log(`    * IV Present: ${!!acc.token.iv} (length: ${acc.token.iv?.length})`);
      console.log(`    * Tag Present: ${!!acc.token.tag} (length: ${acc.token.tag?.length})`);
      console.log(`    * Expires At: ${acc.token.expiresAt?.toISOString() || "(permanent/unknown)"}`);

      // Test safe authenticated decryption
      try {
        const decrypted = decryptToken(
          acc.token.encryptedAccessToken,
          acc.token.iv,
          acc.token.tag,
          acc.token.keyVersion
        );
        console.log(`    * Token Decryption: SUCCESS (Decrypted token length: ${decrypted.length} chars, prefix: ${decrypted.slice(0, 4)}...)`);
      } catch (err: any) {
        console.log(`    * Token Decryption: FAILED (${err.message})`);
      }
    } else {
      console.log(`  - Token: None stored`);
    }
  }

  // Also inspect provider capability matrix for all 9 platforms
  console.log("\n--- PROVIDER CAPABILITY AND IMPLEMENTATION MATRIX ---");
  const providers = [
    "facebook", "instagram", "linkedin", "x", "youtube", "tiktok", "pinterest", "google_business", "mastodon"
  ];
  for (const p of providers) {
    const isConnected = accounts.some(a => a.provider.toLowerCase() === p && a.status === "CONNECTED");
    console.log(`  • ${p.padEnd(16)}: ${isConnected ? "CONNECTED (Live in DB)" : "NOT CONNECTED (OAuth available)"}`);
  }
}

inspectSocialAccounts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
