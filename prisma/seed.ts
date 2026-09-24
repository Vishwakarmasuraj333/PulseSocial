import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PulseSocial production foundation...");

  // 1. Ensure Admin User
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@pulsesocial.io" },
    update: {
      name: "Pulse Admin",
      emailVerified: true,
      status: "ACTIVE",
    },
    create: {
      email: "admin@pulsesocial.io",
      name: "Pulse Admin",
      passwordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
      avatarUrl: "/icons/pulse-logo.svg",
    },
  });

  // 2. Ensure Primary Organization
  const org = await prisma.organization.upsert({
    where: { slug: "pulse-media-global" },
    update: {
      name: "Pulse Media Global",
    },
    create: {
      name: "Pulse Media Global",
      slug: "pulse-media-global",
      timezone: "UTC",
    },
  });

  // 3. Ensure Organization Member
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    update: {
      role: "OWNER",
      channelsAccess: "ALL",
      isApprover: true,
    },
    create: {
      organizationId: org.id,
      userId: user.id,
      role: "OWNER",
      channelsAccess: "ALL",
      isApprover: true,
    },
  });

  console.log("Database seeded successfully with authentic production user and organization.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
