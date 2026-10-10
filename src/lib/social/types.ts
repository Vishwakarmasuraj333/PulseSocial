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
  followersCount: number | null;
  followingCount: number | null;
  postsCount: number | null;
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
  code?: string;
  retryable?: boolean;
  requiresReauth?: boolean;
  requiresApproval?: boolean;
  capabilityState?: string;
  rawResponse?: unknown;
}

export type SocialActionType =
  | "LIKE"
  | "UNLIKE"
  | "COMMENT"
  | "REPLY"
  | "SHARE"
  | "REPOST"
  | "SAVE"
  | "DELETE_COMMENT"
  | "HIDE_COMMENT";

export interface PlatformActionCapabilities {
  like: boolean;
  unlike: boolean;
  comment: boolean;
  reply: boolean;
  deleteComment: boolean;
  hideComment: boolean;
  share: boolean;
  repost: boolean;
  save: boolean;
}

export const PLATFORM_ACTION_CAPABILITIES: Record<SupportedPlatform, PlatformActionCapabilities> = {
  facebook: {
    like: true,
    unlike: true,
    comment: true,
    reply: true,
    deleteComment: true,
    hideComment: true,
    share: false,
    repost: false,
    save: false,
  },
  instagram: {
    like: false, // Instagram Graph API explicitly forbids programmatic post liking
    unlike: false,
    comment: true,
    reply: true,
    deleteComment: true,
    hideComment: true,
    share: false,
    repost: false,
    save: false,
  },
  linkedin: {
    like: true, // LinkedIn Reactions API (/rest/reactions)
    unlike: true,
    comment: true, // LinkedIn Social Actions Comments API (/rest/socialActions/.../comments)
    reply: true,
    deleteComment: true,
    hideComment: false,
    share: true,
    repost: true,
    save: false,
  },
  x: {
    like: true, // X API v2 POST /2/users/:id/likes
    unlike: true, // X API v2 DELETE /2/users/:id/likes/:tweet_id
    comment: true, // X API v2 POST /2/tweets (reply)
    reply: true,
    deleteComment: true, // X API v2 DELETE /2/tweets/:id
    hideComment: true, // X API v2 PUT /2/tweets/:id/hidden
    share: false,
    repost: true, // X API v2 POST /2/users/:id/retweets
    save: true, // X API v2 POST /2/users/:id/bookmarks
  },
  youtube: {
    like: true, // YouTube Data API v3 POST /videos/rate?rating=like
    unlike: true, // YouTube Data API v3 POST /videos/rate?rating=none
    comment: true, // YouTube Data API v3 POST /commentThreads
    reply: true, // YouTube Data API v3 POST /comments
    deleteComment: true, // YouTube Data API v3 DELETE /comments
    hideComment: false,
    share: false,
    repost: false,
    save: false,
  },
  mastodon: {
    like: true, // Mastodon REST API POST /api/v1/statuses/:id/favourite
    unlike: true, // Mastodon REST API POST /api/v1/statuses/:id/unfavourite
    comment: true, // Mastodon REST API POST /api/v1/statuses with in_reply_to_id
    reply: true,
    deleteComment: true, // Mastodon REST API DELETE /api/v1/statuses/:id
    hideComment: false,
    share: false,
    repost: true, // Mastodon REST API POST /api/v1/statuses/:id/reblog
    save: true, // Mastodon REST API POST /api/v1/statuses/:id/bookmark
  },
  tiktok: {
    like: false,
    unlike: false,
    comment: false,
    reply: false,
    deleteComment: false,
    hideComment: false,
    share: false,
    repost: false,
    save: false,
  },
  pinterest: {
    like: false,
    unlike: false,
    comment: false,
    reply: false,
    deleteComment: false,
    hideComment: false,
    share: false,
    repost: false,
    save: false,
  },
  threads: {
    like: false,
    unlike: false,
    comment: true,
    reply: true,
    deleteComment: true,
    hideComment: true,
    share: false,
    repost: false,
    save: false,
  },
  google_business: {
    like: false,
    unlike: false,
    comment: false,
    reply: true,
    deleteComment: false,
    hideComment: false,
    share: false,
    repost: false,
    save: false,
  },
  snapchat: {
    like: false,
    unlike: false,
    comment: false,
    reply: false,
    deleteComment: false,
    hideComment: false,
    share: false,
    repost: false,
    save: false,
  },
  whatsapp: {
    like: false,
    unlike: false,
    comment: false,
    reply: false,
    deleteComment: false,
    hideComment: false,
    share: false,
    repost: false,
    save: false,
  },
  reddit: {
    like: true,
    unlike: true,
    comment: true,
    reply: true,
    deleteComment: true,
    hideComment: false,
    share: false,
    repost: false,
    save: true,
  },
  bluesky: {
    like: true,
    unlike: true,
    comment: true,
    reply: true,
    deleteComment: true,
    hideComment: false,
    share: false,
    repost: true,
    save: false,
  },
  telegram: {
    like: false,
    unlike: false,
    comment: false,
    reply: false,
    deleteComment: false,
    hideComment: false,
    share: false,
    repost: false,
    save: false,
  },
};

export interface SocialActionResult {
  success: boolean;
  actionType: SocialActionType;
  externalActionId?: string;
  code?: string;
  error?: string;
  requiresReauth?: boolean;
  requiresApproval?: boolean;
  rawResponse?: unknown;
}

export interface SocialMetricsResult {
  success: boolean;
  platform: SupportedPlatform;
  externalPostId: string;
  likes: number | null;
  reactions: number | null;
  comments: number | null;
  shares: number | null;
  reposts: number | null;
  views: number | null;
  impressions: number | null;
  reach: number | null;
  saves: number | null;
  rawResponse?: unknown;
  error?: string;
  code?: string;
  requiresReauth?: boolean;
}

export interface ExternalCommentData {
  externalCommentId: string;
  platform: SupportedPlatform;
  authorName: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  content: string;
  postedAt: Date;
  externalPostId?: string;
  parentId?: string;
  likeCount?: number | null;
}

export interface AnalyticsResult {
  followers: number | null;
  impressions: number | null;
  reach: number | null;
  engagementCount: number | null;
  engagementRate: number | null;
  clicks: number | null;
  shares: number | null;
  saves: number | null;
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

  // Real Social Engagement Layer additions
  getActionCapabilities?(): PlatformActionCapabilities;
  likePost?(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult>;
  unlikePost?(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult>;
  commentPost?(accessToken: string, target: { externalPostId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }>;
  replyToComment?(accessToken: string, target: { externalPostId?: string; externalCommentId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }>;
  deleteComment?(accessToken: string, target: { externalCommentId: string; accountId?: string }): Promise<SocialActionResult>;
  hideComment?(accessToken: string, target: { externalCommentId: string; accountId?: string }): Promise<SocialActionResult>;
  sharePost?(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult>;
  repostPost?(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult>;
  savePost?(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult>;
  syncPostEngagement?(accessToken: string, externalPostId: string, accountId?: string): Promise<SocialMetricsResult>;
  fetchPostComments?(accessToken: string, externalPostId: string, accountId?: string): Promise<ExternalCommentData[]>;
}
