const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating real users to Suraj Vishwakarma...");

  await prisma.user.updateMany({
    where: {
      email: {
        in: ['itsurya9930@gmail.com', 'itxsurajofficial@gmail.com', 'itxsurajoffical@gmail.com']
      }
    },
    data: {
      name: "Suraj Vishwakarma",
      emailVerified: true
    }
  });

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['itsurya9930@gmail.com', 'itxsurajofficial@gmail.com']
      }
    },
    include: {
      memberships: {
        include: { organization: true }
      }
    }
  });

  console.log("Updated users:", JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
