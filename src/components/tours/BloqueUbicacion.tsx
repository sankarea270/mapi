"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowRight, MapPin, Maximize2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Lightbox } from "@/components/ui/Lightbox";

/**
 * El apartado «Ubicación» de una ficha: el mapa propio si lo tiene, o la
 * foto del destino si no.
 *
 * El mapa y la foto se tratan distinto a propósito. La foto se recorta a
 * 21:9 y lleva un velo oscuro con el nombre encima, que es lo que le sienta
 * a un paisaje. A un mapa eso lo destroza: recortarlo se come el principio o
 * el final de la ruta, y el velo tapa justo los nombres que hay que leer.
 * Así que el mapa va entero, sobre fondo claro, sin nada encima, y se amplía
 * a pantalla completa al pulsarlo.
 */
export function BloqueUbicacion({
  mapa,
  foto,
  titulo,
  texto,
  enlace,
  rotuloAmpliar,
}: {
  /** El mapa propio de la ficha, subido desde el panel. */
  mapa?: string;
  /** Si no hay mapa: la foto del destino. */
  foto: string;
  titulo: string;
  texto: string;
  enlace?: { href: string; texto: string };
  rotuloAmpliar: string;
}) {
  const [ampliado, setAmpliado] = useState(false);

  return (
    <div className="escena-foto mt-8 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      {mapa ? (
        <button
          type="button"
          onClick={() => setAmpliado(true)}
          className="group relative block w-full cursor-zoom-in bg-slate-50 p-3 sm:p-4"
          aria-label={`${rotuloAmpliar}: ${titulo}`}
        >
          {/* Alto máximo y no proporción fija: un mapa vertical no se
              estira, y uno muy apaisado no deja un hueco enorme debajo. */}
          <Image
            src={mapa}
            alt={titulo}
            width={1600}
            height={1000}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="mx-auto h-auto max-h-[34rem] w-auto max-w-full rounded-md object-contain"
          />
          <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors group-hover:text-teal-700">
            <Maximize2 className="size-3.5" aria-hidden />
            {rotuloAmpliar}
          </span>
        </button>
      ) : (
        <div className="group relative aspect-[21/9] overflow-hidden bg-slate-100">
          <Image
            src={foto}
            alt={titulo}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
          <p className="absolute bottom-4 left-6 flex items-center gap-2 font-heading text-2xl font-bold text-white">
            <MapPin className="size-5 text-amber-400" aria-hidden />
            {titulo}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4 p-6">
        <div className="max-w-xl">
          {/* Con mapa el nombre no va sobre la imagen, así que va aquí. */}
          {mapa && (
            <p className="mb-2 flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
              <MapPin className="size-4 text-amber-500" aria-hidden />
              {titulo}
            </p>
          )}
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-600">{texto}</p>
        </div>
        {enlace && (
          <Link
            href={enlace.href}
            className="group/v inline-flex shrink-0 items-center gap-2 font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-teal-700"
          >
            {enlace.texto}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover/v:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Al <body>, con un portal. El bloque lleva la animación de entrada
          de las fotos, que usa `transform`, y un elemento `position: fixed`
          dentro de otro transformado se coloca respecto a ESE elemento y no
          a la ventana: el visor salía metido dentro de la tarjeta, recortado
          por ella, en vez de a pantalla completa. */}
      {ampliado &&
        mapa &&
        createPortal(
          <Lightbox images={[mapa]} alt={titulo} onClose={() => setAmpliado(false)} />,
          document.body
        )}
    </div>
  );
}
