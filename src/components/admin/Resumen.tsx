"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { FilaCategoria, FilaReserva } from "@/types/db";
import type { Vista } from "./AdminApp";
import { Etiqueta } from "./campos";
import { BarrasSemana, BarrasCategoria } from "./graficos";
import { cn } from "@/lib/utils";

/* Solo las columnas que el resumen necesita. `select("*")` traería el
   itinerario y la galería de los 70 tours —cientos de kilobytes de JSON—
   para no enseñar ni uno de esos campos. */
const COLUMNAS_TOUR =
  "id, slug, name_es, name_en, name_pt, status, image_url, price, category_id, featured, itinerary";

interface TourResumen {
  id: string;
  slug: string;
  name_es: string;
  name_en: string | null;
  name_pt: string | null;
  status: string;
  image_url: string | null;
  price: number | string;
  category_id: string | null;
  featured: boolean | null;
  itinerary: unknown[] | null;
}

export function Resumen({ revision, onIr }: { revision: number; onIr: (v: Vista) => void }) {
  const [tours, setTours] = useState<TourResumen[]>([]);
  const [categorias, setCategorias] = useState<FilaCategoria[]>([]);
  const [reservas, setReservas] = useState<FilaReserva[]>([]);
  const [otros, setOtros] = useState({ paquetes: 0, destinos: 0, resenas: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;

    (async () => {
      const [t, c, r, pq, ds, rs] = await Promise.all([
        supabase!.from("tours").select(COLUMNAS_TOUR),
        supabase!.from("categories").select("*").order("sort_order"),
        supabase!.from("reservations").select("*").order("created_at", { ascending: false }),
        supabase!.from("packages").select("*", { count: "exact", head: true }),
        supabase!.from("destinations").select("*", { count: "exact", head: true }),
        supabase!.from("reviews").select("*", { count: "exact", head: true }),
      ]);
      if (!vivo) return;
      setTours((t.data ?? []) as unknown as TourResumen[]);
      setCategorias((c.data ?? []) as unknown as FilaCategoria[]);
      setReservas((r.data ?? []) as unknown as FilaReserva[]);
      setOtros({ paquetes: pq.count ?? 0, destinos: ds.count ?? 0, resenas: rs.count ?? 0 });
      setCargando(false);
    })();

    return () => {
      vivo = false;
    };
  }, [revision]);

  /* Todo se calcula aquí y no en la base de datos: son 70 filas, cabe de
     sobra en memoria, y así una sola consulta alimenta las cuatro secciones
     en vez de seis consultas de conteo. */
  const datos = useMemo(() => {
    const publicados = tours.filter((t) => t.status === "published");
    const pendientes = reservas.filter((r) => r.status === "pending");

    const salud = [
      { id: "borrador", texto: "en borrador, no se ven en la web", lista: tours.filter((t) => t.status !== "published") },
      { id: "sinFoto", texto: "sin imagen principal", lista: publicados.filter((t) => !t.image_url) },
      { id: "sinIngles", texto: "sin traducir al inglés", lista: publicados.filter((t) => !t.name_en || t.name_en === t.name_es) },
      { id: "sinPortugues", texto: "sin traducir al portugués", lista: publicados.filter((t) => !t.name_pt || t.name_pt === t.name_es) },
      { id: "sinItinerario", texto: "sin itinerario", lista: publicados.filter((t) => !t.itinerary?.length) },
    ].filter((s) => s.lista.length > 0);

    const porCategoria = categorias
      .map((c) => ({
        etiqueta: c.name_es,
        valor: publicados.filter((t) => t.category_id === c.id).length,
      }))
      .filter((c) => c.valor > 0)
      .sort((a, b) => b.valor - a.valor);

    const precios = publicados.map((t) => Number(t.price)).filter((p) => p > 0);
    const precioMedio = precios.length
      ? Math.round(precios.reduce((a, b) => a + b, 0) / precios.length)
      : 0;

    return { publicados, pendientes, salud, porCategoria, precioMedio, precios };
  }, [tours, categorias, reservas]);

  if (cargando) return <p className="text-sm text-slate-400">Cargando…</p>;

  const tarjetas: Array<{ etiqueta: string; valor: number | string; pie?: string; vista: Vista }> = [
    {
      etiqueta: "Tours en la web",
      valor: datos.publicados.length,
      pie: tours.length > datos.publicados.length
        ? `${tours.length - datos.publicados.length} en borrador`
        : undefined,
      vista: "tours",
    },
    {
      etiqueta: "Reservas sin atender",
      valor: datos.pendientes.length,
      pie: reservas.length > 0 ? `${reservas.length} en total` : undefined,
      vista: "reservas",
    },
    { etiqueta: "Precio medio", valor: datos.precioMedio ? `$${datos.precioMedio}` : "—", vista: "tours" },
    { etiqueta: "Paquetes", valor: otros.paquetes, vista: "paquetes" },
    { etiqueta: "Destinos", valor: otros.destinos, vista: "destinos" },
    { etiqueta: "Reseñas", valor: otros.resenas, vista: "resenas" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-px overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-3 lg:grid-cols-6">
        {tarjetas.map((c) => (
          <button
            key={c.etiqueta}
            type="button"
            onClick={() => onIr(c.vista)}
            className="bg-white px-5 py-5 text-left transition-colors hover:bg-slate-50"
          >
            <p className="eyebrow text-slate-400">{c.etiqueta}</p>
            <p className="mt-2 font-heading text-[2rem] font-bold leading-none text-slate-900">
              {c.valor}
            </p>
            <p className="mt-1.5 h-4 text-xs text-amber-600">{c.pie ?? ""}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Tarjeta
          titulo="Reservas recibidas"
          pie="Solicitudes enviadas desde el formulario de la web, por semana."
        >
          <BarrasSemana reservas={reservas} semanas={8} />
        </Tarjeta>

        <Tarjeta titulo="Qué le falta al catálogo">
          {datos.salud.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Nada pendiente: todos los tours publicados tienen foto, itinerario y las tres
              traducciones.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {datos.salud.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onIr("tours")}
                    className="flex w-full items-baseline gap-3 py-3 text-left transition-colors hover:text-teal-700"
                  >
                    <span className="font-heading text-xl font-bold tabular-nums text-slate-900">
                      {s.lista.length}
                    </span>
                    <span className="text-sm text-slate-600">{s.texto}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>

      <Tarjeta
        titulo="Tours publicados por categoría"
        pie={`${datos.publicados.length} tours repartidos en ${datos.porCategoria.length} categorías.`}
      >
        <BarrasCategoria datos={datos.porCategoria} />
      </Tarjeta>

      <Tarjeta titulo="Últimas solicitudes">
        {reservas.length === 0 ? (
          <p className="max-w-lg py-6 text-sm leading-relaxed text-slate-500">
            Todavía ninguna. Cuando alguien envíe el formulario de la web quedará registrada
            aquí, además de abrírsele WhatsApp como siempre.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {reservas.slice(0, 6).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <span className="font-medium text-slate-900">{r.full_name}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-500">
                  {r.tour_name ?? r.tour_slug}
                </span>
                <span className="text-sm tabular-nums text-slate-400">{r.travel_date}</span>
                <Etiqueta estado={r.status} />
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <p className="max-w-2xl border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
        Lo que edites aquí no se ve en la web hasta que pulses{" "}
        <strong className="text-slate-700">Publicar cambios</strong>. Las reservas son la
        excepción: no salen en la web, así que cambiar su estado tiene efecto inmediato.
      </p>
    </div>
  );
}

function Tarjeta({
  titulo,
  pie,
  children,
}: {
  titulo: string;
  pie?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-lg bg-white p-6 ring-1 ring-slate-200")}>
      <h2 className="font-heading text-base font-bold text-slate-900">{titulo}</h2>
      {pie && <p className="mt-1 text-xs text-slate-400">{pie}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
