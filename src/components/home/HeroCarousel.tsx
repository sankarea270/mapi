"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HERO_SLIDES, type HeroSlide } from "@/data/portada";

const INTERVAL = 7000;

export interface TextosPortada {
  /** Rótulo de la agencia, encima del titular. */
  volante: string;
  /** Titular y entradilla de la marca: se usan cuando la foto no trae los
      suyos, y el de la marca es siempre el encabezado de la página. */
  titulo: string;
  subtitulo: string;
  ctaTours: string;
  ctaContacto: string;
  whatsapp: string;
  verDestino: string;
  verTours: string;
}

/**
 * La primera pantalla del sitio: la foto y, sobre ella, el nombre del lugar
 * que se ve.
 *
 * El titular ya no es una frase fija sobre once fotos distintas: cambia con
 * la foto —Cusco, Machu Picchu, Salkantay…— y la llamada lleva a la página
 * de ese destino. Las fotos y sus textos se leen de Supabase al compilar y
 * se editan en «Portada» del panel.
 *
 * El texto va en el bloque grande de la izquierda y no en una tarjeta
 * aparte: es lo primero que se lee, y una tarjeta pequeña en una esquina
 * compite con el titular en vez de sustituirlo.
 */
export function HeroCarousel({
  slides,
  textos,
}: {
  slides?: HeroSlide[];
  textos: TextosPortada;
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

  const slide = SLIDES[active];
  const titulo = slide?.titulo || textos.titulo;
  const descripcion = slide?.descripcion || textos.subtitulo;
  const href = slide?.href || "/tours";
  const cta = !slide?.href
    ? textos.ctaTours
    : slide.href.startsWith("/destinos/")
      ? textos.verDestino
      : textos.verTours;
  const dos = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="absolute inset-0 flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.src}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === active ? "z-10 opacity-100" : "z-0 opacity-0"
          )}
        >
          <Image
            src={s.src}
            alt={s.alt}
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
            placeholder={s.blur ? "blur" : "empty"}
            blurDataURL={s.blur}
            className={cn(
              "object-cover",
              i === active && !reduced && "animate-[ken-burns_25s_ease-in-out_infinite_alternate]"
            )}
          />
        </div>
      ))}

      {/* Sombra muy suave arriba y abajo: la foto conserva sus colores y el
          texto lleva su propio contorno. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/15 via-transparent to-black/25"
      />

      {/* El encabezado de la página es el de la agencia, aunque lo que se lea
          grande sea el nombre del lugar de la foto. */}
      <h1 className="sr-only">
        {textos.titulo} · {textos.volante}
      </h1>

      <div className="portada-caja relative z-20 mx-auto w-full max-w-7xl px-4 pb-36 pt-8 sm:px-6 sm:pb-44 sm:pt-12 lg:pb-48">
        {/* Más ancho que el resto del bloque: a cuerpo de cartel, un nombre
            como «Machu Picchu» no cabía en una línea y se partía en dos. */}
        <div className="max-w-3xl lg:max-w-[58rem] xl:max-w-[66rem]">
          <p className="portada-contorno-claro flex items-center gap-3 font-heading text-[0.95rem] font-bold uppercase tracking-[0.14em] text-teal-800 sm:text-[1.1rem]">
            {textos.volante}
            <span aria-hidden className="h-px w-8 bg-teal-800/50 sm:w-12" />
            <span className="portada-contorno-oscuro tabular-nums text-oro">
              {dos(active + 1)} / {dos(SLIDES.length)}
            </span>
          </p>

          {/* Todo lo que cambia con la foto va en el mismo bloque y con la
              misma clave: así entra junto, en cascada, y no a trompicones.
              El corchete de filete fino se dibuja con él y encuadra el
              titular sin encerrarlo en una caja, que sobre una foto siempre
              acaba pareciendo un cartel pegado encima. */}
          <div key={active} aria-live="polite" className="relative mt-4 pl-5 sm:pl-7">
            <span
              aria-hidden
              className="portada-filete portada-filete--sup absolute left-0 top-0 h-24 w-8 border-l border-t border-[color-mix(in_srgb,var(--color-oro)_70%,transparent)] sm:h-32 sm:w-12"
            />
            <span
              aria-hidden
              className="portada-filete portada-filete--inf absolute bottom-0 left-0 h-12 w-5 border-b border-l border-[color-mix(in_srgb,var(--color-oro)_45%,transparent)] sm:w-8"
            />

            {/* El nombre del lugar, a cuerpo de cartel y en didona. Entra
                palabra por palabra, subiendo desde debajo de su propia línea:
                cada una lleva su ventana con el desbordamiento recortado, así
                que asoman como en un letrero de cine y no aparecen de golpe.
                El cuerpo lo fija `.portada-titular` con `clamp()`, que sube y
                baja con el ancho de la ventana sin escalones. */}
            <p className="portada-titular portada-contorno-oscuro text-oro" aria-label={titulo}>
              {titulo.split(" ").map((palabra, i) => (
                <span key={`${palabra}-${i}`} aria-hidden className="portada-palabra">
                  <span style={{ animationDelay: `${0.06 + i * 0.09}s` }}>{palabra}</span>
                </span>
              ))}
            </p>

            <p
              className="portada-contorno-claro mt-4 max-w-2xl font-logo text-xl font-semibold leading-snug text-teal-800 sm:mt-5 sm:text-2xl lg:text-[1.75rem]"
              style={{ animation: "text-reveal 0.7s ease-out both 0.18s" }}
            >
              {descripcion}
            </p>

            <div
              className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-5 sm:mt-9"
              style={{ animation: "text-reveal 0.7s ease-out both 0.3s" }}
            >
              <Link
                href={href}
                className="group inline-flex items-center gap-2.5 bg-amber-500 px-8 py-3.5 font-heading text-[13px] font-bold uppercase tracking-[0.12em] text-slate-950 transition-all hover:scale-[1.02] hover:bg-amber-400 sm:px-10 sm:py-4 sm:text-sm"
              >
                {cta}
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
              <a
                href={textos.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="portada-contorno-claro border-b-2 border-teal-800/60 pb-1 font-heading text-[13px] font-bold uppercase tracking-[0.12em] text-teal-800 transition-all hover:border-amber-500 hover:text-teal-950 sm:text-sm"
              >
                {textos.ctaContacto}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Las dos flechas van juntas y siempre fuera del texto: abajo a la
          izquierda en pantallas estrechas —a la derecha estaría el botón de
          contacto— y en el costado derecho en escritorio, que es la mitad
          despejada de la foto. Repartidas a los dos lados, la de la
          izquierda caía encima del titular en cuanto la ventana se
          estrechaba. */}
      <div className="absolute bottom-3 left-4 z-30 flex gap-2 lg:bottom-auto lg:left-auto lg:right-6 lg:top-1/2 lg:-translate-y-1/2">
        <button
          type="button"
          onClick={() => setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
          aria-label="Imagen anterior"
          className="grid size-10 place-items-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/50 lg:size-12"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Siguiente imagen"
          className="grid size-10 place-items-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/50 lg:size-12"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Puntos. El de la foto que se ve lleva una barra que se va llenando:
          dice cuánto falta para la siguiente sin añadir otro elemento. */}
      <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 gap-2 sm:bottom-6 sm:gap-2.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ir a imagen ${i + 1}`}
            aria-current={i === active || undefined}
            className={cn(
              "h-1.5 overflow-hidden rounded-full transition-all duration-500",
              i === active ? "w-8 bg-white/45" : "w-1.5 bg-white/40 hover:bg-white/60"
            )}
          >
            {i === active && (
              <span
                key={active}
                aria-hidden
                className="portada-leyenda-progreso block h-full w-full origin-left bg-amber-400"
                style={{
                  animationDuration: `${INTERVAL}ms`,
                  animationPlayState: paused || reduced ? "paused" : "running",
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
