"use client";

import { Compass, Telescope, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const VALUES = [
  {
    icon: Compass,
    key: "mission",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    gradientFrom: "from-slate-500",
    gradientTo: "to-slate-600"
  },
  {
    icon: Telescope,
    key: "vision",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    gradientFrom: "from-slate-500",
    gradientTo: "to-slate-600"
  },
  {
    icon: Sparkles,
    key: "values",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    gradientFrom: "from-slate-500",
    gradientTo: "to-slate-600"
  }
];

export function MissionVision() {
  const t = useTranslations("about");
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mx-auto max-w-2xl text-center scroll-animate ${isVisible ? "animate-fade-in-down" : ""}`}>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {t("missionVision.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            {t("missionVision.subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {VALUES.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={value.key}
                className={`group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100 transition-all duration-500 hover:shadow-2xl hover:ring-slate-200 scroll-animate ${
                  isVisible ? `animate-fade-in-up delay-${(index + 2) * 200}` : ""
                }`}
              >
                {/* Gradiente de fondo animado */}
                <div className={`absolute inset-0 bg-gradient-to-br ${value.gradientFrom} ${value.gradientTo} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />
                
                {/* Icono con animación */}
                <div className={`relative inline-flex size-16 items-center justify-center rounded-2xl ${value.bgColor} transition-transform duration-500 group-hover:scale-110`}>
                  <Icon className={`size-8 ${value.color} transition-transform duration-500 group-hover:rotate-6`} strokeWidth={2} />
                </div>

                <h3 className="relative mt-6 font-heading text-2xl font-bold text-slate-900">
                  {t(`missionVision.${value.key}.title`)}
                </h3>
                
                <p className="relative mt-4 text-base leading-relaxed text-slate-600">
                  {t(`missionVision.${value.key}.description`)}
                </p>

                {/* Elemento decorativo */}
                <div className="absolute -bottom-2 -right-2 size-20 rounded-full bg-gradient-to-br from-slate-100 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}