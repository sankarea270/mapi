import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/config/site";

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? siteUrl;

export const DEFAULT_OG_IMAGE = "https://picsum.photos/seed/mapi-og/1200/630";

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
  const ogImage = image ?? DEFAULT_OG_IMAGE;
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