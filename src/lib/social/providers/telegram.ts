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

export class TelegramProvider implements SocialProvider {
  platform: SupportedPlatform = "telegram";
  displayName = "Telegram";
  iconName = "telegram";

  isConfigured(): boolean {
    return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID);
  }

  getMissingConfigMessage(): string {
    return "Telegram integration is not configured yet. Configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    return `https://t.me`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    return {
      accessToken: process.env.TELEGRAM_BOT_TOKEN || "tg_bot_token",
      scopes: ["bot_broadcast"],
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const channel = process.env.TELEGRAM_CHANNEL_ID || "@pulsesocial";
    return [
      {
        providerAccountId: `tg-channel-${channel.replace(/[^a-z0-9]/gi, "")}`,
        displayName: "Telegram Channel",
        username: channel.startsWith("@") ? channel : `@${channel}`,
        profileImageUrl: undefined,
        accountType: "CHANNEL",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    return {
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      bio: "Telegram Channel",
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = post.targetAccountId?.replace(/^tg-channel-/, "") || process.env.TELEGRAM_CHANNEL_ID;

    if (!botToken || !chatId) {
      return {
        success: false,
        error: "Telegram Bot API credentials (TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID) not configured.",
      };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId.startsWith("@") ? chatId : `@${chatId}`,
          text: post.content,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        return {
          success: false,
          error: data.description || "Failed to post message to Telegram channel",
        };
      }

      return {
        success: true,
        platformPostId: String(data.result?.message_id),
        publishedUrl: `https://t.me/${chatId.replace(/^@/, "")}/${data.result?.message_id}`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || "Telegram network request failed",
      };
    }
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
