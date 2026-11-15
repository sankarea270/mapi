import type { LocalizedText, TourCategory } from "@/types/tour";
import { getMockCategories, ORDEN_MACHU_PICCHU } from "@/data/tours";
import { supabase } from "@/lib/supabase";

type RawRow = {
  slug: string;
  image_url?: string | null;
  name_es: string;
  name_en: string;
  name_pt: string;
  tours: Array<{
    slug: string;
    name_es: string;
    name_en: string;
    name_pt: string;
    duration_es: string | null;
    duration_en: string | null;
    duration_pt: string | null;
    price: number;
    rating: number;
    featured: boolean;
    image_url: string | null;
    gallery: string[] | null;
    excerpt_es: string | null;
    excerpt_en: string | null;
    excerpt_pt: string | null;
    included: Array<{ es: string; en: string; pt: string }> | null;
    location_image_url?: string | null;
    location_es?: string | null;
    location_en?: string | null;
    location_pt?: string | null;
    sort_order?: number | null;
    description_es?: string | null;
    description_en?: string | null;
    description_pt?: string | null;
    not_included?: Array<{ es: string; en: string; pt: string }> | null;
    itinerary: Array<{
      day: string;
      title: { es: string; en: string; pt: string };
      description: { es: string; en: string; pt: string };
    }> | null;
  }>;
};

/* `||` y no `??`: el panel guarda en blanco las traducciones que no se
   rellenan, y una cadena vacía no es null. Con `??` la ficha inglesa de un
   tour escrito solo en español salía sin duración y con los «incluye» en
   blanco. */
function loc(es: string, en: string | null, pt: string | null, fallback: string): LocalizedText {
  return {
    es: es || fallback,
    en: en || es || fallback,
    pt: pt || en || es || fallback,
  };
}

const lista = (items: Array<{ es: string; en: string; pt: string }> | null | undefined) =>
  (items ?? []).filter((item) => item?.es?.trim()).map((item) => loc(item.es, item.en, item.pt, ""));

const COLUMNAS_TOUR = `
        slug,
        name_es, name_en, name_pt,
        duration_es, duration_en, duration_pt,
        price, rating, featured,
        image_url, gallery,
        excerpt_es, excerpt_en, excerpt_pt,
        included, itinerary`;

function posicion(tour: RawRow["tours"][number]): number {
  if (tour.sort_order != null) return tour.sort_order;
  const i = ORDEN_MACHU_PICCHU.indexOf(tour.slug);
  return i === -1 ? Number.MAX_SAFE_INTEGER : (i + 1) * 10;
}

async function fetchFromSupabase(): Promise<TourCategory[]> {
  const pedir = (tour: string) =>
    supabase!
      .from("categories")
      .select(`slug, name_es, name_en, name_pt, image_url, tours (${tour})`)
      .order("sort_order");

  /* Columnas que llegan con migraciones posteriores, de la más nueva a la
     más vieja. Pedir una columna que no existe tumba la consulta entera, y
     sin estos reintentos la web caía a los tours de ejemplo solo por tener
     una migración pendiente: se prueba con todas y se va quitando un grupo
     cada vez. */
  const opcionales = [
    "description_es, description_en, description_pt, not_included", // 012
    "sort_order", // 011
    "location_image_url, location_es, location_en, location_pt", // 008
  ];
  const intentos = opcionales.map((_, i) =>
    [COLUMNAS_TOUR, ...opcionales.slice(i)].join(", ")
  );
  intentos.push(COLUMNAS_TOUR);
  let { data, error } = await pedir(intentos[0]);
  for (const columnas of intentos.slice(1)) {
    if ((error as { code?: string } | null)?.code !== "42703") break;
    ({ data, error } = await pedir(columnas));
  }

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return (data as unknown as RawRow[])
    .filter((c) => c.slug && c.tours?.length > 0)
    .map((category) => ({
      slug: category.slug,
      name: loc(category.name_es, category.name_en, category.name_pt, category.slug),
      ...(category.image_url ? { image: category.image_url } : {}),
      /* El orden que la agencia fija en el panel manda; los tours sin orden
         (recién creados) van detrás, mejor valorados primero. Sin la
         migración 011 no hay orden en la base de datos, y Machu Picchu usa
         el del documento de revisión para no volver al de valoración.
         Este orden es el de la web entera: el listado, el menú y las páginas
         de destino reciben los tours ya colocados. */
      tours: category.tours
        .sort((a, b) => posicion(a) - posicion(b) || (b.rating ?? 0) - (a.rating ?? 0))
        .map((tour) => {
          const gallery = (tour.gallery ?? []).filter((url): url is string => Boolean(url));
          const included = lista(tour.included);
          const notIncluded = lista(tour.not_included);
          const itinerary = (tour.itinerary ?? []).map((item) => ({
            day: item.day,
            title: loc(item.title.es, item.title.en, item.title.pt, item.day),
            description: loc(item.description.es, item.description.en, item.description.pt, ""),
          }));

          return {
            slug: tour.slug,
            categorySlug: category.slug,
            name: loc(tour.name_es, tour.name_en, tour.name_pt, tour.slug),
            duration: loc(
              tour.duration_es ?? "",
              tour.duration_en,
              tour.duration_pt,
              ""
            ),
            price: tour.price,
            rating: tour.rating ?? 0,
            featured: tour.featured ?? false,
            image: tour.image_url ?? "",
            ...(gallery.length > 0 ? { gallery } : {}),
            ...(tour.excerpt_es
              ? {
                  excerpt: loc(
                    tour.excerpt_es,
                    tour.excerpt_en,
                    tour.excerpt_pt,
                    ""
                  ),
                }
              : {}),
            ...(tour.description_es?.trim()
              ? {
                  description: loc(
                    tour.description_es,
                    tour.description_en ?? null,
                    tour.description_pt ?? null,
                    ""
                  ),
                }
              : {}),
            ...(included.length > 0 ? { included } : {}),
            ...(notIncluded.length > 0 ? { notIncluded } : {}),
            ...(itinerary.length > 0 ? { itinerary } : {}),
            ...(tour.location_image_url ? { locationImage: tour.location_image_url } : {}),
            ...(tour.location_es
              ? { location: loc(tour.location_es, tour.location_en ?? null, tour.location_pt ?? null, "") }
              : {}),
          };
        }),
    }));
}

export async function getCategoriesWithTours(): Promise<TourCategory[]> {
  if (supabase) {
    try {
      const data = await fetchFromSupabase();
      if (data.length > 0) return data;
    } catch (error) {
      console.error("[tours] Error fetching from Supabase, falling back to mock:", error);
    }
  }
  return getMockCategories();
}
