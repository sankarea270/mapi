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

      {/* Cinta de meses: los recomendados llevan una marca ámbar. */}
      <div className="mt-7 flex overflow-x-auto rounded-md ring-1 ring-slate-200">
        {months.map((label, i) => {
          const on = i === month;
          const rec = region.best.includes(i);
          return (
            <button
              key={label}
              type="button"
              onClick={() => setMonth(i)}
              aria-pressed={on}
              aria-label={monthsLong[i]}
              className={cn(
                "relative flex-1 border-r border-slate-200 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors last:border-r-0",
                on
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {label}
              {rec && !on && (
                <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr]">
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
