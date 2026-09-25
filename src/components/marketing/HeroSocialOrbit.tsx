"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { PulseSocialLogo } from "@/components/brand/PulseSocialLogo";
import {
  FacebookIcon,
  XIcon,
  LinkedInIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
  PinterestIcon,
  ThreadsIcon,
  SnapchatIcon,
  WhatsAppIcon,
  TelegramIcon,
  BlueskyIcon,
  RedditIcon,
  MastodonIcon,
} from "@/components/icons/PlatformIcons";
import { CheckCircle2, Sparkles, ArrowUpRight } from "lucide-react";

interface OrbitItem {
  id: string;
  name: string;
  badge: string;
  color: string;
  glowColor: string;
  icon: (size: number) => React.ReactNode;
}

export function HeroSocialOrbit() {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isOrbitHovered, setIsOrbitHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  const angleRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Monitor screen width for responsive ellipse dimensions
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // 14 Real Social Media Platforms
  const platforms: OrbitItem[] = useMemo(
    () => [
      {
        id: "instagram",
        name: "Instagram",
        badge: "Reels, Stories & Grid Publish",
        color: "#E1306C",
        glowColor: "rgba(225, 48, 108, 0.5)",
        icon: (s) => <InstagramIcon size={s} className="shrink-0" />,
      },
      {
        id: "youtube",
        name: "YouTube",
        badge: "Shorts, 4K Video & Live Premieres",
        color: "#FF0000",
        glowColor: "rgba(255, 0, 0, 0.45)",
        icon: (s) => <YouTubeIcon size={s} className="shrink-0" />,
      },
      {
        id: "tiktok",
        name: "TikTok",
        badge: "Trending Audio & Auto-Scheduling",
        color: "#000000",
        glowColor: "rgba(37, 244, 238, 0.45)",
        icon: (s) => <TikTokIcon size={s} className="shrink-0" />,
      },
      {
        id: "snapchat",
        name: "Snapchat",
        badge: "Spotlight & Public Stories",
        color: "#FFFC00",
        glowColor: "rgba(255, 252, 0, 0.5)",
        icon: (s) => <SnapchatIcon size={s} className="shrink-0" />,
      },
      {
        id: "threads",
        name: "Meta Threads",
        badge: "Real-time Text & Media Threads",
        color: "#000000",
        glowColor: "rgba(168, 85, 247, 0.5)",
        icon: (s) => <ThreadsIcon size={s} className="shrink-0" />,
      },
      {
        id: "pinterest",
        name: "Pinterest",
        badge: "Rich Idea Pins & Boards",
        color: "#E60023",
        glowColor: "rgba(230, 0, 35, 0.5)",
        icon: (s) => <PinterestIcon size={s} className="shrink-0" />,
      },
      {
        id: "linkedin",
        name: "LinkedIn",
        badge: "Pages & High-Reach Articles",
        color: "#0A66C2",
        glowColor: "rgba(10, 102, 194, 0.5)",
        icon: (s) => <LinkedInIcon size={s} className="shrink-0" />,
      },
      {
        id: "facebook",
        name: "Facebook",
        badge: "Pages, Groups & Video Distribution",
        color: "#1877F2",
        glowColor: "rgba(24, 119, 242, 0.5)",
        icon: (s) => <FacebookIcon size={s} className="shrink-0" />,
      },
      {
        id: "x",
        name: "X (Twitter)",
        badge: "Automated Threads & Live Analytics",
        color: "#000000",
        glowColor: "rgba(168, 85, 247, 0.4)",
        icon: (s) => <XIcon size={s} className="shrink-0" />,
      },
      {
        id: "bluesky",
        name: "Bluesky",
        badge: "Decentralized AT Protocol",
        color: "#1185FE",
        glowColor: "rgba(17, 133, 254, 0.5)",
        icon: (s) => <BlueskyIcon size={s} className="shrink-0" />,
      },
      {
        id: "whatsapp",
        name: "WhatsApp",
        badge: "Channel Broadcasts & Updates",
        color: "#25D366",
        glowColor: "rgba(37, 211, 102, 0.5)",
        icon: (s) => <WhatsAppIcon size={s} className="shrink-0" />,
      },
      {
        id: "telegram",
        name: "Telegram",
        badge: "Channel Posts & Instant Alerts",
        color: "#24A1DE",
        glowColor: "rgba(36, 161, 222, 0.5)",
        icon: (s) => <TelegramIcon size={s} className="shrink-0" />,
      },
      {
        id: "reddit",
        name: "Reddit",
        badge: "Subreddit Marketing & Discussions",
        color: "#FF4500",
        glowColor: "rgba(255, 69, 0, 0.5)",
        icon: (s) => <RedditIcon size={s} className="shrink-0" />,
      },
      {
        id: "mastodon",
        name: "Mastodon",
        badge: "Fediverse Multi-Node Publishing",
        color: "#6364FF",
        glowColor: "rgba(99, 100, 255, 0.5)",
        icon: (s) => <MastodonIcon size={s} className="shrink-0" />,
      },
    ],
    []
  );

  // Smooth continuous rotation loop with micro-interpolation
  useEffect(() => {
    let isRunning = true;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      // Speed adjusts gracefully: pauses/slows smoothly on hover
      const baseSpeed = 0.28; // radians per second
      const targetSpeed = hoveredId ? 0.03 : isOrbitHovered ? 0.08 : baseSpeed;

      angleRef.current = (angleRef.current + targetSpeed * dt) % (Math.PI * 2);
      setRotationAngle(angleRef.current);

      if (isRunning) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [hoveredId, isOrbitHovered]);

  // Ellipse dimensions based on viewport
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const radiusX = isMobile ? 165 : isTablet ? 230 : 295;
  const radiusY = isMobile ? 85 : isTablet ? 120 : 155;
  const tiltRad = (-18 * Math.PI) / 180; // -18 deg tilt for authentic 3D perspective

  // Calculate coordinates and depth for each platform
  const nodeCount = platforms.length;
  const nodes = platforms.map((platform, idx) => {
    const phi = rotationAngle + (idx * (Math.PI * 2)) / nodeCount;

    // Parametric coordinates on tilted ellipse
    const u = radiusX * Math.cos(phi);
    const v = radiusY * Math.sin(phi);

    // Apply 3D coordinate rotation
    const x = u * Math.cos(tiltRad) - v * Math.sin(tiltRad);
    const y = u * Math.sin(tiltRad) + v * Math.cos(tiltRad);

    // Depth factor from -1 (farthest behind) to +1 (closest in front)
    const z = Math.sin(phi);

    // Visual depth mapping
    const isHovered = hoveredId === platform.id;
    const baseScale = isMobile ? 0.8 : 1.0;
    const depthScale = z > 0 ? 0.94 + 0.22 * z : 0.78 + 0.16 * (z + 1);
    const scale = (isHovered ? 1.34 : depthScale) * baseScale;
    const opacity = isHovered ? 1.0 : z > 0 ? 0.92 + 0.08 * z : 0.82 + 0.1 * (z + 1);
    const zIndex = isHovered ? 70 : Math.round(30 + 20 * z);

    // Badge size
    const badgeDiameter = isMobile ? 42 : isTablet ? 50 : 54;
    const iconSize = isMobile ? 18 : 22;

    return {
      ...platform,
      x,
      y,
      z,
      scale,
      opacity,
      zIndex,
      isHovered,
      badgeDiameter,
      iconSize,
    };
  });

  const activeHoveredNode = nodes.find((n) => n.id === hoveredId);

  return (
    <div
      className="relative w-full max-w-[720px] h-[480px] sm:h-[540px] lg:h-[580px] mx-auto flex items-center justify-center select-none overflow-visible"
      onMouseEnter={() => setIsOrbitHovered(true)}
      onMouseLeave={() => {
        setIsOrbitHovered(false);
        setHoveredId(null);
      }}
    >
      {/* ---------------------------------------------------- */}
      {/* COSMIC PURPLE AMBIENT LIGHTING GLOWS                 */}
      {/* ---------------------------------------------------- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Massive vibrant purple radial nebula */}
        <div className="absolute w-[85%] h-[80%] rounded-full bg-gradient-to-tr from-purple-600/25 via-indigo-600/20 to-pink-500/20 blur-[110px] pointer-events-none" />
        {/* Inner intense violet flare */}
        <div className="absolute w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[75px] pointer-events-none animate-pulse" />
      </div>

      {/* ---------------------------------------------------- */}
      {/* SVG 3D ORBITAL PATH GUIDES (Dashed Glowing Rings)     */}
      {/* ---------------------------------------------------- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        viewBox="-360 -290 720 580"
      >
        <defs>
          <linearGradient id="orbitPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#6366F1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="orbitInnerGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.15" />
          </linearGradient>
          <filter id="purpleGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbit Guide Path with 3D tilt */}
        <g transform={`rotate(${-18})`}>
          <ellipse
            cx="0"
            cy="0"
            rx={radiusX}
            ry={radiusY}
            fill="none"
            stroke="url(#orbitPurpleGrad)"
            strokeWidth="1.4"
            strokeDasharray="5 7"
            filter="url(#purpleGlow)"
            className="opacity-70 dark:opacity-85"
          />
          {/* Inner Secondary Concentric Ring */}
          <ellipse
            cx="0"
            cy="0"
            rx={radiusX * 0.62}
            ry={radiusY * 0.62}
            fill="none"
            stroke="url(#orbitInnerGrad)"
            strokeWidth="1"
            strokeDasharray="3 5"
            className="opacity-50 dark:opacity-65"
          />
        </g>
      </svg>

      {/* ---------------------------------------------------- */}
      {/* CENTERPIECE: PULSESOCIAL AUTHENTIC EMBLEM            */}
      {/* ---------------------------------------------------- */}
      <div
        className="relative z-30 flex flex-col items-center justify-center pointer-events-auto transition-transform duration-300 hover:scale-105"
        style={{ zIndex: 35 }}
      >
        {/* Glowing Background Radial Halo */}
        <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-purple-600/35 via-indigo-600/30 to-pink-500/25 blur-2xl pointer-events-none animate-pulse" />

        {/* Futuristic Glass Container */}
        <Link
          href="/dashboard"
          className="group relative flex items-center gap-3.5 px-6 py-4 rounded-3xl bg-white/95 dark:bg-[#0B0F1F]/90 backdrop-blur-xl border border-purple-200/90 dark:border-purple-500/30 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:border-purple-400 dark:hover:border-purple-400/60 transition-all duration-300 cursor-pointer"
          title="PulseSocial Command Center"
        >
          {/* Pulse Waves Effect */}
          <span className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />

          {/* Authentic PulseSocial Logo Monogram */}
          <div className="relative z-10 shrink-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#5846A8] p-0.5 shadow-md flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
              {/* Bevel highlight */}
              <div className="absolute inset-x-1 top-0.5 h-1/3 rounded-t-xl bg-white/20 pointer-events-none" />
              {/* PS Lettering */}
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
                <path
                  d="M18 46 L18 18 L28 18 C33.5 18 37 21.5 37 26.5 C37 31.5 33.5 35 28 35 L18 35"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M47 22 C44 18 38 18 35 21 C32 24 34.5 28 40.5 30.5 C46.5 33 48.5 36.5 46.5 41 C44.5 45.5 37.5 46.5 31.5 44"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Typography */}
          <div className="relative z-10 text-left">
            <div className="text-xl sm:text-2xl font-black tracking-tight leading-none flex items-center">
              <span className="text-slate-900 dark:text-white font-extrabold">Pulse</span>
              <span className="bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent ml-0.5 font-extrabold">
                Social
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Omnichannel Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </Link>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 14 REVOLVING SOCIAL MEDIA NODES (3D Orbit)           */}
      {/* ---------------------------------------------------- */}
      {nodes.map((node) => (
        <div
          key={node.id}
          style={{
            transform: `translate3d(${node.x.toFixed(2)}px, ${node.y.toFixed(2)}px, 0) scale(${node.scale.toFixed(3)})`,
            zIndex: node.zIndex,
            opacity: node.opacity,
            willChange: "transform, opacity",
          }}
          className="absolute flex items-center justify-center pointer-events-auto transition-opacity duration-200"
          onMouseEnter={() => setHoveredId(node.id)}
          onMouseLeave={() => setHoveredId((curr) => (curr === node.id ? null : curr))}
        >
          {/* Subtle Glow Reflection Halo behind node */}
          <div
            className="absolute rounded-full pointer-events-none blur-md transition-all duration-300"
            style={{
              width: `${node.badgeDiameter + 14}px`,
              height: `${node.badgeDiameter + 14}px`,
              backgroundColor: node.isHovered ? "rgba(168, 85, 247, 0.45)" : node.glowColor,
              boxShadow: node.isHovered
                ? "0 0 35px rgba(168, 85, 247, 0.8), 0 0 65px rgba(139, 92, 246, 0.4)"
                : "0 6px 18px rgba(0, 0, 0, 0.15)",
            }}
          />

          {/* Circular Glossy Badge Button */}
          <Link
            href="/platforms"
            aria-label={node.name}
            style={{
              width: `${node.badgeDiameter}px`,
              height: `${node.badgeDiameter}px`,
              borderColor: node.isHovered
                ? "rgba(192, 132, 252, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              boxShadow: node.isHovered
                ? "0 14px 32px rgba(168, 85, 247, 0.45), 0 0 0 2px rgba(192, 132, 252, 0.6)"
                : "0 8px 22px rgba(0, 0, 0, 0.16)",
            }}
            className="relative rounded-full bg-white dark:bg-[#0E1326] flex items-center justify-center border transition-all duration-300 cursor-pointer group overflow-hidden"
          >
            {/* Top Glossy Curved Glass Bevel Highlight */}
            <span className="absolute inset-x-2 top-1 h-2/5 rounded-t-full bg-gradient-to-b from-white/95 to-transparent pointer-events-none" />

            {/* Inner Brand Vector Glyph */}
            <div className="relative z-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              {node.icon(node.iconSize)}
            </div>
          </Link>
        </div>
      ))}

      {/* ---------------------------------------------------- */}
      {/* FLOATING HOVER TOOLTIP CARD ("hover mast do")         */}
      {/* ---------------------------------------------------- */}
      {activeHoveredNode && (
        <div
          className="absolute z-60 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{
            transform: `translate3d(${activeHoveredNode.x.toFixed(2)}px, ${(activeHoveredNode.y - (isMobile ? 55 : 68)).toFixed(2)}px, 0)`,
          }}
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-purple-400/50 shadow-xl shadow-purple-500/30 backdrop-blur-md whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{activeHoveredNode.name}</span>
                <CheckCircle2 className="w-3 h-3 text-purple-400" />
              </div>
              <div className="text-[10px] text-purple-200 font-medium leading-none mt-0.5">
                {activeHoveredNode.badge}
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-300 ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}
