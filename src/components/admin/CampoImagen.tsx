"use client";

import { useRef, useState } from "react";
import { formatearPeso, subirImagen } from "@/lib/admin/subir";
import { cn } from "@/lib/utils";

/**
 * Campo de imagen: se arrastra un archivo, se elige del disco, o se pega una
 * dirección a mano.
 *
 * Las tres formas conviven a propósito. Subir es lo cómodo para el día a
 * día, pero pegar una dirección sigue haciendo falta para las fotos que ya
 * están en el sitio (`/fotos/...`) o para una imagen alojada en otro lado.
 * Quitar esa opción habría roto las fichas que ya existen.
 */
export function CampoImagen({
  etiqueta,
  valor,
  onChange,
  carpeta,
  ayuda,
}: {
  etiqueta: string;
  valor: string;
  onChange: (url: string) => void;
  /** Subcarpeta dentro del almacén: "tours", "paquetes", "destinos". */
  carpeta: string;
  ayuda?: string;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [encima, setEncima] = useState(false);
  const [error, setError] = useState("");
  const [nota, setNota] = useState("");

  async function procesar(archivo: File | undefined) {
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      setError("Eso no es una imagen.");
      return;
    }
    setError("");
    setNota("");
    setSubiendo(true);
    try {
      const r = await subirImagen(archivo, carpeta);
      onChange(r.url);
      /* Se dice cuánto se ahorró: es la forma de que se entienda por qué la
         foto de 5 MB acabó pesando 300 KB, en vez de parecer un fallo. */
      setNota(
        r.bytesFinal < r.bytesOriginal
          ? `Optimizada: ${formatearPeso(r.bytesOriginal)} → ${formatearPeso(r.bytesFinal)}`
          : `Subida (${formatearPeso(r.bytesFinal)})`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div>
      <span className="eyebrow text-slate-400">{etiqueta}</span>

      <div className="mt-2.5 flex gap-4">
        {/* Vista previa. Se usa <img> y no next/image porque la dirección es
            arbitraria —puede apuntar a Supabase, a public/ o a otro dominio—
            y esto solo se ve dentro del panel, nunca en la web pública. */}
        <div
          className={cn(
            "grid size-24 shrink-0 place-items-center overflow-hidden rounded-md bg-slate-100 ring-1",
            encima ? "ring-2 ring-teal-500" : "ring-slate-200"
          )}
        >
          {valor ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={valor} alt="" className="size-full object-cover" />
          ) : (
            <span className="px-2 text-center text-[10px] leading-tight text-slate-400">
              Sin imagen
            </span>
          )}
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setEncima(true);
          }}
          onDragLeave={() => setEncima(false)}
          onDrop={(e) => {
            e.preventDefault();
            setEncima(false);
            procesar(e.dataTransfer.files[0]);
          }}
          className={cn(
            "flex flex-1 flex-col justify-center rounded-md border border-dashed px-4 py-3 transition-colors",
            encima ? "border-teal-500 bg-teal-50/50" : "border-slate-300"
          )}
        >
          <input
            ref={entrada}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              procesar(e.target.files?.[0]);
              /* Se limpia para que elegir el mismo archivo dos veces seguidas
                 vuelva a disparar el evento. */
              e.target.value = "";
            }}
          />
          <p className="text-sm text-slate-600">
            <button
              type="button"
              onClick={() => entrada.current?.click()}
              disabled={subiendo}
              className="font-semibold text-teal-700 underline-offset-2 hover:underline disabled:text-slate-400"
            >
              {subiendo ? "Subiendo…" : "Elegir archivo"}
            </button>{" "}
            <span className="text-slate-400">o arrástralo aquí</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Se reduce y convierte a WebP sola, para que la web siga rápida.
          </p>
        </div>
      </div>

      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…o pega una dirección: /fotos/machu-picchu.webp"
        className="mt-3 w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-xs text-slate-500 placeholder:text-slate-300 outline-none transition-colors focus:border-teal-500"
      />

      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : nota ? (
        <p className="mt-1.5 text-xs text-teal-700">{nota}</p>
      ) : ayuda ? (
        <p className="mt-1.5 text-xs text-slate-400">{ayuda}</p>
      ) : null}
    </div>
  );
}
