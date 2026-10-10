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
} from "../types";

export class YouTubeProvider implements SocialProvider {
  platform: SupportedPlatform = "youtube";
  displayName = "YouTube";
  iconName = "youtube";

  isConfigured(): boolean {
    const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    return Boolean(clientId && clientSecret);
  }

  getMissingConfigMessage(): string {
    return "YouTube integration is not configured yet. Configure YOUTUBE_CLIENT_ID (or GOOGLE_CLIENT_ID) and YOUTUBE_CLIENT_SECRET in your .env file to enable this connection.";
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID!;

    const scopes = [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResult> {
    if (!this.isConfigured()) throw new Error(this.getMissingConfigMessage());

    const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET!;

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error_description || "Failed to exchange authorization code with Google/YouTube");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
      scopes: (data.scope || "").split(" "),
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthTokenResult> {
    const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || err.error || "Failed to refresh Google/YouTube OAuth token");
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token || refreshToken,
      scopes: (data.scope || "").split(" "),
    };
  }

  async getAccounts(accessToken: string): Promise<SocialAccountInfo[]> {
    const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error("Failed to fetch YouTube channel details");
    const json = await res.json();
    const item = json.items?.[0];

    if (!item) {
      return [
        {
          providerAccountId: "channel_default",
          displayName: "YouTube Channel",
          accountType: "CHANNEL",
        },
      ];
    }

    return [
      {
        providerAccountId: item.id,
        displayName: item.snippet.title,
        username: item.snippet.customUrl || item.snippet.title,
        profileImageUrl: item.snippet.thumbnails?.default?.url,
        accountType: "CHANNEL",
      },
    ];
  }

  async getProfile(accessToken: string, accountId: string): Promise<SocialProfileResult> {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${accountId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return { followersCount: null, followingCount: null, postsCount: null };
    }
    const json = await res.json();
    const item = json.items?.[0];
    const stats = item?.statistics || {};
    const isHiddenSubscribers = Boolean(stats.hiddenSubscriberCount);

    const rawSubCount = stats.subscriberCount != null ? parseInt(stats.subscriberCount, 10) : null;
    const parsedSubCount = typeof rawSubCount === "number" && !Number.isNaN(rawSubCount) ? rawSubCount : null;
    const rawPostCount = stats.videoCount != null ? parseInt(stats.videoCount, 10) : null;
    const parsedPostCount = typeof rawPostCount === "number" && !Number.isNaN(rawPostCount) ? rawPostCount : null;

    return {
      followersCount: isHiddenSubscribers ? null : parsedSubCount,
      followingCount: null, // YouTube does not have followingCount on channels
      postsCount: parsedPostCount,
      bio: item?.snippet?.description || undefined,
    };
  }

