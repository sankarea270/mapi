import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

/**
 * Banda de cierre antes del pie.
 *
 * Es solo la lámina de marca: la composición ya trae dentro el logo, el lema
 * y la escena del camino, así que añadir al lado un titular y unos botones
 * repetía el mismo mensaje dos veces.
 *
 * Componente de servidor: la ruta del archivo se resuelve en el build y, si
 * no está, la sección no se pinta en lugar de dejar un hueco de imagen rota.
 * La entrada es CSS puro (ver .journey-plate en globals.css), así que no hace
 * falta JavaScript ni en la carga ni al hacer scroll.
 */

const PHOTO_CANDIDATES = ["mapi.webp", "mapi.png", "mapi.jpg"];

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

  if (!photo) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
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
      </div>
    </section>
  );
}
