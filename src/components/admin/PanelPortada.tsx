"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Boton, Campo, Etiqueta } from "./campos";
import { CampoImagen } from "./CampoImagen";
import { LEYENDAS_PORTADA } from "@/data/portada";

interface FilaPortada {
  id: string;
  image_url: string;
  alt_es: string;
  sort_order: number;
  status: string;
  /* Migración 010: adónde lleva la leyenda y qué dice. */
  link_url?: string | null;
  title_es?: string | null;
  title_en?: string | null;
  title_pt?: string | null;
  description_es?: string | null;
  description_en?: string | null;
  description_pt?: string | null;
}

const COLUMNAS_010 = [
  "link_url",
  "title_es",
  "title_en",
  "title_pt",
  "description_es",
  "description_en",
  "description_pt",
] as const;

interface Destino {
  valor: string;
  etiqueta: string;
  grupo: string;
  nombre: { es: string; en: string; pt: string };
  descripcion: { es: string; en: string; pt: string };
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
  const [destinos, setDestinos] = useState<Destino[]>([]);

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;
    (async () => {
      const [{ data, error: fallo }, d, c] = await Promise.all([
        supabase!.from("hero_slides").select("*").order("sort_order"),
        supabase!
          .from("destinations")
          .select("slug, name_es, name_en, name_pt, description_es, description_en, description_pt")
          .order("sort_order"),
        supabase!.from("categories").select("slug, name_es, name_en, name_pt").order("sort_order"),
      ]);
      if (!vivo) return;
      if (fallo) setError(mensaje(fallo));
      setFilas((data ?? []) as unknown as FilaPortada[]);
      const t = (x: Record<string, unknown>, col: string) => ({
        es: String(x[`${col}_es`] ?? ""),
        en: String(x[`${col}_en`] ?? x[`${col}_es`] ?? ""),
        pt: String(x[`${col}_pt`] ?? x[`${col}_es`] ?? ""),
      });
      setDestinos([
        ...((d.data ?? []) as Record<string, unknown>[]).map((x) => ({
          valor: `/destinos/${x.slug}`,
          etiqueta: String(x.name_es ?? x.slug),
          grupo: "Destinos",
          nombre: t(x, "name"),
          descripcion: t(x, "description"),
        })),
        ...((c.data ?? []) as Record<string, unknown>[]).map((x) => ({
          valor: `/tours?categoria=${x.slug}`,
          etiqueta: `Tours · ${String(x.name_es ?? x.slug)}`,
          grupo: "Categorías de tours",
          nombre: t(x, "name"),
          descripcion: { es: "", en: "", pt: "" },
        })),
      ]);
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

    const limpio = (v?: string | null) => (v ?? "").trim() || null;
    const fila: Record<string, unknown> = {
      image_url: b.image_url.trim(),
      alt_es: b.alt_es.trim(),
      sort_order: b.sort_order,
      status: b.status,
    };
    for (const col of COLUMNAS_010) fila[col] = limpio(b[col]);

    const escribir = (datos: Record<string, unknown>) =>
      b.id
        ? supabase!.from("hero_slides").update(datos).eq("id", b.id)
        : supabase!.from("hero_slides").insert(datos);

    let { error: fallo } = await escribir(fila);
    /* Sin la migración 010 la tabla no tiene las columnas de la leyenda: se
       guarda la foto igual y se avisa de lo que falta. */
    if (fallo && (fallo.code === "PGRST204" || fallo.code === "42703")) {
      const soloFoto = { ...fila };
      for (const col of COLUMNAS_010) delete soloFoto[col];
      ({ error: fallo } = await escribir(soloFoto));
      if (!fallo) {
        setEditando(null);
        onCambio();
        return setError(
          "La foto se guardó, pero el enlace y la leyenda no: pasa la migración " +
            "supabase/migrations/010_portada_leyendas.sql en el editor SQL de Supabase."
        );
      }
    }

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

        <EditorLeyenda borrador={b} destinos={destinos} onChange={setEditando} />

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
                <p className="truncate text-sm font-semibold text-slate-900">
                  {f.title_es || LEYENDAS_PORTADA[i]?.titulo.es || f.alt_es}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {f.link_url ? `Lleva a ${f.link_url}` : "Sin enlace elegido"} · {f.alt_es}
                </p>
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

/**
 * Enlace y leyenda de una foto.
 *
 * Lo que se elige es adónde lleva: un destino o una categoría de tours, de
 * la lista de los que existen, así no hay direcciones mal escritas. El
 * título y la frase se generan al elegirlo —con los textos preparados para
 * cada destino o, si no hay, con el nombre y la descripción del destino— y
 * se pueden retocar.
 */
function EditorLeyenda({
  borrador: b,
  destinos,
  onChange,
}: {
  borrador: Borrador;
  destinos: Destino[];
  onChange: (b: Borrador) => void;
}) {
  const [otros, setOtros] = useState(false);
  const enLista = !b.link_url || destinos.some((d) => d.valor === b.link_url);

  function generar(href: string): Partial<Borrador> {
    const escrita = LEYENDAS_PORTADA.find((l) => l.href === href);
    if (escrita) {
      return {
        title_es: escrita.titulo.es,
        title_en: escrita.titulo.en,
        title_pt: escrita.titulo.pt,
        description_es: escrita.descripcion.es,
        description_en: escrita.descripcion.en,
        description_pt: escrita.descripcion.pt,
      };
    }
    const d = destinos.find((x) => x.valor === href);
    if (!d) return {};
    return {
      title_es: d.nombre.es,
      title_en: d.nombre.en,
      title_pt: d.nombre.pt,
      description_es: d.descripcion.es,
      description_en: d.descripcion.en,
      description_pt: d.descripcion.pt,
    };
  }

  const grupos = [...new Set(destinos.map((d) => d.grupo))];

  return (
    <fieldset className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-900">Leyenda y enlace</legend>

      <label className="block">
        <span className="eyebrow text-slate-400">Al pulsar la leyenda, lleva a</span>
        <select
          value={b.link_url ?? ""}
          onChange={(e) => {
            const href = e.target.value;
            onChange({ ...b, link_url: href, ...(href ? generar(href) : {}) });
          }}
          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Sin enlace (no se muestra leyenda)</option>
          {!enLista && <option value={b.link_url ?? ""}>{b.link_url}</option>}
          {grupos.map((g) => (
            <optgroup key={g} label={g}>
              {destinos
                .filter((d) => d.grupo === g)
                .map((d) => (
                  <option key={d.valor} value={d.valor}>
                    {d.etiqueta}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <span className="mt-1.5 block text-xs text-slate-400">
          Al elegirlo se escriben solos el título y la frase. Salkantay va a «Tours · Aventura».
        </span>
      </label>

      <Campo
        etiqueta="Título"
        valor={b.title_es ?? ""}
        onChange={(v) => onChange({ ...b, title_es: v })}
      />
      <Campo
        etiqueta="Frase"
        valor={b.description_es ?? ""}
        onChange={(v) => onChange({ ...b, description_es: v })}
        ayuda="Una sola frase, corta: se lee en la tarjeta de la portada."
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => b.link_url && onChange({ ...b, ...generar(b.link_url) })}
          disabled={!b.link_url}
          className="text-xs font-semibold text-teal-700 hover:text-teal-900 disabled:opacity-40"
        >
          Volver a generar los textos
        </button>
        <button
          type="button"
          onClick={() => setOtros((v) => !v)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          {otros ? "Ocultar inglés y portugués" : "Inglés y portugués"}
        </button>
      </div>

      {otros && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Título (EN)" valor={b.title_en ?? ""} onChange={(v) => onChange({ ...b, title_en: v })} />
          <Campo etiqueta="Título (PT)" valor={b.title_pt ?? ""} onChange={(v) => onChange({ ...b, title_pt: v })} />
          <Campo etiqueta="Frase (EN)" valor={b.description_en ?? ""} onChange={(v) => onChange({ ...b, description_en: v })} />
          <Campo etiqueta="Frase (PT)" valor={b.description_pt ?? ""} onChange={(v) => onChange({ ...b, description_pt: v })} />
        </div>
      )}
    </fieldset>
  );
}
