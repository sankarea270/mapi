"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Star, Sun } from "lucide-react";
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
  /** Media anual de máximas, en grados. Sale de los datos de clima. */
  grados: number;
  /** Mejor época, ya formateada: "May – Sep". */
  mejorEpoca: string;
}

/** Cada cuánto pasa solo. */
const INTERVALO = 6000;

/**
 * "Dónde te llevamos".
 *
 * Sustituye a la rueda giratoria por la maqueta de la referencia: a la
 * izquierda el destino escrito en grande con sus tres datos y su botón, a la
 * derecha la foto recortada en una forma orgánica, con una cadena de
 * miniaturas al lado y una pincelada con el nombre del sitio.
 *
 * Por qué se va la rueda. Era un círculo enorme con las fotos colgando del
 * arco y el eje fuera de la pantalla; funcionaba, pero pedía entender el
 * mecanismo antes de leer nada. Aquí el destino se lee de una vez —número,
 * nombre, descripción, datos— y el movimiento acompaña en lugar de ser el
 * protagonista.
 *
 * Tres decisiones que no se ven:
 *
 *  · La forma orgánica es un `clipPath` en unidades de la propia caja
 *    (`objectBoundingBox`), no un `border-radius` inventado ni una imagen
 *    con la forma quemada dentro. Así el recorte se adapta a cualquier
 *    tamaño y la foto se puede cambiar desde el panel sin rehacer nada.
 *
 *  · Las miniaturas muestran el anterior, el actual y el siguiente, no los
 *    ocho. Con ocho, la columna medía más que la foto y había que
 *    desplazarla; con tres se entiende de dónde vienes y a dónde vas, que
 *    es lo que hace la referencia.
 *
 *  · Todo lo que cambia lleva `key` con el índice del destino. Es lo que
 *    hace que React remonte esos nodos y sus animaciones de entrada se
 *    vuelvan a ver en cada cambio; sin eso, el texto se sustituiría de
 *    golpe dentro de las mismas cajas.
 */
