import { NextResponse } from "next/server";
import { getCategoriesWithTours } from "@/lib/tours";
import { pickLocalized } from "@/lib/format";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const locale = searchParams.get("locale") ?? "es";
  const limit = Math.min(50, Number(searchParams.get("limit")) || 8);

  const categories = await getCategoriesWithTours();
  const normalized = q.toLocaleLowerCase(locale);

  const results = categories
    .flatMap((category) =>
      category.tours.map((tour) => ({
        tour,
        categoryName: pickLocalized(category.name, locale),
        categorySlug: category.slug,
      }))
    )
    .filter(({ tour, categoryName }) => {
      if (!normalized) return false;
      const haystack = [
        pickLocalized(tour.name, locale),
        pickLocalized(tour.duration, locale),
        categoryName,
        tour.slug,
      ]
        .join(" ")
        .toLocaleLowerCase(locale);
      return haystack.includes(normalized);
    })
    .slice(0, limit)
    .map(({ tour, categoryName }) => ({
      slug: tour.slug,
      name: pickLocalized(tour.name, locale),
      duration: pickLocalized(tour.duration, locale),
      price: tour.price,
      rating: tour.rating,
      image: tour.image,
      categoryName,
    }));

  return NextResponse.json({ results });
}