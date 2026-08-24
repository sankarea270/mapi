import type { MetadataRoute } from "next";

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/api/"],
      },
    ],
    sitemap: `https://sankarea270.github.io/mapi/sitemap.xml`,
    host: "https://sankarea270.github.io/mapi",
  };
}