import { createClient } from "@supabase/supabase-js";
import { getMockCategories } from "../src/data/tours";
import type { Tour, TourCategory } from "../src/types/tour";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  console.error("Add them to .env.local before running this script.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function seed() {
  console.log("Seeding categories and tours...\n");
  const categories = getMockCategories();

  for (const category of categories) {
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .upsert(
        {
          slug: category.slug,
          name_es: category.name.es,
          name_en: category.name.en,
          name_pt: category.name.pt,
          sort_order: categories.indexOf(category) + 1,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (catErr) {
      console.error(`  Error upserting category ${category.slug}:`, catErr.message);
      continue;
    }
    console.log(`  Category: ${category.name.es} (${cat.id})`);

    for (const tour of category.tours) {
      const { error: tourErr } = await supabase.from("tours").upsert(
        {
          category_id: cat.id,
          slug: tour.slug,
          name_es: tour.name.es,
          name_en: tour.name.en,
          name_pt: tour.name.pt,
          duration_es: tour.duration.es,
          duration_en: tour.duration.en,
          duration_pt: tour.duration.pt,
          price: tour.price,
          rating: tour.rating,
          featured: tour.featured ?? false,
          image_url: tour.image,
          gallery: tour.gallery ?? [],
          excerpt_es: tour.excerpt?.es,
          excerpt_en: tour.excerpt?.en,
          excerpt_pt: tour.excerpt?.pt,
          included: tour.included?.map((i) => ({ es: i.es, en: i.en, pt: i.pt })) ?? [],
          itinerary:
            tour.itinerary?.map((d) => ({
              day: d.day,
              title: { es: d.title.es, en: d.title.en, pt: d.title.pt },
              description: { es: d.description.es, en: d.description.en, pt: d.description.pt },
            })) ?? [],
        },
        { onConflict: "slug" }
      );

      if (tourErr) {
        console.error(`    Error upserting tour ${tour.slug}:`, tourErr.message);
      }
    }
    console.log(`    ${category.tours.length} tours seeded`);
  }

  const { count } = await supabase.from("tours").select("*", { count: "exact", head: true });
  console.log(`\nDone! Total tours in database: ${count}`);
}

seed().catch(console.error);
