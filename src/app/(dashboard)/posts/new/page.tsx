"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBrand } from "@/context/BrandContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { renderPlatformIcon } from "@/components/icons/PlatformIcons";
import { GeminiAiModal } from "@/components/composer/GeminiAiModal";
import { RealLocationMapModal, LocationData } from "@/components/composer/RealLocationMapModal";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";
import {
  PostPreview,
  PreviewAccount,
  PreviewMediaItem,
} from "@/components/composer/previews/PostPreview";
import { getPlatformCapability } from "@/lib/social/capabilities";
import {
  Send,
  Calendar,
  Clock,
  Image as ImageIcon,
  Smile,
  Hash,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  X,
  Loader2,
  Plus,
  Video,
  FileText,
  AlertTriangle,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Check,
  Search,
  Filter,
  Globe,
  MapPin,
  MessageCircle,
  RefreshCw,
  Eye,
  Info,
  ArrowRight,
  Save,
  Link2,
  Share2,
  XCircle,
  Layers,
} from "lucide-react";

// Categorized emoji palette
const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😎", "🤩", "🥳", "🤔", "🫡", "🤫", "🤗"],
  },
  {
    name: "Gestures",
    emojis: ["👍", "👎", "👏", "🙌", "🤝", "✌️", "🤞", "🫰", "🤙", "💪", "👊", "✊", "👋", "🙏", "❤️", "🔥", "✨", "💯", "🚀", "💡", "🎉", "🌟"],
  },
  {
    name: "Business & Tech",
    emojis: ["📊", "📈", "📉", "💻", "📱", "💼", "🏢", "🎯", "🏆", "🥇", "📅", "📆", "📌", "📍", "🔔", "📣", "📢", "🎙️", "📝", "✍️", "💰", "⚡"],
  },
  {
    name: "Objects & Nature",
    emojis: ["☕", "🍕", "🍔", "🌍", "🌎", "🌱", "🌿", "🌸", "☀️", "🌙", "⭐", "🌈", "🚗", "✈️", "🚢", "🏖️", "🎨", "🎬", "📚", "🔮", "💎", "🛡️"],
  },
];

