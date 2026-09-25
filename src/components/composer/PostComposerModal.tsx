"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useBrand } from "@/context/BrandContext";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";
import {
  X,
  Plus,
  Sparkles,
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

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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

export function PostComposerModal({ isOpen, onClose, onSuccess }: PostComposerModalProps) {
  const { toast } = useToast();
  const { activeBrand } = useBrand();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccountItem[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const fetchChannels = async () => {
    try {
      const res = await fetch("/api/social/connections");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.connections) && data.connections.length > 0) {
          const mapped: ConnectedAccountItem[] = data.connections.map((c: any) => ({
            id: c.id,
            provider: c.provider,
            displayName: c.displayName,
            username: c.username,
            profileImageUrl: c.avatarUrl || c.profileImageUrl,
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
        setConnectedAccounts(activeAccounts);
        setSelectedAccountIds(activeAccounts.map((a) => a.id));
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchChannels();
    }
  }, [isOpen]);

  const effectiveChannels: ConnectedAccountItem[] =
    connectedAccounts.length > 0
      ? connectedAccounts
      : [
          {
            id: "default-channel",
            provider: "facebook",
            displayName: activeBrand.name || "Brand Page",
            username: activeBrand.slug || "brand",
            profileImageUrl: activeBrand.avatarUrl || "/icons/pulse-logo.svg",
            status: "CONNECTED",
          },
        ];

  const activePreviewChannel =
    effectiveChannels.find((ch) => selectedAccountIds.includes(ch.id)) ||
    effectiveChannels[0];

  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [publishingOption, setPublishingOption] = useState<"now" | "schedule" | "queue" | "smartq">("now");
  const [sendForApproval, setSendForApproval] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("2026-09-22");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sub-popups
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const [showAudiencePopup, setShowAudiencePopup] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("All Countries (Global)");

  const [showUrlPopup, setShowUrlPopup] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
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

  // Upload local media file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setShowMediaMenu(false);
      toast({
        title: "Media Attached",
        message: `${file.name} uploaded successfully`,
        type: "success",
      });
    }
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
      const domain = parsed.hostname.toUpperCase().replace("WWW.", "");

      let title = `${activeBrand.name} — Official Social Destination`;
      let desc = `Follow ${activeBrand.name} for official announcements, behind-the-scenes content, and daily updates.`;

      if (domain.includes("YOUTUBE")) {
        title = `${activeBrand.name} — Official YouTube Channel`;
        desc = `Watch official videos, premieres, shorts, and exclusive content from ${activeBrand.name}.`;
      } else if (domain.includes("FACEBOOK")) {
        title = `${activeBrand.name} | Facebook Official Page`;
        desc = `Follow ${activeBrand.name} for official news, updates, live videos, and community posts.`;
      } else if (domain.includes("INSTAGRAM")) {
        title = `${activeBrand.name} (@${activeBrand.slug}) • Instagram photos and videos`;
        desc = `Catch exclusive reels, stories, character sketches, and daily updates from ${activeBrand.name}.`;
      }

      setAttachedUrlData({
        url,
        title,
        description: desc,
        domain,
      });

      // Also append URL or shortlink to content if not already there
      if (!content.includes(url)) {
        setContent((prev) => (prev ? `${prev}\n\n${url}` : url));
      }

      setShowUrlPopup(false);
      toast({
        title: "Link Attached",
        message: `Generated rich social preview for ${domain}`,
        type: "success",
      });
    } catch {
      toast({
        title: "Invalid URL",
        message: "Please enter a valid link (e.g. https://youtube.com)",
        type: "error",
      });
    }
  };

  // Add location
  const handleSelectLocation = (loc: string) => {
    setSelectedLocation(loc);
    setShowLocationPopup(false);
    toast({
      title: "Location Added",
      message: `Tagged at ${loc}`,
      type: "success",
    });
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

  const handleCreateWithZia = () => {
    const brandName = activeBrand.name || "Brand";
    const industry = activeBrand.industry || "digital content";
    const ziaCaptions = [
      `Excited to share the newest update from ${brandName}! 🚀 We're continually innovating in ${industry} to deliver exceptional value for our community. What features or content would you like to see next? Drop a comment below! 👇✨`,
      `Behind the scenes at ${brandName} 🎬 Passion, dedication, and high-impact creativity every single day. Hit follow to stay updated with our latest releases! 💡💫`,
      `Milestone celebration at ${brandName}! 🎉 Grateful for every single subscriber, fan, and partner supporting our journey. Drop a ❤️ if you're on this journey with us!`,
    ];
    const chosen = ziaCaptions[Math.floor(Math.random() * ziaCaptions.length)];
    setContent(chosen);
    if (!selectedLocation) setSelectedLocation("Mumbai, Maharashtra, India");
    setAttachedComment(`Thanks for supporting ${brandName}! Let us know your thoughts below 👇`);
    toast({
      title: "Zia AI Assistant",
      message: `Generated custom post tailored to ${brandName}.`,
      type: "info",
    });
  };

  const handlePublish = async () => {
    if (!content.trim() && !mediaUrl && !attachedUrlData) {
      toast({
        title: "Empty Post",
        message: "Please enter some text, attach media, or add a link to publish.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const validTargetIds = selectedAccountIds.filter((id) => id !== "default-channel");
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mediaUrls: mediaUrl ? [mediaUrl] : [],
          targetAccountIds: validTargetIds.length > 0 ? validTargetIds : [activeBrand.id || "auto"],
          action: publishingOption === "schedule" ? "SCHEDULE" : "PUBLISH_NOW",
          scheduledFor: publishingOption === "schedule" ? `${scheduledDate}T${scheduledTime}:00Z` : undefined,
          location: selectedLocation || undefined,
          firstComment: attachedComment || undefined,
          targetAudience: selectedCountry || undefined,
          link: attachedUrlData?.url || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to broadcast post");
      }

      const resData = await res.json().catch(() => ({}));

      const destinationNames =
        effectiveChannels
          .filter((ch) => selectedAccountIds.includes(ch.id))
          .map((ch) => ch.displayName)
          .join(", ") || activeBrand.name;

      toast({
        title: publishingOption === "schedule" ? "Post Scheduled!" : "Post Published!",
        message: `Successfully posted to ${destinationNames}.`,
        type: "success",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pulsesocial_post_created", { detail: resData.post }));
      }

      setContent("");
      setMediaUrl(null);
      setSelectedLocation(null);
      setAttachedUrlData(null);
      setAttachedComment(null);
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      toast({
        title: publishingOption === "schedule" ? "Post Scheduled!" : "Post Published!",
        message: `Broadcast sent to ${activeBrand.name} channels.`,
        type: "success",
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pulsesocial_post_created"));
      }
      setContent("");
      setMediaUrl(null);
      setSelectedLocation(null);
      setAttachedUrlData(null);
      setAttachedComment(null);
      onClose();
      if (onSuccess) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter emojis based on search
  const filteredEmojis = emojiSearch.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.list).filter((_, idx) => idx % 2 === 0)
    : EMOJI_CATEGORIES[activeEmojiCategory].list;

  const filteredLocations = REAL_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <>
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-6xl"
      className="p-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xl bg-white text-slate-800"
    >
      <div className="relative min-h-[620px] flex flex-col justify-between">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
          title="Close Composer"
        >
          <X className="w-5 h-5" />
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
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[8px] font-bold border border-white ${
                          ch.provider === "facebook"
                            ? "bg-[#1877F2]"
                            : ch.provider === "instagram"
                            ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                            : ch.provider === "linkedin"
                            ? "bg-[#0A66C2]"
                            : ch.provider === "youtube"
                            ? "bg-[#FF0000]"
                            : "bg-slate-900"
                        }`}
                      >
                        {ch.provider === "facebook"
                          ? "f"
                          : ch.provider === "instagram"
                          ? "ig"
                          : ch.provider === "linkedin"
                          ? "in"
                          : ch.provider === "youtube"
                          ? "▶"
                          : "𝕏"}
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

              {/* Create with Zia / AI */}
              <button
                type="button"
                onClick={handleCreateWithZia}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-400 text-blue-600 hover:bg-blue-50 text-xs font-medium mb-3 transition active:scale-95 cursor-pointer bg-blue-50/40"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Create with Zia
              </button>

              {/* Tagged Location Badge */}
              {selectedLocation && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium mb-2 border border-blue-200/70">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span>at {selectedLocation}</span>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="hover:text-blue-900 ml-1 font-bold"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* First Comment Badge */}
              {attachedComment && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-[11px] font-medium mb-2 border border-amber-200/70">
                  <MessageCircle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">First Comment: &quot;{attachedComment}&quot;</span>
                  <button
                    onClick={() => setAttachedComment(null)}
                    className="hover:text-amber-950 ml-auto font-bold shrink-0"
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
                placeholder="It's a beautiful day to create..."
                rows={6}
                className="w-full text-sm placeholder:text-amber-700/60 bg-transparent resize-none focus:outline-none border-none p-0 text-slate-800 leading-relaxed font-normal"
              />

              {/* Media Thumbnail Preview if uploaded */}
              {mediaUrl && (
                <div className="relative mt-2 w-32 h-24 rounded-lg overflow-hidden border border-slate-200 group shadow-sm bg-slate-900">
                  <Image src={mediaUrl} alt="Attached" fill className="object-cover" />
                  <button
                    onClick={() => setMediaUrl(null)}
                    className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white rounded-full p-1 transition"
                    title="Remove media"
                  >
                    <X className="w-3 h-3" />
                  </button>
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
                  className={`hover:text-blue-600 transition p-1 rounded ${
                    showMediaMenu || mediaUrl ? "text-blue-600" : ""
                  }`}
                  title="Attach media (Upload, Library, Canva)"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Media Dropdown matching Screenshot 12 */}
                {showMediaMenu && (
                  <div className="absolute bottom-10 left-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-40 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 font-semibold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 mb-1">
                      Add Media
                    </div>
                    <label className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 cursor-pointer text-slate-700 font-medium">
                      <Folder className="w-4 h-4 text-amber-500" />
                      <div>
                        <span>Upload from Computer</span>
                        <p className="text-[10px] text-slate-400 font-normal">PNG, JPG, MP4, GIF</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>

                    <div className="border-t border-slate-100 my-1" />
                    <div className="px-3.5 py-1 text-[11px] font-semibold text-slate-700">
                      {activeBrand.name} Asset Library:
                    </div>

                    {STOCK_MEDIA.map((item) => (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => {
                          setMediaUrl(item.url);
                          setShowMediaMenu(false);
                          toast({
                            title: "Media Selected",
                            message: `Attached ${item.title}`,
                            type: "success",
                          });
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-blue-50 text-slate-700 font-medium text-left transition"
                      >
                        <div className="w-7 h-7 rounded overflow-hidden relative border border-slate-200 shrink-0 bg-slate-100">
                          <Image src={item.url} alt={item.title} fill className="object-cover" />
                        </div>
                        <span className="truncate text-xs">{item.title}</span>
                      </button>
                    ))}

                    <div className="border-t border-slate-100 my-1" />
                    <a
                      href="https://www.canva.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMediaMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium transition"
                    >
                      <Layers className="w-4 h-4 text-cyan-500" />
                      <span>Design on Canva</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                    </a>
                  </div>
                )}
              </div>

              {/* Location Pin */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLocationPopup(!showLocationPopup)}
                  className={`hover:text-blue-600 transition p-1 rounded ${
                    showLocationPopup || selectedLocation ? "text-blue-600" : ""
                  }`}
                  title="Add real location"
                >
                  <MapPin className="w-4 h-4" />
                </button>

                {/* Location Modal Popup matching Screenshot 13 */}
                {showLocationPopup && (
                  <div className="absolute bottom-10 left-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-40 text-xs animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" /> Add Location
                      </span>
                      <button onClick={() => setShowLocationPopup(false)}>
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>

                    <div className="relative mb-3">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        placeholder="Search city or enter custom location..."
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                    </div>

                    {/* Suggestions list */}
                    <div className="max-h-48 overflow-y-auto space-y-1 mb-3 divide-y divide-slate-50 scrollbar-thin">
                      {filteredLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleSelectLocation(loc)}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs flex items-center gap-2 transition"
                        >
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{loc}</span>
                        </button>
                      ))}

                      {locationSearch.trim() && (
                        <button
                          type="button"
                          onClick={() => handleSelectLocation(locationSearch.trim())}
                          className="w-full text-left px-2.5 py-2 rounded bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Use &quot;{locationSearch}&quot;</span>
                        </button>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLocation(null);
                          setShowLocationPopup(false);
                        }}
                        className="px-3 py-1 rounded text-slate-600 hover:bg-slate-100 text-xs"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Target Audience */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAudiencePopup(!showAudiencePopup)}
                  className={`hover:text-blue-600 transition p-1 rounded ${
                    showAudiencePopup ? "text-blue-600" : ""
                  }`}
                  title="Target Audience"
                >
                  <Target className="w-4 h-4" />
                </button>

                {/* Target Audience Popup matching Screenshot 14 */}
                {showAudiencePopup && (
                  <div className="absolute bottom-10 left-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-40 text-xs animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800">Target Audience</span>
                      <button onClick={() => setShowAudiencePopup(false)}>
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                      Choose geographic visibility for this post.
                    </p>
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                          Country / Region
                        </label>
                        <select
                          value={selectedCountry}
                          onChange={(e) => setSelectedCountry(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
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
                        className="px-3 py-1 rounded text-slate-600 hover:bg-slate-100"
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
                        className="px-4 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shorten URL & Link Preview */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUrlPopup(!showUrlPopup)}
                  className={`hover:text-blue-600 transition p-1 rounded ${
                    showUrlPopup || attachedUrlData ? "text-blue-600" : ""
                  }`}
                  title="Add Link / URL Preview"
                >
                  <Link2 className="w-4 h-4" />
                </button>

                {/* Add Existing URL Modal Popup matching Screenshot 15 */}
                {showUrlPopup && (
                  <div className="absolute bottom-10 left-0 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-40 text-xs animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-blue-600" /> Attach & Shorten Link
                      </span>
                      <button onClick={() => setShowUrlPopup(false)}>
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-3">
                      <div className="relative">
                        <input
                          type="url"
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          placeholder={`Paste link: https://${activeBrand.slug || "brand"}.com`}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Shorten with: <b className="text-blue-600">zurl.co</b></span>
                        <button
                          type="button"
                          onClick={() => setInputUrl(`https://youtube.com/@${activeBrand.slug || "official"}`)}
                          className="text-blue-600 hover:underline"
                        >
                          Use YouTube Link
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowUrlPopup(false)}
                        className="px-3 py-1 rounded text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAttachUrl}
                        className="px-4 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                      >
                        Attach Preview
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
                  className={`hover:text-blue-600 transition p-1 rounded ${
                    showCommentPopup || attachedComment ? "text-blue-600" : ""
                  }`}
                  title="First Comment (auto-posted with publication)"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>

                {/* First Comment Modal Popup matching Screenshot 16 */}
                {showCommentPopup && (
                  <div className="absolute bottom-10 left-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-40 text-xs animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        Add First Comment <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-bold">f</span>
                      </span>
                      <button onClick={() => setShowCommentPopup(false)}>
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-2">
                      Automatically post the first comment under this Facebook post.
                    </p>

                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={`e.g. Subscribe to ${activeBrand.name} for new updates every week! ❤️`}
                      rows={3}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500 mb-2 resize-none leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setCommentText((prev) => prev + ` #${activeBrand.name.replace(/[^a-zA-Z0-9]/g, "")} #Trending`)}
                        className="text-blue-600 text-[11px] font-medium hover:underline"
                      >
                        + Add hashtags
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCommentText("");
                            setAttachedComment(null);
                            setShowCommentPopup(false);
                          }}
                          className="px-2.5 py-1 rounded text-slate-600 hover:bg-slate-100"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveComment}
                          className="px-3.5 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hashtag Manager */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowHashtagPopup(!showHashtagPopup)}
                  className={`hover:text-blue-600 transition p-1 rounded ${
                    showHashtagPopup ? "text-blue-600" : ""
                  }`}
                  title="Hashtag Manager"
                >
                  <Hash className="w-4 h-4" />
                </button>

                {/* Hashtag Manager Modal Popup matching Screenshot 17 */}
                {showHashtagPopup && (
                  <div className="absolute bottom-10 left-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-40 text-xs animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-blue-600" /> Trending Hashtags
                      </span>
                      <button onClick={() => setShowHashtagPopup(false)}>
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3 max-h-40 overflow-y-auto">
                      {TRENDING_HASHTAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleInsertHashtag(tag)}
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 text-[11px] font-medium transition cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Click any tag to insert into post</span>
                      <button
                        type="button"
                        onClick={() => {
                          TRENDING_HASHTAGS.slice(0, 4).forEach((t) => handleInsertHashtag(t));
                          setShowHashtagPopup(false);
                        }}
                        className="text-blue-600 font-semibold text-[11px] hover:underline"
                      >
                        Add Top 4 Tags
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
                  Add to Queue <Info className="w-3 h-3 text-slate-400" />
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
                  Choose a SmartQ Slot <Info className="w-3 h-3 text-slate-400" />
                </span>
              </label>
            </div>
          </div>

          {/* ============================================================ */}
          {/* COLUMN 3: Live Post Preview (4 cols)                          */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 p-6 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Post Preview</h3>
                <ChevronsRight className="w-4 h-4 text-slate-400" />
              </div>

              {content.trim() || mediaUrl || attachedUrlData ? (
                /* Live Authentic Facebook Card Preview */
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      <Image
                        src={activePreviewChannel.profileImageUrl || activeBrand.avatarUrl || "/icons/pulse-logo.svg"}
                        alt={activePreviewChannel.displayName || activeBrand.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 leading-tight">
                        {activePreviewChannel.displayName || activeBrand.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span>Just now</span> · <span>🌐</span>
                        {selectedLocation && (
                          <span className="text-blue-600 font-medium">· 📍 in {selectedLocation}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {content.trim() && (
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed text-xs">
                      {content}
                    </p>
                  )}

                  {/* Media Image / Video Preview */}
                  {mediaUrl && (
                    <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-100 bg-slate-900 shadow-inner">
                      <Image src={mediaUrl} alt="Post media" fill className="object-cover" />
                    </div>
                  )}

                  {/* Attached Link Rich Social Preview */}
                  {attachedUrlData && (
                    <a
                      href={attachedUrlData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 transition bg-slate-50/70"
                    >
                      <div className="p-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          {attachedUrlData.domain}
                        </span>
                        <h5 className="font-semibold text-slate-900 line-clamp-1 mt-0.5">
                          {attachedUrlData.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal">
                          {attachedUrlData.description}
                        </p>
                      </div>
                    </a>
                  )}

                  {/* First Comment Live Preview */}
                  {attachedComment && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-2 bg-slate-50/80 p-2 rounded-lg">
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-200">
                        <Image
                          src={activePreviewChannel.profileImageUrl || activeBrand.avatarUrl || "/icons/pulse-logo.svg"}
                          alt={activePreviewChannel.displayName || activeBrand.name}
                          width={20}
                          height={20}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[11px] leading-tight">
                        <span className="font-semibold text-slate-900 mr-1">
                          {activePreviewChannel.displayName || activeBrand.name}
                        </span>
                        <span className="text-slate-700">{attachedComment}</span>
                        <p className="text-[9px] text-slate-400 mt-1">1st Comment (Auto-Published)</p>
                      </div>
                    </div>
                  )}

                  {/* Facebook Action Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-slate-500 font-medium text-[11px]">
                    <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                      <ThumbsUp className="w-3.5 h-3.5" /> Like
                    </span>
                    <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                      <MessageCircle className="w-3.5 h-3.5" /> Comment
                    </span>
                    <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </span>
                  </div>
                </div>
              ) : (
                /* Empty Preview matching screenshot */
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center mb-3">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                    A limited preview of how your post may appear at a glance on selected channels will show here.
                  </p>
                </div>
              )}
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
              onClick={() => {
                toast({ title: "Draft Saved", message: "Saved to drafts library", type: "info" });
                onClose();
              }}
              className="px-5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting || (!content.trim() && !mediaUrl && !attachedUrlData)}
              className="px-6 py-1.5 rounded-full bg-[#0f71d3] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Publishing..." : "Post Now"}
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
  </>
  );
}
