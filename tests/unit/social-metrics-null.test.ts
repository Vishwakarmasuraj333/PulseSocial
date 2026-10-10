import assert from "assert";
import { YouTubeProvider } from "../../src/lib/social/providers/youtube";
import { XProvider } from "../../src/lib/social/providers/x";
import { MetaProvider } from "../../src/lib/social/providers/meta";
import { LinkedInProvider } from "../../src/lib/social/providers/linkedin";
import { MastodonProvider } from "../../src/lib/social/providers/mastodon";
import { TikTokProvider } from "../../src/lib/social/providers/tiktok";
import { PinterestProvider } from "../../src/lib/social/providers/pinterest";
import { ThreadsProvider } from "../../src/lib/social/providers/threads";
import { WhatsAppProvider } from "../../src/lib/social/providers/whatsapp";
import { TelegramProvider } from "../../src/lib/social/providers/telegram";
import { SnapchatProvider } from "../../src/lib/social/providers/snapchat";
import { RedditProvider } from "../../src/lib/social/providers/reddit";
import { GoogleBusinessProvider } from "../../src/lib/social/providers/google-business";
import { BlueskyProvider } from "../../src/lib/social/providers/bluesky";

export async function runSocialMetricsNullTest() {
  console.log("\n--- RUNNING SOCIAL METRICS NULL VS 0 AUDIT TESTS ---");

  // Mock global fetch to test provider parsing behavior under edge conditions
  const originalFetch = global.fetch;

  try {
    // 1. YouTube with HIDDEN subscribers
    global.fetch = async (url: any) => {
      if (typeof url === "string" && url.includes("channels")) {
        return {
          ok: true,
          json: async () => ({
            items: [
              {
                id: "UC_hidden_subscribers",
                statistics: {
                  hiddenSubscriberCount: true,
                  subscriberCount: "0",
                  videoCount: "42",
                },
              },
            ],
          }),
        } as any;
      }
      return { ok: false } as any;
    };

    const yt = new YouTubeProvider();
    const ytProfile = await yt.getProfile("fake_token", "UC_hidden_subscribers");
    assert.strictEqual(
      ytProfile.followersCount,
      null,
      "YouTube channel with hiddenSubscriberCount=true MUST return followersCount=null"
    );
    assert.strictEqual(
      ytProfile.followingCount,
      null,
      "YouTube channel followingCount MUST be null (unsupported by platform)"
    );
    assert.strictEqual(ytProfile.postsCount, 42, "Valid videoCount must be parsed correctly");
    console.log("✔ Test 1 Passed: YouTube hiddenSubscriberCount returns null followersCount");

    // 2. YouTube with MISSING subscriberCount
    global.fetch = async (url: any) => {
      if (typeof url === "string" && url.includes("channels")) {
        return {
          ok: true,
          json: async () => ({
            items: [
              {
                id: "UC_missing_subscribers",
                statistics: {
                  videoCount: "10",
                },
              },
            ],
          }),
        } as any;
      }
      return { ok: false } as any;
    };

    const ytProfile2 = await yt.getProfile("fake_token", "UC_missing_subscribers");
    assert.strictEqual(
      ytProfile2.followersCount,
      null,
      "YouTube channel with missing subscriberCount MUST return followersCount=null"
    );
    console.log("✔ Test 2 Passed: YouTube missing subscriberCount returns null followersCount");

    // 3. YouTube failed request
    global.fetch = async () => ({ ok: false } as any);
    const ytProfileFailed = await yt.getProfile("bad_token", "UC_error");
    assert.strictEqual(ytProfileFailed.followersCount, null);
    assert.strictEqual(ytProfileFailed.followingCount, null);
    assert.strictEqual(ytProfileFailed.postsCount, null);
    console.log("✔ Test 3 Passed: YouTube failed API request returns null metrics");

    // 4. X with missing metrics
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({ data: { public_metrics: null } }),
      } as any;
    };
    const x = new XProvider();
    const xProfile = await x.getProfile("fake_token", "user123");
    assert.strictEqual(xProfile.followersCount, null);
    assert.strictEqual(xProfile.followingCount, null);
    assert.strictEqual(xProfile.postsCount, null);
    console.log("✔ Test 4 Passed: X with null public_metrics returns null for followers, following, posts");

    // 5. Facebook Page (missing public following)
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({ followers_count: 500 }),
      } as any;
    };
    const fb = new MetaProvider("facebook");
    const fbProfile = await fb.getProfile("fake_token", "page123");
    assert.strictEqual(fbProfile.followersCount, 500);
    assert.strictEqual(fbProfile.followingCount, null, "Facebook page followingCount MUST be null");
    assert.strictEqual(fbProfile.postsCount, null, "Facebook page postsCount MUST be null");
    console.log("✔ Test 5 Passed: Facebook Page returns null for unsupported followingCount and postsCount");

    // 6. WhatsApp Business Account (unsupported public followers)
    const wa = new WhatsAppProvider();
    const waProfile = await wa.getProfile("fake_token", "123456789");
    assert.strictEqual(waProfile.followersCount, null);
    assert.strictEqual(waProfile.followingCount, null);
    assert.strictEqual(waProfile.postsCount, null);
    console.log("✔ Test 6 Passed: WhatsApp returns null for followers, following, and posts");

    // 7. Telegram Channel (unsupported public following)
    const tg = new TelegramProvider();
    const tgProfile = await tg.getProfile();
    assert.strictEqual(tgProfile.followersCount, null);
    assert.strictEqual(tgProfile.followingCount, null);
    assert.strictEqual(tgProfile.postsCount, null);
    console.log("✔ Test 7 Passed: Telegram returns null for unsupported metrics");

    // 8. Google Business Profile (unsupported following)
    const gbp = new GoogleBusinessProvider();
    const gbpProfile = await gbp.getProfile();
    assert.strictEqual(gbpProfile.followersCount, null);
    assert.strictEqual(gbpProfile.followingCount, null);
    assert.strictEqual(gbpProfile.postsCount, null);
    console.log("✔ Test 8 Passed: Google Business Profile returns null for unsupported metrics");

    // 9. Analytics null audit for YouTube
    const ytAnalytics = await yt.getAnalytics("fake_token");
    assert.strictEqual(ytAnalytics.clicks, null, "Unmeasured clicks must be null");
    assert.strictEqual(ytAnalytics.shares, null, "Unmeasured shares must be null");
    assert.strictEqual(ytAnalytics.saves, null, "Unmeasured saves must be null");
    console.log("✔ Test 9 Passed: YouTube Analytics returns null for unmeasured metric channels");

    // 10. Mastodon Analytics returns nulls (no fake 0s)
    const mastodon = new MastodonProvider();
    const mastodonAnalytics = await mastodon.getAnalytics();
    assert.strictEqual(mastodonAnalytics.followers, null, "Mastodon unmeasured followers must be null");
    assert.strictEqual(mastodonAnalytics.impressions, null, "Mastodon unmeasured impressions must be null");
    assert.strictEqual(mastodonAnalytics.reach, null, "Mastodon unmeasured reach must be null");
    assert.strictEqual(mastodonAnalytics.engagementCount, null, "Mastodon unmeasured engagementCount must be null");
    assert.strictEqual(mastodonAnalytics.isCalculated, false, "Mastodon isCalculated must be false");
    console.log("✔ Test 10 Passed: Mastodon Analytics returns null for unmeasured channels (no 0 fallbacks)");

    // 11. Meta Analytics returns null when metric absent in insights
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({ data: [] }),
      } as any;
    };
    const metaAnalytics = await fb.getAnalytics("fake_token", "page123", new Date(), new Date());
    assert.strictEqual(metaAnalytics.impressions, null, "Meta absent impressions must be null");
    assert.strictEqual(metaAnalytics.reach, null, "Meta absent reach must be null");
    assert.strictEqual(metaAnalytics.engagementCount, null, "Meta absent engagementCount must be null");
    console.log("✔ Test 11 Passed: Meta Analytics returns null when insight metrics not present");

    // 12. YouTube syncPostEngagement zero preservation vs missing
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          items: [{
            statistics: {
              viewCount: "0",
              likeCount: "15",
              // commentCount is missing
            }
          }]
        }),
      } as any;
    };
    const ytSync = await yt.syncPostEngagement("fake_token", "video123");
    assert.strictEqual(ytSync.views, 0, "Explicit 0 views must be preserved as 0");
    assert.strictEqual(ytSync.likes, 15, "Explicit 15 likes must be parsed as 15");
    assert.strictEqual(ytSync.comments, null, "Missing commentCount must be null (not 0)");
    console.log("✔ Test 12 Passed: YouTube syncPostEngagement distinguishes 0 from null");

    // 13. Bluesky & Pinterest & LinkedIn Profile null metrics
    const bsky = new BlueskyProvider();
    const bskyAnalytics = await bsky.getAnalytics();
    assert.strictEqual(bskyAnalytics.followers, null);
    assert.strictEqual(bskyAnalytics.impressions, null);

    const pin = new PinterestProvider();
    const pinAnalytics = await pin.getAnalytics();
    assert.strictEqual(pinAnalytics.followers, null);

    const li = new LinkedInProvider();
    const liAnalytics = await li.getAnalytics();
    assert.strictEqual(liAnalytics.followers, null);
    console.log("✔ Test 13 Passed: Bluesky, Pinterest, and LinkedIn analytics return null for unmeasured metrics");

    // 14. Instagram metrics separation (followers_count vs follows_count)
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({ follows_count: 120 }), // followers_count absent
      } as any;
    };
    const ig = new MetaProvider("instagram");
    const igProfile = await ig.getProfile("fake_token", "ig123");
    assert.strictEqual(igProfile.followersCount, null, "Missing followers_count MUST be null, not falling back to follows_count");
    assert.strictEqual(igProfile.followingCount, 120, "follows_count must be mapped to followingCount");
    console.log("✔ Test 14 Passed: Instagram separates followers_count from follows_count without fallback");

    // 15. Facebook Page with no fan_count or followers_count
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({ about: "Tech Company" }),
      } as any;
    };
    const fbMissing = await fb.getProfile("fake_token", "page456");
    assert.strictEqual(fbMissing.followersCount, null, "Missing fan_count and followers_count MUST be null");
    assert.strictEqual(fbMissing.followingCount, null);
    assert.strictEqual(fbMissing.postsCount, null);
    console.log("✔ Test 15 Passed: Facebook Page with missing metrics returns nulls");

    // 16. YouTube malformed non-numeric statistics
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          items: [{ statistics: { subscriberCount: "invalid_num" } }],
        }),
      } as any;
    };
    const ytInvalid = await yt.getProfile("fake_token", "UC_invalid");
    assert.strictEqual(ytInvalid.followersCount, null, "Non-numeric YouTube subscriberCount MUST be null");
    console.log("✔ Test 16 Passed: YouTube non-numeric subscriberCount returns null");
  } finally {
    global.fetch = originalFetch;
  }

  console.log("\nALL 16 SOCIAL METRICS NULL AUDIT TESTS PASSED ✔\n");
}

if (require.main === module) {
  runSocialMetricsNullTest().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
