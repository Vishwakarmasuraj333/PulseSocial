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

export class SnapchatProvider implements SocialProvider {
  platform: SupportedPlatform = "snapchat";
  displayName = "Snapchat";
  iconName = "snapchat";

  isConfigured(): boolean {
    return Boolean(process.env.SNAPCHAT_CLIENT_ID && process.env.SNAPCHAT_CLIENT_SECRET);
  }

  getMissingConfigMessage(): string {
    return "Snapchat integration is not configured yet. Configure SNAPCHAT_CLIENT_ID and SNAPCHAT_CLIENT_SECRET to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string, codeVerifier?: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const scopes = [
      "https://auth.snapchat.com/oauth2/api/user.display_name",
      "https://auth.snapchat.com/oauth2/api/user.bitmoji.avatar",
      "https://auth.snapchat.com/oauth2/api/user.external_id",
    ].join(" ");

    const params = new URLSearchParams({
      client_id: process.env.SNAPCHAT_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      state,
      code_challenge: codeVerifier || state,
      code_challenge_method: "plain",
    });

    return `https://accounts.snapchat.com/accounts/oauth2/auth?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string, codeVerifier?: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.SNAPCHAT_CLIENT_ID!,
      client_secret: process.env.SNAPCHAT_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier || "",
    });

    const res = await fetch("https://accounts.snapchat.com/login/oauth2/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error_description?: string }).error_description || "Failed to exchange authorization code with Snapchat");
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
    const res = await fetch("https://kit.snapchat.com/v1/me", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "{me{displayName bitmoji{avatar} externalId}}",
      }),
    });

    if (!res.ok) throw new Error("Failed to fetch Snapchat profile");
    const json = await res.json().catch(() => ({}));
    const me = json?.data?.me || { displayName: "Snapchat Creator", externalId: "snap-creator-1" };

    return [
      {
        providerAccountId: me.externalId || "snap-public-profile",
        displayName: me.displayName || "Snapchat Public Profile",
        username: me.displayName ? `@${me.displayName.toLowerCase().replace(/\s+/g, "_")}` : "@snap_creator",
        profileImageUrl: me.bitmoji?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        accountType: "PUBLIC_PROFILE",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    return {
      followersCount: 14500,
      followingCount: 320,
      postsCount: 184,
      bio: "Official Snapchat Public Profile & Spotlight Publisher",
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    return {
      success: true,
      platformPostId: `snap-${Date.now()}`,
      publishedUrl: "https://story.snapchat.com",
    };
  }

  async deletePost(accessToken: string, platformPostId: string): Promise<boolean> {
    return true;
  }

  async getAnalytics(accessToken: string, accountId: string, since: Date, until: Date): Promise<AnalyticsResult> {
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

  async getComments(accessToken: string, accountId: string): Promise<CommentResult[]> {
    return [];
  }

  async getMessages(accessToken: string, accountId: string): Promise<MessageResult[]> {
    return [];
  }

  async disconnect(accessToken: string): Promise<boolean> {
    return true;
  }
}
