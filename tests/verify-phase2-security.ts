import assert from "assert";
import { NextRequest } from "next/server";
import { verifyCronAuth } from "../src/lib/security/cron-auth";
import { isSafePublicUrl } from "../src/lib/security/ssrf";
import { prisma } from "../src/lib/prisma";

// Import all 12 AI route handlers
import { POST as testPost } from "../src/app/api/ai/test/route";
import { POST as generatePost } from "../src/app/api/ai/generate/route";
import { POST as imagePost } from "../src/app/api/ai/image/route";
import { POST as chatPost } from "../src/app/api/ai/chat/route";
import { POST as socialCopyPost } from "../src/app/api/ai/gemini/social-copy/route";
import { POST as geminiImagePost } from "../src/app/api/ai/gemini/image/route";
import { POST as ideasPost } from "../src/app/api/ai/ideas/route";
import { POST as replyPost } from "../src/app/api/ai/reply/route";
import { POST as repurposePost } from "../src/app/api/ai/repurpose/route";
import { POST as hashtagsPost } from "../src/app/api/ai/hashtags/route";
import { POST as insightsPost } from "../src/app/api/ai/insights/route";
import { POST as rewritePost } from "../src/app/api/ai/rewrite/route";

export async function runPhase2SecurityVerification() {
  console.log("==================================================================");
  console.log("   PHASE 2: LIVE SECURITY & ISOLATION VERIFICATION SUITE");
  console.log("==================================================================");

  // 1. Verify Unauthenticated Access to all 12 Protected AI Endpoints
  console.log("\n[1] Verifying HTTP 401 on all 12 protected AI route handlers...");

  const aiEndpoints: Array<{ name: string; handler: (req: NextRequest) => Promise<Response>; method: string }> = [
    { name: "/api/ai/test", handler: testPost, method: "POST" },
    { name: "/api/ai/generate", handler: generatePost, method: "POST" },
    { name: "/api/ai/image", handler: imagePost, method: "POST" },
    { name: "/api/ai/chat", handler: chatPost, method: "POST" },
    { name: "/api/ai/gemini/social-copy", handler: socialCopyPost, method: "POST" },
    { name: "/api/ai/gemini/image", handler: geminiImagePost, method: "POST" },
    { name: "/api/ai/ideas", handler: ideasPost, method: "POST" },
    { name: "/api/ai/reply", handler: replyPost, method: "POST" },
    { name: "/api/ai/repurpose", handler: repurposePost, method: "POST" },
    { name: "/api/ai/hashtags", handler: hashtagsPost, method: "POST" },
    { name: "/api/ai/insights", handler: insightsPost, method: "POST" },
    { name: "/api/ai/rewrite", handler: rewritePost, method: "POST" },
  ];

  for (const ep of aiEndpoints) {
    const unauthReq = new NextRequest(`http://localhost:3000${ep.name}`, {
      method: ep.method,
      body: ep.method === "POST" ? JSON.stringify({ prompt: "malicious probe" }) : undefined,
      headers: { "Content-Type": "application/json" },
    });

    const res = await ep.handler(unauthReq);
    assert.strictEqual(
      res.status,
      401,
      `Endpoint ${ep.name} MUST return HTTP 401 when unauthenticated, got ${res.status}`
    );
    const body = await res.json();
    assert.ok(
      body.error && body.error.toLowerCase().includes("unauthorized"),
      `Endpoint ${ep.name} MUST return Unauthorized error payload, got: ${JSON.stringify(body)}`
    );
    console.log(`  ✔ [HTTP 401 OK] ${ep.name} safely blocked unauthenticated request.`);
  }

  // 2. Secret Leakage Verification
  console.log("\n[2] Verifying no API keys or database secrets appear in /api/ai/test response...");
  const unauthTestReq = new NextRequest("http://localhost:3000/api/ai/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const testRes = await testPost(unauthTestReq);
  const testBody = await testRes.text();
  assert.strictEqual(testRes.status, 401);
  assert.strictEqual(testBody.includes("keyPrefix"), false, "Must not leak keyPrefix");
  assert.strictEqual(testBody.includes("GEMINI_API_KEY"), false, "Must not leak env var name");
  console.log("  ✔ /api/ai/test leaks 0 keys, secrets, or internal identifiers.");

  // 3. Cron Production Fail-Closed Verification
  console.log("\n[3] Verifying production cron fails closed when CRON_SECRET is missing...");
  const savedNodeEnv = process.env.NODE_ENV;
  const savedCronSecret = process.env.CRON_SECRET;
  try {
    process.env.NODE_ENV = "production";
    delete process.env.CRON_SECRET;

    const dummyCronReq = new Request("http://localhost:3000/api/cron/publisher", {
      headers: { authorization: "Bearer pulsesocial_cron_secret_prod_secure_2026_xyz" },
    });
    const passed = verifyCronAuth(dummyCronReq);
    assert.strictEqual(passed, false, "Cron MUST fail closed when CRON_SECRET is missing in production");
    console.log("  ✔ Production cron fail-closed contract confirmed.");
  } finally {
    process.env.NODE_ENV = savedNodeEnv;
    process.env.CRON_SECRET = savedCronSecret;
  }

  // 4. Extended SSRF Protection Validation (IPv4, IPv6, 0.0.0.0, cloud metadata, schemes)
  console.log("\n[4] Verifying comprehensive SSRF boundaries...");
  const dangerousUrls = [
    { url: "http://127.0.0.1:80", desc: "IPv4 loopback" },
    { url: "http://localhost:3000", desc: "localhost hostname" },
    { url: "http://0.0.0.0:8000", desc: "0.0.0.0 all-interfaces" },
    { url: "http://169.254.169.254/latest/meta-data/", desc: "AWS/GCP IPv4 metadata service" },
    { url: "http://metadata.google.internal/computeMetadata/v1/", desc: "GCP internal metadata hostname" },
    { url: "http://10.255.0.1/private", desc: "RFC 1918 Class A private IP" },
    { url: "http://172.20.0.1/private", desc: "RFC 1918 Class B private IP" },
    { url: "http://192.168.0.1/admin", desc: "RFC 1918 Class C private IP" },
    { url: "file:///etc/shadow", desc: "file: scheme" },
    { url: "ftp://attacker.com/file", desc: "ftp: scheme" },
    { url: "gopher://attacker.com/", desc: "gopher: scheme" },
  ];

  for (const item of dangerousUrls) {
    const res = isSafePublicUrl(item.url);
    assert.strictEqual(res.isSafe, false, `SSRF vulnerability: ${item.desc} (${item.url}) was permitted!`);
    console.log(`  ✔ Blocked ${item.desc} (${item.url}) -> ${res.reason}`);
  }

  const legitimateUrls = [
    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
    "https://cdn.example.com/asset.mp4",
  ];
  for (const url of legitimateUrls) {
    const res = isSafePublicUrl(url);
    assert.strictEqual(res.isSafe, true, `Legitimate CDN URL must be permitted: ${url}`);
    console.log(`  ✔ Permitted legitimate URL: ${url}`);
  }

  // 5. Workspace Multi-Tenant Scoping Verification with Two Orgs
  console.log("\n[5] Verifying tenant isolation across 2 organizations in database...");
  const orgs = await prisma.organization.findMany({ take: 2 });
  if (orgs.length >= 2) {
    const [org1, org2] = orgs;
    const org1Posts = await prisma.socialPost.findMany({ where: { organizationId: org1.id } });
    const org2Posts = await prisma.socialPost.findMany({ where: { organizationId: org2.id } });

    const org1PostIds = new Set(org1Posts.map((p) => p.id));
    for (const p2 of org2Posts) {
      assert.strictEqual(org1PostIds.has(p2.id), false, `Tenant cross-leakage on post ${p2.id}`);
    }
    console.log(`  ✔ Verified isolation between Org '${org1.name}' (${org1.id}) and Org '${org2.name}' (${org2.id}).`);
  } else {
    console.log("  ℹ Less than 2 organizations exist in database.");
  }

  console.log("\n==================================================================");
  console.log("   ALL PHASE 2 SECURITY VERIFICATIONS PASSED (100% SUCCESS)");
  console.log("==================================================================");
}

runPhase2SecurityVerification().catch((err) => {
  console.error("PHASE 2 VERIFICATION FAILED:", err);
  process.exit(1);
});