export function RuedaDestinos({ destinos }: { destinos: DestinoRueda[] }) {
  const t = useTranslations("rueda");
  const reducido = useReducedMotion();
  const [activo, setActivo] = useState(0);
  const [quieto, setQuieto] = useState(false);

  const total = destinos.length;

  const ir = useCallback(
    /* El `+ total * 10` mantiene el resto positivo: en JavaScript (-1 % 8)
       es -1, y el índice se saldría de la lista. */
    (salto: number) => setActivo((i) => (i + salto + total * 10) % total),
    [total]
  );

  useEffect(() => {
    if (quieto || reducido || total < 2) return;
    const id = setInterval(() => ir(1), INTERVALO);
    return () => clearInterval(id);
  }, [quieto, reducido, total, ir]);

  if (total === 0) return null;

  const d = destinos[activo];
  const anterior = destinos[(activo - 1 + total) % total];
  const siguiente = destinos[(activo + 1) % total];

  return (
    <section
      className="trama-curvas relative overflow-hidden bg-[#faf8f4] py-16 sm:py-20"
      onMouseEnter={() => setQuieto(true)}
      onMouseLeave={() => setQuieto(false)}
    >
      {/* El recorte orgánico. Va una sola vez en el documento y se referencia
          desde el CSS; en unidades de la caja, así que sirva la foto que
          sirva y mida lo que mida. */}
      <svg aria-hidden className="absolute size-0">
        <defs>
          <clipPath id="forma-destino" clipPathUnits="objectBoundingBox">
            <path d="M0.06,0.32 C0.10,0.10 0.30,0.01 0.52,0.02 C0.74,0.03 0.95,0.09 0.99,0.28 C1.03,0.47 0.97,0.70 0.88,0.84 C0.79,0.98 0.62,1.01 0.44,0.99 C0.26,0.97 0.09,0.90 0.04,0.74 C-0.01,0.58 0.02,0.44 0.06,0.32 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Arcos sueltos arriba a la derecha, como en la referencia. */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -right-10 top-6 hidden w-56 text-amber-400/60 lg:block"
      >
        <path d="M20 180 A 120 120 0 0 1 180 30" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M62 190 A 100 100 0 0 1 190 78" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      </svg>

      <div className="mx-auto grid max-w-7xl items-center gap-y-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-x-10">
        {/* ─── Izquierda: el destino escrito ─────────────────────────── */}
        <div className="escena-texto min-w-0">
          <p className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600">
            {t("badge")}
            <span aria-hidden className="h-px w-10 bg-amber-500/50" />
          </p>

          {/* Dos niveles a propósito. El de fuera es hijo directo de
              `.escena-texto`, así que se lo queda la revelación general de
              la sección; el de dentro lleva la `key` y la animación de
              CAMBIO de destino. Con ambas cosas en el mismo elemento, la
              regla de revelación —mucho más específica— le ganaba a la de
              cambio y el destino nuevo entraba con la animación equivocada. */}
          <div className="mt-7">
            <div key={`t-${activo}`} className="destino-entra flex items-start gap-6">
            <span className="font-heading text-6xl font-bold leading-none tabular-nums text-amber-500 sm:text-[5.5rem]">
              {String(activo + 1).padStart(2, "0")}
            </span>
            <span aria-hidden className="mt-1 h-16 w-px shrink-0 bg-slate-300 sm:h-20" />
            <div className="min-w-0 pt-1">
              {/* En romana, como la referencia: es la misma familia del
                  logotipo, así que el nombre del destino se lee con la voz
                  de la marca y no con la de los titulares. */}
              <h2 className="font-logo text-4xl font-medium leading-none text-teal-800 sm:text-6xl">
                {d.nombre}
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-teal-900/70 sm:text-base">
                {d.descripcion}
              </p>
              </div>
            </div>
          </div>

          {/* Los tres datos. Todos salen de información que ya existe en el
              proyecto: la media anual de máximas y la mejor época, de la
              ficha de clima de la región; las experiencias, del catálogo.
              No hay ninguno inventado. */}
          <div className="mt-10">
            <dl
              key={`d-${activo}`}
              className="destino-entra flex flex-wrap gap-x-10 gap-y-6"
              style={{ animationDelay: "80ms" }}
            >
            {[
              { icono: Sun, valor: `${d.grados}°C`, rotulo: t("clima") },
              { icono: CalendarDays, valor: d.mejorEpoca, rotulo: t("mejorEpoca") },
              {
                icono: Star,
                valor: t("experiencias", { count: d.tours }),
                rotulo: t("destacados"),
              },
            ].map(({ icono: Icono, valor, rotulo }) => (
              <div key={rotulo}>
                <dd className="flex items-center gap-2.5 font-heading text-lg font-bold text-teal-900">
                  <Icono className="size-5 shrink-0 text-teal-600" strokeWidth={1.7} />
                  {valor}
                </dd>
                <dt className="mt-1.5 pl-[1.95rem] text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {rotulo}
                </dt>
              </div>
              ))}
            </dl>
          </div>

          <Link
            href={`/destinos/${d.slug}`}
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-teal-800 px-8 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-teal-900"
          >
            {t("explorar")}
            <ArrowRight className="size-4" />
          </Link>

          {/* Los números y la barra. La referencia los pone abajo del todo y
              son, a la vez, el índice y un selector: pulsando un número se
              salta a ese destino. */}
          <div className="mt-14 max-w-lg">
            <div className="flex justify-between">
              {destinos.map((x, i) => (
                <button
                  key={x.slug}
                  type="button"
                  onClick={() => setActivo(i)}
                  aria-label={x.nombre}
                  aria-current={i === activo}
                  className={cn(
                    "px-1 font-heading text-[13px] font-bold tabular-nums transition-colors",
                    i === activo ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
            <div className="relative mt-3 h-px w-full bg-slate-300">
              <span
                aria-hidden
                className="absolute -top-[3px] size-[7px] rounded-full bg-amber-500 transition-[left] duration-500 ease-out"
                style={{ left: `calc(${(activo / Math.max(total - 1, 1)) * 100}% - 3px)` }}
              />
            </div>
          </div>
        </div>

        {/* ─── Derecha: la foto y la cadena ──────────────────────────── */}
        <div className="relative">
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Cadena de miniaturas: anterior, actual y siguiente, unidos
                por un trazo discontinuo. */}
            <div className="relative hidden shrink-0 flex-col items-center gap-7 sm:flex">
              <svg
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 h-full w-16 -translate-x-1/2 text-teal-600/40"
                viewBox="0 0 64 400"
                preserveAspectRatio="none"
              >
                <path
                  d="M32 60 C 10 110, 54 140, 32 190"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="5 7"
                  strokeLinecap="round"
                />
                <path
                  d="M32 214 C 54 262, 10 292, 32 342"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="5 7"
                  strokeLinecap="round"
                />
              </svg>

              {[anterior, d, siguiente].map((x, i) => {
                const esActual = i === 1;
                const indice = (activo - 1 + i + total) % total;
                return (
                  <button
                    key={`${x.slug}-${i}`}
                    type="button"
                    onClick={() => setActivo(indice)}
                    aria-label={x.nombre}
                    className="group relative z-10 flex items-center gap-3.5"
                  >
                    <span
                      className={cn(
                        "relative block shrink-0 overflow-hidden rounded-full transition-all duration-500",
                        esActual
                          ? "size-24 ring-2 ring-amber-500 ring-offset-4 ring-offset-[#faf8f4]"
                          : "size-16 opacity-70 group-hover:opacity-100"
                      )}
                    >
                      <Image
                        src={x.imagen}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </span>
                    <span
                      className={cn(
                        "whitespace-nowrap font-heading text-[11px] font-bold uppercase tracking-[0.14em] transition-colors",
                        esActual ? "text-teal-800" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    >
                      {x.nombre}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* La foto, recortada. `key` para que la entrada se repita en
                cada cambio. */}
            <div className="relative min-w-0 flex-1">
              <div
                key={`f-${activo}`}
                className="destino-foto relative aspect-4/5 w-full sm:aspect-square"
                style={{ clipPath: "url(#forma-destino)" }}
              >
                <Image
                  src={d.imagen}
                  alt={d.nombre}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>

              {/* La pincelada con el nombre del sitio. El trazo es un
                  `path` y no una imagen, así que se recolorea con la marca y
                  no pesa nada. El texto va en romana cursiva: es la letra
                  más cercana a la manuscrita de la referencia entre las que
                  el sitio ya carga, y traer una quinta familia para dos
                  palabras no compensa. */}
              <div className="pointer-events-none absolute bottom-4 right-0 w-56 sm:bottom-8 sm:right-2">
                <svg viewBox="0 0 224 84" className="w-full text-teal-800" aria-hidden>
                  <path
                    d="M6,34 C40,14 92,8 148,12 C186,15 216,22 220,34 C224,48 208,66 170,72 C126,79 66,78 30,68 C8,62 -2,46 6,34 Z"
                    fill="currentColor"
                  />
                </svg>
                <p className="absolute inset-0 flex items-center justify-center gap-2 pb-1 font-logo text-lg italic leading-tight text-white">
                  <MapPin className="size-4 shrink-0" strokeWidth={2} />
                  {d.nombre}, Perú
                </p>
              </div>
            </div>
          </div>

          {/* Las dos flechas. */}
          <div className="mt-8 flex justify-center gap-4 sm:absolute sm:-bottom-4 sm:right-2 sm:mt-0">
            <button
              type="button"
              onClick={() => ir(-1)}
              aria-label={t("prev")}
              className="grid size-12 place-items-center rounded-full bg-white text-teal-800 shadow-lg shadow-slate-900/10 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => ir(1)}
              aria-label={t("next")}
              className="grid size-12 place-items-center rounded-full bg-teal-800 text-white transition-colors hover:bg-teal-900"
            >
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
