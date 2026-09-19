import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarRange,
  Map as MapIcon,
  MapPin,
  MessageSquare,
  Route,
  Sun,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getAjustes, getDestinations, getPackages, getReviews } from "@/lib/content";
import { getCategoriesWithTours } from "@/lib/tours";
import { enlaceWhatsapp } from "@/config/ajustes";
import { pickLocalized, formatPrice } from "@/lib/format";
import { buildMetadata, pageUrl } from "@/lib/seo";
import { Migas } from "@/components/layout/Migas";
import { JsonLd } from "@/components/seo/JsonLd";
import { agenciaRef } from "@/lib/jsonld";
import { TourCard } from "@/components/tours/TourCard";
import { MosaicoFotos } from "@/components/tours/MosaicoFotos";
import { FranjaDatos } from "@/components/tours/FranjaDatos";
import { FichaSecciones } from "@/components/tours/FichaSecciones";
import { TarjetaResena } from "@/components/reviews/TarjetaResena";
import { BloqueUbicacion } from "@/components/tours/BloqueUbicacion";
import { construirFichas, esDe, fichaDe } from "@/lib/resenas";
import { SeasonPanel } from "@/components/tours/SeasonPanel";
import { cn } from "@/lib/utils";

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

  const [destinos, resenas, ajustes] = await Promise.all([getDestinations(), getReviews(), getAjustes()]);

  /*
   * Las regiones que recorre, sacadas de sus tours: cada tour pertenece a una
   * categoría y cada destino declara qué categorías cubre. Es el dato que
   * de verdad distingue un paquete de otro —«Cusco · Puno · Arequipa»—, y
   * sustituye a dos casillas que eran frases fijas: «Máx. 12 personas» y
   * «Español · Inglés · Portugués», iguales en todos los paquetes.
   */
  const regiones = [
    ...new Set(
      tours.map((x) => {
        const d = destinos.find((dd) => dd.categorySlugs?.includes(x!.categorySlug));
        if (d) return pickLocalized(d.name, locale);
        const c = categories.find((cc) => cc.slug === x!.categorySlug);
        return c ? pickLocalized(c.name, locale) : "";
      })
    ),
  ].filter(Boolean);

  const datos = [
    {
      icono: <CalendarRange />,
      rotulo: tt("duration"),
      valor: pickLocalized(pkg.duration, locale),
    },
    ...(tours.length > 0
      ? [{ icono: <Route />, rotulo: t("includedTours"), valor: t("toursValue", { count: tours.length }) }]
      : []),
    ...(regiones.length > 0
      ? [{ icono: <MapPin />, rotulo: t("regions"), valor: regiones.join(" · ") }]
      : []),
  ];

  /* Primero las reseñas del PAQUETE —las que se asignaron a él en el
     panel—, y detrás las de los tours que lo forman, que llevan el nombre
     del tour del que hablan: no se atribuyen al paquete, porque quien las
     escribió compró un tour suelto. */
  const fichas = construirFichas(locale, { categorias: categories });
  const propias = resenas.filter((r) => esDe(r, "paquete", pkg.slug));
  const deSusTours = resenas.filter((r) =>
    tours.some((x) => esDe(r, "tour", x!.slug))
  );
  const resenasPaquete = [...propias, ...deSusTours];

  const conUbicacion = Boolean(pkg.locationImage || pkg.location);

  const secciones = [
    ...(tours.length > 0
      ? [{ id: "tours", label: t("includedTours"), icon: <Route /> }]
      : []),
    ...(tours.length > 0 ? [{ id: "temporada", label: tt("tabSeason"), icon: <Sun /> }] : []),
    ...(conUbicacion ? [{ id: "ubicacion", label: tt("tabLocation"), icon: <MapIcon /> }] : []),
    ...(resenasPaquete.length > 0
      ? [{ id: "resenas", label: tt("tabReviews"), icon: <MessageSquare /> }]
      : []),
  ];

  const seccion =
    "scroll-mt-[calc(var(--alto-cabecera,8.25rem)+5.5rem)] border-t border-slate-200 py-12 sm:py-14";

  /* Un paquete es un viaje que se compra: TouristTrip con su precio. Como en
     las fichas de tour, sin foto de relleno ni valoración inventada. */
  const paqueteLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description: pickLocalized(pkg.description, locale),
    url: pageUrl(`/paquetes/${pkg.slug}`, locale),
    ...(pkg.image && !pkg.image.includes("picsum.photos") ? { image: pkg.image } : {}),
    provider: agenciaRef,
    ...(pkg.price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: pkg.price,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: pageUrl(`/paquetes/${pkg.slug}`, locale),
          },
        }
      : {}),
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <JsonLd data={paqueteLd} />
      {/* Misma cabecera que la ficha de tour: fondo claro y fotos a plena
          luz. El mosaico se compone con la imagen del paquete y las de los
          tours que lo forman —que es literalmente lo que se compra— en vez
          de repetir una sola foto oscurecida a pantalla completa. */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 sm:py-10">
          <Migas
            locale={locale}
            migas={[{ nombre: tn("packages"), ruta: "/paquetes" }, { nombre: name }]}
          />

          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="min-w-0">
              <h1 className="max-w-3xl font-heading text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
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
                href={enlaceWhatsapp(
                  ajustes,
                  `Hola, me interesa el paquete "${name}" (${formatPrice(pkg.price, locale, "USD")}). ¿Me pueden dar más información?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                /* Mismo teal que en la ficha de tour: es la misma acción, y
                   el ámbar aquí la hacía parecer otra distinta. */
                className="inline-flex h-11 items-center gap-2 rounded-md bg-teal-600 px-6 text-sm font-bold text-white transition-colors hover:bg-teal-700"
              >
                {t("book")}
              </a>
            </div>
          </div>

          <div className="mt-7">
            <MosaicoFotos fotos={fotos} nombre={name} />
          </div>

          <FranjaDatos className="mt-8" datos={datos} />
        </div>
      </section>

      {/* Sin pestañas, como la ficha de tour: todo seguido y a la vista.
          La pestaña «Información» repetía palabra por palabra la
          descripción que ya va bajo el título, así que se quita. */}
      {secciones.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
          <FichaSecciones ariaLabel={tt("tabsAria")} secciones={secciones} />

          {tours.length > 0 && (
            <section id="tours" className={cn(seccion, "border-t-0 pt-10")}>
              <div className="escena-texto">
                <h2 className="font-heading text-2xl font-bold text-slate-900">
                  {t("includedTours")}
                </h2>
              </div>
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
          )}

          {/* El clima sale de la región del primer tour: sin tours no hay
              de dónde sacarla. */}
          {tours.length > 0 && (
            <section id="temporada" className={seccion}>
              <SeasonPanel categorySlug={tours[0]!.categorySlug} locale={locale} />
            </section>
          )}

          {conUbicacion && (
            <section id="ubicacion" className={seccion}>
              <div className="escena-texto">
                <h2 className="font-heading text-2xl font-bold text-slate-900">
                  {tt("tabLocation")}
                </h2>
              </div>
              <BloqueUbicacion
                mapa={pkg.locationImage}
                foto={pkg.image}
                titulo={regiones.join(" · ") || name}
                texto={pkg.location ? pickLocalized(pkg.location, locale) : ""}
                rotuloAmpliar={tt("mapZoom")}
              />
            </section>
          )}

          {resenasPaquete.length > 0 && (
            <section id="resenas" className={seccion}>
              <div className="escena-texto">
                <h2 className="font-heading text-2xl font-bold text-slate-900">
                  {tt("tabReviews")}
                </h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">
                  {propias.length > 0 ? tt("reviewsSubtitle") : t("reviewsFromTours")}
                </p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resenasPaquete.map((review) => (
                  <TarjetaResena
                    key={review.id}
                    review={review}
                    locale={locale}
                    /* Las del paquete no llevan pastilla: ya estás en él. */
                    ficha={propias.includes(review) ? undefined : fichaDe(review, fichas)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}