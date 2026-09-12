import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { whatsappLink, siteConfig, siteEmail, socials } from "@/config/site";
import { buildMetadata, LOGO_URL } from "@/lib/seo";
import { pickLocalized } from "@/lib/format";
import { getDestinations, getReviews, getHeroSlides, getPackages } from "@/lib/content";
import { getCategoriesWithTours } from "@/lib/tours";
import { climateForCategory } from "@/data/climate";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { SocialFeed } from "@/components/social/SocialFeed";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ToursPackagesCarousel } from "@/components/home/ToursPackagesCarousel";
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
  /* Los nombres cortos de mes ya están traducidos para el panel de clima;
     se reutilizan en vez de duplicarlos. */
  const tSeason = await getTranslations("season");
  const resenas = await getReviews();
  const [categorias, destinos, slidesPortada, paquetes] = await Promise.all([
    getCategoriesWithTours(),
    getDestinations(),
    getHeroSlides(),
    getPackages(),
  ]);

  /* Destacados para la tira de debajo de la portada.
     Los marcados van primero y el resto se completa con los mejor
     valorados. No es un adorno: hoy hay UN solo tour marcado, y una tira
     de una tarjeta sola no se lee como una selección, se lee como algo
     que falló al cargar. */
  const todos = categorias.flatMap((c) => c.tours);
  const porNota = [...todos].sort((a, b) => b.rating - a.rating);
  const destacados = [
    ...porNota.filter((t) => t.featured),
    ...porNota.filter((t) => !t.featured),
  ]
    .slice(0, 8)
    /* Se traduce aquí, al compilar. El carrusel es de cliente —arrastre y
       giro automático— y mandarle los textos en los tres idiomas para que
       elija uno sería enviar al navegador el triple de lo que va a usar. */
    .map((tour) => ({
      slug: tour.slug,
      nombre: pickLocalized(tour.name, locale),
      duracion: pickLocalized(tour.duration, locale),
      precio: tour.price,
      imagen: tour.image,
    }));

  /* Solo los destinos que ya tienen tours: una rueda que gira hasta un
     destino sin nada que reservar frustra en vez de invitar. */
  /* La clave es `months`, no `monthsShort`: esa no existe. Con la que no
     existe, `raw()` devolvía la propia ruta de la clave y al indexarla se
     sacaban LETRAS sueltas —"Mejor época: s – n"—, no meses. */
  const mesesCortos = tSeason.raw("months") as string[];

  const paraRueda = destinos
    .map((x) => {
      const tours = categorias
        .filter((c) => x.categorySlugs?.includes(c.slug))
        .reduce((n, c) => n + c.tours.length, 0);

      /* Los dos datos de clima salen de la ficha de la región, que ya existe
         en el proyecto y se usa en cada tour. No se inventa ninguno: si
         hiciera falta un dato que no está —los días recomendados, por
         ejemplo— la casilla se quedaría fuera antes que rellenarse a ojo. */
      const clima = climateForCategory(x.categorySlugs?.[0] ?? "");
      const grados = Math.round(
        clima.months.reduce((n, m) => n + m.tMax, 0) / clima.months.length
      );
      const mejores = [...clima.best].sort((a, b) => a - b);
      const mejorEpoca =
        mejores.length === 0
          ? "—"
          : mejores.length === 1
            ? mesesCortos[mejores[0]]
            : `${mesesCortos[mejores[0]]} – ${mesesCortos[mejores[mejores.length - 1]]}`;

      return {
        slug: x.slug,
        nombre: pickLocalized(x.name, locale),
        descripcion: pickLocalized(x.description, locale),
        imagen: x.image,
        tours,
        grados,
        mejorEpoca,
      };
    })
    .filter((x) => x.tours > 0 && x.imagen);

  const fotoRevela = paraRueda[0]?.imagen ?? null;

  /*
   * La ficha del catálogo de la que habla cada reseña.
   *
   * Las reseñas ya traían `tourSlug` y el panel ya pedía ese dato —«tour al
   * que se refiere»—, pero no se pintaba en ninguna parte: la opinión salía
   * flotando, sin decir de qué viaje hablaba. Y cinco de las seis apuntaban
   * a slugs inexistentes, cosa que nadie notó porque nada los seguía.
   *
   * Se resuelve AQUÍ, al compilar, y contra el catálogo de verdad: si el
   * slug no existe la reseña sale sin enlace. Un enlace roto en una sección
   * que se titula «opiniones reales» es peor que ninguno.
   *
   * Se miran tours y paquetes porque hay reseñas que hablan de un circuito
   * —«hicimos el circuito del Sur del Perú»—, y un circuito es un paquete.
   */
  const fichas: Record<string, { nombre: string; imagen: string; href: string }> = {};
  for (const c of categorias) {
    for (const tour of c.tours) {
      fichas[tour.slug] = {
        nombre: pickLocalized(tour.name, locale),
        imagen: tour.image,
        href: `/tours/${tour.slug}`,
      };
    }
  }
  for (const x of paquetes) {
    fichas[x.slug] = {
      nombre: pickLocalized(x.name, locale),
      imagen: x.image,
      href: `/paquetes/${x.slug}`,
    };
  }

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
    /* `logo` es lo que Google usa para poner una marca junto al resultado.
       Sin él elige lo que encuentre por el dominio, y aquí llegó a salir un
       logotipo que no era el nuestro. `image` va también porque parte de las
       fichas de resultado leen esa y no la otra. */
    logo: LOGO_URL,
    image: LOGO_URL,
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
          <HeroCarousel slides={slidesPortada} />

          {/* Orden de capas: foto (z-10) -> velo -> neblina (z-11) -> texto
              (z-20) -> controles (z-30). La neblina va ENCIMA del velo porque
              debe leerse densa y luminosa; debajo, el 70% de negro del velo
              en la base la apagaría. A cambio, los bancos opacos se quedan
              por debajo de la fila de botones y solo suben jirones finos. */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/70" />
          <CloudLayer />

          {/* Composición calcada de la referencia: volante GRANDE en blanco,
              titular enorme en el color de marca, entradilla en romana y dos
              llamadas —una maciza y otra subrayada—. Todo a la izquierda: el
              centrado obliga a que cada línea empiece en un sitio distinto y
              es lo que hace que una portada parezca una plantilla.

              El volante ya no es el rótulo diminuto y muy espaciado de antes.
              En la referencia mide casi la mitad que el titular y es lo que
              hace que el bloque se lea como una frase encabalgada y no como
              una etiqueta suelta encima de un título. */}
          <div className="portada-caja relative z-20 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-28">
            <div className="max-w-3xl">
              <p
                className="portada-volante font-heading text-[1.4rem] font-bold uppercase leading-none tracking-[0.01em] text-white sm:text-[1.9rem] lg:text-[2.2rem]"
                style={{ animation: "text-reveal 0.8s ease-out both 0.2s" }}
              >
                {t("eyebrow")}
              </p>

              {/* El titular va en ámbar y no en blanco porque en la
                  referencia el titular lleva el color de la marca; es lo que
                  separa la portada de cualquier foto con un texto encima.
                  Sobre el velo oscuro el ámbar da 8.9:1, de sobra. */}
              <h1
                className="portada-titular mt-3 font-heading text-[3rem] font-bold uppercase leading-[0.88] text-amber-400 sm:text-7xl lg:text-[6rem]"
                style={{ animation: "text-reveal 0.8s ease-out both 0.4s" }}
              >
                {t("title")}
              </h1>

              {/* Entradilla en romana, como la referencia. Es la misma
                  familia del logotipo, así que no entra ninguna fuente nueva
                  por esto, y el contraste entre la condensada de palo seco y
                  la romana es justo lo que hace que el bloque respire. */}
              <p
                className="mt-6 max-w-xl font-logo text-lg leading-relaxed text-slate-100 sm:mt-8 sm:text-2xl"
                style={{ animation: "text-reveal 0.8s ease-out both 0.6s" }}
              >
                {t("subtitle")}
              </p>

              <div
                className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-6 sm:mt-10"
                style={{ animation: "text-reveal 0.8s ease-out both 0.8s" }}
              >
                <Link
                  href="/tours"
                  className="bg-amber-500 px-10 py-4 font-heading text-sm font-bold uppercase tracking-[0.12em] text-slate-950 transition-all hover:bg-amber-400 hover:scale-[1.02]"
                >
                  {t("ctaTours")}
                </Link>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b-2 border-white/50 pb-1 font-heading text-sm font-bold uppercase tracking-[0.12em] text-white transition-all hover:border-amber-400 hover:text-amber-300"
                >
                  {t("ctaContact")}
                </a>
              </div>
            </div>
          </div>

          {/* Fila de pie de la referencia: un dato a cada lado y el aviso de
              seguir bajando en medio. Se oculta por debajo de `lg` porque en
              un móvil se comería el sitio que necesitan los botones. */}
          <div className="portada-pie absolute inset-x-0 bottom-7 z-20 mx-auto hidden max-w-7xl items-end justify-between px-6 lg:flex">
            <div>
              <p className="flex items-center gap-3 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                <span aria-hidden className="h-px w-7 bg-white/40" />
                {t("pie.selloTitulo")}
              </p>
              <p className="mt-1.5 font-heading text-lg font-bold uppercase tracking-[0.02em] text-white">
                {t("pie.selloDato")}
              </p>
            </div>

            <span
              aria-hidden
              className="mb-1 grid h-9 w-[22px] place-items-start rounded-full border border-white/45 pt-1.5"
            >
              <span className="portada-rueda block size-1 rounded-full bg-white/85" />
            </span>

            <div className="text-right">
              <p className="flex items-center justify-end gap-3 font-logo text-sm text-white/60">
                {t("pie.contactoTitulo")}
                <span aria-hidden className="h-px w-7 bg-white/40" />
              </p>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 block font-heading text-lg font-bold uppercase tracking-[0.02em] text-white transition-colors hover:text-amber-300"
              >
                {siteConfig.phone.display}
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Los sellos, en tira baja nada más pasar la portada. Estaban al
          final, después de las reseñas; se suben aquí porque es donde los
          pone la referencia y donde despejan la duda antes de que empiece a
          mirar tours, no después de haberlo decidido todo. */}
      <Credentials variant="banda" locale={locale} />

      {/* Los destacados del catálogo, no una muestra fija: es lo primero que
          se ve al bajar. */}
      <ToursPackagesCarousel tours={destacados} />

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
      <ReviewsSection reviews={resenas} fichas={fichas} />
    </Escena>
    <JourneyBand />
    </>
  );
}
