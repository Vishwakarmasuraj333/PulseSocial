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

export class TikTokProvider implements SocialProvider {
  platform: SupportedPlatform = "tiktok";
  displayName = "TikTok";
  iconName = "tiktok";

  isConfigured(): boolean {
    return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
  }

  getMissingConfigMessage(): string {
    return "TikTok integration is not configured yet. Configure TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string, codeVerifier?: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const clientKey = process.env.TIKTOK_CLIENT_KEY!;
    const scopes = ["user.info.basic", "user.info.profile", "video.publish", "video.upload"].join(",");
    const params = new URLSearchParams({
      client_key: clientKey,
      scope: scopes,
      response_type: "code",
      redirect_uri: redirectUri,
      state,
      code_challenge: codeVerifier || state,
      code_challenge_method: "S256",
    });

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string, codeVerifier?: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const body = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: codeVerifier || "",
    });

    const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error_description || "Failed to exchange authorization code with TikTok");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
      refreshTokenExpiresIn: data.refresh_expires_in,
      scopes: (data.scope || "").split(","),
      metadata: { openId: data.open_id },
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const res = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error("Failed to fetch TikTok user info");
    const json = await res.json();
    const user = json.data?.user || {};

    return [
      {
        providerAccountId: user.open_id || "tiktok_account",
        displayName: user.display_name || "TikTok Creator",
        username: user.username || "creator",
        profileImageUrl: user.avatar_url,
        accountType: "PROFILE",
      },
    ];
  }

  async getProfile(accessToken: string): Promise<SocialProfileResult> {
    try {
      const res = await fetch(
        "https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count,bio_description",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (res.ok) {
        const json = await res.json();
        const user = json.data?.user || {};
        return {
          followersCount: user.follower_count || 0,
          followingCount: user.following_count || 0,
          postsCount: user.video_count || 0,
          bio: user.bio_description,
          raw: json,
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
    const video = post.mediaUrls?.find((m) => m.type === "VIDEO");
    if (!video) {
      return {
        success: false,
        code: "INVALID_MEDIA",
        error: "TikTok Content Posting API requires a video file. Photo publishing is not supported by standard TikTok API endpoints.",
      };
    }

    try {
      // Step 1: Initialize Direct Post with TikTok Content Posting API v2
      const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_info: {
            title: post.content.slice(0, 150) || "PulseSocial Post",
            privacy_level: "PUBLIC_TO_EVERYONE",
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000,
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: video.url,
          },
        }),
      });

      const initData = await initRes.json().catch(() => ({}));

      // TikTok returns error if app does not have verified Direct Post partner approval
      if (!initRes.ok || initData.error?.code !== "ok") {
        const errCode = initData.error?.code || String(initRes.status);
        const errMsg = initData.error?.message || "TikTok API error";

        return {
          success: false,
          code: "WAITING_FOR_TIKTOK_APPROVAL",
          capabilityState: "WAITING_FOR_TIKTOK_APPROVAL",
          requiresApproval: true,
          error: `TikTok Direct Video Posting requires Direct Post approval under your TikTok for Developers account (video.publish scope). Remote response: ${errMsg} (${errCode})`,
        };
      }

      const publishId = initData.data?.publish_id;
      if (!publishId) {
        return {
          success: false,
          code: "MISSING_PUBLISH_ID",
          error: "TikTok initialized successfully but did not return a valid publish_id.",
        };
      }

      return {
        success: true,
        platformPostId: publishId,
        publishedUrl: `https://www.tiktok.com`,
        rawResponse: initData,
      };
    } catch (err: unknown) {
      return {
        success: false,
        code: "WAITING_FOR_TIKTOK_APPROVAL",
        capabilityState: "WAITING_FOR_TIKTOK_APPROVAL",
        requiresApproval: true,
        error: "TikTok Direct Video Posting requires Direct Post approval under your TikTok for Developers account.",
      };
    }
  }

  async deletePost(): Promise<boolean> {
    return false; // TikTok API does not support post deletion via API
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
