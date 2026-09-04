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
/* Posición focal: 0° = las doce en punto.
   Se probó a las nueve —más cerca del texto y más parecido al referente—,
   pero ahí la foto activa queda en el borde izquierdo del aro y, en
   pantallas estrechas, el aro es más ancho que la ventana: la foto grande
   se salía fuera. Arriba queda centrada horizontalmente sea cual sea el
   ancho, así que no puede desbordar. */
const FOCO = 0;

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
      <div className="mx-auto grid max-w-7xl items-center gap-y-12 px-4 sm:px-6 lg:grid-cols-[1fr_minmax(0,32rem)] lg:gap-x-8">
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

        {/* Estructura del aro, y por qué es así.
            Un primer intento encadenaba rotaciones y traslaciones en un
            mismo `transform`. No funcionó: `transform-origin` está por
            defecto en el centro de CADA elemento, así que las rotaciones no
            giraban sobre el eje del aro y las fotos aparecían desplazadas
            —medidas: 88px por encima de donde tocaba, y descentradas.

            Aquí cada destino tiene un envoltorio que ocupa el aro entero
            (`inset-0`). Al rotarlo, gira sobre el centro del aro por
            construcción, sin depender de ningún origen. La foto se coloca en
            el borde superior de ese envoltorio, así que el radio es siempre
            la mitad del aro y no hay dos medidas que mantener de acuerdo. */}
        <div className="relative mx-auto h-[24rem] w-full max-w-[26rem] sm:h-[32rem] lg:h-[36rem] lg:max-w-none">
          <div
            className="absolute left-1/2 top-1/2 size-[14rem] sm:size-[19rem] lg:size-[24rem]"
            style={{
              transform: `translate(-50%,-50%) rotate(${giro.current}deg)`,
              transition: transicion,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border border-dashed border-slate-200"
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
                       que la foto no salga cabeza abajo al pasar por la mitad
                       inferior del recorrido. */
                    style={{
                      transform: `translate(-50%,-50%) rotate(${-giro.current - i * paso}deg)`,
                      transition: transicion,
                    }}
                  >
                    <span
                      className={cn(
                        "block overflow-hidden rounded-full bg-slate-100 ring-1 transition-all duration-700",
                        esActivo
                          ? "size-28 opacity-100 ring-4 ring-amber-500 sm:size-40 lg:size-44"
                          : "size-12 opacity-45 ring-slate-200 hover:opacity-80 sm:size-16 lg:size-20"
                      )}
                    >
                      <span className="relative block size-full">
                        <Image
                          src={x.imagen}
                          alt=""
                          fill
                          sizes={esActivo ? "11rem" : "5rem"}
                          className="object-cover"
                        />
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-slate-900 px-3 py-1.5 font-heading text-xs font-bold tabular-nums text-white">
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
