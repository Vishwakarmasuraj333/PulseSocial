import { PrismaClient } from "@prisma/client";

// Ensure process.env.DATABASE_URL has a safe fallback to prevent fatal schema validation crashes
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.DIRECT_URL ||
    "postgresql://postgres:postgres@localhost:5432/pulsesocial?schema=public";
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.DEBUG_PRISMA === "true" ? ["query", "error", "warn"] : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
