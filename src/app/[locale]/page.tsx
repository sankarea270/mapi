import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { enlaceWhatsapp, redesConEnlace } from "@/config/ajustes";
import { buildMetadata, LOGO_URL } from "@/lib/seo";
import { pickLocalized } from "@/lib/format";
import { getAjustes, getDestinations, getExperiences, getReviews, getHeroSlides, getPackages } from "@/lib/content";
import { construirFichas } from "@/lib/resenas";
import { getTripadvisor, tripadvisorEn } from "@/lib/tripadvisor";
import { getCategoriesWithTours } from "@/lib/tours";
import { climateForCategory } from "@/data/climate";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { SocialFeed } from "@/components/social/SocialFeed";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ToursPackagesCarousel } from "@/components/home/ToursPackagesCarousel";
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
  const ajustes = await getAjustes();
  const tripadvisor = tripadvisorEn(ajustes, "inicio") ? await getTripadvisor(ajustes) : null;
  const [categorias, destinos, slidesPortada, paquetes, experiencias] = await Promise.all([
    getCategoriesWithTours(),
    getDestinations(),
    getHeroSlides(locale),
    getPackages(),
    getExperiences(),
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
   * Se miran tours, paquetes y experiencias: desde el panel una reseña se
   * puede asignar a cualquiera de los tres.
   */
  const fichas = construirFichas(locale, { categorias, paquetes, experiencias });

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
    telephone: ajustes.telefono,
    email: ajustes.correoReservas || ajustes.correo,
    address: {
      "@type": "PostalAddress",
      streetAddress: ajustes.domicilio,
      addressLocality: ajustes.ciudad,
      addressCountry: "PE",
    },
    /* Solo las redes que existen: con una dirección rota aquí, Google la
       asocia a la agencia igual. */
    sameAs: redesConEnlace(ajustes).map((s) => s.href),
  };

  return (
    <>
      <div className="relative">
        <section
          data-hero-sentinel
          className="relative flex min-h-[92dvh] items-center overflow-hidden bg-slate-950"
        >
          {/* Las fotos, el titular de cada una y las llamadas: todo va
              dentro del carrusel porque todo cambia con la foto. */}
          <HeroCarousel
            slides={slidesPortada}
            textos={{
              volante: t("eyebrow"),
              titulo: t("title"),
              subtitulo: t("subtitle"),
              ctaTours: t("ctaTours"),
              ctaContacto: t("ctaContact"),
              whatsapp: enlaceWhatsapp(ajustes),
              verDestino: t("leyenda.verDestino"),
              verTours: t("leyenda.verTours"),
            }}
          />

          {/* Fila de pie de la referencia: un dato a cada lado y el aviso de
              seguir bajando en medio. Se oculta por debajo de `lg` porque en
              un móvil se comería el sitio que necesitan los botones. */}
          <div className="portada-pie absolute inset-x-0 bottom-7 z-20 mx-auto hidden max-w-7xl items-end justify-between px-6 lg:flex">
            <div>
              <p className="portada-contorno-claro flex items-center gap-3 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-teal-800">
                <span aria-hidden className="h-px w-7 bg-teal-800/50" />
                {t("pie.selloTitulo")}
              </p>
              <p className="portada-contorno-claro mt-1.5 font-heading text-lg font-bold uppercase tracking-[0.02em] text-teal-900">
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
              <p className="portada-contorno-claro flex items-center justify-end gap-3 font-logo text-sm font-semibold text-teal-800">
                {t("pie.contactoTitulo")}
                <span aria-hidden className="h-px w-7 bg-teal-800/50" />
              </p>
              <a
                href={enlaceWhatsapp(ajustes)}
                target="_blank"
                rel="noopener noreferrer"
                className="portada-contorno-claro mt-1.5 block font-heading text-lg font-bold uppercase tracking-[0.02em] text-teal-900 transition-colors hover:text-amber-700"
              >
                {ajustes.telefono}
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
      {/* Con la ficha de TripAdvisor configurada, sus reseñas reales; si no,
          las del panel. */}
      {tripadvisor ? (
        <ReviewsSection reviews={tripadvisor.resenas} fichas={fichas} tripadvisor={tripadvisor} />
      ) : (
        <ReviewsSection reviews={resenas} fichas={fichas} />
      )}
    </Escena>
    <JourneyBand />
    </>
  );
}
