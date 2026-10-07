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

export class MastodonProvider implements SocialProvider {
  platform: SupportedPlatform = "mastodon";
  displayName = "Mastodon";
  iconName = "mastodon";

  private defaultInstance = "https://mastodon.social";

  isConfigured(): boolean {
    return Boolean(process.env.MASTODON_CLIENT_ID && process.env.MASTODON_CLIENT_SECRET);
  }

  getMissingConfigMessage(): string {
    return "Mastodon integration is not configured yet. Configure MASTODON_CLIENT_ID and MASTODON_CLIENT_SECRET to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const scopes = "read write follow";
    const params = new URLSearchParams({
      client_id: process.env.MASTODON_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      state,
    });

    return `${this.defaultInstance}/oauth/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const body = new URLSearchParams({
      client_id: process.env.MASTODON_CLIENT_ID!,
      client_secret: process.env.MASTODON_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code,
      scope: "read write follow",
    });

    const res = await fetch(`${this.defaultInstance}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error_description || "Failed to exchange code with Mastodon");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      scopes: (data.scope || "").split(" "),
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const res = await fetch(`${this.defaultInstance}/api/v1/accounts/verify_credentials`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error("Failed to verify Mastodon credentials");
    const account = await res.json();

    return [
      {
        providerAccountId: account.id,
        displayName: account.display_name || account.username,
        username: `@${account.acct}@mastodon.social`,
        profileImageUrl: account.avatar,
        accountType: "PROFILE",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    const res = await fetch(`${this.defaultInstance}/api/v1/accounts/${accountId}`);
    if (!res.ok) {
      return { followersCount: 0, followingCount: 0, postsCount: 0 };
    }
    const acc = await res.json();
    return {
      followersCount: acc.followers_count || 0,
      followingCount: acc.following_count || 0,
      postsCount: acc.statuses_count || 0,
      bio: acc.note,
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    const res = await fetch(`${this.defaultInstance}/api/v1/statuses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: post.content }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to post to Mastodon" };
    }

    return {
      success: true,
      platformPostId: data.id,
      publishedUrl: data.url,
    };
  }

  async deletePost(accessToken: string, platformPostId: string): Promise<boolean> {
    const res = await fetch(`${this.defaultInstance}/api/v1/statuses/${platformPostId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok;
  }

  async getAnalytics(): Promise<AnalyticsResult> {
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

  async getComments(): Promise<CommentResult[]> {
    return [];
  }

  async getMessages(): Promise<MessageResult[]> {
    return [];
  }

  async disconnect(): Promise<boolean> {
    return true;
  }
}
