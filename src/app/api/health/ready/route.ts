import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { status: "UP" | "DOWN"; latencyMs?: number; message?: string }> = {};
  let overallHealthy = true;

  // 1. Database Connectivity Check
  const startDb = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: "UP",
      latencyMs: Date.now() - startDb,
    };
  } catch (dbErr: unknown) {
    overallHealthy = false;
    checks.database = {
      status: "DOWN",
      message: "Database connection failed",
    };
  }

  // 2. Encryption Key Configuration Check (Boolean only, zero secret leakage)
  checks.tokenEncryption = {
    status: process.env.TOKEN_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY ? "UP" : "DOWN",
  };

  // 3. Mail Transport Configuration Check
  checks.mailTransport = {
    status: process.env.SMTP_HOST && process.env.SMTP_USER ? "UP" : "DOWN",
  };

  const httpStatus = overallHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: overallHealthy ? "READY" : "NOT_READY",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: httpStatus }
  );
}
