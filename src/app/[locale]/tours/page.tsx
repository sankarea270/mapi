import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getCategoriesWithTours } from "@/lib/tours";
import { pickLocalized } from "@/lib/format";
import { buildMetadata, pageUrl } from "@/lib/seo";
import { ToursBrowser } from "@/components/tours/ToursBrowser";

// Force static rendering
export const dynamic = 'force-static';

const PER_PAGE = 12;

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

  const categories = await getCategoriesWithTours();
  const allTours = categories.flatMap((c) => c.tours);

  // El JSON-LD se genera en el build con el orden por defecto (mejor valorados).
  const featured = [...allTours].sort((a, b) => b.rating - a.rating).slice(0, PER_PAGE);

  const t = await getTranslations("tours");
  const tn = await getTranslations("nav");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("title"),
    itemListElement: featured.map((tour, index) => ({
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
        <ToursBrowser categories={categories} locale={locale} fromLabel={tn("from")} />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}