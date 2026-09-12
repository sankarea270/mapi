import { getLocale } from "next-intl/server";
import { getCategoriesWithTours } from "@/lib/tours";
import { toBriefCatalog } from "@/lib/catalog";
import { getDestinations, getExperiences, getGuides, getPackages } from "@/lib/content";
import { HeaderClient } from "./HeaderClient";

export default async function Header() {
  const [categories, locale, destinos, paquetes, experiencias, guias] = await Promise.all([
    getCategoriesWithTours(),
    getLocale(),
    getDestinations(),
    getPackages(),
    getExperiences(),
    getGuides(),
  ]);

  /*
   * Una foto por ENLACE del menú, indexada por su dirección.
   *
   * El menú enseñaba una sola imagen por sección —la que trae `featured` en
   * la configuración—, así que al recorrer Destinos, Aventura o Paquetes la
   * foto no cambiaba: no había nada que previsualizar. Y Experiencias y Guía
   * de viaje no tenían ninguna.
   *
   * Se indexa por `href` y no por slug porque es lo único que el menú
   * conoce de cada entrada; la configuración de navegación no dice a qué
   * tipo de contenido apunta cada enlace.
   */
  const fotos: Record<string, string> = {};
  for (const d of destinos) if (d.image) fotos[`/destinos/${d.slug}`] = d.image;
  for (const x of paquetes) if (x.image) fotos[`/paquetes/${x.slug}`] = x.image;
  for (const e of experiencias) if (e.image) fotos[`/experiencias/${e.slug}`] = e.image;
  for (const g of guias) if (g.image) fotos[`/guia/${g.slug}`] = g.image;
  for (const c of categories) {
    const primera = c.tours[0]?.image;
    if (primera) fotos[`/tours?categoria=${c.slug}`] = primera;
    for (const tour of c.tours) if (tour.image) fotos[`/tours/${tour.slug}`] = tour.image;
  }

  /*
   * El idioma se resuelve aquí, en el servidor. Antes se pasaba el catálogo
   * completo —tres idiomas, itinerarios y listas de "qué incluye"— a la
   * cabecera, que se monta en todas las páginas del sitio.
   */
  return <HeaderClient catalog={toBriefCatalog(categories, locale)} fotos={fotos} />;
}
