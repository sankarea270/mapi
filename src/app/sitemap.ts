import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/seo";
import { getCategoriesWithTours } from "@/lib/tours";
import { getDestinations, getExperiences, getPackages } from "@/lib/content";
import { GUIDES } from "@/data/guides";

export const dynamic = "force-static";

/*
 * La URL base viene de lib/seo, que es la única fuente: antes estaba
 * cableada aquí y en robots.ts, y ninguna de las dos coincidía con la que
 * usaban el canonical y las etiquetas Open Graph.
 *
 * El prefijo de idioma va siempre, también en español: con
 * `localePrefix: "always"` la raíz sin idioma no existe.
 *
 * El proyecto compila con `trailingSlash: true`, así que la página real y su
 * canonical llevan barra final. Sin normalizar aquí, el sitemap declararía
 * /es y el canonical /es/: dos URLs distintas para la misma página.
 */
function url(locale: string, path: string): string {
  return `${BASE_URL}/${locale}${path}/`;
}

/*
 * Cada página declara sus tres versiones de idioma (`xhtml:link` en el XML).
 * Ya iban en el <head> de cada una, pero Google las lee también del sitemap
 * y, con 115 páginas por idioma, es la vía que menos se rompe: el sitemap se
 * genera de una vez y el <head> depende de cada plantilla. Tienen que
 * coincidir con los `hreflang` de la página, y por eso usan el mismo
 * `x-default`.
 */
function entrada(
  locale: string,
  path: string,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>,
  priority: number
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {
    "x-default": url(routing.defaultLocale, path),
  };
  for (const l of routing.locales) languages[l] = url(l, path);
  return { url: url(locale, path), changeFrequency, priority, alternates: { languages } };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, destinations, packages, experiences] = await Promise.all([
    getCategoriesWithTours(),
    getDestinations(),
    getPackages(),
    getExperiences(),
  ]);
  const tourSlugs = categories.flatMap((c) => c.tours.map((t) => t.slug));

  const entries: MetadataRoute.Sitemap = [];

  /*
   * /reservas no está: es la lista de reservas que cada visitante guarda en
   * su propio navegador. Para un robot siempre está vacía, no tiene nada que
   * ofrecer en un buscador y la propia página va marcada con noindex.
   */
  const staticPaths: Array<[string, number]> = [
    ["", 1],
    ["/tours", 0.9],
    ["/destinos", 0.8],
    ["/paquetes", 0.8],
    ["/experiencias", 0.7],
    ["/guia", 0.6],
    ["/nosotros", 0.6],
    ["/contacto", 0.5],
    ["/reservar", 0.5],
    ["/legal/terminos", 0.2],
    ["/legal/privacidad", 0.2],
  ];

  for (const locale of routing.locales) {
    for (const [path, priority] of staticPaths) {
      entries.push(entrada(locale, path, "weekly", priority));
    }
    for (const slug of tourSlugs) entries.push(entrada(locale, `/tours/${slug}`, "weekly", 0.8));
    for (const d of destinations) entries.push(entrada(locale, `/destinos/${d.slug}`, "weekly", 0.7));
    for (const p of packages) entries.push(entrada(locale, `/paquetes/${p.slug}`, "monthly", 0.6));
    /* Las de la tabla: las del código eran de relleno y se borraron. */
    for (const e of experiences) entries.push(entrada(locale, `/experiencias/${e.slug}`, "monthly", 0.6));
    for (const g of GUIDES) entries.push(entrada(locale, `/guia/${g.slug}`, "monthly", 0.5));
  }

  return entries;
}
