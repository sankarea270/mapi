"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { FilaReserva } from "@/types/db";
import type { Vista } from "./AdminApp";
import { Etiqueta } from "./campos";

interface Cifras {
  tours: number;
  borradores: number;
  reservas: number;
  pendientes: number;
  paquetes: number;
  destinos: number;
  resenas: number;
}

const VACIO: Cifras = {
  tours: 0,
  borradores: 0,
  reservas: 0,
  pendientes: 0,
  paquetes: 0,
  destinos: 0,
  resenas: 0,
};

/** Cuenta filas sin traérselas: `head` pide solo la cabecera con el total. */
async function contar(tabla: string, filtro?: [string, string]): Promise<number> {
  let q = supabase!.from(tabla).select("*", { count: "exact", head: true });
  if (filtro) q = q.eq(filtro[0], filtro[1]);
  const { count } = await q;
  return count ?? 0;
}

export function Resumen({ revision, onIr }: { revision: number; onIr: (v: Vista) => void }) {
  const [cifras, setCifras] = useState<Cifras>(VACIO);
  const [ultimas, setUltimas] = useState<FilaReserva[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;

    (async () => {
      const [tours, borradores, reservas, pendientes, paquetes, destinos, resenas] =
        await Promise.all([
          contar("tours"),
          contar("tours", ["status", "draft"]),
          contar("reservations"),
          contar("reservations", ["status", "pending"]),
          contar("packages"),
          contar("destinations"),
          contar("reviews"),
        ]);

      const { data } = await supabase!
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!vivo) return;
      setCifras({ tours, borradores, reservas, pendientes, paquetes, destinos, resenas });
      setUltimas((data ?? []) as unknown as FilaReserva[]);
      setCargando(false);
    })();

    return () => {
      vivo = false;
    };
  }, [revision]);

  if (cargando) return <p className="text-sm text-slate-400">Cargando…</p>;

  const tarjetas: Array<{ etiqueta: string; valor: number; pie?: string; vista: Vista }> = [
    {
      etiqueta: "Tours",
      valor: cifras.tours,
      pie: cifras.borradores > 0 ? `${cifras.borradores} en borrador` : undefined,
      vista: "tours",
    },
    {
      etiqueta: "Reservas",
      valor: cifras.reservas,
      pie: cifras.pendientes > 0 ? `${cifras.pendientes} sin atender` : undefined,
      vista: "reservas",
    },
    { etiqueta: "Paquetes", valor: cifras.paquetes, vista: "paquetes" },
    { etiqueta: "Destinos", valor: cifras.destinos, vista: "destinos" },
    { etiqueta: "Reseñas", valor: cifras.resenas, vista: "resenas" },
  ];

  return (
    <div className="space-y-9">
      <div className="grid gap-px overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-3 lg:grid-cols-5">
        {tarjetas.map((c) => (
          <button
            key={c.etiqueta}
            type="button"
            onClick={() => onIr(c.vista)}
            className="bg-white px-5 py-6 text-left transition-colors hover:bg-slate-50"
          >
            <p className="eyebrow text-slate-400">{c.etiqueta}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-slate-900">{c.valor}</p>
            <p className="mt-1 h-4 text-xs text-amber-600">{c.pie ?? ""}</p>
          </button>
        ))}
      </div>

      <section>
        <h2 className="font-heading text-base font-bold text-slate-900">Últimas reservas</h2>
        {ultimas.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Todavía no hay ninguna. Las solicitudes del formulario de la web aparecerán aquí en
            cuanto alguien lo envíe.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-lg bg-white ring-1 ring-slate-200">
            {ultimas.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                <span className="font-medium text-slate-900">{r.full_name}</span>
                <span className="text-sm text-slate-500">{r.tour_name ?? r.tour_slug}</span>
                <span className="text-sm text-slate-400">{r.travel_date}</span>
                <span className="ml-auto">
                  <Etiqueta estado={r.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="max-w-2xl border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
        Lo que guardes aquí no se ve en la web hasta que pulses{" "}
        <strong className="text-slate-700">Publicar cambios</strong>. La web son páginas ya
        escritas en el servidor —por eso carga rápido y la encuentra Google—, así que hay que
        volver a generarlas. Tarda unos tres minutos.
      </p>
    </div>
  );
}
