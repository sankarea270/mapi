import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { whatsappLink, siteConfig, siteEmail, socials } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { pickLocalized } from "@/lib/format";
import { getDestinations, getReviews } from "@/lib/content";
import { getCategoriesWithTours } from "@/lib/tours";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { SocialFeed } from "@/components/social/SocialFeed";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CloudLayer } from "@/components/home/CloudLayer";
import { JourneyBand } from "@/components/home/JourneyBand";
import { Credentials } from "@/components/about/Credentials";
import { WhyTravelWith } from "@/components/home/WhyTravelWith";
import { RuedaDestinos } from "@/components/home/RuedaDestinos";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hero");
  const resenas = await getReviews();
  const [categorias, destinos] = await Promise.all([
    getCategoriesWithTours(),
    getDestinations(),
  ]);

  /* Solo los destinos que ya tienen tours: una rueda que gira hasta un
     destino sin nada que reservar frustra en vez de invitar. */
  const paraRueda = destinos
    .map((x) => {
      const tours = categorias
        .filter((c) => x.categorySlugs?.includes(c.slug))
        .reduce((n, c) => n + c.tours.length, 0);
      return {
        slug: x.slug,
        nombre: pickLocalized(x.name, locale),
        descripcion: pickLocalized(x.description, locale),
        imagen: x.image,
        tours,
      };
    })
    .filter((x) => x.tours > 0 && x.imagen);

  /* Foto del bloque "por qué viajar con nosotros". Se busca en public/ y, si
     no está, el bloque se dibuja sin ella. Así se puede subir la foto por
     FTP o incluirla en el repositorio sin tocar código, y mientras tanto no
     queda un hueco roto ni una imagen de banco. */
  const fotoViajero =
    ["viajero.webp", "viajero.jpg", "fotos/viajero.webp"].find((n) =>
      existsSync(join(process.cwd(), "public", n))
    ) ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteConfig.fullName,
    description: t("subtitle"),
    url: buildMetadata({ locale, title: "", path: "/" }).alternates?.canonical,
    telephone: siteConfig.phone.display,
    email: siteEmail,
    address: { "@type": "PostalAddress", addressLocality: "Cusco", addressCountry: "PE" },
    sameAs: Object.values(socials).map((s) => s.href),
  };

  return (
    <>
      <div className="relative">
        <section
          data-hero-sentinel
          className="relative flex min-h-[92dvh] items-center justify-center overflow-hidden bg-slate-950"
        >
          <HeroCarousel />

          {/* Orden de capas: foto (z-10) -> velo -> neblina (z-11) -> texto
              (z-20) -> controles (z-30). La neblina va ENCIMA del velo porque
              debe leerse densa y luminosa; debajo, el 70% de negro del velo
              en la base la apagaría. A cambio, los bancos opacos se quedan
              por debajo de la fila de botones y solo suben jirones finos. */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/70" />
          <CloudLayer />

          <div className="relative z-20 mx-auto flex max-w-3xl flex-col items-center px-4 py-28 text-center">
            <h1
              className="mt-6 font-heading text-5xl font-medium leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
              style={{ animation: "text-reveal 0.8s ease-out both 0.4s" }}
            >
              <span className="bg-gradient-to-r from-slate-100 via-amber-100 to-slate-100 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </h1>
            <p
              className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg"
              style={{ animation: "text-reveal 0.8s ease-out both 0.6s" }}
            >
              {t("subtitle")}
            </p>
            <div
              className="mt-9 flex flex-col gap-3 sm:flex-row"
              style={{ animation: "text-reveal 0.8s ease-out both 0.8s" }}
            >
              <Link
                href="/tours"
                className="rounded-full bg-amber-400 px-8 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition hover:bg-amber-300 hover:scale-105"
              >
                {t("ctaTours")}
              </Link>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                // Fondo oscuro y no translúcido-claro: con texto blanco sobre
                // bg-white/10 el botón dependía de tener algo oscuro detrás y
                // desaparecía sobre la neblina (y sobre las fotos claras).
                className="rounded-full border border-white/40 bg-slate-950/45 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-slate-950/65 hover:scale-105"
              >
                {t("ctaContact")}
              </a>
            </div>
          </div>
        </section>
      </div>

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />

    {/* Los avales van al final, después de las reseñas. Nada más entrar,
        "Respaldo oficial · Autorizados y registrados" interrumpía con
        burocracia justo donde la portada tiene que enganchar. Al final, en
        cambio, cierran: quien ha llegado hasta ahí ya está valorando
        reservar, y es entonces cuando importa saber que la agencia está
        registrada. */}
    <WhyTravelWith foto={fotoViajero ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${fotoViajero}` : null} />
    <RuedaDestinos destinos={paraRueda} />
    <SocialFeed />
    <ReviewsSection reviews={resenas} />
    <Credentials variant="strip" locale={locale} />
    <JourneyBand />
    </>
  );
}
