export type SupportedPlatform =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "x"
  | "youtube"
  | "tiktok"
  | "pinterest"
  | "google_business"
  | "mastodon"
  | "snapchat"
  | "threads"
  | "whatsapp"
  | "reddit"
  | "bluesky"
  | "telegram";

export interface PlatformCapabilities {
  publish: boolean;
  schedule: boolean;
  comments: boolean;
  messages: boolean;
  analytics: boolean;
  mediaUpload: boolean;
  videoPublish: boolean;
  webhooks: boolean;
  characterLimit: number;
  apiTierRequirement?: string;
  notes?: string;
}

export const PLATFORM_CAPABILITY_MATRIX: Record<SupportedPlatform, PlatformCapabilities> = {
  facebook: {
    publish: true,
    schedule: true,
    comments: true,
    messages: true,
    analytics: true,
    mediaUpload: true,
    videoPublish: true,
    webhooks: true,
    characterLimit: 63206,
    notes: "Requires Facebook Page management permissions (pages_manage_posts, pages_read_engagement).",
  },
  instagram: {
    publish: true,
    schedule: true,
    comments: true,
    messages: true,
    analytics: true,
    mediaUpload: true,
    videoPublish: true,
    webhooks: true,
    characterLimit: 2200,
    notes: "Requires Instagram Professional / Business account connected to a Facebook Page.",
  },
  linkedin: {
    publish: true,
    schedule: true,
    comments: true,
    messages: false, // LinkedIn DMs require partner-level approval (v2 messaging)
    analytics: true,
    mediaUpload: true,
    videoPublish: true,
    webhooks: true,
    characterLimit: 3000,
    notes: "Supports Member and Organization shares via Community Management API.",
  },
  x: {
    publish: true,
    schedule: true,
    comments: true,
    messages: false, // X Direct Messages API requires elevated tier
    analytics: true,
    mediaUpload: true,
    videoPublish: true,
    webhooks: false, // Account Activity API requires enterprise
    characterLimit: 280,
    notes: "OAuth 2.0 with PKCE required. Free tier has posting rate caps.",
  },
  youtube: {
    publish: true, // Video upload
    schedule: true,
    comments: true,
    messages: false,
    analytics: true,
    mediaUpload: true,
    videoPublish: true,
    webhooks: true,
    characterLimit: 5000, // Description limit
    notes: "Supports video uploading with privacyStatus=private/public and scheduled publish.",
  },
  tiktok: {
    publish: true,
    schedule: false, // TikTok Content Posting API directs to inbox or immediate upload
    comments: true,
    messages: false,
    analytics: true,
    mediaUpload: true,
    videoPublish: true,
    webhooks: true,
    characterLimit: 2200,
    notes: "Requires approved TikTok for Developers app with Content Posting API scopes.",
  },
  pinterest: {
    publish: true,
    schedule: true,
    comments: false,
    messages: false,
    analytics: true,
    mediaUpload: true,
    videoPublish: true,
    webhooks: false,
    characterLimit: 500,
    notes: "Requires board ID selection and rich pin media.",
  },
  google_business: {
    publish: true,
    schedule: true,
    comments: true, // Reviews
    messages: true,
    analytics: true,
    mediaUpload: true,
    videoPublish: false,
    webhooks: true,
    characterLimit: 1500,
    notes: "Requires Google My Business API access to manage local business posts and reviews.",
  },
  mastodon: {
    publish: true,
    schedule: true,
    comments: true,
    messages: true, // Direct toots
    analytics: false,
    mediaUpload: true,
    videoPublish: true,
    webhooks: true,
    characterLimit: 500,
    notes: "Decentralized ActivityPub protocol with instance host configuration.",
  },
  snapchat: {
    publish: true,
    schedule: true,
    comments: false,
    messages: false,
    analytics: true,
    mediaUpload: true,
    videoPublish: true,
    webhooks: true,
    characterLimit: 250,
    notes: "Requires approved Snap Kit app with Creative Kit & Marketing API permissions.",
  },
  threads: {
    publish: true,
    schedule: true,
    comments: true,
    messages: false,
    analytics: true,
    mediaUpload: true,
    videoPublish: true,
    webhooks: true,
    characterLimit: 500,
    notes: "Meta Threads API for publishing conversational posts, images, and video.",
  },
  whatsapp: {
    publish: true,
    schedule: true,
    comments: false,
    messages: true,
    analytics: true,
    mediaUpload: true,
    videoPublish: false,
    webhooks: true,
    characterLimit: 4096,
    notes: "WhatsApp Business Cloud API for template broadcasting and interactive messages.",
  },
  reddit: {
    publish: true,
    schedule: true,
    comments: true,
    messages: true,
    analytics: true,
    mediaUpload: true,
    videoPublish: true,
    webhooks: true,
    characterLimit: 40000,
    notes: "Reddit OAuth 2.0 API for submitting to subreddits and tracking post karma.",
  },
  bluesky: {
    publish: true,
    schedule: true,
    comments: true,
    messages: false,
    analytics: false,
    mediaUpload: true,
    videoPublish: true,
    webhooks: true,
    characterLimit: 300,
    notes: "AT Protocol federated social network for open microblogging.",
  },
  telegram: {
    publish: true,
    schedule: true,
    comments: true,
    messages: true,
    analytics: true,
    mediaUpload: true,
    videoPublish: true,
    webhooks: true,
    characterLimit: 4096,
    notes: "Telegram Bot API & Channel publishing for broadcasts and media.",
  },
};

