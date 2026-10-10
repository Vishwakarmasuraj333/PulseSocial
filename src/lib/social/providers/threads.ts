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
import { SOCIAL_API_VERSIONS } from "../api-versions";

export class ThreadsProvider implements SocialProvider {
  platform: SupportedPlatform = "threads";
  displayName = "Threads";
  iconName = "threads";

  isConfigured(): boolean {
    return Boolean(process.env.THREADS_CLIENT_ID && process.env.THREADS_CLIENT_SECRET);
  }

  getMissingConfigMessage(): string {
    return "Threads integration is not configured yet. Configure THREADS_CLIENT_ID and THREADS_CLIENT_SECRET to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const scopes = ["threads_basic", "threads_content_publish", "threads_read_replies"].join(",");
    const params = new URLSearchParams({
      client_id: process.env.THREADS_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: "code",
      state,
    });

    return `https://threads.net/oauth/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const body = new URLSearchParams({
      client_id: process.env.THREADS_CLIENT_ID!,
      client_secret: process.env.THREADS_CLIENT_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    const res = await fetch("https://graph.threads.net/oauth/access_token", {
      method: "POST",
      body,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error_message?: string }).error_message || "Failed to exchange authorization code with Threads");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      scopes: ["threads_basic", "threads_content_publish"],
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const res = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${accessToken}`);
    if (!res.ok) throw new Error("Failed to fetch Threads profile from official Graph API");

    const user = await res.json();
    return [
      {
        providerAccountId: user.id,
        displayName: user.name || user.username || "Threads Creator",
        username: user.username ? `@${user.username}` : undefined,
        profileImageUrl: user.threads_profile_picture_url || undefined,
        accountType: "PROFILE",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    try {
      const res = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url,threads_biography&access_token=${accessToken}`);
      if (res.ok) {
        const user = await res.json();
        return {
          followersCount: null,
          followingCount: null,
          postsCount: null,
          bio: user.threads_biography || undefined,
          raw: user,
        };
      }
    } catch {}
    return {
      followersCount: null,
      followingCount: null,
      postsCount: null,
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    try {
      const userId = post.targetAccountId || "me";
      
      // Step 1: Create Threads Media Container
      const containerParams = new URLSearchParams({
        media_type: "TEXT",
        text: post.content,
        access_token: accessToken,
      });

      if (post.mediaUrls && post.mediaUrls.length > 0) {
        const first = post.mediaUrls[0];
        if (first.type === "IMAGE") {
          containerParams.set("media_type", "IMAGE");
          containerParams.set("image_url", first.url);
        } else if (first.type === "VIDEO") {
          containerParams.set("media_type", "VIDEO");
          containerParams.set("video_url", first.url);
        }
      }

      const containerRes = await fetch(`https://graph.threads.net/${SOCIAL_API_VERSIONS.THREADS_API}/${userId}/threads`, {
        method: "POST",
        body: containerParams,
      });

      const containerData = await containerRes.json().catch(() => ({}));
      if (!containerRes.ok || !containerData.id) {
        const isAuth = containerRes.status === 401;
        const isPermission = containerRes.status === 403;
        return {
          success: false,
          code: isAuth ? "TOKEN_EXPIRED" : isPermission ? "PERMISSION_DENIED" : "CONTAINER_FAILED",
          requiresReauth: isAuth,
          requiresApproval: isPermission,
          error: containerData.error?.message || "Failed to create Threads post container",
        };
      }

      // Step 2: Publish Threads Container
      const publishParams = new URLSearchParams({
        creation_id: containerData.id,
        access_token: accessToken,
      });

      const publishRes = await fetch(`https://graph.threads.net/${SOCIAL_API_VERSIONS.THREADS_API}/${userId}/threads_publish`, {
        method: "POST",
        body: publishParams,
      });

      const publishData = await publishRes.json().catch(() => ({}));
      if (!publishRes.ok || !publishData.id) {
        return {
          success: false,
          code: "PUBLISH_FAILED",
          error: publishData.error?.message || "Failed to publish Threads container",
        };
      }

      return {
        success: true,
        platformPostId: publishData.id,
        publishedUrl: `https://threads.net/post/${publishData.id}`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        retryable: true,
        error: (err as Error).message || "Threads publish request failed",
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
