"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { normalize } from "@/lib/catalog";
import type { EstadoReserva, FilaReserva } from "@/types/db";
import { Boton, Etiqueta } from "./campos";
import { cn } from "@/lib/utils";

const ESTADOS: Array<{ id: EstadoReserva; etiqueta: string }> = [
  { id: "pending", etiqueta: "Pendiente" },
  { id: "confirmed", etiqueta: "Confirmada" },
  { id: "completed", etiqueta: "Completada" },
  { id: "cancelled", etiqueta: "Cancelada" },
];

/**
 * Solicitudes recibidas por el formulario de la web.
 *
 * Ojo con una diferencia importante respecto al resto del panel: esto NO
 * necesita publicar. Las reservas no salen en la web, así que cambiar el
 * estado de una tiene efecto inmediato. Publicar solo hace falta para el
 * contenido que se ve.
 */
export function PanelReservas({
  revision,
  onCambio,
}: {
  revision: number;
  onCambio: () => void;
}) {
  const [reservas, setReservas] = useState<FilaReserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<EstadoReserva | "todas">("todas");
  const [busqueda, setBusqueda] = useState("");
  const [abierta, setAbierta] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;
    (async () => {
      const { data, error: fallo } = await supabase!
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });
      if (!vivo) return;
      if (fallo) setError(fallo.message);
      setReservas((data ?? []) as unknown as FilaReserva[]);
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [revision]);

  const visibles = useMemo(() => {
    const q = normalize(busqueda.trim());
    return reservas.filter((r) => {
      if (filtro !== "todas" && r.status !== filtro) return false;
      if (!q) return true;
      return normalize(`${r.full_name} ${r.email} ${r.tour_name ?? r.tour_slug}`).includes(q);
    });
  }, [reservas, filtro, busqueda]);

  async function cambiarEstado(r: FilaReserva, status: EstadoReserva) {
    if (!supabase) return;
    /* Se pinta antes de que responda el servidor: el panel lo usa alguien que
       está al teléfono con el cliente y no puede esperar a cada ida y vuelta.
       Si falla, se revierte y se avisa. */
    const previo = reservas;
    setReservas((lista) => lista.map((x) => (x.id === r.id ? { ...x, status } : x)));
    const { error: fallo } = await supabase.from("reservations").update({ status }).eq("id", r.id);
    if (fallo) {
      setReservas(previo);
      setError(fallo.message);
    }
  }

  async function borrar(r: FilaReserva) {
    if (!supabase) return;
    if (!confirm(`¿Borrar la solicitud de ${r.full_name}? No se puede deshacer.`)) return;
    const { error: fallo } = await supabase.from("reservations").delete().eq("id", r.id);
    if (fallo) return setError(fallo.message);
    onCambio();
  }

  if (cargando) return <p className="text-sm text-slate-400">Cargando…</p>;

  const cuenta = (e: EstadoReserva) => reservas.filter((r) => r.status === e).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-md ring-1 ring-slate-200">
          {(["todas", ...ESTADOS.map((e) => e.id)] as const).map((id) => {
            const activo = filtro === id;
            const etiqueta =
              id === "todas" ? "Todas" : ESTADOS.find((e) => e.id === id)!.etiqueta;
            const n = id === "todas" ? reservas.length : cuenta(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFiltro(id)}
                aria-pressed={activo}
                className={cn(
                  "border-r border-slate-200 px-3.5 py-2 text-xs font-semibold transition-colors last:border-r-0",
                  activo ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                )}
              >
                {etiqueta} <span className={activo ? "text-white/50" : "text-slate-300"}>{n}</span>
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, correo o tour…"
          className="min-w-56 flex-1 rounded-md border-0 bg-white px-4 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none placeholder:text-slate-300 focus:ring-teal-500"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {visibles.length === 0 ? (
        <p className="max-w-xl text-sm leading-relaxed text-slate-500">
          {reservas.length === 0
            ? "Todavía no hay solicitudes. Aparecerán aquí en cuanto alguien envíe el formulario de la web; el cliente sigue yendo a WhatsApp como siempre, pero ahora además queda registrada."
            : "Ninguna solicitud coincide con el filtro."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg bg-white ring-1 ring-slate-200">
          {visibles.map((r) => {
            const desplegada = abierta === r.id;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setAbierta(desplegada ? null : r.id)}
                  aria-expanded={desplegada}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-900">
                      {r.full_name}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {r.tour_name ?? r.tour_slug} · {r.travelers}{" "}
                      {r.travelers === 1 ? "viajero" : "viajeros"}
                    </span>
                  </span>
                  <span className="text-sm text-slate-500">{r.travel_date}</span>
                  <Etiqueta estado={r.status} />
                </button>

                {desplegada && (
                  <div className="space-y-5 border-t border-slate-100 bg-slate-50 px-5 py-5">
                    <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                      <Dato titulo="Correo">
                        <a href={`mailto:${r.email}`} className="text-teal-700 hover:underline">
                          {r.email}
                        </a>
                      </Dato>
                      <Dato titulo="Teléfono">
                        {r.phone ? (
                          <a
                            href={`https://wa.me/${r.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-700 hover:underline"
                          >
                            {r.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400">No lo dejó</span>
                        )}
                      </Dato>
                      <Dato titulo="Recibida">
                        {new Date(r.created_at).toLocaleString("es-PE")}
                      </Dato>
                      <Dato titulo="Idioma">{r.locale ?? "—"}</Dato>
                      {r.notes && (
                        <div className="sm:col-span-2">
                          <Dato titulo="Mensaje">
                            <span className="whitespace-pre-wrap">{r.notes}</span>
                          </Dato>
                        </div>
                      )}
                    </dl>

                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                      {ESTADOS.map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => cambiarEstado(r, e.id)}
                          disabled={r.status === e.id}
                          className={cn(
                            "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                            r.status === e.id
                              ? "cursor-default bg-slate-900 text-white"
                              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                          )}
                        >
                          {e.etiqueta}
                        </button>
                      ))}
                      <span className="ml-auto">
                        <Boton variante="peligro" onClick={() => borrar(r)}>
                          Borrar
                        </Boton>
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="eyebrow text-slate-400">{titulo}</dt>
      <dd className="mt-1 text-slate-800">{children}</dd>
    </div>
  );
}
