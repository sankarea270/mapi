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
/*
 * Con barra final, como las sirve el hosting (`trailingSlash`).
 *
 * Antes salían sin ella («/pt/destinos/lima»). En el canonical y los
 * hreflang no se notaba, porque Next la añade a los metadatos; pero en el
 * JSON-LD (migas, `url` de cada tour, listas) iba tal cual, Google seguía esas
 * direcciones, recibía un 301 y Search Console acabó con 172 «Página con
 * redirección» (noviembre de 2026). La consulta (`?categoria=…`) va después
 * de la barra: `/es/tours/?categoria=puno`, que es la dirección real.
 */
function localizedPath(path: string, locale: string): string {
  const corte = path.search(/[?#]/);
  const ruta = corte === -1 ? path : path.slice(0, corte);
  const resto = corte === -1 ? "" : path.slice(corte);
  const clean = ruta.replace(/^\//, "").replace(/\/+$/, "");
  return `${clean ? `/${locale}/${clean}` : `/${locale}`}/${resto}`;
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

/*
 * Google enseña ~155 caracteres de la descripción y ~60 del título, y corta
 * por el medio de una palabra si se pasa. De 345 páginas, 219 tenían la
 * descripción más larga (la política de privacidad, 293) y acababan en
 * «…»  a mitad de frase. Se recorta aquí, en el único sitio por el que
 * pasan todas, y por el último espacio: nunca a mitad de palabra.
 */
const MAX_DESCRIPCION = 155;

export function recortar(texto: string | undefined, max = MAX_DESCRIPCION): string | undefined {
  if (!texto) return texto;
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max - 1);
  const espacio = corte.lastIndexOf(" ");
  /* Si no hay espacio razonable (una sola palabra kilométrica), se corta duro. */
  const base = espacio > max * 0.6 ? corte.slice(0, espacio) : corte;
  return `${base.replace(/[\s,;:.\-—]+$/, "")}…`;
}

/**
 * Alarga una descripción corta con frases enteras de `extra`, sin pasar de
 * los 155 caracteres. Si ninguna frase entera cabe, se añade la primera y
 * `recortar` la corta por la última palabra.
 */
export function completarDescripcion(base: string, extra: string): string {
  const corta = base.replace(/\s+/g, " ").trim();
  if (corta.length >= 110 || !extra) return corta;
  const conPunto = /[.!?…]$/.test(corta) ? corta : `${corta}.`;
  const frases =
    extra
      .replace(/[*#_>`]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .match(/[^.!?]+[.!?]+/g) ?? [extra];
  let resultado = conPunto;
  for (const frase of frases) {
    const siguiente = `${resultado} ${frase.trim()}`;
    if (siguiente.length > MAX_DESCRIPCION) break;
    resultado = siguiente;
  }
  return resultado === conPunto ? `${conPunto} ${frases[0].trim()}` : resultado;
}

/** Longitud que el layout suma al título con su plantilla: « · GoToMapi». */
const SUFIJO_TITULO = 11;
const MAX_TITULO = 60;

export function buildMetadata({
  locale,
  title,
  description,
  path,
  image,
  noindex = false,
}: {
  locale: string;
  title: string;
  description?: string;
  path: string;
  image?: string;
  /** Páginas sin nada que indexar: listas personales, formularios vacíos. */
  noindex?: boolean;
}): Metadata {
  description = recortar(description);
  /* Con la plantilla del layout, un título de más de ~49 caracteres pasa de
     60 y Google lo corta. Los largos van sin el « · GoToMapi»: la marca ya
     sale en el nombre del sitio del resultado (WebSite en la portada). */
  const tituloMeta =
    title.length + SUFIJO_TITULO > MAX_TITULO ? { absolute: title } : title;
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
    title: tituloMeta,
    description,
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
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