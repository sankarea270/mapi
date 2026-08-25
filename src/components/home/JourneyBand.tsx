import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Banda de cierre antes del pie: la marca, el lema y la escena del camino.
 *
 * La ruta punteada, el avión que la recorre y las pisadas que van apareciendo
 * se dibujan en SVG y se animan con `stroke-dashoffset` y `offset-path`, no
 * son parte de la imagen. Así la escena se mueve, se adapta a cualquier ancho
 * y pesa unos pocos kilobytes.
 *
 * La fotografía es opcional: si no está el archivo, la banda se sostiene sola
 * con el degradado de marca y la escena vectorial, sin dejar un hueco roto.
 */

/**
 * Se busca en varias extensiones y se resuelve en el build. Es un componente
 * de servidor a propósito: así, si el archivo no existe, la banda se compone
 * sin el hueco de la imagen en lugar de emitir un <img> roto. Las animaciones
 * son CSS puro y no necesitan cliente.
 */
const PHOTO_CANDIDATES = [
  "camino-machu-picchu.jpg",
  "camino-machu-picchu.png",
  "camino-machu-picchu.webp",
];

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

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Filete superior que se dibuja al entrar en pantalla. */}
      <span aria-hidden="true" className="journey-rule block h-0.5 bg-teal-600" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="relative z-10 max-w-md">
          <p className="eyebrow text-teal-700">{t("badge")}</p>
          <h2 className="mt-3 font-heading text-3xl font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.75rem]">
            {t("title")}
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600">
            {t("lead")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/tours"
              className="rounded-md bg-amber-500 px-7 py-3.5 text-sm font-bold tracking-wide text-slate-900 transition-colors hover:bg-amber-400"
            >
              {t("ctaTours")}
            </Link>
            <Link
              href="/reservar"
              className="rounded-md border border-slate-300 px-7 py-3.5 text-sm font-bold tracking-wide text-slate-800 transition-colors hover:border-slate-900 hover:bg-slate-900 hover:text-white"
            >
              {t("ctaPlan")}
            </Link>
          </div>
        </div>

        <div className="relative">
          {/* Sol: disco cálido tras la escena, como en la pieza de marca. */}
          <span
            aria-hidden="true"
            className="absolute -top-6 right-8 -z-0 size-56 rounded-full bg-amber-200/45 blur-[2px] sm:size-72"
          />

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg sm:aspect-[3/4] lg:aspect-[4/5]">
            {photo ? (
              <>
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
                {/* Difuminado hacia la izquierda: la foto se funde con el
                    blanco de la página en vez de cortar en canto recto. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-white via-white/25 to-transparent"
                />
              </>
            ) : (
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50"
              />
            )}
          </div>

          {/* Escena vectorial encima: ruta, avión y pisadas. */}
          <svg
            viewBox="0 0 400 500"
            className="pointer-events-none absolute inset-0 size-full"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <defs>
              <path
                id="flight-path"
                d="M 18 168 C 90 96, 200 74, 286 44"
                fill="none"
              />
            </defs>

            {/* Traza punteada que se dibuja de izquierda a derecha. */}
            <use
              href="#flight-path"
              className="flight-trace"
              stroke="#2e6b70"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1 11"
            />
            <circle className="flight-origin" cx="18" cy="168" r="5" fill="#2e6b70" />

            {/* Avión recorriendo la traza. */}
            <g className="flight-plane">
              <path
                d="M -11 0 L 7 -5 L 11 0 L 7 5 Z M -4 -8 L 2 -2 L 2 2 L -4 8 Z"
                fill="#22484b"
              />
            </g>

            {/* Pisadas: aparecen una tras otra y se quedan. */}
            <g fill="#7a5a34">
              {[
                [232, 336, -8],
                [268, 372, 6],
                [222, 404, -10],
                [258, 442, 4],
              ].map(([x, y, r], i) => (
                <ellipse
                  key={i}
                  className="footprint"
                  cx={x}
                  cy={y}
                  rx="9"
                  ry="15"
                  transform={`rotate(${r} ${x} ${y})`}
                  style={{ animationDelay: `${1.1 + i * 0.28}s` }}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
