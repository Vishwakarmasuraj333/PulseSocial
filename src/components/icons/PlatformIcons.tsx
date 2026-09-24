import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

// 1. Facebook: Official blue circle with crisp white 'f'
export function FacebookIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M13.4 18.5V12.7h1.95l.29-2.27H13.4V8.98c0-.66.18-1.11 1.13-1.11h1.2V5.84c-.21-.03-.92-.09-1.75-.09-1.73 0-2.92 1.06-2.92 3v1.68H9.1v2.27h1.96v5.8h2.34z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 2. X (Twitter): Black circle with crisp white X
export function XIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#000000" />
      <path
        d="M15.5 6.5h1.9l-4.15 4.74L18.15 17.5h-3.82l-2.99-3.91-3.43 3.91H5.99l4.44-5.07L5.85 6.5h3.92l2.71 3.58L15.5 6.5zm-.67 9.86h1.05L9.23 7.57H8.1l6.73 8.79z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 3. LinkedIn: White circular background with official blue 'in'
export function LinkedInIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="11.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <path
        d="M8.2 16.5H6.2V9.8h2V16.5zM7.2 8.9c-.64 0-1.16-.52-1.16-1.16S6.56 6.58 7.2 6.58s1.16.52 1.16 1.16-.52 1.16-1.16 1.16zm9.8 7.6h-2v-3.3c0-.85-.02-1.95-1.19-1.95-1.19 0-1.37.93-1.37 1.89v3.36h-2V9.8h1.92v.91h.03c.27-.51.93-1.05 1.91-1.05 2.05 0 2.43 1.35 2.43 3.1v3.74h.27z"
        fill="#0A66C2"
      />
    </svg>
  );
}

// 4. Instagram: Vibrant multi-color gradient circle with white camera glyph
export function InstagramIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <radialGradient id="ig-grad-radial" cx="30%" cy="105%" r="130%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#ig-grad-radial)" />
      <rect x="6.5" y="6.5" width="11" height="11" rx="3.2" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
      <circle cx="12" cy="12" r="2.8" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
      <circle cx="15.2" cy="8.8" r="0.8" fill="#FFFFFF" />
    </svg>
  );
}

// 5. Google Business Profile: Official Google 4-color 'G' mark
export function GoogleIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" className={className}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

// 6. YouTube: Official red circle with crisp white play button
export function YouTubeIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#FF0000" />
      <path d="M10.2 8.5L15.4 12l-5.2 3.5V8.5z" fill="#FFFFFF" />
    </svg>
  );
}

// 7. Pinterest: Authentic official Pinterest script 'P' inside red circle
export function PinterestIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#E60023" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 4.5c-4.14 0-7.5 3.36-7.5 7.5 0 3.17 1.97 5.88 4.77 6.97-.07-.59-.13-1.49.03-2.14l.95-4.04s-.24-.49-.24-1.21c0-1.13.66-1.98 1.48-1.98.7 0 1.04.52 1.04 1.15 0 .7-.45 1.76-.68 2.73-.19.82.41 1.48 1.22 1.48 1.46 0 2.59-1.54 2.59-3.76 0-1.97-1.41-3.34-3.43-3.34-2.34 0-3.71 1.75-3.71 3.56 0 .71.27 1.46.61 1.88.07.08.08.16.06.24l-.23.95c-.04.15-.13.18-.3.11-1.1-.51-1.78-2.1-1.78-3.38 0-2.75 2-5.28 5.77-5.28 3.03 0 5.38 2.16 5.38 5.04 0 3.01-1.9 5.43-4.53 5.43-.89 0-1.72-.46-2-.99l-.55 2.08c-.2.76-.73 1.71-1.09 2.3.83.26 1.71.4 2.63.4 4.14 0 7.5-3.36 7.5-7.5s-3.36-7.5-7.5-7.5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 8. Threads: Violet-blue circle with white Threads '@' logo
export function ThreadsIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#5E56E7" />
      <path
        d="M15.4 11.2c-.15-2.2-1.63-3.2-3.4-3.2-2.12 0-3.6 1.42-3.6 3.8 0 2.38 1.48 3.8 3.6 3.8 1.5 0 2.53-.74 3-1.73l-1.15-.65c-.32.65-.96 1.05-1.85 1.05-1.4 0-2.25-.97-2.32-2.45h5.5c.15-.2.22-.4.22-.62zm-4.13-1.08c.95 0 1.62.48 1.8 1.4h-3.6c.18-.92.85-1.4 1.8-1.4z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 9. TikTok: Official black circle with white music note & cyan/red accents
export function TikTokIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#000000" />
      <path
        d="M14.6 6.8c.45.62 1.13 1.05 1.9 1.16v1.94c-.75-.02-1.46-.22-2.1-.58v4.98c0 2.1-1.65 3.7-3.7 3.7-1.85 0-3.4-1.35-3.65-3.15-.05-.3-.05-.6 0-.9.28-1.7 1.75-2.95 3.45-2.95.35 0 .7.05 1.03.18v2.05c-.3-.16-.65-.25-1.03-.25-.95 0-1.72.78-1.72 1.73 0 .95.77 1.72 1.72 1.72.92 0 1.68-.73 1.72-1.65V6.8h2.38z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 10. Telegram: Sky-blue circle with crisp white paper airplane
export function TelegramIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#24A1DE" />
      <path
        d="M16.9 7.4L6.4 11.4c-.72.29-.71.69-.13.87l2.7 1.06 1.02 3.12c.13.37.24.49.52.49.33 0 .47-.15.65-.33l1.56-1.51 3.25 2.4c.6.33 1.03.16 1.18-.55l2.13-10c.22-.88-.33-1.28-.88-.95zm-6.6 6.7l-.37 2.35-.45-2.85 5.56-5.02c.24-.22-.05-.33-.37-.12l-4.37 5.64z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 11. WhatsApp: Emerald-green circle with white telephone in chat bubble
