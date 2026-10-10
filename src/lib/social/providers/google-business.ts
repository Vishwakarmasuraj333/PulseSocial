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

export class GoogleBusinessProvider implements SocialProvider {
  platform: SupportedPlatform = "google_business";
  displayName = "Google Business Profile";
  iconName = "google_business";

  isConfigured(): boolean {
    const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    return Boolean(clientId && clientSecret);
  }

  getMissingConfigMessage(): string {
    return "Google Business Profile is not configured yet. Configure GOOGLE_BUSINESS_CLIENT_ID (or GOOGLE_CLIENT_ID) and GOOGLE_BUSINESS_CLIENT_SECRET to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID!;

    const scopes = [
      "https://www.googleapis.com/auth/business.manage",
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

    const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET!;

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
      throw new Error(err.error_description || "Failed to exchange code with Google");
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
    const res = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || "Failed to fetch accounts from Google Business Profile API. Verification may be required.");
    }

    const data = await res.json();
    const accounts = data.accounts || [];
    return accounts.map((acc: any) => ({
      providerAccountId: acc.name,
      displayName: acc.accountName || "Google Business Profile",
      username: acc.accountName,
      accountType: "BUSINESS",
    }));
  }

  async getProfile(): Promise<SocialProfileResult> {
    return {
      followersCount: null,
      followingCount: null,
      postsCount: null,
      bio: "Google Business Profile Listing",
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    try {
      const locationId = post.targetAccountId;
      if (!locationId) {
        return {
          success: false,
          code: "LOCATION_REQUIRED",
          error: "Google Business Profile location ID is required to publish local posts.",
        };
      }

      const res = await fetch(
        `https://mybusiness.googleapis.com/v4/${locationId}/localPosts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            languageCode: "en-US",
            summary: post.content,
            callToAction: { actionType: "LEARN_MORE", url: "https://pulsesocial.io" },
            topicType: "STANDARD",
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.name) {
        const isForbidden = res.status === 403;
        const isAuth = res.status === 401;
        return {
          success: false,
          code: isForbidden ? "GBP_APPROVAL_REQUIRED" : isAuth ? "TOKEN_EXPIRED" : "GBP_API_ERROR",
          requiresApproval: isForbidden,
          requiresReauth: isAuth,
          capabilityState: isForbidden ? "APPROVAL REQUIRED" : undefined,
          error:
            data.error?.message ||
            `Failed to publish post to Google Business Profile (HTTP ${res.status}). Verify Business Profile API access.`,
        };
      }

      return {
        success: true,
        platformPostId: data.name,
        publishedUrl: data.searchUrl || "https://business.google.com",
      };
    } catch (err: unknown) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        retryable: true,
        error: (err as Error).message || "Failed to connect to Google Business API",
      };
    }
  }

  async deletePost(): Promise<boolean> {
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
}
