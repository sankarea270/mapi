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

/**
 * Rueda de destinos.
 *
 * Los destinos giran solos sobre un aro: el punto activo sube siempre a las
 * doce y el aro rota para llevarlo allí, así que se ve girar de verdad en
 * lugar de saltar de un punto a otro.
 *
 * Tres decisiones sobre el movimiento, que es donde estas piezas suelen
 * quedar mal:
 *
 *  · El giro es ACUMULADO, no un ángulo módulo 360. Con el módulo, pasar del
 *    último destino al primero hace retroceder la rueda dando una vuelta
 *    entera hacia atrás de golpe. Guardando el ángulo total, siempre avanza.
 *
 *  · Se detiene al pasar el ratón o al enfocar con el teclado. Una rueda que
 *    sigue girando mientras alguien intenta leer o pulsar es una trampa.
 *
 *  · Con `prefers-reduced-motion` no gira sola ni hay transiciones: quedan
 *    los botones. A quien le marea el movimiento, esto le marea.
 */
export function RuedaDestinos({ destinos }: { destinos: DestinoRueda[] }) {
  const t = useTranslations("rueda");
  const reducido = useReducedMotion();
  const [activo, setActivo] = useState(0);
  const [detenido, setDetenido] = useState(false);

  /* Ángulo total recorrido, en grados. Crece siempre. */
  const giro = useRef(0);
  const anterior = useRef(0);

  const n = destinos.length;
  const paso = n > 0 ? 360 / n : 0;

  const ir = useCallback(
    (siguiente: number) => {
      if (n === 0) return;
      const destino = ((siguiente % n) + n) % n;
      /* Diferencia mínima entre los dos índices, con signo: decide si el aro
         gira a un lado o al otro por el camino más corto. */
      let delta = destino - anterior.current;
      if (delta > n / 2) delta -= n;
      if (delta < -n / 2) delta += n;
      giro.current += delta * paso;
      anterior.current = destino;
      setActivo(destino);
    },
    [n, paso]
  );

  useEffect(() => {
    if (reducido || detenido || n <= 1) return;
    const id = setInterval(() => ir(anterior.current + 1), INTERVALO);
    return () => clearInterval(id);
  }, [reducido, detenido, n, ir]);

  if (n === 0) return null;
  const d = destinos[activo];

  return (
    <section
      className="overflow-hidden border-t border-slate-200 bg-white py-20 sm:py-24"
      onMouseEnter={() => setDetenido(true)}
      onMouseLeave={() => setDetenido(false)}
      onFocusCapture={() => setDetenido(true)}
      onBlurCapture={() => setDetenido(false)}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <p className="eyebrow text-amber-600">{t("badge")}</p>

          <div className="mt-6 flex items-start gap-6 sm:gap-9">
            {/* El numeral es enorme y en ámbar, como en las revistas de
                viaje: ancla la vista y marca por dónde va la rueda. */}
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
                style={{ animationDelay: "60ms" }}
              >
                {d.descripcion}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {/* Se parte de `anterior.current`, no del estado `activo`.
                Varios clics seguidos ocurren antes de que React repinte, así
                que todos leerían el mismo `activo` y las tres pulsaciones
                pedirían el mismo destino: la rueda avanzaba un solo paso por
                muchas veces que se pulsara. La referencia sí está al día. */}
            <div className="flex gap-2.5">
              <Control
                etiqueta={t("prev")}
                onClick={() => ir(anterior.current - 1)}
                direccion="arriba"
              />
              <Control
                etiqueta={t("next")}
                onClick={() => ir(anterior.current + 1)}
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

          {/* Para lectores de pantalla: anuncia el cambio sin depender de
              ver la rueda girar. */}
          <p className="sr-only" aria-live="polite">
            {d.nombre}
          </p>
        </div>

        <div className="relative mx-auto grid size-[19rem] shrink-0 place-items-center sm:size-[24rem]">
          {/* Aro. Gira para que el punto activo suba siempre a las doce. */}
          <div
            className={cn(
              "absolute inset-0",
              !reducido && "transition-transform duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)]"
            )}
            style={{ transform: `rotate(${-giro.current}deg)` }}
            aria-hidden
          >
            <span className="absolute inset-0 rounded-full border border-slate-200" />
            {destinos.map((x, i) => (
              <span
                key={x.slug}
                className="absolute left-1/2 top-1/2 size-0"
                style={{ transform: `rotate(${i * paso}deg) translateY(-50%) translateY(-0.5px)` }}
              >
                <span
                  className={cn(
                    "absolute -translate-x-1/2 rounded-full transition-all duration-500",
                    i === activo
                      ? "-top-[calc(50%+0px)] size-3 bg-amber-500"
                      : "-top-[calc(50%+0px)] size-1.5 bg-slate-300"
                  )}
                  style={{ top: "-9.5rem" }}
                />
              </span>
            ))}
          </div>

          {/* Foto. El `key` fuerza el remontaje para que la entrada se
              reanime en cada cambio. */}
          <figure
            key={d.slug}
            className={cn(
              "relative size-56 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 sm:size-72",
              !reducido && "rueda-foto"
            )}
          >
            <Image
              src={d.imagen}
              alt={d.nombre}
              fill
              sizes="(max-width: 640px) 14rem, 18rem"
              className="object-cover"
            />
          </figure>

          <span className="pointer-events-none absolute bottom-6 right-2 rounded-full bg-slate-900 px-3 py-1.5 font-heading text-xs font-bold tabular-nums text-white sm:bottom-8 sm:right-0">
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
