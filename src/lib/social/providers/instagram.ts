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
} from "../types";
import { SOCIAL_API_VERSIONS } from "../api-versions";

/**
 * Official InstagramProvider implementing Meta's Business Login for Instagram
 * / Instagram API with Instagram Login.
 *
 * Requirements & Constraints:
 * 1. Authorization Endpoint: https://www.instagram.com/oauth/authorize
 * 2. enable_fb_login=0: Strictly disables Facebook login fallback, ensuring direct Instagram authentication.
 * 3. Scopes: instagram_business_basic, instagram_business_content_publish, instagram_business_manage_messages,
 *    instagram_business_manage_comments, instagram_business_manage_insights
 * 4. Code exchange on https://api.instagram.com/oauth/access_token
 * 5. 60-day long-lived token exchange on https://graph.instagram.com/access_token?grant_type=ig_exchange_token
 * 6. Profile & accounts fetched from https://graph.instagram.com/v21.0/me
 * 7. Zero Facebook dialog OAuth URLs or Facebook logins allowed in this flow.
 */
export class InstagramProvider implements SocialProvider {
  platform: SupportedPlatform = "instagram";
  displayName = "Instagram";
  iconName = "instagram";

  private getApiVersion(): string {
    return process.env.INSTAGRAM_API_VERSION || process.env.META_API_VERSION || SOCIAL_API_VERSIONS.META_GRAPH || "v21.0";
  }

  private getAppCredentials(): { appId: string; appSecret: string } {
    const appId = (
      process.env.INSTAGRAM_APP_ID ||
      process.env.INSTAGRAM_CLIENT_ID ||
      process.env.META_APP_ID ||
      ""
    ).trim();

    const appSecret = (
      process.env.INSTAGRAM_APP_SECRET ||
      process.env.INSTAGRAM_CLIENT_SECRET ||
      process.env.META_APP_SECRET ||
      ""
    ).trim();

    if (!appId || !appSecret) {
      throw new Error(this.getMissingConfigMessage());
    }

    return { appId, appSecret };
  }

  isConfigured(): boolean {
    const appId = (
      process.env.INSTAGRAM_APP_ID ||
      process.env.INSTAGRAM_CLIENT_ID ||
      process.env.META_APP_ID ||
      ""
    ).trim();

    const appSecret = (
      process.env.INSTAGRAM_APP_SECRET ||
      process.env.INSTAGRAM_CLIENT_SECRET ||
      process.env.META_APP_SECRET ||
      ""
    ).trim();

    return Boolean(appId && appSecret);
  }

  getMissingConfigMessage(): string {
    return "Instagram integration is not configured. Configure INSTAGRAM_APP_ID (or META_APP_ID) and INSTAGRAM_APP_SECRET (or META_APP_SECRET) in your environment variables.";
  }

  getAuthUrl(state: string, redirectUri: string): string {
    return this.getAuthorizationUrl(state, redirectUri);
  }

