"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface DestinoRueda {
  slug: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  tours: number;
}

const INTERVALO = 5200;
/* Posición focal: 90° = las tres en punto, el punto más a la derecha del
   aro. Es donde el eje —que queda fuera del encuadre, a la izquierda— sitúa
   la foto en el centro vertical del marco. */
const FOCO = 90;

/**
 * Rueda de destinos.
 *
 * Las fotos van montadas en el aro y giran con él: la rueda lleva cada
 * destino hasta la posición focal, arriba del todo, donde crece y se ve
 * nítido. Antes la foto cambiaba en su sitio con un fundido —el aro giraba
 * pero la imagen no viajaba—, que es lo que hacía que no pareciese una
 * rueda de verdad.
 *
 * Cada foto lleva un contragiro exacto del giro del aro para no salir
 * cabeza abajo al pasar por la mitad inferior.
 *
 * Tres decisiones sobre el movimiento:
 *
 *  · El giro es ACUMULADO, no un ángulo módulo 360. Con el módulo, pasar del
 *    último destino al primero hace retroceder la rueda una vuelta entera de
 *    golpe. Guardando el ángulo total, el camino siempre es el corto.
 *
 *  · Se detiene al pasar el ratón o al enfocar con el teclado. Una rueda que
 *    sigue girando mientras alguien lee o intenta pulsar es una trampa.
 *
 *  · Con `prefers-reduced-motion` no gira sola ni hay transiciones: quedan
 *    los botones. A quien le marea el movimiento, esto le marea.
 */
