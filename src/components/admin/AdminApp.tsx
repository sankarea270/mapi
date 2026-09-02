"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  alCambiarSesion,
  esAdmin,
  isSupabaseConfigured,
  salir,
  sesionActual,
} from "@/lib/admin/sesion";
import { Acceso } from "./Acceso";
import { PanelTours } from "./PanelTours";
import { PanelReservas } from "./PanelReservas";
import { PanelContenido } from "./PanelContenido";
import { Resumen } from "./Resumen";
import { BarraPublicar } from "./BarraPublicar";
import { Boton } from "./campos";
import { cn } from "@/lib/utils";

const VISTAS = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "tours", etiqueta: "Tours" },
  { id: "reservas", etiqueta: "Reservas" },
  { id: "paquetes", etiqueta: "Paquetes" },
  { id: "destinos", etiqueta: "Destinos" },
  { id: "resenas", etiqueta: "Reseñas" },
] as const;

export type Vista = (typeof VISTAS)[number]["id"];

function vistaDelHash(): Vista {
  if (typeof window === "undefined") return "resumen";
  const h = window.location.hash.replace("#", "");
  return VISTAS.some((v) => v.id === h) ? (h as Vista) : "resumen";
}

/**
 * Panel de administración.
 *
 * Es una sola página con vistas internas, no un árbol de rutas. Con el
 * export estático cada ruta se convierte en un HTML en disco, y una ruta
 * como /admin/tours/[id] exigiría conocer todos los identificadores al
 * compilar: imposible, porque los tours se crean después. La vista activa
 * se guarda en el hash de la URL, que no necesita servidor, así que
 * recargar o compartir el enlace conserva el sitio.
 */
export function AdminApp() {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<Vista>("resumen");
  const [menuAbierto, setMenuAbierto] = useState(false);
  /* Sube cada vez que se guarda algo: las vistas lo miran para recargar y la
     barra de publicar para saber que hay cambios sin desplegar. */
  const [revision, setRevision] = useState(0);
  const cambiado = useCallback(() => setRevision((n) => n + 1), []);

  useEffect(() => {
    setVista(vistaDelHash());
    const alNavegar = () => setVista(vistaDelHash());
    window.addEventListener("hashchange", alNavegar);
    return () => window.removeEventListener("hashchange", alNavegar);
  }, []);

  useEffect(() => {
    let vivo = true;
    sesionActual().then(async (s) => {
      if (!vivo) return;
      setSesion(s);
      setAutorizado(s ? await esAdmin() : null);
      setCargando(false);
    });
    const parar = alCambiarSesion(async (s) => {
      setSesion(s);
      setAutorizado(s ? await esAdmin() : null);
    });
    return () => {
      vivo = false;
      parar();
    };
  }, []);

  const irA = (v: Vista) => {
    window.location.hash = v;
    setVista(v);
    setMenuAbierto(false);
  };

  if (!isSupabaseConfigured) return <SinConfigurar />;
  if (cargando) return <Cargando />;
  if (!sesion) return <Acceso />;
  if (autorizado === false) return <SinPermiso email={sesion.user.email ?? ""} />;

  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr]">
      {menuAbierto && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-slate-950 text-white transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-white/10 px-6 py-6">
          <p className="font-heading text-lg font-extrabold leading-none">
            GoTo<span className="text-amber-500">Mapi</span>
          </p>
          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Administración
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {VISTAS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => irA(v.id)}
              aria-current={vista === v.id ? "page" : undefined}
              className={cn(
                "block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors",
                vista === v.id
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              )}
            >
              {v.etiqueta}
            </button>
          ))}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-4">
          <p className="truncate text-xs text-white/40" title={sesion.user.email ?? ""}>
            {sesion.user.email}
          </p>
          <button
            type="button"
            onClick={salir}
            className="text-sm font-medium text-white/55 transition-colors hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            className="rounded-md px-2.5 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 lg:hidden"
          >
            Menú
          </button>
          <h1 className="font-heading text-lg font-bold text-slate-900">
            {VISTAS.find((v) => v.id === vista)?.etiqueta}
          </h1>
          <div className="ml-auto">
            <BarraPublicar revision={revision} />
          </div>
        </header>

        <main className="px-4 py-7 sm:px-8">
          {vista === "resumen" && <Resumen revision={revision} onIr={irA} />}
          {vista === "tours" && <PanelTours revision={revision} onCambio={cambiado} />}
          {vista === "reservas" && <PanelReservas revision={revision} onCambio={cambiado} />}
          {vista === "paquetes" && (
            <PanelContenido tipo="paquetes" revision={revision} onCambio={cambiado} />
          )}
          {vista === "destinos" && (
            <PanelContenido tipo="destinos" revision={revision} onCambio={cambiado} />
          )}
          {vista === "resenas" && (
            <PanelContenido tipo="resenas" revision={revision} onCambio={cambiado} />
          )}
        </main>
      </div>
    </div>
  );
}

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 ring-1 ring-slate-200">
        {children}
      </div>
    </div>
  );
}

function Cargando() {
  return (
    <Marco>
      <p className="text-center text-sm text-slate-400">Comprobando la sesión…</p>
    </Marco>
  );
}

function SinPermiso({ email }: { email: string }) {
  return (
    <Marco>
      <h1 className="font-heading text-xl font-bold text-slate-900">Sin permiso</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        La cuenta <strong className="text-slate-900">{email}</strong> existe, pero no está en la
        lista de administradores. Tener cuenta en Supabase no basta a propósito: hay que añadir
        la fila correspondiente en la tabla <code className="text-slate-900">admins</code>.
      </p>
      <p className="mt-3 text-sm text-slate-500">
        En <code>docs/panel-admin.md</code> está la consulta exacta.
      </p>
      <div className="mt-6">
        <Boton variante="neutro" onClick={salir}>
          Cerrar sesión
        </Boton>
      </div>
    </Marco>
  );
}

function SinConfigurar() {
  return (
    <Marco>
      <h1 className="font-heading text-xl font-bold text-slate-900">Panel sin conectar</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Falta <code className="text-slate-900">NEXT_PUBLIC_SUPABASE_URL</code> o{" "}
        <code className="text-slate-900">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en el momento de
        compilar. Sin base de datos el panel no tiene qué administrar: la web está funcionando
        con el contenido de <code className="text-slate-900">src/data/</code>.
      </p>
      <p className="mt-3 text-sm text-slate-500">
        Los pasos están en <code>docs/panel-admin.md</code>.
      </p>
    </Marco>
  );
}