  /**
   * Generates the official direct Instagram authorization URL.
   * NEVER opens or redirects to facebook.com/dialog/oauth.
   */
  getAuthorizationUrl(
    state: string,
    redirectUri: string,
    _codeVerifier?: string,
    _options?: Record<string, any>
  ): string {
    const { appId } = this.getAppCredentials();

    // Meta's official scopes for Instagram Login with Professional Accounts
    const defaultScopes = [
      "instagram_business_basic",
      "instagram_business_content_publish",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "instagram_business_manage_insights",
    ].join(",");

    const scopes = process.env.INSTAGRAM_SCOPES?.trim() || defaultScopes;

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      state,
      // Official Meta parameter: enable_fb_login=0 ensures ONLY Instagram login is presented,
      // preventing redirection to personal Facebook login screens.
      enable_fb_login: "0",
      force_authentication: "1",
    });

    return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchanges an authorization code for an Instagram access token:
   * 1. Short-lived token via https://api.instagram.com/oauth/access_token
   * 2. 60-day long-lived token via https://graph.instagram.com/access_token?grant_type=ig_exchange_token
   */
  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    const { appId, appSecret } = this.getAppCredentials();

    // Instagram redirects append '#_' to the authorization code in the URL
    const sanitizedCode = (code || "").replace(/#_$/, "").trim();
    if (!sanitizedCode) {
      throw new Error("Missing or invalid authorization code from Instagram OAuth callback.");
    }

    // Step 1: Exchange code for short-lived access token
    const tokenUrl = "https://api.instagram.com/oauth/access_token";
    const bodyParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code: sanitizedCode,
    });

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg =
        err.error_message ||
        err.error?.message ||
        err.message ||
        "Failed to exchange authorization code with Instagram API.";
      throw new Error(msg);
    }

    const shortLivedData = await res.json();
    const shortLivedToken = shortLivedData.access_token;
    const userId = shortLivedData.user_id ? String(shortLivedData.user_id) : undefined;

    if (!shortLivedToken || typeof shortLivedToken !== "string") {
      throw new Error("Instagram OAuth exchange did not return a valid access token.");
    }

    // Step 2: Exchange for long-lived 60-day Instagram access token
    let finalToken = shortLivedToken;
    let expiresIn = 5184000; // 60 days default
    let isLongLived = false;

    try {
      const exchangeUrl = new URL("https://graph.instagram.com/access_token");
      exchangeUrl.searchParams.set("grant_type", "ig_exchange_token");
      exchangeUrl.searchParams.set("client_secret", appSecret);
      exchangeUrl.searchParams.set("access_token", shortLivedToken);

      const longLivedRes = await fetch(exchangeUrl.toString(), {
        headers: { Accept: "application/json" },
      });

      if (longLivedRes.ok) {
        const longLivedData = await longLivedRes.json();
        if (longLivedData.access_token) {
          finalToken = longLivedData.access_token;
          expiresIn = typeof longLivedData.expires_in === "number" ? longLivedData.expires_in : 5184000;
          isLongLived = true;
        }
      }
    } catch (exchangeErr) {
      console.warn("Instagram long-lived token exchange warning, falling back to short-lived token:", exchangeErr);
    }

    const grantedScopes = [
      "instagram_business_basic",
      "instagram_business_content_publish",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "instagram_business_manage_insights",
    ];

    return {
      accessToken: finalToken,
      expiresIn,
      scopes: grantedScopes,
      metadata: {
        userId,
        tokenType: "Bearer",
        isLongLived,
        connectedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Refreshes a long-lived Instagram access token before it expires.
   * Long-lived tokens can be refreshed if they are at least 24 hours old and not yet expired.
   */
  async refreshToken(currentAccessToken: string): Promise<OAuthTokenResult> {
    const refreshUrl = new URL("https://graph.instagram.com/refresh_access_token");
    refreshUrl.searchParams.set("grant_type", "ig_refresh_token");
    refreshUrl.searchParams.set("access_token", currentAccessToken);

    const res = await fetch(refreshUrl.toString(), {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || "Failed to refresh Instagram access token.");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 5184000,
      scopes: [
        "instagram_business_basic",
        "instagram_business_content_publish",
        "instagram_business_manage_messages",
        "instagram_business_manage_comments",
        "instagram_business_manage_insights",
      ],
      metadata: { tokenType: "Bearer", refreshedAt: new Date().toISOString() },
    };
  }

  /**
   * Fetches official authenticated Instagram Professional / Business account details
   * from graph.instagram.com/v21.0/me.
   */
  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    if (!accessToken || typeof accessToken !== "string" || accessToken.trim() === "") {
      throw new Error("Missing valid authorization token for Instagram Graph API");
    }

    const version = this.getApiVersion();
    const primaryUrl = `https://graph.instagram.com/${version}/me?fields=id,username,name,account_type,profile_picture_url,followers_count,media_count&access_token=${encodeURIComponent(
      accessToken
    )}`;

    let res = await fetch(primaryUrl, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      // Fallback without version prefix
      const fallbackUrl = `https://graph.instagram.com/me?fields=id,username,name,account_type,profile_picture_url,followers_count,media_count&access_token=${encodeURIComponent(
        accessToken
      )}`;
      res = await fetch(fallbackUrl, {
        headers: { Accept: "application/json" },
      });
    }

    if (!res.ok) {
      // Basic fallback fields in case permissions for extended fields (name, insights) are not granted
      const basicUrl = `https://graph.instagram.com/me?fields=id,username,account_type,profile_picture_url&access_token=${encodeURIComponent(
        accessToken
      )}`;
      res = await fetch(basicUrl, {
        headers: { Accept: "application/json" },
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || "Failed to fetch Instagram account details from graph.instagram.com.";
      throw new Error(msg);
    }

    const data = await res.json();
    if (!data.id) {
      throw new Error("Instagram API did not return a valid user ID for this account.");
    }

    const accountType = data.account_type || "BUSINESS";
    const displayName = data.name || data.username || "Instagram Professional";

    return [
      {
        providerAccountId: String(data.id),
        displayName,
        username: data.username || undefined,
        profileImageUrl: data.profile_picture_url || undefined,
        accountType,
        platform: "instagram",
        metadata: {
          instagramUserId: String(data.id),
          accountType,
          followersCount: typeof data.followers_count === "number" ? data.followers_count : null,
          mediaCount: typeof data.media_count === "number" ? data.media_count : null,
          connectedVia: "instagram_login_for_business",
        },
      },
    ];
  }

  /**
   * Fetches the user profile metrics (followers, bio, posts).
   */
  async getProfile(accessToken: string, _accountId: string): Promise<SocialProfileResult> {
    if (!accessToken || typeof accessToken !== "string" || accessToken.trim() === "") {
      return { followersCount: null, followingCount: null, postsCount: null };
    }

    const version = this.getApiVersion();
    try {
      let res = await fetch(
        `https://graph.instagram.com/${version}/me?fields=id,username,name,biography,website,profile_picture_url,followers_count,follows_count,media_count&access_token=${encodeURIComponent(
          accessToken
        )}`,
        { headers: { Accept: "application/json" } }
      );

      if (!res.ok) {
        res = await fetch(
          `https://graph.instagram.com/me?fields=id,username,followers_count,follows_count,media_count&access_token=${encodeURIComponent(
            accessToken
          )}`,
          { headers: { Accept: "application/json" } }
        );
      }

      if (!res.ok) {
        return { followersCount: null, followingCount: null, postsCount: null };
      }

      const data = await res.json();
      return {
        followersCount: data.followers_count != null ? data.followers_count : null,
        followingCount: data.follows_count != null ? data.follows_count : null,
        postsCount: data.media_count != null ? data.media_count : null,
        bio: data.biography || undefined,
        websiteUrl: data.website || undefined,
        raw: data,
      };
    } catch {
      return { followersCount: null, followingCount: null, postsCount: null };
    }
  }

  /**
   * Polls an Instagram media container until status is FINISHED or ERROR.
   */
  async waitForContainerReady(
    creationId: string,
    accessToken: string,
    maxAttempts = 10,
    initialDelayMs = 1500
  ): Promise<{ ready: boolean; error?: string; code?: string; rawResponse?: any }> {
    const version = this.getApiVersion();
    let attempts = 0;
    let delayMs = initialDelayMs;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, delayMs));
      attempts++;
      delayMs = Math.min(delayMs * 1.2, 4000);

      const statusRes = await fetch(
        `https://graph.instagram.com/${version}/${creationId}?fields=status_code,status&access_token=${encodeURIComponent(
          accessToken
        )}`
      );
      const statusData = await statusRes.json().catch(() => ({}));

      if (statusData.status_code === "FINISHED") {
        return { ready: true, rawResponse: statusData };
      } else if (statusData.status_code === "ERROR") {
        return {
          ready: false,
          code: "MEDIA_PROCESSING_FAILED",
          error:
            statusData.status ||
            "Instagram media processing failed. Ensure the image meets Instagram aspect ratio (4:5 to 1.91:1) and dimensions.",
          rawResponse: statusData,
        };
      } else if (statusData.status_code === "EXPIRED") {
        return {
          ready: false,
          code: "CONTAINER_EXPIRED",
          error: "Instagram media container expired before it could be published. Please retry.",
          rawResponse: statusData,
        };
      }
    }

    return {
      ready: false,
      code: "PROCESSING_TIMEOUT",
      error: "Instagram media processing timed out before publication could complete. Please retry in a few moments.",
    };
  }

  /**
   * Publishes content to Instagram via the official 2-step media container workflow
   * on graph.instagram.com.
   */
  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    const version = this.getApiVersion();
    const targetAccountId = post.targetAccountId || "me";

    if (!post.mediaUrls || post.mediaUrls.length === 0) {
      return {
        success: false,
        code: "INVALID_MEDIA",
        error: "Instagram Graph API requires at least one image or video to publish a post.",
      };
    }

    const firstMedia = post.mediaUrls[0];
    if (
      firstMedia.url.startsWith("blob:") ||
      firstMedia.url.startsWith("data:") ||
      firstMedia.url.startsWith("file:")
    ) {
      return {
        success: false,
        code: "INVALID_MEDIA_URL",
        error: "Cannot publish browser local or blob media to Instagram. Ensure media is uploaded to a public HTTPS URL first.",
      };
    }

    try {
      // Step 1: Create media container
      const containerUrl = `https://graph.instagram.com/${version}/${targetAccountId}/media`;
      const containerParams = new URLSearchParams({
        caption: post.content || "",
        access_token: accessToken,
        ...(firstMedia.type === "VIDEO"
          ? { media_type: "REELS", video_url: firstMedia.url }
          : { image_url: firstMedia.url }),
      });

      const containerRes = await fetch(containerUrl, {
        method: "POST",
        body: containerParams,
      });

      const containerData = await containerRes.json().catch(() => ({}));

      if (!containerRes.ok || !containerData.id) {
        const errCode = containerData.error?.code;
        const isToken = errCode === 190 || errCode === 102;
        const isPermission = errCode === 200 || errCode === 10;
        let safeError = containerData.error?.message || "Failed to create Instagram media container.";
        if (isToken) safeError = "Instagram access token expired. Please reauthorize your Instagram account.";
        else if (errCode === 2207027 || errCode === 2207001) {
          safeError = "Instagram rejected media format. Images must be JPEG/PNG and publicly accessible via HTTPS.";
        }

        return {
          success: false,
          code: isToken ? "TOKEN_EXPIRED" : isPermission ? "PERMISSION_DENIED" : "CONTAINER_CREATION_FAILED",
          requiresReauth: isToken,
          requiresApproval: isPermission,
          error: safeError,
          rawResponse: containerData,
        };
      }

      const creationId = containerData.id;

      // Step 2: Poll container readiness
      const readyCheck = await this.waitForContainerReady(creationId, accessToken);
      if (!readyCheck.ready) {
        return {
          success: false,
          code: readyCheck.code || "PROCESSING_TIMEOUT",
          error: readyCheck.error || "Instagram media processing timed out.",
          rawResponse: readyCheck.rawResponse,
        };
      }

      // Step 3: Publish media container
      const publishRes = await fetch(`https://graph.instagram.com/${version}/${targetAccountId}/media_publish`, {
        method: "POST",
        body: new URLSearchParams({
          creation_id: creationId,
          access_token: accessToken,
        }),
      });

      const publishData = await publishRes.json().catch(() => ({}));
      if (!publishRes.ok || !publishData.id) {
        return {
          success: false,
          code: "PUBLISH_FAILED",
          error: publishData.error?.message || "Failed to publish Instagram media container.",
          rawResponse: publishData,
        };
      }

      return {
        success: true,
        platformPostId: publishData.id,
        publishedUrl: `https://instagram.com/p/${publishData.id}`,
        rawResponse: publishData,
      };
    } catch (err: unknown) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        retryable: true,
        error: (err as Error).message || "Instagram API network request failed.",
      };
    }
  }

  async deletePost(accessToken: string, platformPostId: string): Promise<boolean> {
    const version = this.getApiVersion();
    const res = await fetch(`https://graph.instagram.com/${version}/${platformPostId}?access_token=${accessToken}`, {
      method: "DELETE",
    });
    return res.ok;
  }

  async getAnalytics(accessToken: string, accountId: string, since: Date, until: Date): Promise<AnalyticsResult> {
    const version = this.getApiVersion();
    try {
      const metricName = "impressions,reach,profile_views";
      const res = await fetch(
        `https://graph.instagram.com/${version}/${accountId}/insights?metric=${metricName}&period=day&since=${Math.floor(
          since.getTime() / 1000
        )}&until=${Math.floor(until.getTime() / 1000)}&access_token=${accessToken}`
      );
      if (!res.ok) throw new Error("Failed to fetch Instagram insights");
      const data = await res.json();
      let impressions: number | null = null;
      let reach: number | null = null;
      let engagementCount: number | null = null;

      if (Array.isArray(data.data)) {
        for (const item of data.data) {
          const sumValues = (item.values || []).reduce(
            (acc: number, v: any) => acc + (typeof v.value === "number" ? v.value : 0),
            0
          );
          if (item.name.includes("impression")) impressions = (impressions ?? 0) + sumValues;
          if (item.name.includes("reach")) reach = (reach ?? 0) + sumValues;
          if (item.name.includes("engagement") || item.name.includes("profile_views")) {
            engagementCount = (engagementCount ?? 0) + sumValues;
          }
        }
      }

      return {
        followers: null,
        impressions,
        reach,
        engagementCount,
        engagementRate:
          reach != null && reach > 0 && engagementCount != null
            ? Number(((engagementCount / reach) * 100).toFixed(2))
            : null,
        clicks: null,
        shares: null,
        saves: null,
        isCalculated: false,
        rawJson: JSON.stringify(data),
      };
    } catch {
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
  }

  async getComments(accessToken: string, accountId: string): Promise<CommentResult[]> {
    const version = this.getApiVersion();
    try {
      const res = await fetch(
        `https://graph.instagram.com/${version}/${accountId}/media?fields=id,comments{id,text,username,timestamp}&access_token=${accessToken}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      const comments: CommentResult[] = [];

      for (const media of data.data || []) {
        for (const c of media.comments?.data || []) {
          comments.push({
            id: c.id,
            content: c.text,
            authorName: c.username || "Instagram User",
            postedAt: new Date(c.timestamp),
          });
        }
      }
      return comments;
    } catch {
      return [];
    }
  }

  async getMessages(accessToken: string, accountId: string): Promise<MessageResult[]> {
    const version = this.getApiVersion();
    try {
      const res = await fetch(
        `https://graph.instagram.com/${version}/${accountId}/conversations?fields=id,messages{id,message,from,created_time}&access_token=${accessToken}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).flatMap((conv: any) =>
        (conv.messages?.data || []).map((m: any) => ({
          id: m.id,
          senderName: m.from?.username || m.from?.name || "User",
          content: m.message,
          sentAt: new Date(m.created_time),
        }))
      );
    } catch {
      return [];
    }
  }

  async disconnect(accessToken: string): Promise<boolean> {
    const version = this.getApiVersion();
    try {
      const res = await fetch(
        `https://graph.instagram.com/${version}/me/permissions?access_token=${accessToken}`,
        { method: "DELETE" }
      );
      return res.ok;
    } catch {
      return true;
    }
  }

  getActionCapabilities(): PlatformActionCapabilities {
    return PLATFORM_ACTION_CAPABILITIES[this.platform];
  }

  async likePost(_accessToken: string, _target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    return {
      success: false,
      actionType: "LIKE",
      code: "UNSUPPORTED_ACTION",
      error: "Instagram Graph API does not support programmatic post likes.",
    };
  }

  async unlikePost(_accessToken: string, _target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    return {
      success: false,
      actionType: "UNLIKE",
      code: "UNSUPPORTED_ACTION",
      error: "Instagram Graph API does not support programmatic post unlikes.",
    };
  }
}
