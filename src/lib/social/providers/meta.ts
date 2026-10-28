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
  ExternalPostData,
  ExternalConversationData,
  ExternalInsightsData,
} from "../types";
import { SOCIAL_API_VERSIONS } from "../api-versions";

export class MetaProvider implements SocialProvider {
  platform: SupportedPlatform;
  displayName: string;
  iconName: string;

  constructor(platform: "facebook" | "instagram" = "facebook") {
    this.platform = platform;
    this.displayName = platform === "facebook" ? "Facebook" : "Instagram";
    this.iconName = platform;
  }

  private getApiVersion(): string {
    return process.env.META_API_VERSION || SOCIAL_API_VERSIONS.META_GRAPH || "v20.0";
  }

  private getAppCredentials(): { appId: string; appSecret: string } {
    const appId = process.env.META_APP_ID?.trim();
    const appSecret = process.env.META_APP_SECRET?.trim();
    if (!appId || !appSecret) {
      throw new Error(this.getMissingConfigMessage());
    }
    return { appId, appSecret };
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.META_APP_ID?.trim() &&
      process.env.META_APP_SECRET?.trim()
    );
  }

  getMissingConfigMessage(): string {
    return `${this.displayName} integration is not configured yet. Configure META_APP_ID and META_APP_SECRET in your environment to enable this connection.`;
  }

  parseGraphApiError(data: any): string {
    const errCode = data?.error?.code;
    const isToken = errCode === 190 || errCode === 102;
    const isPermission = errCode === 200 || errCode === 10 || errCode === 283;
    const isPolicy = errCode === 368;

    if (isToken) return "Facebook/Instagram access token has expired or was revoked. Please reauthorize your account.";
    if (isPermission) return "Publish permission denied. Verify that required scopes ('pages_manage_posts' or 'instagram_content_publish') are granted.";
    if (isPolicy) return "Temporarily restricted by Meta platform policy. Please try again later.";
    return data?.error?.message || "Meta Graph API request failed.";
  }

  getAuthUrl(state: string, redirectUri: string): string {
    return this.getAuthorizationUrl(state, redirectUri);
  }

  getAuthorizationUrl(state: string, redirectUri: string, codeVerifier?: string, options?: Record<string, any>): string {
    const { appId } = this.getAppCredentials();
    const version = this.getApiVersion();
    const tier = options?.tier || "full";

    let scopes: string;

    if (process.env.META_SCOPES_FACEBOOK && this.platform === "facebook") {
      scopes = process.env.META_SCOPES_FACEBOOK;
    } else if (process.env.META_SCOPES_INSTAGRAM && this.platform === "instagram") {
      scopes = process.env.META_SCOPES_INSTAGRAM;
    } else if (this.platform === "instagram") {
      scopes = tier === "basic"
        ? ["public_profile", "instagram_basic"].join(",")
        : [
            "public_profile",
            "instagram_basic",
            "instagram_content_publish",
            "instagram_manage_comments",
            "instagram_manage_insights",
            "pages_show_list",
            "pages_read_engagement",
          ].join(",");
    } else {
      // Facebook
      if (tier === "basic") {
        scopes = "public_profile";
      } else if (tier === "standard") {
        scopes = "public_profile,pages_show_list,pages_read_engagement";
      } else {
        scopes = "public_profile,pages_show_list,pages_read_engagement,pages_manage_posts";
      }
    }

    // Check if a dedicated Instagram App ID is configured
    const dedicatedIgAppId = process.env.INSTAGRAM_APP_ID || process.env.INSTAGRAM_CLIENT_ID;

    if (this.platform === "instagram") {
      if (dedicatedIgAppId) {
        const igParams = new URLSearchParams({
          client_id: dedicatedIgAppId,
          redirect_uri: redirectUri,
          state,
          scope: "user_profile,user_media",
          response_type: "code",
        });
        return `https://api.instagram.com/oauth/authorize?${igParams.toString()}`;
      }
      // Instagram must NEVER open facebook.com URL
      return `/social/connect/instagram`;
    }

    // Facebook OAuth dialog
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      state,
      scope: scopes,
      response_type: "code",
      auth_type: "rerequest",
    });

    return `https://www.facebook.com/${version}/dialog/oauth?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    const { appId, appSecret } = this.getAppCredentials();
    const version = this.getApiVersion();

    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    });

    const res = await fetch(`https://graph.facebook.com/${version}/oauth/access_token?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || "Failed to exchange authorization code with Meta Graph API");
    }

    const data = await res.json();
    const shortLivedToken = data.access_token;
    if (!shortLivedToken || typeof shortLivedToken !== "string") {
      throw new Error("Meta OAuth exchange did not return a valid short-lived access token.");
    }

    // Exchange for long-lived 60-day token
    const exchangeParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    });

    const longLivedRes = await fetch(`https://graph.facebook.com/${version}/oauth/access_token?${exchangeParams.toString()}`);
    const longLivedData = longLivedRes.ok ? await longLivedRes.json().catch(() => data) : data;
    const finalToken = longLivedData?.access_token || shortLivedToken;

    // Inspect /me/permissions to validate exact granted and declined permissions
    let grantedPermissions: string[] = [];
    let declinedPermissions: string[] = [];

    try {
      const permRes = await fetch(`https://graph.facebook.com/${version}/me/permissions`, {
        headers: {
          Authorization: `Bearer ${finalToken}`,
          Accept: "application/json",
        },
      });
      if (permRes.ok) {
        const permData = await permRes.json();
        if (Array.isArray(permData?.data)) {
          for (const item of permData.data) {
            if (item.status === "granted") {
              grantedPermissions.push(item.permission);
            } else if (item.status === "declined") {
              declinedPermissions.push(item.permission);
            }
          }
        }
      }
    } catch {
      grantedPermissions = ["public_profile", "pages_show_list", "pages_read_engagement"];
    }

    const calculatedExpiresIn = typeof longLivedData?.expires_in === "number"
      ? longLivedData.expires_in
      : (typeof data.expires_in === "number" ? data.expires_in : 5184000);

    return {
      accessToken: finalToken,
      expiresIn: calculatedExpiresIn,
      scopes: grantedPermissions.length > 0 ? grantedPermissions : ["public_profile", "pages_show_list"],
      metadata: {
        tokenType: "Bearer",
        grantedPermissions,
        declinedPermissions,
        isLongLived: Boolean(longLivedRes.ok),
      },
    };
  }

  async refreshToken(currentAccessToken: string): Promise<OAuthTokenResult> {
    const { appId, appSecret } = this.getAppCredentials();
    const version = this.getApiVersion();

    const exchangeParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: currentAccessToken,
    });

    const res = await fetch(`https://graph.facebook.com/${version}/oauth/access_token?${exchangeParams.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || "Failed to refresh Meta access token");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 5184000,
      scopes: ["pages_manage_posts", "instagram_content_publish", "instagram_basic"],
      metadata: { tokenType: "Bearer" },
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    if (!accessToken || typeof accessToken !== "string" || accessToken.trim() === "") {
      throw new Error("Missing valid authorization token for Meta Graph API");
    }

    const version = this.getApiVersion();
    const accounts: SocialAccountInfo[] = [];
    const seenAccountIds = new Set<string>();

    let nextUrl: string | null = `https://graph.facebook.com/${version}/me/accounts?fields=id,name,picture{url},access_token,tasks,instagram_business_account{id,username,profile_picture_url,name}&limit=50`;
    let pageCount = 0;

    // Follow pagination up to 5 pages (up to 250 accounts max)
    while (nextUrl && pageCount < 5) {
      pageCount++;
      const currentUrl: string = nextUrl;
      const res: Response = await fetch(currentUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || "Failed to fetch accounts from Meta Graph API");
      }

      const data: any = await res.json();

      for (const page of data.data || []) {
        // 1. Facebook Page (if platform is facebook or both)
        if (this.platform === "facebook" && !seenAccountIds.has(`fb_${page.id}`)) {
          seenAccountIds.add(`fb_${page.id}`);
          accounts.push({
            providerAccountId: page.id,
            displayName: page.name,
            profileImageUrl: page.picture?.data?.url,
            accountType: "PAGE",
            platform: "facebook",
            metadata: {
              pageId: page.id,
              pageName: page.name,
              pageAccessToken: page.access_token,
              tasks: page.tasks || [],
            },
          });
        }

        // 2. Linked Instagram Professional/Business account
        if (page.instagram_business_account && page.instagram_business_account.id) {
          const ig = page.instagram_business_account;
          const igKey = `ig_${ig.id}`;
          if (!seenAccountIds.has(igKey)) {
            seenAccountIds.add(igKey);
            // Include in discovery if platform is instagram OR if discovering all linked accounts
            if (this.platform === "instagram" || this.platform === "facebook") {
              accounts.push({
                providerAccountId: ig.id,
                displayName: ig.username || ig.name || page.name,
                username: ig.username || undefined,
                profileImageUrl: ig.profile_picture_url || page.picture?.data?.url,
                accountType: "BUSINESS",
                platform: "instagram",
                metadata: {
                  igUserId: ig.id,
                  linkedPageId: page.id,
                  linkedPageName: page.name,
                  pageAccessToken: page.access_token,
                },
              });
            }
          }
        }
      }

      nextUrl = data.paging?.next || null;
    }

    if (this.platform === "instagram" && accounts.filter((a) => a.platform === "instagram").length === 0) {
      throw new Error(
        "No linked Instagram Professional or Business accounts found. In Meta Business Suite, switch your Instagram account to a Professional/Business account and link it to your Facebook Page."
      );
    }

    return accounts;
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    if (!accessToken || typeof accessToken !== "string" || accessToken.trim() === "") {
      return { followersCount: null, followingCount: null, postsCount: null };
    }

    const version = this.getApiVersion();
    try {
      if (this.platform === "instagram") {
        const res = await fetch(
          `https://graph.facebook.com/${version}/${accountId}?fields=biography,followers_count,follows_count,media_count,website,profile_picture_url`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );
        if (!res.ok) return { followersCount: null, followingCount: null, postsCount: null };
        const data = await res.json();
        return {
          followersCount: data.followers_count != null ? data.followers_count : null,
          followingCount: data.follows_count != null ? data.follows_count : null,
          postsCount: data.media_count != null ? data.media_count : null,
          bio: data.biography,
          websiteUrl: data.website,
          raw: data,
        };
      } else {
        const res = await fetch(
          `https://graph.facebook.com/${version}/${accountId}?fields=fan_count,followers_count,about,website`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );
        if (!res.ok) return { followersCount: null, followingCount: null, postsCount: null };
        const data = await res.json();
        return {
          followersCount: data.followers_count != null ? data.followers_count : (data.fan_count != null ? data.fan_count : null),
          followingCount: null, // Facebook Pages do not have a public followingCount
          postsCount: null, // Not provided on base page fields
          bio: data.about,
          websiteUrl: data.website,
          raw: data,
        };
      }
    } catch {
      return { followersCount: null, followingCount: null, postsCount: null };
    }
  }

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
        `https://graph.facebook.com/${version}/${creationId}?fields=status_code,status&access_token=${accessToken}`
      );
      const statusData = await statusRes.json().catch(() => ({}));

      if (statusData.status_code === "FINISHED") {
        return { ready: true, rawResponse: statusData };
      } else if (statusData.status_code === "ERROR") {
        return {
          ready: false,
          code: "MEDIA_PROCESSING_FAILED",
          error: statusData.status || "Instagram media processing failed. Check that the image meets Instagram aspect ratio (between 4:5 and 1.91:1) and dimensions.",
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

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    const version = this.getApiVersion();
    const targetAccountId = post.targetAccountId || "me";

    try {
      if (this.platform === "facebook") {
        const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
        const firstMedia = hasMedia ? post.mediaUrls![0] : null;

        // If media URL is present, validate that it is an accessible HTTP/HTTPS URL
        if (firstMedia?.url) {
          if (firstMedia.url.startsWith("blob:") || firstMedia.url.startsWith("data:") || firstMedia.url.startsWith("file:")) {
            return {
              success: false,
              code: "INVALID_MEDIA_URL",
              error: "Cannot publish browser local or blob media to Meta. Ensure media is uploaded to a public HTTPS URL first.",
            };
          }
        }

        let endpoint: string;
        let body: URLSearchParams;

        if (firstMedia && firstMedia.type === "VIDEO") {
          // Video post
          endpoint = `https://graph.facebook.com/${version}/${targetAccountId}/videos`;
          body = new URLSearchParams({
            description: post.content || "",
            file_url: firstMedia.url,
            access_token: accessToken,
          });
        } else if (firstMedia) {
          // Native Photo post
          endpoint = `https://graph.facebook.com/${version}/${targetAccountId}/photos`;
          body = new URLSearchParams({
            caption: post.content || "",
            url: firstMedia.url,
            published: "true",
            access_token: accessToken,
          });
        } else {
          // Standard text / link post
          endpoint = `https://graph.facebook.com/${version}/${targetAccountId}/feed`;
          body = new URLSearchParams({
            message: post.content || "",
            access_token: accessToken,
          });
        }

        const res = await fetch(endpoint, { method: "POST", body });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || (!data.id && !data.post_id)) {
          const errCode = data.error?.code;
          const isToken = errCode === 190 || errCode === 102;
          const isPermission = errCode === 200 || errCode === 10 || errCode === 283;
          const isPolicy = errCode === 368;

          let safeError = data.error?.message || "Failed to publish to Facebook Page";
          if (isToken) safeError = "Facebook OAuth token expired or revoked. Please reauthorize your Facebook Page.";
          else if (isPermission) safeError = "Facebook Page publish permission denied. Verify that 'pages_manage_posts' is granted on the Page.";
          else if (isPolicy) safeError = "Temporarily restricted by Meta policy. Please try again later.";

          return {
            success: false,
            code: isToken ? "TOKEN_EXPIRED" : isPermission ? "PERMISSION_DENIED" : isPolicy ? "POLICY_BLOCKED" : "GRAPH_API_ERROR",
            requiresReauth: isToken,
            requiresApproval: isPermission,
            error: safeError,
            rawResponse: data,
          };
        }

        const platformPostId = data.post_id || data.id;
        return {
          success: true,
          platformPostId,
          publishedUrl: `https://facebook.com/${platformPostId}`,
          rawResponse: data,
        };
      } else {
        // Instagram Content Publishing: Official 2-step media container workflow
        if (!post.mediaUrls || post.mediaUrls.length === 0) {
          return {
            success: false,
            code: "INVALID_MEDIA",
            error: "Instagram Graph API requires at least one image or video to publish a post.",
          };
        }

        const firstMedia = post.mediaUrls[0];
        if (firstMedia.url.startsWith("blob:") || firstMedia.url.startsWith("data:") || firstMedia.url.startsWith("file:")) {
          return {
            success: false,
            code: "INVALID_MEDIA_URL",
            error: "Cannot publish browser local or blob media to Instagram. Ensure media is uploaded to a public HTTPS URL first.",
          };
        }

        // Step 1: Create media container
        const containerUrl = `https://graph.facebook.com/${version}/${targetAccountId}/media`;
        const containerParams = new URLSearchParams({
          caption: post.content || "",
          access_token: accessToken,
          ...(firstMedia.type === "VIDEO"
            ? { media_type: "REELS", video_url: firstMedia.url }
            : { image_url: firstMedia.url }),
        });

        const containerRes = await fetch(containerUrl, { method: "POST", body: containerParams });
        const containerData = await containerRes.json().catch(() => ({}));

        if (!containerRes.ok || !containerData.id) {
          const errCode = containerData.error?.code;
          const isToken = errCode === 190 || errCode === 102;
          const isPermission = errCode === 200 || errCode === 10;
          let safeError = containerData.error?.message || "Failed to create Instagram media container";
          if (isToken) safeError = "Instagram access token expired. Please reauthorize your Instagram account.";
          else if (errCode === 2207027 || errCode === 2207001) safeError = "Instagram rejected media format. Image must be JPEG/PNG and publicly accessible via HTTPS.";

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

        // Step 2: Bounded polling for container readiness with progressive backoff
        let ready = false;
        let attempts = 0;
        const maxAttempts = 10;
        let delayMs = 1500;

        while (!ready && attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, delayMs));
          attempts++;
          delayMs = Math.min(delayMs * 1.2, 4000);

          const statusRes = await fetch(
            `https://graph.facebook.com/${version}/${creationId}?fields=status_code,status&access_token=${accessToken}`
          );
          const statusData = await statusRes.json().catch(() => ({}));

          if (statusData.status_code === "FINISHED") {
            ready = true;
          } else if (statusData.status_code === "ERROR") {
            return {
              success: false,
              code: "MEDIA_PROCESSING_FAILED",
              error: statusData.status || "Instagram media processing failed. Check that the image meets Instagram aspect ratio (between 4:5 and 1.91:1) and dimensions.",
              rawResponse: statusData,
            };
          } else if (statusData.status_code === "EXPIRED") {
            return {
              success: false,
              code: "CONTAINER_EXPIRED",
              error: "Instagram media container expired before it could be published. Please retry.",
              rawResponse: statusData,
            };
          }
        }

        if (!ready) {
          return {
            success: false,
            code: "PROCESSING_TIMEOUT",
            error: "Instagram media processing timed out before publication could complete. Please retry in a few moments.",
          };
        }

        // Step 3: Publish container
        const publishRes = await fetch(`https://graph.facebook.com/${version}/${targetAccountId}/media_publish`, {
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
            error: publishData.error?.message || "Failed to publish Instagram media container",
            rawResponse: publishData,
          };
        }

        return {
          success: true,
          platformPostId: publishData.id,
          publishedUrl: `https://instagram.com/p/${publishData.id}`,
          rawResponse: publishData,
        };
      }
    } catch (err: unknown) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        retryable: true,
        error: (err as Error).message || "Meta API network request failed",
      };
    }
  }

  async deletePost(accessToken: string, platformPostId: string): Promise<boolean> {
    const res = await fetch(`https://graph.facebook.com/v20.0/${platformPostId}?access_token=${accessToken}`, {
      method: "DELETE",
    });
    return res.ok;
  }

  async getAnalytics(accessToken: string, accountId: string, since: Date, until: Date): Promise<AnalyticsResult> {
    try {
      const metricName = this.platform === "instagram" ? "impressions,reach,profile_views" : "page_impressions,page_engaged_users";
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${accountId}/insights?metric=${metricName}&period=day&since=${Math.floor(
          since.getTime() / 1000
        )}&until=${Math.floor(until.getTime() / 1000)}&access_token=${accessToken}`
      );
      if (!res.ok) throw new Error("Failed to fetch insights");
      const data = await res.json();
      let impressions: number | null = null;
      let reach: number | null = null;
      let engagementCount: number | null = null;
      if (Array.isArray(data.data)) {
        for (const item of data.data) {
          const sumValues = (item.values || []).reduce((acc: number, v: any) => acc + (typeof v.value === "number" ? v.value : 0), 0);
          if (item.name.includes("impression")) impressions = (impressions ?? 0) + sumValues;
          if (item.name.includes("reach")) reach = (reach ?? 0) + sumValues;
          if (item.name.includes("engaged_users") || item.name.includes("engagement")) engagementCount = (engagementCount ?? 0) + sumValues;
        }
      }
      return {
        followers: null,
        impressions,
        reach,
        engagementCount,
        engagementRate: reach != null && reach > 0 && engagementCount != null ? Number(((engagementCount / reach) * 100).toFixed(2)) : null,
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
    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${accountId}/comments?fields=id,message,from{name,id},created_time&access_token=${accessToken}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).map((c: { id: string; message: string; from?: { name: string }; created_time: string }) => ({
        id: c.id,
        content: c.message,
        authorName: c.from?.name || "Anonymous User",
        postedAt: new Date(c.created_time),
      }));
    } catch {
      return [];
    }
  }

  async getMessages(accessToken: string, accountId: string): Promise<MessageResult[]> {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${accountId}/conversations?fields=id,messages{id,message,from,created_time}&access_token=${accessToken}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).flatMap((conv: { messages?: { data?: { id: string; message: string; from?: { name: string }; created_time: string }[] } }) =>
        (conv.messages?.data || []).map((m) => ({
          id: m.id,
          senderName: m.from?.name || "Customer",
          content: m.message,
          sentAt: new Date(m.created_time),
        }))
      );
    } catch {
      return [];
    }
  }

  async disconnect(accessToken: string): Promise<boolean> {
    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/me/permissions?access_token=${accessToken}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch {
      return true;
    }
  }

  getActionCapabilities(): PlatformActionCapabilities {
    return PLATFORM_ACTION_CAPABILITIES[this.platform];
  }

  async likePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    if (this.platform === "instagram") {
      return {
        success: false,
        actionType: "LIKE",
        code: "UNSUPPORTED_ACTION",
        error: "Not supported by this integration: Instagram Graph API does not support programmatic post likes.",
      };
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${target.externalPostId}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const isAuth = res.status === 401 || data.error?.code === 190;
        return {
          success: false,
          actionType: "LIKE",
          code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
          requiresReauth: isAuth,
          error: data.error?.message || "Failed to like post on Facebook",
          rawResponse: data,
        };
      }
      return {
        success: true,
        actionType: "LIKE",
        externalActionId: target.externalPostId,
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "LIKE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to Facebook Graph API",
      };
    }
  }

  async unlikePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    if (this.platform === "instagram") {
      return {
        success: false,
        actionType: "UNLIKE",
        code: "UNSUPPORTED_ACTION",
        error: "Not supported by this integration: Instagram Graph API does not support programmatic post unlikes.",
      };
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${target.externalPostId}/likes?access_token=${accessToken}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const isAuth = res.status === 401 || data.error?.code === 190;
        return {
          success: false,
          actionType: "UNLIKE",
          code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
          requiresReauth: isAuth,
          error: data.error?.message || "Failed to unlike post on Facebook",
          rawResponse: data,
        };
      }
      return {
        success: true,
        actionType: "UNLIKE",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "UNLIKE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to Facebook Graph API",
      };
    }
  }

  async commentPost(accessToken: string, target: { externalPostId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }> {
    try {
      const endpoint = `https://graph.facebook.com/v20.0/${target.externalPostId}/comments`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: target.content,
          access_token: accessToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        const isAuth = res.status === 401 || data.error?.code === 190;
        return {
          success: false,
          actionType: "COMMENT",
          code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
          requiresReauth: isAuth,
          error: data.error?.message || `Failed to post comment to ${this.displayName}`,
          rawResponse: data,
        };
      }

      return {
        success: true,
        actionType: "COMMENT",
        externalActionId: data.id,
        comment: {
          externalCommentId: data.id,
          platform: this.platform,
          authorName: this.displayName + " Account",
          content: target.content,
          postedAt: new Date(),
          externalPostId: target.externalPostId,
        },
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || `Failed to post comment to ${this.displayName}`,
      };
    }
  }

  async replyToComment(accessToken: string, target: { externalPostId?: string; externalCommentId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }> {
    try {
      const endpoint = this.platform === "instagram"
        ? `https://graph.facebook.com/v20.0/${target.externalCommentId}/replies`
        : `https://graph.facebook.com/v20.0/${target.externalCommentId}/comments`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: target.content,
          access_token: accessToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        const isAuth = res.status === 401 || data.error?.code === 190;
        return {
          success: false,
          actionType: "REPLY",
          code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
          requiresReauth: isAuth,
          error: data.error?.message || `Failed to reply to comment on ${this.displayName}`,
          rawResponse: data,
        };
      }

      return {
        success: true,
        actionType: "REPLY",
        externalActionId: data.id,
        comment: {
          externalCommentId: data.id,
          platform: this.platform,
          authorName: this.displayName + " Reply",
          content: target.content,
          postedAt: new Date(),
          externalPostId: target.externalPostId,
          parentId: target.externalCommentId,
        },
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "REPLY",
        code: "NETWORK_ERROR",
        error: e.message || `Failed to reply to comment on ${this.displayName}`,
      };
    }
  }

  async deleteComment(accessToken: string, target: { externalCommentId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${target.externalCommentId}?access_token=${accessToken}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        const isAuth = res.status === 401 || data.error?.code === 190;
        return {
          success: false,
          actionType: "DELETE_COMMENT",
          code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
          requiresReauth: isAuth,
          error: data.error?.message || `Failed to delete comment on ${this.displayName}`,
          rawResponse: data,
        };
      }

      return {
        success: true,
        actionType: "DELETE_COMMENT",
        externalActionId: target.externalCommentId,
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "DELETE_COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || `Failed to delete comment on ${this.displayName}`,
      };
    }
  }

  async hideComment(accessToken: string, target: { externalCommentId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const endpoint = this.platform === "instagram"
        ? `https://graph.facebook.com/v20.0/${target.externalCommentId}?hide=true&access_token=${accessToken}`
        : `https://graph.facebook.com/v20.0/${target.externalCommentId}?is_hidden=true&access_token=${accessToken}`;
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const isAuth = res.status === 401 || data.error?.code === 190;
        return {
          success: false,
          actionType: "HIDE_COMMENT",
          code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
          requiresReauth: isAuth,
          error: data.error?.message || `Failed to hide comment on ${this.displayName}`,
          rawResponse: data,
        };
      }

      return {
        success: true,
        actionType: "HIDE_COMMENT",
        externalActionId: target.externalCommentId,
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "HIDE_COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || `Failed to hide comment on ${this.displayName}`,
      };
    }
  }

  async syncPostEngagement(accessToken: string, externalPostId: string): Promise<SocialMetricsResult> {
    try {
      if (this.platform === "facebook") {
        const fields = "shares,comments.summary(true),reactions.summary(true)";
        const res = await fetch(`https://graph.facebook.com/v20.0/${externalPostId}?fields=${fields}&access_token=${accessToken}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const isAuth = res.status === 401 || data.error?.code === 190;
          return {
            success: false,
            platform: "facebook",
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
            error: data.error?.message || "Failed to sync Facebook post metrics",
          };
        }

        const reactionsCount = typeof data.reactions?.summary?.total_count === "number" ? data.reactions.summary.total_count : null;
        const commentsCount = typeof data.comments?.summary?.total_count === "number" ? data.comments.summary.total_count : null;
        const sharesCount = typeof data.shares?.count === "number" ? data.shares.count : null;

        return {
          success: true,
          platform: "facebook",
          externalPostId,
          likes: reactionsCount,
          reactions: reactionsCount,
          comments: commentsCount,
          shares: sharesCount,
          reposts: null,
          views: null,
          impressions: null,
          reach: null,
          saves: null,
          rawResponse: data,
        };
      } else {
        // Instagram
        const fields = "like_count,comments_count";
        const res = await fetch(`https://graph.facebook.com/v20.0/${externalPostId}?fields=${fields}&access_token=${accessToken}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const isAuth = res.status === 401 || data.error?.code === 190;
          return {
            success: false,
            platform: "instagram",
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
            error: data.error?.message || "Failed to sync Instagram post metrics",
          };
        }

        const likes = typeof data.like_count === "number" ? data.like_count : null;
        const comments = typeof data.comments_count === "number" ? data.comments_count : null;

        return {
          success: true,
          platform: "instagram",
          externalPostId,
          likes,
          reactions: likes,
          comments,
          shares: null,
          reposts: null,
          views: null,
          impressions: null,
          reach: null,
          saves: null,
          rawResponse: data,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        platform: this.platform,
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
        error: e.message || "Failed to sync post engagement",
      };
    }
  }

  async fetchPostComments(accessToken: string, externalPostId: string): Promise<ExternalCommentData[]> {
    try {
      if (this.platform === "facebook") {
        const res = await fetch(
          `https://graph.facebook.com/v20.0/${externalPostId}/comments?fields=id,message,from{name,id},created_time,like_count&access_token=${accessToken}`
        );
        if (!res.ok) return [];
        const data = await res.json().catch(() => ({}));
        return (data.data || []).map((c: any) => ({
          externalCommentId: c.id,
          platform: "facebook" as SupportedPlatform,
          authorName: c.from?.name || "Facebook User",
          authorUsername: c.from?.id,
          content: c.message || "",
          postedAt: new Date(c.created_time),
          externalPostId,
          likeCount: typeof c.like_count === "number" ? c.like_count : null,
        }));
      } else {
        // Instagram
        const res = await fetch(
          `https://graph.facebook.com/v20.0/${externalPostId}/comments?fields=id,text,username,timestamp,like_count,replies{id,text,username,timestamp}&access_token=${accessToken}`
        );
        if (!res.ok) return [];
        const data = await res.json().catch(() => ({}));
        const results: ExternalCommentData[] = [];
        for (const c of (data.data || [])) {
          results.push({
            externalCommentId: c.id,
            platform: "instagram" as SupportedPlatform,
            authorName: c.username || "Instagram User",
            authorUsername: c.username,
            content: c.text || "",
            postedAt: new Date(c.timestamp),
            externalPostId,
            likeCount: typeof c.like_count === "number" ? c.like_count : null,
          });
          if (c.replies?.data) {
            for (const r of c.replies.data) {
              results.push({
                externalCommentId: r.id,
                platform: "instagram" as SupportedPlatform,
                authorName: r.username || "Instagram User",
                authorUsername: r.username,
                content: r.text || "",
                postedAt: new Date(r.timestamp),
                externalPostId,
                parentId: c.id,
                likeCount: null,
              });
            }
          }
        }
        return results;
      }
    } catch {
      return [];
    }
  }

  async fetchPosts(accessToken: string, accountId: string, limit: number = 25): Promise<ExternalPostData[]> {
    const version = SOCIAL_API_VERSIONS.META_GRAPH;
    try {
      if (this.platform === "facebook") {
        const fields = "id,message,created_time,permalink_url,full_picture,shares,reactions.summary(true),comments.summary(true)";
        let res = await fetch(`https://graph.facebook.com/${version}/${accountId}/published_posts?fields=${fields}&limit=${limit}&access_token=${accessToken}`);
        if (!res.ok) {
          res = await fetch(`https://graph.facebook.com/${version}/${accountId}/feed?fields=${fields}&limit=${limit}&access_token=${accessToken}`);
        }
        if (!res.ok) return [];

        const data = await res.json().catch(() => ({}));
        const posts: ExternalPostData[] = [];

        for (const item of (data.data || [])) {
          posts.push({
            platformPostId: item.id,
            platform: "facebook",
            content: item.message || "",
            permalink: item.permalink_url,
            media: item.full_picture ? [{ url: item.full_picture, type: "IMAGE" }] : [],
            publishedAt: new Date(item.created_time),
            likes: item.reactions?.summary?.total_count ?? null,
            comments: item.comments?.summary?.total_count ?? null,
            shares: item.shares?.count ?? null,
            views: null,
            rawJson: JSON.stringify(item),
          });
        }
        return posts;
      } else {
        // Instagram
        const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";
        const res = await fetch(`https://graph.facebook.com/${version}/${accountId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`);
        if (!res.ok) return [];

        const data = await res.json().catch(() => ({}));
        const posts: ExternalPostData[] = [];

        for (const item of (data.data || [])) {
          const mediaUrl = item.media_url || item.thumbnail_url;
          posts.push({
            platformPostId: item.id,
            platform: "instagram",
            content: item.caption || "",
            permalink: item.permalink,
            media: mediaUrl ? [{ url: mediaUrl, type: item.media_type === "VIDEO" ? "VIDEO" : "IMAGE" }] : [],
            publishedAt: new Date(item.timestamp),
            likes: item.like_count ?? null,
            comments: item.comments_count ?? null,
            shares: null,
            views: null,
            rawJson: JSON.stringify(item),
          });
        }
        return posts;
      }
    } catch (e) {
      console.warn(`[MetaProvider] Failed to fetch posts for ${accountId}:`, e);
      return [];
    }
  }

  async fetchInboxConversations(accessToken: string, accountId: string, limit: number = 20): Promise<ExternalConversationData[]> {
    const version = SOCIAL_API_VERSIONS.META_GRAPH;
    try {
      const fields = "id,updated_time,unread_count,senders,messages{id,message,created_time,from}";
      const res = await fetch(`https://graph.facebook.com/${version}/${accountId}/conversations?fields=${fields}&limit=${limit}&access_token=${accessToken}`);
      if (!res.ok) return [];

      const data = await res.json().catch(() => ({}));
      const conversations: ExternalConversationData[] = [];

      for (const item of (data.data || [])) {
        const senders = item.senders?.data || [];
        const otherSender = senders.find((s: any) => s.id !== accountId) || senders[0] || {};
        const msgs = (item.messages?.data || []).map((m: any) => ({
          platformMessageId: m.id,
          senderId: m.from?.id || "unknown",
          senderName: m.from?.name || otherSender.name || "Customer",
          senderUsername: m.from?.id,
          content: m.message || "",
          sentAt: new Date(m.created_time),
          direction: (m.from?.id === accountId ? "OUTBOUND" : "INBOUND") as "INBOUND" | "OUTBOUND",
        }));

        conversations.push({
          platformConversationId: item.id,
          platform: this.platform,
          participantId: otherSender.id,
          participantName: otherSender.name || "Customer",
          participantUsername: otherSender.email || otherSender.id,
          lastMessageSnippet: msgs[0]?.content || "",
          lastMessageAt: new Date(item.updated_time || (msgs[0]?.sentAt || new Date())),
          unreadCount: item.unread_count || 0,
          messages: msgs,
        });
      }
      return conversations;
    } catch {
      return [];
    }
  }

  async sendMessageOrReply(accessToken: string, conversationId: string, content: string, accountId?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const version = SOCIAL_API_VERSIONS.META_GRAPH;
    try {
      const res = await fetch(`https://graph.facebook.com/${version}/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          access_token: accessToken,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        return {
          success: false,
          error: data.error?.message || "Failed to deliver message via Meta Graph API",
        };
      }

      return {
        success: true,
        messageId: data.id,
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || "Failed to deliver message",
      };
    }
  }

  async fetchInsights(accessToken: string, accountId: string, since?: Date, until?: Date): Promise<ExternalInsightsData[]> {
    const version = SOCIAL_API_VERSIONS.META_GRAPH;
    try {
      if (this.platform === "facebook") {
        const metrics = "page_impressions,page_post_engagements,page_fans";
        const res = await fetch(`https://graph.facebook.com/${version}/${accountId}/insights?metric=${metrics}&period=day&access_token=${accessToken}`);
        if (!res.ok) return [];

        const data = await res.json().catch(() => ({}));
        const dateMap = new Map<string, ExternalInsightsData>();

        for (const item of (data.data || [])) {
          for (const val of (item.values || [])) {
            const dateStr = val.end_time.split("T")[0];
            const existing = dateMap.get(dateStr) || { date: new Date(dateStr) };

            if (item.name === "page_impressions") existing.impressions = val.value;
            if (item.name === "page_post_engagements") existing.engagementCount = val.value;
            if (item.name === "page_fans") existing.followers = val.value;

            dateMap.set(dateStr, existing);
          }
        }
        return Array.from(dateMap.values());
      } else {
        // Instagram
        const metrics = "impressions,reach,profile_views";
        const res = await fetch(`https://graph.facebook.com/${version}/${accountId}/insights?metric=${metrics}&period=day&metric_type=total_value&access_token=${accessToken}`);
        if (!res.ok) return [];

        const data = await res.json().catch(() => ({}));
        const dateMap = new Map<string, ExternalInsightsData>();

        for (const item of (data.data || [])) {
          for (const val of (item.total_value?.breakdowns || item.values || [])) {
            const dateStr = (val.end_time || new Date().toISOString()).split("T")[0];
            const existing = dateMap.get(dateStr) || { date: new Date(dateStr) };

            if (item.name === "impressions") existing.impressions = val.value;
            if (item.name === "reach") existing.reach = val.value;

            dateMap.set(dateStr, existing);
          }
        }
        return Array.from(dateMap.values());
      }
    } catch {
      return [];
    }
  }
}

