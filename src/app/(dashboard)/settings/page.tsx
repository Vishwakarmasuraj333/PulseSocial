"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { InviteTeamModal } from "@/components/team/InviteTeamModal";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";
import {
  ArrowLeft,
  Info,
  Share2,
  Sliders,
  Users,
  Send,
  Inbox,
  Key,
  Bell,
  SlidersHorizontal,
  FileSpreadsheet,
  Edit2,
  Upload,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Sparkles,
  AlertTriangle,
  X,
  Camera,
  CheckCircle2,
  Loader2,
  Settings,
  Image as ImageIcon,
  CheckSquare,
  ShieldAlert,
} from "lucide-react";

export type SettingsTab =
  | "brand_info"
  | "social_channels"
  | "integrations"
  | "brand_members"
  | "publishing"
  | "inbox_pref"
  | "roles"
  | "notifications"
  | "general_pref"
  | "all_members"
  | "portal_settings"
  | "audit_log";

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "vashi, India - IST", fullLabel: "Asia/Kolkata / IST (UTC+05:30) - Mumbai, Delhi, Vashi" },
  { value: "America/New_York", label: "New York, USA - EST", fullLabel: "America/New_York / EST (UTC-05:00) - Eastern Time" },
  { value: "America/Chicago", label: "Chicago, USA - CST", fullLabel: "America/Chicago / CST (UTC-06:00) - Central Time" },
  { value: "America/Denver", label: "Denver, USA - MST", fullLabel: "America/Denver / MST (UTC-07:00) - Mountain Time" },
  { value: "America/Los_Angeles", label: "San Francisco, USA - PST", fullLabel: "America/Los_Angeles / PST (UTC-08:00) - Pacific Time" },
  { value: "Europe/London", label: "London, UK - GMT/BST", fullLabel: "Europe/London / GMT (UTC+00:00) - London, Dublin" },
  { value: "Europe/Paris", label: "Paris, France - CET", fullLabel: "Europe/Paris / CET (UTC+01:00) - Paris, Berlin, Rome" },
  { value: "Asia/Dubai", label: "Dubai, UAE - GST", fullLabel: "Asia/Dubai / GST (UTC+04:00) - United Arab Emirates" },
  { value: "Asia/Singapore", label: "Singapore - SGT", fullLabel: "Asia/Singapore / SGT (UTC+08:00) - Singapore, Hong Kong" },
  { value: "Asia/Tokyo", label: "Tokyo, Japan - JST", fullLabel: "Asia/Tokyo / JST (UTC+09:00) - Tokyo, Seoul" },
  { value: "Australia/Sydney", label: "Sydney, Australia - AEST", fullLabel: "Australia/Sydney / AEST (UTC+10:00) - Sydney, Melbourne" },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { activeBrand, updateBrand, deleteBrand, refreshBrands } = useBrand();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const directPhotoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingDirectPhoto, setIsUploadingDirectPhoto] = useState(false);

  // Tab mapping
  const mapQueryToTab = (query: string | null): SettingsTab => {
    if (!query) return "brand_info";
    const validTabs: SettingsTab[] = [
      "brand_info",
      "social_channels",
      "integrations",
      "brand_members",
      "publishing",
      "inbox_pref",
      "roles",
      "notifications",
      "general_pref",
      "all_members",
      "portal_settings",
      "audit_log",
    ];
    return validTabs.includes(query as SettingsTab) ? (query as SettingsTab) : "brand_info";
  };

  const [activeTab, setActiveTab] = useState<SettingsTab>(() =>
    mapQueryToTab(searchParams.get("tab"))
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(mapQueryToTab(tabParam));
    }
  }, [searchParams]);

  const handleTabChange = (newTab: SettingsTab) => {
    setActiveTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newTab);
    window.history.pushState({}, "", url.toString());
  };

  // ============================================================
  // BRAND INFO STATE (Loaded dynamically from DB/Active Brand)
  // ============================================================
  const [displayName, setDisplayName] = useState(activeBrand?.name || "");
  const [photoUrl, setPhotoUrl] = useState(activeBrand?.avatarUrl || "");
  const [description, setDescription] = useState(activeBrand?.description || "");
  const [selectedTimezone, setSelectedTimezone] = useState(activeBrand?.timezone || "Asia/Kolkata");

  // Keep in sync with activeBrand from Context
  useEffect(() => {
    if (activeBrand) {
      setDisplayName(activeBrand.name || "");
      if (activeBrand.avatarUrl) setPhotoUrl(activeBrand.avatarUrl);
      if (activeBrand.description) setDescription(activeBrand.description);
      if (activeBrand.timezone) setSelectedTimezone(activeBrand.timezone);
    }
  }, [activeBrand]);

  // Direct Brand Photo upload (Instant Sync without opening modal)
  const handleDirectPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        message: "Please select an image file (JPG, PNG, WEBP).",
        type: "error",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        message: "Image must be under 5MB.",
        type: "error",
      });
      return;
    }

    setIsUploadingDirectPhoto(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const uploadedUrl = data.url;

      // Direct PATCH to backend
      const patchRes = await fetch("/api/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: uploadedUrl }),
      });

      if (!patchRes.ok) {
        throw new Error("Failed to save brand logo to database");
      }

      setPhotoUrl(uploadedUrl);
      setEditPhoto(uploadedUrl);
      updateBrand(activeBrand.id, { avatarUrl: uploadedUrl });
      await refreshBrands();

      toast({
        title: "Brand Photo Updated",
        message: "Logo updated and live synced across sidebar, header, and composer.",
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        message: err.message || "Unable to upload brand photo. Please try again.",
        type: "error",
      });
    } finally {
      setIsUploadingDirectPhoto(false);
      if (directPhotoInputRef.current) directPhotoInputRef.current.value = "";
    }
  };

  // Cover photo upload
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        message: "Please select an image file (JPG, PNG, WEBP).",
        type: "error",
      });
      return;
    }

    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const uploadedUrl = data.url;

      // Update brand on backend
      await fetch("/api/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverUrl: uploadedUrl }),
      });

      updateBrand(activeBrand.id, { coverUrl: uploadedUrl });
      await refreshBrands();

      toast({
        title: "Cover Photo Updated",
        message: "Brand cover banner updated and saved successfully.",
        type: "success",
      });
    } catch {
      toast({
        title: "Upload Failed",
        message: "Unable to upload cover photo. Please try again.",
        type: "error",
      });
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // ============================================================
  // EDIT BRAND MODAL STATE & FORM LOGIC
  // ============================================================
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(displayName);
  const [editPhoto, setEditPhoto] = useState(photoUrl);
  const [editDesc, setEditDesc] = useState(description);
  const [editTimezone, setEditTimezone] = useState(selectedTimezone);
  const [tzSearchQuery, setTzSearchQuery] = useState("");
  const [isTzDropdownOpen, setIsTzDropdownOpen] = useState(false);

  const [nameError, setNameError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Open Edit Modal with fresh current values
  const openEditModal = () => {
    setEditName(displayName);
    setEditPhoto(photoUrl);
    setEditDesc(description);
    setEditTimezone(selectedTimezone);
    setNameError("");
    setIsTzDropdownOpen(false);
    setIsEditModalOpen(true);
  };

  // Filtered timezones for searchable dropdown
  const filteredTimezones = useMemo(() => {
    if (!tzSearchQuery.trim()) return TIMEZONES;
    const q = tzSearchQuery.toLowerCase();
    return TIMEZONES.filter(
      (tz) =>
        tz.label.toLowerCase().includes(q) ||
        tz.fullLabel.toLowerCase().includes(q) ||
        tz.value.toLowerCase().includes(q)
    );
  }, [tzSearchQuery]);

  // Handle Photo Upload inside Modal (supports desktop file picker & drag/drop)
  const handleModalPhotoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        message: "Please select a JPG, JPEG, PNG, or WEBP image.",
        type: "error",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        message: "Image must be under 5MB.",
        type: "error",
      });
      return;
    }

    setIsUploadingEditPhoto(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadProgress(60);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      setUploadProgress(90);
      const data = await res.json();
      setEditPhoto(data.url);
      setUploadProgress(100);

      toast({
        title: "Photo Uploaded",
        message: "New image ready to be saved with brand changes.",
        type: "success",
      });
    } catch {
      toast({
        title: "Upload Failed",
        message: "Unable to upload image. Please try again.",
        type: "error",
      });
    } finally {
      setIsUploadingEditPhoto(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag and Drop handlers
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleModalPhotoUpload(e.dataTransfer.files[0]);
    }
  };

  // Save changes from Edit Modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = editName.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError("Display name must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 60) {
      setNameError("Display name cannot exceed 60 characters.");
      return;
    }
    setNameError("");

    setIsSavingEdit(true);

    try {
      const res = await fetch("/api/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          logoUrl: editPhoto,
          timezone: editTimezone,
          description: editDesc.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update brand information.");
      }

      // Update state immediately
      setDisplayName(trimmed);
      setPhotoUrl(editPhoto);
      setDescription(editDesc.trim());
      setSelectedTimezone(editTimezone);

      // Update BrandContext
      updateBrand(activeBrand.id, {
        name: trimmed,
        avatarUrl: editPhoto,
        description: editDesc.trim(),
        timezone: editTimezone,
      });

      await refreshBrands();

      toast({
        title: "Success",
        message: "Brand information updated successfully.",
        type: "success",
      });

      setIsEditModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Save Failed",
        message: error.message || "Unable to update brand information. Please try again.",
        type: "error",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ============================================================
  // DESTRUCTIVE DELETE BRAND MODAL STATE & LOGIC
  // ============================================================
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [isDeletingBrand, setIsDeletingBrand] = useState(false);
  const isDeleteMatch =
    deleteConfirmInput.trim().toLowerCase() === (activeBrand?.name || displayName).trim().toLowerCase();

  const handleConfirmDeleteBrand = async () => {
    if (!isDeleteMatch) {
      toast({
        title: "Verification Mismatch",
        message: "Please type the exact brand name to confirm deletion.",
        type: "error",
      });
      return;
    }

    setIsDeletingBrand(true);
    try {
      const res = await fetch("/api/brand", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmName: deleteConfirmInput.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete brand.");
      }

      deleteBrand(activeBrand.id);

      toast({
        title: "Brand Deleted",
        message: `Brand "${activeBrand.name}" has been permanently removed.`,
        type: "success",
      });

      setIsDeleteModalOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Deletion Failed",
        message: err.message || "Unable to delete brand. Please check your permissions.",
        type: "error",
      });
    } finally {
      setIsDeletingBrand(false);
    }
  };

  // ============================================================
  // SOCIAL CHANNELS STATE & REAL API
  // ============================================================
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedConnectPlatform, setSelectedConnectPlatform] = useState<string>("facebook");
  const [connectedProviders, setConnectedProviders] = useState<any[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);

  const fetchChannels = async () => {
    setIsLoadingChannels(true);
    try {
      const res = await fetch("/api/social/providers");
      if (res.ok) {
        const data = await res.json();
        setConnectedProviders(data.providers || []);
      }
    } catch {
    } finally {
      setIsLoadingChannels(false);
    }
  };

  useEffect(() => {
    if (activeTab === "social_channels") {
      fetchChannels();
    }
  }, [activeTab]);

  const handleDisconnectChannel = async (platformName: string, accountId?: string) => {
    try {
      if (accountId) {
        await fetch(`/api/social/accounts?id=${accountId}`, {
          method: "DELETE",
        });
      }
      toast({
        title: "Channel Disconnected",
        message: `${platformName} unlinked from ${activeBrand.name}.`,
        type: "info",
      });
      fetchChannels();
    } catch {
      toast({
        title: "Disconnect Failed",
        message: "Could not unlink channel.",
        type: "error",
      });
    }
  };

  // ============================================================
  // REAL MEMBERS STATE & API
  // ============================================================
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "brand_members" || activeTab === "all_members") {
      fetchMembers();
    }
  }, [activeTab]);

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      const res = await fetch(`/api/team?id=${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Member Removed",
          message: `${memberName} was removed.`,
          type: "success",
        });
        fetchMembers();
      } else {
        const data = await res.json();
        toast({
          title: "Cannot Remove Member",
          message: data.error || "Failed to remove member.",
          type: "error",
        });
      }
    } catch {
      toast({
        title: "Error",
        message: "Failed to remove member.",
        type: "error",
      });
    }
  };

  // ============================================================
  // REAL AUDIT LOG STATE & API
  // ============================================================
  const [auditSearch, setAuditSearch] = useState("");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const fetchAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const res = await fetch("/api/brand/audit");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch {
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === "audit_log") {
      fetchAuditLogs();
    }
  }, [activeTab]);

  // ============================================================
  // PREFERENCES / PUBLISHING / INBOX / NOTIFICATIONS STATE
  // ============================================================
  const [publishingSettings, setPublishingSettings] = useState({
    requireApproval: false,
    duplicateGuard: true,
    useShortener: true,
  });

  const [inboxSettings, setInboxSettings] = useState({
    greetingMsg: "Hello! Thanks for reaching out. Our team will get back to you shortly! 👋",
    aiSentiment: true,
    autoAssign: true,
  });

  const [notificationToggles, setNotificationToggles] = useState({
    postPublished: true,
    postFailed: true,
    commentsMentions: true,
    directMessages: true,
    weeklyDigest: false,
  });

  const [portalConfig, setPortalConfig] = useState({
    language: "English (US)",
    dateFormat: "DD/MM/YYYY",
    workspaceSlug: activeBrand?.slug || "workspace",
  });

  const [isSavingPref, setIsSavingPref] = useState(false);

  const handleSavePreferences = async (sectionName: string) => {
    setIsSavingPref(true);
    try {
      await fetch("/api/brand/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requireApproval: publishingSettings.requireApproval,
          aiAutoSuggest: inboxSettings.aiSentiment,
          notificationsEmail: notificationToggles.postPublished,
        }),
      });

      toast({
        title: "Settings Saved",
        message: `${sectionName} preferences successfully saved to backend.`,
        type: "success",
      });
    } catch {
      toast({
        title: "Error",
        message: "Failed to update preferences.",
        type: "error",
      });
    } finally {
      setIsSavingPref(false);
    }
  };

  // Get friendly timezone label for read view
  const currentTzLabel = useMemo(() => {
    const found = TIMEZONES.find((t) => t.value === selectedTimezone);
    return found ? found.label : "vashi, India - IST";
  }, [selectedTimezone]);

  return (
    <AppLayout>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden min-h-[780px] flex flex-col md:flex-row font-sans text-slate-800 dark:text-slate-100">
        {/* ============================================================ */}
        {/* LEFT SETTINGS SIDEBAR (Exact Visual Match to Screenshot)     */}
        {/* ============================================================ */}
        <aside className="w-full md:w-60 border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-3 shrink-0 select-none">
          {/* Back button */}
          <div className="mb-4 pt-1 px-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1877F2] hover:underline transition"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
          </div>

          {/* Group 1: BRAND SETTINGS */}
          <div className="mb-4">
            <div className="flex items-center gap-2 px-2.5 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                BRAND SETTINGS
              </span>
              <div className="flex-1 h-px bg-slate-200/70 dark:bg-slate-800" />
            </div>

            <nav className="space-y-0.5 text-xs font-medium">
              {[
                { id: "brand_info", label: "Brand Information", icon: Info },
                { id: "social_channels", label: "Social Channels", icon: Share2 },
                { id: "integrations", label: "Integrations", icon: Sliders },
                { id: "brand_members", label: "Brand Members", icon: Users },
                { id: "publishing", label: "Publishing", icon: Send },
                { id: "inbox_pref", label: "Inbox Preferences", icon: Inbox },
                { id: "roles", label: "Roles & Permissions", icon: Key },
                { id: "notifications", label: "Notifications", icon: Bell },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(item.id as SettingsTab)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer text-xs ${
                      isActive
                        ? "bg-blue-50/80 dark:bg-blue-950/40 text-[#1877F2] font-bold border-l-3 border-[#1877F2]"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#1877F2]" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Group 2: GENERAL SETTINGS */}
          <div>
            <div className="flex items-center gap-2 px-2.5 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                GENERAL SETTINGS
              </span>
              <div className="flex-1 h-px bg-slate-200/70 dark:bg-slate-800" />
            </div>

            <nav className="space-y-0.5 text-xs font-medium">
              {[
                { id: "general_pref", label: "Preference", icon: SlidersHorizontal },
                { id: "all_members", label: "All Members", icon: Users },
                { id: "portal_settings", label: "Portal Settings", icon: Settings, hasDot: true },
                { id: "audit_log", label: "Audit Log", icon: FileSpreadsheet },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(item.id as SettingsTab)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition cursor-pointer text-xs ${
                      isActive
                        ? "bg-blue-50/80 dark:bg-blue-950/40 text-[#1877F2] font-bold border-l-3 border-[#1877F2]"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#1877F2]" : "text-slate-400"}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.hasDot && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* RIGHT CONTENT WORKSPACE                                      */}
        {/* ============================================================ */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {/* ============================================================ */}
          {/* TAB 1: Brand Information (Exact Visual Match to Screenshot)  */}
          {/* ============================================================ */}
          {activeTab === "brand_info" && (
            <div className="max-w-4xl space-y-6">
              {/* Header with Title & Action Buttons */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Brand Information
                </h1>

                <div className="flex items-center gap-2.5">
                  {/* Edit Button matching screenshot */}
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="px-4 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:border-slate-400"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Brand Button matching screenshot */}
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmInput("");
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-md border border-rose-200 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:border-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Brand</span>
                  </button>
                </div>
              </div>

              {/* Data Fields matching Screenshot */}
              <div className="space-y-6 pt-2">
                {/* 1. Display Name */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Display Name
                  </div>
                  <div className="sm:col-span-9 max-w-lg">
                    <span className="text-xs text-slate-900 dark:text-slate-100 font-normal">
                      {displayName || activeBrand?.name || "Workspace Brand"}
                    </span>
                  </div>
                </div>

                {/* 2. Photo */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  <div className="sm:col-span-3 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2">
                    Photo
                  </div>
                  <div className="sm:col-span-9 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div 
                      onClick={() => directPhotoInputRef.current?.click()}
                      className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm bg-slate-900 shrink-0 cursor-pointer group hover:ring-2 hover:ring-blue-500 transition"
                      title="Click to directly upload new brand logo"
                    >
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={displayName || "Brand"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-extrabold text-xl bg-blue-600">
                          {(displayName || "P").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <Camera className="w-5 h-5 drop-shadow" />
                        <span className="text-[9px] font-bold mt-0.5">Upload</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => directPhotoInputRef.current?.click()}
                          disabled={isUploadingDirectPhoto}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isUploadingDirectPhoto ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{isUploadingDirectPhoto ? "Uploading Logo..." : "Upload Brand Photo"}</span>
                        </button>

                        {photoUrl && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/60">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Live Synced
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Direct instant update without opening modal. Syncs live across sidebar, header, and composer.
                      </p>
                      <input
                        ref={directPhotoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleDirectPhotoUpload}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Description */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  <div className="sm:col-span-3 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                    Description
                  </div>
                  <div className="sm:col-span-9 max-w-lg">
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                      {description || "No description provided for this brand."}
                    </p>
                  </div>
                </div>

                {/* 4. Time Zone */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  <div className="sm:col-span-3 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                    Time Zone
                  </div>
                  <div className="sm:col-span-9 max-w-lg">
                    <span className="text-xs text-slate-800 dark:text-slate-200 font-normal">
                      {currentTzLabel}
                    </span>
                  </div>
                </div>

                {/* 5. Brand Cover Photo Section (Matching Screenshot with Live Banner & Sparkles) */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Brand Cover Banner</span>
                        {activeBrand?.coverUrl && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium">
                            Active
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Syncs live across brand workspace, client portal, and profile exports.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={isUploadingCover}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isUploadingCover ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <span>{isUploadingCover ? "Uploading Cover..." : "Change cover photo for your brand"}</span>
                      <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    </button>
                  </div>

                  {activeBrand?.coverUrl ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs group">
                      <Image
                        src={activeBrand.coverUrl}
                        alt="Brand Cover"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-900 text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <Camera className="w-3.5 h-3.5 text-blue-600" />
                          <span>Update Cover Photo</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="w-full h-24 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/40 hover:border-blue-400 transition flex items-center justify-center gap-2 text-slate-500 text-xs cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      <span>No cover photo set. Click here to upload a 1200x400 cover banner.</span>
                    </div>
                  )}

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: Social Channels (Real Connected Accounts)             */}
          {/* ============================================================ */}
          {activeTab === "social_channels" && (
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Add a social channel to this Brand</span>
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect official pages and accounts for <strong>{activeBrand.name}</strong> to publish, schedule, monitor, and engage directly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedConnectPlatform("facebook");
                    setIsConnectModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Connect Channel</span>
                </button>
              </div>

              {isLoadingChannels ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs">Loading channel connections...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      platform: "facebook",
                      name: "Facebook",
                      desc: "Facebook Business Pages, Video Reels, Stories & Engagement",
                      btnLabel: "Connect Facebook",
                      btnClass: "bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-xs hover:shadow-md hover:shadow-blue-500/25",
                      cardBorder: "hover:border-[#1877F2]/50 hover:bg-blue-50/20",
                    },
                    {
                      platform: "instagram",
                      name: "Instagram",
                      desc: "Instagram Professional Profiles, Reels, Carousels & Analytics",
                      btnLabel: "Connect Instagram",
                      btnClass: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white shadow-xs hover:shadow-md hover:shadow-rose-500/25",
                      cardBorder: "hover:border-rose-400/50 hover:bg-rose-50/20",
                    },
                    {
                      platform: "x",
                      name: "X (Twitter)",
                      desc: "Direct Posts, Threads, Polls, Media & Audience Mentions",
                      btnLabel: "Connect X",
                      btnClass: "bg-black hover:bg-slate-800 text-white shadow-xs hover:shadow-md",
                      cardBorder: "hover:border-slate-500/50 hover:bg-slate-50/30",
                    },
                    {
                      platform: "linkedin",
                      name: "LinkedIn",
                      desc: "Company Showcase Pages, Personal Profiles & Professional Articles",
                      btnLabel: "Connect LinkedIn",
                      btnClass: "bg-[#0A66C2] hover:bg-[#084e96] text-white shadow-xs hover:shadow-md hover:shadow-blue-600/25",
                      cardBorder: "hover:border-[#0A66C2]/50 hover:bg-sky-50/20",
                    },
                    {
                      platform: "youtube",
                      name: "YouTube",
                      desc: "Full Long-form Videos, Shorts & Official Community Tab",
                      btnLabel: "Connect YouTube",
                      btnClass: "bg-[#FF0000] hover:bg-[#cc0000] text-white shadow-xs hover:shadow-md hover:shadow-red-500/25",
                      cardBorder: "hover:border-red-400/50 hover:bg-red-50/20",
                    },
                    {
                      platform: "tiktok",
                      name: "TikTok",
                      desc: "Short-form Creator Video Feeds, Music & Viral Audio Library",
                      btnLabel: "Connect TikTok",
                      btnClass: "bg-black hover:bg-slate-900 text-white shadow-xs hover:shadow-md border border-slate-700",
                      cardBorder: "hover:border-slate-500/50 hover:bg-slate-50/30",
                    },
                    {
                      platform: "pinterest",
                      name: "Pinterest",
                      desc: "Rich Image Pins, Creative Idea Boards & Direct Site Links",
                      btnLabel: "Connect Pinterest",
                      btnClass: "bg-[#E60023] hover:bg-[#ad081b] text-white shadow-xs hover:shadow-md hover:shadow-red-600/25",
                      cardBorder: "hover:border-red-400/50 hover:bg-red-50/20",
                    },
                    {
                      platform: "snapchat",
                      name: "Snapchat",
                      desc: "Camera Stories, Lens Assets & Vertical Creative Kit Publishing",
                      btnLabel: "Connect Snapchat",
                      btnClass: "bg-[#FFFC00] hover:bg-yellow-400 text-black font-bold shadow-xs hover:shadow-md",
                      cardBorder: "hover:border-yellow-400/50 hover:bg-yellow-50/20",
                    },
                    {
                      platform: "threads",
                      name: "Threads",
                      desc: "Conversational Microblogging, Reply Chains & Instagram Community",
                      btnLabel: "Connect Threads",
                      btnClass: "bg-black hover:bg-slate-800 text-white shadow-xs hover:shadow-md",
                      cardBorder: "hover:border-slate-600/50 hover:bg-slate-50/30",
                    },
                    {
                      platform: "whatsapp",
                      name: "WhatsApp Business",
                      desc: "Direct Customer Channels, Broadcast Messages & Verified Catalogs",
                      btnLabel: "Connect WhatsApp",
                      btnClass: "bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs hover:shadow-md hover:shadow-emerald-500/25",
                      cardBorder: "hover:border-emerald-400/50 hover:bg-emerald-50/20",
                    },
                    {
                      platform: "reddit",
                      name: "Reddit",
                      desc: "Subreddit Announcements, Community Discussion & Karma Analytics",
                      btnLabel: "Connect Reddit",
                      btnClass: "bg-[#FF4500] hover:bg-[#e03d00] text-white shadow-xs hover:shadow-md hover:shadow-orange-500/25",
                      cardBorder: "hover:border-orange-400/50 hover:bg-orange-50/20",
                    },
                    {
                      platform: "bluesky",
                      name: "Bluesky",
                      desc: "Decentralized Social Network via AT Protocol & Custom Feeds",
                      btnLabel: "Connect Bluesky",
                      btnClass: "bg-[#1185FE] hover:bg-blue-600 text-white shadow-xs hover:shadow-md hover:shadow-blue-500/25",
                      cardBorder: "hover:border-blue-400/50 hover:bg-blue-50/20",
                    },
                    {
                      platform: "telegram",
                      name: "Telegram Channel",
                      desc: "Instant Announcement Broadcasts, Subscriber Polls & Rich Media",
                      btnLabel: "Connect Telegram",
                      btnClass: "bg-[#24A1DE] hover:bg-[#208fcf] text-white shadow-xs hover:shadow-md hover:shadow-sky-500/25",
                      cardBorder: "hover:border-sky-400/50 hover:bg-sky-50/20",
                    },
                    {
                      platform: "google_business",
                      name: "Google Business Profile",
                      desc: "Storefront Locations, Local Updates, Photos & Customer Reviews",
                      btnLabel: "Connect Google Business",
                      btnClass: "bg-[#4285F4] hover:bg-[#3367d6] text-white shadow-xs hover:shadow-md hover:shadow-blue-400/25",
                      cardBorder: "hover:border-blue-400/50 hover:bg-blue-50/20",
                    },
                    {
                      platform: "mastodon",
                      name: "Mastodon",
                      desc: "Decentralized Fediverse Federated Network & Community Instances",
                      btnLabel: "Connect Mastodon",
                      btnClass: "bg-[#6364FF] hover:bg-[#5253e0] text-white shadow-xs hover:shadow-md hover:shadow-indigo-500/25",
                      cardBorder: "hover:border-indigo-400/50 hover:bg-indigo-50/20",
                    },
                  ].map((chan) => {
                    const found = connectedProviders.find((p) => p.platform === chan.platform);
                    const isConnected = Boolean(found?.isConnected);
                    const connAccount = found?.connectedAccount;

                    return (
                      <div
                        key={chan.platform}
                        className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs transition-all duration-200 flex flex-col justify-between gap-3 group ${chan.cardBorder}`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                            {renderPlatformIcon(chan.platform, 36)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {chan.name}
                              </h4>
                              {isConnected && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                  <Check className="w-2.5 h-2.5" /> Connected
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal line-clamp-2">
                              {isConnected
                                ? `${connAccount?.displayName || connAccount?.username || "Authenticated Page"} — Token synced & active`
                                : chan.desc}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          {isConnected ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedConnectPlatform(chan.platform);
                                  setIsConnectModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-md text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                              >
                                Reconnect
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDisconnectChannel(chan.name, connAccount?.id)}
                                className="px-3 py-1 rounded-md text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                Disconnect
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedConnectPlatform(chan.platform);
                                setIsConnectModalOpen(true);
                              }}
                              className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98] cursor-pointer ${chan.btnClass}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{chan.btnLabel}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: Integrations                                          */}
          {/* ============================================================ */}
          {activeTab === "integrations" && (
            <div className="max-w-4xl space-y-6">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Integrations</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect third-party design, storage, and automation services to PulseSocial.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "canva", name: "Canva Design Studio", desc: "Design graphics and import directly into the post composer.", connected: true },
                  { id: "gdrive", name: "Google Drive", desc: "Sync video assets, episode thumbnails, and brand folders.", connected: true },
                  { id: "slack", name: "Slack Notifications", desc: "Send publishing confirmations and approval alerts to your Slack channels.", connected: false },
                  { id: "zapier", name: "Zapier", desc: "Automate cross-platform ingestion and RSS webhook workflows.", connected: false },
                  { id: "bitly", name: "Custom Link Shortener (zurl.co)", desc: "Automatic click tracking and UTM campaign tagging.", connected: true },
                  { id: "openai", name: "PulseAI / Zia Assistant", desc: "Generate witty captions, content ideas, and viral hashtags.", connected: true },
                ].map((integ) => (
                  <div
                    key={integ.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {integ.name}
                        {integ.connected && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Active
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">{integ.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toast({
                          title: integ.connected ? "Configuration Saved" : "Integration Connected",
                          message: `${integ.name} status updated.`,
                          type: "success",
                        });
                      }}
                      className={`px-3 py-1 rounded text-xs font-semibold shrink-0 cursor-pointer ${
                        integ.connected
                          ? "border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {integ.connected ? "Configure" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: Brand Members & All Members (Real Backend Data)       */}
          {/* ============================================================ */}
          {(activeTab === "brand_members" || activeTab === "all_members") && (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {activeTab === "brand_members" ? "Brand Members" : "All Members Directory"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage team access, assign roles, and invite collaborators to {activeBrand.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invite Member</span>
                </button>
              </div>

              {isLoadingMembers ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs">Loading brand members...</span>
                </div>
              ) : members.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border border-dashed rounded-xl">
                  <p className="text-xs">No team members added yet.</p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Member</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              {m.avatar ? (
                                <Image src={m.avatar} alt={m.name} width={28} height={28} className="object-cover" />
                              ) : (
                                <span>{m.initial}</span>
                              )}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">{m.name}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{m.email}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {m.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[11px] font-semibold ${m.status === "Active" ? "text-emerald-600" : "text-amber-600"}`}>
                              ● {m.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {m.role !== "OWNER" && m.role !== "Owner" && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(m.id, m.name)}
                                className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                                title="Remove member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: Publishing Preferences                                */}
          {/* ============================================================ */}
          {activeTab === "publishing" && (
            <div className="max-w-3xl space-y-6">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Publishing Preferences</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure default scheduling windows, link shorteners, and duplicate post protection.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Link Shortener & Tracking</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="shortener"
                        checked={publishingSettings.useShortener}
                        onChange={() => setPublishingSettings((p) => ({ ...p, useShortener: true }))}
                        className="accent-blue-600"
                      />
                      <span>Use default zurl.co branded shortener</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="shortener"
                        checked={!publishingSettings.useShortener}
                        onChange={() => setPublishingSettings((p) => ({ ...p, useShortener: false }))}
                        className="accent-blue-600"
                      />
                      <span>Do not shorten links (keep original URL)</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Duplicate Post Guard</h4>
                  <p className="text-slate-500 text-[11px]">
                    Alert creators if identical text or media was published across channels within 24 hours.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={publishingSettings.duplicateGuard}
                      onChange={(e) => setPublishingSettings((p) => ({ ...p, duplicateGuard: e.target.checked }))}
                      className="accent-blue-600 rounded"
                    />
                    <span>Enable duplicate guard warnings</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSavePreferences("Publishing")}
                    disabled={isSavingPref}
                    className="px-5 py-2 rounded-md bg-[#1877F2] text-white font-semibold text-xs hover:bg-blue-700 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavingPref && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: Inbox Preferences                                     */}
          {/* ============================================================ */}
          {activeTab === "inbox_pref" && (
            <div className="max-w-3xl space-y-6">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inbox Preferences</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set message assignment rules, automated away responses, and sentiment thresholds.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Automated Greeting Message</h4>
                  <textarea
                    rows={3}
                    value={inboxSettings.greetingMsg}
                    onChange={(e) => setInboxSettings((s) => ({ ...s, greetingMsg: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">AI Sentiment Analysis</h4>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={inboxSettings.aiSentiment}
                      onChange={(e) => setInboxSettings((s) => ({ ...s, aiSentiment: e.target.checked }))}
                      className="accent-blue-600 rounded"
                    />
                    <span>Automatically flag negative or urgent customer inquiries</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSavePreferences("Inbox")}
                    disabled={isSavingPref}
                    className="px-5 py-2 rounded-md bg-[#1877F2] text-white font-semibold text-xs hover:bg-blue-700 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavingPref && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Inbox Rules</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7: Roles & Permissions                                   */}
          {/* ============================================================ */}
          {activeTab === "roles" && (
            <div className="max-w-4xl space-y-6">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Roles & Permissions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enterprise RBAC matrix controlling publishing authority and workspace management.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs shadow-2xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-3 text-center">Create</th>
                      <th className="py-2.5 px-3 text-center">Publish</th>
                      <th className="py-2.5 px-3 text-center">Approve</th>
                      <th className="py-2.5 px-3 text-center">Delete</th>
                      <th className="py-2.5 px-3 text-center">Inbox</th>
                      <th className="py-2.5 px-3 text-center">Settings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {[
                      { role: "Owner", c: true, p: true, a: true, d: true, i: true, s: true },
                      { role: "Admin", c: true, p: true, a: true, d: true, i: true, s: true },
                      { role: "Publisher", c: true, p: true, a: false, d: false, i: true, s: false },
                      { role: "Approver", c: true, p: false, a: true, d: false, i: true, s: false },
                      { role: "Analyst", c: false, p: false, a: false, d: false, i: false, s: false },
                    ].map((r) => (
                      <tr key={r.role} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{r.role}</td>
                        <td className="py-3 px-3 text-center">{r.c ? "✓" : "—"}</td>
                        <td className="py-3 px-3 text-center">{r.p ? "✓" : "—"}</td>
                        <td className="py-3 px-3 text-center">{r.a ? "✓" : "—"}</td>
                        <td className="py-3 px-3 text-center">{r.d ? "✓" : "—"}</td>
                        <td className="py-3 px-3 text-center">{r.i ? "✓" : "—"}</td>
                        <td className="py-3 px-3 text-center">{r.s ? "✓" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 8: Notifications                                         */}
          {/* ============================================================ */}
          {activeTab === "notifications" && (
            <div className="max-w-3xl space-y-6">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose how and when PulseSocial alerts your team.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { key: "postPublished", title: "Post Published Successfully", desc: "Notify when scheduled posts go live on channels." },
                  { key: "postFailed", title: "Post Publication Failures", desc: "Immediate high-priority alert if a token expires or API rejects a post." },
                  { key: "commentsMentions", title: "New Comments & Mentions", desc: "Alert when followers engage with your Facebook reels or videos." },
                  { key: "directMessages", title: "Direct Messages", desc: "Notify when customer messages arrive in unified inbox." },
                  { key: "weeklyDigest", title: "Weekly Analytics Digest", desc: "Summarize reach, top content, and follower growth every Monday." },
                ].map((item) => (
                  <div key={item.key} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notificationToggles as any)[item.key]}
                      onChange={(e) =>
                        setNotificationToggles((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleSavePreferences("Notification")}
                  disabled={isSavingPref}
                  className="px-5 py-2 rounded-md bg-[#1877F2] text-white font-semibold text-xs hover:bg-blue-700 cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingPref && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Notification Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 9: General Preference & Portal Settings                  */}
          {/* ============================================================ */}
          {(activeTab === "general_pref" || activeTab === "portal_settings") && (
            <div className="max-w-3xl space-y-6">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeTab === "general_pref" ? "General Preferences" : "Portal Settings"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure language, date formats, workspace slugs, and portal defaults.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Language</label>
                    <select
                      value={portalConfig.language}
                      onChange={(e) => setPortalConfig((c) => ({ ...c, language: e.target.value }))}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    >
                      <option>English (US)</option>
                      <option>Hindi (हिन्दी)</option>
                      <option>Spanish (Español)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Date Format</label>
                    <select
                      value={portalConfig.dateFormat}
                      onChange={(e) => setPortalConfig((c) => ({ ...c, dateFormat: e.target.value }))}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    >
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Workspace Portal URL</label>
                  <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden text-xs">
                    <span className="bg-slate-100 px-3 py-2 text-slate-500">https://social.pulsesocial.io/</span>
                    <input
                      type="text"
                      value={portalConfig.workspaceSlug}
                      onChange={(e) => setPortalConfig((c) => ({ ...c, workspaceSlug: e.target.value }))}
                      className="p-2 flex-1 outline-none text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSavePreferences("Portal")}
                    disabled={isSavingPref}
                    className="px-5 py-2 rounded-md bg-[#1877F2] text-white font-semibold text-xs hover:bg-blue-700 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavingPref && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 10: Audit Log (Real Database Activity)                   */}
          {/* ============================================================ */}
          {activeTab === "audit_log" && (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Log</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable security log of operations performed across {activeBrand.name}.
                  </p>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {isLoadingAudit ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs">Loading audit events...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border border-dashed rounded-xl">
                  <p className="text-xs">No audit logs recorded yet.</p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs shadow-2xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Event</th>
                        <th className="py-2.5 px-4">Actor</th>
                        <th className="py-2.5 px-4">Target</th>
                        <th className="py-2.5 px-4">IP Address</th>
                        <th className="py-2.5 px-4">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs
                        .filter((l) =>
                          auditSearch ? l.action.toLowerCase().includes(auditSearch.toLowerCase()) : true
                        )
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-mono font-bold text-blue-600 text-[11px]">{log.action}</td>
                            <td className="py-3 px-4 font-medium text-slate-900">{log.actor}</td>
                            <td className="py-3 px-4 text-slate-600">{log.target}</td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">{log.ip}</td>
                            <td className="py-3 px-4 text-slate-500">{log.time}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ============================================================ */}
      {/* REAL "EDIT BRAND INFORMATION" MODAL                          */}
      {/* ============================================================ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 sm:p-7 text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150 overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Edit Brand Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update identity, brand avatar, description and posting timezone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="space-y-5 pt-4">
              {/* 1. Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  placeholder="e.g. Acme Marketing"
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border ${
                    nameError
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                  } focus:outline-none focus:ring-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-white`}
                />
                {nameError && (
                  <p className="text-[11px] text-rose-500 font-medium">{nameError}</p>
                )}
              </div>

              {/* 2. Brand Photo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Brand Photo
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`p-4 rounded-xl border-2 border-dashed transition flex flex-col sm:flex-row items-center gap-4 ${
                    isDragOver
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20"
                  }`}
                >
                  {/* Photo Preview */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 bg-slate-900 shrink-0 shadow-xs">
                    {editPhoto ? (
                      <Image
                        src={editPhoto}
                        alt="Brand preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-extrabold text-base bg-blue-600">
                        {editName.charAt(0) || "B"}
                      </div>
                    )}
                  </div>

                  {/* Actions & Dropzone info */}
                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingEditPhoto}
                        className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isUploadingEditPhoto ? "Uploading..." : "Upload from Desktop"}</span>
                      </button>

                      {editPhoto && (
                        <button
                          type="button"
                          onClick={() => setEditPhoto("")}
                          className="px-2.5 py-1.5 text-xs font-medium text-rose-500 hover:text-rose-700 hover:underline transition cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Drag & drop an image or click upload. JPG, PNG, WEBP up to 5MB.
                    </p>

                    {isUploadingEditPhoto && (
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mt-1.5">
                        <div
                          className="bg-blue-600 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleModalPhotoUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>

              {/* 3. Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Description
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {editDesc.length} / 500
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Describe your brand, themes, target audience..."
                  className="w-full p-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white leading-relaxed resize-y font-sans"
                />
              </div>

              {/* 4. Time Zone (Searchable Dropdown) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Time Zone
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTzDropdownOpen(!isTzDropdownOpen)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-between text-left cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <span>
                      {TIMEZONES.find((t) => t.value === editTimezone)?.fullLabel ||
                        "Asia/Kolkata / IST (UTC+05:30) - Mumbai, Delhi, Vashi"}
                    </span>
                    <span className="text-slate-400 text-[10px]">▼</span>
                  </button>

                  {/* Searchable Dropdown Menu */}
                  {isTzDropdownOpen && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={tzSearchQuery}
                            onChange={(e) => setTzSearchQuery(e.target.value)}
                            placeholder="Search timezones (e.g. India, IST, New York)..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredTimezones.map((tz) => (
                          <button
                            key={tz.value}
                            type="button"
                            onClick={() => {
                              setEditTimezone(tz.value);
                              setIsTzDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer ${
                              editTimezone === tz.value
                                ? "bg-blue-50/80 font-bold text-blue-600"
                                : "text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            <span>{tz.fullLabel}</span>
                            {editTimezone === tz.value && (
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Note: Changing time zone will not reschedule posts that are already scheduled for this brand.
                </p>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingEdit || isUploadingEditPhoto}
                  className="px-6 py-2 rounded-lg bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingEdit ? "Saving Changes..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* REAL PRODUCTION DESTRUCTIVE DELETE BRAND CONFIRMATION MODAL  */}
      {/* Requires typing the exact brand name to confirm deletion     */}
      {/* ============================================================ */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-l-[6px] border-[#ff5757] max-w-lg w-full p-6 sm:p-7 text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              {/* Alert Warning Icon */}
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  Delete Brand?
                </h3>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  This action will permanently remove <strong>{activeBrand.name || displayName}</strong> and its associated configuration. This action cannot be undone.
                </p>

                {/* Explicit Verification by Typing Name */}
                <div className="mt-4 p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 space-y-2">
                  <p className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                    Type <strong>{activeBrand.name || displayName}</strong> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    placeholder={activeBrand.name || displayName}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                    autoFocus
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeletingBrand}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 px-3 py-1.5 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmDeleteBrand}
                    disabled={!isDeleteMatch || isDeletingBrand}
                    className="px-6 py-2 rounded-full bg-[#f04438] hover:bg-[#d92d20] text-white font-semibold text-xs shadow-xs transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                  >
                    {isDeletingBrand && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isDeletingBrand ? "Deleting Brand..." : "Delete Brand"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Social Connect Modal */}
      <UniversalSocialConnectModal
        isOpen={isConnectModalOpen}
        platformId={selectedConnectPlatform}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={() => {
          fetchChannels();
          toast({
            title: "Channel Connected",
            message: "Social profile successfully authenticated and linked.",
            type: "success",
          });
        }}
      />

      {/* Invite Member Modal */}
      <InviteTeamModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onComplete={() => {
          setIsInviteModalOpen(false);
          fetchMembers();
          toast({
            title: "Invitation Sent",
            message: "Team member invitation email dispatched.",
            type: "success",
          });
        }}
      />
    </AppLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f2f5f8] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
