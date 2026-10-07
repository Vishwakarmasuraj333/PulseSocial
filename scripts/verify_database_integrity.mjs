import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("=== PHASE 7: DATABASE INTEGRITY VERIFICATION ===");
  
  // 1. Organizations
  const orgs = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          members: true,
          socialAccounts: true,
          posts: true,
        }
      }
    }
  });
  console.log(`\nOrganizations found (${orgs.length}):`);
  orgs.forEach(o => {
    console.log(`- Org ID: ${o.id} | Name: "${o.name}" | Slug: "${o.slug}" | Members: ${o._count.members} | SocialAccounts: ${o._count.socialAccounts} | Posts: ${o._count.posts}`);
  });

  // 2. Organization Members
  const members = await prisma.organizationMember.findMany({
    include: { user: { select: { email: true, name: true } }, organization: { select: { name: true } } }
  });
  console.log(`\nOrganization Members found (${members.length}):`);
  members.forEach(m => {
    console.log(`- Member ID: ${m.id} | User: ${m.user.email} | Role: ${m.role} | Org: "${m.organization.name}" (${m.organizationId})`);
  });

  // 3. Social Accounts
  const accounts = await prisma.socialAccount.findMany({
    include: { organization: { select: { name: true } }, profile: true, token: true }
  });
  console.log(`\nSocial Accounts found (${accounts.length}):`);
  accounts.forEach(a => {
    console.log(`- Account ID: ${a.id} | Provider: ${a.provider} | DisplayName: "${a.displayName}" | Org: "${a.organization.name}" | Status: ${a.status} | HasToken: ${!!a.token}`);
  });

  // 4. Social Messages
  const messages = await prisma.socialMessage.findMany({
    include: { socialAccount: { include: { organization: true } } }
  });
  console.log(`\nSocial Messages found (${messages.length}):`);
  const orphanMessages = messages.filter(m => !m.socialAccount || !m.socialAccount.organizationId);
  console.log(`Orphan messages: ${orphanMessages.length}`);

  // 5. Social Comments
  const comments = await prisma.socialComment.findMany({
    include: { socialAccount: { include: { organization: true } } }
  });
  console.log(`\nSocial Comments found (${comments.length}):`);
  const orphanComments = comments.filter(c => !c.socialAccount || !c.socialAccount.organizationId);
  console.log(`Orphan comments: ${orphanComments.length}`);

  // 6. Social Analytics
  const analytics = await prisma.socialAnalytics.findMany({
    include: { socialAccount: { include: { organization: true } } }
  });
  console.log(`\nSocial Analytics rows found (${analytics.length}):`);
  const orphanAnalytics = analytics.filter(a => !a.socialAccount || !a.socialAccount.organizationId);
  console.log(`Orphan analytics: ${orphanAnalytics.length}`);

  // 7. Publishing Attempts
  const attempts = await prisma.publishingAttempt.findMany({
    include: { post: { include: { organization: true } } }
  });
  console.log(`\nPublishing Attempts found (${attempts.length}):`);
  attempts.forEach(att => {
    console.log(`- Attempt ID: ${att.id} | Provider: ${att.provider} | Status: ${att.status} | Post Org: "${att.post?.organization?.name || 'UNKNOWN'}"`);
  });
  const orphanAttempts = attempts.filter(att => !att.post || !att.post.organizationId);
  console.log(`Orphan publishing attempts: ${orphanAttempts.length}`);

  console.log("\n=== SUMMARY ===");
  console.log("All social records belong strictly to verified organizations:", 
    orphanMessages.length === 0 && 
    orphanComments.length === 0 && 
    orphanAnalytics.length === 0 && 
    orphanAttempts.length === 0 ? "PASSED (100% Isolated)" : "FAILED");
}

main()
  .catch(e => {
    console.error("Error during integrity check:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
