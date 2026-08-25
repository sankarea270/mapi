"use client";

import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
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
 */
export function WhyTravelWith() {
  const t = useTranslations("whyTravel");
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="border-t border-slate-200 bg-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Encabezado alineado a la izquierda: el centrado de todo es otra
            señal de plantilla, y aquí compite con las cuatro columnas. */}
        <div className="max-w-2xl">
          <p className="eyebrow text-amber-600">{t("badge")}</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.6rem] sm:leading-[1.1]">
            {t("title")}
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.titleKey}
              style={{ ["--i" as string]: index }}
              className={cn(
                "border-t-2 border-slate-900 pt-5",
                isVisible && "rise-in"
              )}
            >
              <span className="font-heading text-sm font-bold tabular-nums text-amber-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-heading text-xl font-bold leading-snug text-slate-900">
                {t(feature.titleKey)}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
