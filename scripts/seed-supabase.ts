import { createClient } from "@supabase/supabase-js";
import { getMockCategories } from "../src/data/tours";
import { DESTINATIONS } from "../src/data/destinations";
import { PACKAGES } from "../src/data/packages";
import { REVIEWS } from "../src/data/reviews";

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

  await sembrarDestinos();
  await sembrarPaquetes();
  await sembrarResenas();

  const { count } = await supabase.from("tours").select("*", { count: "exact", head: true });
  console.log(`\nDone! Total tours in database: ${count}`);
}

/*
 * Destinos, paquetes y reseñas.
 *
 * Entran como `published` porque son el contenido que la web ya está
 * enseñando: si se sembraran como borrador, la siguiente compilación
 * dejaría esas secciones vacías.
 *
 * `onConflict: "slug"` hace que repetir el sembrado actualice en vez de
 * duplicar. Las reseñas no tienen slug, así que en su lugar se comprueba
 * si ya hay alguna y no se tocan.
 */
async function sembrarDestinos() {
  console.log("\nSeeding destinations...");
  for (const [i, d] of DESTINATIONS.entries()) {
    const { error } = await supabase.from("destinations").upsert(
      {
        slug: d.slug,
        name_es: d.name.es,
        name_en: d.name.en,
        name_pt: d.name.pt,
        description_es: d.description.es,
        description_en: d.description.en,
        description_pt: d.description.pt,
        image_url: d.image,
        category_slugs: d.categorySlugs ?? [],
        tour_slugs: d.tourSlugs ?? [],
        status: "published",
        sort_order: i + 1,
      },
      { onConflict: "slug" }
    );
    if (error) console.error(`  Error on destination ${d.slug}:`, error.message);
  }
  console.log(`  ${DESTINATIONS.length} destinations seeded`);
}

async function sembrarPaquetes() {
  console.log("\nSeeding packages...");
  for (const [i, p] of PACKAGES.entries()) {
    const { error } = await supabase.from("packages").upsert(
      {
        slug: p.slug,
        name_es: p.name.es,
        name_en: p.name.en,
        name_pt: p.name.pt,
        description_es: p.description.es,
        description_en: p.description.en,
        description_pt: p.description.pt,
        duration_es: p.duration.es,
        duration_en: p.duration.en,
        duration_pt: p.duration.pt,
        price: p.price,
        image_url: p.image,
        tour_slugs: p.tourSlugs,
        status: "published",
        sort_order: i + 1,
      },
      { onConflict: "slug" }
    );
    if (error) console.error(`  Error on package ${p.slug}:`, error.message);
  }
  console.log(`  ${PACKAGES.length} packages seeded`);
}

async function sembrarResenas() {
  console.log("\nSeeding reviews...");
  const { count } = await supabase.from("reviews").select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0) {
    console.log("  Ya hay reseñas en la base de datos; no se tocan.");
    return;
  }

  const { error } = await supabase.from("reviews").insert(
    REVIEWS.map((r, i) => ({
      author: r.name,
      country: r.country,
      rating: r.rating,
      text_es: r.text.es,
      text_en: r.text.en,
      text_pt: r.text.pt,
      tour_slug: r.tourSlug ?? null,
      status: "published",
      sort_order: i + 1,
    }))
  );
  if (error) console.error("  Error on reviews:", error.message);
  else console.log(`  ${REVIEWS.length} reviews seeded`);
}

seed().catch(console.error);
