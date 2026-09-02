import type { Tour, TourCategory } from "@/types/tour";
import type { Destination } from "@/data/destinations";
import { getDestinations } from "@/lib/content";

export function getDestinationTours(
  destination: Destination,
  categories: TourCategory[]
): Tour[] {
  const bySlug = new Map(categories.flatMap((c) => c.tours).map((tour) => [tour.slug, tour]));

  const tours: Tour[] = [];
  const seen = new Set<string>();

  for (const slug of destination.tourSlugs ?? []) {
    const tour = bySlug.get(slug);
    if (tour && !seen.has(tour.slug)) {
      tours.push(tour);
      seen.add(tour.slug);
    }
  }

  for (const categorySlug of destination.categorySlugs ?? []) {
    const category = categories.find((c) => c.slug === categorySlug);
    if (!category) continue;
    for (const tour of category.tours) {
      if (!seen.has(tour.slug)) {
        tours.push(tour);
        seen.add(tour.slug);
      }
    }
  }

  return tours;
}

/* Asíncrona porque los destinos ya no son una constante del código: salen
   de Supabase en tiempo de compilación, con `src/data` como respaldo. */
export async function getDestinationsWithTours(categories: TourCategory[]) {
  const destinos = await getDestinations();
  return destinos.map((destination) => ({
    destination,
    tours: getDestinationTours(destination, categories),
  }));
}