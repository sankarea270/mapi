"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * La línea de ruta del itinerario, que se va trazando al leer.
 *
 * Antes era una línea fija con un degradado. Ahora el tramo recorrido se
 * pinta en petróleo a medida que la lectura baja, y cada día que la línea
 * alcanza se enciende. Da una idea física de "por dónde vas" en un viaje de
 * varios días sin añadir nada que leer.
 *
 * El trazo no va pegado al scroll: persigue su posición con un pequeño
 * retardo. Pegado, cada salto de la rueda del ratón se veía como un salto de
 * la línea; así avanza como tinta, no a golpes.
 *
 * Las paradas se marcan con `data-parada` en el marcado del servidor; aquí
 * solo se les pone `data-pasada` cuando la línea llega a ellas.
 */
export function RutaItinerario({ children }: { children: ReactNode }) {
  const cajaRef = useRef<HTMLDivElement>(null);
  const trazoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const caja = cajaRef.current;
    const trazo = trazoRef.current;
    if (!caja || !trazo) return;

    const paradas = [...caja.querySelectorAll<HTMLElement>("[data-parada]")];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      trazo.style.transform = "scaleY(1)";
      paradas.forEach((p) => p.setAttribute("data-pasada", ""));
      return;
    }

    let visible = false;
    let raf = 0;
    let mostrado = 0;
    let antes = performance.now();

    const paso = (ahora: number) => {
      const dt = Math.min(64, ahora - antes);
      antes = ahora;

      const r = caja.getBoundingClientRect();
      /* La tinta llega a la altura de un poco más de la mitad de la ventana:
         lo que tienes delante ya está trazado, lo de abajo todavía no. */
      const meta = Math.min(1, Math.max(0, (window.innerHeight * 0.58 - r.top) / r.height));
      mostrado += (meta - mostrado) * (1 - Math.exp(-dt / 140));
      trazo.style.transform = `scaleY(${mostrado.toFixed(4)})`;

      const alcance = mostrado * r.height;
      for (const p of paradas) {
        const pasada = p.offsetTop + 22 <= alcance;
        if (pasada !== p.hasAttribute("data-pasada")) p.toggleAttribute("data-pasada", pasada);
      }

      raf = visible || Math.abs(meta - mostrado) > 0.001 ? requestAnimationFrame(paso) : 0;
    };

    /* Solo se calcula mientras el itinerario está cerca de la pantalla. */
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) {
          antes = performance.now();
          raf = requestAnimationFrame(paso);
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(caja);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={cajaRef} className="relative">
      <div aria-hidden className="absolute bottom-4 left-[27px] top-6 w-px bg-slate-200" />
      <div
        ref={trazoRef}
        aria-hidden
        className="absolute bottom-4 left-[27px] top-6 w-px origin-top bg-teal-600"
        style={{ transform: "scaleY(0)" }}
      />
      {children}
    </div>
  );
}
