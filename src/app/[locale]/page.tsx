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
import { RevelaScroll } from "@/components/home/RevelaScroll";
import { Escena } from "@/components/home/Escena";

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

  const fotoRevela = paraRueda[0]?.imagen ?? null;

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
          className="relative flex min-h-[92dvh] items-center overflow-hidden bg-slate-950"
        >
          <HeroCarousel />

          {/* Orden de capas: foto (z-10) -> velo -> neblina (z-11) -> texto
              (z-20) -> controles (z-30). La neblina va ENCIMA del velo porque
              debe leerse densa y luminosa; debajo, el 70% de negro del velo
              en la base la apagaría. A cambio, los bancos opacos se quedan
              por debajo de la fila de botones y solo suben jirones finos. */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/70" />
          <CloudLayer />

          {/* Composición de la referencia: rótulo pequeño, titular enorme en
              caja alta, entradilla estrecha y dos llamadas —una maciza y otra
              subrayada—. Todo alineado a la izquierda y no centrado: el
              centrado obliga a que cada línea empiece en un sitio distinto y
              es lo que hace que una portada parezca una plantilla. */}
          <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-28 sm:px-6">
            <div className="max-w-3xl">
              <p
                className="eyebrow text-amber-400 tracking-[0.2em] uppercase text-sm font-semibold mb-6"
                style={{ animation: "text-reveal 0.8s ease-out both 0.2s" }}
              >
                {t("eyebrow")}
              </p>

              <h1
                className="mt-2 font-heading text-[3.5rem] font-bold uppercase leading-[0.9] tracking-tighter text-white sm:text-7xl lg:text-[6rem]"
                style={{ animation: "text-reveal 0.8s ease-out both 0.4s" }}
              >
                {t("title")}
              </h1>

              <p
                className="mt-8 max-w-xl text-lg leading-relaxed text-slate-200 sm:text-xl font-light"
                style={{ animation: "text-reveal 0.8s ease-out both 0.6s" }}
              >
                {t("subtitle")}
              </p>

              <div
                className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-6"
                style={{ animation: "text-reveal 0.8s ease-out both 0.8s" }}
              >
                <Link
                  href="/tours"
                  className="bg-amber-500 px-10 py-4 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-amber-400 hover:scale-[1.02]"
                >
                  {t("ctaTours")}
                </Link>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-white/40 pb-1 text-xs font-bold uppercase tracking-widest text-white transition-all hover:border-amber-400 hover:text-amber-300"
                >
                  {t("ctaContact")}
                </a>
              </div>
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
    {/* Cada bloque va clavado: se queda quieto en pantalla mientras se
        recorre su pista y las animaciones de dentro suceden sobre él.
        El fondo de cada `Escena` repite el de su sección para que no
        asomen franjas del color del cuerpo por arriba y por abajo. */}
    <Escena>
      <WhyTravelWith foto={fotoViajero ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${fotoViajero}` : null} />
    </Escena>
    <Escena>
      <RuedaDestinos destinos={paraRueda} />
    </Escena>
    {fotoRevela && <RevelaScroll foto={fotoRevela} />}
    <Escena fondo="bg-slate-950">
      <SocialFeed />
    </Escena>
    <Escena>
      <ReviewsSection reviews={resenas} />
    </Escena>
    <Escena fondo="bg-slate-50">
      <Credentials variant="strip" locale={locale} />
    </Escena>
    <JourneyBand />
    </>
  );
}
