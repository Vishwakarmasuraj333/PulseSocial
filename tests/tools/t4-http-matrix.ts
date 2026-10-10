import assert from "assert";
import { SignJWT } from "jose";
import { prisma } from "../../src/lib/prisma";

const BASE_URL = "http://localhost:3000";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pulsesocial_super_secure_jwt_secret_token_change_in_production_32chars"
);

interface HttpTestResult {
  suite: string;
  endpoint: string;
  method: string;
  role: string;
  scenario: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  notes: string;
}

async function createAuthCookie(user: { id: string; email: string; name?: string; activeOrgId: string; role?: string }): Promise<string> {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name || "Test User",
    emailVerified: true,
    activeOrgId: user.activeOrgId,
    role: user.role || "MEMBER",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return `pulsesocial_auth_session=${token}`;
}

export async function runHttpIdorRoleMatrix(): Promise<HttpTestResult[]> {
  console.log("\n==================================================================");
  console.log("   T4: HTTP ROUTE HANDLERS TENANT ISOLATION & RBAC TEST MATRIX");
  console.log("==================================================================");

  const results: HttpTestResult[] = [];
  const time = Date.now();

  // Baseline Safety Check: Count real tenant organizations before testing
  const initialRealOrgs = await prisma.organization.findMany({ select: { id: true, name: true } });
  const initialRealCount = initialRealOrgs.length;
  console.log(`[Safety Guard] Baseline organization count before test: ${initialRealCount}`);

  // 1. Create Dedicated Test Tenant A
  const userA = await prisma.user.create({
    data: { email: `test-owner-a-${time}@example.test`, name: "Owner A", emailVerified: true },
  });
  const orgA = await prisma.organization.create({
    data: { name: `Test Tenant A ${time}`, slug: `test-org-a-${time}`, timezone: "UTC" },
  });
  const memberOwnerA = await prisma.organizationMember.create({
    data: { organizationId: orgA.id, userId: userA.id, role: "OWNER" },
  });

  const adminAUser = await prisma.user.create({
    data: { email: `test-admin-a-${time}@example.test`, name: "Admin A", emailVerified: true },
  });
  const memberAdminA = await prisma.organizationMember.create({
    data: { organizationId: orgA.id, userId: adminAUser.id, role: "ADMIN" },
  });

  const editorAUser = await prisma.user.create({
    data: { email: `test-editor-a-${time}@example.test`, name: "Editor A", emailVerified: true },
  });
  const memberEditorA = await prisma.organizationMember.create({
    data: { organizationId: orgA.id, userId: editorAUser.id, role: "EDITOR" },
  });

  const viewerAUser = await prisma.user.create({
    data: { email: `test-viewer-a-${time}@example.test`, name: "Viewer A", emailVerified: true },
  });
  const memberViewerA = await prisma.organizationMember.create({
    data: { organizationId: orgA.id, userId: viewerAUser.id, role: "VIEWER" },
  });

  // Resources for Tenant A
  const postA = await prisma.socialPost.create({
    data: { organizationId: orgA.id, creatorId: userA.id, content: "Public Post for Tenant A", status: "DRAFT" },
  });
  const accountA = await prisma.socialAccount.create({
    data: {
      organizationId: orgA.id,
      provider: "twitter",
      providerAccountId: `tw-a-${time}`,
      displayName: "Tenant A Twitter",
      status: "CONNECTED",
      scopes: "[]",
    },
  });

  // 2. Create Dedicated Test Tenant B
  const userB = await prisma.user.create({
    data: { email: `test-owner-b-${time}@example.test`, name: "Owner B", emailVerified: true },
  });
  const orgB = await prisma.organization.create({
    data: { name: `Test Tenant B ${time}`, slug: `test-org-b-${time}`, timezone: "UTC" },
  });
  const memberOwnerB = await prisma.organizationMember.create({
    data: { organizationId: orgB.id, userId: userB.id, role: "OWNER" },
  });

  // Resources strictly belonging to Tenant B
  const postB = await prisma.socialPost.create({
    data: { organizationId: orgB.id, creatorId: userB.id, content: "SUPER SECRET PRIVATE POST B", status: "DRAFT" },
  });
  const accountB = await prisma.socialAccount.create({
    data: {
      organizationId: orgB.id,
      provider: "facebook",
      providerAccountId: `fb-b-${time}`,
      displayName: "Tenant B Secret Facebook",
      status: "CONNECTED",
      scopes: "[]",
    },
  });
  const commentB = await prisma.socialComment.create({
    data: {
      socialAccountId: accountB.id,
      platformCommentId: `cmt-b-${time}`,
      platform: "facebook",
      authorName: "Secret Follower B",
      content: "Classified comment strictly for Tenant B",
      postedAt: new Date(),
    },
  });
  const messageB = await prisma.socialMessage.create({
    data: {
      socialAccountId: accountB.id,
      platformMessageId: `msg-b-${time}`,
      senderName: "Secret Client B",
      content: "Private confidential message strictly for Tenant B",
      sentAt: new Date(),
    },
  });

  // Session Cookies
  const cookieOwnerA = await createAuthCookie({ id: userA.id, email: userA.email, activeOrgId: orgA.id, role: "OWNER" });
  const cookieAdminA = await createAuthCookie({ id: adminAUser.id, email: adminAUser.email, activeOrgId: orgA.id, role: "ADMIN" });
  const cookieEditorA = await createAuthCookie({ id: editorAUser.id, email: editorAUser.email, activeOrgId: orgA.id, role: "EDITOR" });
  const cookieViewerA = await createAuthCookie({ id: viewerAUser.id, email: viewerAUser.email, activeOrgId: orgA.id, role: "VIEWER" });
  const cookieOwnerB = await createAuthCookie({ id: userB.id, email: userB.email, activeOrgId: orgB.id, role: "OWNER" });

  try {
    // =========================================================================
    // 1. POSTS ROUTE (GET /api/posts) - IDOR & Spoofing Verification
    // =========================================================================
    console.log("\n[1] Testing /api/posts Tenant Isolation & Header/Query Spoofing...");
    
    // Normal Owner A request
    const postsRes = await fetch(`${BASE_URL}/api/posts`, {
      headers: { Cookie: cookieOwnerA },
    });
    const postsData = await postsRes.json();
    const hasPostA = postsData.posts?.some((p: any) => p.id === postA.id);
    const hasPostB = postsData.posts?.some((p: any) => p.id === postB.id || p.content.includes("SUPER SECRET"));

    results.push({
      suite: "Posts",
      endpoint: "/api/posts",
      method: "GET",
      role: "OWNER (Org A)",
      scenario: "Normal workspace query",
      expectedStatus: 200,
      actualStatus: postsRes.status,
      passed: postsRes.status === 200 && hasPostA && !hasPostB,
      notes: "Returns only Tenant A posts; Secret Post B excluded",
    });

    // Spoofing Attempt 1: Header x-workspace-id
    const postsSpoofHeaderRes = await fetch(`${BASE_URL}/api/posts`, {
      headers: {
        Cookie: cookieOwnerA,
        "x-workspace-id": orgB.id,
      },
    });
    const postsSpoofHeaderData = await postsSpoofHeaderRes.json();
    const leakedPostBHeader = postsSpoofHeaderData.posts?.some((p: any) => p.id === postB.id);

    results.push({
      suite: "Posts",
      endpoint: "/api/posts",
      method: "GET",
      role: "OWNER (Org A)",
      scenario: "Workspace-id spoofing via header 'x-workspace-id'",
      expectedStatus: 200,
      actualStatus: postsSpoofHeaderRes.status,
      passed: !leakedPostBHeader,
      notes: "Header spoofing ignored; activeOrgId from JWT strictly enforced",
    });

    // Spoofing Attempt 2: Query param ?organizationId=
    const postsSpoofQueryRes = await fetch(`${BASE_URL}/api/posts?organizationId=${orgB.id}`, {
      headers: { Cookie: cookieOwnerA },
    });
    const postsSpoofQueryData = await postsSpoofQueryRes.json();
    const leakedPostBQuery = postsSpoofQueryData.posts?.some((p: any) => p.id === postB.id);

    results.push({
      suite: "Posts",
      endpoint: "/api/posts",
      method: "GET",
      role: "OWNER (Org A)",
      scenario: "Workspace-id spoofing via query '?organizationId='",
      expectedStatus: 200,
      actualStatus: postsSpoofQueryRes.status,
      passed: !leakedPostBQuery,
      notes: "Query parameter spoofing ignored; cross-tenant post access blocked",
    });

    // =========================================================================
    // 2. INBOX / CONVERSATIONS ROUTE (GET /api/inbox/conversations)
    // =========================================================================
    console.log("\n[2] Testing /api/inbox/conversations Tenant Isolation...");
    const convoRes = await fetch(`${BASE_URL}/api/inbox/conversations`, {
      headers: {
        Cookie: cookieOwnerA,
        "x-workspace-id": orgB.id,
      },
    });
    const convoData = await convoRes.json();
    const leakedMessageB = convoData.conversations?.some(
      (c: any) => c.lastMessage?.includes("Tenant B") || c.senderName?.includes("Secret")
    );

    results.push({
      suite: "Inbox",
      endpoint: "/api/inbox/conversations",
      method: "GET",
      role: "OWNER (Org A)",
      scenario: "Cross-tenant conversation/message leakage check",
      expectedStatus: 200,
      actualStatus: convoRes.status,
      passed: convoRes.status === 200 && !leakedMessageB,
      notes: "Tenant B DMs and comments completely excluded from Tenant A inbox",
    });

    // =========================================================================
    // 3. COMMENTS ROUTE (GET /api/comments)
    // =========================================================================
    console.log("\n[3] Testing /api/comments Tenant Isolation...");
    const cmtRes = await fetch(`${BASE_URL}/api/comments`, {
      headers: { Cookie: cookieOwnerA },
    });
    const cmtData = await cmtRes.json();
    const leakedCmtB = cmtData.posts?.some((p: any) =>
      p.comments?.some((c: any) => c.content?.includes("Classified comment strictly for Tenant B"))
    );

    results.push({
      suite: "Comments",
      endpoint: "/api/comments",
      method: "GET",
      role: "OWNER (Org A)",
      scenario: "Cross-tenant comments isolation",
      expectedStatus: 200,
      actualStatus: cmtRes.status,
      passed: cmtRes.status === 200 && !leakedCmtB,
      notes: "Zero comment leakage across tenants",
    });

    // =========================================================================
    // 4. TEAM MEMBERS & INVITATIONS (GET & POST /api/team/invite)
    // =========================================================================
    console.log("\n[4] Testing /api/team and /api/team/invite RBAC & Isolation...");
    
    // Team Members listing
    const teamRes = await fetch(`${BASE_URL}/api/team`, {
      headers: { Cookie: cookieOwnerA },
    });
    const teamData = await teamRes.json();
    const hasMemberOwnerB = teamData.members?.some((m: any) => m.email === userB.email);

    results.push({
      suite: "Team Members",
      endpoint: "/api/team",
      method: "GET",
      role: "OWNER (Org A)",
      scenario: "Member directory tenant isolation",
      expectedStatus: 200,
      actualStatus: teamRes.status,
      passed: teamRes.status === 200 && !hasMemberOwnerB,
      notes: "Tenant B members not leaked in Tenant A roster",
    });

    // RBAC: VIEWER attempting to invite team member -> 403 Forbidden
    const viewerInviteRes = await fetch(`${BASE_URL}/api/team/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieViewerA,
      },
      body: JSON.stringify({ email: `intruder-${time}@example.test`, role: "Viewer" }),
    });

    results.push({
      suite: "Invitations",
      endpoint: "/api/team/invite",
      method: "POST",
      role: "VIEWER (Org A)",
      scenario: "Viewer role unauthorized invitation attempt",
      expectedStatus: 403,
      actualStatus: viewerInviteRes.status,
      passed: viewerInviteRes.status === 403,
      notes: "Viewer blocked from sending team invitations",
    });

    // RBAC: EDITOR attempting to invite team member -> 403 Forbidden
    const editorInviteRes = await fetch(`${BASE_URL}/api/team/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieEditorA,
      },
      body: JSON.stringify({ email: `intruder2-${time}@example.test`, role: "Editor" }),
    });

    results.push({
      suite: "Invitations",
      endpoint: "/api/team/invite",
      method: "POST",
      role: "EDITOR (Org A)",
      scenario: "Editor role unauthorized invitation attempt",
      expectedStatus: 403,
      actualStatus: editorInviteRes.status,
      passed: editorInviteRes.status === 403,
      notes: "Editor blocked from sending team invitations",
    });

    // RBAC: ADMIN sending team invitation -> 200 OK
    const adminInviteRes = await fetch(`${BASE_URL}/api/team/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieAdminA,
      },
      body: JSON.stringify({ email: `valid-collab-${time}@example.test`, role: "User" }),
    });

    results.push({
      suite: "Invitations",
      endpoint: "/api/team/invite",
      method: "POST",
      role: "ADMIN (Org A)",
      scenario: "Admin authorized team invitation",
      expectedStatus: 200,
      actualStatus: adminInviteRes.status,
      passed: adminInviteRes.status === 200,
      notes: "Admin permitted to invite collaborators",
    });

    // =========================================================================
    // 5. POST CREATION RBAC (/api/posts)
    // =========================================================================
    console.log("\n[5] Testing /api/posts RBAC (Viewer vs Editor)...");

    // VIEWER attempting to create post -> 403 Forbidden
    const viewerPostRes = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieViewerA,
      },
      body: JSON.stringify({ content: "Viewer unauthorized post", action: "DRAFT" }),
    });

    results.push({
      suite: "Posts",
      endpoint: "/api/posts",
      method: "POST",
      role: "VIEWER (Org A)",
      scenario: "Viewer role unauthorized post creation",
      expectedStatus: 403,
      actualStatus: viewerPostRes.status,
      passed: viewerPostRes.status === 403,
      notes: "Viewer blocked from creating drafts or publishing posts",
    });

    // EDITOR creating post -> 200 OK
    const editorPostRes = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieEditorA,
      },
      body: JSON.stringify({
        content: "Editor authorized post",
        action: "DRAFT",
        targetAccountIds: [accountA.id],
      }),
    });

    results.push({
      suite: "Posts",
      endpoint: "/api/posts",
      method: "POST",
      role: "EDITOR (Org A)",
      scenario: "Editor authorized post creation",
      expectedStatus: 200,
      actualStatus: editorPostRes.status,
      passed: editorPostRes.status === 200,
      notes: "Editor permitted to author drafts and posts",
    });

    // =========================================================================
    // 6. BRAND SETTINGS & TAMPERING ATTEMPT (/api/brand)
    // =========================================================================
    console.log("\n[6] Testing /api/brand Settings & Cross-tenant Body Spoofing...");

    // Viewer attempting to update brand info -> 403 Forbidden
    const viewerPatchRes = await fetch(`${BASE_URL}/api/brand`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieViewerA,
      },
      body: JSON.stringify({ name: "Hacked by Viewer" }),
    });

    results.push({
      suite: "Settings",
      endpoint: "/api/brand",
      method: "PATCH",
      role: "VIEWER (Org A)",
      scenario: "Viewer unauthorized brand settings update",
      expectedStatus: 403,
      actualStatus: viewerPatchRes.status,
      passed: viewerPatchRes.status === 403,
      notes: "Viewer blocked from mutating brand information",
    });

    // Body Spoofing: User A passes organizationId: orgB.id to alter Org B
    const tamperRes = await fetch(`${BASE_URL}/api/brand`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieOwnerA,
      },
      body: JSON.stringify({
        organizationId: orgB.id,
        description: "Attempted tampering by User A",
      }),
    });
    
    // Check that Org B in database was completely UNTOUCHED
    const orgBCheck = await prisma.organization.findUnique({ where: { id: orgB.id } });
    const orgBTampered = orgBCheck?.description === "Attempted tampering by User A";

    results.push({
      suite: "Settings",
      endpoint: "/api/brand",
      method: "PATCH",
      role: "OWNER (Org A)",
      scenario: "Cross-tenant JSON body 'organizationId' spoofing",
      expectedStatus: 200,
      actualStatus: tamperRes.status,
      passed: !orgBTampered,
      notes: "Body spoofing ignored; activeOrgId enforced; Org B unchanged",
    });

    // =========================================================================
    // 7. SOCIAL ACCOUNTS (GET & DELETE /api/social/accounts)
    // =========================================================================
    console.log("\n[7] Testing /api/social/accounts Tenant Isolation & Cross-Delete...");
    
    const accRes = await fetch(`${BASE_URL}/api/social/accounts`, {
      headers: { Cookie: cookieOwnerA },
    });
    const accData = await accRes.json();
    const hasAccB = accData.accounts?.some((a: any) => a.id === accountB.id);

    results.push({
      suite: "Social Accounts",
      endpoint: "/api/social/accounts",
      method: "GET",
      role: "OWNER (Org A)",
      scenario: "Channel listing tenant isolation",
      expectedStatus: 200,
      actualStatus: accRes.status,
      passed: accRes.status === 200 && !hasAccB,
      notes: "Tenant B connected channels not leaked",
    });

    // User A attempting to delete Tenant B account
    const crossDeleteRes = await fetch(`${BASE_URL}/api/social/accounts?id=${accountB.id}`, {
      method: "DELETE",
      headers: { Cookie: cookieOwnerA },
    });
    const accBStillExists = await prisma.socialAccount.findUnique({ where: { id: accountB.id } });

    results.push({
      suite: "Social Accounts",
      endpoint: "/api/social/accounts",
      method: "DELETE",
      role: "OWNER (Org A)",
      scenario: "Cross-tenant social account deletion attempt",
      expectedStatus: 404,
      actualStatus: crossDeleteRes.status,
      passed: crossDeleteRes.status === 404 && Boolean(accBStillExists),
      notes: "Foreign channel deletion rejected with 404; Account B safe",
    });

    // =========================================================================
    // 8. BRAND DELETION SAFETY & RBAC (/api/brand DELETE)
    // =========================================================================
    console.log("\n[8] Testing /api/brand DELETE RBAC and Real Data Safety Guarantee...");

    // Admin attempting to delete brand -> 403 Forbidden (Owner only)
    const adminDeleteRes = await fetch(`${BASE_URL}/api/brand`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieAdminA,
      },
      body: JSON.stringify({ confirmName: orgA.name }),
    });

    results.push({
      suite: "Organization",
      endpoint: "/api/brand",
      method: "DELETE",
      role: "ADMIN (Org A)",
      scenario: "Admin unauthorized brand deletion attempt",
      expectedStatus: 403,
      actualStatus: adminDeleteRes.status,
      passed: adminDeleteRes.status === 403,
      notes: "Only Workspace Owner can execute brand deletion",
    });

    // Owner deleting strictly the TEST workspace Org A
    const ownerDeleteRes = await fetch(`${BASE_URL}/api/brand`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieOwnerA,
      },
      body: JSON.stringify({ confirmName: orgA.name }),
    });

    const orgADeletedInDb = (await prisma.organization.findUnique({ where: { id: orgA.id } })) === null;

    results.push({
      suite: "Organization",
      endpoint: "/api/brand",
      method: "DELETE",
      role: "OWNER (Org A)",
      scenario: "Owner confirmed deletion of designated TEST workspace",
      expectedStatus: 200,
      actualStatus: ownerDeleteRes.status,
      passed: ownerDeleteRes.status === 200 && orgADeletedInDb,
      notes: "Test workspace Org A deleted cleanly with typed confirmation",
    });

    // Real Data Safety Check: Verify real organizations are completely untouched
    const currentRealOrgs = await prisma.organization.findMany({
      where: { id: { notIn: [orgA.id, orgB.id] } },
    });
    const realOrgsPreserved = currentRealOrgs.length >= initialRealCount;

    results.push({
      suite: "Safety Guarantee",
      endpoint: "Database",
      method: "AUDIT",
      role: "SYSTEM",
      scenario: "Real tenant data safety verification",
      expectedStatus: 200,
      actualStatus: realOrgsPreserved ? 200 : 500,
      passed: realOrgsPreserved,
      notes: `Delete-brand test never touched real data (${currentRealOrgs.length} real orgs preserved)`,
    });

  } finally {
    // Clean up test records
    await prisma.socialComment.deleteMany({ where: { id: commentB.id } }).catch(() => {});
    await prisma.socialMessage.deleteMany({ where: { id: messageB.id } }).catch(() => {});
    await prisma.socialPost.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } }).catch(() => {});
    await prisma.socialAccount.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } }).catch(() => {});
    await prisma.teamInvitation.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } }).catch(() => {});
    await prisma.organizationMember.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } }).catch(() => {});
    await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } }).catch(() => {});
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, adminAUser.id, editorAUser.id, viewerAUser.id, userB.id] } },
    }).catch(() => {});
  }

  // Print results table
  console.log("\n--- T4 HTTP IDOR & RBAC TEST MATRIX RESULTS ---");
  console.table(
    results.map((r) => ({
      Suite: r.suite,
      Method: r.method,
      Endpoint: r.endpoint,
      Role: r.role,
      Scenario: r.scenario,
      Expected: r.expectedStatus,
      Actual: r.actualStatus,
      Result: r.passed ? "✔ PASS" : "❌ FAIL",
      Notes: r.notes,
    }))
  );

  return results;
}

if (require.main === module) {
  runHttpIdorRoleMatrix()
    .then((res) => {
      const allPassed = res.every((r) => r.passed);
      prisma.$disconnect();
      if (!allPassed) {
        console.error("Some T4 HTTP tests failed!");
        process.exit(1);
      }
      console.log("\n✔ ALL T4 HTTP ROUTE HANDLER TESTS PASSED.");
    })
    .catch((err) => {
      console.error("T4 test error:", err);
      prisma.$disconnect();
      process.exit(1);
    });
}
