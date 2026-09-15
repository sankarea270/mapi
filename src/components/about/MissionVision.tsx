"use client";

import { useEffect, useState } from "react";
import { Compass, Telescope, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * Misión, visión y valores.
 *
 * Eran tres tarjetas blancas idénticas con un icono gris: se leían como una
 * plantilla y ninguna pesaba más que otra. Aquí la misión —lo que hacemos
 * hoy— va en el verde de la marca, la visión —adónde vamos— en su tono
 * claro, y los valores cierran a lo ancho, que es lo que sostiene a las
 * dos. Mismo texto de siempre; cambia cómo se lee.
 */
const BLOQUES = [
  {
    icon: Compass,
    key: "mission",
    caja: "bg-teal-900 text-white ring-teal-900 lg:row-span-1",
    icono: "bg-white/10 text-amber-400 ring-white/15",
    titulo: "text-white",
    texto: "text-teal-50/85",
    numero: "text-white/10",
  },
  {
    icon: Telescope,
    key: "vision",
    caja: "bg-teal-50 text-teal-950 ring-teal-100",
    icono: "bg-white text-teal-700 ring-teal-100",
    titulo: "text-teal-950",
    texto: "text-slate-600",
    numero: "text-teal-900/[0.07]",
  },
] as const;

export function MissionVision() {
  const t = useTranslations("about");
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  /* Los retardos escalonan la entrada y luego se quitan: si se quedaran, el
     efecto al pasar el ratón también llegaría tarde. */
  const [entrado, setEntrado] = useState(false);
  useEffect(() => {
    if (!isVisible) return;
    const id = setTimeout(() => setEntrado(true), 1300);
    return () => clearTimeout(id);
  }, [isVisible]);

  const entra = (retardo: number) => ({
    className: cn(
      "transition-[opacity,translate,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
    ),
    style: { transitionDelay: entrado ? "0ms" : `${retardo}ms` },
  });

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div {...entra(0)}>
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-600">
              {t("missionVision.mission.title")} · {t("missionVision.vision.title")} ·{" "}
              {t("missionVision.values.title")}
            </span>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
            <h2 className="font-heading text-4xl font-bold uppercase leading-[0.95] text-slate-900 sm:text-5xl lg:text-6xl">
              {t("missionVision.title")}
            </h2>
            <p className="max-w-xl font-logo text-lg leading-relaxed text-slate-600 sm:text-xl lg:justify-self-end">
              {t("missionVision.subtitle")}
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 lg:grid-cols-2">
          {BLOQUES.map((b, i) => {
            const Icon = b.icon;
            const { className, style } = entra(150 + i * 120);
            return (
              <article
                key={b.key}
                style={style}
                className={cn(
                  className,
                  "group relative overflow-hidden rounded-2xl p-7 ring-1 sm:p-10",
                  "hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgb(3_33_32/0.5)]",
                  b.caja
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -right-2 -top-6 font-heading text-[9rem] font-bold leading-none tabular-nums transition-transform duration-700 group-hover:-translate-y-1 sm:text-[11rem]",
                    b.numero
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "relative inline-grid size-14 place-items-center rounded-2xl ring-1 transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-105",
                    b.icono
                  )}
                >
                  <Icon className="size-7" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className={cn("relative mt-7 font-heading text-3xl font-bold uppercase sm:text-4xl", b.titulo)}>
                  {t(`missionVision.${b.key}.title`)}
                </h3>
                <p className={cn("relative mt-4 max-w-[52ch] text-base leading-relaxed sm:text-[17px]", b.texto)}>
                  {t(`missionVision.${b.key}.description`)}
                </p>
              </article>
            );
          })}

          {(() => {
            const { className, style } = entra(400);
            return (
              <article
                style={style}
                className={cn(
                  className,
                  "group relative grid gap-6 overflow-hidden rounded-2xl bg-white p-7 ring-1 ring-slate-200 sm:p-10 lg:col-span-2 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-12",
                  "hover:ring-amber-300"
                )}
              >
                <span aria-hidden className="absolute inset-y-0 left-0 w-1 origin-top scale-y-50 bg-amber-500 transition-transform duration-700 group-hover:scale-y-100" />
                <div className="flex items-center gap-5">
                  <span className="inline-grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
                    <Sparkles className="size-7" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div>
                    <span className="font-heading text-sm font-bold tabular-nums tracking-[0.14em] text-amber-600">03</span>
                    <h3 className="font-heading text-3xl font-bold uppercase text-slate-900 sm:text-4xl">
                      {t("missionVision.values.title")}
                    </h3>
                  </div>
                </div>
                <p className="font-logo text-lg leading-relaxed text-slate-700 sm:text-xl">
                  {t("missionVision.values.description")}
                </p>
              </article>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
