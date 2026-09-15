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
      {/* La foto con sus colores. Antes iba al 50% sobre el fondo verde de la
          marca y con un degradado hasta verde macizo: todas las cabeceras
          salían teñidas. Ahora solo hay una sombra neutra y transparente
          abajo, donde va el texto. */}
      <div className="relative flex min-h-[26rem] flex-col justify-end bg-neutral-900 sm:min-h-[32rem] lg:min-h-[36rem]">
        <div className="absolute inset-0">
          <Image
            src={destination.image}
            alt={name}
            fill
            priority
            sizes="100vw"
            quality={90}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/10" />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-16 [text-shadow:0_1px_3px_rgb(0_0_0/0.45)] sm:px-6 sm:pb-14 sm:pt-24">
          <Link
            href="/destinos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 transition-colors hover:text-amber-300"
          >
            <ArrowLeft className="size-4" />
            {t("back")}
          </Link>
          <p className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
            <MapPin className="size-3.5" />
            {t("toursCount", { count: tours.length })}
          </p>
          <h1 className="mt-2 max-w-2xl font-heading text-3xl font-bold text-white sm:text-5xl">
            {name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
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