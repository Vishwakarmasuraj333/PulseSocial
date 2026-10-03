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

// 8. Threads: Official Meta black circle with authentic white Threads '@' continuous spiral mark
export function ThreadsIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#000000" />
      <g transform="translate(4.8, 4.8) scale(0.075)">
        <path
          d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
}

// Standalone bare Meta Threads vector glyph
export function ThreadsGlyph({ className = "w-5 h-5", size, fill = "currentColor" }: IconProps & { fill?: string }) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 192 192" fill="none" className={className}>
      <path
        d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"
        fill={fill}
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

// 15. Reddit: Official vibrant orange circle with crisp white Snoo icon
export function RedditIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#FF4500" />
      <path
        d="M17.8 11.2c-.4 0-.8.2-1 .5-1.1-.7-2.6-1.2-4.2-1.3l.8-3.7 2.6.6c0 .6.5 1 1.1 1 .6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1c-.5 0-.9.3-1 .8l-2.9-.6c-.1 0-.3.1-.3.2l-.9 4.2c-1.7.1-3.2.6-4.3 1.3-.3-.3-.7-.5-1.1-.5-.8 0-1.5.7-1.5 1.5 0 .6.4 1.1.9 1.3-.1.3-.1.6-.1.9 0 2.3 2.7 4.2 6 4.2s6-1.9 6-4.2c0-.3 0-.6-.1-.9.5-.2.9-.7.9-1.3 0-.8-.7-1.4-1.5-1.4zm-8.8 1.8c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9zm5.9 3.5c-.8.8-2.2.8-2.9.8s-2.1 0-2.9-.8c-.1-.1-.1-.3 0-.4.1-.1.3-.1.4 0 .6.6 1.7.6 2.5.6s1.9 0 2.5-.6c.1-.1.3-.1.4 0 .1.1.1.3 0 .4zm-.2-2.6c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 16. Canva: Official Canva gradient circle with iconic white script mark
