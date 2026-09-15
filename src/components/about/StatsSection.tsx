"use client";

import { useEffect, useState } from "react";
import { MapPin, Users, Calendar, Smile } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const STATS = [
  { icon: Calendar, number: 78, key: "tours", suffix: "+" },
  { icon: MapPin, number: 11, key: "destinations", suffix: "+" },
  { icon: Users, number: 25, key: "team", suffix: "+" },
  { icon: Smile, number: 2547, key: "happyTravelers", suffix: "+" },
];

/**
 * Cuenta hasta la cifra frenando al final, como un cuentakilómetros. El
 * contador de antes sumaba lo mismo cada 16ms y paraba en seco: se notaba
 * mecánico, y con 2547 las cifras pequeñas se quedaban en nada.
 */
function AnimatedCounter({ number, activo, retardo }: { number: number; activo: boolean; retardo: number }) {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!activo) return;
    if (reduced) {
      setCount(number);
      return;
    }
    const duracion = 1800;
    let marco = 0;
    let inicio = 0;
    const paso = (ahora: number) => {
      if (!inicio) inicio = ahora + retardo;
      const t = Math.min(1, Math.max(0, (ahora - inicio) / duracion));
      setCount(Math.round(number * (1 - Math.pow(1 - t, 4))));
      if (t < 1) marco = requestAnimationFrame(paso);
    };
    marco = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(marco);
  }, [activo, number, retardo, reduced]);

  return <span className="tabular-nums">{count.toLocaleString(locale)}</span>;
}

export function StatsSection() {
  const t = useTranslations("about");
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.2);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={cn(
            "mx-auto max-w-2xl text-center transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          )}
        >
          <h2 className="font-heading text-4xl font-bold uppercase leading-[0.95] text-slate-900 sm:text-5xl">
            {t("stats.title")}
          </h2>
          <p className="mt-4 font-logo text-lg leading-relaxed text-slate-600 sm:text-xl">
            {t("stats.subtitle")}
          </p>
        </div>

        {/* Una sola pieza con cuatro celdas, no cuatro tarjetas sueltas: las
            cifras se comparan de un vistazo, en la misma línea de base. */}
        <div className="mt-12 grid grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-40px_rgb(3_33_32/0.35)] ring-1 ring-slate-200 sm:mt-16 lg:grid-cols-4">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            const retardo = 120 + index * 140;
            return (
              <div
                key={stat.key}
                className={cn(
                  "group relative flex flex-col px-5 py-8 transition-colors duration-500 hover:bg-teal-50/60 sm:px-8 sm:py-10",
                  index % 2 === 0 && "border-r border-slate-200",
                  index < 2 && "border-b border-slate-200 lg:border-b-0",
                  index === 1 && "lg:border-r"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: `${retardo}ms` }}
                >
                  <span className="inline-grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 sm:size-11">
                    <Icon className="size-5" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="font-heading text-[11px] font-bold tabular-nums tracking-[0.16em] text-slate-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <p className="mt-6 flex items-start font-heading text-4xl font-bold leading-none text-teal-800 sm:text-6xl">
                  <AnimatedCounter number={stat.number} activo={isVisible} retardo={retardo} />
                  <span className="ml-0.5 text-[0.55em] leading-none text-amber-500">{stat.suffix}</span>
                </p>

                <p className="mt-4 font-heading text-sm font-bold uppercase tracking-[0.08em] text-slate-900 sm:text-base">
                  {t(`stats.${stat.key}.title`)}
                </p>
                <p className="mt-1 text-sm text-slate-500">{t(`stats.${stat.key}.subtitle`)}</p>

                {/* Se llena al entrar y se completa al pasar por encima. */}
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden">
                  <span
                    className={cn(
                      "block h-full origin-left bg-amber-500 transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 motion-reduce:transition-none",
                      isVisible ? "scale-x-[0.35]" : "scale-x-0"
                    )}
                    style={{ transitionDelay: isVisible ? "0ms" : `${retardo}ms` }}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
