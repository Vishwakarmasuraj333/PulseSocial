import {
  SocialProvider,
  SupportedPlatform,
  OAuthTokenResult,
  SocialAccountInfo,
  SocialProfileResult,
  PublishPostPayload,
  PublishResult,
  AnalyticsResult,
  PlatformActionCapabilities,
  PLATFORM_ACTION_CAPABILITIES,
  SocialActionResult,
  SocialMetricsResult,
  ExternalCommentData,
  CommentResult,
  MessageResult,
} from "../types";

export class ShopifyProvider implements SocialProvider {
  platform: SupportedPlatform = "shopify";
  displayName = "Shopify";
  iconName = "shopify";

  private resolveShopDomain(options?: Record<string, any>): string {
    if (options?.shop && typeof options.shop === "string") {
      let shop = options.shop.trim().toLowerCase();
      if (!shop.includes(".")) shop = `${shop}.myshopify.com`;
      return shop;
    }
    return (process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_SHOP || "pulsesocial-store.myshopify.com").replace(/\/+$/, "");
  }

  isConfigured(): boolean {
    return Boolean(process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_CLIENT_ID);
  }

  getMissingConfigMessage(): string {
    return "Shopify integration is not configured yet. Configure SHOPIFY_API_KEY and SHOPIFY_API_SECRET in your environment to enable store catalog sync.";
  }

  getAuthorizationUrl(
    state: string,
    redirectUri: string,
    _codeVerifier?: string,
    options?: Record<string, any>
  ): string {
    const apiKey = process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_CLIENT_ID;
    if (!apiKey) {
      throw new Error(this.getMissingConfigMessage());
    }

    const shop = this.resolveShopDomain(options);
    const scopes = encodeURIComponent(
      process.env.SHOPIFY_SCOPES || "read_products,write_products,read_content,write_content"
    );

    return `https://${shop}/admin/oauth/authorize?client_id=${encodeURIComponent(
      apiKey
    )}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
  }

  async exchangeCode(
    code: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<OAuthTokenResult> {
    return this.exchangeCodeForTokens(code, redirectUri, codeVerifier);
  }

  async exchangeCodeForTokens(
    code: string,
    _redirectUri: string,
    _codeVerifier?: string,
    options?: Record<string, any>
  ): Promise<OAuthTokenResult> {
    const apiKey = process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_CLIENT_ID;
    const apiSecret = process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_CLIENT_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error(this.getMissingConfigMessage());
    }

    const shop = this.resolveShopDomain(options);
    const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Shopify OAuth token exchange failed (HTTP ${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      scopes: typeof data.scope === "string" ? data.scope.split(",") : ["read_products"],
    };
  }

  async getProfile(accessToken: string, _accountId?: string): Promise<SocialProfileResult> {
    try {
      const shop = this.resolveShopDomain();
      const res = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        return {
          followersCount: null,
          followingCount: null,
          postsCount: null,
        };
      }

      const data = await res.json();
      return {
        followersCount: null,
        followingCount: null,
        postsCount: data.shop ? 1 : 0,
        raw: data,
      };
    } catch {
      return {
        followersCount: null,
        followingCount: null,
        postsCount: null,
      };
    }
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const shop = this.resolveShopDomain();
    try {
      const res = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });
      const data = res.ok ? await res.json() : {};
      const s = data.shop || {};
      return [
        {
          providerAccountId: String(s.id || shop),
          displayName: s.name || "Shopify Store",
          username: s.myshopify_domain || shop,
          profileImageUrl: undefined,
          accountType: "SHOPIFY_STORE",
        },
      ];
    } catch {
      return [
        {
          providerAccountId: shop,
          displayName: "Shopify Store",
          username: shop,
          profileImageUrl: undefined,
          accountType: "SHOPIFY_STORE",
        },
      ];
    }
  }

  async publishPost(
    accessToken: string,
    post: PublishPostPayload,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    try {
      const shop = this.resolveShopDomain(options);
      const res = await fetch(`https://${shop}/admin/api/2024-01/articles.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article: {
            title: post.content.slice(0, 70) || "Social Update",
            body_html: `<p>${post.content}</p>`,
            published: true,
          },
        }),
      });

      if (res.ok || res.status === 201) {
        const data = await res.json().catch(() => ({}));
        const articleId = String(data.article?.id || `shopify_${Date.now()}`);
        return {
          success: true,
          platformPostId: articleId,
          publishedUrl: `https://${shop}/blogs/news/${articleId}`,
        };
      }

      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        code: res.status === 401 ? "TOKEN_EXPIRED" : "API_ERROR",
        error: errData.errors || `Shopify API returned HTTP ${res.status}`,
      };
    } catch (e: any) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        error: e.message || "Failed to communicate with Shopify API",
      };
    }
  }

  async deletePost(_accessToken: string, _platformPostId: string): Promise<boolean> {
    return true;
  }

  async getAnalytics(): Promise<AnalyticsResult> {
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
    return PLATFORM_ACTION_CAPABILITIES.shopify;
  }

  async syncPostEngagement(
    _accessToken: string,
    externalPostId: string,
    _accountId?: string
  ): Promise<SocialMetricsResult> {
    return {
      success: true,
      platform: "shopify",
      externalPostId,
      likes: 0,
      reactions: 0,
      comments: 0,
      shares: 0,
      reposts: 0,
      views: 0,
      impressions: 0,
      reach: 0,
      saves: 0,
      rawResponse: {},
    };
  }

  async fetchPostComments(): Promise<ExternalCommentData[]> {
    return [];
  }
}
