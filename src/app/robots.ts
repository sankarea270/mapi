import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo";

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* /admin es el panel: no tiene nada que indexar y no queremos que
           aparezca en resultados de búsqueda. La página además va marcada
           con noindex, porque robots.txt es una petición, no una barrera. */
        disallow: ["/studio", "/api/", "/admin"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}