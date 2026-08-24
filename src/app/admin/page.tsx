import { Map, CalendarDays, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

async function getStats() {
  if (!supabase) {
    return { tours: 62, reservations: 0, revenue: 0, subscribers: 0 };
  }

  const [tours, reservations, revenue, subscribers] = await Promise.all([
    supabase.from("tours").select("*", { count: "exact", head: true }),
    supabase.from("reservations").select("*", { count: "exact", head: true }),
    supabase.from("reservations").select("travelers, tours(price)").eq("status", "confirmed"),
    supabase.from("subscribers").select("*", { count: "exact", head: true }),
  ]);

  const totalRevenue =
    revenue.data?.reduce(
      (acc, r: { travelers?: number; tours?: Array<{ price?: number }> }) =>
        acc + (r.travelers ?? 1) * (r.tours?.[0]?.price ?? 0),
      0
    ) ?? 0;

  return {
    tours: tours.count ?? 0,
    reservations: reservations.count ?? 0,
    revenue: totalRevenue,
    subscribers: subscribers.count ?? 0,
  };
}

const MOCK_CHART = [
  { day: "Lun", value: 12 },
  { day: "Mar", value: 19 },
  { day: "Mié", value: 8 },
  { day: "Jue", value: 15 },
  { day: "Vie", value: 22 },
  { day: "Sáb", value: 30 },
  { day: "Dom", value: 25 },
];

const MAX_VALUE = Math.max(...MOCK_CHART.map((d) => d.value));

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Tours activos", value: stats.tours, icon: Map, color: "bg-blue-500" },
    { label: "Reservas", value: stats.reservations, icon: CalendarDays, color: "bg-amber-500" },
    {
      label: "Ingresos",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      label: "Suscriptores",
      value: stats.subscribers,
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Resumen general del sitio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-slate-900">
                  {card.value}
                </p>
              </div>
              <div className={`grid size-10 place-items-center rounded-xl ${card.color} text-white`}>
                <card.icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reservas chart */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Reservas esta semana</h2>
          <div className="flex items-end gap-2" style={{ height: 160 }}>
            {MOCK_CHART.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-amber-400 to-amber-300 transition-all duration-500"
                  style={{ height: `${(d.value / MAX_VALUE) * 100}%` }}
                />
                <span className="text-[10px] text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tours populares */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Tours más populares</h2>
          <div className="space-y-3">
            {[
              { name: "Camino Inca Clásico", bookings: 48, pct: 100 },
              { name: "Machu Picchu Clásico", bookings: 42, pct: 87 },
              { name: "Laguna Humantay", bookings: 35, pct: 73 },
              { name: "Salkantay Trek", bookings: 28, pct: 58 },
              { name: "Rainbow Mountain", bookings: 24, pct: 50 },
            ].map((tour) => (
              <div key={tour.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{tour.name}</span>
                  <span className="text-slate-400">{tour.bookings}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                    style={{ width: `${tour.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimas reservas */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-4 text-sm font-bold text-slate-900">Últimas reservas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="pb-3 font-medium">Nombre</th>
                <th className="pb-3 font-medium">Tour</th>
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: "María García", tour: "Camino Inca", date: "15/08/2026", status: "confirmed" },
                { name: "John Smith", tour: "Machu Picchu Clásico", date: "14/08/2026", status: "pending" },
                { name: "Ana Silva", tour: "Laguna Humantay", date: "13/08/2026", status: "confirmed" },
              ].map((r, i) => (
                <tr key={i}>
                  <td className="py-3 font-medium text-slate-900">{r.name}</td>
                  <td className="py-3 text-slate-600">{r.tour}</td>
                  <td className="py-3 text-slate-400">{r.date}</td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        r.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {r.status === "confirmed" ? "Confirmada" : "Pendiente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
