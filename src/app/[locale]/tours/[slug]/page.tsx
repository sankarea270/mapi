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
  Shield,
  Zap,
  Heart,
  X,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getCategoriesWithTours } from "@/lib/tours";
import { whatsappLink, siteConfig } from "@/config/site";
import { pickLocalized, formatPrice } from "@/lib/format";
import { buildMetadata, pageUrl } from "@/lib/seo";
import { DESTINATIONS } from "@/data/destinations";
import { REVIEWS } from "@/data/reviews";
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
  return buildMetadata({
    locale,
    title: name,
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
  const destination = DESTINATIONS.find((d) =>
    d.categorySlugs?.includes(tour.categorySlug)
  );
  const related = tour.categorySlug
    ? categories
        .find((c) => c.slug === tour.categorySlug)
        ?.tours.filter((t) => t.slug !== tour.slug)
        .slice(0, 3) ?? []
    : [];

  const tourReviews = REVIEWS.filter((r) => r.tourSlug === tour.slug);
  const allReviews = tourReviews.length > 0 ? tourReviews : REVIEWS;

  const t = await getTranslations("tourDetail");
  const tn = await getTranslations("nav");
  const l = locale as "es" | "en" | "pt";
  const name = pickLocalized(tour.name, l);
  const categoryName = category ? pickLocalized(category.name, l) : "";
  const duration = pickLocalized(tour.duration, l);
  const gallery =
    tour.gallery && tour.gallery.length > 0 ? tour.gallery : [tour.image];

  const url = pageUrl(`/tours/${tour.slug}`, locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description: tour.excerpt ? pickLocalized(tour.excerpt, l) : undefined,
    image: gallery.map((img) => img.replace("/600/600", "/1200/630")),
    url,
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
      name: `${siteConfig.name} ${siteConfig.nameSuffix}`,
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

  const highlights = [
    { icon: Shield, label: t("highlightGuia") },
    { icon: Users, label: t("highlightGrupo") },
    { icon: Zap, label: t("highlightConfirmacion") },
    { icon: Heart, label: t("highlightExperiencia") },
  ];

  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <Image
          src={tour.image}
          alt={name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="mx-auto max-w-7xl">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-2 text-sm text-white/70"
            >
              <Link
                href="/tours"
                className="inline-flex items-center gap-1.5 font-semibold text-white/80 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-4" />
                {t("breadcrumb")}
              </Link>
              <span>/</span>
              {categoryName && (
                <>
                  <Link
                    href={`/tours?categoria=${tour.categorySlug}`}
                    className="font-medium text-white/80 transition-colors hover:text-white"
                  >
                    {categoryName}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="font-semibold text-white" aria-current="page">
                {name}
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              {category && (
                <span className="rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-lg shadow-amber-400/30">
                  {categoryName}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                <Star className="size-3.5 fill-current text-amber-400" />
                {tour.rating.toFixed(1)}
              </span>
            </div>

            <h1 className="mt-4 max-w-4xl font-heading text-5xl font-medium tracking-tight text-white sm:text-6xl lg:text-7xl">
              {name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4 text-amber-400" />
                {duration}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-amber-400" />
                {destination
                  ? pickLocalized(destination.name, l)
                  : categoryName}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="size-4 text-amber-400" />
                {t("highlightGrupo")}
              </span>
              <span className="font-heading text-2xl font-bold text-amber-300 sm:text-3xl">
                {formatPrice(tour.price, l, "USD")}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappLink(
                  `Hola, me interesa el tour "${name}" (${formatPrice(tour.price, l, "USD")}). ¿Me pueden dar más información?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-7 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition-all hover:scale-105 hover:shadow-xl"
              >
                <MessageCircle className="size-4" />
                {t("book")}
              </a>
              <Link
                href="#reservar"
                className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 px-7 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
              >
                {t("reserveSidebar")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            {tour.excerpt && (
              <div className="mb-10 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 p-6 sm:p-8">
                <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                  {pickLocalized(tour.excerpt, l)}
                </p>
              </div>
            )}

            <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-amber-100"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
                    <h.icon className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{h.label}</p>
                </div>
              ))}
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
                      {/* Ficha de datos: rotulo en versalita sobre el dato,
                          separados por filete. Sustituye a las cuatro cajas
                          con icono en cuadrado, que no aportaban informacion
                          que el propio rotulo no diera ya. */}
                      <dl className="grid grid-cols-2 gap-x-10 border-y border-slate-200 sm:grid-cols-4">
                        {[
                          { k: t("duration"), v: duration },
                          { k: t("highlightGrupo"), v: t("smallGroups") },
                          {
                            k: t("tabLocation"),
                            v: destination
                              ? pickLocalized(destination.name, l)
                              : categoryName,
                          },
                          { k: t("rating"), v: `${tour.rating.toFixed(1)} / 5` },
                        ].map((item, index) => (
                          <div
                            key={item.k}
                            style={{ ["--i" as string]: index }}
                            className="rise-in py-5"
                          >
                            <dt className="eyebrow text-slate-400">{item.k}</dt>
                            <dd className="mt-1.5 font-heading text-lg font-bold text-slate-900">
                              {item.v}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      {tour.included && tour.included.length > 0 && (
                        <div className="mt-10">
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
                        <div className="route-line absolute bottom-2 left-[7px] top-2 w-px" />
                        <ol>
                          {tour.itinerary && tour.itinerary.length > 0 ? (
                            tour.itinerary.map((item, index) => (
                              <li
                                key={index}
                                style={{ ["--i" as string]: index }}
                                className="rise-in group relative flex gap-6 pb-9 last:pb-0"
                              >
                                <span
                                  aria-hidden="true"
                                  className="relative z-10 mt-1.5 size-[15px] shrink-0 rounded-full border-2 border-white bg-teal-600 ring-1 ring-teal-600 transition-colors group-hover:bg-amber-500 group-hover:ring-amber-500"
                                />
                                <div className="flex-1">
                                  <p className="eyebrow text-teal-700">
                                    {t("day")} {index + 1}
                                  </p>
                                  <h3 className="mt-1.5 font-heading text-lg font-bold text-slate-900">
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
    </div>
  );
}
