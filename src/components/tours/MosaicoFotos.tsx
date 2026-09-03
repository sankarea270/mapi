"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Lightbox } from "@/components/ui/Lightbox";
import { cn } from "@/lib/utils";

/**
 * Mosaico de fotos de la ficha.
 *
 * Sustituye a la portada a sangre con el título encima. Ese patrón obliga a
 * oscurecer la foto para que el texto se lea, así que se enseñaba una versión
 * apagada de la mejor imagen del tour; y como ocupaba el 70% de la altura de
 * la pantalla, el precio y la reserva quedaban fuera de la vista.
 *
 * Aquí las fotos se ven a plena luz, cinco a la vez, y el contenido empieza
 * de inmediato. El título va encima, sobre fondo claro, donde además se lee
 * mejor.
 *
 * La retícula se adapta al número de fotos en lugar de dejar huecos: con
 * cinco o más es 1 grande + 4 pequeñas; con menos, se reparte el ancho.
 */
export function MosaicoFotos({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const t = useTranslations("tourDetail");
  const [abierta, setAbierta] = useState<number | null>(null);

  if (fotos.length === 0) return null;

  const principal = fotos[0];
  const secundarias = fotos.slice(1, 5);
  const restantes = fotos.length - 5;

  return (
    <>
      <div
        className={cn(
          "grid gap-1.5 overflow-hidden rounded-lg",
          /* Alto medido en pantalla, no en proporción fija: llena casi toda
             la ventana sin llegar a taparla, así que se ve que hay contenido
             debajo y no hay que adivinarlo. Los topes evitan los dos
             extremos: una tira aplastada en portátiles bajos y una foto
             desmesurada en monitores muy altos. */
          "h-[54vh] min-h-[17rem] sm:h-[56vh] lg:h-[64vh] lg:min-h-[28rem] lg:max-h-[42rem]",
          /* Con una sola foto no hay mosaico que valga: ocupa todo el ancho,
             sin recortarla a un cuadrado raro. */
          secundarias.length === 0
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr]"
        )}
      >
        <button
          type="button"
          onClick={() => setAbierta(0)}
          className="group relative overflow-hidden bg-slate-100"
        >
          <Image
            src={principal}
            alt={nombre}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
        </button>

        {secundarias.length > 0 && (
          /* La retícula se ajusta a cuántas fotos hay de verdad. Con una
             rejilla 2x2 fija, un tour con tres fotos dejaba media columna
             en blanco: parece que algo no ha cargado. */
          <div
            className={cn(
              "grid gap-1.5",
              secundarias.length === 1 && "grid-rows-1",
              secundarias.length === 2 && "grid-rows-2",
              secundarias.length === 3 && "grid-cols-2 grid-rows-2 [&>*:first-child]:col-span-2",
              secundarias.length === 4 && "grid-cols-2 grid-rows-2"
            )}
          >
            {secundarias.map((foto, i) => {
              const ultima = i === secundarias.length - 1 && restantes > 0;
              return (
                <button
                  key={`${foto}-${i}`}
                  type="button"
                  onClick={() => setAbierta(i + 1)}
                  className="group relative overflow-hidden bg-slate-100"
                >
                  <Image
                    src={foto}
                    alt={`${nombre} — ${i + 2}`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 22vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* El "+N" va sobre la última casilla, que es donde el ojo
                      espera encontrar la continuación. */}
                  {ultima && (
                    <span className="absolute inset-0 grid place-items-center bg-slate-950/55 font-heading text-2xl font-bold text-white">
                      +{restantes}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setAbierta(0)}
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            {t("seeAllPhotos", { count: fotos.length })}
          </button>
        </div>
      )}

      {abierta !== null && (
        <Lightbox
          images={fotos}
          alt={nombre}
          initialIndex={abierta}
          onClose={() => setAbierta(null)}
        />
      )}
    </>
  );
}
