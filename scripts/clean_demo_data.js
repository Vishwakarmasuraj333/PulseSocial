const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDemoData() {
  console.log("Cleaning demo and Brownmonkey data from SQLite database...");

  // 1. Delete social accounts associated with brownmonkey or sample demo accounts
  const demoAccounts = await prisma.socialAccount.findMany({
    where: {
      OR: [
        { username: { contains: "brownmonkey" } },
        { username: { contains: "srjbittu" } },
        { displayName: { contains: "Brown Monkey" } },
        { displayName: { contains: "Brownmonkey" } },
        { displayName: { contains: "devloper" } },
        { providerAccountId: { startsWith: "fb_page_mock" } },
      ],
    },
    select: { id: true, displayName: true, username: true },
  });

  console.log(`Found ${demoAccounts.length} demo social accounts to remove:`, demoAccounts);

  for (const acc of demoAccounts) {
    // Delete related tokens, profiles, targets, analytics
    await prisma.socialToken.deleteMany({ where: { socialAccountId: acc.id } });
    await prisma.socialProfile.deleteMany({ where: { socialAccountId: acc.id } });
    await prisma.socialPostTarget.deleteMany({ where: { socialAccountId: acc.id } });
    await prisma.socialComment.deleteMany({ where: { socialAccountId: acc.id } });
    await prisma.socialMessage.deleteMany({ where: { socialAccountId: acc.id } });
    await prisma.socialAnalytics.deleteMany({ where: { socialAccountId: acc.id } });
    await prisma.socialAccount.delete({ where: { id: acc.id } });
  }

  // 2. Delete posts containing demo monkey / cartoon text
  const demoPosts = await prisma.socialPost.findMany({
    where: {
      OR: [
        { content: { contains: "Office Mein Pyaar" } },
        { content: { contains: "Bittu" } },
        { content: { contains: "Brown Monkey" } },
        { content: { contains: "brownmonkey" } },
      ],
    },
    select: { id: true, content: true },
  });

  console.log(`Found ${demoPosts.length} demo posts to remove:`, demoPosts);

  for (const post of demoPosts) {
    await prisma.postMedia.deleteMany({ where: { postId: post.id } });
    await prisma.socialPostTarget.deleteMany({ where: { postId: post.id } });
    await prisma.scheduledPost.deleteMany({ where: { postId: post.id } });
    await prisma.publishingAttempt.deleteMany({ where: { postId: post.id } });
    await prisma.socialPost.delete({ where: { id: post.id } });
  }

  // 3. Update any organizations named "Brownmonkey" or similar
  const demoOrgs = await prisma.organization.findMany({
    where: {
      OR: [
        { name: { contains: "Brownmonkey" } },
        { name: { contains: "Brown Monkey" } },
        { slug: { contains: "brownmonkey" } },
      ],
    },
  });

  for (const org of demoOrgs) {
    console.log(`Updating demo org: ${org.name}`);
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        name: "Pulse Media Global",
        slug: `pulse-media-${Date.now().toString(36)}`,
      },
    });
  }

  console.log("Database cleanup completed successfully!");
  await prisma.$disconnect();
}

cleanDemoData().catch((err) => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
