import crypto from "crypto";

/**
 * Validates incoming cron request against configured CRON_SECRET using constant-time comparison.
 */
export function verifyCronAuth(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    console.error("[CRON_AUTH_SECURITY_ALERT] CRON_SECRET is not configured in production. Rejecting cron request.");
    return false;
  }
  const effectiveSecret = secret || "pulsesocial_cron_internal_secret_fallback_key";

  const authHeader = req.headers.get("authorization");
  const cronSecretHeader = req.headers.get("x-cron-secret");
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("key") || url.searchParams.get("secret");

  let providedToken: string | null = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    providedToken = authHeader.substring(7).trim();
  } else if (cronSecretHeader) {
    providedToken = cronSecretHeader.trim();
  } else if (querySecret) {
    providedToken = querySecret.trim();
  }

  if (!providedToken) {
    return false;
  }

  // Constant-time comparison
  const expectedBuffer = Buffer.from(effectiveSecret);
  const providedBuffer = Buffer.from(providedToken);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}
