import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getExperiences, getReviews } from "@/lib/content";
import { construirFichas, esDe, fichaDe } from "@/lib/resenas";
import { TarjetaResena } from "@/components/reviews/TarjetaResena";
import { Link } from "@/i18n/navigation";
import { getCategoriesWithTours } from "@/lib/tours";
import { pickLocalized } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { TourCard } from "@/components/tours/TourCard";

/* Dirección de relleno para cuando no hay ninguna experiencia publicada. */
const SIN_EXPERIENCIAS = "sin-experiencias";

/* Asíncrona: la lista sale de Supabase al compilar, no de un archivo. */
export async function generateStaticParams() {
  const lista = await getExperiences();
  /* Con la exportación estática, una ruta dinámica que devuelve CERO páginas
     tumba la compilación entera («missing generateStaticParams»). Las
     experiencias pueden quedarse a cero —se borraron las de relleno y aún no
     hay propias—, así que en ese caso se genera una sola página que responde
     «no encontrada» y que nada enlaza. */
  const slugs = lista.length > 0 ? lista.map((e) => e.slug) : [SIN_EXPERIENCIAS];
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const lista = await getExperiences();
  const experience = lista.find((e) => e.slug === slug);
  if (!experience) return {};
  return buildMetadata({
    locale,
    title: pickLocalized(experience.name, locale),
    description: pickLocalized(experience.description, locale),
    path: `/experiencias/${experience.slug}`,
    image: experience.image,
  });
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const lista = await getExperiences();
  setRequestLocale(locale);

  const experience = lista.find((e) => e.slug === slug);
  if (!experience) notFound();

  const categories = await getCategoriesWithTours();
  const bySlug = new Map(categories.flatMap((c) => c.tours).map((t) => [t.slug, t]));
  const tours = experience.tourSlugs
    .map((tourSlug) => bySlug.get(tourSlug))
    .filter((tour) => tour !== undefined);

  const t = await getTranslations("experiencias");
  const tn = await getTranslations("nav");
  const tt = await getTranslations("tourDetail");

  /* Las reseñas asignadas a esta experiencia en el panel, y detrás las de
     sus tours con el nombre del tour del que hablan. */
  const resenas = await getReviews();
  const fichas = construirFichas(locale, { categorias: categories });
  const propias = resenas.filter((r) => esDe(r, "experiencia", experience.slug));
  const deSusTours = resenas.filter((r) => tours.some((x) => esDe(r, "tour", x!.slug)));
  const resenasExperiencia = [...propias, ...deSusTours];
  const name = pickLocalized(experience.name, locale);

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="relative bg-slate-950">
        <div className="absolute inset-0">
          <Image
            src={experience.image}
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
            href="/experiencias"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            {t("back")}
          </Link>
          <h1 className="mt-6 max-w-2xl font-heading text-3xl font-bold text-white sm:text-5xl">
            {name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
            {pickLocalized(experience.description, locale)}
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
              const category = categories.find((c) => c.slug === tour!.categorySlug);
              return (
                <TourCard
                  key={tour!.slug}
                  tour={tour!}
                  categoryName={category ? pickLocalized(category.name, locale) : ""}
                  locale={locale}
                  fromLabel={tn("from")}
                />
              );
            })}
          </div>
        )}
      </section>

      {resenasExperiencia.length > 0 && (
        <section className="mx-auto max-w-7xl border-t border-slate-200 px-4 py-12 sm:px-6">
          <div className="escena-texto">
            <h2 className="font-heading text-2xl font-bold text-slate-900">{tt("tabReviews")}</h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">
              {propias.length > 0 ? tt("reviewsSubtitle") : t("reviewsFromTours")}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resenasExperiencia.map((review) => (
              <TarjetaResena
                key={review.id}
                review={review}
                locale={locale}
                ficha={propias.includes(review) ? undefined : fichaDe(review, fichas)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}