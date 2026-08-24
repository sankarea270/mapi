import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">Datos generales del sitio</p>
      </div>

      <form className="space-y-6">
        {/* Site info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Información del sitio</h2>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Nombre</label>
            <input
              defaultValue="Mapi Travels"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Descripción</label>
            <textarea
              defaultValue="Tours y paquetes turísticos en Perú"
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Contacto</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Teléfono</label>
              <input
                defaultValue="+51 984 235 103"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
              <input
                defaultValue="reservas@mapitravels.pe"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Redes sociales</h2>
          <div className="grid grid-cols-2 gap-4">
            {["Facebook", "Instagram", "TikTok", "YouTube"].map((name) => (
              <div key={name}>
                <label className="mb-1 block text-xs font-medium text-slate-500">{name}</label>
                <input
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  placeholder={`https://${name.toLowerCase()}.com/mapitravels`}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          <Save className="size-4" />
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
