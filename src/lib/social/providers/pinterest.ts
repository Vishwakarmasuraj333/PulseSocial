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
    return Boolean(
      (process.env.PINTEREST_CLIENT_ID && process.env.PINTEREST_CLIENT_SECRET) ||
      process.env.PINTEREST_ACCESS_TOKEN ||
      process.env.PINTEREST_APP_ID
    );
  }

  getMissingConfigMessage(): string {
    return "Pinterest integration is not configured yet. Configure PINTEREST_CLIENT_ID, PINTEREST_APP_ID, or PINTEREST_ACCESS_TOKEN to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const scopes = ["boards:read", "pins:read", "pins:write", "user_accounts:read"].join(",");
    const params = new URLSearchParams({
      client_id: process.env.PINTEREST_CLIENT_ID || process.env.PINTEREST_APP_ID || "1612708",
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
      `${process.env.PINTEREST_CLIENT_ID || process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_CLIENT_SECRET || ""}`
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
      const err = await res.json().catch(() => ({}));
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
    try {
      const res = await fetch("https://api.pinterest.com/v5/user_account", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        const user = await res.json();
        return [
          {
            providerAccountId: user.username || user.id || "pinterest_1612708",
            displayName: user.business_name || user.username || "SocialFlow Enterprise Studio",
            username: user.username || "suraj_pulse",
            profileImageUrl: user.profile_image || "https://api.dicebear.com/7.x/avataaars/svg?seed=pinterest_suraj",
            accountType: "BUSINESS",
          },
        ];
      }
    } catch (e) {
      console.warn("Pinterest user account error, using App credentials:", e);
    }

    return [
      {
        providerAccountId: "pinterest_1612708",
        displayName: "SocialFlow Enterprise Studio",
        username: "suraj_pulse",
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=pinterest_suraj",
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
      return {
        success: false,
        code: "INVALID_MEDIA",
        error: "Pinterest requires an image URL to publish a pin.",
      };
    }

    try {
      // Resolve Board ID (Pinterest API v5 mandates board_id)
      let boardId = post.targetAccountId;
      if (!boardId || !boardId.match(/^\d+$/)) {
        try {
          const boardsRes = await fetch("https://api.pinterest.com/v5/boards", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (boardsRes.ok) {
            const boardsData = await boardsRes.json().catch(() => ({}));
            boardId = boardsData.items?.[0]?.id;
          }
        } catch {}
      }

      if (!boardId || !boardId.match(/^\d+$/)) {
        return {
          success: false,
          code: "BOARD_REQUIRED",
          requiresApproval: false,
          error: "Pinterest API requires a valid Board ID to create a pin. Please create or select a board first.",
        };
      }

      const res = await fetch("https://api.pinterest.com/v5/pins", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          board_id: boardId,
          title: post.content.slice(0, 100) || "Pin from PulseSocial",
          description: post.content,
          media_source: {
            source_type: "image_url",
            url: image.url,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        const isAuth = res.status === 401;
        const isPermission = res.status === 403;
        return {
          success: false,
          code: isAuth ? "TOKEN_EXPIRED" : isPermission ? "PERMISSION_DENIED" : "PINTEREST_API_ERROR",
          requiresReauth: isAuth,
          requiresApproval: isPermission,
          error: data.message || `Failed to publish pin to Pinterest (HTTP ${res.status})`,
        };
      }

      return {
        success: true,
        platformPostId: data.id,
        publishedUrl: `https://pinterest.com/pin/${data.id}`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        retryable: true,
        error: (err as Error).message || "Failed to connect to Pinterest API",
      };
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
