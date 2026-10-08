"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { PLATFORM_ACTION_CAPABILITIES, SupportedPlatform } from "@/lib/social/types";
import {
  X,
  RefreshCw,
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Repeat2,
  Trash2,
  Eye,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  CornerDownRight,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface TargetInfo {
  id: string;
  socialAccountId: string;
  status: string;
  platformPostId?: string | null;
  socialAccount: {
    id: string;
    provider: string;
    displayName: string;
    username: string | null;
    profileImageUrl?: string | null;
    status?: string;
  };
}

interface EngagementData {
  platform: string;
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
  lastSyncedAt?: string | Date;
}

interface CommentItem {
  id: string;
  platformCommentId: string;
  platform: string;
  authorName: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  content: string;
  postedAt: string | Date;
  parentId?: string | null;
}

interface PostEngagementDetailsModalProps {
  post: {
    id: string;
    content: string;
    status: string;
    publishedAt?: string;
    scheduledFor?: string;
    createdAt: string;
    media?: Array<{ id: string; url: string; mediaType: string }>;
    targets?: TargetInfo[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onClone?: (post: any) => void;
  onDelete?: (postId: string) => void;
}

export function PostEngagementDetailsModal({
  post,
  isOpen,
  onClose,
  onClone,
  onDelete,
}: PostEngagementDetailsModalProps) {
  const { toast } = useToast();

  const [activeTabPlatform, setActiveTabPlatform] = useState<string>("all");
  const [snapshots, setSnapshots] = useState<Record<string, EngagementData>>({});
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Engagement action states
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({}); // targetId -> state description
  const [actionError, setActionError] = useState<Record<string, string>>({});

  // Comment input state
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyInputOpen, setReplyInputOpen] = useState<Record<string, boolean>>({});
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<Record<string, boolean>>({});

  // Sync engagement when modal opens or post changes
  useEffect(() => {
    if (!isOpen || !post) return;

    fetchInitialEngagement();
  }, [isOpen, post?.id]);

  const fetchInitialEngagement = async () => {
    if (!post) return;
    setIsSyncing(true);
    try {
      const res = await fetch("/api/social/sync-engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.snapshots)) {
          const mapped: Record<string, EngagementData> = {};
          for (const s of data.snapshots) {
            mapped[s.platform.toLowerCase()] = s;
          }
          setSnapshots(mapped);
        }
        if (Array.isArray(data.comments)) {
          setComments(data.comments);
        }
        if (data.lastSyncedAt) {
          setLastSyncedAt(new Date(data.lastSyncedAt));
        }
      }
    } catch (e) {
      console.error("Failed to load engagement:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefreshEngagement = async () => {
    if (!post || isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await fetch("/api/social/sync-engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to refresh engagement");

      if (Array.isArray(data.snapshots)) {
        const mapped: Record<string, EngagementData> = {};
        for (const s of data.snapshots) {
          mapped[s.platform.toLowerCase()] = s;
        }
        setSnapshots(mapped);
      }
      if (Array.isArray(data.comments)) {
        setComments(data.comments);
      }
      setLastSyncedAt(new Date(data.lastSyncedAt || Date.now()));

      toast({
        title: "Engagement Synced",
        message: "Live metrics retrieved from connected social platform APIs.",
        type: "success",
      });
    } catch (err: unknown) {
      toast({
        title: "Sync Failed",
        message: (err as Error).message || "Could not retrieve live engagement.",
        type: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen || !post) return null;

  const targets = post.targets || [];
  const primaryTarget = targets[0];
  const publishedDate = post.publishedAt || post.scheduledFor || post.createdAt;

  const getExternalPostUrl = (platform: string, externalId?: string | null) => {
    if (!externalId) return null;
    const p = platform.toLowerCase();
    if (externalId.startsWith("http://") || externalId.startsWith("https://")) return externalId;

    switch (p) {
      case "facebook":
        return `https://www.facebook.com/${externalId}`;
      case "instagram":
        return `https://www.instagram.com/`;
      case "linkedin":
        return `https://www.linkedin.com/feed/update/${externalId}`;
      case "x":
      case "twitter":
        return `https://x.com/i/status/${externalId}`;
      case "youtube":
        return `https://www.youtube.com/watch?v=${externalId}`;
      case "pinterest":
        return `https://www.pinterest.com/pin/${externalId}/`;
      default:
        return null;
    }
  };

  // Perform a verified social action
  const handleExecuteAction = async (
    target: TargetInfo,
    actionType: "LIKE" | "UNLIKE" | "REPOST" | "SHARE" | "SAVE"
  ) => {
    const targetKey = `${target.id}_${actionType}`;
    const p = (
      target.socialAccount.provider.toLowerCase() === "twitter"
        ? "x"
        : target.socialAccount.provider.toLowerCase()
    ) as SupportedPlatform;

    const capabilities = PLATFORM_ACTION_CAPABILITIES[p];
    const capKey = actionType.toLowerCase() as keyof typeof capabilities;

    if (!capabilities || !capabilities[capKey]) {
      toast({
        title: "Action Unsupported",
        message: `Not supported by this integration: ${target.socialAccount.displayName} API does not permit ${actionType.toLowerCase()}.`,
        type: "error",
      });
      return;
    }

    if (!target.platformPostId) {
      toast({
        title: "Missing External Post",
        message: "This post has not been confirmed published on this platform yet.",
        type: "error",
      });
      return;
    }

    setActionLoading((prev) => ({ ...prev, [targetKey]: "Processing..." }));
    setActionError((prev) => ({ ...prev, [targetKey]: "" }));

    try {
      const endpoint = `/api/social-actions/${p}/${actionType.toLowerCase()}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialAccountId: target.socialAccountId,
          externalPostId: target.platformPostId,
          postId: post.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.code === "REAUTH_REQUIRED" || data.requiresReauth) {
          setActionError((prev) => ({
            ...prev,
            [targetKey]: `Reauthorization required: Reconnect ${target.socialAccount.displayName}.`,
          }));
          toast({
            title: "Reauthorization Required",
            message: `Your token for ${target.socialAccount.displayName} is expired. Reconnect in Settings.`,
            type: "error",
          });
        } else {
          setActionError((prev) => ({
            ...prev,
            [targetKey]: data.error || `Failed to ${actionType.toLowerCase()} post.`,
          }));
          toast({
            title: "Action Failed",
            message: data.error || `Could not execute ${actionType.toLowerCase()} on ${p}.`,
            type: "error",
          });
        }
        return;
      }

      toast({
        title: "Action Confirmed",
        message: `Successfully executed ${actionType.toLowerCase()} via official ${p} API.`,
        type: "success",
      });
      // Refresh metrics after action
      handleRefreshEngagement();
    } catch (err: unknown) {
      setActionError((prev) => ({
        ...prev,
        [targetKey]: (err as Error).message || "Network error",
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetKey]: "" }));
    }
  };

  // Post a new comment
  const handlePostComment = async (target: TargetInfo) => {
    if (!newCommentText.trim() || !target.platformPostId) return;

    const p = target.socialAccount.provider.toLowerCase() as SupportedPlatform;
    if (!PLATFORM_ACTION_CAPABILITIES[p]?.comment) {
      toast({
        title: "Comments Not Supported",
        message: `Not supported by this integration for ${target.socialAccount.displayName}.`,
        type: "error",
      });
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/social-actions/${p}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialAccountId: target.socialAccountId,
          externalPostId: target.platformPostId,
          postId: post.id,
          content: newCommentText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to post comment to social network");
      }

      toast({
        title: "Comment Published",
        message: `Comment verified and published on ${target.socialAccount.displayName}.`,
        type: "success",
      });
      setNewCommentText("");
      handleRefreshEngagement();
    } catch (err: unknown) {
      toast({
        title: "Failed to Post Comment",
        message: (err as Error).message || "Unable to post comment. Check permissions.",
        type: "error",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Reply to comment
  const handleReplyToComment = async (comment: CommentItem, target: TargetInfo) => {
    const text = replyTexts[comment.id]?.trim();
    if (!text) return;

    const p = (comment.platform || target.socialAccount.provider).toLowerCase() as SupportedPlatform;
    if (!PLATFORM_ACTION_CAPABILITIES[p]?.reply) {
      toast({
        title: "Replies Unsupported",
        message: `Not supported by this integration for ${p}.`,
        type: "error",
      });
      return;
    }

    setSubmittingReply((prev) => ({ ...prev, [comment.id]: true }));
    try {
      const res = await fetch(`/api/social-actions/${p}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialAccountId: target.socialAccountId,
          externalPostId: target.platformPostId || undefined,
          externalCommentId: comment.platformCommentId,
          postId: post.id,
          content: text,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to send reply");
      }

      toast({
        title: "Reply Sent",
        message: `Reply posted directly to ${p}.`,
        type: "success",
      });
      setReplyTexts((prev) => ({ ...prev, [comment.id]: "" }));
      setReplyInputOpen((prev) => ({ ...prev, [comment.id]: false }));
      handleRefreshEngagement();
    } catch (err: unknown) {
      toast({
        title: "Reply Failed",
        message: (err as Error).message || "Could not publish reply.",
        type: "error",
      });
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [comment.id]: false }));
    }
  };

  // Delete comment
  const handleDeleteComment = async (comment: CommentItem, target: TargetInfo) => {
    const p = (comment.platform || target.socialAccount.provider).toLowerCase() as SupportedPlatform;
    if (!PLATFORM_ACTION_CAPABILITIES[p]?.deleteComment) {
      toast({
        title: "Deletion Unsupported",
        message: `Not supported by this integration for ${p}.`,
        type: "error",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this comment on the official platform?")) return;

    try {
      const res = await fetch(
        `/api/social-actions/${p}/comment/${comment.platformCommentId}?socialAccountId=${target.socialAccountId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete comment");
      }

      toast({
        title: "Comment Deleted",
        message: "The comment was deleted from the social network.",
        type: "success",
      });
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    } catch (err: unknown) {
      toast({
        title: "Deletion Failed",
        message: (err as Error).message || "Could not delete comment.",
        type: "error",
      });
    }
  };

  const filteredTargets =
    activeTabPlatform === "all"
      ? targets
      : targets.filter((t) => t.socialAccount.provider.toLowerCase() === activeTabPlatform.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="p-5 sm:px-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Post Details & Real Social Engagement
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    post.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : post.status === "FAILED"
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {post.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>
                  Published:{" "}
                  {new Date(publishedDate).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {lastSyncedAt && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    • Last synced: {lastSyncedAt.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshEngagement}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition disabled:opacity-50 cursor-pointer"
              title="Fetch live metrics from official platform APIs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Refresh Engagement"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Post Content Preview & Attached Media */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Published Copy</span>
                <span className="text-[11px] font-normal normal-case">
                  {post.content.length} characters
                </span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>

              {post.media && post.media.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-3 overflow-x-auto">
                  {post.media.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-900"
                    >
                      <Image src={m.url} alt="Attached Media" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Target Channels Quick Summary */}
            <div className="bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                  Broadcast Destinations ({targets.length})
                </h4>
                <div className="space-y-2">
                  {targets.map((t) => {
                    const extUrl = getExternalPostUrl(t.socialAccount.provider, t.platformPostId);
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 flex items-center justify-center">
                            {renderPlatformIcon(t.socialAccount.provider, 16)}
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                            {t.socialAccount.displayName}
                          </span>
                        </div>
                        {extUrl ? (
                          <a
                            href={extUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">Internal</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {primaryTarget?.platformPostId && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Primary Remote ID</span>
                  <code className="text-[11px] text-slate-700 dark:text-slate-300 font-mono select-all">
                    {primaryTarget.platformPostId}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* MULTI-PLATFORM ENGAGEMENT CARDS (Rule 14: Never merge into fake aggregate) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Real Platform Engagement Metrics
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Live API statistics. Non-exposed platform metrics display as unavailable (never faked as zero).
                </p>
              </div>

              {/* Platform Filter Tabs */}
              {targets.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTabPlatform("all")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                      activeTabPlatform === "all"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    All Channels
                  </button>
                  {targets.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTabPlatform(t.socialAccount.provider)}
                      className={`p-1.5 rounded-lg cursor-pointer transition ${
                        activeTabPlatform.toLowerCase() === t.socialAccount.provider.toLowerCase()
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      title={t.socialAccount.displayName}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        {renderPlatformIcon(t.socialAccount.provider, 16)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SEPARATE CARDS PER PLATFORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTargets.map((target) => {
                const p = target.socialAccount.provider.toLowerCase();
                const snapshot = snapshots[p];
                const extUrl = getExternalPostUrl(p, target.platformPostId);
                const caps = PLATFORM_ACTION_CAPABILITIES[p as SupportedPlatform] || {};

                return (
                  <div
                    key={target.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                          {renderPlatformIcon(p, 20)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white capitalize block">
                            {target.socialAccount.displayName}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            @{target.socialAccount.username || p}
                          </span>
                        </div>
                      </div>

                      {extUrl && (
                        <a
                          href={extUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <span>Open on {target.socialAccount.displayName.split(" ")[0]}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2.5 py-3 border-y border-slate-100 dark:border-slate-800 text-center">
                      <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Likes</span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {snapshot?.likes !== null && snapshot?.likes !== undefined
                            ? snapshot.likes.toLocaleString()
                            : "—"}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Comments</span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {snapshot?.comments !== null && snapshot?.comments !== undefined
                            ? snapshot.comments.toLocaleString()
                            : "—"}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Shares</span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {snapshot?.shares !== null && snapshot?.shares !== undefined
                            ? snapshot.shares.toLocaleString()
                            : "—"}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Views</span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {snapshot?.views !== null && snapshot?.views !== undefined
                            ? snapshot.views.toLocaleString()
                            : "—"}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Reach</span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {snapshot?.reach !== null && snapshot?.reach !== undefined
                            ? snapshot.reach.toLocaleString()
                            : "—"}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Saves</span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {snapshot?.saves !== null && snapshot?.saves !== undefined
                            ? snapshot.saves.toLocaleString()
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Published Post Real Actions Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        {/* Real Like Button */}
                        <button
                          type="button"
                          disabled={!caps.like || Boolean(actionLoading[`${target.id}_LIKE`])}
                          onClick={() => handleExecuteAction(target, "LIKE")}
                          title={caps.like ? "Like on platform" : "Not supported by this integration"}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition ${
                            caps.like
                              ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                              : "bg-slate-50 dark:bg-slate-850 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>
                            {actionLoading[`${target.id}_LIKE`]
                              ? "Liking..."
                              : caps.like
                              ? "Like"
                              : "Unsupported"}
                          </span>
                        </button>

                        {/* Real Repost Button */}
                        <button
                          type="button"
                          disabled={!caps.repost || Boolean(actionLoading[`${target.id}_REPOST`])}
                          onClick={() => handleExecuteAction(target, "REPOST")}
                          title={caps.repost ? "Repost on platform" : "Not supported by this integration"}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition ${
                            caps.repost
                              ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                              : "bg-slate-50 dark:bg-slate-850 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                          }`}
                        >
                          <Repeat2 className="w-3.5 h-3.5" />
                          <span>
                            {actionLoading[`${target.id}_REPOST`]
                              ? "Reposting..."
                              : caps.repost
                              ? "Repost"
                              : "Unsupported"}
                          </span>
                        </button>

                        {/* Real Save/Bookmark Button */}
                        <button
                          type="button"
                          disabled={!caps.save || Boolean(actionLoading[`${target.id}_SAVE`])}
                          onClick={() => handleExecuteAction(target, "SAVE")}
                          title={caps.save ? "Save on platform" : "Not supported by this integration"}
                          className={`p-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-center transition ${
                            caps.save
                              ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                              : "bg-slate-50 dark:bg-slate-850 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {actionError[`${target.id}_LIKE`] && (
                        <p className="text-[10px] text-rose-500 font-medium">
                          {actionError[`${target.id}_LIKE`]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REAL COMMENTS & MODERATION THREAD (Rule 13: Empty state = "No comments returned by this platform") */}
          <div className="bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Real Platform Comments ({comments.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Fetched from official connected APIs
              </span>
            </div>

            {/* Post new comment form if supported by primary channel */}
            {primaryTarget && PLATFORM_ACTION_CAPABILITIES[primaryTarget.socialAccount.provider.toLowerCase() as SupportedPlatform]?.comment && (
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={`Comment as ${primaryTarget.socialAccount.displayName}...`}
                  className="flex-1 px-3 py-1.5 text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment(primaryTarget);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handlePostComment(primaryTarget)}
                  disabled={isSubmittingComment || !newCommentText.trim()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmittingComment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-500 dark:text-slate-400">
                  No comments returned by this platform.
                </p>
                <p className="text-[11px]">
                  PulseSocial never simulates fake comments. Any comments posted on the live social network will sync here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                {comments.map((comment) => {
                  const targetForComment =
                    targets.find((t) => t.socialAccount.provider.toLowerCase() === comment.platform.toLowerCase()) ||
                    primaryTarget;
                  const p = (comment.platform || targetForComment?.socialAccount.provider || "facebook").toLowerCase() as SupportedPlatform;
                  const canReply = PLATFORM_ACTION_CAPABILITIES[p]?.reply;
                  const canDelete = PLATFORM_ACTION_CAPABILITIES[p]?.deleteComment;

                  return (
                    <div key={comment.id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300 overflow-hidden shrink-0 mt-0.5">
                            {comment.authorAvatarUrl ? (
                              <Image
                                src={comment.authorAvatarUrl}
                                alt={comment.authorName}
                                width={28}
                                height={28}
                                className="object-cover"
                              />
                            ) : (
                              comment.authorName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {comment.authorName}
                              </span>
                              {comment.authorUsername && (
                                <span className="text-[11px] text-slate-400">
                                  @{comment.authorUsername}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                • {new Date(comment.postedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        </div>

                        {/* Comment Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {canReply && (
                            <button
                              type="button"
                              onClick={() =>
                                setReplyInputOpen((prev) => ({
                                  ...prev,
                                  [comment.id]: !prev[comment.id],
                                }))
                              }
                              className="px-2 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition cursor-pointer"
                            >
                              Reply
                            </button>
                          )}
                          {canDelete && targetForComment && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment, targetForComment)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
                              title="Delete from official platform"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reply Form */}
                      {replyInputOpen[comment.id] && targetForComment && (
                        <div className="pl-10 flex items-center gap-2">
                          <input
                            type="text"
                            value={replyTexts[comment.id] || ""}
                            onChange={(e) =>
                              setReplyTexts((prev) => ({
                                ...prev,
                                [comment.id]: e.target.value,
                              }))
                            }
                            placeholder={`Reply to ${comment.authorName}...`}
                            className="flex-1 px-3 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleReplyToComment(comment, targetForComment);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleReplyToComment(comment, targetForComment)}
                            disabled={submittingReply[comment.id] || !replyTexts[comment.id]?.trim()}
                            className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold disabled:opacity-50 cursor-pointer transition flex items-center gap-1"
                          >
                            {submittingReply[comment.id] ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CornerDownRight className="w-3 h-3" />
                            )}
                            <span>{submittingReply[comment.id] ? "Sending..." : "Send"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:px-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2">
            {onClone && (
              <button
                type="button"
                onClick={() => {
                  onClone(post);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Clone Post
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to permanently delete this post from PulseSocial?")) {
                    onDelete(post.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
