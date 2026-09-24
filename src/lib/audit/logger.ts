import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export interface LogAuditParams {
  organizationId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}

export async function logAudit({
  organizationId,
  userId,
  action,
  resourceType,
  resourceId,
  details,
}: LogAuditParams) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "127.0.0.1";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Sanitize details to guarantee no secrets/tokens are logged
    const sanitizedDetails = details ? { ...details } : {};
    const sensitiveKeys = ["password", "token", "accessToken", "refreshToken", "secret", "otp", "code"];
    for (const key of Object.keys(sanitizedDetails)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitizedDetails[key] = "[REDACTED]";
      }
    }

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId,
        action,
        resourceType,
        resourceId,
        details: JSON.stringify(sanitizedDetails),
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Audit log creation error:", error);
  }
}
