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

  private resolveInstance(options?: Record<string, any>, targetId?: string): string {
    if (options?.instanceUrl && typeof options.instanceUrl === "string") {
      return options.instanceUrl.replace(/\/+$/, "");
    }
    if (targetId && targetId.includes("@")) {
      const parts = targetId.split("@");
      const host = parts[parts.length - 1];
      if (host && host.includes(".")) {
        return `https://${host}`;
      }
    }
    return (process.env.MASTODON_INSTANCE_URL || "https://mastodon.social").replace(/\/+$/, "");
  }

  isConfigured(): boolean {
    return Boolean(process.env.MASTODON_CLIENT_ID && process.env.MASTODON_CLIENT_SECRET);
  }

  getMissingConfigMessage(): string {
    return "Mastodon integration is not configured yet. Configure MASTODON_CLIENT_ID and MASTODON_CLIENT_SECRET in your environment to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string, codeVerifier?: string, options?: Record<string, any>): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const instance = this.resolveInstance(options);
    const scopes = "read write follow";
    const params = new URLSearchParams({
      client_id: process.env.MASTODON_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      state,
    });

    return `${instance}/oauth/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string, codeVerifier?: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const instance = this.resolveInstance();
    const body = new URLSearchParams({
      client_id: process.env.MASTODON_CLIENT_ID!,
      client_secret: process.env.MASTODON_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code,
      scope: "read write follow",
    });

    const res = await fetch(`${instance}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || "Failed to exchange code with Mastodon");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      scopes: (data.scope || "").split(" "),
      metadata: { instanceUrl: instance },
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const instance = this.resolveInstance();
    const res = await fetch(`${instance}/api/v1/accounts/verify_credentials`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error("Failed to verify Mastodon credentials");
    const account = await res.json();
    const host = new URL(instance).host;

    return [
      {
        providerAccountId: `${account.id}@${host}`,
        displayName: account.display_name || account.username,
        username: `@${account.acct}@${host}`,
        profileImageUrl: account.avatar,
        accountType: "PROFILE",
        metadata: { instanceUrl: instance },
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    const instance = this.resolveInstance(undefined, accountId);
    const rawId = accountId.split("@")[0] || accountId;
    const res = await fetch(`${instance}/api/v1/accounts/${rawId}`);
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
    const instance = this.resolveInstance(undefined, post.targetAccountId);
    const res = await fetch(`${instance}/api/v1/statuses`, {
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
    const instance = this.resolveInstance();
    const res = await fetch(`${instance}/api/v1/statuses/${platformPostId}`, {
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
