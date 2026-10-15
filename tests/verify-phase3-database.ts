import { prisma } from "../src/lib/prisma";

async function verifyDatabase() {
  console.log("==================================================================");
  console.log("   PHASE 3: DATABASE & POSTGRESQL INSPECTION REPORT");
  console.log("==================================================================");

  // 1. Check database connection and provider
  const versionResult: Array<{ version: string }> = await prisma.$queryRaw`SELECT version();`;
  console.log(`\n[1] Database Engine: ${versionResult[0].version}`);

  // 2. Count existing tables in public schema
  const tables: Array<{ table_name: string }> = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log(`\n[2] Existing Tables in 'public' schema (${tables.length} tables found):`);
  for (const t of tables) {
    const countResult: Array<{ count: bigint }> = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM "${t.table_name}";`
    );
    console.log(`   • ${t.table_name}: ${countResult[0].count} records`);
  }

  // 3. Inspect indexes for SocialPost, SocialAccount, ScheduledPost
  console.log(`\n[3] Indexes on 'SocialPost':`);
  const postIndexes: Array<{ indexname: string; indexdef: string }> = await prisma.$queryRaw`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'SocialPost';
  `;
  for (const idx of postIndexes) {
    console.log(`   - ${idx.indexname}: ${idx.indexdef}`);
  }

  console.log(`\n[4] Indexes on 'ScheduledPost':`);
  const schedIndexes: Array<{ indexname: string; indexdef: string }> = await prisma.$queryRaw`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'ScheduledPost';
  `;
  for (const idx of schedIndexes) {
    console.log(`   - ${idx.indexname}: ${idx.indexdef}`);
  }

  console.log(`\n[5] Indexes on 'SocialAccount':`);
  const accountIndexes: Array<{ indexname: string; indexdef: string }> = await prisma.$queryRaw`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'SocialAccount';
  `;
  for (const idx of accountIndexes) {
    console.log(`   - ${idx.indexname}: ${idx.indexdef}`);
  }

  console.log("\n==================================================================");
  console.log("   DATABASE VERIFICATION COMPLETE (NON-DESTRUCTIVE)");
  console.log("==================================================================");
}

verifyDatabase()
  .catch((e) => {
    console.error("Database inspection failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
