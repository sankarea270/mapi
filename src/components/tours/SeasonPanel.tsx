"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { climateForCategory } from "@/data/climate";
import { pickLocalized } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Panel de clima y temporada del tour.
 *
 * Muestra la pauta estacional de la región —temperatura de día y de noche,
 * lluvia y afluencia— mes a mes, y explica por qué conviene una época u otra.
 * Son promedios típicos, no un pronóstico, y la interfaz lo dice: para decidir
 * un viaje importa la pauta, no el tiempo de mañana.
 *
 * Los dibujos son SVG propios y animados (sol que gira, gotas que caen, nube
 * que deriva) en lugar de iconos de librería: un pictograma genérico repetido
 * es justo lo que da aire de plantilla, y aquí el dibujo además comunica el
 * dato de un vistazo.
 */

function SunGlyph({ soft = false }: { soft?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
      <g className="sun-rays" style={{ transformOrigin: "32px 32px" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1="32"
            y1="6"
            x2="32"
            y2="14"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={soft ? 0.35 : 0.75}
            style={{ transformOrigin: "32px 32px", transform: `rotate(${i * 45}deg)` }}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="13" fill="currentColor" opacity={soft ? 0.5 : 0.9} />
    </svg>
  );
}

function CloudGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
      <g className="cloud-bob">
        <ellipse cx="26" cy="34" rx="14" ry="11" fill="currentColor" opacity="0.75" />
        <ellipse cx="39" cy="36" rx="12" ry="9" fill="currentColor" opacity="0.6" />
        <rect x="16" y="38" width="34" height="8" rx="4" fill="currentColor" opacity="0.7" />
      </g>
    </svg>
  );
}

function RainGlyph({ intensity }: { intensity: number }) {
  const drops = intensity >= 3 ? [16, 26, 36, 46] : intensity === 2 ? [20, 32, 44] : [26, 40];
  return (
    <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
      <g>
        <ellipse cx="27" cy="26" rx="14" ry="10" fill="currentColor" opacity="0.65" />
        <ellipse cx="40" cy="28" rx="11" ry="8" fill="currentColor" opacity="0.5" />
        <rect x="17" y="30" width="32" height="7" rx="3.5" fill="currentColor" opacity="0.6" />
      </g>
      {drops.map((x, i) => (
        <line
          key={x}
          className="rain-drop"
          x1={x}
          y1="42"
          x2={x - 2}
          y2="50"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ animationDelay: `${i * 0.22}s` }}
        />
      ))}
    </svg>
  );
}

/** Barras de nivel: cuatro trazos que se llenan según el valor. */
function Level({ value, tone }: { value: number; tone: "rain" | "crowd" }) {
  return (
    <span className="mt-2 flex gap-1 bar-level" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1 w-5 rounded-full transition-colors duration-500",
            i <= value
              ? tone === "rain"
                ? "bg-teal-500"
                : "bg-amber-500"
              : "bg-slate-200"
          )}
        />
      ))}
    </span>
  );
}

/*
 * Curva del año.
 *
 * Antes había doce botones y había que ir pulsándolos uno a uno para
 * hacerse una idea de la pauta: eso obliga a recordar lo que decía el mes
 * anterior. Aquí el año se ve entero de una vez —cuándo aprieta el calor,
 * cuándo llueve, cuándo coincide todo el mundo— y el mes elegido queda
 * marcado dentro de ese contexto.
 *
 * Son dos gráficos apilados que comparten el eje de meses, no uno con dos
 * escalas: grados y lluvia no se miden en lo mismo y superponerlos daría
 * cruces que no significan nada.
 *
 * El ámbar de la banda de temperatura se queda en 2,88:1 de contraste sobre
 * blanco, por debajo del 3:1 exigible. Por eso los grados van SIEMPRE
 * escritos —en el eje y en la ficha del mes—: la forma orienta, pero el dato
 * no depende de distinguir el color.
 */
const TEMP = "#d88527";
const LLUVIA = "#07908c";

