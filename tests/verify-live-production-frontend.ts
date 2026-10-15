async function verifyLiveProduction() {
  console.log("==================================================================");
  console.log("   PHASE 5: DEPLOYED VERCEL PRODUCTION VERIFICATION");
  console.log("==================================================================");

  const baseUrl = "https://pulsesocial1.vercel.app";

  const publicRoutes = [
    "/",
    "/about",
    "/features",
    "/platforms",
    "/solutions",
    "/pricing",
    "/resources",
    "/blog",
    "/contact",
    "/login",
    "/signup",
    "/privacy",
    "/terms",
    "/cookie-policy",
    "/data-deletion",
    "/robots.txt",
    "/sitemap.xml",
    "/api/pricing",
    "/api/health/live",
    "/api/health/ready",
  ];

  console.log(`Pinging live endpoints on ${baseUrl}...\n`);
  for (const route of publicRoutes) {
    const url = `${baseUrl}${route}`;
    try {
      const res = await fetch(url, { redirect: "manual" });
      const contentType = res.headers.get("content-type") || "none";
      const xFrame = res.headers.get("x-frame-options") || "none";
      const xContentType = res.headers.get("x-content-type-options") || "none";
      console.log(`• ${route.padEnd(22)} -> HTTP ${res.status} [${contentType.split(";")[0]}] | X-Frame: ${xFrame} | X-Content-Type: ${xContentType}`);
    } catch (e: any) {
      console.log(`• ${route.padEnd(22)} -> FAILED: ${e.message}`);
    }
  }

  // Check robots.txt content
  console.log("\n[robots.txt content sample]:");
  const robotsRes = await fetch(`${baseUrl}/robots.txt`);
  const robotsText = await robotsRes.text();
  console.log(robotsText.split("\n").slice(0, 10).join("\n"));

  // Check sitemap.xml content
  console.log("\n[sitemap.xml content sample]:");
  const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
  const sitemapText = await sitemapRes.text();
  console.log(sitemapText.split("\n").slice(0, 10).join("\n"));
}

verifyLiveProduction().catch(console.error);
