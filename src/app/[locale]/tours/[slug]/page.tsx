import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Star,
  Users,
  Calendar,
  Compass,
  Camera,
  Map,
  MessageSquare,
  Languages,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getCategoriesWithTours } from "@/lib/tours";
import { whatsappLink, siteConfig } from "@/config/site";
import { pickLocalized, formatPrice } from "@/lib/format";
import { buildMetadata, pageUrl } from "@/lib/seo";
import { getDestinations } from "@/lib/content";
import { SeasonPanel } from "@/components/tours/SeasonPanel";
import { MosaicoFotos } from "@/components/tours/MosaicoFotos";
import { FranjaDatos } from "@/components/tours/FranjaDatos";
import { TourFaq } from "@/components/tours/TourFaq";
import { getReviews } from "@/lib/content";
import { TourCard } from "@/components/tours/TourCard";
import { TourTabs } from "@/components/tours/TourTabs";
import { TourSidebar } from "@/components/tours/TourSidebar";
import { TourDetailClient } from "@/components/tours/TourDetailClient";

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
  const [destinos, resenas] = await Promise.all([getDestinations(), getReviews()]);
  const destination = destinos.find((d) =>
    d.categorySlugs?.includes(tour.categorySlug)
  );
  const related = tour.categorySlug
    ? categories
        .find((c) => c.slug === tour.categorySlug)
        ?.tours.filter((t) => t.slug !== tour.slug)
        .slice(0, 3) ?? []
    : [];

  const tourReviews = resenas.filter((r) => r.tourSlug === tour.slug);
  const allReviews = tourReviews.length > 0 ? tourReviews : resenas;

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
      telephone: siteConfig.phone.display,
    },
    offers: {
      "@type": "Offer",
      price: tour.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  /* Sin iconos: cuatro promesas cortas, numeradas. Shield/Users/Zap/Heart
     no añadían nada que el propio texto no dijera ya. */
  const highlights = [
    t("highlightGuia"),
    t("highlightGrupo"),
    t("highlightConfirmacion"),
    t("highlightExperiencia"),
  ];

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
              <h1 className="max-w-3xl font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
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
              href={whatsappLink(
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
                pregunta quien mira un tour —cuánto dura, con quién voy, en
                qué idioma— sin tener que entrar en ninguna pestaña. */}
            <FranjaDatos
              className="mb-10"
              datos={[
                { icono: <Clock />, rotulo: t("duration"), valor: duration },
                { icono: <Compass />, rotulo: t("tourType"), valor: t("tourTypeDaily") },
                { icono: <Users />, rotulo: t("groupSize"), valor: t("smallGroups") },
                { icono: <Languages />, rotulo: t("languages"), valor: t("languagesValue") },
              ]}
            />

            {/* Entradilla: texto grande con filete turquesa, como el sumario
                de un reportaje. La píldora con degradado que había antes
                encajonaba el texto y competía con la ficha de datos. */}
            {tour.excerpt && (
              <p className="mb-10 border-l-2 border-teal-500 pl-6 text-lg leading-relaxed text-slate-700 sm:text-xl sm:leading-relaxed">
                {pickLocalized(tour.excerpt, l)}
              </p>
            )}

            {/* Banda de compromisos. El turquesa de marca pasa aquí a primer
                plano y ancla el bloque; las promesas van numeradas y
                separadas por filete, sin iconos. */}
            <div className="promise-band mb-12 overflow-hidden rounded-lg bg-teal-700">
              <div className="grid divide-y divide-white/15 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
                {highlights.map((label, i) => (
                  <div
                    key={label}
                    style={{ ["--i" as string]: i }}
                    className="promise rise-in group relative px-6 py-5 sm:[&:nth-child(-n+2)]:border-b sm:[&:nth-child(-n+2)]:border-white/15 sm:[&:nth-child(2n)]:border-l sm:[&:nth-child(2n)]:border-white/15 lg:border-b-0! lg:[&:nth-child(2n)]:border-l-0"
                  >
                    <span className="eyebrow tabular-nums text-teal-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-2 font-heading text-[15px] font-bold leading-snug text-white">
                      {label}
                    </p>
                    <span className="absolute inset-x-6 bottom-3 h-px origin-left scale-x-0 bg-amber-400 transition-transform duration-500 group-hover:scale-x-100" />
                  </div>
                ))}
              </div>
            </div>

            <TourTabs
              ariaLabel={t("tabsAria")}
              tabs={[
                {
                  id: "info",
                  label: t("tabInfo"),
                  icon: <Compass className="size-4" />,
                  content: (
                    <div>
                      {/* La ficha de datos que había aquí se subió bajo las
                          fotos: repetirla dentro de la pestaña era enseñar
                          dos veces lo mismo en la misma pantalla. */}
                      {tour.included && tour.included.length > 0 && (
                        <div>
                          <h2 className="font-heading text-2xl font-bold text-slate-900">
                            {t("included")}
                          </h2>
                          {/* Lista a dos columnas separada por filetes, en
                              lugar de tarjetas con degradado: se lee como una
                              ficha impresa y deja respirar el contenido. */}
                          <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
                            {tour.included.map((item, index) => (
                              <li
                                key={index}
                                style={{ ["--i" as string]: index }}
                                className="rise-in flex items-baseline gap-3 border-b border-slate-100 py-3.5"
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

                      <div className="mt-12">
                        <SeasonPanel
                          categorySlug={tour.categorySlug}
                          locale={locale}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  id: "plan",
                  label: t("tabPlan"),
                  icon: <Calendar className="size-4" />,
                  content: (
                    <div>
                      <p className="mb-6 text-sm font-medium text-slate-500">
                        {t("planSubtitle")}
                      </p>
                      {/* Itinerario como línea de ruta: un trazo continuo con
                          una parada por día. La metáfora es un mapa de ruta,
                          no una pila de tarjetas. */}
                      <div className="relative">
                        <div className="route-line absolute bottom-4 left-[27px] top-6 w-px" />
                        <ol>
                          {tour.itinerary && tour.itinerary.length > 0 ? (
                            tour.itinerary.map((item, index) => (
                              <li
                                key={index}
                                style={{ ["--i" as string]: index }}
                                className="rise-in group relative flex gap-6 pb-9 last:pb-0"
                              >
                                {/* Hoja de calendario: cabecera con el rótulo
                                    del día y cifra grande debajo. Da la
                                    referencia temporal de un vistazo, cosa
                                    que un punto en la línea no hacía. */}
                                <span
                                  aria-hidden="true"
                                  className="day-leaf relative z-10 w-14 shrink-0 overflow-hidden rounded-md bg-white text-center ring-1 ring-slate-200"
                                >
                                  <span className="block bg-slate-900 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
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
                            ))
                          ) : (
                            <li className="text-sm text-slate-500">
                              {t("planSubtitle")}
                            </li>
                          )}
                        </ol>
                      </div>

                      <TourFaq
                        tour={tour}
                        locale={locale}
                        bookingPolicy={tReserva("noPayment")}
                      />
                    </div>
                  ),
                },
                {
                  id: "location",
                  label: t("tabLocation"),
                  icon: <Map className="size-4" />,
                  content: (
                    <div>
                      <p className="mb-6 text-sm font-medium text-slate-500">
                        {t("locationSubtitle")}
                      </p>
                      {destination ? (
                        <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-100">
                          <div className="relative aspect-[21/9] bg-slate-100">
                            <Image
                              src={destination.image}
                              alt={pickLocalized(destination.name, l)}
                              fill
                              sizes="(max-width: 1024px) 100vw, 60vw"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-6">
                              <h2 className="flex items-center gap-2 font-heading text-2xl font-bold text-white">
                                <MapPin className="size-5 text-amber-400" />
                                {pickLocalized(destination.name, l)}
                              </h2>
                            </div>
                          </div>
                          <div className="p-6">
                            <p className="text-sm leading-relaxed text-slate-600">
                              {pickLocalized(destination.description, l)}
                            </p>
                            <Link
                              href={`/destinos/${destination.slug}`}
                              className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-md shadow-amber-400/20 transition-all hover:scale-105 hover:shadow-lg"
                            >
                              {t("locationVisit")}
                              <ArrowLeft className="size-4 -scale-x-100" />
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-100">
                          <div className="relative aspect-[21/9] bg-slate-100">
                            <Image
                              src={tour.image}
                              alt={name}
                              fill
                              sizes="(max-width: 1024px) 100vw, 60vw"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-6">
                              <h2 className="flex items-center gap-2 font-heading text-2xl font-bold text-white">
                                <MapPin className="size-5 text-amber-400" />
                                {categoryName || name}
                              </h2>
                            </div>
                          </div>
                          <div className="p-6">
                            <p className="text-sm text-slate-600">
                              {name} · {duration}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  id: "gallery",
                  label: t("tabGallery"),
                  icon: <Camera className="size-4" />,
                  content: (
                    <TourDetailClient
                      gallery={gallery}
                      name={name}
                    />
                  ),
                },
                {
                  id: "reviews",
                  label: t("tabReviews"),
                  icon: <MessageSquare className="size-4" />,
                  content: (
                    <div>
                      <p className="mb-6 text-sm font-medium text-slate-500">
                        {t("reviewsSubtitle")}
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {allReviews.map((review) => (
                          <figure
                            key={review.id}
                            className="flex flex-col rounded-3xl bg-gradient-to-br from-slate-50 to-white p-6 ring-1 ring-slate-100 transition-all hover:shadow-lg hover:ring-amber-100"
                          >
                            <div
                              className="flex gap-1"
                              role="img"
                              aria-label={`${review.rating} / 5`}
                            >
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                  key={index}
                                  className={`size-4 ${
                                    index < Math.round(review.rating)
                                      ? "fill-current text-amber-400"
                                      : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                              &ldquo;{review.text[l]}&rdquo;
                            </blockquote>
                            <figcaption className="mt-5 flex items-center gap-3">
                              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 text-sm font-bold text-white shadow-md shadow-amber-400/20">
                                {review.name.charAt(0)}
                              </span>
                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  {review.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {review.country}
                                </p>
                              </div>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  ),
                },
              ]}
            />

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
