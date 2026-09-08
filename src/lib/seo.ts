import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/config/site";

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? siteUrl;

/*
 * Imagen de compartir por defecto y logotipo para los buscadores.
 *
 * Antes la de compartir era `https://picsum.photos/seed/mapi-og/1200/630`:
 * una fotografía de archivo ALEATORIA servida por un tercero. Cada enlace de
 * la web pegado en WhatsApp o en redes salía con una imagen distinta y sin
 * relación con la agencia, y quedaba en manos de que ese servicio siguiera
 * en pie.
 *
 * Van en absoluto y no en relativo: quien lee estas etiquetas —Google,
 * WhatsApp, Facebook— no está en el dominio y no sabe resolver una ruta que
 * empiece por barra.
 */
export const DEFAULT_OG_IMAGE = `${BASE_URL}/gotomapi-og.png`;

/** Cuadrado y sobre fondo sólido, que es lo que pide Google para el logo. */
export const LOGO_URL = `${BASE_URL}/gotomapi-mark.webp`;

/*
 * El prefijo de idioma va SIEMPRE, incluido el español. La versión anterior
 * lo omitía para el idioma por defecto, que era correcto cuando el routing
 * usaba `localePrefix: "as-needed"`; desde que pasó a "always" esas URLs no
 * existen, así que el canonical, los hreflang y el sitemap del español
 * apuntaban a páginas que devuelven 404.
 */
function localizedPath(path: string, locale: string): string {
  const clean = path.replace(/^\//, "").replace(/\/+$/, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}

export function pageUrl(path: string, locale: string): string {
  return `${BASE_URL}${localizedPath(path, locale)}`;
}

function alternatesFor(path: string) {
  const languages: Record<string, string> = {
    "x-default": pageUrl(path, routing.defaultLocale),
  };
  for (const l of routing.locales) {
    languages[l] = pageUrl(path, l);
  }
  return languages;
}

export function buildMetadata({
  locale,
  title,
  description,
  path,
  image,
}: {
  locale: string;
  title: string;
  description?: string;
  path: string;
  image?: string;
}): Metadata {
  /*
   * Una foto de relleno NO se anuncia como imagen de compartir.
   *
   * Los tours y paquetes que todavía no tienen fotografía propia llevan una
   * de picsum.photos, que devuelve una imagen distinta en cada petición.
   * Pasarla a `og:image` significa que Google, WhatsApp y las redes guardan
   * como cara de esa página una fotografía aleatoria sin relación con el
   * viaje —y en 309 páginas a la vez—. Mejor el logotipo: dice menos, pero
   * dice la verdad, y es estable.
   *
   * Se cae solo cuando se suban fotos de verdad: la condición mira el origen
   * de la imagen, no una lista de páginas.
   */
  const esRelleno = image?.includes("picsum.photos");
  const ogImage = image && !esRelleno ? image : DEFAULT_OG_IMAGE;
  return {
    title,
    description,
    alternates: {
      canonical: pageUrl(path, locale),
      languages: alternatesFor(path),
    },
    openGraph: {
      title,
      description,
      url: pageUrl(path, locale),
      siteName: "GoToMapi",
      locale: locale === "es" ? "es_PE" : locale === "en" ? "en_US" : "pt_BR",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}