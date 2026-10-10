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

export class WhatsAppProvider implements SocialProvider {
  platform: SupportedPlatform = "whatsapp";
  displayName = "WhatsApp Business";
  iconName = "whatsapp";

  isConfigured(): boolean {
    return Boolean(
      (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) ||
      (process.env.META_APP_ID && process.env.META_APP_SECRET)
    );
  }

  getMissingConfigMessage(): string {
    return "WhatsApp Business Cloud API is not configured yet. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in environment variables.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const appId = process.env.META_APP_ID;
    if (!appId) {
      throw new Error(
        "META_APP_ID is required for WhatsApp Embedded Signup OAuth flow. For Direct Cloud API, configure WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN."
      );
    }
    const scopes = ["whatsapp_business_messaging", "whatsapp_business_management"].join(",");
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: "code",
      state,
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    const appId = process.env.META_APP_ID || "";
    const appSecret = process.env.META_APP_SECRET || "";

    if (!appId || !appSecret) {
      if (process.env.WHATSAPP_ACCESS_TOKEN) {
        return {
          accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
          scopes: ["whatsapp_business_messaging", "whatsapp_business_management"],
        };
      }
      throw new Error("Missing META_APP_ID or META_APP_SECRET for WhatsApp code exchange.");
    }

    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    });

    const res = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error?.message || "Failed to exchange code for WhatsApp access token.");
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      scopes: ["whatsapp_business_messaging", "whatsapp_business_management"],
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId) {
      throw new Error("WHATSAPP_PHONE_NUMBER_ID is not configured.");
    }
    if (!token) {
      throw new Error("WHATSAPP_ACCESS_TOKEN is not configured.");
    }

    // Call real Meta Graph API to validate phone number and credentials
    const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(phoneNumberId)}?fields=id,display_phone_number,verified_name,code_verification_status,quality_rating`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `Meta Graph API request failed with status ${res.status}`;
      throw new Error(`WhatsApp API verification failed: ${errMsg}`);
    }

    return [
      {
        providerAccountId: data.id || phoneNumberId,
        displayName: data.verified_name || (data.display_phone_number ? `WhatsApp (${data.display_phone_number})` : "WhatsApp Business"),
        username: data.display_phone_number || phoneNumberId,
        profileImageUrl: undefined,
        accountType: "WHATSAPP_BUSINESS",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    const token = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = accountId || process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (token && phoneId) {
      try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(phoneId)}?fields=id,display_phone_number,verified_name,quality_rating`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          return {
            followersCount: null,
            followingCount: null,
            postsCount: null,
            bio: data.verified_name ? `Verified WhatsApp Account: ${data.verified_name} (Quality: ${data.quality_rating || "UNKNOWN"})` : "WhatsApp Cloud API Account",
          };
        }
      } catch {}
    }

    return {
      followersCount: null,
      followingCount: null,
      postsCount: null,
      bio: "WhatsApp Business Cloud API",
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !token) {
      throw new Error("WhatsApp Cloud API credentials (PHONE_NUMBER_ID / ACCESS_TOKEN) not configured.");
    }

    // WhatsApp Cloud API requires an E.164 recipient phone number
    let recipient = post.targetAccountId;
    if (!recipient || !recipient.startsWith("+")) {
      const match = post.content.match(/\+?[1-9]\d{6,14}/);
      if (match) {
        recipient = match[0];
      }
    }

    if (!recipient) {
      throw new Error("WhatsApp Cloud API requires a recipient phone number in E.164 format (e.g. +1234567890).");
    }

    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: {
        preview_url: false,
        body: post.content,
      },
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(phoneNumberId)}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(`WhatsApp API message failed: ${data.error?.message || res.statusText}`);
    }

    const messageId = data.messages?.[0]?.id;
    if (!messageId) {
      return {
        success: false,
        code: "MISSING_MESSAGE_ID",
        error: "WhatsApp API response did not contain a valid message ID.",
      };
    }

    return {
      success: true,
      platformPostId: messageId,
      publishedUrl: `https://wa.me/${recipient.replace(/\D/g, "")}`,
    };
  }

  async deletePost(): Promise<boolean> {
    return false; // WhatsApp Cloud API does not support remote message deletion via Graph API
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
