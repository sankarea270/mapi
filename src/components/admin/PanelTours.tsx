"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { normalize } from "@/lib/catalog";
import type { FilaCategoria, FilaTour } from "@/types/db";
import { Area, Boton, Campo, Etiqueta, SelectorIdioma, type Idioma } from "./campos";
import { CampoImagen } from "./CampoImagen";
import { subirImagen } from "@/lib/admin/subir";
import { cn } from "@/lib/utils";

type TextoML = { es: string; en: string; pt: string };
type DiaItinerario = { day: string; title: TextoML; description: TextoML };

/* Borrador que maneja el formulario: los campos multilingües agrupados, en
   vez de las 3 columnas sueltas que guarda Postgres. Traducir de una forma a
   otra en un solo sitio evita que se desincronicen. */
interface Borrador {
  id: string | null;
  slug: string;
  category_id: string;
  name: TextoML;
  duration: TextoML;
  excerpt: TextoML;
  price: string;
  rating: string;
  featured: boolean;
  status: "draft" | "published";
  image_url: string;
  gallery: string[];
  included: TextoML[];
  itinerary: DiaItinerario[];
}

const ML_VACIO: TextoML = { es: "", en: "", pt: "" };

function aSlug(texto: string): string {
  return normalize(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function ml(es: string | null, en: string | null, pt: string | null): TextoML {
  return { es: es ?? "", en: en ?? "", pt: pt ?? "" };
}

function aBorrador(t: FilaTour): Borrador {
  return {
    id: t.id,
    slug: t.slug,
    category_id: t.category_id ?? "",
    name: ml(t.name_es, t.name_en, t.name_pt),
    duration: ml(t.duration_es, t.duration_en, t.duration_pt),
    excerpt: ml(t.excerpt_es, t.excerpt_en, t.excerpt_pt),
    price: String(t.price ?? ""),
    rating: String(t.rating ?? "4.8"),
    featured: Boolean(t.featured),
    status: t.status ?? "draft",
    image_url: t.image_url ?? "",
    gallery: t.gallery ?? [],
    included: t.included ?? [],
    itinerary: t.itinerary ?? [],
  };
}

function nuevoBorrador(category_id: string): Borrador {
  return {
    id: null,
    slug: "",
    category_id,
    name: { ...ML_VACIO },
    duration: { ...ML_VACIO },
    excerpt: { ...ML_VACIO },
    price: "",
    rating: "4.8",
    featured: false,
    /* Nace como borrador: RLS impide que un `draft` llegue a la web, así que
       no hay riesgo de publicar un tour a medio escribir por descuido. */
    status: "draft",
    image_url: "",
    gallery: [],
    included: [],
    itinerary: [],
  };
}

function aFila(b: Borrador) {
  return {
    slug: b.slug,
    category_id: b.category_id || null,
    name_es: b.name.es,
    name_en: b.name.en || b.name.es,
    name_pt: b.name.pt || b.name.es,
    duration_es: b.duration.es,
    duration_en: b.duration.en,
    duration_pt: b.duration.pt,
    excerpt_es: b.excerpt.es,
    excerpt_en: b.excerpt.en,
    excerpt_pt: b.excerpt.pt,
    price: Number(b.price) || 0,
    rating: Number(b.rating) || 0,
    featured: b.featured,
    status: b.status,
    image_url: b.image_url || null,
    gallery: b.gallery.filter(Boolean),
    included: b.included.filter((i) => i.es.trim()),
    itinerary: b.itinerary.filter((d) => d.title.es.trim()),
  };
}

export function PanelTours({ revision, onCambio }: { revision: number; onCambio: () => void }) {
  const [tours, setTours] = useState<FilaTour[]>([]);
  const [categorias, setCategorias] = useState<FilaCategoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<Borrador | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;
    (async () => {
      const [t, c] = await Promise.all([
        supabase!.from("tours").select("*").order("name_es"),
        supabase!.from("categories").select("*").order("sort_order"),
      ]);
      if (!vivo) return;
      setTours((t.data ?? []) as unknown as FilaTour[]);
      setCategorias((c.data ?? []) as unknown as FilaCategoria[]);
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [revision]);

  const visibles = useMemo(() => {
    const q = normalize(busqueda.trim());
    if (!q) return tours;
    return tours.filter((t) => normalize(`${t.name_es} ${t.slug}`).includes(q));
  }, [tours, busqueda]);

  async function guardar(b: Borrador) {
    if (!supabase) return;
    setError("");

    const slug = b.slug || aSlug(b.name.es);
    if (!b.name.es.trim()) return setError("El nombre en español es obligatorio.");
    if (!slug) return setError("No se pudo generar la dirección; escribe un nombre.");

    const fila = { ...aFila(b), slug };
    const { error: fallo } = b.id
      ? await supabase.from("tours").update(fila).eq("id", b.id)
      : await supabase.from("tours").insert(fila);

    if (fallo) {
      /* 23505 es la clave única: dos tours no pueden compartir dirección
         porque cada uno es una página distinta de la web. */
      setError(
        fallo.code === "23505"
          ? `Ya existe un tour con la dirección "${slug}". Cámbiala.`
          : fallo.message
      );
      return;
    }

    setEditando(null);
    onCambio();
  }

  async function borrar(t: FilaTour) {
    if (!supabase) return;
    if (!confirm(`¿Borrar "${t.name_es}"? No se puede deshacer.`)) return;
    const { error: fallo } = await supabase.from("tours").delete().eq("id", t.id);
    if (fallo) return setError(fallo.message);
    onCambio();
  }

  if (cargando) return <p className="text-sm text-slate-400">Cargando…</p>;

  if (editando) {
    return (
      <EditorTour
        borrador={editando}
        categorias={categorias}
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
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o dirección…"
          className="min-w-56 flex-1 rounded-md border-0 bg-white px-4 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none placeholder:text-slate-300 focus:ring-teal-500"
        />
        <Boton
          onClick={() => setEditando(nuevoBorrador(categorias[0]?.id ?? ""))}
          disabled={categorias.length === 0}
        >
          Nuevo tour
        </Boton>
      </div>

      {categorias.length === 0 && (
        <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          No hay categorías. Un tour tiene que pertenecer a una, así que crea primero al menos
          una fila en la tabla <code>categories</code> de Supabase.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {visibles.length === 0 ? (
        <p className="text-sm text-slate-500">
          {busqueda ? "Ningún tour coincide con la búsqueda." : "Todavía no hay tours."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg bg-white ring-1 ring-slate-200">
          {visibles.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{t.name_es}</p>
                <p className="truncate text-xs text-slate-400">
                  /{t.slug}
                  {!t.name_en && " · sin traducir"}
                </p>
              </div>
              <span className="font-heading text-sm font-bold text-slate-900">
                ${Number(t.price).toFixed(0)}
              </span>
              <Etiqueta estado={t.status} />
              <div className="flex gap-2">
                <Boton variante="neutro" onClick={() => setEditando(aBorrador(t))}>
                  Editar
                </Boton>
                <Boton variante="peligro" onClick={() => borrar(t)}>
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

function EditorTour({
  borrador,
  categorias,
  error,
  onCambiar,
  onGuardar,
  onCancelar,
}: {
  borrador: Borrador;
  categorias: FilaCategoria[];
  error: string;
  onCambiar: (b: Borrador) => void;
  onGuardar: (b: Borrador) => void;
  onCancelar: () => void;
}) {
  const [idioma, setIdioma] = useState<Idioma>("es");
  const b = borrador;
  const set = <K extends keyof Borrador>(k: K, v: Borrador[K]) => onCambiar({ ...b, [k]: v });
  const setML = (k: "name" | "duration" | "excerpt", v: string) =>
    onCambiar({ ...b, [k]: { ...b[k], [idioma]: v } });

  const completado = {
    es: Boolean(b.name.es),
    en: Boolean(b.name.en),
    pt: Boolean(b.name.pt),
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar(b);
      }}
      className="max-w-3xl space-y-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-xl font-bold text-slate-900">
          {b.id ? b.name.es || "Editar tour" : "Nuevo tour"}
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

      <div className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="eyebrow text-slate-900">Textos</h3>
          <div className="w-full max-w-xs">
            <SelectorIdioma idioma={idioma} onChange={setIdioma} completado={completado} />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <Campo etiqueta="Nombre" valor={b.name[idioma]} onChange={(v) => setML("name", v)} />
          <Campo
            etiqueta="Duración"
            valor={b.duration[idioma]}
            onChange={(v) => setML("duration", v)}
            placeholder="1 día · 8 horas"
          />
          <Area
            etiqueta="Resumen"
            valor={b.excerpt[idioma]}
            onChange={(v) => setML("excerpt", v)}
            ayuda="Dos o tres líneas. Es lo que se lee en la tarjeta del listado."
          />
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
        <h3 className="eyebrow text-slate-900">Ficha</h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Campo
            etiqueta="Dirección en la web"
            valor={b.slug}
            onChange={(v) => set("slug", aSlug(v))}
            placeholder={aSlug(b.name.es) || "machu-picchu-clasico"}
            ayuda={
              b.id
                ? "Cambiarla rompe los enlaces que ya circulen a este tour."
                : "Se genera sola a partir del nombre si la dejas vacía."
            }
          />
          <label className="block">
            <span className="eyebrow text-slate-400">Categoría</span>
            <select
              value={b.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              className="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-[15px] text-slate-900 outline-none focus:border-teal-500"
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_es}
                </option>
              ))}
            </select>
          </label>
          <Campo
            etiqueta="Precio (US$)"
            tipo="number"
            valor={b.price}
            onChange={(v) => set("price", v)}
          />
          <Campo
            etiqueta="Valoración"
            tipo="number"
            valor={b.rating}
            onChange={(v) => set("rating", v)}
            ayuda="De 0 a 5."
          />
          <div className="sm:col-span-2">
            <CampoImagen
              etiqueta="Imagen principal"
              valor={b.image_url}
              onChange={(v) => set("image_url", v)}
              carpeta="tours"
              ayuda="Es la foto de la tarjeta del listado y de la cabecera de la ficha."
            />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-6 border-t border-slate-200 pt-6">
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={b.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="size-4 accent-amber-500"
            />
            Destacado en la portada
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={b.status === "published"}
              onChange={(e) => set("status", e.target.checked ? "published" : "draft")}
              className="size-4 accent-amber-500"
            />
            Visible en la web
          </label>
        </div>
      </div>

      <ListaTextos
        titulo="Qué incluye"
        idioma={idioma}
        valores={b.included}
        onChange={(v) => set("included", v)}
        placeholder="Traslado desde el hotel"
      />

      <EditorItinerario
        idioma={idioma}
        dias={b.itinerary}
        onChange={(v) => set("itinerary", v)}
      />

      <ListaGaleria valores={b.gallery} onChange={(v) => set("gallery", v)} />

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-6">
        <Boton variante="neutro" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton tipo="submit">Guardar</Boton>
      </div>
    </form>
  );
}

function ListaTextos({
  titulo,
  idioma,
  valores,
  onChange,
  placeholder,
}: {
  titulo: string;
  idioma: Idioma;
  valores: TextoML[];
  onChange: (v: TextoML[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
      <h3 className="eyebrow text-slate-900">{titulo}</h3>
      <ul className="mt-5 space-y-3">
        {valores.map((v, i) => (
          <li key={i} className="flex items-center gap-3">
            <input
              value={v[idioma]}
              onChange={(e) => {
                const copia = [...valores];
                copia[i] = { ...v, [idioma]: e.target.value };
                onChange(copia);
              }}
              placeholder={placeholder}
              className="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-[15px] text-slate-900 placeholder:text-slate-300 outline-none focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => onChange(valores.filter((_, j) => j !== i))}
              className="shrink-0 text-xs font-semibold text-slate-400 transition-colors hover:text-red-600"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...valores, { ...ML_VACIO }])}
        className="mt-5 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-600"
      >
        Añadir línea
      </button>
    </div>
  );
}

function EditorItinerario({
  idioma,
  dias,
  onChange,
}: {
  idioma: Idioma;
  dias: DiaItinerario[];
  onChange: (v: DiaItinerario[]) => void;
}) {
  const actualizar = (i: number, cambio: Partial<DiaItinerario>) => {
    const copia = [...dias];
    copia[i] = { ...copia[i], ...cambio };
    onChange(copia);
  };

  return (
    <div className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
      <h3 className="eyebrow text-slate-900">Itinerario</h3>

      <ol className="mt-5 space-y-5">
        {dias.map((d, i) => (
          <li key={i} className="rounded-md bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <input
                value={d.day}
                onChange={(e) => actualizar(i, { day: e.target.value })}
                placeholder="Día 1"
                className="w-24 shrink-0 border-0 border-b border-slate-300 bg-transparent px-0 py-1.5 text-sm font-bold text-slate-900 outline-none focus:border-teal-500"
              />
              <input
                value={d.title[idioma]}
                onChange={(e) =>
                  actualizar(i, { title: { ...d.title, [idioma]: e.target.value } })
                }
                placeholder="Título del día"
                className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-1.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => onChange(dias.filter((_, j) => j !== i))}
                className="shrink-0 text-xs font-semibold text-slate-400 transition-colors hover:text-red-600"
              >
                Quitar
              </button>
            </div>
            <textarea
              rows={2}
              value={d.description[idioma]}
              onChange={(e) =>
                actualizar(i, { description: { ...d.description, [idioma]: e.target.value } })
              }
              placeholder="Qué se hace ese día"
              className="mt-3 w-full resize-y border-0 border-b border-slate-300 bg-transparent px-0 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-teal-500"
            />
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() =>
          onChange([
            ...dias,
            { day: `Día ${dias.length + 1}`, title: { ...ML_VACIO }, description: { ...ML_VACIO } },
          ])
        }
        className="mt-5 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-600"
      >
        Añadir día
      </button>
    </div>
  );
}

function ListaGaleria({
  valores,
  onChange,
}: {
  valores: string[];
  onChange: (v: string[]) => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  /* Varias a la vez: quien documenta un tour tiene las diez fotos juntas en
     una carpeta, y subirlas de una en una sería absurdo. Se procesan en
     serie —no en paralelo— para no saturar la conexión ni la memoria del
     móvil con diez lienzos a la vez. */
  async function subirVarias(archivos: FileList | null) {
    if (!archivos?.length) return;
    setError("");
    setSubiendo(true);
    const nuevas: string[] = [];
    for (const archivo of Array.from(archivos)) {
      if (!archivo.type.startsWith("image/")) continue;
      try {
        const r = await subirImagen(archivo, "tours/galeria");
        nuevas.push(r.url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo subir una imagen.");
        break;
      }
    }
    if (nuevas.length) onChange([...valores, ...nuevas]);
    setSubiendo(false);
  }

  return (
    <div className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
      <h3 className="eyebrow text-slate-900">Galería</h3>
      <p className="mt-2 text-xs text-slate-400">
        No se traduce: las fotos son las mismas en los tres idiomas.
      </p>

      {valores.length > 0 && (
        <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {valores.map((v, i) => (
            <li key={`${v}-${i}`} className="group relative">
              <div className="aspect-4/3 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v} alt="" className="size-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => onChange(valores.filter((_, j) => j !== i))}
                aria-label="Quitar esta foto"
                className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <label
          className={cn(
            "cursor-pointer rounded-md px-4 py-2.5 text-sm font-bold ring-1 transition-colors",
            subiendo
              ? "cursor-wait bg-slate-100 text-slate-400 ring-slate-200"
              : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
          )}
        >
          {subiendo ? "Subiendo…" : "Añadir fotos"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={subiendo}
            className="sr-only"
            onChange={(e) => {
              subirVarias(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => onChange([...valores, ""])}
          className="text-sm font-semibold text-teal-700 transition-colors hover:text-teal-600"
        >
          Pegar una dirección
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* Las direcciones pegadas a mano se editan como texto: sin esto, una
          entrada vacía recién añadida no habría forma de rellenarla. */}
      {valores.some((v) => !v.startsWith("http")) && (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {valores.map((v, i) =>
            v.startsWith("http") ? null : (
              <li key={`txt-${i}`} className="flex items-center gap-3">
                <input
                  value={v}
                  onChange={(e) => {
                    const copia = [...valores];
                    copia[i] = e.target.value;
                    onChange(copia);
                  }}
                  placeholder="/fotos/valle-sagrado-2.webp"
                  className="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-1.5 text-xs text-slate-600 placeholder:text-slate-300 outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => onChange(valores.filter((_, j) => j !== i))}
                  className="shrink-0 text-xs font-semibold text-slate-400 transition-colors hover:text-red-600"
                >
                  Quitar
                </button>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
