import type { TourCategory } from "@/types/tour";
import { pickLocalized } from "@/lib/format";

/**
 * Catálogo ligero para la cabecera y el buscador.
 *
 * La cabecera se monta en todas las páginas y recibía el catálogo entero:
 * los 70 tours con su nombre, duración y descripción en los tres idiomas, más
 * el itinerario día a día y la lista de "qué incluye". Nada de eso se usa en
 * un menú, pero viajaba en el HTML de cada página.
 *
 * Aquí se resuelve el idioma en el servidor y se dejan solo los campos que el
 * menú y el buscador pintan de verdad. `haystack` se precalcula para poder
 * buscar sin normalizar en cada pulsación de tecla.
 */

export interface TourBrief {
  slug: string;
  name: string;
  duration: string;
  price: number;
  rating: number;
  image: string;
  featured: boolean;
  categorySlug: string;
  categoryName: string;
  /** Texto normalizado sobre el que se busca. No se muestra. */
  haystack: string;
}

export interface CategoryBrief {
  slug: string;
  name: string;
  tours: TourBrief[];
}

/**
 * Quita acentos y pasa a minúsculas, para que "machu picchu" encuentre
 * "Machu Picchu" y "canon" encuentre "Cañón del Colca".
 */
export function normalize(text: string): string {
  return text
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function toBriefCatalog(
  categories: TourCategory[],
  locale: string
): CategoryBrief[] {
  return categories.map((category) => {
    const categoryName = pickLocalized(category.name, locale);
    return {
      slug: category.slug,
      name: categoryName,
      tours: category.tours.map((tour) => {
        const name = pickLocalized(tour.name, locale);
        const duration = pickLocalized(tour.duration, locale);
        return {
          slug: tour.slug,
          name,
          duration,
          price: tour.price,
          rating: tour.rating,
          image: tour.image,
          featured: tour.featured ?? false,
          categorySlug: tour.categorySlug,
          categoryName,
          haystack: normalize(`${name} ${categoryName} ${tour.slug}`),
        };
      }),
    };
  });
}

/**
 * Busca en el catálogo ya cargado, sin ir a la red.
 *
 * Ordena por dónde aparece la coincidencia: primero lo que empieza por el
 * término, luego lo que lo contiene, y a igualdad, mejor valorado antes. Sin
 * ese orden, buscar "machu" devolvía primero cualquier tour cuya categoría
 * fuese Machu Picchu en vez del propio Machu Picchu.
 */
export function searchTours(
  catalog: CategoryBrief[],
  query: string,
  limit = 8
): TourBrief[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored: Array<{ tour: TourBrief; score: number }> = [];

  for (const category of catalog) {
    for (const tour of category.tours) {
      let score = 0;
      let matchesAll = true;

      for (const term of terms) {
        const at = tour.haystack.indexOf(term);
        if (at === -1) {
          matchesAll = false;
          break;
        }
        // Empieza por el término > empieza una palabra > aparece suelto
        if (at === 0) score += 10;
        else if (tour.haystack[at - 1] === " ") score += 6;
        else score += 2;
      }

      if (matchesAll) scored.push({ tour, score: score + tour.rating });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.tour);
}
