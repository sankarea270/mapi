import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/format";
import type { Tour } from "@/types/tour";

/**
 * Tira de tarjetas altas que se recorre de lado, justo debajo de la portada.
 *
 * Es lo primero que aparece al bajar, así que enseña tours de verdad y no
 * una muestra: van los destacados del catálogo, con su foto, su nombre en el
 * idioma que toque y su enlace. Con seis tarjetas iguales apuntando a
 * `/mapi.webp` —que es el logotipo sobre fondo blanco, no una foto de
 * paisaje— la sección se habría visto rota en producción, y en inglés y
 * portugués los rótulos habrían salido en español.
 *
 * Va en el servidor: no le queda nada que hacer en el navegador, porque el
 * desplazamiento lateral es nativo y el resto son enlaces. Así no suma
 * JavaScript a la primera pantalla, que es donde más caro sale.
 *
 * Dos detalles de la maqueta que no se ven:
 *
 *  · La barra de desplazamiento se oculta pero el bloque SIGUE siendo
 *    desplazable con rueda, dedo y teclado. Ocultarla con `overflow: hidden`
 *    habría dejado fuera de alcance las tarjetas a partir de la tercera.
 *
 *  · Cada tarjeta es un enlace entero, no una tarjeta con un botón dentro.
 *    Así se puede pulsar en cualquier parte, que es lo que la gente intenta,
 *    y un lector de pantalla anuncia un solo destino en lugar de dos.
 */
export async function ToursPackagesCarousel({
  tours,
  locale,
}: {
  tours: Tour[];
  /* `string` y no la unión de idiomas: es lo que la página tiene a mano y
     lo que acepta `pickLocalized`. Estrecharlo aquí solo obligaría a un
     `as` en el sitio de la llamada, que es esconder el problema, no
     resolverlo. */
  locale: string;
}) {
  const t = await getTranslations();

  if (tours.length === 0) return null;

  return (
    <section className="tira-tours bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-bold text-slate-900 sm:text-[2.6rem]">
          {t("historias.title")}
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500 sm:text-base">
          {t("historias.subtitle")}
        </p>

        <div className="sin-barra mt-10 flex snap-x gap-6 overflow-x-auto pb-8">
          {tours.map((tour) => {
            const nombre = pickLocalized(tour.name, locale);
            return (
              <div key={tour.slug} className="story-scroll-animate w-64 flex-none snap-start">
                <Link
                  href={`/tours/${tour.slug}`}
                  className="story-card-container group block rounded-3xl bg-white p-4 shadow-lg outline-none transition-shadow duration-300 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  <div className="relative mb-4 h-96 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={tour.image}
                      alt={nombre}
                      fill
                      sizes="256px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <h3 className="absolute inset-x-4 bottom-4 font-heading text-xl font-bold leading-tight text-white">
                      {nombre}
                    </h3>
                  </div>

                  <p className="flex items-baseline justify-between gap-2 px-1 text-sm text-slate-500">
                    {pickLocalized(tour.duration, locale)}
                    <span className="font-heading text-lg font-bold text-slate-900">
                      ${tour.price}
                    </span>
                  </p>

                  <span className="mt-3 block rounded-full bg-slate-900 py-3 text-center font-semibold text-white transition-colors group-hover:bg-teal-700">
                    {t("nav.seeTour")}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
