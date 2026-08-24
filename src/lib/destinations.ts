import type { Tour, TourCategory } from "@/types/tour";
import { DESTINATIONS, type Destination } from "@/data/destinations";

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

export function getDestinationsWithTours(categories: TourCategory[]) {
  return DESTINATIONS.map((destination) => ({
    destination,
    tours: getDestinationTours(destination, categories),
  }));
}