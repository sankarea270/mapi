import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarRange, MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getCategoriesWithTours } from "@/lib/tours";
import { getDestinationTours } from "@/lib/destinations";
import { getDestinations, getExperiences, getPackages } from "@/lib/content";
import { formatPrice, pickLocalized } from "@/lib/format";
import { buildMetadata, completarDescripcion, pageUrl } from "@/lib/seo";
import { Migas } from "@/components/layout/Migas";
import { JsonLd } from "@/components/seo/JsonLd";
import { TourCard } from "@/components/tours/TourCard";
import { SeasonPanel } from "@/components/tours/SeasonPanel";
import { GUIAS_DESTINO } from "@/data/destinos-guia";
import {
  Apartado,
  Lugares,
  Preguntas,
  Presentacion,
  TarjetasEnlace,
  preguntasLd,
} from "@/components/guia/BloquesGuia";
import { GUIAS_EXPERIENCIA, traducidoOGuia } from "@/data/experiencias-guia";

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
    /* La frase del panel se queda en 70-100 caracteres; se completa con la
       presentación de la guía hasta lo que Google enseña. */
    description: completarDescripcion(
      pickLocalized(destination.description, locale),
      GUIAS_DESTINO[destination.slug] ? pickLocalized(GUIAS_DESTINO[destination.slug].intro[0], locale) : ""
    ),
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

  const destinos = await getDestinations();
  const destination = destinos.find((d) => d.slug === slug);
  if (!destination) notFound();

  const [categories, paquetes, experiencias] = await Promise.all([
    getCategoriesWithTours(),
    getPackages(),
    getExperiences(),
  ]);
  const tours = getDestinationTours(destination, categories);
  const t = await getTranslations("destinos");
  const tn = await getTranslations("nav");
  const name = pickLocalized(destination.name, locale);
  const guia = GUIAS_DESTINO[destination.slug];
  /* Solo se enlazan los tours que existen hoy: si uno se retira desde el
     panel, su enlace desaparece en vez de llevar a un 404. */
  const existentes = new Set(categories.flatMap((c) => c.tours.map((x) => x.slug)));
  /* Colca, Manu, Iquitos… no tienen categoría propia y se quedaban sin el
     panel del clima; la guía dice a qué región pertenecen. */
  const clima = guia?.clima ?? destination.categorySlugs?.[0];
  /* Paquetes que pasan por aquí. Los paquetes solo se enlazaban desde su
     listado —un enlace en toda la web cada uno— y el destino es justo donde
     alguien que planea el viaje los busca. */
  const deAqui = new Set(tours.map((x) => x.slug));
  const paquetesDeAqui = paquetes.filter((p) => p.tourSlugs.some((s) => deAqui.has(s)));
  const experienciasDeAqui = experiencias
    .filter((e) => e.tourSlugs.some((s) => deAqui.has(s)))
    .map((e) => ({
      href: `/experiencias/${e.slug}`,
      nombre: traducidoOGuia(e.name, GUIAS_EXPERIENCIA[e.slug]?.nombre, locale),
      imagen: e.image,
    }));
  /* Solo destinos que existen hoy en el panel, en el orden de la guía. */
  const cercanos = (guia?.cerca ?? [])
    .map((s) => destinos.find((d) => d.slug === s))
    .filter((d) => d !== undefined)
    .map((d) => ({
      href: `/destinos/${d.slug}`,
      nombre: pickLocalized(d.name, locale),
      imagen: d.image,
    }));

  /* TouristDestination: dice a Google que la página es un lugar y no solo un
     listado de tours. Sin fotos de relleno: `image` solo si es una de verdad. */
  const destinoLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name,
    description: pickLocalized(destination.description, locale),
    url: pageUrl(`/destinos/${destination.slug}`, locale),
    ...(destination.image && !destination.image.includes("picsum.photos")
      ? { image: destination.image }
      : {}),
    containedInPlace: { "@type": "Country", name: "Perú" },
    ...(guia
      ? {
          includesAttraction: guia.queVer.map((lugar) => ({
            "@type": "TouristAttraction",
            name: pickLocalized(lugar.nombre, locale),
          })),
        }
      : {}),
  };

  const faqLd = guia ? preguntasLd(guia.preguntas, locale) : undefined;

  return (
    <div className="min-h-dvh bg-slate-50">
      <JsonLd data={destinoLd} />
      {faqLd && <JsonLd data={faqLd} />}
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

          <Migas
            locale={locale}
            sobreFoto
            migas={[{ nombre: tn("destinations"), ruta: "/destinos" }, { nombre: name }]}
          />
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

      {/* La presentación del destino, antes de los tours: quien llega desde
          Google buscando «qué ver en Cusco» lee primero de qué va el sitio. */}
      {guia && <Presentacion parrafos={guia.intro} locale={locale} />}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* «Tours en Cusco» como encabezado: es literalmente lo que se busca,
            y la lista no tenía ninguno. */}
        <h2 className="mb-8 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
          {t("toursTitle", { name })}
        </h2>
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

      {paquetesDeAqui.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <h2 className="mb-6 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
            {t("packagesTitle", { name })}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paquetesDeAqui.map((pkg) => (
              <li key={pkg.slug}>
                <Link
                  href={`/paquetes/${pkg.slug}`}
                  className="group flex h-full gap-4 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg sm:w-28">
                    <Image
                      src={pkg.image}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col justify-center py-1">
                    <p className="font-heading text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-teal-700">
                      {pickLocalized(pkg.name, locale)}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                      <CalendarRange className="size-4 shrink-0 text-amber-500" aria-hidden />
                      {pickLocalized(pkg.duration, locale)}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {tn("from")} {formatPrice(pkg.price, locale, "USD")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guia && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
              {t("guideTitle", { name })}
            </h2>

            <Lugares
              titulo={t("whatToSee")}
              lugares={guia.queVer}
              locale={locale}
              existentes={existentes}
              verTour={t("seeTour")}
            />

            <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
              <Apartado titulo={t("whenToGo")} parrafos={guia.cuandoIr} locale={locale} />
              <Apartado titulo={t("gettingThere")} parrafos={guia.comoLlegar} locale={locale} />
            </div>

            {/* El clima mes a mes de la región, el mismo panel de las fichas
                de tour: el «cuándo ir» con datos y no solo con palabras. */}
            {clima && (
              <div className="mt-12 max-w-4xl">
                <SeasonPanel categorySlug={clima} locale={locale} />
              </div>
            )}

            <Preguntas titulo={t("faqTitle")} preguntas={guia.preguntas} locale={locale} />
          </div>
        </section>
      )}

      {(experienciasDeAqui.length > 0 || cercanos.length > 0) && (
        <section className="border-t border-slate-200">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6">
            <TarjetasEnlace titulo={t("experiencesTitle", { name })} enlaces={experienciasDeAqui} />
            <TarjetasEnlace titulo={t("nearbyTitle")} enlaces={cercanos} />
          </div>
        </section>
      )}
    </div>
  );
}