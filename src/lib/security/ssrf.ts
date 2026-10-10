/**
 * SSRF Protection Utility
 * Prevents Server-Side Request Forgery by disallowing requests to
 * local, loopback, link-local, private RFC 1918 addresses, and cloud metadata services.
 */

export interface SsrCheckResult {
  isSafe: boolean;
  reason?: string;
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
  "169.254.169.254",
  "instance-data",
]);

export function isSafePublicUrl(rawUrl: string): SsrCheckResult {
  try {
    const parsed = new URL(rawUrl);

    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isSafe: false, reason: `Disallowed protocol: '${parsed.protocol}'` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check blocked hostnames
    if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
      return { isSafe: false, reason: `Blocked local or internal hostname: '${hostname}'` };
    }

    // Check IPv4 private and link-local ranges
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const octet1 = parseInt(ipv4Match[1], 10);
      const octet2 = parseInt(ipv4Match[2], 10);

      // Loopback (127.0.0.0/8)
      if (octet1 === 127) {
        return { isSafe: false, reason: "Loopback IP address is not permitted." };
      }
      // Zero network (0.0.0.0/8)
      if (octet1 === 0) {
        return { isSafe: false, reason: "Zero network IP is not permitted." };
      }
      // Private RFC 1918 (10.0.0.0/8)
      if (octet1 === 10) {
        return { isSafe: false, reason: "Private RFC 1918 network (10.0.0.0/8) is not permitted." };
      }
      // Private RFC 1918 (172.16.0.0/12)
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) {
        return { isSafe: false, reason: "Private RFC 1918 network (172.16.0.0/12) is not permitted." };
      }
      // Private RFC 1918 (192.168.0.0/16)
      if (octet1 === 192 && octet2 === 168) {
        return { isSafe: false, reason: "Private RFC 1918 network (192.168.0.0/16) is not permitted." };
      }
      // Link-local / Cloud metadata (169.254.0.0/16)
      if (octet1 === 169 && octet2 === 254) {
        return { isSafe: false, reason: "Cloud metadata / link-local IP (169.254.0.0/16) is not permitted." };
      }
    }

    return { isSafe: true };
  } catch {
    return { isSafe: false, reason: "Malformed or invalid URL string." };
  }
}
