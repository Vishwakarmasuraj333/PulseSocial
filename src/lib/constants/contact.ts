/**
 * SocialPulse Centralized Contact Configuration
 * Single source of truth for company contact details, phone numbers,
 * headquarters addresses, and support channels across marketing and app footers.
 */

export const CONTACT_CONFIG = {
  brandName: "PulseSocial",
  tagline: "Unified social media management SaaS platform for modern teams, creators, and enterprises. Publish, schedule, collaborate, and analyze from one powerful workspace.",
  phone: {
    display: "+1 (800) 785-PULSE",
    numeric: "+1 800-785-7362",
    tel: "+18007857362",
    label: "Toll-Free Helpline",
    hours: "Mon – Fri 9:00 AM – 8:00 PM EST (24/7 for critical enterprise support)",
  },
  emails: {
    support: "support@pulsesocial.io",
    sales: "sales@pulsesocial.io",
    security: "security@pulsesocial.io",
    press: "press@pulsesocial.io",
  },
  headquarters: {
    address: "450 Mission St, Suite 1400",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "United States",
    display: "450 Mission St, Suite 1400, San Francisco, CA 94105, USA",
  },
  regionalOffices: [
    { city: "London", country: "United Kingdom", address: "100 Bishopsgate, London EC2N 4AG" },
    { city: "Bengaluru", country: "India", address: "Outer Ring Rd, Bellandur, Bengaluru 560103" },
  ],
  socialLinks: {
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
  },
  sla: {
    standard: "Under 2 business hours for active accounts",
    enterprise: "Priority under 15-minute response for enterprise workspaces",
  },
  complianceBadges: [
    "SOC 2 Type II",
    "ISO/IEC 27001",
    "GDPR Compliant",
    "AES-256 Token Vault",
  ],
} as const;

export default CONTACT_CONFIG;
