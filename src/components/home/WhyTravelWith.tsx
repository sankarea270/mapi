"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const FEATURES = [
  { titleKey: "trust.title", descKey: "trust.desc" },
  { titleKey: "reputation.title", descKey: "reputation.desc" },
  { titleKey: "satisfaction.title", descKey: "satisfaction.desc" },
  { titleKey: "impact.title", descKey: "impact.desc" },
];

/**
 * Cuatro razones, resueltas como columnas de una página impresa: numeral
 * grande, filete de separación y texto alineado a la izquierda.
 *
 * Antes eran cuatro tarjetas idénticas con un icono dentro de un cuadrado de
 * color redondeado. Ese patrón —rejilla de tarjetas con icono genérico— es
 * el que hace que una web se reconozca al instante como plantilla, y además
 * los iconos no aportaban significado: eran Star, Crown, Sparkles y Leaf
 * para conceptos que ya explica el titular de cada columna.
 *
 * La foto de un viajero acompaña el bloque cuando existe. Es opcional a
 * propósito: `foto` llega en null si el archivo no está, y entonces las
 * razones ocupan el ancho completo como antes. Poner una imagen de relleno
 * habría sido peor que no poner ninguna —una foto genérica de banco es
 * justo lo que delata una plantilla— y un hueco roto, peor todavía.
 */
export function WhyTravelWith({ foto }: { foto?: string | null }) {
  const t = useTranslations("whyTravel");

  const razones = (
    <div
      className={cn(
        "aparece-hijos grid gap-x-10 gap-y-11",
        foto ? "sm:grid-cols-2" : "mt-14 sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {FEATURES.map((feature, index) => (
        <div key={feature.titleKey} className="border-t-2 border-slate-900 pt-5">
          <span className="font-heading text-sm font-bold tabular-nums text-amber-600">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-3 font-heading text-xl font-bold leading-snug text-slate-900">
            {t(feature.titleKey)}
          </h3>
          <p className="mt-2.5 text-[15px] leading-relaxed text-slate-600">
            {t(feature.descKey)}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <section className="border-t border-slate-200 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Encabezado alineado a la izquierda: el centrado de todo es otra
            señal de plantilla, y aquí compite con las cuatro columnas. */}
        {/* `aparece-hijos` en vez de `rise-in`: aquella es una animación de
            tiempo que arranca al cargar la página, así que en una sección
            tan abajo terminaba antes de que nadie la viera. */}
        <div className="aparece-hijos max-w-2xl">
          <p className="eyebrow text-amber-600">{t("badge")}</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.6rem] sm:leading-[1.1]">
            {t("title")}
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600">
            {t("subtitle")}
          </p>
        </div>

        {foto ? (
          <div className="mt-14 grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
            {/* La foto va en vertical y algo más alta que ancha: es un
                retrato de viaje, no un banner. El recuadro ámbar desplazado
                le da profundidad sin recurrir a sombras difusas. */}
            <figure className="journey-plate relative">
              <span
                aria-hidden
                className="absolute -bottom-3 -left-3 h-full w-full rounded-lg border-2 border-amber-500/70"
              />
              <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={foto}
                  alt={t("photoAlt")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </figure>

            <div className="lg:pt-2">{razones}</div>
          </div>
        ) : (
          razones
        )}
      </div>
    </section>
  );
}