interface PublishingResultItem {
  provider: string;
  displayName: string;
  status: "PUBLISHED" | "FAILED" | "SKIPPED";
  platformPostId?: string | null;
  errorMessage?: string | null;
}

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { activeBrand } = useBrand();

  // Content state
  const [content, setContent] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<PreviewAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [previewPlatform, setPreviewPlatform] = useState<string>("linkedin");
  const [platformCategoryFilter, setPlatformCategoryFilter] = useState<string>("all");
  const [workspaceView, setWorkspaceView] = useState<"split" | "editor" | "preview">("split");

  // Multi-media state
  const [media, setMedia] = useState<PreviewMediaItem[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [directMediaUrl, setDirectMediaUrl] = useState("");
  const [editingAltIndex, setEditingAltIndex] = useState<number | null>(null);
  const [tempAltText, setTempAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Platform specific settings
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [isShorts, setIsShorts] = useState(false);
  const [firstComment, setFirstComment] = useState("");
  const [showFirstComment, setShowFirstComment] = useState(false);

  // Location tagging
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Modals & Popovers
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedConnectPlatform, setSelectedConnectPlatform] = useState<string | undefined>(undefined);
  const [activeEmojiTab, setActiveEmojiTab] = useState(0);
  const emojiRef = useRef<HTMLDivElement>(null);

  // Scheduling state
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [userTimezone, setUserTimezone] = useState("UTC");

  // Publishing & Autosave status
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"SAVED" | "SAVING" | "IDLE">("IDLE");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [persistedPostId, setPersistedPostId] = useState<string | null>(null);
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false);

  // Publication Results Dialog
  const [publicationResults, setPublicationResults] = useState<{
    isOpen: boolean;
    overallStatus: "SUCCESS" | "PARTIAL" | "FAILED";
    results: PublishingResultItem[];
  }>({
    isOpen: false,
    overallStatus: "SUCCESS",
    results: [],
  });

  // Detect user's timezone on mount
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setUserTimezone(tz);
    } catch {}
  }, []);

  // Fetch connected accounts from backend
  const loadAccounts = useCallback(() => {
    setIsLoadingAccounts(true);
    fetch("/api/social/providers", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const liveAccs: PreviewAccount[] = [];
        (data?.providers || []).forEach((p: any) => {
          if (p.isConnected && p.connectedAccount) {
            liveAccs.push({
              id: p.connectedAccount.id,
              provider: p.platform,
              displayName: p.connectedAccount.displayName || p.displayName,
              username: p.connectedAccount.username,
              profileImageUrl: p.connectedAccount.profileImageUrl,
              isRealConnected: true,
              publishingStatus:
                p.connectedAccount.publishingStatus || p.publishingStatus || "Ready to publish",
              publishingAvailable: Boolean(
                p.connectedAccount.publishingAvailable ?? p.publishingAvailable ?? false
              ),
              tokenStatus:
                p.connectedAccount.tokenStatus || p.tokenStatus || "MISSING",
              capabilityNotes:
                p.connectedAccount.capabilityNotes ||
                p.platformCapability?.unsupportedMessage ||
                p.platformCapability?.notes,
            });
          }
        });

        setAccounts(liveAccs);

        // Pre-select first eligible account if none selected yet
        if (liveAccs.length > 0 && selectedAccountIds.length === 0) {
          const eligible = liveAccs.find((a) => a.publishingAvailable) || liveAccs[0];
          setSelectedAccountIds([eligible.id]);
          setPreviewPlatform(eligible.provider);
        }
      })
      .catch(() => {
        setAccounts([]);
      })
      .finally(() => {
        setIsLoadingAccounts(false);
      });
  }, [selectedAccountIds.length]);

  useEffect(() => {
    loadAccounts();

    const handleBrandChanged = () => {
      setSelectedAccountIds([]);
      loadAccounts();
    };

    window.addEventListener("pulsesocial_active_brand_changed", handleBrandChanged);
    return () => {
      window.removeEventListener("pulsesocial_active_brand_changed", handleBrandChanged);
    };
  }, [loadAccounts, activeBrand?.id]);

  // Restore draft from localStorage if available
  useEffect(() => {
    try {
      const cachedDraft = localStorage.getItem("pulsesocial_composer_draft");
      if (cachedDraft) {
        const parsed = JSON.parse(cachedDraft);
        if (parsed.content && !content) {
          setContent(parsed.content);
          if (parsed.youtubeTitle) setYoutubeTitle(parsed.youtubeTitle);
          if (parsed.isShorts) setIsShorts(parsed.isShorts);
          if (parsed.firstComment) {
            setFirstComment(parsed.firstComment);
            setShowFirstComment(true);
          }
          if (Array.isArray(parsed.media) && parsed.media.length > 0) {
            setMedia(parsed.media);
          }
          setAutosaveStatus("SAVED");
          setLastSavedTime("Draft restored from local session");
        }
      }
    } catch {}
  }, []);

  // Autosave to localStorage debounced
  useEffect(() => {
    if (!content && media.length === 0) return;

    setIsUnsavedChanges(true);
    setAutosaveStatus("SAVING");

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          "pulsesocial_composer_draft",
          JSON.stringify({
            content,
            media,
            youtubeTitle,
            isShorts,
            firstComment,
            updatedAt: new Date().toISOString(),
          })
        );
        setAutosaveStatus("SAVED");
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLastSavedTime(`Saved locally at ${timeStr}`);
      } catch {
        setAutosaveStatus("IDLE");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [content, media, youtubeTitle, isShorts, firstComment]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUnsavedChanges && (content.trim() || media.length > 0)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUnsavedChanges, content, media.length]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    };
    if (isEmojiPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isEmojiPickerOpen]);

  // Destination toggle
  const toggleAccount = (id: string, provider: string) => {
    setSelectedAccountIds((prev) => {
      const isAlreadySelected = prev.includes(id);
      if (isAlreadySelected) {
        return prev.filter((item) => item !== id);
      } else {
        setPreviewPlatform(provider);
        return [...prev, id];
      }
    });
  };

  // Select all eligible accounts
  const handleSelectAllEligible = () => {
    const eligibleIds = accounts
      .filter((a) => a.publishingAvailable && a.tokenStatus !== "EXPIRED")
      .map((a) => a.id);
    setSelectedAccountIds(eligibleIds);
  };

  const handleDeselectAll = () => {
    setSelectedAccountIds([]);
  };

  // Filter accounts by category
  const filteredAccounts = useMemo(() => {
    if (platformCategoryFilter === "all") return accounts;
    if (platformCategoryFilter === "meta") {
      return accounts.filter((a) => ["facebook", "instagram", "threads"].includes(a.provider.toLowerCase()));
    }
    if (platformCategoryFilter === "professional") {
      return accounts.filter((a) => ["linkedin", "x", "google_business"].includes(a.provider.toLowerCase()));
    }
    if (platformCategoryFilter === "video") {
      return accounts.filter((a) => ["youtube", "tiktok"].includes(a.provider.toLowerCase()));
    }
    if (platformCategoryFilter === "fediverse") {
      return accounts.filter((a) => ["mastodon", "bluesky", "telegram"].includes(a.provider.toLowerCase()));
    }
    return accounts;
  }, [accounts, platformCategoryFilter]);

  // File Upload via persistent Cloudinary storage endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    try {
      const uploadedItems: PreviewMediaItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > 60 * 1024 * 1024) {
          toast({
            title: "File Exceeds Limit",
            message: `${file.name} is larger than 60MB. Please select a smaller visual.`,
            type: "warning",
          });
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Upload failed for ${file.name}`);

        const isVideo = file.type.startsWith("video/");
        uploadedItems.push({
          id: `media-${Date.now()}-${i}`,
          url: data.url,
          type: isVideo ? "VIDEO" : "IMAGE",
          name: file.name,
          size: file.size,
          altText: "",
        });
      }

      setMedia((prev) => [...prev, ...uploadedItems]);
      toast({
        title: "Media Uploaded",
        message: `${uploadedItems.length} visual asset(s) attached successfully.`,
        type: "success",
      });
    } catch (err: unknown) {
      toast({
        title: "Upload Failed",
        message: (err as Error).message || "Could not upload file to storage.",
        type: "error",
      });
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add Direct Media URL
  const handleAddDirectUrl = () => {
    if (!directMediaUrl.trim()) return;
    const isVideo = Boolean(directMediaUrl.match(/\.(mp4|mov|webm)$/i));
    setMedia((prev) => [
      ...prev,
      {
        id: `url-${Date.now()}`,
        url: directMediaUrl.trim(),
        type: isVideo ? "VIDEO" : "IMAGE",
        name: "Remote Asset",
      },
    ]);
    setDirectMediaUrl("");
    toast({
      title: "Media URL Attached",
      message: "Creative visual added from external link.",
      type: "success",
    });
  };

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAltText = () => {
    if (editingAltIndex !== null) {
      setMedia((prev) =>
        prev.map((item, i) =>
          i === editingAltIndex ? { ...item, altText: tempAltText } : item
        )
      );
      setEditingAltIndex(null);
      setTempAltText("");
      toast({
        title: "Alt Text Saved",
        message: "Visual description updated for accessibility.",
        type: "info",
      });
    }
  };

  // Dynamic character limit computation
  const selectedAccounts = useMemo(() => {
    return accounts.filter((a) => selectedAccountIds.includes(a.id));
  }, [accounts, selectedAccountIds]);

  const previewAccount = useMemo(() => {
    return (
      selectedAccounts.find((a) => a.provider === previewPlatform) ||
      accounts.find((a) => a.provider === previewPlatform) || {
        id: `preview-${previewPlatform}`,
        provider: previewPlatform,
        displayName: activeBrand?.name || "PulseSocial Workspace",
        username: activeBrand?.slug || "pulsesocial",
        profileImageUrl: activeBrand?.avatarUrl || null,
        isRealConnected: false,
      }
    );
  }, [selectedAccounts, accounts, previewPlatform, activeBrand]);

  const activeCapability = getPlatformCapability(previewPlatform);

  // Platform limits validation
  const platformValidationList = useMemo(() => {
    return selectedAccounts.map((acc) => {
      const cap = getPlatformCapability(acc.provider);
      const isOver = content.length > cap.maxCharacterLimit;
      const requiresVideo = (acc.provider === "youtube" || acc.provider === "tiktok") && !media.some((m) => m.type === "VIDEO");
      const requiresMedia = acc.provider === "pinterest" && media.length === 0;
      const tokenExpired = acc.tokenStatus === "EXPIRED" || acc.publishingStatus === "Reauthorization required";
      const approvalRequired = !acc.publishingAvailable && acc.publishingStatus?.includes("approval required");

      let errorReason: string | null = null;
      if (tokenExpired) errorReason = "Reauthorization required";
      else if (approvalRequired) errorReason = "Developer partner review required";
      else if (isOver) errorReason = `Exceeds ${cap.maxCharacterLimit} character limit`;
      else if (requiresVideo) errorReason = "Requires video file";
      else if (requiresMedia) errorReason = "Requires image/video attachment";

      return {
        id: acc.id,
        account: acc,
        capability: cap,
        isOverLimit: isOver,
        errorReason,
        isEligible: !errorReason,
      };
    });
  }, [selectedAccounts, content.length, media]);

  // Overall strictest limit
  const strictestLimit = useMemo(() => {
    if (selectedAccounts.length === 0) return activeCapability.maxCharacterLimit;
    const limits = selectedAccounts.map((a) => getPlatformCapability(a.provider).maxCharacterLimit);
    return Math.min(...limits);
  }, [selectedAccounts, activeCapability.maxCharacterLimit]);

  const isStrictestOverLimit = content.length > strictestLimit;

  // Insert emojis & hashtags
  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const insertHashtags = (tags: string) => {
    setContent((prev) => (prev.trim() ? `${prev.trim()}\n\n${tags}` : tags));
  };

  // Core Action Execution (Save Draft / Schedule / Publish Now)
  const handleAction = async (action: "DRAFT" | "SCHEDULE" | "PUBLISH_NOW") => {
    if (!content.trim() && media.length === 0) {
      toast({
        title: "Content Required",
        message: "Please write a caption or attach creative visuals.",
        type: "warning",
      });
      return;
    }

    if (selectedAccountIds.length === 0) {
      toast({
        title: "Select Destination",
        message: "Please select at least one destination social channel.",
        type: "warning",
      });
      return;
    }

    // Pre-flight validation on Publish Now
    if (action === "PUBLISH_NOW") {
      const blockedList = platformValidationList.filter((p) => !p.isEligible);
      if (blockedList.length === selectedAccountIds.length) {
        toast({
          title: "Publishing Blocked",
          message: blockedList[0]?.errorReason || "Selected channels cannot be published to directly.",
          type: "error",
        });
        return;
      }
    }

    if (action === "SCHEDULE" && !scheduledDate) {
      setIsScheduleModalOpen(true);
      return;
    }

    if (action === "PUBLISH_NOW") setIsPublishing(true);
    if (action === "DRAFT") setIsSavingDraft(true);

    try {
      let scheduledForIso: string | undefined = undefined;
      if (action === "SCHEDULE" && scheduledDate) {
        scheduledForIso = new Date(`${scheduledDate}T${scheduledTime || "12:00"}:00Z`).toISOString();
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          targetAccountIds: selectedAccountIds,
          action,
          scheduledFor: scheduledForIso,
          mediaUrls: media.map((m) => ({ url: m.url, type: m.type, altText: m.altText })),
          firstComment: showFirstComment ? firstComment : undefined,
          location: selectedLocation ? selectedLocation.formattedAddress : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed to process on server.");

      // Clear unsaved draft state
      setIsUnsavedChanges(false);
      try {
        localStorage.removeItem("pulsesocial_composer_draft");
      } catch {}

      if (action === "DRAFT") {
        setPersistedPostId(data.post?.id || null);
        const savedTimeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLastSavedTime(`Saved to Database at ${savedTimeStr}`);
        toast({
          title: "Draft Saved",
          message: "Post draft safely saved to your workspace queue.",
          type: "success",
        });
      } else if (action === "SCHEDULE") {
        setIsScheduleModalOpen(false);
        toast({
          title: "Post Scheduled Successfully",
          message: `Post scheduled for ${scheduledDate} at ${scheduledTime} (${userTimezone}).`,
          type: "success",
        });
        router.push("/calendar");
      } else if (action === "PUBLISH_NOW") {
        // Detailed truthful results modal
        const targets = data.post?.targets || [];
        const resultItems: PublishingResultItem[] = targets.map((t: any) => ({
          provider: t.socialAccount?.provider || "Channel",
          displayName: t.socialAccount?.displayName || t.socialAccount?.provider || "Account",
          status: t.status === "PUBLISHED" ? "PUBLISHED" : "FAILED",
          platformPostId: t.platformPostId,
          errorMessage: t.errorMessage,
        }));

        const hasFailures = resultItems.some((r) => r.status === "FAILED");
        const hasSuccess = resultItems.some((r) => r.status === "PUBLISHED");

        setPublicationResults({
          isOpen: true,
          overallStatus: hasSuccess && !hasFailures ? "SUCCESS" : hasSuccess && hasFailures ? "PARTIAL" : "FAILED",
          results: resultItems,
        });
      }
    } catch (err: unknown) {
      toast({
        title: "Action Failed",
        message: (err as Error).message || "An unexpected error occurred while publishing.",
        type: "error",
      });
    } finally {
      setIsPublishing(false);
      setIsSavingDraft(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
        
        {/* ============================================================ */}
        {/* SECTION 5: MASTER PAGE HEADER & WORKSPACE ACTION TOOLBAR    */}
        {/* ============================================================ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Studio Post Composer
              </h1>
              {autosaveStatus === "SAVED" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Check className="w-2.5 h-2.5" />
                  <span>Saved</span>
                </span>
              )}
              {autosaveStatus === "SAVING" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-[#5846A8] dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Autosaving...</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create, preview, schedule, and publish content across your connected social channels.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {lastSavedTime && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden lg:inline">
                {lastSavedTime}
              </span>
            )}

            <Button
              variant="outline"
              onClick={() => handleAction("DRAFT")}
              isLoading={isSavingDraft}
              disabled={isSavingDraft || isPublishing}
              className="text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <span>Save Draft</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsScheduleModalOpen(true)}
              disabled={isPublishing || isSavingDraft}
              className="text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-[#5846A8] dark:text-[#E08738]"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              <span>Schedule</span>
            </Button>

            <Button
              onClick={() => handleAction("PUBLISH_NOW")}
              isLoading={isPublishing}
              disabled={isPublishing || isSavingDraft || isStrictestOverLimit}
              className="bg-[#5846A8] hover:bg-[#48388d] dark:bg-[#E08738] dark:hover:bg-[#d97706] text-white dark:text-[#0F0F11] rounded-xl text-xs font-bold px-5 shadow-xs shadow-purple-900/20 dark:shadow-amber-950/20 cursor-pointer disabled:opacity-50 active:scale-98 transition-all"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>Publish Now</span>
            </Button>
          </div>
        </div>

        {/* WORKSPACE TAB SWITCHER: COMPOSE CONTENT | LIVE PREVIEW TAB | SPLIT WORKSPACE */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10">
          <div
            className="flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-[#1C1C20] border border-slate-200/80 dark:border-white/10 shadow-2xs"
            role="tablist"
            aria-label="Workspace tabs"
          >
            <button
              type="button"
              role="tab"
              id="workspace-tab-editor"
              aria-selected={workspaceView === "editor"}
              onClick={() => setWorkspaceView("editor")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                workspaceView === "editor"
                  ? "bg-white dark:bg-[#282830] text-[#5846A8] dark:text-[#FBBF24] shadow-xs scale-102"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Compose Content</span>
            </button>

            <button
              type="button"
              role="tab"
              id="workspace-tab-preview"
              aria-selected={workspaceView === "preview"}
              onClick={() => setWorkspaceView("preview")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                workspaceView === "preview"
                  ? "bg-white dark:bg-[#282830] text-[#5846A8] dark:text-[#FBBF24] shadow-xs scale-102"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview Tab</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              type="button"
              role="tab"
              id="workspace-tab-split"
              aria-selected={workspaceView === "split"}
              onClick={() => setWorkspaceView("split")}
              className={`hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                workspaceView === "split"
                  ? "bg-white dark:bg-[#282830] text-[#5846A8] dark:text-[#FBBF24] shadow-xs scale-102"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Split Workspace</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
            <span>
              <strong>{content.length}</strong> chars
            </span>
            <span>•</span>
            <span>
              <strong>{media.length}</strong> visual asset(s)
            </span>
            {workspaceView !== "preview" && (
              <button
                type="button"
                onClick={() => setWorkspaceView("preview")}
                className="text-xs font-bold text-[#5846A8] dark:text-[#E08738] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open Preview Tab</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* MAIN RESPONSIVE WORKSPACE: 65% Composer | 35% Live Preview   */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ============================================================ */}
          {/* LEFT COLUMN: Destination Selector, Editor, Attachments (7)  */}
          {/* ============================================================ */}
          <div
            className={`${
              workspaceView === "preview"
                ? "hidden"
                : workspaceView === "editor"
                ? "lg:col-span-12"
                : "lg:col-span-7"
            } space-y-6`}
          >

            {/* SECTION 6: COMPACT, POLISHED DESTINATION SELECTOR */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Destination Channels
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#5846A8] border border-purple-200 dark:bg-[#E08738]/20 dark:text-[#FBBF24] dark:border-[#E08738]/40">
                    {selectedAccountIds.length} Selected
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllEligible}
                    className="text-[#5846A8] dark:text-[#E08738] font-semibold hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Clear
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(true)}
                    className="font-bold text-[#5846A8] dark:text-[#E08738] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Connect Channel
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                {[
                  { id: "all", label: "All Channels" },
                  { id: "meta", label: "Meta (IG/FB)" },
                  { id: "professional", label: "Professional" },
                  { id: "video", label: "Video & Shorts" },
                  { id: "fediverse", label: "Fediverse & Chat" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPlatformCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      platformCategoryFilter === cat.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Connected Channels List */}
              {isLoadingAccounts ? (
                <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#5846A8]" />
                  <span>Loading connected channels...</span>
                </div>
              ) : accounts.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#5846A8] dark:text-purple-300 flex items-center justify-center shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        No social accounts connected in this workspace
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Connect your Instagram, LinkedIn, X, Facebook, or YouTube account to begin broadcasting.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(true)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    + Connect Channel
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredAccounts.map((acc) => {
                    const isSelected = selectedAccountIds.includes(acc.id);
                    const isExpired = acc.tokenStatus === "EXPIRED" || acc.publishingStatus === "Reauthorization required";
                    const isApproval = !acc.publishingAvailable && acc.publishingStatus?.includes("approval required");

                    return (
                      <div
                        key={acc.id}
                        onClick={() => toggleAccount(acc.id, acc.provider)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? "bg-purple-50/80 dark:bg-[#241C14] border-purple-300 dark:border-[#E08738]/60 ring-2 ring-[#5846A8]/20 dark:ring-[#E08738]/25 shadow-xs"
                            : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                {acc.profileImageUrl ? (
                                  <img
                                    src={acc.profileImageUrl}
                                    alt={acc.displayName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  renderPlatformIcon(acc.provider, 18)
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 ring-1 ring-white dark:ring-slate-900 flex items-center justify-center">
                                {renderPlatformIcon(acc.provider, 10)}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {acc.displayName}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {acc.username ? `@${acc.username}` : acc.provider.toUpperCase()}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                              isSelected
                                ? "bg-[#5846A8] border-[#5846A8] text-white dark:bg-[#E08738] dark:border-[#E08738] dark:text-[#0F0F11]"
                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Health Status Pill */}
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px]">
                          {isExpired ? (
                            <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Reauthorization required
                            </span>
                          ) : isApproval ? (
                            <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Approval required
                            </span>
                          ) : (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Ready to publish
                            </span>
                          )}

                          {isExpired && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedConnectPlatform(acc.provider);
                                setIsConnectModalOpen(true);
                              }}
                              className="text-[9px] font-bold text-[#5846A8] dark:text-purple-400 hover:underline"
                            >
                              Reconnect
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 7: PROFESSIONAL POST CONTENT EDITOR */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Post Content
                </span>
                
                {/* Character Counter with Platform Context */}
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className={isStrictestOverLimit ? "text-rose-600 font-bold" : "text-slate-500 dark:text-slate-400"}>
                    {content.length}
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {strictestLimit}
                  </span>
                  {selectedAccounts.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({selectedAccounts[0]?.provider?.toUpperCase()})
                    </span>
                  )}
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What would you like to share across your channels? Craft your message, paste links, or generate publication-ready copy with Gemini AI..."
                  className="w-full text-sm bg-transparent border-none focus:outline-none resize-none placeholder:text-slate-400 text-slate-900 dark:text-white leading-relaxed p-1"
                />
              </div>

              {/* Content Warnings */}
              {isStrictestOverLimit && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>
                    Your message exceeds the maximum character limit ({strictestLimit}) for one or more selected destinations.
                  </span>
                </div>
              )}

              {/* Editor Formatting & Generation Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 relative" ref={emojiRef}>
                  
                  {/* Emoji Picker Popover */}
                  <button
                    type="button"
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#5846A8] hover:bg-purple-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Insert Emojis"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  {isEmojiPickerOpen && (
                    <div className="absolute left-0 bottom-10 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                        {EMOJI_CATEGORIES.map((cat, idx) => (
                          <button
                            key={cat.name}
                            type="button"
                            onClick={() => setActiveEmojiTab(idx)}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                              activeEmojiTab === idx
                                ? "bg-purple-50 text-[#5846A8] dark:bg-purple-950/60 dark:text-purple-300"
                                : "text-slate-400 hover:text-slate-700"
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1.5 max-h-44 overflow-y-auto">
                        {EMOJI_CATEGORIES[activeEmojiTab].emojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-lg cursor-pointer transition active:scale-90"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hashtag Insertion */}
                  <button
                    type="button"
                    onClick={() => insertHashtags("#PulseSocial #SocialGrowth #Marketing2026")}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#5846A8] hover:bg-purple-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Insert Hashtags"
                  >
                    <Hash className="w-4 h-4" />
                  </button>

                  {/* Location Tagging */}
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      selectedLocation
                        ? "text-[#5846A8] bg-purple-50 dark:bg-purple-950/60"
                        : "text-slate-500 hover:text-[#5846A8] hover:bg-purple-50 dark:hover:bg-slate-800"
                    }`}
                    title={selectedLocation ? `Location: ${selectedLocation.formattedAddress}` : "Add Location"}
                  >
                    <MapPin className="w-4 h-4" />
                  </button>

                  {/* First Comment Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowFirstComment(!showFirstComment)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      showFirstComment
                        ? "text-[#5846A8] bg-purple-50 dark:bg-purple-950/60"
                        : "text-slate-500 hover:text-[#5846A8] hover:bg-purple-50 dark:hover:bg-slate-800"
                    }`}
                    title="Auto First Comment"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>

                {/* Gemini AI Assistant Button */}
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#5846A8] border border-purple-200 dark:bg-[#E08738]/15 dark:hover:bg-[#E08738]/25 dark:text-[#FBBF24] dark:border-[#E08738]/40 text-xs font-bold transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#5846A8] dark:text-[#FBBF24]" />
                  <span>Create with Gemini AI</span>
                </button>
              </div>

              {/* Location Tagged Display */}
              {selectedLocation && (
                <div className="pt-2 flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#5846A8] shrink-0" />
                    <span className="truncate">{selectedLocation.formattedAddress}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLocation(null)}
                    className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Auto First Comment Drawer */}
              {showFirstComment && (
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-[#5846A8]" />
                      <span>Auto First Comment (Instagram / LinkedIn / Facebook)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowFirstComment(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Hide
                    </button>
                  </div>
                  <Input
                    placeholder="Enter hashtags, bonus links, or calls to action to publish as the first comment..."
                    value={firstComment}
                    onChange={(e) => setFirstComment(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
              )}
            </div>

            {/* SECTION 8: PRODUCTION-READY MEDIA ATTACHMENTS */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#5846A8]" />
                  <span>Media Visuals ({media.length})</span>
                </span>

                {media.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMedia([])}
                    className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove All</span>
                  </button>
                )}
              </div>

              {/* Drag and Drop Zone + URL Input */}
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime"
                  multiple
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const input = fileInputRef.current;
                      if (input) {
                        input.files = e.dataTransfer.files;
                        handleFileUpload({ target: input } as any);
                      }
                    }
                  }}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#5846A8] dark:hover:border-purple-600 bg-slate-50/50 dark:bg-slate-800/30 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#5846A8] dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isUploadingMedia ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isUploadingMedia ? "Uploading visual assets..." : "Click or drag images & videos here"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WEBP, GIF, MP4, WebM (up to 60MB via secure storage)
                    </p>
                  </div>
                </div>

                {/* Direct URL Attachment */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="url"
                      placeholder="Or paste external media URL..."
                      value={directMediaUrl}
                      onChange={(e) => setDirectMediaUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDirectUrl();
                        }
                      }}
                      className="pl-8 text-xs rounded-xl"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDirectUrl}
                    disabled={!directMediaUrl.trim()}
                    className="text-xs rounded-xl cursor-pointer"
                  >
                    Add URL
                  </Button>
                </div>
              </div>

              {/* Media Thumbnails Strip */}
              {media.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pt-2 pb-1 scrollbar-none">
                  {media.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="relative w-28 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shrink-0 group shadow-2xs"
                    >
                      {item.type?.toUpperCase() === "VIDEO" ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                          <Video className="w-7 h-7 text-purple-400" />
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.altText || "Attached visual"}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer"
                        title="Remove visual"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Type Badge */}
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/70 text-white">
                        {item.type}
                      </span>

                      {/* Alt text trigger */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAltIndex(idx);
                          setTempAltText(item.altText || "");
                        }}
                        className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/90 text-slate-800 hover:bg-[#5846A8] hover:text-white transition cursor-pointer"
                      >
                        {item.altText ? "Alt ✓" : "+ Alt"}
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#5846A8] text-slate-400 hover:text-[#5846A8] flex flex-col items-center justify-center gap-1 shrink-0 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">+ Add More</span>
                  </button>
                </div>
              )}
            </div>

            {/* YouTube Specific Settings */}
            {(previewPlatform === "youtube" ||
              selectedAccounts.some((a) => a.provider === "youtube")) && (
              <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-950/60 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  {renderPlatformIcon("youtube", 16)}
                  <span>YouTube Broadcast Configuration</span>
                </span>
                <Input
                  placeholder="Enter YouTube Video Title (Required for YouTube)..."
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  className="rounded-xl text-xs"
                />
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isShorts}
                    onChange={(e) => setIsShorts(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Format as YouTube Shorts (Vertical 9:16 Video)</span>
                </label>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Live Native Platform Preview Simulator (5)     */}
          {/* ============================================================ */}
          <div
            id="workspace-preview-column"
            className={`${
              workspaceView === "editor"
                ? "hidden"
                : workspaceView === "preview"
                ? "lg:col-span-12 block"
                : "lg:col-span-5 hidden lg:block"
            } space-y-4 lg:sticky lg:top-20`}
          >
            {/* Dynamic Native Platform Simulator with 3 Simulation Modes */}
            <PostPreview
              accounts={selectedAccounts.length > 0 ? selectedAccounts : [previewAccount]}
              activeAccountId={previewAccount.id}
              forcedPlatform={previewPlatform as any}
              onPlatformChange={(plat) => setPreviewPlatform(plat)}
              onSelectAccount={(id) => {
                const found = accounts.find((a) => a.id === id);
                if (found) setPreviewPlatform(found.provider);
              }}
              onOpenConnectModal={() => setIsConnectModalOpen(true)}
              content={content}
              media={media}
              youtubeTitle={youtubeTitle}
              isShorts={isShorts}
              firstComment={showFirstComment ? firstComment : undefined}
              location={selectedLocation ? selectedLocation.formattedAddress : undefined}
              brandName={activeBrand?.name || "PulseSocial Workspace"}
              brandAvatar={activeBrand?.avatarUrl || "/icons/pulse-logo.svg"}
              brandHandle={activeBrand?.slug ? `@${activeBrand.slug}` : "@workspace"}
              defaultDeviceMode={workspaceView === "preview" ? "desktop" : "mobile"}
            />

              {/* Truthful Platform Validation Summary Card */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-[#5846A8]" />
                  <span>Validation & Readiness Summary</span>
                </span>

                <div className="space-y-1.5 text-xs">
                  {platformValidationList.length === 0 ? (
                    <p className="text-[11px] text-slate-400">
                      Select one or more destinations to evaluate publishing readiness.
                    </p>
                  ) : (
                    platformValidationList.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-4 h-4 shrink-0">
                            {renderPlatformIcon(item.account.provider, 14)}
                          </div>
                          <span className="truncate font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                            {item.account.displayName}
                          </span>
                        </div>

                        <div>
                          {item.isEligible ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Ready
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400"
                              title={item.errorReason || "Blocked"}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{item.errorReason}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* ============================================================ */}
        {/* SCHEDULE POST MODAL                                          */}
        {/* ============================================================ */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5846A8]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Schedule Broadcast
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Timezone banner */}
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] text-[#5846A8] dark:text-purple-300 flex items-center justify-between">
                <span>Timezone: <strong>{userTimezone}</strong></span>
                <span className="opacity-75">Server synchronized</span>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Presets
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setScheduledDate(d.toISOString().split("T")[0]);
                      setScheduledTime("09:00");
                    }}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#5846A8] text-left transition cursor-pointer"
                  >
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Tomorrow Morning</p>
                    <p className="text-[10px] text-slate-400">9:00 AM</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setScheduledDate(d.toISOString().split("T")[0]);
                      setScheduledTime("17:00");
                    }}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#5846A8] text-left transition cursor-pointer"
                  >
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Tomorrow Evening</p>
                    <p className="text-[10px] text-slate-400">5:00 PM</p>
                  </button>
                </div>
              </div>

              {/* Custom Date & Time Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Date
                  </label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Time
                  </label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAction("SCHEDULE")}
                  disabled={!scheduledDate || isPublishing}
                  className="bg-[#5846A8] hover:bg-[#48388d] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Confirm Schedule
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PUBLISHING RESULTS MODAL                                     */}
        {/* ============================================================ */}
        {publicationResults.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {publicationResults.overallStatus === "SUCCESS" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : publicationResults.overallStatus === "PARTIAL" ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  )}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Publishing Execution Report
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPublicationResults((prev) => ({ ...prev, isOpen: false }))}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {publicationResults.overallStatus === "SUCCESS"
                  ? "All destination channels confirmed successful broadcast."
                  : publicationResults.overallStatus === "PARTIAL"
                  ? "Broadcast partially succeeded. Some channels reported provider restrictions."
                  : "Broadcast could not be executed across selected destinations."}
              </p>

              {/* Per-Channel Status List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {publicationResults.results.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {renderPlatformIcon(r.provider, 16)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {r.displayName}
                        </p>
                        {r.errorMessage && (
                          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 leading-snug">
                            {r.errorMessage}
                          </p>
                        )}
                        {r.platformPostId && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Post ID: {r.platformPostId}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        r.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPublicationResults((prev) => ({ ...prev, isOpen: false }));
                    router.push("/posts");
                  }}
                  className="rounded-xl text-xs cursor-pointer"
                >
                  View All Posts
                </Button>
                <Button
                  onClick={() => setPublicationResults((prev) => ({ ...prev, isOpen: false }))}
                  className="bg-[#5846A8] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ALT TEXT EDITOR MODAL                                        */}
        {/* ============================================================ */}
        {editingAltIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Visual Alt Text (Accessibility)
              </h4>
              <Input
                placeholder="Describe this visual asset for screen readers..."
                value={tempAltText}
                onChange={(e) => setTempAltText(e.target.value)}
                className="text-xs rounded-xl"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingAltIndex(null)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAltText}
                  className="bg-[#5846A8] text-white text-xs rounded-xl"
                >
                  Save Alt Text
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Real Verified Gemini AI Assistant Modal */}
        <GeminiAiModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          brandName={activeBrand?.name || "PulseSocial"}
          onApply={(data) => {
            setContent(data.caption);
            if (data.hashtags && data.hashtags.length > 0) {
              setContent((prev) => `${prev}\n\n${data.hashtags!.join(" ")}`);
            }
            toast({
              title: "AI Copy Applied",
              message: "Generated content inserted into your post composer.",
              type: "success",
            });
          }}
        />

        {/* Real Location Map Modal */}
        <RealLocationMapModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          currentLocation={selectedLocation ? selectedLocation.formattedAddress : null}
          onSelectLocation={(loc) => {
            setSelectedLocation(loc);
            setIsLocationModalOpen(false);
            if (loc) {
              toast({
                title: "Location Tagged",
                message: `Tagged: ${loc.formattedAddress}`,
                type: "success",
              });
            }
          }}
        />

        {/* Universal Social Connect Modal */}
        <UniversalSocialConnectModal
          isOpen={isConnectModalOpen}
          initialPlatformId={selectedConnectPlatform}
          onClose={() => {
            setIsConnectModalOpen(false);
            setSelectedConnectPlatform(undefined);
          }}
          onSuccess={() => {
            setIsConnectModalOpen(false);
            setSelectedConnectPlatform(undefined);
            loadAccounts();
            toast({
              title: "Account Connected",
              message: "Social channel authorized successfully.",
              type: "success",
            });
          }}
        />
      </div>
    </AppLayout>
  );
}
