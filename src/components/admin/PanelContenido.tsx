"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { normalize } from "@/lib/catalog";
import { Area, Boton, Campo, Etiqueta, SelectorIdioma, type Idioma } from "./campos";
import { CampoImagen } from "./CampoImagen";

/*
 * Paquetes, destinos, experiencias, guías y reseñas comparten formulario.
 *
 * Los cinco son lo mismo: unos textos en tres idiomas, una foto y un estado.
 * Escribir cinco editores casi idénticos garantizaba que se separasen con el
 * tiempo, así que se describen como datos y hay un único editor que los
 * interpreta. Los tours no entran aquí porque sí son distintos: itinerario,
 * incluidos, galería y categoría.
 *
 * De las guías se edita la portada —título, entradilla, foto y grupo—, no el
 * cuerpo. El cuerpo son secciones con encabezado y párrafos, y meterlas en
 * este editor pediría un repetidor anidado que no existe; de momento siguen
 * viniendo del repositorio y se emparejan por dirección. Lo que se pedía
 * —poder cambiarles la imagen— sí está.
 */

type TipoCampo = "texto" | "area" | "numero" | "lista" | "imagen" | "ficha" | "tours" | "categorias";

interface CampoDef {
  /** Columna en Postgres. Si `ml`, el sufijo _es/_en/_pt se añade solo. */
  col: string;
  etiqueta: string;
  tipo: TipoCampo;
  ml?: boolean;
  ayuda?: string;
  placeholder?: string;
  /** Imágenes que llevan texto pequeño (mapas): menos compresión. */
  nitido?: boolean;
  /** Columnas que llegan con la migración 008. Si no se ha ejecutado, se
      guarda el resto y se avisa de que esto no se guardó. */
  migracion008?: boolean;
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
        col: "location_image_url",
        etiqueta: "Mapa de la ubicación",
        tipo: "imagen",
        nitido: true,
        migracion008: true,
        ayuda:
          "El mapa del recorrido del paquete. Se guarda más nítido que las fotos para que se lean los nombres. Opcional.",
      },
      {
        col: "location",
        etiqueta: "Descripción de la ubicación",
        tipo: "area",
        ml: true,
        migracion008: true,
        ayuda: "Por dónde pasa el viaje. Opcional: sin ella, el apartado «Ubicación» no sale.",
      },
      {
        col: "tour_slugs",
        etiqueta: "Tours que incluye",
        tipo: "tours",
        ayuda: "Elige los tours en el orden del viaje. Puedes reordenarlos con las flechas.",
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
        tipo: "categorias",
        ayuda: "Los tours de estas categorías son los que se ofrecen en el destino.",
      },
      { col: "tour_slugs", etiqueta: "Tours asociados", tipo: "tours" },
    ],
  },
  experiencias: {
    tabla: "experiences",
    singular: "experiencia",
    plural: "experiencias",
    carpeta: "experiencias",
    titulo: "name_es",
    conSlug: true,
    campos: [
      { col: "name", etiqueta: "Nombre", tipo: "texto", ml: true },
      { col: "description", etiqueta: "Descripción", tipo: "area", ml: true },
      { col: "image_url", etiqueta: "Imagen", tipo: "imagen" },
      {
        col: "tour_slugs",
        etiqueta: "Tours que la componen",
        tipo: "tours",
        ayuda: "Son los tours que se muestran en la página de la experiencia.",
      },
    ],
  },
  guias: {
    tabla: "guides",
    singular: "guía",
    plural: "guías",
    carpeta: "guias",
    titulo: "title_es",
    conSlug: true,
    campos: [
      { col: "title", etiqueta: "Título", tipo: "texto", ml: true },
      { col: "excerpt", etiqueta: "Entradilla", tipo: "area", ml: true },
      { col: "image_url", etiqueta: "Imagen", tipo: "imagen" },
      {
        col: "category",
        etiqueta: "Grupo",
        tipo: "texto",
        placeholder: "como-llegar",
        ayuda:
          "como-llegar · clima · equipaje · seguridad · visas · faq. Agrupa la guía en el índice.",
      },
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
        etiqueta: "¿De qué es esta reseña?",
        tipo: "ficha",
        ayuda:
          "Sale en la ficha que elijas: la de ese tour, ese paquete o esa experiencia. Las de la agencia salen solo en la portada.",
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
  if (esquema.campos.some((c) => c.tipo === "ficha")) f.target_type = "agencia";
  if (esquema.conSlug) f.slug = "";
  for (const c of esquema.campos) {
    if (c.ml) {
      f[`${c.col}_es`] = "";
      f[`${c.col}_en`] = "";
      f[`${c.col}_pt`] = "";
    } else {
      f[c.col] = c.tipo === "lista" || c.tipo === "tours" || c.tipo === "categorias" ? [] : "";
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
  const conFicha = esquema.campos.some((c) => c.tipo === "ficha");
  const opciones = useOpcionesFicha(conFicha, revision);

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
      } else if (c.tipo === "tours" || c.tipo === "categorias") {
        datos[c.col] = [...new Set(comoLista(f[c.col]).map(limpiarDireccion).filter(Boolean))];
      } else if (c.tipo === "numero") {
        datos[c.col] = Number(texto(f[c.col])) || 0;
      } else if (c.tipo === "ficha") {
        const tipoFicha = texto(f.target_type) || "agencia";
        datos.target_type = tipoFicha;
        datos[c.col] = tipoFicha === "agencia" ? null : texto(f[c.col]) || null;
        if (tipoFicha !== "agencia" && !datos[c.col]) {
          return setError("Elige de qué tour, paquete o experiencia es la reseña.");
        }
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
    const escribir = (d: Fila) =>
      id
        ? supabase!.from(esquema.tabla).update(d).eq("id", id)
        : supabase!.from(esquema.tabla).insert(d);

    let { error: fallo } = await escribir(datos);

    /* Si la migración 008 no se ha ejecutado, Supabase rechaza el guardado
       ENTERO por las columnas que no conoce. Se reintenta sin ellas para que
       el resto se guarde, y se dice qué se quedó fuera. */
    if (fallo?.code === "PGRST204" || fallo?.code === "42703") {
      const nuevas = new Set(["target_type"]);
      for (const c of esquema.campos) {
        if (!c.migracion008) continue;
        if (c.ml) for (const l of ["es", "en", "pt"]) nuevas.add(`${c.col}_${l}`);
        else nuevas.add(c.col);
      }
      const reducida = Object.fromEntries(Object.entries(datos).filter(([k]) => !nuevas.has(k)));
      ({ error: fallo } = await escribir(reducida));
      if (!fallo) {
        setEditando(null);
        setError(
          `Se guardó, pero sin ${
            esquema.tabla === "reviews" ? "el tipo de ficha" : "el mapa ni la ubicación"
          }: falta ejecutar 008_ubicacion_resenas.sql en Supabase.`
        );
        onCambio();
        return;
      }
    }

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
        opciones={opciones}
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
                {conFicha && (
                  <p className="truncate text-xs text-slate-400">
                    {etiquetaFicha(f, opciones)}
                  </p>
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
  opciones,
  fila,
  error,
  onCambiar,
  onGuardar,
  onCancelar,
}: {
  esquema: Esquema;
  opciones: OpcionFicha[];
  fila: Fila;
  error: string;
  onCambiar: (f: Fila) => void;
  onGuardar: (f: Fila) => void;
  onCancelar: () => void;
}) {
  const [idioma, setIdioma] = useState<Idioma>("es");
  const set = (col: string, v: unknown) => onCambiar({ ...fila, [col]: v });
  const catalogo = useCatalogo(esquema.campos.some((c) => c.tipo === "tours" || c.tipo === "categorias"));

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
                carpeta={c.nitido ? "mapas" : esquema.carpeta}
                ayuda={c.ayuda}
                nitido={c.nitido}
              />
            );
          }
          if (c.tipo === "ficha") {
            return (
              <SelectorFicha
                key={col}
                etiqueta={c.etiqueta}
                ayuda={c.ayuda}
                opciones={opciones}
                valor={valorFicha(fila, opciones)}
                onChange={(tipoFicha, slug) =>
                  onCambiar({ ...fila, target_type: tipoFicha, [c.col]: slug })
                }
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
          if (c.tipo === "tours" || c.tipo === "categorias") {
            return (
              <SelectorMultiple
                key={col}
                etiqueta={c.etiqueta}
                ayuda={c.ayuda}
                opciones={c.tipo === "tours" ? catalogo.tours : catalogo.categorias}
                valores={comoLista(fila[c.col]).map(limpiarDireccion).filter(Boolean)}
                onChange={(v) => set(c.col, v)}
                buscar={c.tipo === "tours" ? "Buscar un tour…" : "Buscar una categoría…"}
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


/* ─── Selector de ficha para las reseñas ─────────────────────────────────
   Antes era un campo de texto donde escribir la dirección del tour a mano.
   Así nació el problema de las reseñas de la portada: cinco de seis
   apuntaban a direcciones que no existían, y nada lo avisaba. Eligiendo de
   una lista no hay dirección que se pueda escribir mal. */

type TipoFichaResena = "tour" | "paquete" | "experiencia";

interface OpcionFicha {
  tipo: TipoFichaResena;
  slug: string;
  nombre: string;
}

const GRUPOS: Array<{ tipo: TipoFichaResena; tabla: string; titulo: string }> = [
  { tipo: "tour", tabla: "tours", titulo: "Tours" },
  { tipo: "paquete", tabla: "packages", titulo: "Paquetes" },
  { tipo: "experiencia", tabla: "experiences", titulo: "Experiencias" },
];

function useOpcionesFicha(activo: boolean, revision: number): OpcionFicha[] {
  const [opciones, setOpciones] = useState<OpcionFicha[]>([]);
  useEffect(() => {
    if (!activo || !supabase) return;
    let vivo = true;
    (async () => {
      const partes = await Promise.all(
        GRUPOS.map(async (g) => {
          const { data } = await supabase!.from(g.tabla).select("slug, name_es").order("name_es");
          return ((data ?? []) as Array<{ slug: string; name_es: string }>).map((r) => ({
            tipo: g.tipo,
            slug: r.slug,
            nombre: r.name_es,
          }));
        })
      );
      if (vivo) setOpciones(partes.flat());
    })();
    return () => {
      vivo = false;
    };
  }, [activo, revision]);
  return opciones;
}

/** "tipo:slug" → ["tipo", "slug"]. Solo el primer ":" separa. */
function partir(v: string): [string, string] {
  const i = v.indexOf(":");
  return [v.slice(0, i), v.slice(i + 1)];
}

/** "tipo:slug" de una fila, deduciendo el tipo si la 008 aún no lo guarda. */
function valorFicha(f: Fila, opciones: OpcionFicha[]): string {
  const slug = texto(f.tour_slug);
  const tipo = texto(f.target_type);
  if (!slug || tipo === "agencia") return "agencia";
  if (tipo) return `${tipo}:${slug}`;
  const hallada = GRUPOS.map((g) => opciones.find((o) => o.tipo === g.tipo && o.slug === slug)).find(Boolean);
  return hallada ? `${hallada.tipo}:${slug}` : `tour:${slug}`;
}

function etiquetaFicha(f: Fila, opciones: OpcionFicha[]): string {
  const v = valorFicha(f, opciones);
  if (v === "agencia") return "General de la agencia";
  const [tipo, slug] = partir(v);
  const o = opciones.find((x) => x.tipo === tipo && x.slug === slug);
  const titulo = GRUPOS.find((g) => g.tipo === tipo)?.titulo.slice(0, -1) ?? "Tour";
  /* Si la dirección no está en el catálogo se dice: es justo el caso que
     antes pasaba desapercibido. */
  return o ? `${titulo}: ${o.nombre}` : `${titulo}: /${slug} · no existe en el catálogo`;
}

function SelectorFicha({
  etiqueta,
  ayuda,
  opciones,
  valor,
  onChange,
}: {
  etiqueta: string;
  ayuda?: string;
  opciones: OpcionFicha[];
  valor: string;
  onChange: (tipo: string, slug: string | null) => void;
}) {
  const conocida = valor === "agencia" || opciones.some((o) => `${o.tipo}:${o.slug}` === valor);
  return (
    <label className="block">
      <span className="eyebrow text-slate-400">{etiqueta}</span>
      <select
        value={valor}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "agencia") return onChange("agencia", null);
          const [tipo, slug] = partir(v);
          onChange(tipo, slug);
        }}
        className="mt-1 w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-[15px] text-slate-900 outline-none focus:border-teal-500"
      >
        <option value="agencia">General de la agencia</option>
        {!conocida && (
          <option value={valor}>{valor.replace(":", ": /")} · no existe en el catálogo</option>
        )}
        {GRUPOS.map((g) => {
          const deGrupo = opciones.filter((o) => o.tipo === g.tipo);
          if (deGrupo.length === 0) return null;
          return (
            <optgroup key={g.tipo} label={g.titulo}>
              {deGrupo.map((o) => (
                <option key={`${o.tipo}:${o.slug}`} value={`${o.tipo}:${o.slug}`}>
                  {o.nombre}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
      {ayuda && <span className="mt-1.5 block text-xs text-slate-400">{ayuda}</span>}
    </label>
  );
}


/* ─── Selector de tours y categorías ─────────────────────────────────────
   Las direcciones de los tours se escribían a mano, una por línea, y
   llegaban de todas las formas: «/valle-sagrado-pisac», «/Cusco-Nocturno»…
   Ninguna coincidía con la dirección real, así que las experiencias salían
   sin un solo tour. Eligiendo de la lista de tours que existen no hay nada
   que escribir mal. */

interface OpcionCatalogo {
  valor: string;
  etiqueta: string;
  grupo: string;
}

function comoLista(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return texto(v).split("\n");
}

/** Lo mismo que hace la web al leer: sin barras, sin dominio, en minúsculas. */
function limpiarDireccion(s: string): string {
  return s
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/[?#].*$/, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/^(?:(?:es|en|pt)\/)?tours\//i, "")
    .toLowerCase();
}

function useCatalogo(activo: boolean) {
  const [catalogo, setCatalogo] = useState<{ tours: OpcionCatalogo[]; categorias: OpcionCatalogo[] }>({
    tours: [],
    categorias: [],
  });
  useEffect(() => {
    if (!activo || !supabase) return;
    let vivo = true;
    (async () => {
      const [t, c] = await Promise.all([
        supabase!.from("tours").select("slug, name_es, category_id").order("name_es"),
        supabase!.from("categories").select("id, slug, name_es").order("sort_order"),
      ]);
      if (!vivo) return;
      const cats = (c.data ?? []) as Array<{ id: string; slug: string; name_es: string }>;
      const nombreCat = new Map(cats.map((x) => [x.id, x.name_es]));
      setCatalogo({
        tours: ((t.data ?? []) as Array<{ slug: string; name_es: string; category_id: string | null }>).map(
          (x) => ({ valor: x.slug, etiqueta: x.name_es, grupo: nombreCat.get(x.category_id ?? "") ?? "Sin categoría" })
        ),
        categorias: cats.map((x) => ({ valor: x.slug, etiqueta: x.name_es, grupo: "Categorías" })),
      });
    })();
    return () => {
      vivo = false;
    };
  }, [activo]);
  return catalogo;
}

function SelectorMultiple({
  etiqueta,
  ayuda,
  opciones,
  valores,
  onChange,
  buscar,
}: {
  etiqueta: string;
  ayuda?: string;
  opciones: OpcionCatalogo[];
  valores: string[];
  onChange: (v: string[]) => void;
  buscar: string;
}) {
  const [filtro, setFiltro] = useState("");
  const porValor = useMemo(() => new Map(opciones.map((o) => [o.valor, o])), [opciones]);
  const elegidos = new Set(valores);

  const visibles = useMemo(() => {
    const q = normalize(filtro.trim());
    const lista = q ? opciones.filter((o) => normalize(`${o.etiqueta} ${o.valor} ${o.grupo}`).includes(q)) : opciones;
    const grupos = new Map<string, OpcionCatalogo[]>();
    for (const o of lista) grupos.set(o.grupo, [...(grupos.get(o.grupo) ?? []), o]);
    return [...grupos.entries()];
  }, [opciones, filtro]);

  const alternar = (v: string) =>
    onChange(elegidos.has(v) ? valores.filter((x) => x !== v) : [...valores, v]);
  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= valores.length) return;
    const copia = [...valores];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    onChange(copia);
  };

  return (
    <div>
      <span className="eyebrow text-slate-400">{etiqueta}</span>

      {/* Los elegidos, en orden. Los que no existen en el catálogo se
          marcan: son los que antes hacían que la página saliera vacía. */}
      <ol className="mt-2 space-y-1.5">
        {valores.length === 0 && <li className="text-sm text-slate-400">Ninguno elegido todavía.</li>}
        {valores.map((v, i) => {
          const o = porValor.get(v);
          const falta = opciones.length > 0 && !o;
          return (
            <li
              key={v}
              className={
                falta
                  ? "flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm ring-1 ring-red-200"
                  : "flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200"
              }
            >
              <span className="w-5 shrink-0 text-xs font-bold tabular-nums text-slate-400">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className={falta ? "block truncate font-medium text-red-700" : "block truncate font-medium text-slate-800"}>
                  {o?.etiqueta ?? v}
                </span>
                <span className="block truncate text-xs text-slate-400">
                  {falta ? `/${v} · no existe en el catálogo` : `${o?.grupo ?? ""} · /${v}`}
                </span>
              </span>
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="px-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30">↑</button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === valores.length - 1} aria-label="Bajar" className="px-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30">↓</button>
              <button type="button" onClick={() => alternar(v)} aria-label="Quitar" className="px-1.5 text-slate-400 hover:text-red-600">✕</button>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 rounded-md ring-1 ring-slate-200">
        <input
          type="search"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder={buscar}
          className="w-full border-0 border-b border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-teal-500"
        />
        <div className="max-h-72 overflow-y-auto p-2">
          {opciones.length === 0 && <p className="px-2 py-3 text-sm text-slate-400">Cargando…</p>}
          {visibles.map(([grupo, lista]) => (
            <div key={grupo} className="mb-2">
              <p className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{grupo}</p>
              {lista.map((o) => (
                <label key={o.valor} className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                  <input type="checkbox" checked={elegidos.has(o.valor)} onChange={() => alternar(o.valor)} className="size-4 accent-amber-500" />
                  <span className="min-w-0 flex-1 truncate">{o.etiqueta}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>
      {ayuda && <span className="mt-1.5 block text-xs text-slate-400">{ayuda}</span>}
    </div>
  );
}
