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

export class LinkedInProvider implements SocialProvider {
  platform: SupportedPlatform = "linkedin";
  displayName = "LinkedIn";
  iconName = "linkedin";

  isConfigured(): boolean {
    return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
  }

  getMissingConfigMessage(): string {
    return "LinkedIn integration is not configured yet. Configure LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const scopes = ["openid", "profile", "email", "w_member_social"].join(" ");
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: redirectUri,
      state,
      scope: scopes,
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    });

    const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error_description || "Failed to exchange authorization code with LinkedIn");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
      refreshTokenExpiresIn: data.refresh_token_expires_in,
      scopes: (data.scope || "").split(" "),
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error("Failed to fetch LinkedIn member profile");
    const userinfo = await res.json();

    return [
      {
        providerAccountId: userinfo.sub,
        displayName: userinfo.name || `${userinfo.given_name} ${userinfo.family_name}`,
        username: userinfo.email || userinfo.sub,
        profileImageUrl: userinfo.picture,
        accountType: "PROFILE",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    try {
      const res = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const info = await res.json();
        return {
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          bio: info.name ? `LinkedIn profile for ${info.name}` : undefined,
          raw: info,
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
    try {
      const payload = {
        author: `urn:li:person:${post.targetAccountId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: post.content },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };

      const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || "Failed to publish LinkedIn post" };
      return { success: true, platformPostId: data.id, publishedUrl: `https://www.linkedin.com/feed/update/${data.id}` };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  }

  async deletePost(accessToken: string, platformPostId: string): Promise<boolean> {
    const res = await fetch(`https://api.linkedin.com/v2/ugcPosts/${encodeURIComponent(platformPostId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok;
  }

  async getAnalytics(accessToken?: string, accountId?: string): Promise<AnalyticsResult> {
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
    // LinkedIn member messaging API is restricted
    return [];
  }

  async disconnect(): Promise<boolean> {
    return true;
  }
}
