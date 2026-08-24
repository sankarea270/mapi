import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getCategoriesWithTours } from "@/lib/tours";
import { DESTINATIONS } from "@/data/destinations";
import { PACKAGES } from "@/data/packages";
import { EXPERIENCES } from "@/data/experiences";
import { GUIDES } from "@/data/guides";
import { BASE_URL } from "@/lib/seo";

function localePrefix(locale: string): string {
  return locale === routing.defaultLocale ? "" : `/${locale}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategoriesWithTours();
  const tourSlugs = categories.flatMap((c) => c.tours.map((t) => t.slug));

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    const p = localePrefix(locale);

    const staticPaths: Array<[string, number]> = [
      ["", 1],
      ["/tours", 0.9],
      ["/destinos", 0.8],
      ["/paquetes", 0.8],
      ["/experiencias", 0.7],
      ["/guia", 0.6],
      ["/contacto", 0.5],
      ["/reservar", 0.5],
      ["/reservas", 0.3],
      ["/legal/terminos", 0.2],
      ["/legal/privacidad", 0.2],
    ];

    for (const [path, priority] of staticPaths) {
      entries.push({
        url: `${BASE_URL}${p}${path}`,
        changeFrequency: "weekly",
        priority,
      });
    }

    for (const slug of tourSlugs) {
      entries.push({
        url: `${BASE_URL}${p}/tours/${slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const destination of DESTINATIONS) {
      entries.push({
        url: `${BASE_URL}${p}/destinos/${destination.slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const pkg of PACKAGES) {
      entries.push({
        url: `${BASE_URL}${p}/paquetes/${pkg.slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    for (const experience of EXPERIENCES) {
      entries.push({
        url: `${BASE_URL}${p}/experiencias/${experience.slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    for (const guide of GUIDES) {
      entries.push({
        url: `${BASE_URL}${p}/guia/${guide.slug}`,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return entries;
}