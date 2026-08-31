import { getLocale } from "next-intl/server";
import { getCategoriesWithTours } from "@/lib/tours";
import { toBriefCatalog } from "@/lib/catalog";
import { HeaderClient } from "./HeaderClient";

export default async function Header() {
  const [categories, locale] = await Promise.all([
    getCategoriesWithTours(),
    getLocale(),
  ]);

  /*
   * El idioma se resuelve aquí, en el servidor. Antes se pasaba el catálogo
   * completo —tres idiomas, itinerarios y listas de "qué incluye"— a la
   * cabecera, que se monta en todas las páginas del sitio.
   */
  return <HeaderClient catalog={toBriefCatalog(categories, locale)} />;
}
