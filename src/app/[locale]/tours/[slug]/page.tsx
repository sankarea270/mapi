import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Star,
  Calendar,
  Compass,
  Map as MapIcon,
  MessageSquare,
  Route,
  Sun,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getCategoriesWithTours } from "@/lib/tours";
import { siteConfig } from "@/config/site";
import { enlaceWhatsapp } from "@/config/ajustes";
import { pickLocalized, formatPrice } from "@/lib/format";
import { buildMetadata, pageUrl } from "@/lib/seo";
import { getAjustes, getDestinations, getExperiences, getPackages, getReviews } from "@/lib/content";
import { construirFichas, esDe, fichaDe } from "@/lib/resenas";
import { SeasonPanel } from "@/components/tours/SeasonPanel";
import { MosaicoFotos } from "@/components/tours/MosaicoFotos";
import { FranjaDatos } from "@/components/tours/FranjaDatos";
import { TourFaq } from "@/components/tours/TourFaq";
import { TourCard } from "@/components/tours/TourCard";
import { FichaSecciones } from "@/components/tours/FichaSecciones";
import { RutaItinerario } from "@/components/tours/RutaItinerario";
import { TarjetaResena } from "@/components/reviews/TarjetaResena";
import { BloqueUbicacion } from "@/components/tours/BloqueUbicacion";
import { cn } from "@/lib/utils";
import { TourSidebar } from "@/components/tours/TourSidebar";