export function RuedaDestinos({ destinos }: { destinos: DestinoRueda[] }) {
  const t = useTranslations("rueda");
  const reducido = useReducedMotion();
  const [activo, setActivo] = useState(0);
  const [detenido, setDetenido] = useState(false);

  /* Ángulo total recorrido por el aro, en grados. */
  const giro = useRef(FOCO);
  const indice = useRef(0);

  const n = destinos.length;
  const paso = n > 0 ? 360 / n : 0;

  const ir = useCallback(
    (siguiente: number) => {
      if (n === 0) return;
      const destino = ((siguiente % n) + n) % n;
      /* Diferencia con signo por el camino más corto: decide hacia qué lado
         gira el aro en vez de dar la vuelta larga. */
      let delta = destino - indice.current;
      if (delta > n / 2) delta -= n;
      if (delta < -n / 2) delta += n;
      giro.current -= delta * paso;
      indice.current = destino;
      setActivo(destino);
    },
    [n, paso]
  );

  useEffect(() => {
    if (reducido || detenido || n <= 1) return;
    const id = setInterval(() => ir(indice.current + 1), INTERVALO);
    return () => clearInterval(id);
  }, [reducido, detenido, n, ir]);

  if (n === 0) return null;
  const d = destinos[activo];
  const transicion = reducido
    ? undefined
    : "transform 1000ms cubic-bezier(.34,.72,.24,1)";

  return (
    <section
      className="overflow-hidden border-t border-slate-200 bg-white py-20 sm:py-24"
      onMouseEnter={() => setDetenido(true)}
      onMouseLeave={() => setDetenido(false)}
      onFocusCapture={() => setDetenido(true)}
      onBlurCapture={() => setDetenido(false)}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-y-10 px-4 sm:px-6 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-x-4">
        <div className="min-w-0 lg:pr-6">
          <p className="eyebrow text-amber-600">{t("badge")}</p>

          <div className="mt-6 flex items-start gap-6 sm:gap-9">
            <span
              key={`n-${activo}`}
              className="rueda-entra font-heading text-6xl font-bold leading-none tabular-nums text-amber-500 sm:text-7xl"
              aria-hidden
            >
              {String(activo + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0 pt-1">
              <h2
                key={`h-${activo}`}
                className="rueda-entra font-heading text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]"
              >
                {d.nombre}
              </h2>
              <p
                key={`p-${activo}`}
                className="rueda-entra mt-4 max-w-md text-[15px] leading-relaxed text-slate-600"
                style={{ animationDelay: "70ms" }}
              >
                {d.descripcion}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {/* Se parte de `indice.current`, no del estado. Varios clics
                seguidos ocurren antes de que React repinte, así que todos
                leerían el mismo valor y la rueda avanzaba un solo paso por
                muchas veces que se pulsara. La referencia sí está al día. */}
            <div className="flex gap-2.5">
              <Control
                etiqueta={t("prev")}
                onClick={() => ir(indice.current - 1)}
                direccion="arriba"
              />
              <Control
                etiqueta={t("next")}
                onClick={() => ir(indice.current + 1)}
                direccion="abajo"
              />
            </div>

            <Link
              href={`/destinos/${d.slug}`}
              className="group inline-flex items-center gap-2 text-sm font-bold text-teal-700 transition-colors hover:text-teal-600"
            >
              {t("ver", { count: d.tours })}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <p className="sr-only" aria-live="polite">
            {d.nombre}
          </p>
        </div>

        {/* Geometría del aro, y por qué así.
            El eje queda FUERA del encuadre, a la izquierda, y el aro es más
            del doble de ancho que su marco: por eso solo se ve un arco, no
            la circunferencia entera. La foto activa se apoya en el punto más
            a la derecha de esa curva, y las vecinas asoman por el borde
            superior e inferior —entrando y saliendo— que es lo que deja ver
            que la rueda gira y no que la imagen cambia en su sitio.

            `--r` es el radio y `--px` la distancia del borde izquierdo del
            marco a la foto activa. El aro se coloca a partir de ahí: su
            borde izquierdo cae en `--px - 2r`, así que su centro queda en
            `--px - r` y el punto de las tres, justo en `--px`.

            Cada destino va en un envoltorio que ocupa el aro entero. Al
            rotarlo gira sobre el centro por construcción, sin depender de
            `transform-origin`: encadenar rotaciones y traslaciones en un
            mismo `transform` colocaba las fotos 88px fuera de sitio. */}
        <div className="relative h-[26rem] w-full overflow-hidden [--px:12rem] [--r:17rem] sm:h-[32rem] sm:[--px:15rem] sm:[--r:21rem] lg:h-[36rem] lg:[--px:17rem] lg:[--r:24rem]">
          <div
            className="absolute top-1/2"
            style={{
              width: "calc(2 * var(--r))",
              height: "calc(2 * var(--r))",
              left: "calc(var(--px) - 2 * var(--r))",
              transform: `translateY(-50%) rotate(${giro.current}deg)`,
              transition: transicion,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border border-dashed border-slate-300"
            />

            {destinos.map((x, i) => {
              const esActivo = i === activo;
              return (
                <div
                  key={x.slug}
                  className="absolute inset-0"
                  style={{ transform: `rotate(${i * paso}deg)` }}
                >
                  <button
                    type="button"
                    onClick={() => ir(i)}
                    aria-label={x.nombre}
                    aria-current={esActivo ? "true" : undefined}
                    className="absolute left-1/2 top-0 focus-visible:outline-none"
                    /* Contragiro exacto: deshace el del aro y el propio, para
                       que la foto no salga cabeza abajo al recorrer la mitad
                       inferior de la curva. */
                    style={{
                      transform: `translate(-50%,-50%) rotate(${-giro.current - i * paso}deg)`,
                      transition: transicion,
                    }}
                  >
                    <span
                      className={cn(
                        "block overflow-hidden rounded-full bg-slate-100 ring-1 transition-all duration-700",
                        esActivo
                          ? "size-44 opacity-100 ring-4 ring-amber-500 sm:size-56 lg:size-64"
                          : "size-14 opacity-50 ring-slate-200 hover:opacity-90 sm:size-16"
                      )}
                    >
                      <span className="relative block size-full">
                        <Image
                          src={x.imagen}
                          alt=""
                          fill
                          sizes={esActivo ? "16rem" : "4rem"}
                          className="object-cover"
                        />
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-slate-900 px-3 py-1.5 font-heading text-xs font-bold tabular-nums text-white">
            {activo + 1} / {n}
          </span>
        </div>
      </div>
    </section>
  );
}

function Control({
  etiqueta,
  onClick,
  direccion,
}: {
  etiqueta: string;
  onClick: () => void;
  direccion: "arriba" | "abajo";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      className="grid size-11 place-items-center rounded-full text-slate-500 ring-1 ring-slate-300 transition-colors hover:bg-slate-900 hover:text-white hover:ring-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
    >
      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
        <path
          d={direccion === "arriba" ? "M2 10 L8 4 L14 10" : "M2 6 L8 12 L14 6"}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
