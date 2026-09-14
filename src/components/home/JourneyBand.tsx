import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Contornos } from "@/components/home/Contornos";
import { LaminaAmpliable } from "@/components/home/LaminaAmpliable";

/**
 * Banda de cierre antes del pie: la lámina de marca y, a su lado, el
 * compromiso «Protégeme» contra la explotación sexual de menores.
 *
 * La lámina va sin titular: la composición ya trae dentro el logo, el lema y
 * la escena del camino, y un titular al lado repetiría el mismo mensaje.
 *
 * El cartel sí lo lleva. Es el aviso oficial del Ministerio de Comercio
 * Exterior y Turismo (Ley N.° 29408) que las agencias de viaje deben
 * exhibir, también en su web. Suelto, a tamaño de miniatura, se leía como
 * un folleto más; con un titular y dos líneas se entiende qué es antes de
 * abrirlo, y los números de denuncia quedan a la vista sin tener que
 * ampliar la imagen.
 *
 * Componente de servidor: la ruta del archivo se resuelve en el build y, si
 * no está, la sección no se pinta en lugar de dejar un hueco de imagen rota.
 * La entrada es CSS puro (ver .journey-plate en globals.css), así que no hace
 * falta JavaScript ni en la carga ni al hacer scroll.
 */

const PHOTO_CANDIDATES = ["mapi.webp", "mapi.png", "mapi.jpg"];
const CARTEL = "protegeme-turismo-responsable.webp";

function findPhoto(): string | null {
  for (const name of PHOTO_CANDIDATES) {
    if (existsSync(join(process.cwd(), "public", name))) {
      return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${name}`;
    }
  }
  return null;
}

export async function JourneyBand() {
  const t = await getTranslations("journey");
  const photo = findPhoto();
  const cartel = existsSync(join(process.cwd(), "public", CARTEL))
    ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${CARTEL}`
    : null;

  if (!photo) return null;

  return (
    <section className="relative overflow-hidden bg-white">
      <Contornos />
      <div
        className={
          cartel
            ? "relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16"
            : "relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16"
        }
      >
        <div className="journey-plate mx-auto w-full max-w-xl">
          <Image
            src={photo}
            alt={t("badge")}
            width={1200}
            height={856}
            sizes="(min-width: 640px) 36rem, 100vw"
            /* Dimensiones intrínsecas + h-auto: la lámina conserva su
               proporción sin recortar la composición, que lleva dentro el
               logo y el lema. */
            className="journey-plate__img h-auto w-full"
          />
        </div>

        {cartel && (
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center lg:gap-10">
            <div className="escena-texto max-w-md text-center sm:text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-600">
                {t("responsibleBadge")}
              </p>
              <h2 className="mt-4 font-heading text-[1.9rem] font-bold uppercase leading-[0.98] text-slate-900 sm:text-[2.3rem]">
                {t("responsibleTitle")}
              </h2>
              <p className="mt-5 font-logo text-lg leading-relaxed text-slate-600">
                {t("responsibleLead")}
              </p>
              {/* Los números, fuera de la imagen: son lo único del cartel que
                  alguien puede necesitar con prisa, y dentro de la miniatura
                  no se leen. */}
              <p className="mt-5 text-[15px] leading-relaxed text-slate-700 sm:border-l-2 sm:border-teal-600 sm:pl-4">
                {t("responsibleReport")}{" "}
                <a href="tel:1818" className="font-bold text-teal-700 underline-offset-2 hover:underline">
                  1818
                </a>{" "}
                ·{" "}
                <a href="tel:100" className="font-bold text-teal-700 underline-offset-2 hover:underline">
                  {t("responsibleLine100")}
                </a>
              </p>
            </div>

            <LaminaAmpliable
              src={cartel}
              alt={t("responsibleAlt")}
              ancho={909}
              alto={1280}
              rotulo={t("responsibleZoom")}
              className="escena-foto w-44 shrink-0 sm:w-52"
            />
          </div>
        )}
      </div>
    </section>
  );
}
