import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getCategoriesWithTours } from "@/lib/tours";
import { getDestinationTours } from "@/lib/destinations";
import { getDestinations } from "@/lib/content";
import { pickLocalized } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { TourCard } from "@/components/tours/TourCard";

/* Asíncrona: la lista de destinos sale de Supabase al compilar, así que
   hay que esperarla antes de saber qué páginas generar. */
export async function generateStaticParams() {
  const destinos = await getDestinations();
  return routing.locales.flatMap((locale) =>
    destinos.map((destination) => ({ locale, slug: destination.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const destination = (await getDestinations()).find((d) => d.slug === slug);
  if (!destination) return {};
  /* "Cusco" son 16 caracteres de los ~60 que Google enseña, y nadie busca
     "Cusco" para reservar: busca "tours en Cusco", "qué ver en Cusco",
     "Cusco precios". El título los recoge sin dejar de ser cierto. */
  const t = await getTranslations({ locale, namespace: "destinos" });
  return buildMetadata({
    locale,
    title: t("seoTitle", { name: pickLocalized(destination.name, locale) }),
    description: pickLocalized(destination.description, locale),
    path: `/destinos/${destination.slug}`,
    image: destination.image,
  });
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const destination = (await getDestinations()).find((d) => d.slug === slug);
  if (!destination) notFound();

  const categories = await getCategoriesWithTours();
  const tours = getDestinationTours(destination, categories);
  const t = await getTranslations("destinos");
  const tn = await getTranslations("nav");
  const name = pickLocalized(destination.name, locale);

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="relative bg-slate-950">
        <div className="absolute inset-0">
          <Image
            src={destination.image}
            alt={name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <Link
            href="/destinos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            {t("back")}
          </Link>
          <p className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
            <MapPin className="size-3.5" />
            {t("toursCount", { count: tours.length })}
          </p>
          <h1 className="mt-2 max-w-2xl font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
            {pickLocalized(destination.description, locale)}
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {tours.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-base text-slate-600">{t("empty")}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tours.map((tour) => {
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
    </div>
  );
}