/**
 * PulseSocial Company Super-Admin Email Configuration & Utilities
 * 
 * Enforces strict single-authority administrative permissions.
 * Standard registered workspace users (even with workspace OWNER or ADMIN roles)
 * are NEVER granted access to the global PulseSocial Admin Console (/admin).
 */

export const COMPANY_ADMIN_EMAILS: readonly string[] = [
  "admin@pulsesocial.io",
  "itsurya9930@gmail.com",
  "itxsurajofficial@gmail.com",
  "suraj@pulsesocial.io",
];

/**
 * Checks whether an email address belongs to an authorized company super-admin.
 * Evaluates both the hardcoded company admin roster and dynamic environment variable overrides.
 */
export function isCompanyAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();

  // 1. Check dynamic environment variables if configured on hosting provider (e.g. Vercel)
  const envAdmins = (
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    process.env.SUPER_ADMIN_EMAIL ||
    ""
  )
    .toLowerCase()
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (envAdmins.includes(normalized)) {
    return true;
  }

  // 2. Check company admin roster
  return COMPANY_ADMIN_EMAILS.includes(normalized);
}

