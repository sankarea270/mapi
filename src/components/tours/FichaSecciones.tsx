"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface SeccionFicha {
  id: string;
  label: string;
  icon: ReactNode;
}

/**
 * Índice clavado de la ficha, que sigue a la lectura.
 *
 * Sustituye a las pestañas. Aquellas escondían el itinerario, la ubicación y
 * las reseñas detrás de un clic: quien bajaba por la ficha no llegaba a
 * verlos nunca, y un buscador los recibía como contenido oculto. Además la
 * barra se clavaba a 64px de arriba cuando la cabecera mide 132, así que al
 * bajar quedaba entera por debajo de ella.
 *
 * Ahora todo el contenido está a la vista, seguido, y este índice solo dice
 * dónde estás y te lleva. La marca de la sección activa no salta de una a
 * otra: se desliza y cambia de ancho, y al pulsar una sección lejana recorre
 * las intermedias a la vez que la página, porque sigue al scroll y no al
 * clic. Es lo que hace que se lea como un mismo gesto y no como dos.
 */
export function FichaSecciones({
  secciones,
  ariaLabel,
}: {
  secciones: SeccionFicha[];
  ariaLabel: string;
}) {
  const reducido = useReducedMotion();
  const [activa, setActiva] = useState(secciones[0]?.id ?? "");
  const [marca, setMarca] = useState<{ x: number; w: number } | null>(null);

  const listaRef = useRef<HTMLDivElement>(null);
  const botones = useRef(new Map<string, HTMLButtonElement>());

  /* Qué sección se está leyendo. La última cuyo arranque ya pasó una línea
     situada a un tercio de la ventana, contando desde debajo de la cabecera
     y de este mismo índice. Con un observador de intersección las secciones
     cortas —la ubicación son cuatro líneas— podían cruzar la franja sin
     llegar a marcarse nunca. */
  useEffect(() => {
    let raf = 0;
    const medir = () => {
      raf = 0;
      const lista = listaRef.current;
      const suelo = (lista?.getBoundingClientRect().bottom ?? 0) + window.innerHeight * 0.28;
      let actual = secciones[0]?.id ?? "";
      for (const s of secciones) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= suelo) actual = s.id;
      }
      /* Al final de la página la última sección puede no llegar nunca a la
         línea, porque no queda más scroll. Si ya no se puede bajar, manda la
         última. */
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        actual = secciones[secciones.length - 1]?.id ?? actual;
      }
      setActiva(actual);
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, [secciones]);

  /* La marca se coloca bajo el botón activo, y en el móvil el índice se
     desplaza para que ese botón quede a la vista. */
  useEffect(() => {
    const lista = listaRef.current;
    const boton = botones.current.get(activa);
    if (!lista || !boton) return;

    const colocar = () => setMarca({ x: boton.offsetLeft, w: boton.offsetWidth });
    colocar();

    if (lista.scrollWidth > lista.clientWidth) {
      lista.scrollTo({
        left: boton.offsetLeft - (lista.clientWidth - boton.offsetWidth) / 2,
        behavior: reducido ? "auto" : "smooth",
      });
    }

    /* Las fuentes cargan tarde y cambian el ancho de los rótulos. */
    const ro = new ResizeObserver(colocar);
    ro.observe(boton);
    return () => ro.disconnect();
  }, [activa, reducido]);

  function ir(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="ficha-indice sticky z-30 -mx-4 border-y border-slate-200 bg-white/90 backdrop-blur-md sm:mx-0 sm:rounded-lg sm:border"
      style={{ top: "var(--alto-cabecera, 8.25rem)" }}
    >
      <div
        ref={listaRef}
        className="relative flex gap-1 overflow-x-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* La marca va detrás de los rótulos, no dentro del activo: así puede
            viajar de uno a otro en vez de aparecer y desaparecer. */}
        {marca && (
          <span
            aria-hidden
            className="ficha-marca absolute bottom-1.5 left-0 top-1.5 rounded-md bg-teal-700"
            style={{ transform: `translateX(${marca.x}px)`, width: marca.w }}
          />
        )}

        {secciones.map((s) => {
          const esta = s.id === activa;
          return (
            <button
              key={s.id}
              ref={(el) => {
                if (el) botones.current.set(s.id, el);
                else botones.current.delete(s.id);
              }}
              type="button"
              onClick={() => ir(s.id)}
              aria-current={esta ? "location" : undefined}
              className={cn(
                "relative flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 font-heading text-[13px] font-bold uppercase tracking-[0.1em] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:px-5",
                esta ? "text-white" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <span
                className={cn(
                  "shrink-0 transition-colors duration-300 [&>svg]:size-4",
                  esta ? "text-amber-400" : "text-slate-400"
                )}
              >
                {s.icon}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
