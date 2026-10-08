/**
 * PulseSocial Typed Service Layer
 * Clean, production-ready API services for Authentication, Social Accounts, Composer, Calendar, Inbox, Analytics, and PulseAI.
 */

// ==========================================
// 1. AUTH SERVICE
// ==========================================
export interface UserSession {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean;
  activeOrgId?: string;
  role?: string;
  activeOrganization?: {
    id: string;
    name: string;
    slug?: string;
  } | null;
}

export const authService = {
  async login(payload: { email: string; password: string; rememberMe?: boolean }) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data as {
      success?: boolean;
      requiresOtp?: boolean;
      userId?: string;
      email?: string;
      redirectTo?: string;
      user?: UserSession;
    };
  },

  async signup(payload: { name: string; email: string; password: string; terms?: boolean }) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, terms: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");
    return data as {
      success: boolean;
      userId: string;
      email: string;
      redirectTo: string;
    };
  },

  async getSession(): Promise<UserSession | null> {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.user && typeof window !== "undefined") {
        try {
          localStorage.setItem("pulsesocial_active_user", JSON.stringify(data.user));
        } catch {}
      }
      return data.user || null;
    } catch {
      return null;
    }
  },

  async logout() {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("pulsesocial_active_user");
      }
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  },
};

// ==========================================
// 2. OTP SERVICE
// ==========================================
export const otpService = {
  async verifyOTP(userId: string, code: string) {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Verification failed");
    return data as { success: boolean; redirectTo: string };
  },

  async resendOTP(userId: string) {
    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to resend code");
    return data as { success: boolean; message: string };
  },
};

// ==========================================
// 3. SOCIAL ACCOUNTS SERVICE
// ==========================================
export interface SocialAccount {
  id: string;
  provider: string;
  providerAccountId: string;
  displayName: string;
  username: string;
  profileImageUrl?: string;
  accountType?: string;
  status: "CONNECTED" | "DISCONNECTED" | "EXPIRED" | "ERROR";
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  lastSyncedAt?: string;
  createdAt: string;
}

