const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  const orgs = await prisma.organization.findMany();
  const accounts = await prisma.socialAccount.findMany();
  const posts = await prisma.socialPost.findMany({ select: { id: true, content: true, status: true, organizationId: true } });
  console.log('Users:', JSON.stringify(users, null, 2));
  console.log('Organizations:', JSON.stringify(orgs, null, 2));
  console.log('SocialAccounts:', JSON.stringify(accounts.map(a => ({ id: a.id, orgId: a.organizationId, provider: a.provider, name: a.displayName, username: a.username })), null, 2));
  console.log('Posts:', JSON.stringify(posts, null, 2));
  await prisma.$disconnect();
}

check().catch(console.error);
