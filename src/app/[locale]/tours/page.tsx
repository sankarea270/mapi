import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getCategoriesWithTours } from "@/lib/tours";
import { getAjustes } from "@/lib/content";
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

  const [categories, ajustes] = await Promise.all([getCategoriesWithTours(), getAjustes()]);
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
      <ToursBrowser
        categories={categories}
        locale={locale}
        fromLabel={tn("from")}
        fondoGeneral={ajustes.fondoTours}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}