export function CanvaIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 508 508"
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      className={className}
    >
      <defs>
        <radialGradient
          id="canvaRadial1"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="scale(1469.491) rotate(-49.416 1.37 .302)"
        >
          <stop offset="0" stopColor="#6420ff" />
          <stop offset="1" stopColor="#6420ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="canvaRadial2"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(54.703 42.717 594.194) scale(1657.122)"
        >
          <stop offset="0" stopColor="#00c4cc" />
          <stop offset="1" stopColor="#00c4cc" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="canvaRadial3"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(1023 -1030 473.711 470.491 367 1684)"
        >
          <stop offset="0" stopColor="#6420ff" />
          <stop offset="1" stopColor="#6420ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="canvaRadial4"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(595.999 1372 -2298.41 998.431 777 256)"
        >
          <stop offset="0" stopColor="#00c4cc" stopOpacity=".73" />
          <stop offset="0" stopColor="#00c4cc" />
          <stop offset="1" stopColor="#00c4cc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="matrix(.26718 0 0 .26718 0 0)">
        <circle cx="950" cy="950" r="950" fill="#7d2ae7" />
        <circle cx="950" cy="950" r="950" fill="url(#canvaRadial1)" />
        <circle cx="950" cy="950" r="950" fill="url(#canvaRadial2)" />
        <circle cx="950" cy="950" r="950" fill="url(#canvaRadial3)" />
        <circle cx="950" cy="950" r="950" fill="url(#canvaRadial4)" />
      </g>
      <path
        d="M446.744 276.845c-.665 0-1.271.43-1.584 1.33-4.011 11.446-9.43 18.254-13.891 18.254-2.563 0-3.6-2.856-3.6-7.336 0-11.21 6.71-34.982 10.095-45.82.392-1.312.646-2.485.646-3.483 0-3.15-1.722-4.696-5.987-4.696-4.598 0-9.547 1.8-14.36 10.233-1.663-7.435-6.691-10.683-13.715-10.683-8.12 0-15.965 5.224-22.421 13.696-6.456 8.471-14.048 11.25-19.76 9.88 4.108-10.057 5.634-17.57 5.634-23.145 0-8.746-4.324-14.028-11.308-14.028-10.624 0-16.747 10.134-16.747 20.797 0 8.237 3.736 16.708 11.954 20.817-6.887 15.573-16.943 29.66-20.758 29.66-4.93 0-6.379-24.123-6.105-41.38.176-9.9.998-10.408.998-13.401 0-1.722-1.115-2.896-5.595-2.896-10.448 0-13.676 8.844-14.165 18.998a50.052 50.052 0 01-1.8 11.406c-4.363 15.573-13.363 27.39-19.232 27.39-2.72 0-3.463-2.72-3.463-6.28 0-11.21 6.28-25.219 6.28-37.173 0-8.784-3.854-14.34-11.112-14.34-8.55 0-19.858 10.173-30.56 29.229 3.521-14.595 4.97-28.721-5.459-28.721a14.115 14.115 0 00-6.476 1.683 3.689 3.689 0 00-2.113 3.56c.998 15.535-12.521 55.329-25.336 55.329-2.328 0-3.463-2.524-3.463-6.593 0-11.23 6.691-34.943 10.056-45.801.43-1.409.666-2.622.666-3.678 0-2.974-1.84-4.5-6.007-4.5-4.578 0-9.547 1.741-14.34 10.174-1.683-7.435-6.711-10.683-13.735-10.683-11.523 0-24.397 12.19-30.051 28.076-7.572 21.208-22.832 41.692-43.375 41.692-18.645 0-28.486-15.515-28.486-40.03 0-35.392 25.982-64.308 45.253-64.308 9.215 0 13.617 5.869 13.617 14.869 0 10.897-6.085 15.964-6.085 20.112 0 1.272 1.057 2.524 3.15 2.524 8.374 0 18.234-9.841 18.234-23.262 0-13.422-10.897-23.243-30.168-23.243-31.851 0-63.898 32.047-63.898 73.113 0 32.673 16.121 52.374 44 52.374 19.017 0 35.628-14.79 44.588-32.047 1.018 14.302 7.513 21.776 17.413 21.776 8.804 0 15.925-5.243 21.364-14.458 2.094 9.645 7.65 14.36 14.87 14.36 8.275 0 15.201-5.243 21.794-14.986-.097 7.65 1.644 14.85 8.276 14.85 3.13 0 6.867-.725 7.533-3.464 6.984-28.877 24.24-52.453 29.523-52.453 1.565 0 1.995 1.507 1.995 3.287 0 7.846-5.537 23.928-5.537 34.2 0 11.092 4.716 18.43 14.459 18.43 10.8 0 21.775-13.227 29.092-32.556 2.29 18.058 7.24 32.633 14.987 32.633 9.508 0 26.392-20.014 36.625-41.203 4.01.509 10.036.372 15.827-3.717-2.465 6.241-3.912 13.07-3.912 19.897 0 19.663 9.39 25.18 17.47 25.18 8.785 0 15.907-5.243 21.365-14.458 1.8 8.315 6.398 14.34 14.85 14.34 13.225 0 24.71-13.519 24.71-24.612 0-2.934-1.252-4.715-2.72-4.715zm-274.51 18.547c-5.342 0-7.435-5.38-7.435-13.401 0-13.93 9.528-37.193 19.604-37.193 4.402 0 6.065 5.185 6.065 11.524 0 14.145-9.059 39.07-18.235 39.07zm182.948-41.574c-3.189-3.796-4.343-8.961-4.343-13.559 0-5.673 2.074-10.467 4.558-10.467 2.485 0 3.248 2.446 3.248 5.85 0 5.693-2.035 14.008-3.463 18.176zm41.418 41.574c-5.34 0-7.434-6.182-7.434-13.401 0-13.441 9.528-37.193 19.682-37.193 4.402 0 5.967 5.146 5.967 11.524 0 14.145-8.902 39.07-18.215 39.07z"
        fill="#FFFFFF"
        fillRule="nonzero"
      />
    </svg>
  );
}

// 17. Google Gemini: Official Google Gemini 4-pointed radiant gradient star
export function GeminiIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A73E8" />
          <stop offset="40%" stopColor="#8AB4F8" />
          <stop offset="70%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#FF7769" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
        fill="url(#geminiGrad)"
      />
      <circle cx="18.5" cy="5.5" r="2" fill="url(#geminiGrad)" opacity="0.85" />
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
    case "reddit":
      return <RedditIcon size={size} className={cls} />;
    case "canva":
      return <CanvaIcon size={size} className={cls} />;
    case "gemini":
      return <GeminiIcon size={size} className={cls} />;
    case "mastodon":
    case "lemon8":
    case "golden":
      return <MastodonIcon size={size} className={cls} />;
    case "google":
    case "google_business":
      return <GoogleBusinessIcon size={size} className={cls} />;
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

export function GoogleBusinessIcon({ className = "w-5 h-5", size }: IconProps) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="11.5" fill="#4285F4" stroke="#3367D6" strokeWidth="1" />
      <path
        d="M12 5C8.13 5 5 8.13 5 12c0 3.87 3.13 7 7 7 3.87 0 7-3.13 7-7 0-.54-.06-1.07-.18-1.57H12v3.14h4.05c-.35 1.15-1.28 2.01-2.45 2.29-.44.1-.9.14-1.6.14-2.21 0-4-1.79-4-4s1.79-4 4-4c1.08 0 2.06.43 2.77 1.13l2.22-2.22C16.5 7.42 14.39 6.5 12 6.5V5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}



