"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HERO_SLIDES, type HeroSlide } from "@/data/portada";

const INTERVAL = 7000;

/**
 * Las fotos llegan desde arriba, leídas de Supabase al compilar. Antes
 * estaban escritas aquí dentro, así que cambiar la primera pantalla del sitio
 * exigía tocar el código y volver a desplegar a mano.
 */
export interface TextosLeyenda {
  destino: string;
  aventura: string;
  tours: string;
  verDestino: string;
  verTours: string;
}

export function HeroCarousel({
  slides,
  textos,
}: {
  slides?: HeroSlide[];
  textos: TextosLeyenda;
}) {
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
            /* La miniatura de carga solo si la hay. Las cinco fotos de
               respaldo la traen escrita; las que se suben desde el panel,
               no. Pedir `placeholder="blur"` sin `blurDataURL` hace que
               Next lance una excepción y tumbe la página entera en
               desarrollo. En producción no se comprueba, así que el fallo
               estuvo publicado sin dar la cara: es de los peores, porque
               solo aparece al volver a tocar el proyecto. */
            placeholder={slide.blur ? "blur" : "empty"}
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
        className="absolute bottom-3 left-4 z-30 grid size-10 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:size-11 place-items-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-105 sm:left-6 lg:size-12"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Siguiente imagen"
        className="absolute bottom-3 left-16 z-30 grid size-10 sm:left-auto sm:right-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:size-11 place-items-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-105 sm:right-6 lg:size-12"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Leyenda de la foto que se ve: qué lugar es, una frase y adónde ir.
          Tarjeta clara y no texto sobre la foto, porque las once fotos son
          muy distintas —nevados blancos, selva oscura— y ningún color de
          letra se lee igual de bien sobre todas. La barra de abajo dice
          cuánto falta para la siguiente. */}
      {SLIDES[active]?.titulo && (
        <Leyenda
          key={active}
          slide={SLIDES[active]}
          numero={active + 1}
          total={SLIDES.length}
          textos={textos}
          detenida={paused || reduced}
        />
      )}

      {/* Dots */}
      <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 gap-2 sm:bottom-6 sm:gap-2.5">
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

function Leyenda({
  slide,
  numero,
  total,
  textos,
  detenida,
}: {
  slide: HeroSlide;
  numero: number;
  total: number;
  textos: TextosLeyenda;
  detenida: boolean;
}) {
  const href = slide.href ?? "";
  const esDestino = href.startsWith("/destinos/");
  const volante = esDestino ? textos.destino : /categoria=aventura/.test(href) ? textos.aventura : textos.tours;
  const dos = (n: number) => String(n).padStart(2, "0");

  const cuerpo = (
    <>
      <span className="flex items-center justify-between gap-3">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-amber-700">{volante}</span>
        <span className="font-heading text-[11px] font-bold tabular-nums tracking-[0.1em] text-slate-400">
          {dos(numero)} / {dos(total)}
        </span>
      </span>
      <span className="mt-1.5 block font-heading text-xl font-bold uppercase leading-tight text-teal-900 sm:text-2xl">
        {slide.titulo}
      </span>
      {slide.descripcion && (
        <span className="mt-1.5 block text-[13.5px] leading-snug text-slate-600 sm:text-sm">
          {slide.descripcion}
        </span>
      )}
      {href && (
        <span className="mt-3 inline-flex items-center gap-1.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-teal-700 transition-colors group-hover:text-amber-700">
          {esDestino ? textos.verDestino : textos.verTours}
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </span>
      )}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden rounded-b-xl bg-teal-900/10">
        <span
          className="portada-leyenda-progreso block h-full origin-left bg-amber-500"
          style={{ animationDuration: `${INTERVAL}ms`, animationPlayState: detenida ? "paused" : "running" }}
        />
      </span>
    </>
  );

  const clase =
    "portada-leyenda group absolute inset-x-4 bottom-16 z-30 block overflow-hidden rounded-xl bg-white/90 px-4 pb-4 pt-3 shadow-[0_18px_40px_-18px_rgb(2_6_23/0.55)] ring-1 ring-white/70 backdrop-blur-md sm:inset-x-auto sm:bottom-14 sm:right-6 sm:w-[21rem] sm:px-5 lg:bottom-28";

  return href ? (
    <Link href={href} className={clase} aria-live="polite">
      {cuerpo}
    </Link>
  ) : (
    <div className={clase} aria-live="polite">
      {cuerpo}
    </div>
  );
}
