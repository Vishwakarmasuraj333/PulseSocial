import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function findOtp(hash) {
  for (let i = 100000; i <= 999999; i++) {
    const s = i.toString();
    if (crypto.createHash("sha256").update(s).digest("hex") === hash) {
      return s;
    }
  }
  return null;
}

async function main() {
  const otps = await prisma.emailVerificationOTP.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  for (const o of otps) {
    const user = await prisma.user.findUnique({ where: { id: o.userId } });
    const code = findOtp(o.codeHash);
    console.log(`User: ${user?.email} (${user?.id}) -> OTP Code: ${code}, Attempts: ${o.attempts}, Expires: ${o.expiresAt}`);
  }
}

main().finally(() => prisma.$disconnect());
