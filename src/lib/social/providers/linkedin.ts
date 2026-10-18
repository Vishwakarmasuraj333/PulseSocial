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
  PlatformActionCapabilities,
  PLATFORM_ACTION_CAPABILITIES,
  SocialActionResult,
  SocialMetricsResult,
  ExternalCommentData,
  ExternalPostData,
  ExternalInsightsData,
} from "../types";
import { SOCIAL_API_VERSIONS } from "../api-versions";
import { isSafePublicUrl } from "@/lib/security/ssrf";

export class LinkedInProvider implements SocialProvider {
  platform: SupportedPlatform = "linkedin";
  displayName = "LinkedIn";
  iconName = "linkedin";

  isConfigured(): boolean {
    return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
  }

  getMissingConfigMessage(): string {
    return "LinkedIn integration is not configured yet. Configure LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const scopes = process.env.LINKEDIN_OAUTH_SCOPES
      ? process.env.LINKEDIN_OAUTH_SCOPES.split(" ").filter(Boolean).join(" ")
      : ["openid", "profile", "email", "w_member_social"].join(" ");
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: redirectUri,
      state,
      scope: scopes,
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    });

    const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error_description || "Failed to exchange authorization code with LinkedIn");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
      refreshTokenExpiresIn: data.refresh_token_expires_in,
      scopes: (data.scope || "").split(" "),
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthTokenResult> {
    const clientId = process.env.LINKEDIN_CLIENT_ID || "";
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || "";

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || "Failed to refresh LinkedIn token");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token || refreshToken,
      refreshTokenExpiresIn: data.refresh_token_expires_in,
      scopes: (data.scope || "").split(" "),
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error("Failed to fetch LinkedIn member profile");
    const userinfo = await res.json();

    return [
      {
        providerAccountId: userinfo.sub,
        displayName: userinfo.name || `${userinfo.given_name} ${userinfo.family_name}`,
        username: userinfo.email || userinfo.sub,
        profileImageUrl: userinfo.picture,
        accountType: "PROFILE",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    try {
      const res = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const info = await res.json();
        return {
          followersCount: null,
          followingCount: null,
          postsCount: null,
          bio: info.name ? `LinkedIn profile for ${info.name}` : undefined,
          raw: info,
        };
      }
    } catch {}
    return {
      followersCount: null,
      followingCount: null,
      postsCount: null,
    };
  }

  private async fetchWithLinkedInVersion(
    url: string,
    accessToken: string,
    init: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<Response> {
    const candidateVersions = Array.from(
      new Set([
        SOCIAL_API_VERSIONS.LINKEDIN_REST,
        "202601",
        "202602",
        "202603",
        "202610",
        "202512",
      ])
    );

    let lastRes: Response | null = null;
    let lastErrText = "";

    for (const version of candidateVersions) {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        "LinkedIn-Version": version,
        "X-Restli-Protocol-Version": SOCIAL_API_VERSIONS.LINKEDIN_RESTLI_PROTOCOL,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      };

      try {
        const res = await fetch(url, {
          method: init.method || "GET",
          headers,
          body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
        });

        if (res.status === 426) {
          lastRes = res;
          lastErrText = await res.clone().text().catch(() => "");
          continue;
        }

        if (!res.ok) {
          const cloned = res.clone();
          const errJson = await cloned.json().catch(() => ({}));
          if (typeof errJson.message === "string" && (errJson.message.includes("is not active") || errJson.message.includes("NONEXISTENT_VERSION"))) {
            lastRes = res;
            lastErrText = errJson.message;
            continue;
          }
        }

        return res;
      } catch (err: any) {
        lastErrText = err?.message || "Network error";
      }
    }

    return lastRes || new Response(JSON.stringify({ message: lastErrText || "All LinkedIn candidate versions failed" }), { status: 426 });
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    try {
      const authorUrn = post.targetAccountId?.startsWith("urn:li:")
        ? post.targetAccountId
        : `urn:li:person:${post.targetAccountId}`;

      // Current LinkedIn REST Posts API (replaces legacy ugcPosts)
      const restPayload: Record<string, any> = {
        author: authorUrn,
        commentary: post.content,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      };

      if (post.mediaUrls && post.mediaUrls.length > 0) {
        const first = post.mediaUrls[0];
        const isVideo = first.type === "VIDEO" || Boolean(first.url.match(/\.(mp4|webm|mov|mkv)$/i));
        const isImage = first.type === "IMAGE" || Boolean(first.url.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i)) || first.url.includes("cloudinary.com");

        if (isVideo) {
          const videoUrn = await this.uploadLinkedInVideo(accessToken, authorUrn, first.url);
          restPayload.content = {
            media: {
              id: videoUrn,
              title: post.content.slice(0, 60) || "Video Visual",
            },
          };
        } else if (isImage) {
          const imageUrn = await this.uploadLinkedInImage(accessToken, authorUrn, first.url);
          restPayload.content = {
            media: {
              id: imageUrn,
              title: post.content.slice(0, 60) || "Image Visual",
            },
          };
        } else {
          restPayload.content = {
            article: {
              source: first.url,
              title: post.content.slice(0, 60) || "PulseSocial Shared Update",
            },
          };
        }
      }

      const res = await this.fetchWithLinkedInVersion("https://api.linkedin.com/rest/posts", accessToken, {
        method: "POST",
        body: restPayload,
      });

      if (res.status === 201 || res.ok) {
        const urn =
          res.headers.get("x-restli-id") ||
          res.headers.get("x-linkedin-id") ||
          (await res.json().catch(() => ({})))?.id;

        if (!urn) {
          return {
            success: false,
            code: "MISSING_POST_ID",
            error: "LinkedIn API returned HTTP success but omitted the expected x-restli-id header.",
          };
        }

        return {
          success: true,
          platformPostId: urn,
          publishedUrl: `https://www.linkedin.com/feed/update/${urn}`,
        };
      }

      const errData = await res.json().catch(() => ({}));
      const statusCode = res.status;
      const requiresReauth = statusCode === 401;
      const requiresApproval = statusCode === 403;

      return {
        success: false,
        code: requiresReauth ? "TOKEN_EXPIRED" : requiresApproval ? "PERMISSION_DENIED" : "API_ERROR",
        requiresReauth,
        requiresApproval,
        error:
          errData.message ||
          errData.errorDetails?.description ||
          `Failed to publish via LinkedIn Posts API (HTTP ${statusCode}). Verify w_member_social scope.`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        retryable: true,
        error: (err as Error).message || "LinkedIn API network failure",
      };
    }
  }

  private async uploadLinkedInImage(accessToken: string, ownerUrn: string, mediaUrl: string): Promise<string> {
    const ssrfCheck = isSafePublicUrl(mediaUrl);
    if (!ssrfCheck.isSafe) {
      throw new Error(`SSRF Security Violation: Disallowed media URL (${ssrfCheck.reason})`);
    }

    const mediaRes = await fetch(mediaUrl);
    if (!mediaRes.ok) {
      throw new Error(`Failed to fetch media file from ${mediaUrl} (HTTP ${mediaRes.status})`);
    }
    const buffer = Buffer.from(await mediaRes.arrayBuffer());

    const initRes = await this.fetchWithLinkedInVersion(
      "https://api.linkedin.com/rest/images?action=initializeUpload",
      accessToken,
      {
        method: "POST",
        body: {
          initializeUploadRequest: {
            owner: ownerUrn,
          },
        },
      }
    );

    if (!initRes.ok) {
      const err = await initRes.json().catch(() => ({}));
      throw new Error(err.message || `LinkedIn image upload initialization failed (HTTP ${initRes.status})`);
    }

    const initData = await initRes.json();
    const uploadUrl = initData.value?.uploadUrl;
    const imageUrn = initData.value?.image;

    if (!uploadUrl || !imageUrn) {
      throw new Error("LinkedIn did not return expected uploadUrl or image URN");
    }

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!putRes.ok && putRes.status !== 200 && putRes.status !== 201) {
      throw new Error(`Failed to transfer image bytes to LinkedIn (HTTP ${putRes.status})`);
    }

    return imageUrn;
  }

  private async uploadLinkedInVideo(accessToken: string, ownerUrn: string, mediaUrl: string): Promise<string> {
    const ssrfCheck = isSafePublicUrl(mediaUrl);
    if (!ssrfCheck.isSafe) {
      throw new Error(`SSRF Security Violation: Disallowed media URL (${ssrfCheck.reason})`);
    }

    const mediaRes = await fetch(mediaUrl);
    if (!mediaRes.ok) {
      throw new Error(`Failed to fetch video file from ${mediaUrl} (HTTP ${mediaRes.status})`);
    }
    const buffer = Buffer.from(await mediaRes.arrayBuffer());

    const initRes = await this.fetchWithLinkedInVersion(
      "https://api.linkedin.com/rest/videos?action=initializeUpload",
      accessToken,
      {
        method: "POST",
        body: {
          initializeUploadRequest: {
            owner: ownerUrn,
            fileSizeBytes: buffer.length,
            uploadCaptions: false,
            uploadThumbnail: false,
          },
        },
      }
    );

    if (!initRes.ok) {
      const err = await initRes.json().catch(() => ({}));
      throw new Error(err.message || `LinkedIn video upload initialization failed (HTTP ${initRes.status})`);
    }

    const initData = await initRes.json();
    const uploadInstructions = initData.value?.uploadInstructions;
    const videoUrn = initData.value?.video;

    if (!uploadInstructions || !videoUrn || !uploadInstructions[0]?.uploadUrl) {
      throw new Error("LinkedIn did not return expected video uploadInstructions or video URN");
    }

    const uploadUrl = uploadInstructions[0].uploadUrl;
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!putRes.ok && putRes.status !== 200 && putRes.status !== 201) {
      throw new Error(`Failed to transfer video bytes to LinkedIn (HTTP ${putRes.status})`);
    }

    return videoUrn;
  }

  async deletePost(accessToken: string, platformPostId: string): Promise<boolean> {
    const res = await fetch(`https://api.linkedin.com/rest/posts/${encodeURIComponent(platformPostId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "LinkedIn-Version": SOCIAL_API_VERSIONS.LINKEDIN_REST,
        "X-Restli-Protocol-Version": SOCIAL_API_VERSIONS.LINKEDIN_RESTLI_PROTOCOL,
      },
    });
    return res.ok;
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
    // LinkedIn member messaging API is restricted
    return [];
  }

  async disconnect(): Promise<boolean> {
    return true;
  }

  getActionCapabilities(): PlatformActionCapabilities {
    return PLATFORM_ACTION_CAPABILITIES.linkedin;
  }

  private resolveActorUrn(accountId?: string): string {
    if (!accountId) return "urn:li:person:me";
    return accountId.startsWith("urn:li:")
      ? accountId
      : `urn:li:person:${accountId}`;
  }

  async likePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const actorUrn = this.resolveActorUrn(target.accountId);
      const res = await fetch(`https://api.linkedin.com/rest/reactions?actor=${encodeURIComponent(actorUrn)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": SOCIAL_API_VERSIONS.LINKEDIN_REST,
          "X-Restli-Protocol-Version": SOCIAL_API_VERSIONS.LINKEDIN_RESTLI_PROTOCOL,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          root: target.externalPostId,
          reactionType: "LIKE",
        }),
      });

      if (res.status === 201 || res.status === 200 || res.ok) {
        return {
          success: true,
          actionType: "LIKE",
          externalActionId: target.externalPostId,
        };
      }

      const errData = await res.json().catch(() => ({}));
      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "LIKE",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: errData.message || "Failed to like post on LinkedIn",
        rawResponse: errData,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "LIKE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to LinkedIn API",
      };
    }
  }

  async unlikePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const actorUrn = this.resolveActorUrn(target.accountId);
      const res = await fetch(
        `https://api.linkedin.com/rest/reactions/(actor:${encodeURIComponent(actorUrn)},root:${encodeURIComponent(target.externalPostId)})`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "LinkedIn-Version": SOCIAL_API_VERSIONS.LINKEDIN_REST,
            "X-Restli-Protocol-Version": SOCIAL_API_VERSIONS.LINKEDIN_RESTLI_PROTOCOL,
          },
        }
      );

      if (res.status === 204 || res.ok) {
        return {
          success: true,
          actionType: "UNLIKE",
        };
      }

      const errData = await res.json().catch(() => ({}));
      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "UNLIKE",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: errData.message || "Failed to unlike post on LinkedIn",
        rawResponse: errData,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "UNLIKE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to LinkedIn API",
      };
    }
  }

  async commentPost(accessToken: string, target: { externalPostId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }> {
    try {
      const actorUrn = this.resolveActorUrn(target.accountId);
      const res = await fetch(`https://api.linkedin.com/rest/socialActions/${encodeURIComponent(target.externalPostId)}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": SOCIAL_API_VERSIONS.LINKEDIN_REST,
          "X-Restli-Protocol-Version": SOCIAL_API_VERSIONS.LINKEDIN_RESTLI_PROTOCOL,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actor: actorUrn,
          message: {
            text: target.content,
          },
        }),
      });

      const resData = await res.json().catch(() => ({}));
      const commentUrn = res.headers.get("x-restli-id") || resData.urn || resData.id;

      if (res.status === 201 || res.ok) {
        return {
          success: true,
          actionType: "COMMENT",
          externalActionId: commentUrn || `urn:li:comment:${Date.now()}`,
          comment: {
            externalCommentId: commentUrn || `urn:li:comment:${Date.now()}`,
            platform: "linkedin",
            authorName: "LinkedIn Member",
            content: target.content,
            postedAt: new Date(),
            externalPostId: target.externalPostId,
          },
          rawResponse: resData,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "COMMENT",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: resData.message || "Failed to post comment to LinkedIn",
        rawResponse: resData,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to post comment to LinkedIn",
      };
    }
  }

  async replyToComment(accessToken: string, target: { externalPostId?: string; externalCommentId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }> {
    try {
      const actorUrn = this.resolveActorUrn(target.accountId);
      const res = await fetch(`https://api.linkedin.com/rest/socialActions/${encodeURIComponent(target.externalCommentId)}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": SOCIAL_API_VERSIONS.LINKEDIN_REST,
          "X-Restli-Protocol-Version": SOCIAL_API_VERSIONS.LINKEDIN_RESTLI_PROTOCOL,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actor: actorUrn,
          message: {
            text: target.content,
          },
        }),
      });

      const resData = await res.json().catch(() => ({}));
      const replyUrn = res.headers.get("x-restli-id") || resData.urn || resData.id;

      if (res.status === 201 || res.ok) {
        return {
          success: true,
          actionType: "REPLY",
          externalActionId: replyUrn || `urn:li:comment:${Date.now()}`,
          comment: {
            externalCommentId: replyUrn || `urn:li:comment:${Date.now()}`,
            platform: "linkedin",
            authorName: "LinkedIn Member",
            content: target.content,
            postedAt: new Date(),
            externalPostId: target.externalPostId,
            parentId: target.externalCommentId,
          },
          rawResponse: resData,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "REPLY",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: resData.message || "Failed to reply to comment on LinkedIn",
        rawResponse: resData,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "REPLY",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to reply to comment on LinkedIn",
      };
    }
  }

  async deleteComment(accessToken: string, target: { externalCommentId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const res = await fetch(`https://api.linkedin.com/rest/socialActions/${encodeURIComponent(target.externalCommentId)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": SOCIAL_API_VERSIONS.LINKEDIN_REST,
          "X-Restli-Protocol-Version": SOCIAL_API_VERSIONS.LINKEDIN_RESTLI_PROTOCOL,
        },
      });

      if (res.status === 204 || res.ok) {
        return {
          success: true,
          actionType: "DELETE_COMMENT",
          externalActionId: target.externalCommentId,
        };
      }

      const resData = await res.json().catch(() => ({}));
      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "DELETE_COMMENT",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: resData.message || "Failed to delete comment on LinkedIn",
        rawResponse: resData,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "DELETE_COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to delete comment on LinkedIn",
      };
    }
  }

  async syncPostEngagement(accessToken: string, externalPostId: string): Promise<SocialMetricsResult> {
    try {
      const res = await fetch(`https://api.linkedin.com/rest/socialActions/${encodeURIComponent(externalPostId)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": SOCIAL_API_VERSIONS.LINKEDIN_REST,
          "X-Restli-Protocol-Version": SOCIAL_API_VERSIONS.LINKEDIN_RESTLI_PROTOCOL,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const isAuth = res.status === 401;
        return {
          success: false,
          platform: "linkedin",
          externalPostId,
          likes: null,
          reactions: null,
          comments: null,
          shares: null,
          reposts: null,
          views: null,
          impressions: null,
          reach: null,
          saves: null,
          requiresReauth: isAuth,
          error: data.message || "Failed to fetch LinkedIn post social actions",
        };
      }

      const likes = typeof data.likesSummary?.totalLikes === "number" ? data.likesSummary.totalLikes : null;
      const comments = typeof data.commentsSummary?.totalComments === "number" ? data.commentsSummary.totalComments : null;

      return {
        success: true,
        platform: "linkedin",
        externalPostId,
        likes,
        reactions: likes,
        comments,
        shares: null,
        reposts: null,
        views: null,
        impressions: null,
        reach: null,
        saves: null,
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        platform: "linkedin",
        externalPostId,
        likes: null,
        reactions: null,
        comments: null,
        shares: null,
        reposts: null,
        views: null,
        impressions: null,
        reach: null,
        saves: null,
        error: e.message || "Failed to sync LinkedIn engagement",
      };
    }
  }

  async fetchPostComments(accessToken: string, externalPostId: string): Promise<ExternalCommentData[]> {
    try {
      const res = await fetch(
        `https://api.linkedin.com/rest/socialActions/${encodeURIComponent(externalPostId)}/comments`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "LinkedIn-Version": SOCIAL_API_VERSIONS.LINKEDIN_REST,
            "X-Restli-Protocol-Version": SOCIAL_API_VERSIONS.LINKEDIN_RESTLI_PROTOCOL,
          },
        }
      );

      if (!res.ok) return [];
      const data = await res.json().catch(() => ({}));
      const elements = data.elements || [];
      return elements.map((c: any) => ({
        externalCommentId: c.urn || c.id || String(c.$URN || ""),
        platform: "linkedin" as SupportedPlatform,
        authorName: c.created?.actor || "LinkedIn Member",
        authorUsername: c.created?.actor,
        content: c.message?.text || "",
        postedAt: c.created?.time ? new Date(c.created.time) : new Date(),
        externalPostId,
        likeCount: typeof c.likesSummary?.totalLikes === "number" ? c.likesSummary.totalLikes : null,
      }));
    } catch {
      return [];
    }
  }

  async fetchPosts(accessToken: string, accountId: string, limit: number = 25): Promise<ExternalPostData[]> {
    try {
      const authorUrn = accountId.startsWith("urn:li:") ? accountId : `urn:li:person:${accountId}`;
      const res = await fetch(`https://api.linkedin.com/v2/shares?q=owners&owners=${encodeURIComponent(authorUrn)}&count=${limit}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      });

      if (!res.ok) return [];
      const data = await res.json().catch(() => ({}));
      const elements = data.elements || [];

      return elements.map((item: any) => ({
        platformPostId: item.id || item.activity,
        platform: "linkedin" as SupportedPlatform,
        content: item.text?.text || "",
        permalink: `https://www.linkedin.com/feed/update/${item.activity || item.id}`,
        media: [],
        publishedAt: item.created?.time ? new Date(item.created.time) : new Date(),
        likes: null,
        comments: null,
        shares: null,
        views: null,
        rawJson: JSON.stringify(item),
      }));
    } catch {
      return [];
    }
  }

  async fetchInsights(accessToken: string, accountId: string): Promise<ExternalInsightsData[]> {
    return [];
  }
}
