import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pulsesocial1.vercel.app";
  const currentDate = new Date().toISOString();

  const publicRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/features", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/platforms", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/solutions", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/resources", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/blog", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/cookie-policy", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/data-deletion", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/signup", priority: 0.9, changeFrequency: "monthly" as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const blogPosts = await prisma.blogPost.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ? post.updatedAt.toISOString() : currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticEntries, ...blogEntries];
  } catch (error) {
    console.warn("Failed to fetch blog posts for sitemap:", error);
    return staticEntries;
  }
}
