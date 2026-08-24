import type { LocalizedText, TourCategory } from "@/types/tour";
import { getMockCategories } from "@/data/tours";
import { supabase } from "@/lib/supabase";

type RawRow = {
  slug: string;
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
    itinerary: Array<{
      day: string;
      title: { es: string; en: string; pt: string };
      description: { es: string; en: string; pt: string };
    }> | null;
  }>;
};

function loc(es: string, en: string | null, pt: string | null, fallback: string): LocalizedText {
  return {
    es,
    en: en ?? es ?? fallback,
    pt: pt ?? en ?? es ?? fallback,
  };
}

async function fetchFromSupabase(): Promise<TourCategory[]> {
  const { data, error } = await supabase!
    .from("categories")
    .select(`
      slug,
      name_es,
      name_en,
      name_pt,
      tours (
        slug,
        name_es, name_en, name_pt,
        duration_es, duration_en, duration_pt,
        price, rating, featured,
        image_url, gallery,
        excerpt_es, excerpt_en, excerpt_pt,
        included, itinerary
      )
    `)
    .order("sort_order");

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return (data as unknown as RawRow[])
    .filter((c) => c.slug && c.tours?.length > 0)
    .map((category) => ({
      slug: category.slug,
      name: loc(category.name_es, category.name_en, category.name_pt, category.slug),
      tours: category.tours
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .map((tour) => {
          const gallery = (tour.gallery ?? []).filter((url): url is string => Boolean(url));
          const included = (tour.included ?? []).map((item) =>
            loc(item.es, item.en, item.pt, "")
          );
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
            ...(included.length > 0 ? { included } : {}),
            ...(itinerary.length > 0 ? { itinerary } : {}),
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
