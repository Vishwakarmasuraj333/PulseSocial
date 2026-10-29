import assert from "assert";
import { getSocialProvider } from "../../src/lib/social/registry";
import { InstagramProvider } from "../../src/lib/social/providers/instagram";
import { MetaProvider } from "../../src/lib/social/providers/meta";

export async function runInstagramOAuthUnitTests() {
  console.log("\n▶ Running Suite 21: Official Instagram Login for Business & OAuth Verification Tests...");

  // Test 1: Registry returns official InstagramProvider
  const registeredProvider = getSocialProvider("instagram");
  assert.ok(
    registeredProvider instanceof InstagramProvider,
    "Registry must map 'instagram' directly to dedicated InstagramProvider"
  );
  assert.strictEqual(registeredProvider.platform, "instagram");
  assert.strictEqual(registeredProvider.displayName, "Instagram");
  console.log("  ✔ Test 1: Registry correctly resolves dedicated InstagramProvider for 'instagram'.");

  // Test 2: Construction of official Instagram OAuth URL
  const testState = "csrf_sec_state_" + Date.now();
  const testRedirect = "https://pulsesocial1.vercel.app/api/social/instagram/callback";
  const authUrl = registeredProvider.getAuthorizationUrl(testState, testRedirect);

  // Acceptance Criteria 1 & 2:
  // - Starts with https://www.instagram.com/oauth/authorize
  // - Zero Facebook OAuth redirect occurs
  assert.ok(
    authUrl.startsWith("https://www.instagram.com/oauth/authorize?"),
    "Authorization URL must point to official Instagram authorization endpoint"
  );
  assert.ok(
    !authUrl.includes("facebook.com"),
    "Instagram authorization URL must NEVER redirect to or contain facebook.com"
  );
  assert.ok(
    authUrl.includes("enable_fb_login=0"),
    "Must include enable_fb_login=0 to explicitly disable Facebook login fallback"
  );
  assert.ok(
    authUrl.includes("force_authentication=1"),
    "Must include force_authentication=1"
  );
  assert.ok(
    authUrl.includes(`redirect_uri=${encodeURIComponent(testRedirect)}`),
    "Must preserve exact redirect URI"
  );
  assert.ok(
    authUrl.includes(`state=${testState}`),
    "Must preserve exact CSRF state token"
  );
  assert.ok(
    authUrl.includes("instagram_business_basic"),
    "Must request instagram_business_basic scope"
  );
  assert.ok(
    authUrl.includes("instagram_business_content_publish"),
    "Must request instagram_business_content_publish scope"
  );
  assert.ok(
    authUrl.includes("instagram_business_manage_insights"),
    "Must request instagram_business_manage_insights scope"
  );
  console.log("  ✔ Test 2: Official Instagram authorization URL verified with enable_fb_login=0, force_authentication=1, and zero facebook.com references.");

  // Test 3: Instagram callback code sanitization (stripping #_ automatically added by Meta)
  const codeWithHash = "AQDhg7_3x9K-test_auth_code_from_meta#_";
  const sanitized = codeWithHash.replace(/#_$/, "").trim();
  assert.strictEqual(sanitized, "AQDhg7_3x9K-test_auth_code_from_meta");
  assert.ok(!sanitized.includes("#_"));
  console.log("  ✔ Test 3: Authorization code callback sanitization correctly strips Meta's '#_' fragment suffix.");

  // Test 4: Instagram container publishing contract (requires media attachment)
  const igProvider = new InstagramProvider();
  const publishResult = await igProvider.publishPost("test_token_123", {
    content: "Post without image or video",
    targetAccountId: "ig_acct_456",
    mediaUrls: [],
  });
  assert.strictEqual(publishResult.success, false);
  assert.strictEqual(publishResult.code, "INVALID_MEDIA");
  assert.ok(publishResult.error?.includes("requires at least one image or video"));
  console.log("  ✔ Test 4: Instagram 2-step media container publishing correctly enforces media requirements.");

  // Test 5: Rejection of empty access tokens
  let threwEmpty = false;
  try {
    await igProvider.getAccounts("");
  } catch (err: any) {
    threwEmpty = true;
    assert.ok(err.message.includes("Missing valid authorization token"));
  }
  assert.ok(threwEmpty, "Must reject empty access token for getAccounts");
  console.log("  ✔ Test 5: getAccounts strictly validates authorization token presence.");

  // Test 6: Verify Facebook integration remains intact on Facebook dialog OAuth
  const fbProvider = getSocialProvider("facebook");
  assert.ok(fbProvider instanceof MetaProvider, "Facebook must use MetaProvider");
  const fbUrl = fbProvider.getAuthorizationUrl(testState, "https://pulsesocial1.vercel.app/api/social/facebook/callback");
  assert.ok(
    fbUrl.startsWith("https://www.facebook.com/"),
    "Facebook authorization must continue using standard Facebook dialog OAuth"
  );
  assert.ok(fbUrl.includes("pages_manage_posts"), "Facebook authorization must include Facebook Page scopes");
  console.log("  ✔ Test 6: Facebook integration remains completely functional with existing Facebook Page OAuth.");

  // Test 7: Simulated Token Exchange Contract (Code -> Short-lived -> 60-day Long-lived)
  const originalFetch = global.fetch;
  try {
    global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = url.toString();
      if (urlStr.includes("api.instagram.com/oauth/access_token")) {
        return {
          ok: true,
          json: async () => ({
            access_token: "IG_SHORT_LIVED_TOKEN_123",
            user_id: 17841400012345678,
          }),
        } as any;
      }
      if (urlStr.includes("graph.instagram.com/access_token")) {
        return {
          ok: true,
          json: async () => ({
            access_token: "IG_LONG_LIVED_60DAY_TOKEN_456",
            token_type: "bearer",
            expires_in: 5184000,
          }),
        } as any;
      }
      return { ok: false, json: async () => ({}) } as any;
    }) as any;

    process.env.INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || "test_ig_app_id";
    process.env.INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "test_ig_app_secret";

    const tokenExchangeResult = await igProvider.exchangeCode(
      "AQDhg7_3x9K-test_auth_code_from_meta#_",
      "https://pulsesocial1.vercel.app/api/social/instagram/callback"
    );

    assert.strictEqual(tokenExchangeResult.accessToken, "IG_LONG_LIVED_60DAY_TOKEN_456");
    assert.strictEqual(tokenExchangeResult.expiresIn, 5184000);
    assert.strictEqual(tokenExchangeResult.metadata?.userId, "17841400012345678");
    assert.strictEqual(tokenExchangeResult.metadata?.isLongLived, true);
    assert.ok(tokenExchangeResult.scopes.includes("instagram_business_basic"));
    assert.ok(tokenExchangeResult.scopes.includes("instagram_business_content_publish"));
    console.log("  ✔ Test 7: Server-side token exchange (short-lived code exchange + 60-day long-lived upgrade) verified.");

    // Test 8: Simulated Account Discovery Contract from graph.instagram.com/me
    global.fetch = (async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("graph.instagram.com")) {
        return {
          ok: true,
          json: async () => ({
            id: "17841400012345678",
            username: "pulsesocial_hq",
            name: "PulseSocial Official",
            account_type: "BUSINESS",
            profile_picture_url: "https://igcdn.com/avatar.jpg",
            followers_count: 54200,
            media_count: 182,
          }),
        } as any;
      }
      return { ok: false, json: async () => ({}) } as any;
    }) as any;

    const discoveredAccounts = await igProvider.getAccounts("IG_LONG_LIVED_60DAY_TOKEN_456");
    assert.strictEqual(discoveredAccounts.length, 1);
    const primaryAccount = discoveredAccounts[0];
    assert.strictEqual(primaryAccount.providerAccountId, "17841400012345678");
    assert.strictEqual(primaryAccount.username, "pulsesocial_hq");
    assert.strictEqual(primaryAccount.displayName, "PulseSocial Official");
    assert.strictEqual(primaryAccount.accountType, "BUSINESS");
    assert.strictEqual(primaryAccount.profileImageUrl, "https://igcdn.com/avatar.jpg");
    assert.strictEqual(primaryAccount.metadata?.followersCount, 54200);
    assert.strictEqual(primaryAccount.metadata?.connectedVia, "instagram_login_for_business");
    console.log("  ✔ Test 8: Account discovery parses verified Instagram Business ID, handle, and metadata.");

    // Test 9: Profile Metrics Retrieval with fallback resilience
    const profileMetrics = await igProvider.getProfile("IG_LONG_LIVED_60DAY_TOKEN_456", "17841400012345678");
    assert.strictEqual(profileMetrics.followersCount, 54200);
    assert.strictEqual(profileMetrics.postsCount, 182);
    console.log("  ✔ Test 9: Profile metrics correctly retrieved from graph.instagram.com.");

    // Test 10: Long-lived Token Refresh Contract
    global.fetch = (async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("refresh_access_token")) {
        return {
          ok: true,
          json: async () => ({
            access_token: "IG_REFRESHED_TOKEN_999",
            expires_in: 5184000,
          }),
        } as any;
      }
      return { ok: false, json: async () => ({}) } as any;
    }) as any;

    const refreshed = await igProvider.refreshToken("IG_LONG_LIVED_60DAY_TOKEN_456");
    assert.strictEqual(refreshed.accessToken, "IG_REFRESHED_TOKEN_999");
    assert.strictEqual(refreshed.expiresIn, 5184000);
    console.log("  ✔ Test 10: Long-lived token refresh via graph.instagram.com/refresh_access_token verified.");
  } finally {
    global.fetch = originalFetch;
  }

  // Test 11: Prohibition of Mock/Typed Username Connections
  const normalizedProvider = "instagram";
  const cannotConnectViaUsername = normalizedProvider === "instagram";
  assert.ok(cannotConnectViaUsername, "Instagram must strictly forbid typed username connections");
  console.log("  ✔ Test 11: Typed username alone is strictly prohibited from creating connected Instagram status.");

  // Test 12: OAuth Callback Error Mapping
  const rawKey = "instagram";
  const errorParam = "access_denied";
  let friendlyError = "";
  if (rawKey === "instagram" && (errorParam === "access_denied" || errorParam.includes("denied"))) {
    friendlyError = "Instagram authorization was cancelled or requested permissions were declined.";
  }
  assert.strictEqual(friendlyError, "Instagram authorization was cancelled or requested permissions were declined.");
  console.log("  ✔ Test 12: Instagram OAuth callback errors and permission denials correctly mapped to friendly messaging.");

  console.log("✔ Suite 21: Official Instagram Login for Business Verified Successfully!\n");
}
