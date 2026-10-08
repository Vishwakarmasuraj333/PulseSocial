import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/security/encryption";
import { getSocialProvider } from "@/lib/social/registry";
import {
  PLATFORM_ACTION_CAPABILITIES,
  PlatformActionCapabilities,
  SocialActionResult,
  SocialActionType,
  SupportedPlatform,
} from "@/lib/social/types";
import { logAudit } from "@/lib/audit/logger";

export interface ExecuteActionParams {
  platform: string;
  actionType: SocialActionType;
  socialAccountId: string;
  externalPostId?: string;
  externalCommentId?: string;
  postId?: string; // PulseSocial internal SocialPost ID if known
  content?: string; // For comment / reply
  targetUrl?: string;
}

export interface ExecuteActionResponse {
  success: boolean;
  actionType: SocialActionType;
  code?: string;
  error?: string;
  requiresReauth?: boolean;
  requiresApproval?: boolean;
  externalActionId?: string;
  data?: unknown;
}

export async function executeSocialAction(
  params: ExecuteActionParams
): Promise<ExecuteActionResponse> {
  const {
    platform,
    actionType,
    socialAccountId,
    externalPostId,
    externalCommentId,
    postId,
    content,
    targetUrl,
  } = params;

  // 1. Session verification
  const session = await getSession();
  if (!session?.id || !session?.activeOrgId) {
    return {
      success: false,
      actionType,
      code: "UNAUTHORIZED",
      error: "Authentication session expired or missing active organization.",
    };
  }

  // 2. Organization membership verification
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.activeOrgId,
        userId: session.id,
      },
    },
  });

  if (!member) {
    return {
      success: false,
      actionType,
      code: "FORBIDDEN",
      error: "User is not an active member of this organization.",
    };
  }

  // 3. Social account ownership validation within organization
  if (!socialAccountId) {
    return {
      success: false,
      actionType,
      code: "ACCOUNT_REQUIRED",
      error: "A valid socialAccountId owned by your organization is required.",
    };
  }

  const account = await prisma.socialAccount.findFirst({
    where: {
      id: socialAccountId,
      organizationId: session.activeOrgId,
    },
    include: {
      token: true,
    },
  });

  if (!account) {
    return {
      success: false,
      actionType,
      code: "ACCOUNT_NOT_FOUND",
      error: "The specified social account does not exist or does not belong to your organization.",
    };
  }

  const normalizedPlatform = (
    account.provider.toLowerCase() === "twitter"
      ? "x"
      : account.provider.toLowerCase() === "google" || account.provider.toLowerCase() === "google-business"
      ? "google_business"
      : account.provider.toLowerCase()
  ) as SupportedPlatform;

  // Verify internal post ownership if postId is passed
  if (postId) {
    const internalPost = await prisma.socialPost.findFirst({
      where: {
        id: postId,
        organizationId: session.activeOrgId,
      },
    });
    if (!internalPost) {
      return {
        success: false,
        actionType,
        code: "POST_NOT_FOUND",
        error: "The referenced post does not belong to your organization.",
      };
    }
  }

  // 4. Platform Capability Validation
  const capabilities: PlatformActionCapabilities =
    PLATFORM_ACTION_CAPABILITIES[normalizedPlatform] || {
      like: false,
      unlike: false,
      comment: false,
      reply: false,
      deleteComment: false,
      hideComment: false,
      share: false,
      repost: false,
      save: false,
    };

  const actionMap: Record<SocialActionType, keyof PlatformActionCapabilities> = {
    LIKE: "like",
    UNLIKE: "unlike",
    COMMENT: "comment",
    REPLY: "reply",
    SHARE: "share",
    REPOST: "repost",
    SAVE: "save",
    DELETE_COMMENT: "deleteComment",
    HIDE_COMMENT: "hideComment",
  };

  const capKey = actionMap[actionType];
  if (!capKey || !capabilities[capKey]) {
    return {
      success: false,
      actionType,
      code: "UNSUPPORTED_ACTION",
      error: "Not supported by this integration",
    };
  }

  // 5. Token Validation & Decryption
  if (!account.token) {
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { status: "RECONNECT_REQUIRED" },
    });
    return {
      success: false,
      actionType,
      code: "REAUTH_REQUIRED",
      requiresReauth: true,
      error: `OAuth credentials missing for ${account.displayName}. Reconnect account.`,
    };
  }

  if (account.token.expiresAt && account.token.expiresAt < new Date()) {
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { status: "RECONNECT_REQUIRED" },
    });
    return {
      success: false,
      actionType,
      code: "REAUTH_REQUIRED",
      requiresReauth: true,
      error: `OAuth token expired for ${account.displayName}. Reconnect account.`,
    };
  }

  let decryptedToken: string;
  try {
    decryptedToken = decryptToken(
      account.token.encryptedAccessToken,
      account.token.iv,
      account.token.tag
    );
  } catch (err: unknown) {
    return {
      success: false,
      actionType,
      code: "TOKEN_DECRYPT_FAILED",
      requiresReauth: true,
      error: "Failed to decrypt OAuth credentials. Please re-authenticate.",
    };
  }

  if (
    !decryptedToken ||
    decryptedToken.startsWith("token_") ||
    decryptedToken.startsWith("direct_token_")
  ) {
    return {
      success: false,
      actionType,
      code: "CREDENTIALS_REQUIRED",
      requiresReauth: true,
      error: `Live OAuth credentials are required for ${account.displayName}. Connect via official OAuth flow.`,
    };
  }

  // 6. External Resource Validation
  if (
    (actionType === "LIKE" ||
      actionType === "UNLIKE" ||
      actionType === "SHARE" ||
      actionType === "REPOST" ||
      actionType === "SAVE") &&
    !externalPostId
  ) {
    return {
      success: false,
      actionType,
      code: "EXTERNAL_POST_ID_REQUIRED",
      error: "externalPostId is required to execute this post action.",
    };
  }

  if (actionType === "COMMENT" && (!externalPostId || !content?.trim())) {
    return {
      success: false,
      actionType,
      code: "INVALID_COMMENT_PAYLOAD",
      error: "externalPostId and non-empty content are required to post a comment.",
    };
  }

  if (actionType === "REPLY" && (!externalCommentId || !content?.trim())) {
    return {
      success: false,
      actionType,
      code: "INVALID_REPLY_PAYLOAD",
      error: "externalCommentId and non-empty content are required to reply to a comment.",
    };
  }

  if (
    (actionType === "DELETE_COMMENT" || actionType === "HIDE_COMMENT") &&
    !externalCommentId
  ) {
    return {
      success: false,
      actionType,
      code: "EXTERNAL_COMMENT_ID_REQUIRED",
      error: "externalCommentId is required to moderate this comment.",
    };
  }

  // 7. Platform Adapter Execution
  const provider = getSocialProvider(normalizedPlatform);
  let result: SocialActionResult & { comment?: any };

  try {
    switch (actionType) {
      case "LIKE":
        if (!provider.likePost) {
          return {
            success: false,
            actionType,
            code: "UNSUPPORTED_ACTION",
            error: "Not supported by this integration",
          };
        }
        result = await provider.likePost(decryptedToken, {
          externalPostId: externalPostId!,
          accountId: account.providerAccountId,
        });
        break;

      case "UNLIKE":
        if (!provider.unlikePost) {
          return {
            success: false,
            actionType,
            code: "UNSUPPORTED_ACTION",
            error: "Not supported by this integration",
          };
        }
        result = await provider.unlikePost(decryptedToken, {
          externalPostId: externalPostId!,
          accountId: account.providerAccountId,
        });
        break;

      case "COMMENT":
        if (!provider.commentPost) {
          return {
            success: false,
            actionType,
            code: "UNSUPPORTED_ACTION",
            error: "Not supported by this integration",
          };
        }
        result = await provider.commentPost(decryptedToken, {
          externalPostId: externalPostId!,
          accountId: account.providerAccountId,
          content: content!.trim(),
        });
        break;

      case "REPLY":
        if (!provider.replyToComment) {
          return {
            success: false,
            actionType,
            code: "UNSUPPORTED_ACTION",
            error: "Not supported by this integration",
          };
        }
        result = await provider.replyToComment(decryptedToken, {
          externalPostId,
          externalCommentId: externalCommentId!,
          accountId: account.providerAccountId,
          content: content!.trim(),
        });
        break;

      case "REPOST":
        if (!provider.repostPost) {
          return {
            success: false,
            actionType,
            code: "UNSUPPORTED_ACTION",
            error: "Not supported by this integration",
          };
        }
        result = await provider.repostPost(decryptedToken, {
          externalPostId: externalPostId!,
          accountId: account.providerAccountId,
        });
        break;

      case "SHARE":
        if (!provider.sharePost) {
          return {
            success: false,
            actionType,
            code: "UNSUPPORTED_ACTION",
            error: "Not supported by this integration",
          };
        }
        result = await provider.sharePost(decryptedToken, {
          externalPostId: externalPostId!,
          accountId: account.providerAccountId,
        });
        break;

      case "SAVE":
        if (!provider.savePost) {
          return {
            success: false,
            actionType,
            code: "UNSUPPORTED_ACTION",
            error: "Not supported by this integration",
          };
        }
        result = await provider.savePost(decryptedToken, {
          externalPostId: externalPostId!,
          accountId: account.providerAccountId,
        });
        break;

      case "DELETE_COMMENT":
        if (!provider.deleteComment) {
          return {
            success: false,
            actionType,
            code: "UNSUPPORTED_ACTION",
            error: "Not supported by this integration",
          };
        }
        result = await provider.deleteComment(decryptedToken, {
          externalCommentId: externalCommentId!,
          accountId: account.providerAccountId,
        });
        break;

      case "HIDE_COMMENT":
        if (!provider.hideComment) {
          return {
            success: false,
            actionType,
            code: "UNSUPPORTED_ACTION",
            error: "Not supported by this integration",
          };
        }
        result = await provider.hideComment(decryptedToken, {
          externalCommentId: externalCommentId!,
          accountId: account.providerAccountId,
        });
        break;

      default:
        return {
          success: false,
          actionType,
          code: "UNSUPPORTED_ACTION",
          error: "Not supported by this integration",
        };
    }
  } catch (adapterErr: unknown) {
    return {
      success: false,
      actionType,
      code: "ADAPTER_EXECUTION_ERROR",
      error: (adapterErr as Error).message || "Social action execution failed unexpectedly.",
    };
  }

  // 8. Handle Reauthorization requirement if reported by API
  if (result.requiresReauth) {
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { status: "RECONNECT_REQUIRED" },
    });
  }

  // 9. Persist Action Audit & Records
  const actionIdentifier = `${actionType.toLowerCase()}:${
    externalPostId || externalCommentId || "action"
  }:${Date.now()}`;

  if (result.success) {
    await prisma.socialAction.create({
      data: {
        organizationId: session.activeOrgId,
        socialAccountId: account.id,
        postId: postId || null,
        platform: normalizedPlatform,
        actionType,
        actionIdentifier,
        externalPostId: externalPostId || null,
        externalCommentId: externalCommentId || null,
        targetUrl: targetUrl || null,
        status: "SUCCESS",
        rawResponse: result.rawResponse ? JSON.stringify(result.rawResponse) : null,
      },
    });

    // If COMMENT or REPLY, upsert into SocialComment
    if ((actionType === "COMMENT" || actionType === "REPLY") && result.comment) {
      await prisma.socialComment.upsert({
        where: {
          platform_platformCommentId: {
            platform: normalizedPlatform,
            platformCommentId: result.comment.externalCommentId,
          },
        },
        create: {
          socialAccountId: account.id,
          platformCommentId: result.comment.externalCommentId,
          platformPostId: externalPostId || null,
          postId: postId || null,
          platform: normalizedPlatform,
          parentId: externalCommentId || null,
          authorName: result.comment.authorName || account.displayName,
          authorUsername: result.comment.authorUsername || account.username || undefined,
          authorAvatarUrl: result.comment.authorAvatarUrl || account.profileImageUrl || undefined,
          content: content!.trim(),
          postedAt: result.comment.postedAt || new Date(),
          isRead: true,
          isReplied: true,
        },
        update: {
          content: content!.trim(),
          updatedAt: new Date(),
        },
      });
    }

    // If DELETE_COMMENT: remove comment if it exists locally
    if (actionType === "DELETE_COMMENT" && externalCommentId) {
      await prisma.socialComment.deleteMany({
        where: {
          platform: normalizedPlatform,
          platformCommentId: externalCommentId,
        },
      });
    }

    await logAudit({
      organizationId: session.activeOrgId,
      userId: session.id,
      action: `SOCIAL_ACTION_${actionType}`,
      resourceType: "SocialAction",
      resourceId: result.externalActionId || actionIdentifier,
      details: {
        platform: normalizedPlatform,
        actionType,
        externalPostId: externalPostId || null,
        externalCommentId: externalCommentId || null,
      },
    });
  } else {
    // Record failed attempt for transparency
    await prisma.socialAction.create({
      data: {
        organizationId: session.activeOrgId,
        socialAccountId: account.id,
        postId: postId || null,
        platform: normalizedPlatform,
        actionType,
        actionIdentifier,
        externalPostId: externalPostId || null,
        externalCommentId: externalCommentId || null,
        status: "FAILED",
        errorMessage: result.error || "Action failed",
        rawResponse: result.rawResponse ? JSON.stringify(result.rawResponse) : null,
      },
    });
  }

  return {
    success: result.success,
    actionType,
    code: result.code,
    error: result.error,
    requiresReauth: result.requiresReauth,
    requiresApproval: result.requiresApproval,
    externalActionId: result.externalActionId,
    data: result.comment || result.rawResponse,
  };
}
