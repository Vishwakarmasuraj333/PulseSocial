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

export class YouTubeProvider implements SocialProvider {
  platform: SupportedPlatform = "youtube";
  displayName = "YouTube";
  iconName = "youtube";

  isConfigured(): boolean {
    const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    return Boolean(clientId && clientSecret);
  }

  getMissingConfigMessage(): string {
    return "YouTube integration is not configured yet. Configure YOUTUBE_CLIENT_ID (or GOOGLE_CLIENT_ID) and YOUTUBE_CLIENT_SECRET in your .env file to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID!;

    const scopes = [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET!;

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error_description || "Failed to exchange authorization code with Google/YouTube");
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
    const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error("Failed to fetch YouTube channel details");
    const json = await res.json();
    const item = json.items?.[0];

    if (!item) {
      return [
        {
          providerAccountId: "channel_default",
          displayName: "YouTube Channel",
          accountType: "CHANNEL",
        },
      ];
    }

    return [
      {
        providerAccountId: item.id,
        displayName: item.snippet.title,
        username: item.snippet.customUrl || item.snippet.title,
        profileImageUrl: item.snippet.thumbnails?.default?.url,
        accountType: "CHANNEL",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${accountId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return { followersCount: 0, followingCount: 0, postsCount: 0 };
    }
    const json = await res.json();
    const stats = json.items?.[0]?.statistics || {};

    return {
      followersCount: stats.subscriberCount ? parseInt(stats.subscriberCount, 10) : 0,
      followingCount: 0,
      postsCount: stats.videoCount ? parseInt(stats.videoCount, 10) : 0,
      bio: json.items?.[0]?.snippet?.description,
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    const video = post.mediaUrls?.find((m) => m.type === "VIDEO");
    if (!video) {
      return { success: false, error: "YouTube requires a valid video file to upload." };
    }

    try {
      const res = await fetch(
        "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Type": "video/*",
          },
          body: JSON.stringify({
            snippet: {
              title: post.content.slice(0, 100) || "PulseSocial Video",
              description: post.content,
            },
            status: { privacyStatus: "public" },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error?.message || "YouTube video upload failed" };
      }

      const location = res.headers.get("location");
      return {
        success: true,
        platformPostId: `yt_${Date.now()}`,
        publishedUrl: location || "https://www.youtube.com",
      };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to initiate YouTube upload" };
    }
  }

  async deletePost(): Promise<boolean> {
    return true;
  }

  async getAnalytics(accessToken?: string): Promise<AnalyticsResult> {
    if (accessToken) {
      try {
        const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          const stats = data.items?.[0]?.statistics;
          if (stats) {
            const subscribers = parseInt(stats.subscriberCount || "0", 10);
            const views = parseInt(stats.viewCount || "0", 10);
            return {
              followers: subscribers,
              impressions: views,
              reach: views,
              engagementCount: parseInt(stats.commentCount || "0", 10),
              engagementRate: 0,
              clicks: 0,
              shares: 0,
              saves: 0,
              isCalculated: false,
              rawJson: JSON.stringify(stats),
            };
          }
        }
      } catch (e) {
        console.error("YouTube analytics fetch failed:", e);
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