/**
 * Convierte una serie de puntos en una curva suave.
 *
 * Es la mitad del cambio de aspecto: una polilínea de doce tramos rectos se
 * lee como un gráfico de hoja de cálculo por mucho que se le cambien los
 * colores. Con los vértices redondeados, la misma serie pasa a leerse como
 * un trazo dibujado.
 *
 * El método es Catmull-Rom convertido a Bézier: cada punto de control sale
 * de la pendiente entre el vecino anterior y el siguiente, dividida por
 * seis. En los extremos, el vecino que falta se sustituye por el propio
 * punto, que es lo que evita que la curva se dispare al empezar y al acabar.
 */
function curvaSuave(puntos: Array<[number, number]>): string {
  if (puntos.length < 2) return "";
  let d = `M ${puntos[0][0].toFixed(1)} ${puntos[0][1].toFixed(1)}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i - 1] ?? puntos[i];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Los mismos puntos, pero solo los tramos: sirve para encadenar el camino
    de vuelta de la cinta sin que su `M` inicial rompa el trazado. */
function tramosSuaves(puntos: Array<[number, number]>): string {
  const d = curvaSuave(puntos);
  const corte = d.indexOf(" C ");
  return corte === -1 ? "" : d.slice(corte);
}

/**
 * La cinta del año.
 *
 * Reemplaza al gráfico anterior —dos líneas, una rejilla, una plomada y una
 * fila de barras—, que informaba bien pero parecía sacado de un informe.
 * Aquí la misma información se cuenta con una sola forma:
 *
 *  · Una CINTA cuyo borde de arriba son las máximas y el de abajo las
 *    mínimas. Su grosor es, literalmente, cuánto cambia la temperatura entre
 *    el día y la noche de ese mes: no hay que leer dos líneas y restar.
 *
 *  · El degradado NO recorre el eje del tiempo, sino la ALTURA: ámbar arriba,
 *    petróleo abajo. Así el color dice lo mismo que la posición, y la cinta
 *    se entiende antes de mirar ninguna escala.
 *
 *  · La lluvia son GOTAS, de cero a tres bajo cada mes, y no barras. Una
 *    barra invita a compararla con la vecina al milímetro; una gota se
 *    cuenta de un vistazo, que es toda la precisión que tiene el dato.
 *
 * Se quitan la rejilla y la línea discontinua de mínimas: con la cinta, la
 * rejilla solo añadía trazos con los que competir, y las mínimas ya son su
 * borde inferior.
 */
function CintaAnual({
  meses,
  etiquetas,
  seleccionado,
  onSeleccionar,
  recomendados,
  rotulos,
}: {
  meses: Array<{ tMax: number; tMin: number; rain: number; crowd: number }>;
  etiquetas: string[];
  seleccionado: number;
  onSeleccionar: (m: number) => void;
  recomendados: number[];
  rotulos: { max: string; min: string; rain: string; best: string; aria: string };
}) {
  /* El lienzo se dimensiona cerca del tamaño real al que se dibuja. Con un
     viewBox más pequeño, el SVG se amplía para llenar el ancho y arrastra
     consigo grosores y radios. */
  const A = 800;
  const ALTO = 190;
  const PASO = A / 12;

  const maximos = meses.map((m) => m.tMax);
  const minimos = meses.map((m) => m.tMin);
  const techo = Math.ceil(Math.max(...maximos) / 5) * 5;
  const suelo = Math.floor(Math.min(...minimos) / 5) * 5;
  const rango = Math.max(techo - suelo, 1);

  const x = (i: number) => PASO * i + PASO / 2;
  const y = (t: number) => ALTO - ((t - suelo) / rango) * (ALTO - 78) - 44;

  const arriba = maximos.map((v, i) => [x(i), y(v)] as [number, number]);
  const abajo = minimos.map((v, i) => [x(i), y(v)] as [number, number]);
  const abajoInverso = [...abajo].reverse();

  /* La cinta se cierra recorriendo las máximas de ida y las mínimas de
     vuelta. El camino de vuelta recorre los DOCE meses: saltarse alguno no
     deja un hueco pequeño, dibuja una recta entre dos puntos lejanos y la
     cinta deja de representar los datos. */
  const cinta =
    curvaSuave(arriba) +
    ` L ${abajoInverso[0][0].toFixed(1)} ${abajoInverso[0][1].toFixed(1)}` +
    tramosSuaves(abajoInverso) +
    " Z";

  return (
    <figure className="mt-8">
      <svg
        viewBox={`0 0 ${A} ${ALTO}`}
        className="w-full"
        role="img"
        aria-label={rotulos.aria}
      >
        <defs>
          <linearGradient id="cinta-temp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e29a3c" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#d88527" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#07908c" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Realce del mes elegido: una franja suave detrás, en vez de la
            plomada de lado a lado que había antes. Señala igual y no cruza
            el dibujo por la mitad. */}
        <rect
          x={PASO * seleccionado}
          y="0"
          width={PASO}
          height={ALTO}
          fill="#0f3736"
          opacity="0.06"
          rx="10"
        />

        <path d={cinta} fill="url(#cinta-temp)" />
        <path
          d={curvaSuave(arriba)}
          fill="none"
          stroke={TEMP}
          strokeOpacity="0.85"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d={curvaSuave(abajo)}
          fill="none"
          stroke={LLUVIA}
          strokeOpacity="0.6"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Gotas de lluvia, de cero a tres. */}
        {meses.map((m, i) =>
          Array.from({ length: m.rain }).map((_, g) => (
            <circle
              key={`g-${i}-${g}`}
              cx={x(i)}
              cy={ALTO - 9 - g * 9}
              r="3"
              fill={LLUVIA}
              opacity={i === seleccionado ? 0.95 : 0.32}
            />
          ))
        )}

        {/* Los dos extremos del mes elegido, con su cifra. */}
        <circle cx={x(seleccionado)} cy={y(maximos[seleccionado])} r="5" fill="#0f3736" />
        <circle cx={x(seleccionado)} cy={y(minimos[seleccionado])} r="4" fill="#0f3736" />
        <text
          x={x(seleccionado)}
          y={y(maximos[seleccionado]) - 14}
          textAnchor="middle"
          className="fill-slate-900 font-heading text-[16px] font-bold"
        >
          {maximos[seleccionado]}°
        </text>
        <text
          x={x(seleccionado)}
          y={y(minimos[seleccionado]) + 22}
          textAnchor="middle"
          className="fill-slate-500 font-heading text-[13px] font-bold"
        >
          {minimos[seleccionado]}°
        </text>

        {/* Zonas de pulsación: ocupan todo el alto, mucho mayores que la
            marca, para que se pueda acertar con el dedo. */}
        {meses.map((_, i) => (
          <rect
            key={`z-${i}`}
            x={PASO * i}
            y="0"
            width={PASO}
            height={ALTO}
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onSeleccionar(i)}
          >
            <title>{`${etiquetas[i]}: ${meses[i].tMax}° / ${meses[i].tMin}°`}</title>
          </rect>
        ))}
      </svg>

      {/* Los meses, en pastillas. Antes eran doce rótulos de 10px con un
          filete debajo: para elegir mes había que apuntar a una palabra
          diminuta, y en un móvil eso no se acierta. */}
      <div className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-12">
        {etiquetas.map((m, i) => (
          <button
            key={m}
            type="button"
            onClick={() => onSeleccionar(i)}
            aria-pressed={i === seleccionado}
            className={cn(
              "relative rounded-lg py-2.5 font-heading text-[11px] font-bold uppercase tracking-wider transition-colors",
              i === seleccionado
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {m}
            {/* Punto ámbar en los meses recomendados. Va SOBRE la pastilla,
                así que sigue viéndose cuando está elegida; el filete de
                antes quedaba tapado. */}
            {recomendados.includes(i) && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-1/2 top-1 size-1.5 -translate-x-1/2 rounded-full",
                  i === seleccionado ? "bg-amber-400" : "bg-amber-500"
                )}
              />
            )}
          </button>
        ))}
      </div>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ background: TEMP }} />
          {rotulos.max}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full opacity-70" style={{ background: LLUVIA }} />
          {rotulos.min}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full" style={{ background: LLUVIA }} />
          {rotulos.rain}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-amber-500" />
          {rotulos.best}
        </span>
        <span className="ml-auto tabular-nums">
          {suelo}° — {techo}°
        </span>
      </figcaption>
    </figure>
  );
}

interface SeasonPanelProps {
  categorySlug: string;
  locale: string;
}

export function SeasonPanel({ categorySlug, locale }: SeasonPanelProps) {
  const t = useTranslations("season");
  const l = locale as "es" | "en" | "pt";
  const region = climateForCategory(categorySlug);

  const [month, setMonth] = useState(() => region.best[0] ?? new Date().getMonth());
  const data = region.months[month];
  const isBest = region.best.includes(month);

  const months = t.raw("months") as string[];
  const monthsLong = t.raw("monthsLong") as string[];
  const rainLevels = t.raw("rainLevels") as string[];
  const crowdLevels = t.raw("crowdLevels") as string[];

  /* El dibujo resume el mes: primero manda la lluvia, luego el sol. */
  const glyph =
    data.rain >= 2 ? (
      <RainGlyph intensity={data.rain} />
    ) : data.rain === 1 ? (
      <CloudGlyph />
    ) : (
      <SunGlyph soft={data.tMax < 20} />
    );

  return (
    <section className="border-t border-slate-200 pt-10">
      <p className="eyebrow text-amber-600">{t("badge")}</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-slate-900">
        {t("title")}
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">
        {t("lead")}
      </p>

      <CintaAnual
        meses={region.months}
        etiquetas={months}
        seleccionado={month}
        onSeleccionar={setMonth}
        recomendados={region.best}
        rotulos={{
          max: t("chartMax"),
          min: t("chartMin"),
          rain: t("chartRain"),
          best: t("chartBest"),
          aria: t("chartAria", { month: monthsLong[month] }),
        }}
      />

      {/* `key` en el contenedor, y no solo en el dibujo: sin él esta caja se
          monta una vez y su entrada solo se ve al cargar la página, no al
          cambiar de mes, que es cuando tiene sentido. Al remontar el
          contenedor se remonta también el dibujo, así que ambas entradas
          arrancan a la vez en lugar de por separado. */}
      <div key={month} className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr] month-content">
        <div
          className="season-glyph flex size-24 items-center justify-center rounded-md bg-slate-900 p-4 text-teal-300"
        >
          {glyph}
        </div>

        <div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="font-heading text-xl font-bold text-slate-900">
              {monthsLong[month]}
            </h3>
            {isBest && (
              <span className="eyebrow rounded-full bg-amber-500 px-2.5 py-1 text-slate-900">
                {t("recommended")}
              </span>
            )}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
            <div>
              <dt className="eyebrow text-slate-400">{t("day")}</dt>
              <dd className="mt-1 font-heading text-2xl font-bold tabular-nums text-slate-900">
                {data.tMax}°
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-slate-400">{t("night")}</dt>
              <dd className="mt-1 font-heading text-2xl font-bold tabular-nums text-slate-900">
                {data.tMin}°
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-slate-400">{t("rain")}</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-700">
                {rainLevels[data.rain]}
              </dd>
              <Level value={data.rain} tone="rain" />
            </div>
            <div>
              <dt className="eyebrow text-slate-400">{t("crowd")}</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-700">
                {crowdLevels[data.crowd]}
              </dd>
              <Level value={data.crowd} tone="crowd" />
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-7 border-l-2 border-teal-500 pl-5">
        <p className="eyebrow text-teal-700">{t("best")}</p>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
          {pickLocalized(region.why, l)}
        </p>
        {region.altitude && (
          <p className="mt-3 text-xs text-slate-400">
            {t("altitude")}: {region.altitude.toLocaleString(l)} m · {t("note")}
          </p>
        )}
      </div>
    </section>
  );
}
