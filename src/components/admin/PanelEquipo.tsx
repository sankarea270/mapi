"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Boton, Campo, Etiqueta, IDIOMAS } from "./campos";
import { CampoImagen } from "./CampoImagen";
import { AREAS, colorDeArea } from "@/config/areas";

interface FilaEquipo {
  id: string;
  name: string;
  position_es: string;
  position_en: string | null;
  position_pt: string | null;
  department: string | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  languages: string | null;
  sort_order: number;
  status: string;
}

type Borrador = Omit<FilaEquipo, "id"> & { id: string | null };



function nuevo(orden: number): Borrador {
  return {
    id: null,
    name: "",
    position_es: "",
    position_en: "",
    position_pt: "",
    department: AREAS[0].nombre,
    photo_url: "",
    email: "",
    phone: "",
    languages: "",
    sort_order: orden,
    status: "published",
  };
}

/**
 * Equipo.
 *
 * Las seis fichas que había escritas en el código eran de relleno: nombres
 * inventados, retratos de banco de imágenes y teléfonos que no existen. En la
 * web de una agencia eso no es un detalle estético —un cliente puede intentar
 * llamar a esos números—, así que lo primero que conviene hacer aquí es
 * sustituirlas por el equipo de verdad. Mientras esta lista esté vacía, la
 * web sigue enseñando las de relleno.
 *
 * El cargo se traduce y el nombre no: un cargo cambia de idioma, una persona
 * no. Si se dejan en blanco el inglés y el portugués, se usa el español.
 *
 * Los idiomas que habla cada uno están aquí porque en una agencia de viajes
 * es de lo primero que pregunta un cliente sobre un guía, y no aparecían por
 * ningún lado.
 */
