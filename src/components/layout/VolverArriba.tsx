"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * «Volver arriba» para las páginas largas: las fichas de tour, las guías y
 * los textos legales miden varias pantallas y el único camino de vuelta era
 * arrastrar el dedo hasta el principio.
 *
 * Aparece pasadas dos pantallas de scroll —antes es ruido— y va abajo a la
 * IZQUIERDA: la derecha es del botón de contacto, y en la portada las flechas
 * del carrusel ocupan la esquina de ese lado.
 *
 * Con «reducir movimiento» sube de golpe en vez de deslizarse.
 */
export function VolverArriba() {
  const t = useTranslations("a11y");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const medir = () => {
      raf = 0;
      setVisible(window.scrollY > window.innerHeight * 1.6);
    };
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", alScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  function subir() {
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducido ? "auto" : "smooth" });
    /* El foco vuelve al principio: sin esto, con teclado, el siguiente Tab
       seguiría desde donde estaba el botón, a media página. */
    document.getElementById("contenido")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={subir}
      aria-label={t("top")}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-5 left-4 z-40 grid size-11 place-items-center rounded-full bg-teal-700 text-white shadow-lg shadow-slate-950/25 ring-1 ring-white/25 transition-[opacity,transform,background-color] duration-300 hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 sm:bottom-6 sm:left-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <ArrowUp className="size-5" aria-hidden />
    </button>
  );
}
