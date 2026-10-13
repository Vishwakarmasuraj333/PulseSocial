import { prisma } from "../src/lib/prisma";
import fs from "fs";
import path from "path";

async function main() {
  console.log("==================================================================");
  console.log("       PULSESOCIAL: REMOVE ALL DEMO ACCOUNTS & DEMO DATA          ");
  console.log("==================================================================");

  // 1. Identify demo accounts (preserve real connected account '1290375347485246')
  const allAccounts = await prisma.socialAccount.findMany({
    include: {
      profile: true,
      token: true,
      postTargets: true,
      comments: true,
      messages: true,
      conversations: true,
      engagementSnapshots: true,
      syncJobs: true,
    },
  });

  const demoAccounts = allAccounts.filter(
    (a) => a.providerAccountId !== "1290375347485246"
  );
  const realAccounts = allAccounts.filter(
    (a) => a.providerAccountId === "1290375347485246"
  );

  console.log(`Total accounts found: ${allAccounts.length}`);
  console.log(`Real accounts to keep: ${realAccounts.length}`);
  console.log(`Demo accounts to delete: ${demoAccounts.length}`);

  // 2. Backup everything to backups/
  const backupsDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const backupFilePath = path.join(
    backupsDir,
    `all_demo_data_backup_${Date.now()}.json`
  );
  fs.writeFileSync(backupFilePath, JSON.stringify(demoAccounts, null, 2), "utf8");
  console.log(`✔ Full backup saved to: ${backupFilePath}`);

  const demoAccountIds = demoAccounts.map((a) => a.id);

  // 3. Delete dependent demo data
  console.log("Cleaning up dependent demo records...");

  // Delete demo comments
  const delComments = await prisma.socialComment.deleteMany({
    where: { socialAccountId: { in: demoAccountIds } },
  });
  console.log(`✔ Deleted ${delComments.count} demo comments.`);

  // Delete demo engagement snapshots
  const delSnapshots = await prisma.socialEngagementSnapshot.deleteMany({
    where: { socialAccountId: { in: demoAccountIds } },
  });
  console.log(`✔ Deleted ${delSnapshots.count} demo engagement snapshots.`);

  // Delete demo post targets
  const delTargets = await prisma.socialPostTarget.deleteMany({
    where: { socialAccountId: { in: demoAccountIds } },
  });
  console.log(`✔ Deleted ${delTargets.count} demo post targets.`);

  // Delete demo posts that have no targets or belonged only to demo accounts
  const remainingTargets = await prisma.socialPostTarget.findMany({
    select: { postId: true },
  });
  const activePostIds = new Set(remainingTargets.map((t) => t.postId));
  const delPosts = await prisma.socialPost.deleteMany({
    where: { id: { notIn: Array.from(activePostIds) } },
  });
  console.log(`✔ Deleted ${delPosts.count} orphaned demo posts.`);

  // Delete demo sync jobs
  const delSyncJobs = await prisma.syncJob.deleteMany({
    where: { socialAccountId: { in: demoAccountIds } },
  });
  console.log(`✔ Deleted ${delSyncJobs.count} demo sync jobs.`);

  // Delete demo tokens
  const delTokens = await prisma.socialToken.deleteMany({
    where: { socialAccountId: { in: demoAccountIds } },
  });
  console.log(`✔ Deleted ${delTokens.count} demo tokens.`);

  // Delete demo profiles
  const delProfiles = await prisma.socialProfile.deleteMany({
    where: { socialAccountId: { in: demoAccountIds } },
  });
  console.log(`✔ Deleted ${delProfiles.count} demo profiles.`);

  // Delete demo accounts themselves
  const delAccounts = await prisma.socialAccount.deleteMany({
    where: { id: { in: demoAccountIds } },
  });
  console.log(`✔ Deleted ${delAccounts.count} demo social accounts.`);

  console.log("\n==================================================================");
  console.log("✔ ALL DEMO ACCOUNTS AND DEMO DATA SUCCESSFULLY REMOVED!");
  console.log("==================================================================");
}

main()
  .catch((err) => {
    console.error("Cleanup error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
