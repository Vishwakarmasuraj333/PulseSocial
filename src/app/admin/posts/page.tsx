"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
} from "lucide-react";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/toast";

interface PostItem {
  id: string;
  content: string;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  createdAt: string;
  creator: { id: string; name: string; email: string; avatarUrl: string | null };
  organization: { id: string; name: string; slug: string };
  media: Array<{ id: string; url: string; mediaType: string }>;
  targets: Array<{
    id: string;
    provider: string;
    accountName: string;
    status: string;
    errorMessage: string | null;
    publishedAt: string | null;
  }>;
  recentAttempts: Array<{
    id: string;
    provider: string;
    status: string;
    errorMessage: string | null;
    attemptedAt: string;
  }>;
}

export default function AdminPostsPage() {
  const { toast } = useToast();

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspector modal
  const [inspectingPost, setInspectingPost] = useState<PostItem | null>(null);

  // Deleting modal
  const [deletingPost, setDeletingPost] = useState<PostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", "10");

      const res = await fetch(`/api/admin/posts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load posts");
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err: any) {
      toast({
        title: "Error Loading Posts",
        message: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleRetryPost = async (post: PostItem) => {
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "QUEUED" }),
      });
      if (!res.ok) throw new Error("Failed to requeue post");

      toast({
        title: "Post Requeued",
        message: "Post has been queued for immediate publishing attempt.",
        type: "success",
      });
      fetchPosts();
    } catch (err: any) {
      toast({
        title: "Retry Failed",
        message: err.message,
        type: "error",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!deletingPost) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/posts/${deletingPost.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");

      toast({
        title: "Post Deleted",
        message: "The post was permanently removed.",
        type: "info",
      });
      setDeletingPost(null);
      fetchPosts();
    } catch (err: any) {
      toast({
        title: "Deletion Failed",
        message: err.message,
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Posts & Publishing Pipeline ({totalCount})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit published, scheduled, and failed social posts across all tenant workspaces.
          </p>
        </div>

        <button
          onClick={fetchPosts}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-2xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search post copy content..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#6F52B5]/40"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="DRAFT">Draft</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Post Content</th>
                <th className="px-4 py-3.5">Author</th>
                <th className="px-4 py-3.5">Workspace</th>
                <th className="px-4 py-3.5">Networks</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date / Scheduled</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#6F52B5]" />
                    <span>Loading posts...</span>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No posts matching the selected criteria.
                  </td>
                </tr>
              ) : (
                posts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="line-clamp-2 text-slate-800 dark:text-slate-200 font-medium">
                        {p.content}
                      </p>
                      {p.media.length > 0 && (
                        <span className="inline-block mt-1 text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                          📎 {p.media.length} media attached
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {p.creator.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {p.creator.email}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {p.organization.name}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        {p.targets.map((t) => (
                          <span
                            key={t.id}
                            className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                            title={`${t.accountName} (${t.status})`}
                          >
                            {renderPlatformIcon(t.provider, 12)}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : p.status === "FAILED"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : p.status === "SCHEDULED"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      {p.publishedAt
                        ? `Pub: ${new Date(p.publishedAt).toLocaleDateString()}`
                        : p.scheduledFor
                        ? `Sched: ${new Date(p.scheduledFor).toLocaleDateString()}`
                        : new Date(p.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingPost(p)}
                          title="Inspect Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#6F52B5] hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {p.status === "FAILED" && (
                          <button
                            onClick={() => handleRetryPost(p)}
                            title="Retry Publishing"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeletingPost(p)}
                          title="Delete Post"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Modal */}
      {inspectingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setInspectingPost(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 z-10 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Post Inspector
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {inspectingPost.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {inspectingPost.content}
            </div>

            {/* Targets */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Target Accounts ({inspectingPost.targets.length})
              </h4>
              <div className="space-y-2">
                {inspectingPost.targets.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 flex items-center justify-center">
                        {renderPlatformIcon(t.provider, 16)}
                      </span>
                      <span className="font-semibold">{t.accountName}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        t.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Publishing Attempts / Errors */}
            {inspectingPost.recentAttempts.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Publishing Logs & Errors
                </h4>
                <div className="space-y-2">
                  {inspectingPost.recentAttempts.map((att) => (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300"
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span>{att.provider}</span>
                        <span className="text-[10px] font-mono">
                          {new Date(att.attemptedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono">{att.errorMessage || "Attempt recorded"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectingPost(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setDeletingPost(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 z-10 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete Post?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete this post?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPost(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Post</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
