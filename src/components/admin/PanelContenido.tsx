"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { normalize } from "@/lib/catalog";
import { Area, Boton, Campo, Etiqueta, SelectorIdioma, type Idioma } from "./campos";
import { CampoImagen } from "./CampoImagen";

/*
 * Paquetes, destinos y reseñas comparten formulario.
 *
 * Los tres son lo mismo: unos textos en tres idiomas, una foto y un estado.
 * Escribir tres editores casi idénticos garantizaba que se separasen con el
 * tiempo, así que se describen como datos y hay un único editor que los
 * interpreta. Los tours no entran aquí porque sí son distintos: itinerario,
 * incluidos, galería y categoría.
 */

type TipoCampo = "texto" | "area" | "numero" | "lista" | "imagen";

interface CampoDef {
  /** Columna en Postgres. Si `ml`, el sufijo _es/_en/_pt se añade solo. */
  col: string;
  etiqueta: string;
  tipo: TipoCampo;
  ml?: boolean;
  ayuda?: string;
  placeholder?: string;
}

interface Esquema {
  tabla: string;
  singular: string;
  plural: string;
  /** Subcarpeta del almacén donde van las fotos de este tipo. */
  carpeta: string;
  /** Columna que se enseña en el listado y da nombre a la fila. */
  titulo: string;
  /** `false` en reseñas: no son una página, no necesitan dirección propia. */
  conSlug: boolean;
  campos: CampoDef[];
}

const ESQUEMAS: Record<string, Esquema> = {
  paquetes: {
    tabla: "packages",
    singular: "paquete",
    plural: "paquetes",
    carpeta: "paquetes",
    titulo: "name_es",
    conSlug: true,
    campos: [
      { col: "name", etiqueta: "Nombre", tipo: "texto", ml: true },
      { col: "description", etiqueta: "Descripción", tipo: "area", ml: true },
      {
        col: "duration",
        etiqueta: "Duración",
        tipo: "texto",
        ml: true,
        placeholder: "5 días / 4 noches",
      },
      { col: "price", etiqueta: "Precio (US$)", tipo: "numero" },
      { col: "image_url", etiqueta: "Imagen", tipo: "imagen" },
      {
        col: "tour_slugs",
        etiqueta: "Tours que incluye",
        tipo: "lista",
        ayuda: "Las direcciones de los tours, una por línea, en el orden del viaje.",
      },
    ],
  },
  destinos: {
    tabla: "destinations",
    singular: "destino",
    plural: "destinos",
    carpeta: "destinos",
    titulo: "name_es",
    conSlug: true,
    campos: [
      { col: "name", etiqueta: "Nombre", tipo: "texto", ml: true },
      { col: "description", etiqueta: "Descripción", tipo: "area", ml: true },
      { col: "image_url", etiqueta: "Imagen", tipo: "imagen" },
      {
        col: "category_slugs",
        etiqueta: "Categorías asociadas",
        tipo: "lista",
        ayuda: "Direcciones de categorías, una por línea.",
      },
      { col: "tour_slugs", etiqueta: "Tours asociados", tipo: "lista" },
    ],
  },
  resenas: {
    tabla: "reviews",
    singular: "reseña",
    plural: "reseñas",
    carpeta: "resenas",
    titulo: "author",
    conSlug: false,
    campos: [
      { col: "author", etiqueta: "Quién la escribe", tipo: "texto" },
      { col: "country", etiqueta: "País", tipo: "texto", placeholder: "México" },
      { col: "rating", etiqueta: "Estrellas", tipo: "numero", ayuda: "De 1 a 5." },
      { col: "text", etiqueta: "Reseña", tipo: "area", ml: true },
      {
        col: "tour_slug",
        etiqueta: "Tour al que se refiere",
        tipo: "texto",
        ayuda: "Déjalo vacío si es una reseña general de la agencia.",
      },
    ],
  },
};

type Fila = Record<string, unknown>;