export function WhatsAppIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M12 5.5c-3.58 0-6.5 2.92-6.5 6.5 0 1.14.3 2.22.82 3.15l-.87 3.18 3.26-.85c.9.49 1.93.77 3.09.77 3.58 0 6.5-2.92 6.5-6.5s-2.92-6.5-6.5-6.5zm3.78 9.24c-.16.44-.91.85-1.28.9-.35.05-.8.08-2.32-.55-1.95-.81-3.2-2.8-3.3-2.93-.1-.13-.78-1.04-.78-1.98 0-.95.49-1.41.67-1.6.17-.19.37-.24.5-.24.12 0 .25 0 .36.01.12.01.27-.05.43.32.16.39.55 1.34.6 1.44.05.1.08.22.02.35-.06.13-.1.22-.19.33-.1.11-.2.25-.29.34-.1.1-.21.21-.09.41.12.2.53.88 1.15 1.43.79.7 1.45.92 1.66 1.02.21.1.33.09.45-.05.13-.15.54-.63.69-.85.15-.21.29-.18.49-.1.2.08 1.28.6 1.5.71.22.11.36.16.42.26.05.1.05.58-.11 1.02z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 12. Bluesky: Sky-blue circle with white butterfly logo
export function BlueskyIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#1185FE" />
      <path
        d="M12 11.2c-.8-1.6-2.3-3.2-4.3-3.8-1.5-.4-2.6.4-2.3 2 .5 2.8 2.1 3.7 3.9 3.6 0 0-2.8.5-3.1 2.4-.4 1.9 1.3 2.5 3 1.8 1.9-.8 2.9-2.7 2.9-2.7s.9 1.9 2.9 2.7c1.6.7 3.3.1 3-1.8-.4-1.9-3.1-2.4-3.1-2.4 1.8.1 3.4-.8 3.9-3.6.3-1.7-.8-2.5-2.3-2-2 .6-3.5 2.2-4.3 3.8z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 13. Snapchat: Vibrant yellow circle with white ghost glyph & black border
export function SnapchatIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#FFFC00" />
      <path
        d="M12 5.5c-2.4 0-3.8 1.8-3.8 3.8 0 .7.17 1.5.51 2-.34.17-.76.34-1.02.6-.25.25-.17.51 0 .6.51.25 1.19.08 1.7.68.42.42.25 1.1.08 1.53-.34.76-1.27 1.02-1.7 1.19-.25.08-.34.34-.17.51.34.25 1.27.34 2.03.25.34 0 .76.17 1.1.51.68.68 1.19.17 2.12.17.93 0 1.44.51 2.12-.17.34-.34.76-.51 1.1-.51.76.08 1.7 0 2.03-.25.17-.17.08-.42-.17-.51-.42-.17-1.36-.42-1.7-1.19-.17-.42-.34-1.1.08-1.53.51-.6 1.19-.42 1.7-.68.17-.08.25-.34 0-.6-.25-.25-.68-.42-1.02-.6.34-.51.51-1.36.51-2 0-2-1.44-3.8-3.8-3.8z"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="0.8"
      />
    </svg>
  );
}

// 14. Golden Channel / Mastodon / Lemon8: Warm gold circle with white monogram
export function MastodonIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#EBB700" />
      <path
        d="M17.5 13.8v-4.5c0-.9-.3-1.6-.9-2.1-.6-.5-1.4-.7-2.3-.7-.9 0-1.7.3-2.3.8l-.5.6-.5-.6c-.6-.5-1.4-.8-2.3-.8-.9 0-1.7.2-2.3.7-.6.5-.9 1.2-.9 2.1v4.5h1.9v-4.2c0-.9.4-1.4 1.2-1.4.8 0 1.2.5 1.2 1.4v2.5h1.8v-2.5c0-.9.4-1.4 1.2-1.4.8 0 1.2.5 1.2 1.4v4.2h1.9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// Central renderer
export function renderPlatformIcon(
  platform: string,
  sizeOrClassName: number | string = 20,
  className = ""
) {
  let size = 20;
  let cls = className;
  if (typeof sizeOrClassName === "string") {
    cls = sizeOrClassName;
  } else {
    size = sizeOrClassName;
  }

  switch (platform.toLowerCase()) {
    case "facebook":
      return <FacebookIcon size={size} className={cls} />;
    case "x":
    case "twitter":
      return <XIcon size={size} className={cls} />;
    case "linkedin":
      return <LinkedInIcon size={size} className={cls} />;
    case "instagram":
      return <InstagramIcon size={size} className={cls} />;
    case "google":
    case "google_business":
      return <GoogleIcon size={size} className={cls} />;
    case "youtube":
      return <YouTubeIcon size={size} className={cls} />;
    case "pinterest":
      return <PinterestIcon size={size} className={cls} />;
    case "threads":
      return <ThreadsIcon size={size} className={cls} />;
    case "tiktok":
      return <TikTokIcon size={size} className={cls} />;
    case "telegram":
      return <TelegramIcon size={size} className={cls} />;
    case "whatsapp":
      return <WhatsAppIcon size={size} className={cls} />;
    case "bluesky":
      return <BlueskyIcon size={size} className={cls} />;
    case "snapchat":
      return <SnapchatIcon size={size} className={cls} />;
    case "mastodon":
    case "lemon8":
    case "golden":
    case "reddit":
      return <MastodonIcon size={size} className={cls} />;
    default:
      return (
        <div
          className={`rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center ${cls}`}
          style={{ width: size, height: size }}
        >
          {platform.charAt(0).toUpperCase()}
        </div>
      );
  }
}