export interface OAuthTokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  refreshTokenExpiresIn?: number;
  scopes: string[];
  metadata?: Record<string, unknown>;
}

export interface SocialAccountInfo {
  providerAccountId: string;
  displayName: string;
  username?: string;
  profileImageUrl?: string;
  accountType?: string;
  metadata?: Record<string, unknown>;
}

export interface SocialProfileResult {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  bio?: string;
  websiteUrl?: string;
  raw?: Record<string, unknown>;
}

export interface PublishPostPayload {
  content: string;
  mediaUrls?: { url: string; type: "IMAGE" | "VIDEO"; altText?: string }[];
  targetAccountId?: string;
  scheduledTime?: Date;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  publishedUrl?: string;
  error?: string;
  rawResponse?: unknown;
}

export interface AnalyticsResult {
  followers: number;
  impressions: number;
  reach: number;
  engagementCount: number;
  engagementRate: number;
  clicks: number;
  shares: number;
  saves: number;
  isCalculated: boolean;
  rawJson?: string;
}

export interface CommentResult {
  id: string;
  platformPostId?: string;
  authorName: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  content: string;
  postedAt: Date;
}

export interface MessageResult {
  id: string;
  senderName: string;
  senderUsername?: string;
  senderAvatarUrl?: string;
  content: string;
  sentAt: Date;
}

export interface SocialProvider {
  platform: SupportedPlatform;
  displayName: string;
  iconName: string;
  isConfigured(): boolean;
  getMissingConfigMessage(): string;
  getAuthorizationUrl(state: string, redirectUri: string, codeVerifier?: string, options?: Record<string, any>): string;
  exchangeCode(code: string, redirectUri: string, codeVerifier?: string): Promise<OAuthTokenResult>;
  refreshToken?(refreshToken: string): Promise<OAuthTokenResult>;
  getAccounts(accessToken: string): Promise<SocialAccountInfo[]>;
  getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult>;
  publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult>;
  deletePost(accessToken: string, platformPostId: string): Promise<boolean>;
  getAnalytics(accessToken: string, accountId: string, since: Date, until: Date): Promise<AnalyticsResult>;
  getComments(accessToken: string, accountId: string): Promise<CommentResult[]>;
  getMessages(accessToken: string, accountId: string): Promise<MessageResult[]>;
  disconnect(accessToken: string): Promise<boolean>;
}
