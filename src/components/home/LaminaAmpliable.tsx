"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { Lightbox } from "@/components/ui/Lightbox";

/**
 * Una lámina con texto pequeño que se amplía a pantalla completa.
 *
 * El cartel «Protégeme» lleva la ley, los números de denuncia y los logos
 * oficiales en letra de pocos píxeles: a su tamaño en la página se reconoce,
 * pero no se lee. Al tocarlo se abre entero para leerlo.
 */
export function LaminaAmpliable({
  src,
  alt,
  ancho,
  alto,
  rotulo,
  className,
}: {
  src: string;
  alt: string;
  ancho: number;
  alto: number;
  rotulo: string;
  className?: string;
}) {
  const [abierta, setAbierta] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-label={`${rotulo}: ${alt}`}
        className={`group relative block cursor-zoom-in overflow-hidden rounded-md bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 outline-none transition-transform duration-500 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-teal-600 ${className ?? ""}`}
      >
        <Image src={src} alt={alt} width={ancho} height={alto} sizes="14rem" className="h-auto w-full" />
        <span className="absolute inset-x-2 bottom-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900/85 px-3 py-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="size-3.5" aria-hidden />
          {rotulo}
        </span>
      </button>

      {/* Por portal: dentro de un elemento con animación de entrada
          (`transform`), un `position: fixed` se coloca respecto a él y el
          visor saldría recortado dentro de la sección. */}
      {abierta &&
        createPortal(<Lightbox images={[src]} alt={alt} onClose={() => setAbierta(false)} />, document.body)}
    </>
  );
}