export async function generateStaticParams() {
  const categories = await getCategoriesWithTours();
  const tours = categories.flatMap((c) => c.tours);
  return routing.locales.flatMap((locale) =>
    tours.map((tour) => ({ locale, slug: tour.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const categories = await getCategoriesWithTours();
  const tour = categories.flatMap((c) => c.tours).find((t) => t.slug === slug);
  if (!tour) return {};
  const name = pickLocalized(tour.name, locale);
  const description = tour.excerpt
    ? pickLocalized(tour.excerpt, locale)
    : undefined;
  /* La duración va en el título porque es el primer filtro mental de quien
     compara tours ("de 1 día", "4 días"), y porque estira títulos de 20
     caracteres hasta acercarse a los 60 que Google muestra. El precio NO:
     quedaría congelado en el título en cuanto se actualice la tarifa. */
  const t = await getTranslations({ locale, namespace: "tourDetail" });
  /* La duración solo se añade si el resultado sigue cabiendo. Google recorta
     el título alrededor de los 60 caracteres —y a la plantilla hay que
     descontarle el " · GoToMapi" que añade el layout—, así que en los tours
     de nombre largo la coletilla no aportaría nada: se cortaría antes de
     leerse y además dejaría el nombre a medias. */
  const conDuracion = t("seoTitle", { name, duration: pickLocalized(tour.duration, locale) });
  const CABE = 60 - " · GoToMapi".length;

  return buildMetadata({
    locale,
    title: conDuracion.length <= CABE ? conDuracion : name,
    description,
    path: `/tours/${tour.slug}`,
    image: tour.image,
  });
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const categories = await getCategoriesWithTours();
  const tour = categories
    .flatMap((c) => c.tours)
    .find((t) => t.slug === slug);

  if (!tour) notFound();

  const category = categories.find((c) => c.slug === tour.categorySlug);
  const [destinos, resenas, paquetes, experiencias, ajustes] = await Promise.all([
    getDestinations(),
    getReviews(),
    getPackages(),
    getExperiences(),
    getAjustes(),
  ]);
  const destination = destinos.find((d) =>
    d.categorySlugs?.includes(tour.categorySlug)
  );
  const related = tour.categorySlug
    ? categories
        .find((c) => c.slug === tour.categorySlug)
        ?.tours.filter((t) => t.slug !== tour.slug)
        .slice(0, 3) ?? []
    : [];

  const tourReviews = resenas.filter((r) => esDe(r, "tour", tour.slug));

  const t = await getTranslations("tourDetail");
  const tReserva = await getTranslations("reserva");
  const tn = await getTranslations("nav");
  const l = locale as "es" | "en" | "pt";
  const name = pickLocalized(tour.name, l);
  const categoryName = category ? pickLocalized(category.name, l) : "";
  const duration = pickLocalized(tour.duration, l);
  const gallery =
    tour.gallery && tour.gallery.length > 0 ? tour.gallery : [tour.image];

  const url = pageUrl(`/tours/${tour.slug}`, locale);

  /*
   * Valoración para Google (las estrellas del resultado de búsqueda).
   *
   * Solo se declara si el tour tiene reseñas PROPIAS, y con la media de
   * esas reseñas, no con el campo `rating` de la ficha.
   *
   * La tentación es usar `tour.rating` en los 70 tours y llenar Google de
   * estrellas. Sería inventarse datos: las directrices de Google exigen que
   * la valoración proceda de reseñas reales y visibles en esa misma página.
   * Declararlas sin tenerlas es motivo de acción manual —desaparecen los
   * resultados enriquecidos de TODO el sitio, no solo de esa página—, y
   * además engaña a quien busca.
   *
   * Hoy salen 6 de 70. La forma de que salgan más es recoger reseñas y
   * cargarlas desde el panel, no bajar el listón aquí.
   */
  const valoracion =
    tourReviews.length > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: (
            tourReviews.reduce((a, r) => a + r.rating, 0) / tourReviews.length
          ).toFixed(1),
          reviewCount: tourReviews.length,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

  /* Migas de pan: hacen que Google enseñe "Tours › Machu Picchu › …" bajo
     el título en vez de la URL cruda. */
  const migas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: t("breadcrumb"), url: pageUrl("/tours", locale) },
      ...(categoryName
        ? [{ name: categoryName, url: pageUrl(`/tours?categoria=${tour.categorySlug}`, locale) }]
        : []),
      { name, url },
    ].map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: x.name,
      item: x.url,
    })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description: tour.excerpt ? pickLocalized(tour.excerpt, l) : undefined,
    image: gallery.map((img) => img.replace("/600/600", "/1200/630")),
    url,
    ...(valoracion ? { aggregateRating: valoracion } : {}),
    touristType: ["Turismo cultural", "Aventura", "Naturaleza"],
    itinerary: tour.itinerary
      ? {
          "@type": "ItemList",
          itemListElement: tour.itinerary.map((day, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "TouristAttraction",
              name: pickLocalized(day.title, l),
            },
          })),
        }
      : undefined,
    provider: {
      "@type": "TravelAgency",
      name: siteConfig.fullName,
      url: pageUrl("/", locale),
      telephone: ajustes.telefono,
    },
    offers: {
      "@type": "Offer",
      price: tour.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  /*
   * La ficha técnica sale de los datos de ESTE tour.
   *
   * Antes llevaba cuatro casillas y tres eran frases fijas de las
   * traducciones: «Salida diaria», «Máx. 12 personas» y «Español · Inglés ·
   * Portugués», iguales en los 73 tours. El tour privado decía que el grupo
   * era de doce y el trek de cuatro días que la salida era diaria. Ahora cada
   * casilla se calcula de la ficha, y la que no tiene dato no sale.
   */
  const paradas = tour.itinerary?.length ?? 0;
  const servicios = tour.included?.length ?? 0;
  /* Solo el destino. Sin él se caía a la categoría, y el rafting salía con
     «Región: Aventura», que es un tipo de tour, no un sitio. */
  const region = destination ? pickLocalized(destination.name, l) : "";
  const datos = [
    { icono: <Clock />, rotulo: t("duration"), valor: duration },
    ...(region ? [{ icono: <MapPin />, rotulo: t("region"), valor: region }] : []),
    ...(paradas > 0
      ? [{ icono: <Route />, rotulo: t("itinerary"), valor: t("stages", { count: paradas }) }]
      : []),
    ...(servicios > 0
      ? [{ icono: <Check />, rotulo: t("includes"), valor: t("services", { count: servicios }) }]
      : []),
  ];

  /* De qué viaje habla cada reseña, para cuando se enseñan las de otros
     tours: sin esto parecerían escritas sobre este. */
  const fichas = construirFichas(l, { categorias: categories, paquetes, experiencias });

  const propias = tourReviews.length > 0;
  const resenasVisibles = propias ? tourReviews : resenas.slice(0, 4);

  const secciones = [
    { id: "resumen", label: t("navSummary"), icon: <Compass /> },
    { id: "itinerario", label: paradas > 0 ? t("itinerary") : t("navFaq"), icon: <Calendar /> },
    { id: "temporada", label: t("tabSeason"), icon: <Sun /> },
    { id: "ubicacion", label: t("tabLocation"), icon: <MapIcon /> },
    { id: "resenas", label: t("tabReviews"), icon: <MessageSquare /> },
  ];

  /* Cada sección se clava justo por debajo de la cabecera y del índice. */
  const seccion =
    "ficha-seccion scroll-mt-[calc(var(--alto-cabecera,8.25rem)+5.5rem)] border-t border-slate-200 py-12 sm:py-14";

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Cabecera sobre fondo claro, con las fotos a plena luz.
          Antes esto era una portada a sangre de 70vh con el título encima.
          Ese patrón obliga a oscurecer la foto para que el texto se lea
          —o sea, a enseñar apagada la mejor imagen del tour— y empuja el
          precio y la reserva fuera de la primera pantalla. */}
      <section className="border-b border-slate-200 bg-white">
        {/* Más ancha que el resto de la página (7xl): el mosaico gana aire
            sin llegar a pegarse a los bordes de la ventana. */}
        <div className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 sm:py-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-slate-400"
          >
            <Link
              href="/tours"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              {t("breadcrumb")}
            </Link>
            <span aria-hidden>/</span>
            {categoryName && (
              <>
                <Link
                  href={`/tours?categoria=${tour.categorySlug}`}
                  className="font-medium text-slate-500 transition-colors hover:text-slate-900"
                >
                  {categoryName}
                </Link>
                <span aria-hidden>/</span>
              </>
            )}
            <span className="font-semibold text-slate-700" aria-current="page">
              {name}
            </span>
          </nav>

          {/* Título y datos de identidad. El precio no está aquí: vive en el
              billete de reserva, que es donde se actúa sobre él. Repetirlo
              en dos sitios obliga a mantenerlos sincronizados a mano. */}
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="min-w-0">
              <h1 className="max-w-3xl font-heading text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
                {name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-current text-amber-500" />
                  <span className="font-bold text-slate-900">{tour.rating.toFixed(1)}</span>
                  <span className="text-slate-400">/ 5</span>
                </span>
                <span className="h-3 w-px bg-slate-200" aria-hidden />
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-slate-400" />
                  {destination ? pickLocalized(destination.name, l) : categoryName}
                </span>
              </div>
            </div>

            <a
              href={enlaceWhatsapp(
                ajustes,
                `Hola, me interesa el tour "${name}" (${formatPrice(tour.price, l, "USD")}). ¿Me pueden dar más información?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              /* Teal del logotipo (#036564 = teal-600) en vez del verde
                 corporativo de WhatsApp: el botón es de la agencia, no de
                 la app, y el verde ajeno chirriaba junto a la marca. El
                 icono ya dice por dónde se contacta. */
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-teal-600 px-6 text-sm font-bold text-white transition-colors hover:bg-teal-700"
            >
              <MessageCircle className="size-4" />
              {t("book")}
            </a>
          </div>

          <div className="mt-7">
            <MosaicoFotos fotos={gallery} nombre={name} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            {/* Ficha técnica, justo bajo las fotos: lo primero que se
                pregunta quien mira un tour, sin tener que buscarlo. */}
            <FranjaDatos className="mb-8" datos={datos} />

            <FichaSecciones ariaLabel={t("tabsAria")} secciones={secciones} />

            {/* Sin pestañas: todo seguido y a la vista. La banda de «01 02 03
                04» que había aquí se quita. Eran cuatro promesas iguales en
                todos los tours, numeradas sin que hubiera orden que contar, y
                una de ellas —«Confirmación inmediata»— contradecía al panel
                de reserva, que dice que la confirmación llega en menos de 24
                horas. */}
            <section id="resumen" className={cn(seccion, "border-t-0 pt-10")}>
              {tour.excerpt && (
                <p className="border-l-2 border-teal-500 pl-6 font-logo text-xl leading-relaxed text-slate-700 sm:text-[1.4rem] sm:leading-relaxed">
                  {pickLocalized(tour.excerpt, l)}
                </p>
              )}

              {tour.included && tour.included.length > 0 && (
                <div className={tour.excerpt ? "mt-12" : undefined}>
                  <div className="escena-texto">
                    <h2 className="font-heading text-2xl font-bold text-slate-900">
                      {t("included")}
                    </h2>
                  </div>
                  <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
                    {tour.included.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-baseline gap-3 border-b border-slate-200/80 py-3.5"
                      >
                        <Check className="size-3.5 shrink-0 translate-y-0.5 text-teal-600" />
                        <span className="text-[15px] leading-relaxed text-slate-700">
                          {pickLocalized(item, l)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section id="itinerario" className={seccion}>
              {paradas > 0 && (
                <>
                  <div className="escena-texto">
                    <h2 className="font-heading text-2xl font-bold text-slate-900">
                      {t("itinerary")}
                    </h2>
                    <p className="mt-2 text-[15px] text-slate-500">{t("planSubtitle")}</p>
                  </div>

                  <div className="mt-8">
                    <RutaItinerario>
                      <ol>
                        {tour.itinerary!.map((item, index) => (
                          <li
                            key={index}
                            data-parada
                            className="group relative flex gap-6 pb-9 last:pb-0"
                          >
                            {/* Hoja de calendario: se enciende en petróleo
                                cuando la línea de ruta llega a ella.
                                `self-start`, o la fila flexible la estira
                                hasta el alto del texto del día y la hoja
                                se convierte en una caja vacía de 200px. */}
                            <span
                              aria-hidden="true"
                              className="day-leaf relative z-10 w-14 shrink-0 self-start overflow-hidden rounded-md bg-white text-center ring-1 ring-slate-200"
                            >
                              <span className="day-leaf-cab block py-1 text-[9px] font-bold uppercase tracking-[0.14em]">
                                {t("day")}
                              </span>
                              <span className="block py-1.5 font-heading text-xl font-bold tabular-nums text-slate-900">
                                {index + 1}
                              </span>
                            </span>
                            <div className="flex-1 pt-1">
                              <h3 className="font-heading text-lg font-bold text-slate-900">
                                {pickLocalized(item.title, l)}
                              </h3>
                              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                                {pickLocalized(item.description, l)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </RutaItinerario>
                  </div>
                </>
              )}

              <div className={paradas > 0 ? "mt-14" : undefined}>
                <TourFaq tour={tour} locale={locale} bookingPolicy={tReserva("noPayment")} />
              </div>
            </section>

            <section id="temporada" className={seccion}>
              <SeasonPanel categorySlug={tour.categorySlug} locale={locale} />
            </section>

            <section id="ubicacion" className={seccion}>
              <div className="escena-texto">
                <h2 className="font-heading text-2xl font-bold text-slate-900">
                  {t("tabLocation")}
                </h2>
                <p className="mt-2 text-[15px] text-slate-500">{t("locationSubtitle")}</p>
              </div>

              {/* El mapa y el texto propios del tour, cargados desde el panel;
                  sin ellos, la foto y la descripción del destino. */}
              <BloqueUbicacion
                mapa={tour.locationImage}
                foto={destination?.image ?? tour.image}
                titulo={region || name}
                texto={
                  tour.location
                    ? pickLocalized(tour.location, l)
                    : destination
                      ? pickLocalized(destination.description, l)
                      : `${name} · ${duration}`
                }
                enlace={
                  destination
                    ? { href: `/destinos/${destination.slug}`, texto: t("locationVisit") }
                    : undefined
                }
                rotuloAmpliar={t("mapZoom")}
              />
            </section>

            <section id="resenas" className={seccion}>
              <div className="escena-texto">
                <h2 className="font-heading text-2xl font-bold text-slate-900">
                  {t("tabReviews")}
                </h2>
                {/* Si el tour no tiene reseñas propias se dice. Antes se
                    colgaban las de otros tours bajo «lo que dicen los
                    viajeros que ya vivieron esta experiencia»: una opinión
                    sobre Machu Picchu aparecía en la ficha del rafting como
                    si fuera de ahí. Ahora van presentadas como lo que son, y
                    cada una lleva el viaje del que habla. */}
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">
                  {propias ? t("reviewsSubtitle") : t("noOwnReviews")}
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {resenasVisibles.map((review) => (
                  <TarjetaResena
                    key={review.id}
                    review={review}
                    locale={locale}
                    ficha={propias ? undefined : fichaDe(review, fichas)}
                  />
                ))}
              </div>
            </section>

            {related.length > 0 && (
              <section className="mt-16 border-t border-slate-200 pt-12">
                <h2 className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl">
                  {t("related")}
                </h2>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((item) => (
                    <TourCard
                      key={item.slug}
                      tour={item}
                      categoryName={categoryName}
                      locale={locale}
                      fromLabel={tn("from")}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <TourSidebar
            tour={tour}
            name={name}
            categoryName={categoryName}
            locale={locale}
          />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(migas) }}
      />
    </div>
  );
}
