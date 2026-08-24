"use client";

import { Gem, Star, Medal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const CERTIFICATIONS = [
  {
    icon: Star,
    name: "Marca Perú",
    type: "Autorización Oficial",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  },
  {
    icon: Gem,
    name: "DIRCETUR",
    type: "Directorio Regional",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  },
  {
    icon: Medal,
    name: "MINCETUR",
    type: "Ministerio de Comercio",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  },
  {
    icon: Star,
    name: "SERNANP",
    type: "Áreas Naturales",
    color: "text-slate-700",
    bgColor: "bg-slate-50"
  }
];

export function CertificationsSection() {
  const t = useTranslations("about");
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mx-auto max-w-2xl text-center scroll-animate ${isVisible ? "animate-fade-in-down" : ""}`}>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {t("certifications.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            {t("certifications.subtitle")}
          </p>
        </div>

        {/* Logos de certificaciones */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CERTIFICATIONS.map((cert, index) => {
            const Icon = cert.icon;
            return (
              <div
                key={cert.name}
                className={`group relative overflow-hidden rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 transition-all duration-500 hover:shadow-lg hover:ring-slate-200 scroll-animate ${
                  isVisible ? `animate-fade-in-up delay-${(index + 1) * 150}` : ""
                }`}
              >
                {/* Efecto de gradiente al hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cert.color.replace('text-', 'from-')} to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />
                
                <div className={`mx-auto inline-flex size-16 items-center justify-center rounded-xl ${cert.bgColor} transition-transform duration-500 group-hover:scale-110`}>
                  <Icon className={`size-8 ${cert.color}`} strokeWidth={2.5} />
                </div>
                
                <h3 className="mt-4 font-heading text-lg font-bold text-slate-900">
                  {cert.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{cert.type}</p>
              </div>
            );
          })}
        </div>

        {/* Texto adicional */}
        <div className={`mt-12 text-center scroll-animate ${isVisible ? "animate-fade-in-up delay-600" : ""}`}>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-600">
            {t("certifications.description")}
          </p>
        </div>
      </div>
    </section>
  );
}