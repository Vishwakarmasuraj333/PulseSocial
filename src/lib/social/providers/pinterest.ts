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

export class PinterestProvider implements SocialProvider {
  platform: SupportedPlatform = "pinterest";
  displayName = "Pinterest";
  iconName = "pinterest";

  isConfigured(): boolean {
    return Boolean(process.env.PINTEREST_CLIENT_ID && process.env.PINTEREST_CLIENT_SECRET);
  }

  getMissingConfigMessage(): string {
    return "Pinterest integration is not configured yet. Configure PINTEREST_CLIENT_ID and PINTEREST_CLIENT_SECRET to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const scopes = ["boards:read", "pins:read", "pins:write", "user_accounts:read"].join(",");
    const params = new URLSearchParams({
      client_id: process.env.PINTEREST_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      state,
    });

    return `https://www.pinterest.com/oauth/?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const authHeader = Buffer.from(
      `${process.env.PINTEREST_CLIENT_ID}:${process.env.PINTEREST_CLIENT_SECRET}`
    ).toString("base64");

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to exchange authorization code with Pinterest");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
      scopes: (data.scope || "").split(","),
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const res = await fetch("https://api.pinterest.com/v5/user_account", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error("Failed to fetch Pinterest account info");
    const user = await res.json();

    return [
      {
        providerAccountId: user.username || "pinterest_account",
        displayName: user.business_name || user.username || "Pinterest Creator",
        username: user.username,
        profileImageUrl: user.profile_image,
        accountType: "BUSINESS",
      },
    ];
  }

  async getProfile(accessToken: string): Promise<SocialProfileResult> {
    try {
      const res = await fetch("https://api.pinterest.com/v5/user_account", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const user = await res.json();
        return {
          followersCount: user.follower_count || 0,
          followingCount: user.following_count || 0,
          postsCount: user.pin_count || 0,
          bio: user.about,
          websiteUrl: user.website_url,
          raw: user,
        };
      }
    } catch {}
    return {
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    const image = post.mediaUrls?.find((m) => m.type === "IMAGE");
    if (!image) {
      return { success: false, error: "Pinterest requires an image URL to publish a pin." };
    }

    try {
      const res = await fetch("https://api.pinterest.com/v5/pins", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: post.content.slice(0, 100),
          description: post.content,
          media_source: {
            source_type: "image_url",
            url: image.url,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Failed to publish pin to Pinterest" };
      }

      return {
        success: true,
        platformPostId: data.id,
        publishedUrl: `https://pinterest.com/pin/${data.id}`,
      };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || "Failed to connect to Pinterest API" };
    }
  }

  async deletePost(): Promise<boolean> {
    return true;
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
      isCalculated: false,
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
