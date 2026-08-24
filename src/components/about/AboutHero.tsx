"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function AboutHero() {
  const t = useTranslations("about");
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section 
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    >
      {/* Imagen de fondo con parallax */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1920&auto=format&fit=crop"
          alt="Machu Picchu - Nuestro Perú"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-900/80" />
      </div>

      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <div className={`scroll-animate ${isVisible ? "animate-fade-in-down" : ""}`}>
          <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-slate-200 sm:text-2xl">
            {t("hero.subtitle")}
          </p>
        </div>

        <div className={`mt-8 scroll-animate ${isVisible ? "animate-fade-in-up delay-300" : ""}`}>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {t("hero.description")}
          </p>
        </div>

        {/* CTA decorativo */}
        <div className={`mt-12 scroll-animate ${isVisible ? "animate-fade-in-scale delay-500" : ""}`}>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 py-4 backdrop-blur-sm">
            <div className="size-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-white">
              {t("hero.badge")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}