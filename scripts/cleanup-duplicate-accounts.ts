import { prisma } from "../src/lib/prisma";
import fs from "fs";
import path from "path";

/**
 * Migration & Cleanup Script: Deduplicate Facebook Page '1290375347485246'
 *
 * Safety Rules:
 * 1. Default mode is DRY-RUN. Zero mutations are performed without --confirm-delete flag.
 * 2. Creates a full JSON snapshot backup in `backups/` before deleting any record.
 * 3. Preserves the primary account in the intended primary workspace:
 *    Organization: cmus5m58j0001512oh5v7ywtm ("Pulse Media Global")
 */
async function main() {
  const isConfirm = process.argv.includes("--confirm-delete");
  const targetProviderAccountId = "1290375347485246";
  const primaryOrgId = "cmus5m58j0001512oh5v7ywtm"; // Pulse Media Global

  console.log("==================================================================");
  console.log("   PULSESOCIAL SAFE DUPLICATE ACCOUNT MIGRATION & BACKUP TOOL    ");
  console.log("==================================================================");
  console.log(`Target Provider Account ID: ${targetProviderAccountId}`);
  console.log(`Primary Retained Workspace: ${primaryOrgId} (Pulse Media Global)`);
  console.log(`Execution Mode: ${isConfirm ? "LIVE MIGRATION (--confirm-delete)" : "DRY-RUN (Read-only Preview)"}`);
  console.log("------------------------------------------------------------------");

  const duplicates = await prisma.socialAccount.findMany({
    where: { providerAccountId: targetProviderAccountId },
    include: {
      profile: true,
      token: true,
      organization: { select: { id: true, name: true, slug: true } },
    },
  });

  console.log(`Found ${duplicates.length} instances of account '${targetProviderAccountId}':\n`);

  duplicates.forEach((acc, i) => {
    const isPrimary = acc.organizationId === primaryOrgId;
    console.log(`[${i + 1}] Account ID: ${acc.id}`);
    console.log(`    Workspace:  ${acc.organization.name} (${acc.organizationId})`);
    console.log(`    Action:     ${isPrimary ? ">>> KEEP (Primary Workspace) <<<" : ">>> CANDIDATE FOR REMOVAL <<<"}`);
    console.log(`    Created At: ${acc.createdAt.toISOString()}`);
    console.log(`    Tokens:     ${acc.token ? "Has Encrypted Token" : "None"}`);
    console.log(`    Profile:    ${acc.profile ? "Has Profile" : "None"}\n`);
  });

  const toRemove = duplicates.filter((d) => d.organizationId !== primaryOrgId);

  if (toRemove.length === 0) {
    console.log("No duplicate instances found to clean up.");
    return;
  }

  // Backup step
  const backupsDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const backupFilePath = path.join(
    backupsDir,
    `duplicate_accounts_backup_${Date.now()}.json`
  );

  fs.writeFileSync(backupFilePath, JSON.stringify(duplicates, null, 2), "utf8");
  console.log(`✔ Safe backup created at: ${backupFilePath}`);

  if (!isConfirm) {
    console.log("\n[DRY RUN COMPLETE] Zero database changes were made.");
    console.log("To execute deletion of the 3 duplicate accounts, run:");
    console.log("  npx tsx scripts/cleanup-duplicate-accounts.ts --confirm-delete\n");
    return;
  }

  console.log(`\nExecuting removal of ${toRemove.length} duplicate instances...`);
  for (const item of toRemove) {
    await prisma.socialAccount.delete({
      where: { id: item.id },
    });
    console.log(`✔ Removed duplicate SocialAccount ${item.id} from org ${item.organizationId}`);
  }

  console.log("\n✔ Cleanup migration completed successfully. Primary account preserved in Pulse Media Global.");
}

main()
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
