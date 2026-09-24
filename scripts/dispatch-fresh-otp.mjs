import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateSecureOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "itxsurajofficial@gmail.com" },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  const otp = generateSecureOTP();
  const codeHash = hashOTP(otp);
  // 5 minutes expiry
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.emailVerificationOTP.deleteMany({
    where: { userId: user.id },
  });

  await prisma.emailVerificationOTP.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt,
      attempts: 0,
    },
  });

  console.log(`========================================`);
  console.log(`FRESH OTP FOR itxsurajofficial@gmail.com`);
  console.log(`CODE: ${otp}`);
  console.log(`EXPIRES IN: 5 minutes (${expiresAt.toISOString()})`);
  console.log(`========================================`);
}

main().finally(() => prisma.$disconnect());
