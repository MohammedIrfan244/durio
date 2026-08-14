import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://durio.vercel.app";

  return [
    {
      url: siteUrl,
    },
    {
      url: `${siteUrl}/privacy-policy`,
    },
  ];
}