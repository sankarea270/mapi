import { Eye, MousePointerClick, Clock, Globe } from "lucide-react";

const MOCK_DATA = {
  pageviews: [
    { date: "01/08", value: 320 },
    { date: "02/08", value: 410 },
    { date: "03/08", value: 380 },
    { date: "04/08", value: 520 },
    { date: "05/08", value: 490 },
    { date: "06/08", value: 610 },
    { date: "07/08", value: 580 },
    { date: "08/08", value: 720 },
    { date: "09/08", value: 690 },
    { date: "10/08", value: 830 },
    { date: "11/08", value: 780 },
    { date: "12/08", value: 920 },
    { date: "13/08", value: 870 },
    { date: "14/08", value: 1040 },
  ],
  topPages: [
    { path: "/", views: 4200, title: "Homepage" },
    { path: "/tours/camino-inca-clasico", views: 1850, title: "Camino Inca" },
    { path: "/tours/machu-picchu-clasico", views: 1620, title: "Machu Picchu" },
    { path: "/tours/laguna-humantay", views: 1340, title: "Laguna Humantay" },
    { path: "/tours", views: 1200, title: "Tours" },
  ],
  devices: [
    { name: "Móvil", pct: 62 },
    { name: "Desktop", pct: 31 },
    { name: "Tablet", pct: 7 },
  ],
  locales: [
    { name: "Español", pct: 58 },
    { name: "English", pct: 30 },
    { name: "Português", pct: 12 },
  ],
};

const MAX_PAGEVIEWS = Math.max(...MOCK_DATA.pageviews.map((d) => d.value));

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Datos de tráfico (demo)</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Páginas vistas", value: "8,930", icon: Eye, color: "bg-blue-500" },
          { label: "Sesiones", value: "5,240", icon: MousePointerClick, color: "bg-amber-500" },
          { label: "Tiempo medio", value: "2m 45s", icon: Clock, color: "bg-emerald-500" },
          { label: "Países", value: "23", icon: Globe, color: "bg-purple-500" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div className={`grid size-10 place-items-center rounded-xl ${card.color} text-white`}>
                <card.icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pageviews chart */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Páginas vistas (últimos 14 días)</h2>
          <div className="flex items-end gap-1" style={{ height: 160 }}>
            {MOCK_DATA.pageviews.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-md bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                  style={{ height: `${(d.value / MAX_PAGEVIEWS) * 100}%` }}
                />
                {d.date.endsWith("01") || d.date.endsWith("08") ? (
                  <span className="text-[9px] text-slate-400">{d.date}</span>
                ) : (
                  <span className="text-[9px] text-transparent">{d.date}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top pages */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Páginas más visitadas</h2>
          <div className="space-y-3">
            {MOCK_DATA.topPages.map((page, i) => (
              <div key={page.path}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    <span className="mr-2 text-xs text-slate-400">{i + 1}.</span>
                    {page.title}
                  </span>
                  <span className="text-slate-400">{page.views.toLocaleString()}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                    style={{ width: `${(page.views / MOCK_DATA.topPages[0].views) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Dispositivos</h2>
          <div className="space-y-3">
            {MOCK_DATA.devices.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{d.name}</span>
                  <span className="text-slate-400">{d.pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-slate-700 to-slate-500"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locales */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Idiomas</h2>
          <div className="space-y-3">
            {MOCK_DATA.locales.map((l) => (
              <div key={l.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{l.name}</span>
                  <span className="text-slate-400">{l.pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                    style={{ width: `${l.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
