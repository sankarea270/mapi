import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/seo";
import { getCategoriesWithTours } from "@/lib/tours";
import { getDestinations, getPackages } from "@/lib/content";
import { EXPERIENCES } from "@/data/experiences";
import { GUIDES } from "@/data/guides";

export const dynamic = 'force-static'

/*
 * La URL base viene de lib/seo, que es la única fuente: antes estaba
 * cableada aquí y en robots.ts, y ninguna de las dos coincidía con la que
 * usaban el canonical y las etiquetas Open Graph.
 *
 * El prefijo de idioma va siempre, también en español: con
 * `localePrefix: "always"` la raíz sin idioma no existe.
 */
function localePrefix(locale: string): string {
  return `/${locale}`;
}

/*
 * El proyecto compila con `trailingSlash: true`, así que la página real y su
 * canonical llevan barra final. Sin normalizar aquí, el sitemap declararía
 * /es y el canonical /es/: dos URLs distintas para la misma página.
 */
function url(path: string): string {
  return `${BASE_URL}${path}/`.replace(/\/{2,}$/, "/");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, destinations, packages] = await Promise.all([
    getCategoriesWithTours(),
    getDestinations(),
    getPackages(),
  ]);
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
        url: url(`${p}${path}`),
        changeFrequency: "weekly",
        priority,
      });
    }

    for (const slug of tourSlugs) {
      entries.push({
        url: url(`${p}/tours/${slug}`),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const destination of destinations) {
      entries.push({
        url: url(`${p}/destinos/${destination.slug}`),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const pkg of packages) {
      entries.push({
        url: url(`${p}/paquetes/${pkg.slug}`),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    for (const experience of EXPERIENCES) {
      entries.push({
        url: url(`${p}/experiencias/${experience.slug}`),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    for (const guide of GUIDES) {
      entries.push({
        url: url(`${p}/guia/${guide.slug}`),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return entries;
}