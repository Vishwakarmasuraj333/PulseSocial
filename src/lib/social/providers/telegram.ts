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
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channel = process.env.TELEGRAM_CHANNEL_ID || "@pulsesocial";

    let botName = "Telegram Bot";
    let botUsername = "pulsesocial_bot";

    if (botToken) {
      try {
        const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.ok && meData.result) {
            botName = meData.result.first_name || botName;
            botUsername = meData.result.username || botUsername;
          }
        }
      } catch {}
    }

    return [
      {
        providerAccountId: `tg-channel-${channel.replace(/[^a-z0-9]/gi, "")}`,
        displayName: `${botName} (${channel})`,
        username: channel.startsWith("@") ? channel : `@${channel}`,
        profileImageUrl: undefined,
        accountType: "BOT_CHANNEL",
      },
    ];
  }

  async getProfile(): Promise<SocialProfileResult> {
    return {
      followersCount: null,
      followingCount: null,
      postsCount: null,
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
      const targetChat = chatId.startsWith("@") ? chatId : `@${chatId}`;
      let endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
      let body: Record<string, any> = {
        chat_id: targetChat,
        text: post.content,
      };

      if (post.mediaUrls && post.mediaUrls.length > 0) {
        const first = post.mediaUrls[0];
        if (first.type === "VIDEO") {
          endpoint = `https://api.telegram.org/bot${botToken}/sendVideo`;
          body = {
            chat_id: targetChat,
            video: first.url,
            caption: post.content,
          };
        } else {
          endpoint = `https://api.telegram.org/bot${botToken}/sendPhoto`;
          body = {
            chat_id: targetChat,
            photo: first.url,
            caption: post.content,
          };
        }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        return {
          success: false,
          error: data.description || "Failed to post message to Telegram channel",
        };
      }

      const messageId = String(data.result?.message_id);
      return {
        success: true,
        platformPostId: messageId,
        publishedUrl: `https://t.me/${chatId.replace(/^@/, "")}/${messageId}`,
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
