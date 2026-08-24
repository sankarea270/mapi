import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCategoriesWithTours } from "@/lib/tours";
import { pickLocalized, tourDurationBucket } from "@/lib/format";
import { buildMetadata, pageUrl } from "@/lib/seo";
import { TourCard } from "@/components/tours/TourCard";
import { FilterBar } from "@/components/tours/FilterBar";

// Force static rendering
export const dynamic = 'force-static';

const PER_PAGE = 12;
const SORTS = ["rating", "price-asc", "price-desc", "name"] as const;
const DURATION_BUCKETS = ["1", "2", "3", "4+"] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tours" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("subtitle"),
    path: "/tours",
  });
}

interface ToursPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ToursPage({ params }: ToursPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Static defaults for generation
  const q = "";
  const categorySlug = "";
  const orden: string = "rating";
  const duracion = "";
  const maxPrice = 0;
  const minRating = 0;
  const page = 1;

  const categories = await getCategoriesWithTours();
  const allTours = categories.flatMap((c) => c.tours);

  const normalized = q.toLocaleLowerCase(locale).trim();
  const filtered = allTours.filter((tour) => {
    const matchesCategory = !categorySlug || tour.categorySlug === categorySlug;
    const matchesQuery =
      !normalized ||
      [tour.name.es, tour.name.en, tour.name.pt, tour.slug]
        .join(" ")
        .toLocaleLowerCase(locale)
        .includes(normalized);
    const matchesDuration = !duracion || tourDurationBucket(tour) === duracion;
    const matchesPrice = !maxPrice || tour.price <= maxPrice;
    const matchesRating = !minRating || tour.rating >= minRating;
    return matchesCategory && matchesQuery && matchesDuration && matchesPrice && matchesRating;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (orden) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return pickLocalized(a.name, locale).localeCompare(pickLocalized(b.name, locale), locale);
      default:
        return b.rating - a.rating;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const t = await getTranslations("tours");
  const tn = await getTranslations("nav");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("title"),
    itemListElement: visible.map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "TouristTrip",
        name: pickLocalized(tour.name, locale),
        url: pageUrl(`/tours/${tour.slug}`, locale),
        image: tour.image,
        offers: {
          "@type": "Offer",
          price: tour.price,
          priceCurrency: "USD",
        },
      },
    })),
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            {t("found", { count: allTours.length })}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500">{t("subtitle")}</p>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <FilterBar
          categories={categories}
          locale={locale}
          initialQuery={q}
          initialCategory={categorySlug}
          initialSort={orden}
          initialDuration={duracion}
          initialMaxPrice={maxPrice ? String(maxPrice) : ""}
          initialMinRating={minRating ? String(minRating) : ""}
        />

        <p className="mt-8 text-sm font-medium text-slate-500">
          {t("results", { count: sorted.length })}
        </p>

        {visible.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-base text-slate-600">{t("empty")}</p>
            <Link
              href="/tours"
              className="mt-4 inline-block rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            >
              {t("reset")}
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((tour) => {
              const category = categories.find((c) => c.slug === tour.categorySlug);
              return (
                <TourCard
                  key={tour.slug}
                  tour={tour}
                  categoryName={category ? pickLocalized(category.name, locale) : ""}
                  locale={locale}
                  fromLabel={tn("from")}
                />
              );
            })}
          </div>
        )}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}