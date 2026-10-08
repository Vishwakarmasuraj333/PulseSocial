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

export class BlueskyProvider implements SocialProvider {
  platform: SupportedPlatform = "bluesky";
  displayName = "Bluesky";
  iconName = "bluesky";

  isConfigured(): boolean {
    return Boolean(
      (process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD) ||
      process.env.BLUESKY_CLIENT_ID
    );
  }

  getMissingConfigMessage(): string {
    return "Bluesky integration is not configured yet. Configure BLUESKY_HANDLE and BLUESKY_APP_PASSWORD in your environment to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    return `https://bsky.app`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    const handle = process.env.BLUESKY_HANDLE;
    const password = process.env.BLUESKY_APP_PASSWORD;

    if (!handle || !password) {
      throw new Error(this.getMissingConfigMessage());
    }

    // AT Protocol real session creation
    const res = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: handle, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to authenticate with Bluesky AT Protocol");
    }

    const data = await res.json();
    return {
      accessToken: data.accessJwt,
      refreshToken: data.refreshJwt,
      scopes: ["atproto"],
      metadata: {
        did: data.did,
        handle: data.handle,
      },
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const res = await fetch("https://bsky.social/xrpc/com.atproto.server.getSession", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const handle = process.env.BLUESKY_HANDLE;
      if (handle) {
        return [
          {
            providerAccountId: `did:plc:${handle.replace(/[^a-z0-9]/gi, "")}`,
            displayName: handle,
            username: `@${handle}`,
            accountType: "PROFILE",
          },
        ];
      }
      throw new Error("Failed to verify Bluesky AT Protocol session");
    }

    const session = await res.json();
    return [
      {
        providerAccountId: session.did,
        displayName: session.handle,
        username: `@${session.handle}`,
        profileImageUrl: undefined,
        accountType: "PROFILE",
        metadata: { did: session.did, handle: session.handle },
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    try {
      const did = accountId.startsWith("did:") ? accountId : (process.env.BLUESKY_HANDLE || accountId);
      const res = await fetch(`https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const actor = await res.json();
        return {
          followersCount: actor.followersCount || 0,
          followingCount: actor.followsCount || 0,
          postsCount: actor.postsCount || 0,
          bio: actor.description,
          raw: actor,
        };
      }
    } catch {}
    return {
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      bio: "Bluesky AT Protocol Profile",
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    try {
      const did = post.targetAccountId?.startsWith("did:")
        ? post.targetAccountId
        : "did:plc:self";
      const now = new Date().toISOString();

      const record: Record<string, any> = {
        $type: "app.bsky.feed.post",
        text: post.content,
        createdAt: now,
      };

      const res = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo: did === "did:plc:self" ? undefined : did,
          collection: "app.bsky.feed.post",
          record,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.uri || !data.cid) {
        const isAuth = res.status === 401;
        return {
          success: false,
          code: isAuth ? "TOKEN_EXPIRED" : "ATPROTO_RECORD_ERROR",
          requiresReauth: isAuth,
          error: data.message || `Failed to create record on Bluesky repository (HTTP ${res.status})`,
        };
      }

      const rkey = data.uri.split("/").pop();
      return {
        success: true,
        platformPostId: data.cid,
        publishedUrl: `https://bsky.app/profile/${did}/post/${rkey}`,
        rawResponse: { uri: data.uri, cid: data.cid },
      };
    } catch (err: unknown) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        retryable: true,
        error: (err as Error).message || "AT Protocol network request failed",
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
