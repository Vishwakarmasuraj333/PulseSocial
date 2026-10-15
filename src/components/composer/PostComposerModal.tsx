"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";
import { CanvaConnectModal } from "@/components/composer/CanvaConnectModal";
import { renderPlatformIcon, CanvaIcon } from "@/components/icons/PlatformIcons";
import {
  X,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  MapPin,
  Target,
  Link2,
  MessageCircle,
  Hash,
  Smile,
  AlertTriangle,
  ChevronDown,
  ChevronsRight,
  Folder,
  Cloud,
  Layers,
  ThumbsUp,
  Share2,
  Check,
  Search,
  ExternalLink,
  Globe,
  Trash2,
  Copy,
  Info,
  Link as LinkIcon,
} from "lucide-react";
import { PostPreview, PreviewMediaItem } from "@/components/composer/previews/PostPreview";
import { RealLocationMapModal, LocationData } from "./RealLocationMapModal";

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialContent?: string;
  initialMediaUrl?: string;
}

// Categorized comprehensive real emoji library
const EMOJI_CATEGORIES: { name: string; icon: string; list: string[] }[] = [
  {
    name: "Smileys & Emotion",
    icon: "😀",
    list: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹", "😊", "😇",
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛",
      "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🫢", "🫣", "🤫", "🤔", "🫡", "🤐",
      "🤨", "😐", "😑", "😶", "🫥", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "🫨",
      "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶",
      "🥴", "😵", "😵‍💫", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "😟",
      "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥",
      "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡",
      "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺"
    ],
  },
  {
    name: "Animals & Nature",
    icon: "🐾",
    list: [
      "🐵", "🐒", "🦍", "🦧", "🐶", "🐕", "🦮", "🐩", "🐺", "🦊", "🦝", "🐱",
      "🐈", "🦁", "🐯", "🐅", "🐆", "🐴", "🐎", "🦄", "🦓", "🦌", "🦬", "🐮",
      "🐂", "🐃", "🐄", "🐷", "🐖", "🐗", "🐽", "🐏", "🐑", "🐐", "🐪", "🐫",
      "🦙", "🦒", "🐘", "🦣", "🦏", "🦛", "🐭", "🐁", "🐀", "🐹", "🐰", "🐇",
      "🐿️", "🦫", "🦔", "🦇", "🐻", "🐨", "🐼", "🦥", "🦦", "🦨", "🦘", "🦡",
      "🐾", "🦃", "🐔", "🐓", "🐣", "🐤", "🐥", "🐦", "🐧", "🕊️", "🦅", "🦆",
      "🦢", "🦉", "🦤", "🪶", "🦩", "🦚", "🦜", "🐸", "🐊", "🐢", "🦎", "🐍",
      "🐲", "🐉", "🦕", "🦖", "🐳", "🐋", "🐬", "🦭", "🐟", "🐠", "🐡", "🦈",
      "🐙", "🐚", "🪸", "🐌", "🦋", "🐛", "🐜", "🐝", "🪲", "🐞", "🦗", "🕷️",
      "💐", "🌸", "💮", "🪷", "🏵️", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🌱",
      "🪴", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃"
    ],
  },
  {
    name: "Food & Drink",
    icon: "🍔",
    list: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒",
      "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑",
      "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨",
      "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭",
      "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘",
      "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙",
      "🍚", "🍘", "🍥", "🍢", "🥠", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰",
      "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", "☕️", "🫖", "🍵", "🧃", "🥤",
      "🧋", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🫗", "🥤"
    ],
  },
  {
    name: "Activities & Travel",
    icon: "🚀",
    list: [
      "⚽️", "🏀", "🏈", "⚾️", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓",
      "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳️", "🪁", "🏹", "🎣", "🤿",
      "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂",
      "🏋️", "🤼", "🤸", "🤺", "🧗", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🚣",
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚",
      "🚛", "🚜", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚨", "✈️", "🛫", "🛬", "🚀",
      "🛸", "🚁", "⛵️", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "🗺️", "🗽", "🗼", "🏰"
    ],
  },
  {
    name: "Objects & Symbols",
    icon: "❤️",
    list: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕",
      "💞", "💓", "💗", "💖", "💘", "💝", "🔥", "💥", "✨", "🌟", "💫", "⭐️",
      "⚡️", "☀️", "⛅️", "🌈", "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉",
      "🎬", "🎤", "🎧", "🎼", "📱", "💻", "💡", "💰", "💎", "⏳", "⏰", "📢",
      "🔔", "✉️", "📦", "📌", "📍", "🔒", "🔑", "🛡️", "⚙️", "🔧", "🔨", "🔍",
      "📈", "📉", "📊", "📋", "📅", "🏷️", "🔖", "💯", "✔️", "✅", "❌", "⚠️"
    ],
  },
];

// Popular real cities for location autocomplete
const REAL_LOCATIONS = [
  "Mumbai, Maharashtra, India",
  "New Delhi, Delhi, India",
  "Bengaluru, Karnataka, India",
  "Hyderabad, Telangana, India",
  "Chennai, Tamil Nadu, India",
  "Kolkata, West Bengal, India",
  "Pune, Maharashtra, India",
  "Ahmedabad, Gujarat, India",
  "Jaipur, Rajasthan, India",
  "New York, NY, USA",
  "Los Angeles, CA, USA",
  "San Francisco, CA, USA",
  "London, United Kingdom",
  "Dubai, United Arab Emirates",
  "Singapore",
  "Tokyo, Japan",
  "Toronto, Ontario, Canada",
  "Sydney, NSW, Australia",
  "Paris, France",
  "Berlin, Germany",
];

// Real trending hashtags for social growth
const TRENDING_HASHTAGS = [
  "#PulseSocial",
  "#DigitalMarketing",
  "#ContentCreator",
  "#SocialMediaGrowth",
  "#BrandStrategy",
  "#Innovation",
  "#BusinessGrowth",
  "#Leadership",
  "#TechUpdates",
  "#MarketingStrategy",
  "#TrendingNow",
  "#AudienceEngagement",
];

export const HASHTAG_CATEGORIES = [
  {
    name: "🔥 Trending",
    tags: ["#PulseSocial", "#Trending", "#ViralPost", "#ExplorePage", "#CreatorEconomy", "#Innovation", "#MustWatch"],
  },
  {
    name: "🚀 Growth & Marketing",
    tags: ["#DigitalMarketing", "#GrowthHacking", "#ContentStrategy", "#SocialMediaTips", "#BrandBuilding", "#LeadGen", "#AudienceEngagement"],
  },
  {
    name: "💻 Tech & AI",
    tags: ["#ArtificialIntelligence", "#GeminiAI", "#TechNews", "#SaaS", "#WebDevelopment", "#MachineLearning", "#Automation"],
  },
  {
    name: "💼 Business & Leadership",
    tags: ["#Entrepreneurship", "#StartupLife", "#Leadership", "#BusinessStrategy", "#Productivity", "#FounderMindset", "#SmallBusiness"],
  },
];

