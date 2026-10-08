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

  getActionCapabilities(): PlatformActionCapabilities {
    return PLATFORM_ACTION_CAPABILITIES.mastodon;
  }

  async likePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const instance = this.resolveInstance(undefined, target.accountId);
      const res = await fetch(`${instance}/api/v1/statuses/${target.externalPostId}/favourite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.favourited) {
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
        error: data.error || "Failed to favourite status on Mastodon",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "LIKE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to Mastodon instance",
      };
    }
  }

  async unlikePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const instance = this.resolveInstance(undefined, target.accountId);
      const res = await fetch(`${instance}/api/v1/statuses/${target.externalPostId}/unfavourite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.favourited === false || res.status === 200)) {
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
        error: data.error || "Failed to unfavourite status on Mastodon",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "UNLIKE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to Mastodon instance",
      };
    }
  }

  async commentPost(accessToken: string, target: { externalPostId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }> {
    try {
      const instance = this.resolveInstance(undefined, target.accountId);
      const res = await fetch(`${instance}/api/v1/statuses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: target.content,
          in_reply_to_id: target.externalPostId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        return {
          success: true,
          actionType: "COMMENT",
          externalActionId: data.id,
          comment: {
            externalCommentId: data.id,
            platform: "mastodon",
            authorName: data.account?.display_name || data.account?.username || "Mastodon User",
            authorUsername: data.account?.username,
            authorAvatarUrl: data.account?.avatar,
            content: target.content,
            postedAt: new Date(data.created_at || Date.now()),
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
        error: data.error || "Failed to post reply on Mastodon",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to Mastodon instance",
      };
    }
  }

  async replyToComment(accessToken: string, target: { externalPostId?: string; externalCommentId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }> {
    return this.commentPost(accessToken, {
      externalPostId: target.externalCommentId,
      accountId: target.accountId,
      content: target.content,
    });
  }

  async repostPost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const instance = this.resolveInstance(undefined, target.accountId);
      const res = await fetch(`${instance}/api/v1/statuses/${target.externalPostId}/reblog`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.reblogged) {
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
        error: data.error || "Failed to boost status on Mastodon",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "REPOST",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to Mastodon instance",
      };
    }
  }

  async savePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const instance = this.resolveInstance(undefined, target.accountId);
      const res = await fetch(`${instance}/api/v1/statuses/${target.externalPostId}/bookmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.bookmarked) {
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
        error: data.error || "Failed to bookmark status on Mastodon",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "SAVE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to Mastodon instance",
      };
    }
  }

  async deleteComment(accessToken: string, target: { externalCommentId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const instance = this.resolveInstance(undefined, target.accountId);
      const res = await fetch(`${instance}/api/v1/statuses/${target.externalCommentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        return {
          success: true,
          actionType: "DELETE_COMMENT",
          externalActionId: target.externalCommentId,
        };
      }

      const isAuth = res.status === 401;
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        actionType: "DELETE_COMMENT",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.error || "Failed to delete status on Mastodon",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "DELETE_COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to Mastodon instance",
      };
    }
  }

  async syncPostEngagement(accessToken: string, externalPostId: string, accountId?: string): Promise<SocialMetricsResult> {
    try {
      const instance = this.resolveInstance(undefined, accountId);
      const res = await fetch(`${instance}/api/v1/statuses/${externalPostId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const isAuth = res.status === 401;
        return {
          success: false,
          platform: "mastodon",
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
          error: data.error || "Failed to fetch Mastodon status metrics",
        };
      }

      const likes = typeof data.favourites_count === "number" ? data.favourites_count : null;
      const reposts = typeof data.reblogs_count === "number" ? data.reblogs_count : null;
      const comments = typeof data.replies_count === "number" ? data.replies_count : null;

      return {
        success: true,
        platform: "mastodon",
        externalPostId,
        likes,
        reactions: likes,
        comments,
        shares: null,
        reposts,
        views: null,
        impressions: null,
        reach: null,
        saves: null,
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        platform: "mastodon",
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
        error: e.message || "Failed to sync Mastodon engagement",
      };
    }
  }

  async fetchPostComments(accessToken: string, externalPostId: string, accountId?: string): Promise<ExternalCommentData[]> {
    try {
      const instance = this.resolveInstance(undefined, accountId);
      const res = await fetch(`${instance}/api/v1/statuses/${externalPostId}/context`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) return [];
      const data = await res.json().catch(() => ({}));
      return (data.descendants || []).map((s: any) => ({
        externalCommentId: s.id,
        platform: "mastodon" as SupportedPlatform,
        authorName: s.account?.display_name || s.account?.username || "Mastodon User",
        authorUsername: s.account?.username,
        authorAvatarUrl: s.account?.avatar,
        content: s.content?.replace(/<[^>]+>/g, "") || "",
        postedAt: s.created_at ? new Date(s.created_at) : new Date(),
        externalPostId,
        likeCount: typeof s.favourites_count === "number" ? s.favourites_count : null,
      }));
    } catch {
      return [];
    }
  }
}
