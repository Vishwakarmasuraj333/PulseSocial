import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      createdAt: true,
      memberships: {
        select: {
          role: true,
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  console.log("Current Users in DB:", JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
