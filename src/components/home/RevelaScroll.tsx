import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Sección de revelado a pantalla completa.
 *
 * Es el efecto que usa snamitravel.com: la sección se clava mientras la
 * atraviesas y, durante ese recorrido, la foto crece de media altura a
 * completa mientras el texto entra escalonado al lado.
 *
 * Ellos lo resuelven con GSAP + ScrollTrigger + Swiper: unas 150 KB de
 * JavaScript solo para esto. Aquí se hace con `position: sticky` para el
 * clavado y animaciones de scroll de CSS para el resto, o sea cero bytes de
 * script. No es purismo: este sitio arrastra 194 KB de HTML por página y
 * acaba de entrar en Google, así que sumar 150 KB de librería para un efecto
 * decorativo sale caro justo donde más duele.
 *
 * Todo va dentro de `@supports`. Donde el navegador no entiende animaciones
 * de scroll —Firefox, hoy— la sección se ve completa y quieta, que es
 * exactamente lo que debe pasar: el efecto es un adorno, no el contenido.
 */
export async function RevelaScroll({ foto }: { foto: string }) {
  const t = await getTranslations("revela");

  return (
    /* El alto de más es la pista por la que se desliza: la sección interior
       se queda pegada arriba mientras el contenedor recorre esos 250vh, y
       ese recorrido es el que alimenta la animación. */
    <section className="revela relative h-[250vh] bg-slate-950">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="revela-texto order-2 lg:order-1">
            <p className="eyebrow text-amber-400">{t("badge")}</p>
            <h2 className="mt-4 font-heading text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-300 sm:text-base">
              {t("lead")}
            </p>
            <Link
              href="/tours"
              className="mt-9 inline-flex h-12 items-center rounded-md bg-amber-500 px-7 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-400"
            >
              {t("cta")}
            </Link>
          </div>

          {/* La foto arranca a media altura y crece hasta completa. El
              recorte lo hace `clip-path` y no la altura del contenedor: así
              la imagen no se estira ni obliga a recalcular la maqueta en
              cada fotograma. */}
          <figure className="revela-foto relative order-1 aspect-4/5 overflow-hidden rounded-lg lg:order-2 lg:aspect-3/4">
            <Image
              src={foto}
              alt={t("photoAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
