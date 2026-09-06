"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Boton, Campo, Etiqueta } from "./campos";
import { CampoImagen } from "./CampoImagen";

interface FilaPortada {
  id: string;
  image_url: string;
  alt_es: string;
  sort_order: number;
  status: string;
}

/** Fila recién creada, todavía sin guardar. */
type Borrador = Omit<FilaPortada, "id"> & { id: string | null };

/**
 * Fotos de la portada.
 *
 * Es lo primero que ve quien entra en el sitio y, hasta ahora, lo único del
 * contenido que no se podía tocar sin programar: las cinco fotos estaban
 * escritas dentro del componente del carrusel.
 *
 * Dos cosas que este panel hace y que no se ven:
 *
 *  · El orden se guarda como número, no como posición en la lista. Subir una
 *    foto reescribe `sort_order` de las dos implicadas y nada más; si fuera
 *    la posición habría que reescribir la tabla entera en cada movimiento.
 *
 *  · El texto alternativo es obligatorio. No es burocracia: es lo que lee un
 *    lector de pantalla y lo que entiende Google de una foto a pantalla
 *    completa. Sin él, la primera pantalla del sitio no dice nada.
 *
 * Si no queda ninguna foto publicada, la web usa las cinco del repositorio.
 * Así vaciar esta lista por descuido no deja la portada en negro.
 */
export function PanelPortada({
  revision,
  onCambio,
}: {
  revision: number;
  onCambio: () => void;
}) {
  const [filas, setFilas] = useState<FilaPortada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Borrador | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;
    (async () => {
      const { data, error: fallo } = await supabase!
        .from("hero_slides")
        .select("*")
        .order("sort_order");
      if (!vivo) return;
      if (fallo) setError(mensaje(fallo));
      setFilas((data ?? []) as unknown as FilaPortada[]);
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [revision]);

  /* La tabla es más nueva que el resto del panel: si alguien no ha pasado la
     migración, el error de Postgres es "relation does not exist" y no dice
     qué hacer. Aquí sí. */
  function mensaje(fallo: { code?: string; message: string }): string {
    if (fallo.code === "42P01" || /does not exist/i.test(fallo.message)) {
      return (
        "Falta la tabla `hero_slides`. Pasa la migración " +
        "supabase/migrations/004_portada.sql en el editor SQL de Supabase."
      );
    }
    return fallo.message;
  }

  async function guardar(b: Borrador) {
    if (!supabase) return;
    setError("");
    if (!b.image_url.trim()) return setError("Falta la imagen.");
    if (!b.alt_es.trim()) return setError("Falta la descripción de la imagen.");

    const fila = {
      image_url: b.image_url.trim(),
      alt_es: b.alt_es.trim(),
      sort_order: b.sort_order,
      status: b.status,
    };
    const { error: fallo } = b.id
      ? await supabase.from("hero_slides").update(fila).eq("id", b.id)
      : await supabase.from("hero_slides").insert(fila);

    if (fallo) return setError(mensaje(fallo));
    setEditando(null);
    onCambio();
  }

  async function borrar(f: FilaPortada) {
    if (!supabase) return;
    if (!confirm(`¿Quitar esta foto de la portada?\n\n${f.alt_es}`)) return;
    const { error: fallo } = await supabase.from("hero_slides").delete().eq("id", f.id);
    if (fallo) return setError(mensaje(fallo));
    onCambio();
  }

  /* Mover = intercambiar el orden con la vecina. Dos escrituras, no toda la
     tabla. */
  async function mover(i: number, direccion: -1 | 1) {
    if (!supabase) return;
    const a = filas[i];
    const b = filas[i + direccion];
    if (!a || !b) return;
    setError("");
    const { error: fallo } = await supabase.from("hero_slides").upsert([
      { id: a.id, sort_order: b.sort_order },
      { id: b.id, sort_order: a.sort_order },
    ]);
    if (fallo) return setError(mensaje(fallo));
    onCambio();
  }

  if (cargando) return <p className="text-sm text-slate-400">Cargando…</p>;

  if (editando) {
    const b = editando;
    return (
      <div className="max-w-2xl space-y-5">
        <h2 className="font-heading text-lg font-bold text-slate-900">
          {b.id ? "Editar foto de portada" : "Añadir foto a la portada"}
        </h2>

        <CampoImagen
          etiqueta="Imagen"
          valor={b.image_url}
          onChange={(url) => setEditando({ ...b, image_url: url })}
          carpeta="portada"
          ayuda="Apaisada y grande: se ve a pantalla completa. A partir de 1920px de ancho."
        />

        <Campo
          etiqueta="Descripción de la imagen"
          valor={b.alt_es}
          onChange={(v) => setEditando({ ...b, alt_es: v })}
          ayuda="Qué se ve en la foto. Lo lee quien no puede verla, y lo lee Google."
        />

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={b.status === "published"}
            onChange={(e) =>
              setEditando({ ...b, status: e.target.checked ? "published" : "draft" })
            }
            className="size-4"
          />
          Mostrarla en la web
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Boton onClick={() => guardar(b)} variante="primario">
            Guardar
          </Boton>
          <Boton
            onClick={() => {
              setEditando(null);
              setError("");
            }}
            variante="neutro"
          >
            Cancelar
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Las fotos grandes que se ven al entrar en la web. Se van pasando solas.
        </p>
        <Boton
          onClick={() =>
            setEditando({
              id: null,
              image_url: "",
              alt_es: "",
              sort_order: (filas.at(-1)?.sort_order ?? 0) + 10,
              status: "published",
            })
          }
          variante="primario"
        >
          Añadir foto
        </Boton>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {filas.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          Todavía no hay fotos propias, así que la web enseña las cinco que vienen de
          serie. En cuanto añadas una, la portada pasa a usar solo las tuyas.
        </p>
      ) : (
        <ul className="space-y-3">
          {filas.map((f, i) => (
            <li
              key={f.id}
              className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-slate-100">
                {f.image_url && (
                  <Image
                    src={f.image_url}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{f.alt_es}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{f.image_url}</p>
              </div>

              <Etiqueta estado={f.status} />

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  aria-label="Subir"
                  className="grid size-8 place-items-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === filas.length - 1}
                  aria-label="Bajar"
                  className="grid size-8 place-items-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ArrowDown className="size-4" />
                </button>
                <Boton onClick={() => setEditando({ ...f })} variante="neutro">
                  Editar
                </Boton>
                <button
                  type="button"
                  onClick={() => borrar(f)}
                  aria-label="Quitar"
                  className="grid size-8 place-items-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
