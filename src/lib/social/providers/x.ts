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
  PlatformActionCapabilities,
  PLATFORM_ACTION_CAPABILITIES,
  SocialActionResult,
  SocialMetricsResult,
  ExternalCommentData,
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

  async refreshToken(refreshToken: string): Promise<OAuthTokenResult> {
    const clientId = process.env.X_CLIENT_ID || "";
    const clientSecret = process.env.X_CLIENT_SECRET || "";

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (clientSecret) {
      headers["Authorization"] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    });

    const res = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers,
      body,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || err.error || "Failed to refresh X OAuth token");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token || refreshToken,
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
      return { followersCount: null, followingCount: null, postsCount: null };
    }
    const json = await res.json();
    const metrics = json.data?.public_metrics || {};

    return {
      followersCount: metrics.followers_count != null ? metrics.followers_count : null,
      followingCount: metrics.following_count != null ? metrics.following_count : null,
      postsCount: metrics.tweet_count != null ? metrics.tweet_count : null,
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
              followers: metrics.followers_count != null ? metrics.followers_count : null,
              impressions: null,
              reach: null,
              engagementCount: null,
              engagementRate: null,
              clicks: null,
              shares: null,
              saves: null,
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
      followers: null,
      impressions: null,
      reach: null,
      engagementCount: null,
      engagementRate: null,
      clicks: null,
      shares: null,
      saves: null,
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

  getActionCapabilities(): PlatformActionCapabilities {
    return PLATFORM_ACTION_CAPABILITIES.x;
  }

  private async resolveUserId(accessToken: string, accountId?: string): Promise<string> {
    if (accountId && /^\d+$/.test(accountId)) return accountId;
    try {
      const res = await fetch("https://api.twitter.com/2/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.id || accountId || "";
      }
    } catch {}
    return accountId || "";
  }

  async likePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const userId = await this.resolveUserId(accessToken, target.accountId);
      const res = await fetch(`https://api.twitter.com/2/users/${userId}/likes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweet_id: target.externalPostId }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.data?.liked) {
        return {
          success: true,
          actionType: "LIKE",
          externalActionId: target.externalPostId,
          rawResponse: data,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "LIKE",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.detail || data.title || "Failed to like tweet on X",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "LIKE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to X API",
      };
    }
  }

  async unlikePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const userId = await this.resolveUserId(accessToken, target.accountId);
      const res = await fetch(`https://api.twitter.com/2/users/${userId}/likes/${target.externalPostId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.data?.liked === false || res.status === 200)) {
        return {
          success: true,
          actionType: "UNLIKE",
          rawResponse: data,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "UNLIKE",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.detail || data.title || "Failed to unlike tweet on X",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "UNLIKE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to X API",
      };
    }
  }

  async commentPost(accessToken: string, target: { externalPostId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }> {
    try {
      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: target.content,
          reply: { in_reply_to_tweet_id: target.externalPostId },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.data?.id) {
        return {
          success: true,
          actionType: "COMMENT",
          externalActionId: data.data.id,
          comment: {
            externalCommentId: data.data.id,
            platform: "x",
            authorName: "X User",
            content: target.content,
            postedAt: new Date(),
            externalPostId: target.externalPostId,
          },
          rawResponse: data,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "COMMENT",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.detail || data.title || "Failed to post reply on X",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to X API",
      };
    }
  }

  async replyToComment(accessToken: string, target: { externalPostId?: string; externalCommentId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }> {
    try {
      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: target.content,
          reply: { in_reply_to_tweet_id: target.externalCommentId },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.data?.id) {
        return {
          success: true,
          actionType: "REPLY",
          externalActionId: data.data.id,
          comment: {
            externalCommentId: data.data.id,
            platform: "x",
            authorName: "X User",
            content: target.content,
            postedAt: new Date(),
            externalPostId: target.externalPostId,
            parentId: target.externalCommentId,
          },
          rawResponse: data,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "REPLY",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.detail || data.title || "Failed to reply to tweet on X",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "REPLY",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to X API",
      };
    }
  }

  async repostPost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const userId = await this.resolveUserId(accessToken, target.accountId);
      const res = await fetch(`https://api.twitter.com/2/users/${userId}/retweets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweet_id: target.externalPostId }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.data?.retweeted) {
        return {
          success: true,
          actionType: "REPOST",
          externalActionId: target.externalPostId,
          rawResponse: data,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "REPOST",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.detail || data.title || "Failed to retweet post on X",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "REPOST",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to X API",
      };
    }
  }

  async savePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const userId = await this.resolveUserId(accessToken, target.accountId);
      const res = await fetch(`https://api.twitter.com/2/users/${userId}/bookmarks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweet_id: target.externalPostId }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.data?.bookmarked) {
        return {
          success: true,
          actionType: "SAVE",
          externalActionId: target.externalPostId,
          rawResponse: data,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "SAVE",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.detail || data.title || "Failed to bookmark tweet on X",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "SAVE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to X API",
      };
    }
  }

  async deleteComment(accessToken: string, target: { externalCommentId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const res = await fetch(`https://api.twitter.com/2/tweets/${target.externalCommentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.data?.deleted) {
        return {
          success: true,
          actionType: "DELETE_COMMENT",
          externalActionId: target.externalCommentId,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "DELETE_COMMENT",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.detail || data.title || "Failed to delete tweet on X",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "DELETE_COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to X API",
      };
    }
  }

  async hideComment(accessToken: string, target: { externalCommentId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const res = await fetch(`https://api.twitter.com/2/tweets/${target.externalCommentId}/hidden`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hidden: true }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.data?.hidden) {
        return {
          success: true,
          actionType: "HIDE_COMMENT",
          externalActionId: target.externalCommentId,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "HIDE_COMMENT",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.detail || data.title || "Failed to hide reply on X",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "HIDE_COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to X API",
      };
    }
  }

  async syncPostEngagement(accessToken: string, externalPostId: string): Promise<SocialMetricsResult> {
    try {
      const res = await fetch(
        `https://api.twitter.com/2/tweets/${externalPostId}?tweet.fields=public_metrics,non_public_metrics`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const isAuth = res.status === 401;
        return {
          success: false,
          platform: "x",
          externalPostId,
          likes: null,
          reactions: null,
          comments: null,
          shares: null,
          reposts: null,
          views: null,
          impressions: null,
          reach: null,
          saves: null,
          requiresReauth: isAuth,
          error: data.detail || data.title || "Failed to fetch X tweet metrics",
        };
      }

      const m = data.data?.public_metrics || {};
      const likes = typeof m.like_count === "number" ? m.like_count : null;
      const comments = typeof m.reply_count === "number" ? m.reply_count : null;
      const reposts = typeof m.retweet_count === "number" ? m.retweet_count : null;
      const impressions = typeof m.impression_count === "number" ? m.impression_count : null;
      const saves = typeof m.bookmark_count === "number" ? m.bookmark_count : null;

      return {
        success: true,
        platform: "x",
        externalPostId,
        likes,
        reactions: likes,
        comments,
        shares: null,
        reposts,
        views: impressions,
        impressions,
        reach: null,
        saves,
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        platform: "x",
        externalPostId,
        likes: null,
        reactions: null,
        comments: null,
        shares: null,
        reposts: null,
        views: null,
        impressions: null,
        reach: null,
        saves: null,
        error: e.message || "Failed to sync X engagement",
      };
    }
  }

  async fetchPostComments(accessToken: string, externalPostId: string): Promise<ExternalCommentData[]> {
    try {
      const res = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${externalPostId}&tweet.fields=author_id,created_at,public_metrics&expansions=author_id&user.fields=username,name,profile_image_url`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) return [];
      const data = await res.json().catch(() => ({}));
      const usersMap = new Map<string, any>();
      (data.includes?.users || []).forEach((u: any) => usersMap.set(u.id, u));

      return (data.data || []).map((t: any) => {
        const author = usersMap.get(t.author_id);
        return {
          externalCommentId: t.id,
          platform: "x" as SupportedPlatform,
          authorName: author?.name || "X User",
          authorUsername: author?.username,
          authorAvatarUrl: author?.profile_image_url,
          content: t.text || "",
          postedAt: t.created_at ? new Date(t.created_at) : new Date(),
          externalPostId,
          likeCount: typeof t.public_metrics?.like_count === "number" ? t.public_metrics.like_count : null,
        };
      });
    } catch {
      return [];
    }
  }
}