function texto(v: unknown): string {
  if (v === null || v === undefined) return "";
  return Array.isArray(v) ? v.join("\n") : String(v);
}

function aSlug(t: string): string {
  return normalize(t)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function filaNueva(esquema: Esquema): Fila {
  const f: Fila = { status: "draft" };
  if (esquema.conSlug) f.slug = "";
  for (const c of esquema.campos) {
    if (c.ml) {
      f[`${c.col}_es`] = "";
      f[`${c.col}_en`] = "";
      f[`${c.col}_pt`] = "";
    } else {
      f[c.col] = c.tipo === "lista" ? [] : "";
    }
  }
  return f;
}

export function PanelContenido({
  tipo,
  revision,
  onCambio,
}: {
  tipo: keyof typeof ESQUEMAS;
  revision: number;
  onCambio: () => void;
}) {
  const esquema = ESQUEMAS[tipo];
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Fila | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;
    setCargando(true);
    (async () => {
      const { data, error: fallo } = await supabase!
        .from(esquema.tabla)
        .select("*")
        .order("sort_order");
      if (!vivo) return;
      if (fallo) setError(fallo.message);
      setFilas((data ?? []) as unknown as Fila[]);
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [esquema.tabla, revision]);

  async function guardar(f: Fila) {
    if (!supabase) return;
    setError("");

    const datos: Fila = { status: f.status ?? "draft" };
    for (const c of esquema.campos) {
      if (c.ml) {
        for (const l of ["es", "en", "pt"] as const) {
          datos[`${c.col}_${l}`] = texto(f[`${c.col}_${l}`]) || null;
        }
        /* El español es el original: si falta una traducción, se cae a él en
           vez de dejar el hueco en blanco en la web. */
        datos[`${c.col}_en`] ||= datos[`${c.col}_es`];
        datos[`${c.col}_pt`] ||= datos[`${c.col}_es`];
      } else if (c.tipo === "lista") {
        datos[c.col] = texto(f[c.col])
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (c.tipo === "numero") {
        datos[c.col] = Number(texto(f[c.col])) || 0;
      } else {
        datos[c.col] = texto(f[c.col]) || null;
      }
    }

    if (esquema.conSlug) {
      const base = texto(f.slug) || texto(f[`${esquema.campos[0].col}_es`]);
      const slug = aSlug(base);
      if (!slug) return setError("Falta el nombre.");
      datos.slug = slug;
    }

    const id = f.id as string | undefined;
    const { error: fallo } = id
      ? await supabase.from(esquema.tabla).update(datos).eq("id", id)
      : await supabase.from(esquema.tabla).insert(datos);

    if (fallo) {
      setError(
        fallo.code === "23505"
          ? `Ya existe un ${esquema.singular} con esa dirección. Cámbiala.`
          : fallo.message
      );
      return;
    }

    setEditando(null);
    onCambio();
  }

  async function borrar(f: Fila) {
    if (!supabase) return;
    if (!confirm(`¿Borrar "${texto(f[esquema.titulo])}"? No se puede deshacer.`)) return;
    const { error: fallo } = await supabase.from(esquema.tabla).delete().eq("id", f.id as string);
    if (fallo) return setError(fallo.message);
    onCambio();
  }

  if (cargando) return <p className="text-sm text-slate-400">Cargando…</p>;

  if (editando) {
    return (
      <Editor
        esquema={esquema}
        fila={editando}
        error={error}
        onCambiar={setEditando}
        onGuardar={guardar}
        onCancelar={() => {
          setEditando(null);
          setError("");
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Boton onClick={() => setEditando(filaNueva(esquema))}>
          Nuevo {esquema.singular}
        </Boton>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {filas.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no hay {esquema.plural}.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg bg-white ring-1 ring-slate-200">
          {filas.map((f) => (
            <li
              key={f.id as string}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">
                  {texto(f[esquema.titulo]) || "(sin nombre)"}
                </p>
                {esquema.conSlug && (
                  <p className="truncate text-xs text-slate-400">/{texto(f.slug)}</p>
                )}
              </div>
              <Etiqueta estado={texto(f.status) || "draft"} />
              <div className="flex gap-2">
                <Boton variante="neutro" onClick={() => setEditando({ ...f })}>
                  Editar
                </Boton>
                <Boton variante="peligro" onClick={() => borrar(f)}>
                  Borrar
                </Boton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Editor({
  esquema,
  fila,
  error,
  onCambiar,
  onGuardar,
  onCancelar,
}: {
  esquema: Esquema;
  fila: Fila;
  error: string;
  onCambiar: (f: Fila) => void;
  onGuardar: (f: Fila) => void;
  onCancelar: () => void;
}) {
  const [idioma, setIdioma] = useState<Idioma>("es");
  const set = (col: string, v: unknown) => onCambiar({ ...fila, [col]: v });

  const primero = esquema.campos[0];
  const completado = useMemo(() => {
    if (!primero.ml) return undefined;
    return {
      es: Boolean(texto(fila[`${primero.col}_es`])),
      en: Boolean(texto(fila[`${primero.col}_en`])),
      pt: Boolean(texto(fila[`${primero.col}_pt`])),
    };
  }, [fila, primero]);

  const hayML = esquema.campos.some((c) => c.ml);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar(fila);
      }}
      className="max-w-2xl space-y-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-xl font-bold text-slate-900">
          {fila.id ? `Editar ${esquema.singular}` : `Nuevo ${esquema.singular}`}
        </h2>
        <div className="ml-auto flex gap-2">
          <Boton variante="neutro" onClick={onCancelar}>
            Cancelar
          </Boton>
          <Boton tipo="submit">Guardar</Boton>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-7 rounded-lg bg-white p-6 ring-1 ring-slate-200">
        {hayML && (
          <div className="max-w-xs">
            <SelectorIdioma idioma={idioma} onChange={setIdioma} completado={completado} />
          </div>
        )}

        {esquema.campos.map((c) => {
          const col = c.ml ? `${c.col}_${idioma}` : c.col;
          const valor = texto(fila[col]);
          const cambiar = (v: string) => set(col, v);

          if (c.tipo === "imagen") {
            return (
              <CampoImagen
                key={col}
                etiqueta={c.etiqueta}
                valor={valor}
                onChange={cambiar}
                carpeta={esquema.carpeta}
                ayuda={c.ayuda}
              />
            );
          }
          if (c.tipo === "area") {
            return (
              <Area
                key={col}
                etiqueta={c.etiqueta}
                valor={valor}
                onChange={cambiar}
                ayuda={c.ayuda}
                placeholder={c.placeholder}
              />
            );
          }
          if (c.tipo === "lista") {
            return (
              <Area
                key={col}
                etiqueta={c.etiqueta}
                valor={valor}
                onChange={cambiar}
                filas={4}
                ayuda={c.ayuda ?? "Una por línea."}
              />
            );
          }
          return (
            <Campo
              key={col}
              etiqueta={c.etiqueta}
              tipo={c.tipo === "numero" ? "number" : "text"}
              valor={valor}
              onChange={cambiar}
              ayuda={c.ayuda}
              placeholder={c.placeholder}
            />
          );
        })}

        {esquema.conSlug && (
          <Campo
            etiqueta="Dirección en la web"
            valor={texto(fila.slug)}
            onChange={(v) => set("slug", aSlug(v))}
            ayuda={
              fila.id
                ? "Cambiarla rompe los enlaces que ya circulen."
                : "Se genera sola a partir del nombre si la dejas vacía."
            }
          />
        )}

        <label className="flex items-center gap-2.5 border-t border-slate-200 pt-6 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={texto(fila.status) === "published"}
            onChange={(e) => set("status", e.target.checked ? "published" : "draft")}
            className="size-4 accent-amber-500"
          />
          Visible en la web
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-6">
        <Boton variante="neutro" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton tipo="submit">Guardar</Boton>
      </div>
    </form>
  );
}
