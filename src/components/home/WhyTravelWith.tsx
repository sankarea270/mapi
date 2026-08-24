"use client";

import { Star, Crown, Sparkles, Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const FEATURES = [
  {
    icon: Star,
    titleKey: "trust.title",
    descKey: "trust.desc",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    animation: "animate-fade-in-left",
  },
  {
    icon: Crown,
    titleKey: "reputation.title",
    descKey: "reputation.desc",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    animation: "animate-fade-in-up",
  },
  {
    icon: Sparkles,
    titleKey: "satisfaction.title",
    descKey: "satisfaction.desc",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    animation: "animate-fade-in-down",
  },
  {
    icon: Leaf,
    titleKey: "impact.title",
    descKey: "impact.desc",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    animation: "animate-fade-in-right",
  },
];

export function WhyTravelWith() {
  const t = useTranslations("whyTravel");
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`text-center scroll-animate ${isVisible ? "animate-fade-in-down" : ""}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
            {t("badge")}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.titleKey}
                className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-lg hover:ring-amber-200 scroll-animate ${
                  isVisible ? `${feature.animation} delay-${(index + 2) * 100}` : ""
                }`}
              >
                <div
                  className={`inline-flex size-12 items-center justify-center rounded-xl ${feature.bgColor} transition-transform group-hover:scale-110`}
                >
                  <Icon className={`size-6 ${feature.color}`} strokeWidth={2.5} />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-slate-900">
                  {t(feature.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {t(feature.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
