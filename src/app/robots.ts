import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pulsesocial1.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/onboarding/",
          "/compose/",
          "/calendar/",
          "/inbox/",
          "/analytics/",
          "/settings/",
          "/team/",
          "/media/",
          "/connections/",
          "/social-accounts/",
          "/reports/",
          "/automation/",
          "/collaborate/",
          "/approvals/",
          "/drafts/",
          "/ai/",
          "/ai-assistant/",
          "/billing/",
          "/brand-boards/",
          "/canva/",
          "/comments/",
          "/links/",
          "/mentions/",
          "/messages/",
          "/monitor/",
          "/notifications/",
          "/posts/",
          "/published/",
          "/scheduled/",
          "/snippets/",
          "/social-planner/",
          "/trigger-links/",
          "/admin/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
