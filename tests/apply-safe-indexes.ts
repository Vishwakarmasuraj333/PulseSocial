import { prisma } from "../src/lib/prisma";

const SAFE_INDEX_DDL = [
  // SocialPost
  `CREATE INDEX IF NOT EXISTS "SocialPost_organizationId_idx" ON "SocialPost"("organizationId");`,
  `CREATE INDEX IF NOT EXISTS "SocialPost_organizationId_status_idx" ON "SocialPost"("organizationId", "status");`,
  `CREATE INDEX IF NOT EXISTS "SocialPost_creatorId_idx" ON "SocialPost"("creatorId");`,
  `CREATE INDEX IF NOT EXISTS "SocialPost_scheduledFor_idx" ON "SocialPost"("scheduledFor");`,
  `CREATE INDEX IF NOT EXISTS "SocialPost_createdAt_idx" ON "SocialPost"("createdAt");`,

  // SocialPostTarget
  `CREATE INDEX IF NOT EXISTS "SocialPostTarget_postId_idx" ON "SocialPostTarget"("postId");`,
  `CREATE INDEX IF NOT EXISTS "SocialPostTarget_socialAccountId_idx" ON "SocialPostTarget"("socialAccountId");`,
  `CREATE INDEX IF NOT EXISTS "SocialPostTarget_status_idx" ON "SocialPostTarget"("status");`,

  // PostMedia
  `CREATE INDEX IF NOT EXISTS "PostMedia_postId_idx" ON "PostMedia"("postId");`,

  // ScheduledPost
  `CREATE INDEX IF NOT EXISTS "ScheduledPost_runAt_isLocked_idx" ON "ScheduledPost"("runAt", "isLocked");`,
  `CREATE INDEX IF NOT EXISTS "ScheduledPost_runAt_idx" ON "ScheduledPost"("runAt");`,

  // Draft
  `CREATE INDEX IF NOT EXISTS "Draft_organizationId_idx" ON "Draft"("organizationId");`,
  `CREATE INDEX IF NOT EXISTS "Draft_updatedAt_idx" ON "Draft"("updatedAt");`,

  // PublishingAttempt
  `CREATE INDEX IF NOT EXISTS "PublishingAttempt_postId_idx" ON "PublishingAttempt"("postId");`,
  `CREATE INDEX IF NOT EXISTS "PublishingAttempt_attemptedAt_idx" ON "PublishingAttempt"("attemptedAt");`,

  // SocialNotification
  `CREATE INDEX IF NOT EXISTS "SocialNotification_organizationId_isRead_idx" ON "SocialNotification"("organizationId", "isRead");`,
  `CREATE INDEX IF NOT EXISTS "SocialNotification_organizationId_idx" ON "SocialNotification"("organizationId");`,
  `CREATE INDEX IF NOT EXISTS "SocialNotification_createdAt_idx" ON "SocialNotification"("createdAt");`,

  // SocialAnalytics
  `CREATE INDEX IF NOT EXISTS "SocialAnalytics_metricDate_idx" ON "SocialAnalytics"("metricDate");`,

  // TeamInvitation
  `CREATE INDEX IF NOT EXISTS "TeamInvitation_organizationId_idx" ON "TeamInvitation"("organizationId");`,
  `CREATE INDEX IF NOT EXISTS "TeamInvitation_email_idx" ON "TeamInvitation"("email");`,

  // AuditLog
  `CREATE INDEX IF NOT EXISTS "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");`,

  // MediaAsset
  `CREATE INDEX IF NOT EXISTS "MediaAsset_organizationId_idx" ON "MediaAsset"("organizationId");`,
  `CREATE INDEX IF NOT EXISTS "MediaAsset_organizationId_folder_idx" ON "MediaAsset"("organizationId", "folder");`,

  // BlogPost
  `CREATE INDEX IF NOT EXISTS "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");`,
  `CREATE INDEX IF NOT EXISTS "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");`,

  // Feedback
  `CREATE INDEX IF NOT EXISTS "Feedback_organizationId_idx" ON "Feedback"("organizationId");`,
  `CREATE INDEX IF NOT EXISTS "Feedback_userId_idx" ON "Feedback"("userId");`,
  `CREATE INDEX IF NOT EXISTS "Feedback_createdAt_idx" ON "Feedback"("createdAt");`,

  // ContactRequest
  `CREATE INDEX IF NOT EXISTS "ContactRequest_status_idx" ON "ContactRequest"("status");`,
  `CREATE INDEX IF NOT EXISTS "ContactRequest_createdAt_idx" ON "ContactRequest"("createdAt");`,

  // OrganizationMember
  `CREATE INDEX IF NOT EXISTS "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");`,
];

async function main() {
  console.log("Applying safe, non-destructive indexes (CREATE INDEX IF NOT EXISTS)...");
  let applied = 0;
  for (const ddl of SAFE_INDEX_DDL) {
    try {
      await prisma.$executeRawUnsafe(ddl);
      applied++;
      console.log(`  ✔ Applied: ${ddl}`);
    } catch (err: any) {
      console.error(`  ✖ Failed: ${ddl}`, err.message);
    }
  }
  console.log(`\nSuccessfully verified and applied ${applied}/${SAFE_INDEX_DDL.length} indexes in PostgreSQL.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
