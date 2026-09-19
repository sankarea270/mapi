import { pageUrl, BASE_URL, LOGO_URL } from "@/lib/seo";
import { siteConfig } from "@/config/site";

/*
 * Datos estructurados (schema.org) que comparten varias páginas.
 *
 * Antes solo llevaban JSON-LD la portada, las fichas de tour y tres guías:
 * 42 destinos, 21 experiencias, 24 paquetes, «Nosotros» y «Contacto» salían
 * sin nada, y Google no podía pintar las migas de pan en el resultado ni
 * saber qué era cada página. Aquí van las piezas comunes para que cada
 * página solo describa lo suyo.
 *
 * El `@id` de la agencia es el mismo en todas: así Google entiende que el
 * «publisher» de una guía, el «provider» de un viaje y el autor de la
 * portada son UNA entidad, y no una empresa distinta por página.
 */

export const ID_AGENCIA = `${BASE_URL}/#agencia`;
export const ID_SITIO = `${BASE_URL}/#sitio`;

export interface Miga {
  nombre: string;
  /** Ruta sin idioma («/destinos/cusco»). Sin ruta: es la página actual. */
  ruta?: string;
}

/** BreadcrumbList. La última miga es la página actual y no lleva enlace. */
export function breadcrumbList(migas: Miga[], locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: migas.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.nombre,
      ...(m.ruta !== undefined ? { item: pageUrl(m.ruta, locale) } : {}),
    })),
  };
}

/** La agencia como referencia, para pegarla dentro de otros objetos. */
export const agenciaRef = { "@type": "TravelAgency", "@id": ID_AGENCIA, name: siteConfig.fullName };

/** Nombre del sitio: es lo que Google usa para el «nombre del sitio» del resultado. */
export function webSite(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": ID_SITIO,
    name: siteConfig.fullName,
    alternateName: ["GoTo Mapi", "GoToMachuPicchuPeru", "Go To Machu Picchu Peru"],
    url: pageUrl("/", locale),
    inLanguage: locale,
    publisher: { "@id": ID_AGENCIA },
  };
}

export { LOGO_URL };
