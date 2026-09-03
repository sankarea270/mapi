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
    <span className="mt-2 flex gap-1" aria-hidden="true">
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

function CurvaAnual({
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
  /* El lienzo se dimensiona cerca del tamaño real al que se dibuja (unos
     800px en la columna de contenido). Con un viewBox más pequeño, el SVG se
     amplía para llenar el ancho y arrastra consigo grosores y radios: un
     trazo de 2 se ve de 3,4 y las barras de lluvia salen como ladrillos. */
  const A = 800;
  const ALTO_T = 158;
  const ALTO_LL = 42;
  const HUECO = 10;
  const PASO = A / 12;

  const maximos = meses.map((m) => m.tMax);
  const minimos = meses.map((m) => m.tMin);
  const techo = Math.ceil(Math.max(...maximos) / 5) * 5;
  const suelo = Math.floor(Math.min(...minimos) / 5) * 5;
  const rango = Math.max(techo - suelo, 1);

  const x = (i: number) => PASO * i + PASO / 2;
  const y = (t: number) => ALTO_T - ((t - suelo) / rango) * (ALTO_T - 24) - 12;

  const linea = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  /* La banda se cierra recorriendo las máximas de ida y las mínimas de
     vuelta: el hueco entre ambas es la oscilación de cada mes.
     El camino de vuelta tiene que recorrer los DOCE meses. Saltarse alguno
     no deja un hueco pequeño: dibuja una diagonal recta entre dos puntos
     lejanos y la banda deja de representar los datos. */
  const banda =
    linea(maximos) +
    " " +
    minimos
      .map((_, i) => {
        const j = 11 - i;
        return `L ${x(j).toFixed(1)} ${y(minimos[j]).toFixed(1)}`;
      })
      .join(" ") +
    " Z";

  return (
    <figure className="mt-7">
      <svg
        viewBox={`0 0 ${A} ${ALTO_T + ALTO_LL + HUECO}`}
        className="w-full"
        role="img"
        aria-label={rotulos.aria}
      >
        {/* Rejilla: solo dos trazos, para situar sin competir. */}
        {[0.25, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={A}
            y1={ALTO_T * f}
            y2={ALTO_T * f}
            stroke="#e1e0d9"
            strokeWidth="1"
          />
        ))}

        <path d={banda} fill={TEMP} opacity="0.16" />
        <path d={linea(maximos)} fill="none" stroke={TEMP} strokeWidth="2" strokeLinejoin="round" />
        <path
          d={linea(minimos)}
          fill="none"
          stroke={TEMP}
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.75"
          strokeLinejoin="round"
        />

        {/* Lluvia: franja propia bajo la curva, mismo eje de meses.
            La línea de base es lo que distingue "aquí no llueve" de "aquí
            falta el dato": sin ella, los meses secos son un hueco. */}
        <line
          x1="0"
          x2={A}
          y1={ALTO_T + HUECO + ALTO_LL}
          y2={ALTO_T + HUECO + ALTO_LL}
          stroke="#c3c2b7"
          strokeWidth="1"
        />
        {meses.map((m, i) => {
          const h = (m.rain / 3) * ALTO_LL;
          return (
            <rect
              key={`ll-${i}`}
              x={x(i) - PASO * 0.18}
              y={ALTO_T + HUECO + (ALTO_LL - h)}
              width={PASO * 0.36}
              height={h}
              rx="2"
              fill={LLUVIA}
              opacity={i === seleccionado ? 1 : 0.4}
            />
          );
        })}

        {/* Marca del mes elegido: una plomada de lado a lado que ata la
            temperatura con la lluvia de ese mes. */}
        <line
          x1={x(seleccionado)}
          x2={x(seleccionado)}
          y1="0"
          y2={ALTO_T + HUECO + ALTO_LL}
          stroke="#0f3736"
          strokeWidth="1.5"
        />
        <circle cx={x(seleccionado)} cy={y(maximos[seleccionado])} r="4" fill="#0f3736" />
        <circle cx={x(seleccionado)} cy={y(minimos[seleccionado])} r="3" fill="#0f3736" />

        {/* Zonas de pulsación: ocupan todo el alto, mucho mayores que la
            marca, para que se pueda acertar con el dedo. */}
        {meses.map((_, i) => (
          <rect
            key={`z-${i}`}
            x={PASO * i}
            y="0"
            width={PASO}
            height={ALTO_T + ALTO_LL + HUECO}
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onSeleccionar(i)}
          >
            <title>{`${etiquetas[i]}: ${meses[i].tMax}° / ${meses[i].tMin}°`}</title>
          </rect>
        ))}
      </svg>

      {/* Eje de meses. Los recomendados llevan filete ámbar debajo. */}
      <div className="mt-1.5 grid grid-cols-12">
        {etiquetas.map((m, i) => (
          <button
            key={m}
            type="button"
            onClick={() => onSeleccionar(i)}
            aria-pressed={i === seleccionado}
            className={cn(
              "border-b-2 pb-1 pt-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
              i === seleccionado
                ? "border-slate-900 text-slate-900"
                : recomendados.includes(i)
                  ? "border-amber-500 text-slate-500 hover:text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-700"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ background: TEMP }} />
          {rotulos.max}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-0.5 w-4 rounded-full opacity-70"
            style={{ backgroundImage: `repeating-linear-gradient(90deg, ${TEMP} 0 3px, transparent 3px 6px)` }}
          />
          {rotulos.min}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2 rounded-sm" style={{ background: LLUVIA }} />
          {rotulos.rain}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-amber-500" />
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
      <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-slate-900">
        {t("title")}
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">
        {t("lead")}
      </p>

      <CurvaAnual
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

      <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr]">
        {/* Dibujo del mes. `key` fuerza el remontaje para reanimar al cambiar. */}
        <div
          key={month}
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
