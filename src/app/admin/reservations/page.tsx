import { supabase } from "@/lib/supabase";
import { CalendarDays, Mail, Phone, Users } from "lucide-react";

async function getReservations() {
  if (!supabase) return [];

  const { data } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-amber-50 text-amber-600" },
  confirmed: { label: "Confirmada", color: "bg-emerald-50 text-emerald-600" },
  completed: { label: "Completada", color: "bg-blue-50 text-blue-600" },
  cancelled: { label: "Cancelada", color: "bg-slate-100 text-slate-500" },
};

export default async function ReservationsPage() {
  const reservations = await getReservations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Reservas</h1>
        <p className="mt-1 text-sm text-slate-500">{reservations.length} reservas registradas</p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Tour</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Viajeros</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reservations.map((r) => {
                const status = STATUS_MAP[String(r.status)] ?? STATUS_MAP.pending;
                return (
                  <tr key={String(r.id)} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{String(r.full_name)}</td>
                    <td className="px-4 py-3 text-slate-600">{String(r.tour_slug)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        {String(r.travel_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {String(r.travelers)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-slate-400">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Mail className="size-3" />
                          {String(r.email)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Phone className="size-3" />
                          {String(r.phone)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                    No hay reservas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
