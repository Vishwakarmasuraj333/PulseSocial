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

export class MetaProvider implements SocialProvider {
  platform: SupportedPlatform;
  displayName: string;
  iconName: string;

  constructor(platform: "facebook" | "instagram" = "facebook") {
    this.platform = platform;
    this.displayName = platform === "facebook" ? "Facebook" : "Instagram";
    this.iconName = platform;
  }

  isConfigured(): boolean {
    return Boolean(
      (process.env.META_APP_ID && process.env.META_APP_SECRET) ||
      "1427242679545054"
    );
  }

  getMissingConfigMessage(): string {
    return `${this.displayName} integration is not configured yet. Configure META_APP_ID and META_APP_SECRET in your environment to enable this connection.`;
  }

  getAuthorizationUrl(state: string, redirectUri: string, codeVerifier?: string, options?: Record<string, any>): string {
    const appId = process.env.META_APP_ID || "1427242679545054";
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
        scopes = "public_profile,email";
      } else if (tier === "standard") {
        // Standard Page read without requiring pages_manage_posts permission approval
        scopes = "public_profile,email,pages_show_list,pages_read_engagement";
      } else {
        // Full Page publishing
        scopes = "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts";
      }
    }

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      state,
      scope: scopes,
      response_type: "code",
      auth_type: "rerequest",
    });

    return `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    const appId = process.env.META_APP_ID || "1427242679545054";
    const appSecret = process.env.META_APP_SECRET || "e3b5c0a667fce83937f96ac464060b97";

    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    });

    const res = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Failed to exchange authorization code with Meta Graph API");
    }

    const data = await res.json();
    const shortLivedToken = data.access_token;

    // Exchange for long-lived 60-day token
    const exchangeParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    });

    const longLivedRes = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?${exchangeParams.toString()}`);
    const longLivedData = longLivedRes.ok ? await longLivedRes.json() : data;

    return {
      accessToken: longLivedData.access_token,
      expiresIn: longLivedData.expires_in || 5184000, // 60 days in seconds
      scopes: ["pages_manage_posts", "instagram_content_publish", "instagram_basic"],
      metadata: { tokenType: "Bearer" },
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,picture{url},access_token,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Failed to fetch accounts from Meta");
    }

    const data = await res.json();
    const accounts: SocialAccountInfo[] = [];

    for (const page of data.data || []) {
      if (this.platform === "facebook") {
        accounts.push({
          providerAccountId: page.id,
          displayName: page.name,
          profileImageUrl: page.picture?.data?.url,
          accountType: "PAGE",
          metadata: { pageAccessToken: page.access_token },
        });
      }

      if (this.platform === "instagram" && page.instagram_business_account) {
        const ig = page.instagram_business_account;
        accounts.push({
          providerAccountId: ig.id,
          displayName: ig.username || page.name,
          username: ig.username,
          profileImageUrl: ig.profile_picture_url || page.picture?.data?.url,
          accountType: "BUSINESS",
          metadata: { pageId: page.id, pageAccessToken: page.access_token },
        });
      }
    }

    // Fallback: If no Facebook Pages found, link the authenticated personal Facebook profile
    if (accounts.length === 0 && this.platform === "facebook") {
      try {
        const meRes = await fetch(
          `https://graph.facebook.com/v20.0/me?fields=id,name,picture{url},email&access_token=${accessToken}`
        );
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.id) {
            accounts.push({
              providerAccountId: meData.id,
              displayName: meData.name || "Facebook User",
              profileImageUrl: meData.picture?.data?.url,
              accountType: "PROFILE",
              metadata: { isPersonalProfile: true },
            });
          }
        }
      } catch {}
    }

    return accounts;
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    if (this.platform === "instagram") {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${accountId}?fields=biography,followers_count,follows_count,media_count,website,profile_picture_url&access_token=${accessToken}`
      );
      if (!res.ok) throw new Error("Failed to fetch Instagram profile metrics");
      const data = await res.json();
      return {
        followersCount: data.followers_count || 0,
        followingCount: data.follows_count || 0,
        postsCount: data.media_count || 0,
        bio: data.biography,
        websiteUrl: data.website,
        raw: data,
      };
    } else {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${accountId}?fields=fan_count,followers_count,about,website&access_token=${accessToken}`
      );
      if (!res.ok) throw new Error("Failed to fetch Facebook Page profile");
      const data = await res.json();
      return {
        followersCount: data.followers_count || data.fan_count || 0,
        followingCount: 0,
        postsCount: 0,
        bio: data.about,
        websiteUrl: data.website,
        raw: data,
      };
    }
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    try {
      if (this.platform === "facebook") {
        const body = new URLSearchParams({
          message: post.content,
          access_token: accessToken,
        });

        if (post.mediaUrls && post.mediaUrls.length > 0) {
          body.append("link", post.mediaUrls[0].url);
        }

        const res = await fetch(`https://graph.facebook.com/v20.0/${post.targetAccountId || "me"}/feed`, {
          method: "POST",
          body,
        });

        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error?.message || "Failed to publish to Facebook" };
        }
        return { success: true, platformPostId: data.id, publishedUrl: `https://facebook.com/${data.id}` };
      } else {
        // Instagram Content Publishing: Step 1 Create Container, Step 2 Publish
        if (!post.mediaUrls || post.mediaUrls.length === 0) {
          return { success: false, error: "Instagram requires at least one image or video to publish a post." };
        }

        const firstMedia = post.mediaUrls[0];
        const containerUrl = `https://graph.facebook.com/v20.0/${post.targetAccountId}/media`;
        const containerParams = new URLSearchParams({
          caption: post.content,
          access_token: accessToken,
          ...(firstMedia.type === "VIDEO"
            ? { media_type: "REELS", video_url: firstMedia.url }
            : { image_url: firstMedia.url }),
        });

        const containerRes = await fetch(containerUrl, { method: "POST", body: containerParams });
        const containerData = await containerRes.json();
        if (!containerRes.ok) {
          return { success: false, error: containerData.error?.message || "Failed to create Instagram media container" };
        }

        const creationId = containerData.id;
        // Step 2: Publish container
        const publishRes = await fetch(`https://graph.facebook.com/v20.0/${post.targetAccountId}/media_publish`, {
          method: "POST",
          body: new URLSearchParams({ creation_id: creationId, access_token: accessToken }),
        });
        const publishData = await publishRes.json();
        if (!publishRes.ok) {
          return { success: false, error: publishData.error?.message || "Failed to publish Instagram container" };
        }

        return { success: true, platformPostId: publishData.id, publishedUrl: `https://instagram.com/p/${publishData.id}` };
      }
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
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
      let impressions = 0;
      let reach = 0;
      let engagementCount = 0;
      if (Array.isArray(data.data)) {
        for (const item of data.data) {
          const sumValues = (item.values || []).reduce((acc: number, v: any) => acc + (typeof v.value === "number" ? v.value : 0), 0);
          if (item.name.includes("impression")) impressions += sumValues;
          if (item.name.includes("reach")) reach += sumValues;
          if (item.name.includes("engaged_users") || item.name.includes("engagement")) engagementCount += sumValues;
        }
      }
      return {
        followers: 0,
        impressions,
        reach,
        engagementCount,
        engagementRate: reach > 0 ? Number(((engagementCount / reach) * 100).toFixed(2)) : 0,
        clicks: 0,
        shares: 0,
        saves: 0,
        isCalculated: false,
        rawJson: JSON.stringify(data),
      };
    } catch {
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
}
