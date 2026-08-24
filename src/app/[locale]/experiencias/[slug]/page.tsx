import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { EXPERIENCES } from "@/data/experiences";
import { getCategoriesWithTours } from "@/lib/tours";
import { pickLocalized } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { TourCard } from "@/components/tours/TourCard";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    EXPERIENCES.map((experience) => ({ locale, slug: experience.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const experience = EXPERIENCES.find((e) => e.slug === slug);
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
  setRequestLocale(locale);

  const experience = EXPERIENCES.find((e) => e.slug === slug);
  if (!experience) notFound();

  const categories = await getCategoriesWithTours();
  const bySlug = new Map(categories.flatMap((c) => c.tours).map((t) => [t.slug, t]));
  const tours = experience.tourSlugs
    .map((tourSlug) => bySlug.get(tourSlug))
    .filter((tour) => tour !== undefined);

  const t = await getTranslations("experiencias");
  const tn = await getTranslations("nav");
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
          <h1 className="mt-6 max-w-2xl font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
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
    </div>
  );
}