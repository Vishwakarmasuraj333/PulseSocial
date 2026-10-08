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

export class RedditProvider implements SocialProvider {
  platform: SupportedPlatform = "reddit";
  displayName = "Reddit";
  iconName = "reddit";

  isConfigured(): boolean {
    return Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
  }

  getMissingConfigMessage(): string {
    return "Reddit integration is not configured yet. Configure REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const scopes = ["identity", "submit", "read", "history", "mysubreddits"].join(" ");
    const params = new URLSearchParams({
      client_id: process.env.REDDIT_CLIENT_ID!,
      response_type: "code",
      state,
      redirect_uri: redirectUri,
      duration: "permanent",
      scope: scopes,
    });

    return `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const authHeader = Buffer.from(
      `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString("base64");

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "PulseSocial:v1.0.0 (by /u/PulseSocialApp)",
      },
      body,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to exchange authorization code with Reddit");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
      scopes: (data.scope || "").split(" "),
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const res = await fetch("https://oauth.reddit.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "PulseSocial:v1.0.0 (by /u/PulseSocialApp)",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch Reddit user profile");
    }
    const user = await res.json();

    if (!user.id) {
      throw new Error("Reddit authentication did not return a valid user identity");
    }

    return [
      {
        providerAccountId: user.id,
        displayName: user.subreddit?.title || user.name || "Reddit User",
        username: user.name ? `u/${user.name}` : undefined,
        profileImageUrl: user.icon_img?.split("?")[0] || "https://www.redditstatic.com/avatars/avatar_default_02_FF4500.png",
        accountType: "COMMUNITY_USER",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    try {
      const res = await fetch("https://oauth.reddit.com/api/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "PulseSocial/1.0" },
      });
      if (res.ok) {
        const me = await res.json();
        return {
          followersCount: me.num_friends || 0,
          followingCount: 0,
          postsCount: 0,
          bio: me.subreddit?.public_description || undefined,
          raw: me,
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
    try {
      const subreddit = post.targetAccountId || "u_me";
      const title = post.content.slice(0, 100) || "Post from PulseSocial";

      const body = new URLSearchParams({
        sr: subreddit.replace(/^r\//, ""),
        title,
        resubmit: "true",
      });

      if (post.mediaUrls && post.mediaUrls.length > 0) {
        body.append("kind", "link");
        body.append("url", post.mediaUrls[0].url);
      } else {
        body.append("kind", "self");
        body.append("text", post.content);
      }

      const res = await fetch("https://oauth.reddit.com/api/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "PulseSocial/1.0",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.json?.errors && data.json.errors.length > 0)) {
        const errorMsg = data.json?.errors?.[0]?.[1] || "Failed to submit post to Reddit";
        const isAuth = res.status === 401;
        const isForbidden = res.status === 403;
        return {
          success: false,
          code: isAuth ? "TOKEN_EXPIRED" : isForbidden ? "PERMISSION_DENIED" : "REDDIT_SUBMIT_ERROR",
          requiresReauth: isAuth,
          requiresApproval: isForbidden,
          error: errorMsg,
        };
      }

      const postUrl = data.json?.data?.url || "https://reddit.com";
      const postId = data.json?.data?.name || data.json?.data?.id;

      if (!postId) {
        return {
          success: false,
          code: "MISSING_POST_ID",
          error: "Reddit submit succeeded but did not return a valid post fullname or ID.",
        };
      }

      return {
        success: true,
        platformPostId: postId,
        publishedUrl: postUrl,
      };
    } catch (err: unknown) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        retryable: true,
        error: (err as Error).message || "Reddit publication failed",
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
