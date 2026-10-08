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

import crypto from "crypto";

export class XProvider implements SocialProvider {
  platform: SupportedPlatform = "x";
  displayName = "X (Twitter)";
  iconName = "x";

  private getCredentials() {
    return {
      clientId: process.env.X_CLIENT_ID || process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.X_CLIENT_SECRET || process.env.TWITTER_CLIENT_SECRET || "",
    };
  }

  isConfigured(): boolean {
    const { clientId, clientSecret } = this.getCredentials();
    return Boolean(clientId && clientSecret);
  }

  getMissingConfigMessage(): string {
    return "X integration is not configured yet. Configure X_CLIENT_ID (or TWITTER_CLIENT_ID) and X_CLIENT_SECRET in your environment.";
  }

  getAuthorizationUrl(state: string, redirectUri: string, codeVerifier?: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const { clientId } = this.getCredentials();
    const verifier = codeVerifier || state;
    const challenge = crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url");

    const scopes = ["tweet.read", "tweet.write", "users.read", "offline.access"].join(" ");
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    return `https://x.com/i/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string, codeVerifier?: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const { clientId, clientSecret } = this.getCredentials();
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // Standard RFC 6749 confidential client body (no duplicate client_id when Basic auth header is present)
    const body = new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: codeVerifier || "",
    });

    let res = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      // Fallback for public client or body-based client credentials
      const fallbackBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: codeVerifier || "",
      });

      const fallbackRes = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: fallbackBody,
      });

      if (fallbackRes.ok) {
        res = fallbackRes;
      } else {
        let errDesc = "Failed to exchange authorization code with X";
        try {
          const errData = await res.json();
          errDesc = errData.error_description || errData.error || errDesc;
        } catch {
          // keep default error description
        }
        throw new Error(errDesc);
      }
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
    const res = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url,description,public_metrics", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error("Failed to fetch X user profile");
    const json = await res.json();
    const user = json.data;

    return [
      {
        providerAccountId: user.id,
        displayName: user.name,
        username: user.username,
        profileImageUrl: user.profile_image_url,
        accountType: "PROFILE",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    const res = await fetch(`https://api.twitter.com/2/users/${accountId}?user.fields=public_metrics,description`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return { followersCount: 0, followingCount: 0, postsCount: 0 };
    }
    const json = await res.json();
    const metrics = json.data?.public_metrics || {};

    return {
      followersCount: metrics.followers_count || 0,
      followingCount: metrics.following_count || 0,
      postsCount: metrics.tweet_count || 0,
      bio: json.data?.description,
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    try {
      if (post.content.length > 280) {
        return {
          success: false,
          code: "CHAR_LIMIT_EXCEEDED",
          error: "X post exceeds the strict 280-character limit.",
        };
      }

      let tweetText = post.content;
      // In X API v2, media URLs are included as links unless uploaded via v1.1 media upload endpoint
      if (post.mediaUrls && post.mediaUrls.length > 0) {
        const mediaLinks = post.mediaUrls.map((m) => m.url).join(" ");
        if (!tweetText.includes(post.mediaUrls[0].url) && tweetText.length + mediaLinks.length + 1 <= 280) {
          tweetText = `${tweetText} ${mediaLinks}`;
        }
      }

      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: tweetText }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.data?.id) {
        const status = res.status;
        const isRateLimit = status === 429;
        const isAuth = status === 401;
        const isForbidden = status === 403;

        return {
          success: false,
          code: isRateLimit
            ? "RATE_LIMITED"
            : isAuth
            ? "TOKEN_EXPIRED"
            : isForbidden
            ? "TIER_RESTRICTION"
            : "X_API_ERROR",
          retryable: isRateLimit,
          requiresReauth: isAuth,
          requiresApproval: isForbidden,
          error:
            data.detail ||
            data.title ||
            `Failed to publish tweet to X (HTTP ${status}). Check write permissions & monthly tweet caps.`,
        };
      }

      return {
        success: true,
        platformPostId: data.data.id,
        publishedUrl: `https://x.com/i/status/${data.data.id}`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        retryable: true,
        error: (err as Error).message || "X API network failure",
      };
    }
  }

  async deletePost(accessToken: string, platformPostId: string): Promise<boolean> {
    const res = await fetch(`https://api.twitter.com/2/tweets/${platformPostId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok;
  }

  async getAnalytics(accessToken?: string): Promise<AnalyticsResult> {
    if (accessToken) {
      try {
        const res = await fetch("https://api.twitter.com/2/users/me?user.fields=public_metrics", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          const metrics = data.data?.public_metrics;
          if (metrics) {
            return {
              followers: metrics.followers_count || 0,
              impressions: 0,
              reach: metrics.followers_count || 0,
              engagementCount: 0,
              engagementRate: 0,
              clicks: 0,
              shares: 0,
              saves: 0,
              isCalculated: false,
              rawJson: JSON.stringify(metrics),
            };
          }
        }
      } catch (e) {
        console.error("X analytics fetch failed:", e);
      }
    }
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
