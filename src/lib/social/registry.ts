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

const providers: Record<SupportedPlatform, SocialProvider> = {
  facebook: new MetaProvider("facebook"),
  instagram: new MetaProvider("instagram"),
  linkedin: new LinkedInProvider(),
  x: new XProvider(),
  youtube: new YouTubeProvider(),
  tiktok: new TikTokProvider(),
  pinterest: new PinterestProvider(),
  google_business: new GoogleBusinessProvider(),
  mastodon: new MastodonProvider(),
  snapchat: new SnapchatProvider(),
  threads: new ThreadsProvider(),
  whatsapp: new WhatsAppProvider(),
  reddit: new RedditProvider(),
};

export function getSocialProvider(platform: string): SocialProvider {
  const normalized =
    platform === "google" || platform === "google-business"
      ? "google_business"
      : platform;
  const provider = providers[normalized as SupportedPlatform];
  if (!provider) {
    throw new Error(`Unsupported social platform: ${platform}`);
  }
  return provider;
}

export function getAllSocialProviders() {
  return Object.entries(providers).map(([platform, provider]) => ({
    platform: platform as SupportedPlatform,
    displayName: provider.displayName,
    iconName: provider.iconName,
    isConfigured: provider.isConfigured(),
    missingConfigMessage: provider.isConfigured() ? null : provider.getMissingConfigMessage(),
  }));
}

export function isDemoMode(): boolean {
  return process.env.ENABLE_DEMO_MODE === "true" || process.env.ENABLE_DEMO_MODE === "1";
}
