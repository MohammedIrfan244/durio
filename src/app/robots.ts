export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://durio.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
