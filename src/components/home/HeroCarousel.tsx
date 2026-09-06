"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HERO_SLIDES, type HeroSlide } from "@/data/portada";

const INTERVAL = 7000;

/**
 * Las fotos llegan desde arriba, leídas de Supabase al compilar. Antes
 * estaban escritas aquí dentro, así que cambiar la primera pantalla del sitio
 * exigía tocar el código y volver a desplegar a mano.
 */
export function HeroCarousel({ slides }: { slides?: HeroSlide[] }) {
  /* Memorizado porque `next` depende de cuántas hay: sin esto la referencia
     cambia en cada render, el temporizador se reinicia y el carrusel no
     llega a pasar de foto nunca. */
  const SLIDES = useMemo(() => (slides?.length ? slides : HERO_SLIDES), [slides]);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  const next = useCallback(() => {
    setActive((i) => (i + 1) % SLIDES.length);
  }, [SLIDES.length]);

  useEffect(() => {
    if (paused || reduced) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next, reduced]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === active ? "z-10 opacity-100" : "z-0 opacity-0"
          )}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            quality={i === 0 ? 90 : 75}
            sizes="100vw"
            placeholder="blur"
            blurDataURL={slide.blur}
            className={cn(
              "object-cover",
              i === active && !reduced && "animate-[ken-burns_25s_ease-in-out_infinite_alternate]"
            )}
          />
        </div>
      ))}

      {/* Arrows */}
      <button
        type="button"
        onClick={() => setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Imagen anterior"
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 grid size-11 place-items-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-105 sm:left-6 sm:size-12"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Siguiente imagen"
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 grid size-11 place-items-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-105 sm:right-6 sm:size-12"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ir a imagen ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === active
                ? "w-8 bg-amber-400"
                : "w-1.5 bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
