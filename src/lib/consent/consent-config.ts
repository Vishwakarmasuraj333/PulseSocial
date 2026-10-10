export const CONSENT_COOKIE_NAME = "pulsesocial_consent";
export const CURRENT_POLICY_VERSION = "2026-10";
export const LAST_POLICY_UPDATE = "October 10, 2026";

export interface CookieDefinition {
  name: string;
  purpose: string;
  duration: string;
  firstParty: boolean;
}

export interface ConsentCategoryConfig {
  id: "necessary" | "preferences" | "analytics";
  name: string;
  shortDescription: string;
  longDescription: string;
  alwaysActive: boolean;
  defaultState: boolean;
  cookies: CookieDefinition[];
}

export const COOKIE_CATEGORIES: ConsentCategoryConfig[] = [
  {
    id: "necessary",
    name: "Strictly Necessary",
    shortDescription: "Essential for authentication sessions, CSRF protection, and platform security.",
    longDescription:
      "These cookies are required for the basic operation of PulseSocial. They enable secure login sessions, protect against Cross-Site Request Forgery (CSRF), and maintain core functionality. They cannot be disabled.",
    alwaysActive: true,
    defaultState: true,
    cookies: [
      {
        name: "pulsesocial_auth_session",
        purpose: "Encrypted JWT authentication session token verifying user identity and active workspace.",
        duration: "30 days (persistent) or 24 hours (session)",
        firstParty: true,
      },
      {
        name: "pulsesocial_consent",
        purpose: "Stores your recorded cookie consent preferences and policy version to prevent duplicate prompts.",
        duration: "1 year",
        firstParty: true,
      },
    ],
  },
  {
    id: "preferences",
    name: "Preferences",
    shortDescription: "Remembers your workspace display choices and UI appearance.",
    longDescription:
      "These cookies allow the application to remember choices you make, such as your selected active organization brand context and dark or light display theme.",
    alwaysActive: false,
    defaultState: false,
    cookies: [
      {
        name: "pulsesocial_active_brand",
        purpose: "Remembers your selected active organization across multiple browser tabs and windows.",
        duration: "30 days",
        firstParty: true,
      },
      {
        name: "pulsesocial_theme",
        purpose: "Maintains your preferred visual theme (Light, Dark, or System mode).",
        duration: "1 year",
        firstParty: true,
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    shortDescription: "Measures aggregated interface usage to diagnose errors and improve features.",
    longDescription:
      "These cookies gather anonymous, aggregate telemetry regarding feature usage and page load responsiveness to assist our engineering team in optimizing platform performance. No personal tracking is performed.",
    alwaysActive: false,
    defaultState: false,
    cookies: [
      {
        name: "_pk_id",
        purpose: "Anonymous first-party visitor telemetry identifier for aggregate feature adoption metrics.",
        duration: "13 months",
        firstParty: true,
      },
      {
        name: "_pk_ses",
        purpose: "Temporary session activity tracker for measuring page transition error rates and latency.",
        duration: "30 minutes",
        firstParty: true,
      },
    ],
  },
];
