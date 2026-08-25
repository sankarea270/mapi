"use client";

import { useEffect, useState } from "react";
import { MapPin, Users, Calendar, Smile } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const STATS = [
  {
    icon: Calendar,
    number: 78,
    key: "tours",
    suffix: "+",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  },
  {
    icon: MapPin,
    number: 11,
    key: "destinations",
    suffix: "+",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  },
  {
    icon: Users,
    number: 25,
    key: "team",
    suffix: "+",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  },
  {
    icon: Smile,
    number: 2547,
    key: "happyTravelers",
    suffix: "+",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  }
];

function AnimatedCounter({ number, isVisible, duration = 2000 }: { number: number; isVisible: boolean; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const increment = number / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= number) {
        setCount(number);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, number, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export function StatsSection() {
  const t = useTranslations("about");
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.2);

  return (
    <section 
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative bg-gradient-to-b from-slate-50 to-white py-20"
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mx-auto max-w-2xl text-center scroll-animate ${isVisible ? "animate-fade-in-down" : ""}`}>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {t("stats.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            {t("stats.subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className={`group relative overflow-hidden rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100 transition-all duration-500 hover:shadow-xl hover:ring-slate-200 scroll-animate ${
                  isVisible ? `animate-fade-in-scale delay-${(index + 1) * 100}` : ""
                }`}
              >
                {/* Efecto de brillo al hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />
                
                {/* Icono */}
                <div className={`mx-auto inline-flex size-16 items-center justify-center rounded-xl ${stat.bgColor} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  <Icon className={`size-8 ${stat.color}`} strokeWidth={2.5} />
                </div>

                {/* Número animado */}
                <div className="mt-6">
                  <div className={`font-heading text-4xl font-bold ${stat.color} sm:text-5xl`}>
                    <AnimatedCounter number={stat.number} isVisible={isVisible} />
                    <span className="ml-1">{stat.suffix}</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">
                    {t(`stats.${stat.key}.title`)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {t(`stats.${stat.key}.subtitle`)}
                  </p>
                </div>

                {/* Elemento decorativo */}
                <div className={`absolute -bottom-1 -right-1 size-8 rounded-full ${stat.bgColor} opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}