// Stock media options for quick attachment
const STOCK_MEDIA = [
  {
    title: "Brand Campaign Hero Showcase",
    url: "/images/post_office_scene.jpg",
    type: "image",
  },
  {
    title: "Official Brand Identity Asset",
    url: "/icons/pulse-logo.svg",
    type: "image",
  },
  {
    title: "Quarterly Campaign Video Reel",
    url: "/images/office_love_thumbnail_real.jpg",
    type: "video",
  },
];

interface ConnectedAccountItem {
  id: string;
  provider: string;
  displayName: string;
  username: string | null;
  profileImageUrl: string | null;
  status: string;
}

const DEFAULT_REAL_ACCOUNTS: ConnectedAccountItem[] = [];

export function PostComposerModal({
  isOpen,
  onClose,
  onSuccess,
  initialContent,
  initialMediaUrl,
}: PostComposerModalProps) {
  const { toast } = useToast();
  const { activeBrand } = useBrand();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const desktopFileInputRef = useRef<HTMLInputElement>(null);

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccountItem[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isCanvaModalOpen, setIsCanvaModalOpen] = useState(false);
  const [isCanvaConnected, setIsCanvaConnected] = useState(false);
  
  const [showAltTextModal, setShowAltTextModal] = useState(false);
  const [altText, setAltText] = useState("");

  // Dynamic Media Library and Cloud Picker states
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaLibrarySearch, setMediaLibrarySearch] = useState("");
  const [mediaLibraryTab, setMediaLibraryTab] = useState<"all" | "brand" | "ai">("all");
  const [isCloudPickerOpen, setIsCloudPickerOpen] = useState(false);
  const [cloudPickerUrl, setCloudPickerUrl] = useState("");

  const fetchChannels = async () => {
    try {
      const [accRes, connRes] = await Promise.all([
        fetch("/api/social/accounts"),
        fetch("/api/social/connections"),
      ]);

      if (accRes.ok) {
        const data = await accRes.json();
        if (Array.isArray(data.accounts) && data.accounts.length > 0) {
          const mapped: ConnectedAccountItem[] = data.accounts.map((c: any) => ({
            id: c.id,
            provider: c.provider,
            displayName: c.displayName,
            username: c.username || c.displayName,
            profileImageUrl: c.profileImageUrl || "",
            status: c.status || "CONNECTED",
          }));
          setConnectedAccounts(mapped);
          setSelectedAccountIds(mapped.map((m) => m.id));
          return;
        }
      }

      if (connRes.ok) {
        const data = await connRes.json();
        if (Array.isArray(data.connections) && data.connections.length > 0) {
          const mapped: ConnectedAccountItem[] = data.connections.map((c: any) => ({
            id: c.id,
            provider: c.provider,
            displayName: c.displayName,
            username: c.username,
            profileImageUrl: c.avatarUrl || c.profileImageUrl || "",
            status: c.status || "CONNECTED",
          }));
          setConnectedAccounts(mapped);
          setSelectedAccountIds(mapped.map((m) => m.id));
          return;
        }
      }

      // Fallback to providers
      const provRes = await fetch("/api/social/providers");
      if (provRes.ok) {
        const data = await provRes.json();
        const activeAccounts: ConnectedAccountItem[] = [];
        (data.providers || []).forEach((p: any) => {
          if (p.isConnected && p.connectedAccount) {
            activeAccounts.push(p.connectedAccount);
          }
        });
        if (activeAccounts.length > 0) {
          setConnectedAccounts(activeAccounts);
          setSelectedAccountIds(activeAccounts.map((a) => a.id));
          return;
        }
      }

      setConnectedAccounts([]);
      setSelectedAccountIds([]);
    } catch {
      setConnectedAccounts([]);
      setSelectedAccountIds([]);
    }
  };

  const fetchCanvaStatus = async () => {
    try {
      const res = await fetch("/api/integrations/canva/status");
      if (res.ok) {
        const data = await res.json();
        setIsCanvaConnected(Boolean(data.isConnected));
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchChannels();
      fetchCanvaStatus();
      if (initialContent !== undefined) {
        setContent(initialContent);
      }
      if (initialMediaUrl !== undefined && initialMediaUrl.trim()) {
        setMedia([
          {
            id: `init-${Date.now()}`,
            url: initialMediaUrl,
            type: initialMediaUrl.match(/\.(mp4|webm|mov)$/i) ? "video" : "image",
          },
        ]);
      }
    }
  }, [isOpen, initialContent, initialMediaUrl]);

  const effectiveChannels: ConnectedAccountItem[] = connectedAccounts;

  const [content, setContent] = useState("");
  const [media, setMedia] = useState<PreviewMediaItem[]>([]);
  const [activePreviewId, setActivePreviewId] = useState<string>("sim-linkedin");

  const activePreviewChannel: ConnectedAccountItem =
    effectiveChannels.find((ch) => selectedAccountIds.includes(ch.id)) ||
    effectiveChannels[0] || {
      id: activePreviewId || "sim-linkedin",
      provider: activePreviewId ? activePreviewId.replace("sim-", "") : "linkedin",
      displayName: activeBrand.name || "PulseSocial",
      username: activeBrand.slug || "pulsesocial",
      profileImageUrl: activeBrand.avatarUrl || "/icons/pulse-logo.svg",
      status: "DISCONNECTED",
    };
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [isShorts, setIsShorts] = useState(false);
  const [publishingOption, setPublishingOption] = useState<"now" | "schedule" | "queue" | "smartq">("now");
  const [sendForApproval, setSendForApproval] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  });
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sub-popups
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocationData, setSelectedLocationData] = useState<LocationData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const [showAudiencePopup, setShowAudiencePopup] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("All Countries (Global)");

  const [showUrlPopup, setShowUrlPopup] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [showUtmOptions, setShowUtmOptions] = useState(false);
  const [utmSource, setUtmSource] = useState("pulsesocial");
  const [utmMedium, setUtmMedium] = useState("social");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [shortenUrlEnabled, setShortenUrlEnabled] = useState(true);
  const [attachedUrlData, setAttachedUrlData] = useState<{
    url: string;
    title: string;
    description: string;
    domain: string;
  } | null>(null);

  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [attachedComment, setAttachedComment] = useState<string | null>(null);

  const [showHashtagPopup, setShowHashtagPopup] = useState(false);
  const [hashtagSearch, setHashtagSearch] = useState("");
  const [activeHashtagCategory, setActiveHashtagCategory] = useState(0);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(0);
  const [emojiSearch, setEmojiSearch] = useState("");

  // Insert emoji at cursor position
  const handleInsertEmoji = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart || content.length;
      const end = textareaRef.current.selectionEnd || content.length;
      const newText = content.substring(0, start) + emoji + content.substring(end);
      setContent(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + emoji.length;
          textareaRef.current.focus();
        }
      }, 0);
    } else {
      setContent((prev) => prev + emoji);
    }
  };

  // Insert hashtag
  const handleInsertHashtag = (tag: string) => {
    setContent((prev) => (prev ? `${prev} ${tag}` : tag));
    toast({
      title: "Hashtag Added",
      message: `${tag} added to post caption.`,
      type: "info",
    });
  };

  // Upload local media file from Desktop (Multi-file & Video/Image support)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    setShowMediaMenu(false);

    const uploadedList: PreviewMediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/") || Boolean(file.name.match(/\.(mp4|webm|mov|mkv)$/i));
      const localUrl = URL.createObjectURL(file);
      const tempId = `media-${Date.now()}-${i}`;

      uploadedList.push({
        id: tempId,
        url: localUrl,
        type: isVideo ? "video" : "image",
        name: file.name,
      });

      // Background upload to server
      const formData = new FormData();
      formData.append("file", file);
      fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.url) {
            setMedia((prev) =>
              prev.map((m) => (m.id === tempId ? { ...m, url: data.url } : m))
            );
          }
        })
        .catch(() => {});
    }

    setMedia((prev) => [...prev, ...uploadedList]);
    setIsUploadingMedia(false);

    if (desktopFileInputRef.current) {
      desktopFileInputRef.current.value = "";
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };



  // Attach and shorten URL
  const handleAttachUrl = () => {
    if (!inputUrl.trim()) return;
    let url = inputUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    try {
      const parsed = new URL(url);

      // Append UTM parameters if enabled
      if (showUtmOptions) {
        if (utmSource.trim()) parsed.searchParams.set("utm_source", utmSource.trim());
        if (utmMedium.trim()) parsed.searchParams.set("utm_medium", utmMedium.trim());
        if (utmCampaign.trim()) parsed.searchParams.set("utm_campaign", utmCampaign.trim());
      }

      const finalUrl = parsed.toString();
      const domain = parsed.hostname.toUpperCase().replace("WWW.", "");

      let title = `${activeBrand.name} — Official Social Destination`;
      let desc = `Follow ${activeBrand.name} for official announcements, updates, and daily highlights.`;

      if (domain.includes("YOUTUBE")) {
        title = `${activeBrand.name} — Official YouTube Channel`;
        desc = `Watch official videos, premieres, shorts, and exclusive content from ${activeBrand.name}.`;
      } else if (domain.includes("FACEBOOK")) {
        title = `${activeBrand.name} | Facebook Official Page`;
        desc = `Follow ${activeBrand.name} for official news, updates, live videos, and community posts.`;
      } else if (domain.includes("INSTAGRAM")) {
        title = `${activeBrand.name} (@${activeBrand.slug}) • Instagram photos and videos`;
        desc = `Catch exclusive reels, stories, character sketches, and daily updates from ${activeBrand.name}.`;
      } else if (domain.includes("LINKEDIN")) {
        title = `${activeBrand.name} | Professional Network & Company Updates`;
        desc = `Connect with ${activeBrand.name} on LinkedIn for company updates, career opportunities, and thought leadership.`;
      }

      setAttachedUrlData({
        url: finalUrl,
        title,
        description: desc,
        domain: shortenUrlEnabled ? `pulse.ly/${domain.toLowerCase().slice(0, 6)}` : domain,
      });

      // Also append URL to content if not already there
      if (!content.includes(finalUrl)) {
        setContent((prev) => (prev ? `${prev}\n\n${finalUrl}` : finalUrl));
      }

      setShowUrlPopup(false);
      toast({
        title: "Link Attached",
        message: `Generated rich preview card & UTM link for ${domain}`,
        type: "success",
      });
    } catch {
      toast({
        title: "Invalid URL",
        message: "Please enter a valid link (e.g. https://example.com)",
        type: "error",
      });
    }
  };

  // Add real location
  const handleSelectLocationData = (loc: LocationData | null) => {
    setSelectedLocationData(loc);
    setSelectedLocation(loc ? loc.name : null);
    if (loc) {
      toast({
        title: "Location Tagged",
        message: `Pinned at ${loc.name} (${loc.formattedAddress})`,
        type: "success",
      });
    }
  };

  // Attach first comment
  const handleSaveComment = () => {
    if (!commentText.trim()) {
      setAttachedComment(null);
    } else {
      setAttachedComment(commentText.trim());
      toast({
        title: "First Comment Scheduled",
        message: "Will be published immediately after the post goes live.",
        type: "success",
      });
    }
    setShowCommentPopup(false);
  };

  const handleSaveDraft = async () => {
    if (!content.trim() && media.length === 0 && !attachedUrlData) {
      toast({
        title: "Empty Draft",
        message: "Please write some text or attach media before saving as draft.",
        type: "warning",
      });
      return;
    }

    const validTargetIds = selectedAccountIds.filter(
      (id) => !id.startsWith("channel-") && id !== "default-channel" && id !== "preview-channel"
    );

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mediaUrls: media.map((m) => ({ url: m.url, type: m.type === "video" ? "VIDEO" : "IMAGE" })),
          targetAccountIds: validTargetIds.length > 0 ? validTargetIds : (connectedAccounts.length > 0 ? [connectedAccounts[0].id] : []),
          action: "DRAFT",
          location: selectedLocation || undefined,
          firstComment: attachedComment || undefined,
          targetAudience: selectedCountry || undefined,
          link: attachedUrlData?.url || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save draft to database.");
      }

      const resData = await res.json();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pulsesocial_post_created", { detail: resData.post }));
      }

      toast({
        title: "Draft Saved",
        message: "Your post draft has been saved to the Drafts tab.",
        type: "success",
      });

      setContent("");
      setMedia([]);
      setSelectedLocation(null);
      setAttachedUrlData(null);
      setAttachedComment(null);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        title: "Draft Error",
        message: err?.message || "Failed to save post draft.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!content.trim() && media.length === 0 && !attachedUrlData) {
      toast({
        title: "Empty Post",
        message: "Please enter some text, attach media, or add a link to publish.",
        type: "error",
      });
      return;
    }

    // Pre-flight validation: check for blob URLs
    const hasBlobUrls = media.some((m) => m.url.startsWith("blob:"));
    if (hasBlobUrls) {
      toast({
        title: "Uploads in Progress",
        message: "Media files are still uploading or need a public URL. Please wait for upload to complete.",
        type: "warning",
      });
      return;
    }

    const validTargetIds = selectedAccountIds.filter(
      (id) => !id.startsWith("channel-") && id !== "default-channel" && id !== "preview-channel"
    );

    if (validTargetIds.length === 0 && connectedAccounts.length === 0) {
      toast({
        title: "No Account Selected",
        message: "Please connect and select at least one social account to publish to.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mediaUrls: media.map((m) => ({ url: m.url, type: m.type === "video" ? "VIDEO" : "IMAGE" })),
          targetAccountIds: validTargetIds.length > 0 ? validTargetIds : (connectedAccounts.length > 0 ? [connectedAccounts[0].id] : []),
          action:
            sendForApproval
              ? "DRAFT"
              : publishingOption === "schedule"
              ? "SCHEDULE"
              : publishingOption === "queue"
              ? "QUEUE"
              : "PUBLISH_NOW",
          scheduledFor: publishingOption === "schedule" ? `${scheduledDate}T${scheduledTime}:00Z` : undefined,
          location: selectedLocation || undefined,
          firstComment: attachedComment || undefined,
          targetAudience: selectedCountry || undefined,
          link: attachedUrlData?.url || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errorMessage = errData.error || errData.allErrors?.[0] || "Failed to publish post to social networks.";
        toast({
          title: "Publishing Error",
          message: errorMessage,
          type: "error",
        });
        return;
      }

      const resData = await res.json();
      if (!resData.post && !resData.success) {
        toast({
          title: "Publishing Rejected",
          message: resData.error || "Remote platform API rejected publication.",
          type: "error",
        });
        return;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pulsesocial_post_created", { detail: resData.post }));
      }

      const destinationNames =
        connectedAccounts
          .filter((ch) => selectedAccountIds.includes(ch.id))
          .map((ch) => `${ch.displayName} (${ch.provider})`)
          .join(", ") || (connectedAccounts[0]?.displayName ? `${connectedAccounts[0].displayName} (${connectedAccounts[0].provider})` : "your connected channels");

      toast({
        title:
          sendForApproval
            ? "Submitted for Approval"
            : publishingOption === "schedule"
            ? "Post Scheduled!"
            : publishingOption === "queue"
            ? "Added to Queue!"
            : "Post Published!",
        message: resData.partialWarning
          ? `Dispatched with notice: ${resData.partialWarning}`
          : `Successfully dispatched to ${destinationNames}.`,
        type: resData.partialWarning ? "warning" : "success",
      });

      setContent("");
      setMedia([]);
      setSelectedLocation(null);
      setAttachedUrlData(null);
      setAttachedComment(null);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      toast({
        title: "Network Error",
        message: (err as Error).message || "An unexpected error occurred while communicating with the server.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCanvaMediaSelected = (url: string, title?: string) => {
    setMedia((prev) => [
      ...prev,
      {
        id: `canva-${Date.now()}`,
        url,
        type: "image",
        name: title || "Canva Design",
      },
    ]);
    setIsCanvaConnected(true);
    toast({
      title: "Canva Design Attached",
      message: title ? `Attached "${title}" to your post.` : "Design attached successfully.",
      type: "success",
    });
  };



  // Filter emojis based on search
  const filteredEmojis = emojiSearch.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.list).filter((_, idx) => idx % 2 === 0)
    : EMOJI_CATEGORIES[activeEmojiCategory].list;


  return (
    <>
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      maxWidth="max-w-6xl"
      className="p-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xl bg-white text-slate-800"
    >
      <div className="relative min-h-[620px] flex flex-col justify-between">
        {/* Single Premium Animated Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="group absolute top-4 right-4 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
          title="Close Composer (Esc)"
          aria-label="Close composer"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-rose-500 transition-colors hidden sm:inline">
            ESC
          </span>
          <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
        </button>

        {/* 3-Column Body matching User Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 border-b border-slate-100">
          {/* ============================================================ */}
          {/* COLUMN 1: Post Editor (5 cols)                                */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between relative bg-white">
            <div>
              {/* Dropdown: New Post */}
              <div className="flex items-center gap-2 mb-4">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition">
                  New Post <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              {/* Channels Row */}
              <div className="flex items-center gap-2.5 mb-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(true)}
                  className="w-8 h-8 rounded-full border border-dashed border-blue-400 text-blue-500 hover:bg-blue-50 flex items-center justify-center transition shadow-2xs"
                  title="Add or connect another social channel"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {effectiveChannels.length === 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { key: "linkedin", name: "LinkedIn", provider: "LINKEDIN" },
                      { key: "instagram", name: "Instagram", provider: "INSTAGRAM" },
                      { key: "x", name: "X (Twitter)", provider: "TWITTER" },
                      { key: "facebook", name: "Facebook", provider: "FACEBOOK" },
                      { key: "youtube", name: "YouTube", provider: "YOUTUBE" },
                      { key: "threads", name: "Threads", provider: "THREADS" },
                    ].map((p) => {
                      const isSelected = activePreviewId === `sim-${p.key}` || (!activePreviewId && p.key === "linkedin");
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => setActivePreviewId(`sim-${p.key}`)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                            isSelected
                              ? "bg-[#5846A8] text-white border-[#5846A8] shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200"
                          }`}
                          title={`Preview on ${p.name}`}
                        >
                          {renderPlatformIcon(p.provider, 12)}
                          <span>{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {effectiveChannels.map((ch) => {
                  const isSelected = selectedAccountIds.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setSelectedAccountIds((prev) =>
                          prev.includes(ch.id)
                            ? (prev.length > 1 ? prev.filter((id) => id !== ch.id) : prev)
                            : [...prev, ch.id]
                        );
                      }}
                      className="relative group cursor-pointer focus:outline-none"
                      title={`${ch.displayName} (${ch.provider.toUpperCase()}) — Click to toggle`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full overflow-hidden border transition ${
                          isSelected
                            ? "border-blue-500 ring-2 ring-blue-500 ring-offset-1"
                            : "border-slate-200 opacity-50 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={ch.profileImageUrl || activeBrand.avatarUrl || "/icons/pulse-logo.svg"}
                          alt={ch.displayName}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 rounded-full ring-1 ring-white shadow-2xs overflow-hidden shrink-0">
                        {renderPlatformIcon(ch.provider, 14)}
                      </div>
                    </button>
                  );
                })}

                {effectiveChannels.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedAccountIds.length === effectiveChannels.length) {
                        setSelectedAccountIds([effectiveChannels[0].id]);
                      } else {
                        setSelectedAccountIds(effectiveChannels.map((c) => c.id));
                      }
                    }}
                    className={`ml-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                      selectedAccountIds.length === effectiveChannels.length
                        ? "bg-[#5846A8] text-white border-[#5846A8]"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>
                      {selectedAccountIds.length === effectiveChannels.length
                        ? `All ${effectiveChannels.length} Channels Selected`
                        : "Select All Channels"}
                    </span>
                  </button>
                )}
              </div>

              {/* Content drafting area */}

              {/* Tagged Location Badge */}
              {selectedLocation && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 text-xs font-semibold mb-2.5 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-[#5846A8] dark:text-purple-400 shrink-0" />
                  <span>📍 {selectedLocation}</span>
                  {selectedLocationData?.city && (
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">
                      · {selectedLocationData.city}, {selectedLocationData.country}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation(null);
                      setSelectedLocationData(null);
                    }}
                    className="hover:text-purple-950 dark:hover:text-white ml-1 font-bold text-sm cursor-pointer"
                    title="Remove location tag"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* First Comment Badge */}
              {attachedComment && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 text-xs font-medium mb-2.5 border border-purple-200/60 dark:border-purple-800/40 shadow-2xs">
                  <MessageCircle className="w-3.5 h-3.5 text-[#5846A8] dark:text-purple-400 shrink-0" />
                  <span className="truncate flex-1">
                    <strong className="text-[#5846A8] dark:text-purple-300">First Comment:</strong> &ldquo;{attachedComment}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachedComment(null)}
                    className="hover:text-purple-950 dark:hover:text-white ml-auto font-bold text-sm shrink-0 cursor-pointer"
                    title="Remove first comment"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post caption here... You can add emojis, links, and hashtags."
                rows={6}
                className="w-full text-sm placeholder:text-slate-400 bg-transparent resize-none focus:outline-none border-none p-0 text-slate-800 dark:text-slate-100 leading-relaxed font-normal"
              />

              {/* Media Thumbnails Strip */}
              {/* Media Thumbnails Strip matching Zoho Social Screenshot */}
              {media.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                    {media.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-300 dark:border-amber-500/80 bg-slate-950 shrink-0 group shadow-xs"
                      >
                        {item.type === "video" ? (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                            <video src={item.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[9px] bg-red-600 px-1.5 py-0.5 rounded font-bold">
                                VIDEO
                              </span>
                            </div>
                          </div>
                        ) : (
                          <Image src={item.url} alt="Attached" fill className="object-cover" unoptimized />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          className="absolute top-1 right-1 bg-black/80 hover:bg-rose-600 text-white rounded-full p-1 transition shadow cursor-pointer"
                          title="Remove media"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Empty placeholder slot to add more media */}
                    <button
                      type="button"
                      onClick={() => setShowMediaMenu(true)}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#5846A8] hover:bg-purple-50/40 flex flex-col items-center justify-center text-slate-400 hover:text-[#5846A8] transition shrink-0 cursor-pointer"
                      title="Add more photos or videos"
                    >
                      <ImageIcon className="w-5 h-5 mb-0.5 opacity-60" />
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Album location indicator from Zoho Social */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Your image goes under:</span>
                    <button
                      type="button"
                      onClick={() => {
                        toast({
                          title: "Album Location",
                          message: "Post images will be published under Timeline Photos.",
                          type: "info",
                        });
                      }}
                      className="text-[#5846A8] dark:text-purple-400 font-semibold hover:underline cursor-pointer"
                    >
                      Timeline Photos
                    </button>
                  </div>
                </div>
              )}

              {/* Attached Link Preview Box in Composer */}
              {attachedUrlData && (
                <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs relative flex items-start gap-2.5 group">
                  <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {attachedUrlData.domain}
                    </span>
                    <h5 className="font-semibold text-slate-800 truncate text-[11px]">
                      {attachedUrlData.title}
                    </h5>
                    <p className="text-[10px] text-slate-500 truncate">{attachedUrlData.url}</p>
                  </div>
                  <button
                    onClick={() => setAttachedUrlData(null)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                    title="Remove link"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Toolbar Icons matching Screenshot */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-4 text-slate-500 relative">
              {/* Media Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMediaMenu(!showMediaMenu)}
                  className={`transition p-1.5 rounded-lg cursor-pointer ${
                    media.length > 0
                      ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-400/60"
                      : showMediaMenu
                      ? "text-[#5846A8] bg-purple-50"
                      : "hover:text-[#5846A8] dark:hover:text-purple-400"
                  }`}
                  title="Attach media (Upload, Library, Canva)"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Media Dropdown matching user screenshot */}
                {showMediaMenu && (
                  <div className="absolute bottom-10 left-0 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1 z-40 text-xs animate-in fade-in zoom-in-95">
                    {/* 1. Desktop */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowMediaMenu(false);
                        desktopFileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-left transition cursor-pointer"
                    >
                      <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <div>Desktop (Image / Video)</div>
                        <div className="text-[10px] text-slate-400 font-normal">FFmpeg transcoding (Coming Soon)</div>
                      </div>
                    </button>

                    {/* 2. Media Library */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowMediaMenu(false);
                        setIsMediaLibraryOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-left transition cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Media Library</span>
                    </button>

                    {/* 3. Cloud Picker */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowMediaMenu(false);
                        setIsCloudPickerOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-left transition cursor-pointer"
                    >
                      <Cloud className="w-4 h-4 text-sky-500 shrink-0" />
                      <span>Cloud Picker</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    {/* 4. Connect to Canva */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowMediaMenu(false);
                        setIsCanvaModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-left transition cursor-pointer group"
                    >
                      <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                        <CanvaIcon size={16} />
                      </div>
                      <span className="text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition">
                        {isCanvaConnected ? "Design on Canva" : "Connect to Canva"}
                      </span>
                    </button>
                  </div>
                )}

                {/* Hidden input for Desktop native file picker */}
                <input
                  ref={desktopFileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Real Location Map Pin */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className={`hover:text-[#5846A8] dark:hover:text-purple-400 transition p-1.5 rounded-lg cursor-pointer ${
                    selectedLocation ? "text-[#5846A8] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50" : ""
                  }`}
                  title="Add Real Location & Geotag (Live OpenStreetMap)"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>

              {/* Target Audience */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAudiencePopup(!showAudiencePopup)}
                  className={`hover:text-[#5846A8] dark:hover:text-purple-400 transition p-1.5 rounded-lg cursor-pointer ${
                    showAudiencePopup ? "text-[#5846A8] dark:text-purple-400" : ""
                  }`}
                  title="Target Audience"
                >
                  <Target className="w-4 h-4" />
                </button>

                {/* Target Audience Popup */}
                {showAudiencePopup && (
                  <div className="absolute bottom-11 left-0 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-40 text-xs animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 dark:text-white">Target Audience</span>
                      <button onClick={() => setShowAudiencePopup(false)}>
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                      Choose geographic visibility for this post.
                    </p>
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                          Country / Region
                        </label>
                        <select
                          value={selectedCountry}
                          onChange={(e) => setSelectedCountry(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-purple-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                        >
                          <option value="All Countries (Global)">All Countries (Global)</option>
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAudiencePopup(false)}
                        className="px-3 py-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAudiencePopup(false);
                          toast({
                            title: "Audience Target Set",
                            message: `Post restricted to ${selectedCountry}`,
                            type: "info",
                          });
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white font-bold cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shorten URL & Link Preview with UTM Campaign Builder */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUrlPopup(!showUrlPopup)}
                  className={`hover:text-[#5846A8] dark:hover:text-purple-400 transition p-1.5 rounded-lg cursor-pointer ${
                    showUrlPopup || attachedUrlData ? "text-[#5846A8] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50" : ""
                  }`}
                  title="Attach Link & UTM Shortener"
                >
                  <Link2 className="w-4 h-4" />
                </button>

                {showUrlPopup && (
                  <div className="absolute bottom-11 left-0 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-40 text-xs animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <LinkIcon className="w-4 h-4 text-[#5846A8] dark:text-purple-400" />
                        <span>Attach &amp; Shorten Link</span>
                      </span>
                      <button onClick={() => setShowUrlPopup(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                          Destination URL
                        </label>
                        <input
                          type="url"
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          placeholder="https://yourwebsite.com/summer-sale"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-white"
                          autoFocus
                        />
                      </div>

                      {/* Shortener toggle */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                        <span className="text-[11px] font-semibold text-purple-900 dark:text-purple-200">
                          Shorten URL with <strong className="text-[#5846A8] dark:text-purple-400">pulse.ly</strong>
                        </span>
                        <input
                          type="checkbox"
                          checked={shortenUrlEnabled}
                          onChange={(e) => setShortenUrlEnabled(e.target.checked)}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </div>

                      {/* UTM Parameters Toggle */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowUtmOptions(!showUtmOptions)}
                          className="text-[11px] font-bold text-[#5846A8] dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{showUtmOptions ? "▼ Hide UTM Tracking" : "▶ Add UTM Tracking (Google Analytics)"}</span>
                        </button>

                        {showUtmOptions && (
                          <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                            <div>
                              <span className="text-[10px] text-slate-400 font-mono block">utm_source</span>
                              <input
                                type="text"
                                value={utmSource}
                                onChange={(e) => setUtmSource(e.target.value)}
                                placeholder="pulsesocial"
                                className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-mono block">utm_medium</span>
                              <input
                                type="text"
                                value={utmMedium}
                                onChange={(e) => setUtmMedium(e.target.value)}
                                placeholder="social"
                                className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-mono block">utm_campaign</span>
                              <input
                                type="text"
                                value={utmCampaign}
                                onChange={(e) => setUtmCampaign(e.target.value)}
                                placeholder="brand_launch"
                                className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowUrlPopup(false)}
                        className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAttachUrl}
                        className="px-4 py-1.5 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white font-bold text-xs shadow-sm cursor-pointer"
                      >
                        Attach Link Preview
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* First Comment */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCommentPopup(!showCommentPopup)}
                  className={`hover:text-[#5846A8] dark:hover:text-purple-400 transition p-1.5 rounded-lg cursor-pointer ${
                    showCommentPopup || attachedComment ? "text-[#5846A8] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50" : ""
                  }`}
                  title="Auto First Comment (Publish with post)"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>

                {showCommentPopup && (
                  <div className="absolute bottom-11 left-0 w-88 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-40 text-xs animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-[#5846A8] dark:text-purple-400" />
                        <span>Auto First Comment</span>
                      </span>
                      <button onClick={() => setShowCommentPopup(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 leading-snug">
                      Boost post reach by placing links, calls-to-action, or extra hashtags in the first comment.
                    </p>

                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={`e.g. Check out our latest products at link in bio! #${activeBrand.name.replace(/[^a-zA-Z0-9]/g, "")} #Trending`}
                      rows={4}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-white mb-2 resize-none leading-relaxed"
                    />

                    {/* Quick chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <button
                        type="button"
                        onClick={() => setCommentText((prev) => `${prev ? prev + " " : ""}#${activeBrand.name.replace(/\s+/g, "")} #Trending #PulseSocial`)}
                        className="px-2 py-0.5 rounded-full bg-purple-50 hover:bg-purple-100 text-[#5846A8] text-[10px] font-semibold border border-purple-200 cursor-pointer"
                      >
                        + Add Hashtags
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommentText((prev) => `${prev ? prev + " " : ""}🔗 Link in bio: https://${activeBrand.slug || "brand"}.com`)}
                        className="px-2 py-0.5 rounded-full bg-purple-50 hover:bg-purple-100 text-[#5846A8] text-[10px] font-semibold border border-purple-200 cursor-pointer"
                      >
                        + Link in Bio
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommentText((prev) => `${prev ? prev + " " : ""}💬 Drop your thoughts below!`)}
                        className="px-2 py-0.5 rounded-full bg-purple-50 hover:bg-purple-100 text-[#5846A8] text-[10px] font-semibold border border-purple-200 cursor-pointer"
                      >
                        + Ask Question
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {commentText.length} / 2200 chars
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCommentText("");
                            setAttachedComment(null);
                            setShowCommentPopup(false);
                          }}
                          className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveComment}
                          className="px-4 py-1.5 rounded-xl bg-[#5846A8] hover:bg-[#48388d] text-white font-bold text-xs shadow-sm cursor-pointer"
                        >
                          Save Comment
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hashtag Studio */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowHashtagPopup(!showHashtagPopup)}
                  className={`hover:text-[#5846A8] dark:hover:text-purple-400 transition p-1.5 rounded-lg cursor-pointer ${
                    showHashtagPopup ? "text-[#5846A8] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50" : ""
                  }`}
                  title="Hashtags Studio & Library"
                >
                  <Hash className="w-4 h-4" />
                </button>

                {showHashtagPopup && (
                  <div className="absolute bottom-11 left-0 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-40 text-xs animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-[#5846A8] dark:text-purple-400" />
                        <span>Hashtag Studio &amp; Library</span>
                      </span>
                      <button onClick={() => setShowHashtagPopup(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Search & Custom Add */}
                    <div className="relative mb-2.5">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={hashtagSearch}
                        onChange={(e) => setHashtagSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && hashtagSearch.trim()) {
                            e.preventDefault();
                            const clean = hashtagSearch.startsWith("#") ? hashtagSearch.trim() : `#${hashtagSearch.trim()}`;
                            handleInsertHashtag(clean);
                            setHashtagSearch("");
                          }
                        }}
                        placeholder="Search or type custom tag and hit Enter..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Category tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2 scrollbar-none">
                      {HASHTAG_CATEGORIES.map((cat, idx) => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setActiveHashtagCategory(idx)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                            activeHashtagCategory === idx
                              ? "bg-[#5846A8] text-white shadow-2xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Hashtag chips */}
                    <div className="flex flex-wrap gap-1.5 mb-3 max-h-40 overflow-y-auto pr-1">
                      {HASHTAG_CATEGORIES[activeHashtagCategory].tags
                        .filter((t) => !hashtagSearch || t.toLowerCase().includes(hashtagSearch.toLowerCase()))
                        .map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleInsertHashtag(tag)}
                            className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 hover:text-[#5846A8] dark:hover:bg-purple-950/60 dark:hover:text-purple-300 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                    </div>

                    {/* Bottom action row */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Click any tag to append to caption</span>
                      <button
                        type="button"
                        onClick={() => {
                          const topTags = HASHTAG_CATEGORIES[activeHashtagCategory].tags.slice(0, 4);
                          topTags.forEach((t) => handleInsertHashtag(t));
                          setShowHashtagPopup(false);
                        }}
                        className="text-[#5846A8] dark:text-purple-400 font-bold text-[11px] hover:underline cursor-pointer"
                      >
                        + Add All {HASHTAG_CATEGORIES[activeHashtagCategory].tags.length} in Category
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Emoji Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`hover:text-blue-600 transition p-1 rounded ${
                    showEmojiPicker ? "text-blue-600" : ""
                  }`}
                  title="Emoji Picker"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Comprehensive Real Categorized Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-10 left-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
                    {/* Header with Search */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={emojiSearch}
                          onChange={(e) => setEmojiSearch(e.target.value)}
                          placeholder="Search emoji..."
                          className="w-full pl-8 pr-2 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Category Tabs */}
                    {!emojiSearch.trim() && (
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2 px-1">
                        {EMOJI_CATEGORIES.map((cat, idx) => (
                          <button
                            key={cat.name}
                            type="button"
                            onClick={() => setActiveEmojiCategory(idx)}
                            className={`p-1.5 rounded-lg text-sm transition ${
                              activeEmojiCategory === idx
                                ? "bg-blue-50 ring-1 ring-blue-400 scale-110"
                                : "hover:bg-slate-100 opacity-70"
                            }`}
                            title={cat.name}
                          >
                            {cat.icon}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Emojis Grid */}
                    <div className="h-44 overflow-y-auto grid grid-cols-7 gap-1 p-1 scrollbar-thin">
                      {filteredEmojis.map((emoji, idx) => (
                        <button
                          key={`${emoji}-${idx}`}
                          type="button"
                          onClick={() => handleInsertEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 rounded-md transition active:scale-125"
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 px-1">
                      <span>Click to insert at cursor</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleInsertEmoji("✨🚀💡📈");
                          setShowEmojiPicker(false);
                        }}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        + Trend Pack
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ALT Text Accessibility Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAltTextModal(!showAltTextModal)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold border transition cursor-pointer ${
                    altText.trim()
                      ? "text-[#5846A8] border-[#5846A8] bg-purple-50 dark:bg-purple-950/40"
                      : "text-slate-500 hover:text-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                  title="Add Alt Text for accessibility"
                >
                  ALT
                </button>

                {showAltTextModal && (
                  <div className="absolute bottom-10 left-0 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 dark:text-white">Image Alt Text</span>
                      <button onClick={() => setShowAltTextModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Describe the image content for screen readers..."
                      rows={3}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none mb-2"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAltText("");
                          setShowAltTextModal(false);
                        }}
                        className="px-2.5 py-1 text-slate-500 text-xs cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAltTextModal(false);
                          toast({
                            title: "Alt Text Saved",
                            message: "Accessibility alt text attached to media.",
                            type: "success",
                          });
                        }}
                        className="px-3 py-1 bg-[#5846A8] hover:bg-[#48388d] text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* COLUMN 2: Publishing Options (3 cols)                          */}
          {/* ============================================================ */}
          <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 bg-white">
            <h3 className="text-sm font-semibold text-slate-800 mb-6 tracking-tight">
              Publishing Options
            </h3>

            {/* Send for approval toggle */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-slate-700 font-medium flex items-center gap-1">
                Send for approval <Info className="w-3 h-3 text-slate-400" />
              </span>
              <button
                type="button"
                onClick={() => setSendForApproval(!sendForApproval)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  sendForApproval ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                    sendForApproval ? "left-4" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Publishing options radio list */}
            <div className="space-y-4 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="publishing_opt"
                  checked={publishingOption === "now"}
                  onChange={() => setPublishingOption("now")}
                  className="accent-blue-600 w-4 h-4"
                />
                <span>Publish Now</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="publishing_opt"
                  checked={publishingOption === "schedule"}
                  onChange={() => setPublishingOption("schedule")}
                  className="accent-blue-600 w-4 h-4"
                />
                <span>Schedule for a Specific Date</span>
              </label>

              {publishingOption === "schedule" && (
                <div className="pl-6 space-y-2 pt-1">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-slate-200"
                  />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-slate-200"
                  />
                </div>
              )}

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="publishing_opt"
                  checked={publishingOption === "queue"}
                  onChange={() => setPublishingOption("queue")}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  Add to Queue (your queue slot) <Info className="w-3 h-3 text-slate-400" />
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="publishing_opt"
                  checked={publishingOption === "smartq"}
                  onChange={() => setPublishingOption("smartq")}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  Choose a Slot (next available queue slot) <Info className="w-3 h-3 text-slate-400" />
                </span>
              </label>
              {publishingOption === "smartq" && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
                  Assigns next user-defined weekly slot. Recommended peak times require historical analytics data from connected channels.
                </p>
              )}
            </div>

            {/* Platform-Specific Publishing Options if YouTube is selected */}
            {effectiveChannels.some(
              (c) => selectedAccountIds.includes(c.id) && c.provider.toLowerCase().includes("youtube")
            ) && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  YouTube Settings
                </h4>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={youtubeTitle}
                    onChange={(e) => setYoutubeTitle(e.target.value)}
                    placeholder="Enter YouTube video title..."
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isShorts}
                    onChange={(e) => setIsShorts(e.target.checked)}
                    className="rounded accent-red-600"
                  />
                  <span>Publish as YouTube Shorts (9:16)</span>
                </label>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* COLUMN 3: Live Platform Post Preview (4 cols)                 */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 p-6 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between overflow-y-auto max-h-[75vh]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight">Post Preview</h3>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                    LIVE
                  </span>
                </div>
                <ChevronsRight className="w-4 h-4 text-slate-400" />
              </div>

              <PostPreview
                accounts={effectiveChannels.filter((c) => selectedAccountIds.includes(c.id))}
                activeAccountId={activePreviewId}
                onSelectAccount={(id) => setActivePreviewId(id)}
                onOpenConnectModal={() => setIsConnectModalOpen(true)}
                content={content}
                media={media}
                location={selectedLocation}
                linkData={attachedUrlData}
                firstComment={attachedComment}
                youtubeTitle={youtubeTitle}
                isShorts={isShorts}
                brandName={activeBrand.name || "Pulse Media Global"}
                brandAvatar={activeBrand.avatarUrl || "/icons/pulse-logo.svg"}
                brandHandle={activeBrand.slug || "pulsemedia"}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white flex items-center justify-between border-t border-slate-100">
          <div className="text-[11px] text-slate-400 font-medium">
            {content.length > 0 && <span>{content.length} characters</span>}
          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting || (!content.trim() && media.length === 0 && !attachedUrlData)}
              className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-40"
            >
              {isSubmitting ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={
                isSubmitting ||
                (!content.trim() && media.length === 0 && !attachedUrlData) ||
                selectedAccountIds.length === 0
              }
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting
                ? "Processing..."
                : sendForApproval
                ? "Send for Approval"
                : publishingOption === "schedule"
                ? "Schedule Post"
                : publishingOption === "queue"
                ? "Add to Queue"
                : publishingOption === "smartq"
                ? "Schedule in SmartQ"
                : "Post Now"}
            </button>
          </div>
        </div>
      </div>
    </Dialog>

    {isConnectModalOpen && (
      <UniversalSocialConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={() => {
          fetchChannels();
          setIsConnectModalOpen(false);
        }}
      />
    )}

    {isCanvaModalOpen && (
      <CanvaConnectModal
        isOpen={isCanvaModalOpen}
        onClose={() => setIsCanvaModalOpen(false)}
        onSelectMedia={handleCanvaMediaSelected}
      />
    )}

    {/* Media Library Modal */}
    {isMediaLibraryOpen && (
      <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-bold">Media Library</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsMediaLibraryOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Tabs */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={mediaLibrarySearch}
                onChange={(e) => setMediaLibrarySearch(e.target.value)}
                placeholder="Search brand media assets..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-1 text-xs">
              {(["all", "brand", "ai"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMediaLibraryTab(tab)}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer capitalize ${
                    mediaLibraryTab === tab
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {tab === "all" ? "All Assets" : tab === "brand" ? "Brand Assets" : "AI Generated"}
                </button>
              ))}
            </div>
          </div>

          {/* Media Grid */}
          <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
            {[
              ...STOCK_MEDIA,
              { title: "Brand Multi-Channel Hero", url: "/images/auth_illustration.png", type: "image" },
              { title: "Suraj Vishwakarma Profile", url: "/images/founder.jpg", type: "image" },
            ]
              .filter((m) =>
                !mediaLibrarySearch
                  ? true
                  : m.title.toLowerCase().includes(mediaLibrarySearch.toLowerCase())
              )
              .map((item, idx) => (
                <div
                  key={`${item.url}-${idx}`}
                  onClick={() => {
                    setMedia((prev) => [
                      ...prev,
                      {
                        id: `lib-${Date.now()}-${idx}`,
                        url: item.url,
                        type: item.type === "video" ? "video" : "image",
                        name: item.title,
                      },
                    ]);
                    setIsMediaLibraryOpen(false);
                    toast({
                      title: "Media Selected",
                      message: `Attached ${item.title} to post.`,
                      type: "success",
                    });
                  }}
                  className="group relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md transition aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2.5">
                    <span className="text-[11px] font-semibold text-white truncate">{item.title}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    )}

    {/* Cloud Picker Modal */}
    {isCloudPickerOpen && (
      <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-sky-500" />
              <h3 className="text-sm font-bold">Cloud Media Picker</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsCloudPickerOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter a public media link from Google Drive, Unsplash, Dropbox, or any CDN URL to import into your post.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Public Cloud Media URL
            </label>
            <input
              type="url"
              value={cloudPickerUrl}
              onChange={(e) => setCloudPickerUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or cloud media link"
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {cloudPickerUrl.trim() && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden aspect-video bg-slate-100 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cloudPickerUrl}
                alt="Cloud preview"
                className="w-full h-full object-cover"
                onError={() => {}}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCloudPickerOpen(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!cloudPickerUrl.trim()}
              onClick={() => {
                if (cloudPickerUrl.trim()) {
                  const url = cloudPickerUrl.trim();
                  setMedia((prev) => [
                    ...prev,
                    {
                      id: `cloud-${Date.now()}`,
                      url,
                      type: url.match(/\.(mp4|webm|mov)$/i) ? "video" : "image",
                      name: "Cloud Asset",
                    },
                  ]);
                  setIsCloudPickerOpen(false);
                  toast({
                    title: "Cloud Media Attached",
                    message: "Imported cloud asset into your post.",
                    type: "success",
                  });
                }
              }}
              className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              Import to Post
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Real Location Map Modal */}
    <RealLocationMapModal
      isOpen={isLocationModalOpen}
      onClose={() => setIsLocationModalOpen(false)}
      currentLocation={selectedLocation}
      onSelectLocation={handleSelectLocationData}
    />

  </>
  );
}
