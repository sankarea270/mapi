import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
/* `Map` se importa con alias: el nombre ya lo ocupa el Map de JavaScript,
   que se usa unas líneas más abajo para indexar los tours por slug. */
import { ArrowLeft, CalendarRange, Languages, Map as MapaIcono, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getPackages } from "@/lib/content";
import { getCategoriesWithTours } from "@/lib/tours";
import { whatsappLink } from "@/config/site";
import { pickLocalized, formatPrice } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { TourCard } from "@/components/tours/TourCard";
import { MosaicoFotos } from "@/components/tours/MosaicoFotos";
import { FranjaDatos } from "@/components/tours/FranjaDatos";

/* Asíncrona: los paquetes salen de Supabase al compilar. */
export async function generateStaticParams() {
  const paquetes = await getPackages();
  return routing.locales.flatMap((locale) =>
    paquetes.map((pkg) => ({ locale, slug: pkg.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const pkg = (await getPackages()).find((p) => p.slug === slug);
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

  const pkg = (await getPackages()).find((p) => p.slug === slug);
  if (!pkg) notFound();

  const categories = await getCategoriesWithTours();
  const bySlug = new Map(categories.flatMap((c) => c.tours).map((t) => [t.slug, t]));
  const tours = pkg.tourSlugs
    .map((tourSlug) => bySlug.get(tourSlug))
    .filter((tour) => tour !== undefined);

  const t = await getTranslations("paquetes");
  const tn = await getTranslations("nav");
  const tt = await getTranslations("tourDetail");
  const name = pickLocalized(pkg.name, locale);

  /* El mosaico se arma con la foto del paquete y las de sus tours: enseña de
     verdad lo que incluye el viaje, y evita que un paquete quede reducido a
     una sola imagen repetida. Se quitan duplicados por si la del paquete
     coincide con la de alguno de sus tours. */
  const fotos = [...new Set([pkg.image, ...tours.map((x) => x!.image)])].filter(Boolean);

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Misma cabecera que la ficha de tour: fondo claro y fotos a plena
          luz. El mosaico se compone con la imagen del paquete y las de los
          tours que lo forman —que es literalmente lo que se compra— en vez
          de repetir una sola foto oscurecida a pantalla completa. */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-slate-400"
          >
            <Link
              href="/paquetes"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              {t("back")}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-semibold text-slate-700" aria-current="page">
              {name}
            </span>
          </nav>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="min-w-0">
              <h1 className="max-w-3xl font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {name}
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                {pickLocalized(pkg.description, locale)}
              </p>
            </div>

            <div className="flex shrink-0 items-end gap-5">
              <div>
                <p className="eyebrow text-slate-400">{tn("from")}</p>
                <p className="mt-1 font-heading text-3xl font-bold text-slate-900">
                  {formatPrice(pkg.price, locale, "USD")}
                </p>
              </div>
              <a
                href={whatsappLink(
                  `Hola, me interesa el paquete "${name}" (${formatPrice(pkg.price, locale, "USD")}). ¿Me pueden dar más información?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center rounded-md bg-amber-500 px-6 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-400"
              >
                {t("book")}
              </a>
            </div>
          </div>

          <div className="mt-7">
            <MosaicoFotos fotos={fotos} nombre={name} />
          </div>

          <FranjaDatos
            className="mt-8"
            datos={[
              {
                icono: <CalendarRange />,
                rotulo: tt("duration"),
                valor: pickLocalized(pkg.duration, locale),
              },
              {
                icono: <MapaIcono />,
                rotulo: t("includedTours"),
                valor: String(tours.length),
              },
              { icono: <Users />, rotulo: tt("groupSize"), valor: tt("smallGroups") },
              { icono: <Languages />, rotulo: tt("languages"), valor: tt("languagesValue") },
            ]}
          />
        </div>
      </section>

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