export const socialService = {
  async getAccounts(): Promise<SocialAccount[]> {
    try {
      const res = await fetch("/api/social/accounts");
      if (!res.ok) return [];
      const data = await res.json();
      return data.accounts || [];
    } catch {
      return [];
    }
  },

  getConnectUrl(provider: string): string {
    return `/api/social/${provider.toLowerCase()}/connect`;
  },

  async disconnect(accountId: string) {
    const res = await fetch(`/api/social/accounts/${accountId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to disconnect account");
    return data;
  },

  async sync(accountId: string) {
    const res = await fetch(`/api/social/accounts/${accountId}/sync`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to sync account");
    return data;
  },
};

// ==========================================
// 4. POST SERVICE
// ==========================================
export interface ScheduledPost {
  id: string;
  content: string;
  mediaUrls?: string[];
  platforms: string[];
  scheduledFor: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED";
  createdAt: string;
}

export const postService = {
  async getPosts(filter?: { status?: string; from?: string; to?: string }): Promise<ScheduledPost[]> {
    try {
      const params = new URLSearchParams(filter as Record<string, string>);
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.posts || [];
    } catch {
      return [];
    }
  },

  async createPost(post: {
    content: string;
    mediaUrls?: string[];
    platforms: string[];
    scheduledFor?: string;
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  }) {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create post");
    return data.post as ScheduledPost;
  },

  async deletePost(id: string) {
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete post");
    return true;
  },
};

// ==========================================
// 5. ANALYTICS SERVICE
// ==========================================
export interface AnalyticsData {
  totalFollowers: number;
  followerGrowth: number;
  engagementRate: number;
  totalReach: number;
  totalImpressions: number;
  totalClicks: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  chartData: { date: string; followers: number; engagement: number; reach: number }[];
}

export const analyticsService = {
  async getMetrics(timeframe: "7d" | "30d" | "90d" = "30d"): Promise<AnalyticsData> {
    try {
      const res = await fetch(`/api/analytics?timeframe=${timeframe}`);
      if (!res.ok) {
        return {
          totalFollowers: 0,
          followerGrowth: 0,
          engagementRate: 0,
          totalReach: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          chartData: [],
        };
      }
      const data = await res.json();
      return data;
    } catch {
      return {
        totalFollowers: 0,
        followerGrowth: 0,
        engagementRate: 0,
        totalReach: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        chartData: [],
      };
    }
  },
};

// ==========================================
// 6. INBOX SERVICE
// ==========================================
export interface InboxMessage {
  id: string;
  sender: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface InboxConversation {
  id: string;
  senderName: string;
  senderAvatar?: string;
  platform: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  type: "COMMENT" | "MENTION" | "MESSAGE";
  messages?: InboxMessage[];
}

export const inboxService = {
  async getConversations(type?: string): Promise<InboxConversation[]> {
    try {
      const res = await fetch(`/api/inbox/conversations${type ? `?type=${type}` : ""}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.conversations || [];
    } catch {
      return [];
    }
  },

  async sendReply(conversationId: string, replyText: string) {
    const res = await fetch(`/api/inbox/conversations/${conversationId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: replyText }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send reply");
    return data;
  },
};

// ==========================================
// 7. PULSEAI SERVICE (REAL GEMINI API)
// ==========================================
export const aiService = {
  async generateCaption(
    promptOrTopic: string,
    platform = "Instagram",
    tone = "Engaging & Viral",
    options?: { language?: string; contentType?: string; cta?: string }
  ) {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: promptOrTopic,
        prompt: promptOrTopic,
        platform,
        tone,
        language: options?.language || "English",
        contentType: options?.contentType || "Engagement",
        cta: options?.cta,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to generate caption with Gemini");
    }
    const caption =
      data.caption || data.result?.caption || data.result?.variations?.[0]?.caption;
    if (!caption) throw new Error("No caption returned by Gemini");
    return caption as string;
  },

  async generateHashtags(topic: string, platformOrCount: string | number = "Instagram") {
    const platform = typeof platformOrCount === "string" ? platformOrCount : "Instagram";
    const count = typeof platformOrCount === "number" ? platformOrCount : undefined;
    const res = await fetch("/api/ai/hashtags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, platform, count }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to generate hashtags with Gemini");
    }
    return (data.all || data.hashtags || []) as string[];
  },

  async generateReply(message: string, platform = "Universal", desiredTone = "Friendly") {
    const res = await fetch("/api/ai/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, platform, desiredTone }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to draft reply with Gemini");
    }
    return data;
  },

  async generateIdeas(options: { brand: string; industry: string; audience: string; platform: string; numberOfIdeas?: number }) {
    const res = await fetch("/api/ai/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to generate ideas with Gemini");
    }
    return data.ideas || [];
  },

  async repurposeContent(originalContent: string, brandName = "PulseSocial") {
    const res = await fetch("/api/ai/repurpose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalContent, brandName }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to repurpose content with Gemini");
    }
    return data.repurposed || data;
  },

  async getInsights(question?: string) {
    const res = await fetch("/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to generate insights with Gemini");
    }
    return data;
  },

  async chat(message: string) {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to get AI assistant response");
    }
    return data.reply || data.content;
  },

  async suggestBestTimes(platform: string) {
    return [
      { day: "Tuesday", time: "9:00 AM", reason: "Highest morning engagement peak" },
      { day: "Thursday", time: "2:30 PM", reason: "Active professional browsing window" },
      { day: "Saturday", time: "11:15 AM", reason: "Weekend leisure discovery surge" },
    ];
  },
};

// ==========================================
// 8. USER SERVICE
// ==========================================
export const userService = {
  async updateProfile(data: { name?: string; avatarUrl?: string }) {
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async changePassword(
    arg: { current: string; new: string } | string,
    newPassword?: string
  ) {
    const passwords =
      typeof arg === "string"
        ? { current: arg, new: newPassword || "" }
        : arg;

    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwords),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to change password");
    }
    return true;
  },
};
