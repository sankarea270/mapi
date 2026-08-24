import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarRange } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PACKAGES } from "@/data/packages";
import { getCategoriesWithTours } from "@/lib/tours";
import { whatsappLink } from "@/config/site";
import { pickLocalized, formatPrice } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { TourCard } from "@/components/tours/TourCard";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PACKAGES.map((pkg) => ({ locale, slug: pkg.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const pkg = PACKAGES.find((p) => p.slug === slug);
  if (!pkg) return {};
  return buildMetadata({
    locale,
    title: pickLocalized(pkg.name, locale),
    description: pickLocalized(pkg.description, locale),
    path: `/paquetes/${pkg.slug}`,
    image: pkg.image,
  });
}

export default async function PackagePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const pkg = PACKAGES.find((p) => p.slug === slug);
  if (!pkg) notFound();

  const categories = await getCategoriesWithTours();
  const bySlug = new Map(categories.flatMap((c) => c.tours).map((t) => [t.slug, t]));
  const tours = pkg.tourSlugs
    .map((tourSlug) => bySlug.get(tourSlug))
    .filter((tour) => tour !== undefined);

  const t = await getTranslations("paquetes");
  const tn = await getTranslations("nav");
  const name = pickLocalized(pkg.name, locale);

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="relative bg-slate-950">
        <div className="absolute inset-0">
          <Image
            src={pkg.image}
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
            href="/paquetes"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            {t("back")}
          </Link>
          <p className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
            <CalendarRange className="size-3.5" />
            {pickLocalized(pkg.duration, locale)}
          </p>
          <h1 className="mt-2 max-w-2xl font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
            {pickLocalized(pkg.description, locale)}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <p className="text-3xl font-extrabold text-white">
              {formatPrice(pkg.price, locale, "USD")}
              <span className="text-base font-semibold text-slate-300"> · {tn("from")}</span>
            </p>
            <a
              href={whatsappLink(
                `Hola, me interesa el paquete "${name}" (${formatPrice(pkg.price, locale, "USD")}). ¿Me pueden dar más información?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-amber-400 px-7 py-3 text-sm font-bold text-slate-900 shadow-md shadow-amber-400/20 transition-colors hover:bg-amber-300"
            >
              {t("book")}
            </a>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="font-heading text-2xl font-bold text-slate-900">{t("includedTours")}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </section>
    </div>
  );
}