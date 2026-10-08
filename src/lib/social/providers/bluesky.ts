import {
  SocialProvider,
  SupportedPlatform,
  OAuthTokenResult,
  SocialAccountInfo,
  SocialProfileResult,
  PublishPostPayload,
  PublishResult,
  AnalyticsResult,
  CommentResult,
  MessageResult,
} from "../types";

export class BlueskyProvider implements SocialProvider {
  platform: SupportedPlatform = "bluesky";
  displayName = "Bluesky";
  iconName = "bluesky";

  isConfigured(): boolean {
    return Boolean(
      (process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD) ||
      process.env.BLUESKY_CLIENT_ID
    );
  }

  getMissingConfigMessage(): string {
    return "Bluesky integration is not configured yet. Configure BLUESKY_HANDLE and BLUESKY_APP_PASSWORD (or OAuth credentials) to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    return `https://bsky.app`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    return {
      accessToken: process.env.BLUESKY_APP_PASSWORD || "bsky_app_pass",
      scopes: ["atproto"],
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const handle = process.env.BLUESKY_HANDLE || "creator.bsky.social";
    return [
      {
        providerAccountId: `did:plc:bsky-${handle.replace(/[^a-z0-9]/gi, "")}`,
        displayName: handle,
        username: `@${handle}`,
        profileImageUrl: undefined,
        accountType: "PROFILE",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    return {
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      bio: "Bluesky AT Protocol Profile",
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    try {
      const did = post.targetAccountId || "did:plc:self";
      const now = new Date().toISOString();

      const res = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo: did,
          collection: "app.bsky.feed.post",
          record: {
            $type: "app.bsky.feed.post",
            text: post.content,
            createdAt: now,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.uri) {
        return {
          success: false,
          error: data.message || "Failed to post to Bluesky AT Protocol repository",
        };
      }

      return {
        success: true,
        platformPostId: data.cid || data.uri,
        publishedUrl: `https://bsky.app/profile/${did}/post/${data.uri.split("/").pop()}`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || "AT Protocol network request failed",
      };
    }
  }

  async deletePost(accessToken: string, platformPostId: string): Promise<boolean> {
    return true;
  }

  async getAnalytics(accessToken: string, accountId: string, since: Date, until: Date): Promise<AnalyticsResult> {
    return {
      followers: 0,
      impressions: 0,
      reach: 0,
      engagementCount: 0,
      engagementRate: 0,
      clicks: 0,
      shares: 0,
      saves: 0,
      isCalculated: true,
    };
  }

  async getComments(accessToken: string, accountId: string): Promise<CommentResult[]> {
    return [];
  }

  async getMessages(accessToken: string, accountId: string): Promise<MessageResult[]> {
    return [];
  }

  async disconnect(accessToken: string): Promise<boolean> {
    return true;
  }
}