export function PanelEquipo({
  revision,
  onCambio,
}: {
  revision: number;
  onCambio: () => void;
}) {
  const [filas, setFilas] = useState<FilaEquipo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Borrador | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;
    (async () => {
      const { data, error: fallo } = await supabase!
        .from("team_members")
        .select("*")
        .order("sort_order");
      if (!vivo) return;
      if (fallo) setError(mensaje(fallo));
      setFilas((data ?? []) as unknown as FilaEquipo[]);
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
        "Falta la tabla `team_members`. Pasa la migración " +
        "supabase/migrations/005_equipo.sql en el editor SQL de Supabase."
      );
    }
    return fallo.message;
  }

  async function guardar(b: Borrador) {
    if (!supabase) return;
    setError("");
    if (!b.name.trim()) return setError("Falta el nombre.");
    if (!b.position_es.trim()) return setError("Falta el cargo en español.");

    const fila = {
      name: b.name.trim(),
      position_es: b.position_es.trim(),
      position_en: b.position_en?.trim() || null,
      position_pt: b.position_pt?.trim() || null,
      department: b.department?.trim() || null,
      photo_url: b.photo_url?.trim() || null,
      email: b.email?.trim() || null,
      phone: b.phone?.trim() || null,
      languages: b.languages?.trim() || null,
      sort_order: b.sort_order,
      status: b.status,
    };
    const { error: fallo } = b.id
      ? await supabase.from("team_members").update(fila).eq("id", b.id)
      : await supabase.from("team_members").insert(fila);

    if (fallo) return setError(mensaje(fallo));
    setEditando(null);
    onCambio();
  }

  async function borrar(f: FilaEquipo) {
    if (!supabase) return;
    if (!confirm(`¿Quitar a ${f.name} del equipo? No se puede deshacer.`)) return;
    const { error: fallo } = await supabase.from("team_members").delete().eq("id", f.id);
    if (fallo) return setError(mensaje(fallo));
    onCambio();
  }

  /* Mover = intercambiar el orden con el vecino. Dos escrituras, no toda la
     tabla. */
  async function mover(i: number, direccion: -1 | 1) {
    if (!supabase) return;
    const a = filas[i];
    const b = filas[i + direccion];
    if (!a || !b) return;
    setError("");
    const { error: fallo } = await supabase.from("team_members").upsert([
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
          {b.id ? `Editar a ${b.name || "esta persona"}` : "Añadir a alguien al equipo"}
        </h2>

        <Campo
          etiqueta="Nombre y apellido"
          valor={b.name}
          onChange={(v) => setEditando({ ...b, name: v })}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {IDIOMAS.map((idioma) => {
            const clave = `position_${idioma.id}` as
              | "position_es"
              | "position_en"
              | "position_pt";
            return (
              <Campo
                key={idioma.id}
                etiqueta={`Cargo · ${idioma.etiqueta}`}
                valor={b[clave] ?? ""}
                onChange={(v) => setEditando({ ...b, [clave]: v })}
                ayuda={idioma.id === "es" ? "Obligatorio" : "Si lo dejas vacío se usa el español"}
              />
            );
          })}
        </div>

        {/* Botones y no un campo de texto con sugerencias. Antes era un
            `datalist`, y un `datalist` no enseña nada hasta que escribes:
            el campo aparecía con "Administración" puesto y parecía que no
            hubiera más áreas. Aquí se ven las diez de golpe, cada una con
            el color que tendrá en la web. */}
        <div>
          <span className="eyebrow text-slate-400">Área</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {AREAS.map((a) => {
              const elegida = b.department === a.nombre;
              return (
                <button
                  key={a.nombre}
                  type="button"
                  onClick={() => setEditando({ ...b, department: a.nombre })}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all",
                    a.color,
                    a.fondo,
                    elegida
                      ? "ring-2 ring-slate-900 ring-offset-1"
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  {a.nombre}
                </button>
              );
            })}
          </div>

          {/* Y sigue admitiendo una escrita a mano: una agencia añade áreas
              con el tiempo y eso no debería exigir tocar código. La que no
              esté en la lista sale en gris en la web. */}
          <input
            value={b.department ?? ""}
            onChange={(e) => setEditando({ ...b, department: e.target.value })}
            placeholder="…o escribe otra"
            className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
          />
          <span className="mt-1 block text-xs text-slate-400">
            En la web, cada área lleva su color y separa a su gente en un bloque
            propio.
          </span>
        </div>

        <CampoImagen
          etiqueta="Foto"
          valor={b.photo_url ?? ""}
          onChange={(url) => setEditando({ ...b, photo_url: url })}
          carpeta="equipo"
          ayuda="Cuadrada y de cerca: se recorta en círculo."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Correo"
            valor={b.email ?? ""}
            onChange={(v) => setEditando({ ...b, email: v })}
            tipo="email"
            ayuda="Opcional. Se ve en la web."
          />
          <Campo
            etiqueta="Teléfono"
            valor={b.phone ?? ""}
            onChange={(v) => setEditando({ ...b, phone: v })}
            ayuda="Opcional. Se ve en la web."
          />
        </div>

        <Campo
          etiqueta="Idiomas"
          valor={b.languages ?? ""}
          onChange={(v) => setEditando({ ...b, languages: v })}
          ayuda="Español · English · Quechua"
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
          Mostrar en la web
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
          Las personas que salen en la página <strong>Nosotros</strong>.
        </p>
        <Boton
          onClick={() => setEditando(nuevo((filas.at(-1)?.sort_order ?? 0) + 10))}
          variante="primario"
        >
          Añadir persona
        </Boton>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {filas.length === 0 ? (
        <div className="rounded-md border border-dashed border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">Aún no hay equipo cargado.</p>
          <p className="mt-2 leading-relaxed">
            Mientras esto esté vacío, la web enseña seis fichas de relleno que venían
            escritas en el código: nombres inventados, retratos de banco de imágenes y
            teléfonos que no existen. Conviene sustituirlas, porque un visitante puede
            intentar llamar a esos números.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filas.map((f, i) => (
            <li
              key={f.id}
              className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-slate-100">
                {f.photo_url && (
                  <Image
                    src={f.photo_url}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{f.name}</p>
                <p className="truncate text-xs text-slate-500">{f.position_es}</p>
                {f.department && (
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                      colorDeArea(f.department).color,
                      colorDeArea(f.department).fondo
                    )}
                  >
                    {f.department}
                  </span>
                )}
                {f.languages && (
                  <p className="truncate text-xs text-slate-400">{f.languages}</p>
                )}
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
