import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronDown, MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getCategoriesWithTours } from "@/lib/tours";
import { getDestinationTours } from "@/lib/destinations";
import { getDestinations } from "@/lib/content";
import { pickLocalized } from "@/lib/format";
import { buildMetadata, pageUrl } from "@/lib/seo";
import { Migas } from "@/components/layout/Migas";
import { JsonLd } from "@/components/seo/JsonLd";
import { TourCard } from "@/components/tours/TourCard";
import { SeasonPanel } from "@/components/tours/SeasonPanel";
import { GUIAS_DESTINO } from "@/data/destinos-guia";

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
  const guia = GUIAS_DESTINO[destination.slug];
  /* Solo se enlazan los tours que existen hoy: si uno se retira desde el
     panel, su enlace desaparece en vez de llevar a un 404. */
  const existentes = new Set(categories.flatMap((c) => c.tours.map((x) => x.slug)));
  const clima = destination.categorySlugs?.[0];

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

  /* Las preguntas van visibles más abajo; el FAQPage solo repite lo que ya
     está en la página, que es lo que pide Google. */
  const preguntasLd = guia
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guia.preguntas.map((p) => ({
          "@type": "Question",
          name: pickLocalized(p.pregunta, locale),
          acceptedAnswer: { "@type": "Answer", text: pickLocalized(p.respuesta, locale) },
        })),
      }
    : undefined;

  return (
    <div className="min-h-dvh bg-slate-50">
      <JsonLd data={destinoLd} />
      {preguntasLd && <JsonLd data={preguntasLd} />}
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
      {guia && (
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
            <p className="font-logo text-xl leading-relaxed text-slate-700 sm:text-[1.4rem] sm:leading-relaxed">
              {pickLocalized(guia.intro[0], locale)}
            </p>
            {guia.intro.slice(1).map((parrafo, i) => (
              <p key={i} className="mt-5 text-base leading-relaxed text-slate-600">
                {pickLocalized(parrafo, locale)}
              </p>
            ))}
          </div>
        </section>
      )}

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

      {guia && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
              {t("guideTitle", { name })}
            </h2>

            <h3 className="mt-10 font-heading text-xl font-bold text-slate-900 sm:text-2xl">
              {t("whatToSee")}
            </h3>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guia.queVer.map((lugar) => (
                <li
                  key={lugar.nombre.es}
                  className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="font-heading text-lg font-bold text-slate-900">
                    {pickLocalized(lugar.nombre, locale)}
                  </p>
                  {/* `text-left`: en una tarjeta tan estrecha el justificado de
                      la web abría huecos grandes entre palabras. */}
                  <p className="mt-2 flex-1 text-left text-[15px] leading-relaxed text-slate-600">
                    {pickLocalized(lugar.texto, locale)}
                  </p>
                  {lugar.tour && existentes.has(lugar.tour) && (
                    <Link
                      href={`/tours/${lugar.tour}`}
                      className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-bold text-teal-700 transition-colors hover:text-teal-900"
                    >
                      {t("seeTour")}
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900 sm:text-2xl">
                  {t("whenToGo")}
                </h3>
                {guia.cuandoIr.map((parrafo, i) => (
                  <p key={i} className="mt-4 text-base leading-relaxed text-slate-600">
                    {pickLocalized(parrafo, locale)}
                  </p>
                ))}
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900 sm:text-2xl">
                  {t("gettingThere")}
                </h3>
                {guia.comoLlegar.map((parrafo, i) => (
                  <p key={i} className="mt-4 text-base leading-relaxed text-slate-600">
                    {pickLocalized(parrafo, locale)}
                  </p>
                ))}
              </div>
            </div>

            {/* El clima mes a mes de la región, el mismo panel de las fichas
                de tour: el «cuándo ir» con datos y no solo con palabras. */}
            {clima && (
              <div className="mt-12 max-w-4xl">
                <SeasonPanel categorySlug={clima} locale={locale} />
              </div>
            )}

            {/* `<details>` y no un acordeón de JavaScript: la respuesta está en
                el HTML desde el principio, plegada, y Google la lee. */}
            <h3 className="mt-14 font-heading text-xl font-bold text-slate-900 sm:text-2xl">
              {t("faqTitle")}
            </h3>
            <div className="mt-6 max-w-3xl divide-y divide-slate-200 border-y border-slate-200">
              {guia.preguntas.map((p) => (
                <details key={p.pregunta.es} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 font-heading text-[17px] font-bold leading-snug text-slate-900 transition-colors hover:text-teal-700 [&::-webkit-details-marker]:hidden">
                    {pickLocalized(p.pregunta, locale)}
                    <ChevronDown
                      className="mt-0.5 size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </summary>
                  <p className="pb-5 pr-10 text-[15px] leading-relaxed text-slate-600">
                    {pickLocalized(p.respuesta, locale)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}