import { SupportedPlatform, SocialProvider } from "./types";
import { MetaProvider } from "./providers/meta";
import { LinkedInProvider } from "./providers/linkedin";
import { TikTokProvider } from "./providers/tiktok";
import { XProvider } from "./providers/x";
import { YouTubeProvider } from "./providers/youtube";
import { PinterestProvider } from "./providers/pinterest";
import { GoogleBusinessProvider } from "./providers/google-business";
import { MastodonProvider } from "./providers/mastodon";
import { SnapchatProvider } from "./providers/snapchat";
import { ThreadsProvider } from "./providers/threads";
import { WhatsAppProvider } from "./providers/whatsapp";
import { RedditProvider } from "./providers/reddit";
import { BlueskyProvider } from "./providers/bluesky";
import { TelegramProvider } from "./providers/telegram";

const providerFactories: Record<SupportedPlatform, () => SocialProvider> = {
  facebook: () => new MetaProvider("facebook"),
  instagram: () => new MetaProvider("instagram"),
  linkedin: () => new LinkedInProvider(),
  x: () => new XProvider(),
  youtube: () => new YouTubeProvider(),
  tiktok: () => new TikTokProvider(),
  pinterest: () => new PinterestProvider(),
  google_business: () => new GoogleBusinessProvider(),
  mastodon: () => new MastodonProvider(),
  snapchat: () => new SnapchatProvider(),
  threads: () => new ThreadsProvider(),
  whatsapp: () => new WhatsAppProvider(),
  reddit: () => new RedditProvider(),
  bluesky: () => new BlueskyProvider(),
  telegram: () => new TelegramProvider(),
};

const providerInstances: Partial<Record<SupportedPlatform, SocialProvider>> = {};

export function getSocialProvider(platform: string): SocialProvider {
  const normalized = (
    platform === "google" || platform === "google-business"
      ? "google_business"
      : platform.toLowerCase()
  ) as SupportedPlatform;

  if (!providerInstances[normalized]) {
    const factory = providerFactories[normalized];
    if (!factory) {
      throw new Error(`Unsupported social platform: ${platform}`);
    }
    providerInstances[normalized] = factory();
  }
  return providerInstances[normalized]!;
}

export function getAllSocialProviders() {
  const platforms = Object.keys(providerFactories) as SupportedPlatform[];
  return platforms.map((platform) => {
    try {
      const provider = getSocialProvider(platform);
      const configured = provider.isConfigured();
      return {
        platform,
        displayName: provider.displayName,
        iconName: provider.iconName,
        isConfigured: configured,
        missingConfigMessage: configured ? null : provider.getMissingConfigMessage(),
      };
    } catch {
      return {
        platform,
        displayName: platform.toUpperCase(),
        iconName: platform,
        isConfigured: false,
        missingConfigMessage: `${platform} configuration is required.`,
      };
    }
  });
}

export function isDemoMode(): boolean {
  return process.env.ENABLE_DEMO_MODE === "true" || process.env.ENABLE_DEMO_MODE === "1";
}