  async publishPost(accessToken: string, post: PublishPostPayload): Promise<PublishResult> {
    const video = post.mediaUrls?.find((m) => m.type === "VIDEO");
    if (!video) {
      return { success: false, error: "YouTube requires a valid video file to upload." };
    }

    try {
      const res = await fetch(
        "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Type": "video/*",
          },
          body: JSON.stringify({
            snippet: {
              title: post.content.slice(0, 100) || "PulseSocial Video",
              description: post.content,
            },
            status: { privacyStatus: "public" },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error?.message || "YouTube video initialization failed" };
      }

      const location = res.headers.get("location");
      if (!location) {
        return { success: false, error: "YouTube did not return a valid upload location header" };
      }

      // Upload actual video bytes to the resumable session
      try {
        const videoStreamRes = await fetch(video.url);
        if (!videoStreamRes.ok) {
          return { success: false, error: `Could not fetch video file from ${video.url}` };
        }

        const videoBuffer = await videoStreamRes.arrayBuffer();
        const uploadRes = await fetch(location, {
          method: "PUT",
          headers: {
            "Content-Type": "video/mp4",
            "Content-Length": String(videoBuffer.byteLength),
          },
          body: videoBuffer,
        });

        const uploadData = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok || !uploadData.id) {
          const errDetail = uploadData.error?.message || "YouTube binary upload failed";
          return { success: false, error: errDetail };
        }

        const videoId = uploadData.id;
        const privacyStatus = uploadData.status?.privacyStatus;
        const isPrivate = privacyStatus === "private";

        return {
          success: true,
          platformPostId: videoId,
          publishedUrl: `https://www.youtube.com/watch?v=${videoId}`,
          capabilityState: isPrivate ? "CONFIGURED — YOUTUBE API AUDIT REQUIRED FOR PUBLIC UPLOADS" : undefined,
          requiresApproval: isPrivate,
          rawResponse: {
            videoId,
            privacyStatus,
            uploadStatus: uploadData.status?.uploadStatus,
            processingDetails: uploadData.processingDetails,
          },
        };
      } catch (uploadErr: unknown) {
        return {
          success: false,
          code: "BINARY_UPLOAD_FAILED",
          retryable: true,
          error: (uploadErr as Error).message || "YouTube binary upload stream failed",
        };
      }
    } catch (e: any) {
      return {
        success: false,
        code: "INITIALIZATION_FAILED",
        error: e.message || "Failed to initiate YouTube resumable upload",
      };
    }
  }

  async deletePost(): Promise<boolean> {
    return true;
  }

  async getAnalytics(accessToken?: string): Promise<AnalyticsResult> {
    if (accessToken) {
      try {
        const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          const stats = data.items?.[0]?.statistics;
          if (stats) {
            const isHiddenSubscribers = Boolean(stats.hiddenSubscriberCount);
            const subscribers = isHiddenSubscribers
              ? null
              : stats.subscriberCount != null
              ? parseInt(stats.subscriberCount, 10)
              : null;
            const views = stats.viewCount != null ? parseInt(stats.viewCount, 10) : null;
            const comments = stats.commentCount != null ? parseInt(stats.commentCount, 10) : null;
            return {
              followers: subscribers,
              impressions: views,
              reach: views,
              engagementCount: comments,
              engagementRate: null,
              clicks: null,
              shares: null,
              saves: null,
              isCalculated: false,
              rawJson: JSON.stringify(stats),
            };
          }
        }
      } catch (e) {
        console.error("YouTube analytics fetch failed:", e);
      }
    }
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
    return [];
  }

  async disconnect(): Promise<boolean> {
    return true;
  }

  getActionCapabilities(): PlatformActionCapabilities {
    return PLATFORM_ACTION_CAPABILITIES.youtube;
  }

  async likePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos/rate?id=${target.externalPostId}&rating=like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 204 || res.ok) {
        return {
          success: true,
          actionType: "LIKE",
          externalActionId: target.externalPostId,
        };
      }

      const isAuth = res.status === 401;
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        actionType: "LIKE",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.error?.message || "Failed to like video on YouTube",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "LIKE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to YouTube API",
      };
    }
  }

  async unlikePost(accessToken: string, target: { externalPostId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos/rate?id=${target.externalPostId}&rating=none`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 204 || res.ok) {
        return {
          success: true,
          actionType: "UNLIKE",
        };
      }

      const isAuth = res.status === 401;
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        actionType: "UNLIKE",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.error?.message || "Failed to remove video like on YouTube",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "UNLIKE",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to YouTube API",
      };
    }
  }

  async commentPost(accessToken: string, target: { externalPostId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }> {
    try {
      const res = await fetch("https://www.googleapis.com/youtube/v3/commentThreads?part=snippet", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            videoId: target.externalPostId,
            topLevelComment: {
              snippet: {
                textOriginal: target.content,
              },
            },
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        return {
          success: true,
          actionType: "COMMENT",
          externalActionId: data.id,
          comment: {
            externalCommentId: data.id,
            platform: "youtube",
            authorName: data.snippet?.topLevelComment?.snippet?.authorDisplayName || "YouTube User",
            authorAvatarUrl: data.snippet?.topLevelComment?.snippet?.authorProfileImageUrl,
            content: target.content,
            postedAt: new Date(),
            externalPostId: target.externalPostId,
          },
          rawResponse: data,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "COMMENT",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.error?.message || "Failed to comment on YouTube video",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to YouTube API",
      };
    }
  }

  async replyToComment(accessToken: string, target: { externalPostId?: string; externalCommentId: string; accountId?: string; content: string }): Promise<SocialActionResult & { comment?: ExternalCommentData }> {
    try {
      const res = await fetch("https://www.googleapis.com/youtube/v3/comments?part=snippet", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            parentId: target.externalCommentId,
            textOriginal: target.content,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        return {
          success: true,
          actionType: "REPLY",
          externalActionId: data.id,
          comment: {
            externalCommentId: data.id,
            platform: "youtube",
            authorName: data.snippet?.authorDisplayName || "YouTube User",
            authorAvatarUrl: data.snippet?.authorProfileImageUrl,
            content: target.content,
            postedAt: new Date(),
            externalPostId: target.externalPostId,
            parentId: target.externalCommentId,
          },
          rawResponse: data,
        };
      }

      const isAuth = res.status === 401;
      return {
        success: false,
        actionType: "REPLY",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.error?.message || "Failed to reply to comment on YouTube",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "REPLY",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to YouTube API",
      };
    }
  }

  async deleteComment(accessToken: string, target: { externalCommentId: string; accountId?: string }): Promise<SocialActionResult> {
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/comments?id=${target.externalCommentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 204 || res.ok) {
        return {
          success: true,
          actionType: "DELETE_COMMENT",
          externalActionId: target.externalCommentId,
        };
      }

      const isAuth = res.status === 401;
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        actionType: "DELETE_COMMENT",
        code: isAuth ? "REAUTH_REQUIRED" : "ACTION_FAILED",
        requiresReauth: isAuth,
        error: data.error?.message || "Failed to delete comment on YouTube",
        rawResponse: data,
      };
    } catch (e: any) {
      return {
        success: false,
        actionType: "DELETE_COMMENT",
        code: "NETWORK_ERROR",
        error: e.message || "Failed to connect to YouTube API",
      };
    }
  }

  async syncPostEngagement(accessToken: string, externalPostId: string): Promise<SocialMetricsResult> {
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${externalPostId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const isAuth = res.status === 401;
        return {
          success: false,
          platform: "youtube",
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
          error: data.error?.message || "Failed to fetch YouTube video metrics",
        };
      }

      const stats = data.items?.[0]?.statistics || {};
      const parseMetric = (v: any) => (v != null && v !== "" && !isNaN(parseInt(v, 10)) ? parseInt(v, 10) : null);
      const views = parseMetric(stats.viewCount);
      const likes = parseMetric(stats.likeCount);
      const comments = parseMetric(stats.commentCount);

      return {
        success: true,
        platform: "youtube",
        externalPostId,
        likes,
        reactions: likes,
        comments,
        shares: null,
        reposts: null,
        views,
        impressions: null,
        reach: null,
        saves: null,
        rawResponse: stats,
      };
    } catch (e: any) {
      return {
        success: false,
        platform: "youtube",
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
        error: e.message || "Failed to sync YouTube metrics",
      };
    }
  }

  async fetchPostComments(accessToken: string, externalPostId: string): Promise<ExternalCommentData[]> {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${externalPostId}&maxResults=50`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) return [];
      const data = await res.json().catch(() => ({}));
      const results: ExternalCommentData[] = [];

      for (const item of (data.items || [])) {
        const top = item.snippet?.topLevelComment?.snippet;
        if (top) {
          results.push({
            externalCommentId: item.snippet.topLevelComment.id,
            platform: "youtube",
            authorName: top.authorDisplayName || "YouTube User",
            authorUsername: top.authorDisplayName,
            authorAvatarUrl: top.authorProfileImageUrl,
            content: top.textOriginal || top.textDisplay || "",
            postedAt: top.publishedAt ? new Date(top.publishedAt) : new Date(),
            externalPostId,
            likeCount: typeof top.likeCount === "number" ? top.likeCount : null,
          });
        }
        if (item.replies?.comments) {
          for (const rep of item.replies.comments) {
            const snip = rep.snippet;
            results.push({
              externalCommentId: rep.id,
              platform: "youtube",
              authorName: snip.authorDisplayName || "YouTube User",
              authorUsername: snip.authorDisplayName,
              authorAvatarUrl: snip.authorProfileImageUrl,
              content: snip.textOriginal || snip.textDisplay || "",
              postedAt: snip.publishedAt ? new Date(snip.publishedAt) : new Date(),
              externalPostId,
              parentId: item.snippet.topLevelComment.id,
              likeCount: typeof snip.likeCount === "number" ? snip.likeCount : null,
            });
          }
        }
      }

      return results;
    } catch {
      return [];
    }
  }
}
