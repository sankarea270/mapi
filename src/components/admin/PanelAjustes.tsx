"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  AJUSTES_POR_DEFECTO,
  CAMPOS_AJUSTES,
  mezclarAjustes,
  redesConEnlace,
  type Ajustes,
} from "@/config/ajustes";
import { Boton, Campo } from "./campos";
import { CampoImagen } from "./CampoImagen";

/*
 * Ajustes de la agencia: datos legales, contacto y redes.
 *
 * Lo que se guarda aquí aparece en toda la web al publicar: la barra de
 * arriba, el menú, el pie, contacto, las fichas, el botón flotante, la
 * página «Nosotros» y los textos legales. Por eso se valida con más cuidado
 * que un texto normal: un número de WhatsApp mal escrito deja sin contacto
 * a todo el sitio a la vez.
 */

type Red = "facebook" | "instagram" | "tiktok" | "youtube";

const DOMINIOS: Record<Red, RegExp> = {
  facebook: /(^|\.)facebook\.com$|(^|\.)fb\.com$/,
  instagram: /(^|\.)instagram\.com$/,
  tiktok: /(^|\.)tiktok\.com$/,
  youtube: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/,
};

const BASE_USUARIO: Partial<Record<Red, string>> = {
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/@",
  youtube: "https://www.youtube.com/@",
};

/** Deja la dirección de una red lista para enlazar, o explica qué falla. */
export function normalizarRed(red: Red, valor: string): { url: string; error?: string } {
  const v = valor.trim();
  if (!v) return { url: "" };
  /* "@usuario" o "usuario" suelto: se completa la dirección. */
  if (!/^https?:\/\//i.test(v) && !v.includes(".")) {
    const base = BASE_USUARIO[red];
    if (!base) return { url: v, error: "Pega la dirección completa de la página." };
    return { url: base + v.replace(/^@/, "") };
  }
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    /* web.facebook.com y m.facebook.com son el mismo perfil: se guarda la
       forma normal, que es la que abre bien en cualquier dispositivo. */
    if (red === "facebook") u.hostname = "www.facebook.com";
    u.protocol = "https:";
    for (const p of ["_rdc", "_rdr"]) u.searchParams.delete(p);
    if (!DOMINIOS[red].test(u.hostname)) {
      return { url: u.toString(), error: `No parece una dirección de ${red}.` };
    }
    return { url: u.toString() };
  } catch {
    return { url: v, error: "No es una dirección válida." };
  }
}

function errores(a: Ajustes): Partial<Record<keyof Ajustes, string>> {
  const e: Partial<Record<keyof Ajustes, string>> = {};
  if (!/^\d{11}$/.test(a.ruc.trim())) e.ruc = "El RUC tiene 11 dígitos.";
  if (!/^\d{8,15}$/.test(a.whatsapp.replace(/\D/g, "")))
    e.whatsapp = "Solo números, con el código de país: 51 y el número.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.correo.trim())) e.correo = "Revisa el correo.";
  if (a.correoReservas.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.correoReservas.trim()))
    e.correoReservas = "Revisa el correo.";
  if (a.telefono.replace(/\D/g, "").length < 7) e.telefono = "Revisa el teléfono.";
  for (const campo of ["razonSocial", "domicilio", "ciudad"] as const) {
    if (!a[campo].trim()) e[campo] = "Obligatorio.";
  }
  for (const red of ["facebook", "instagram", "tiktok", "youtube"] as const) {
    const r = normalizarRed(red, a[red]);
    if (r.error) e[red] = r.error;
  }
  return e;
}

export function PanelAjustes({ revision, onCambio }: { revision: number; onCambio: () => void }) {
  const [form, setForm] = useState<Ajustes>(AJUSTES_POR_DEFECTO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [intentado, setIntentado] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;
    (async () => {
      const { data, error } = await supabase!
        .from("site_settings")
        .select("data")
        .eq("id", 1)
        .maybeSingle();
      if (!vivo) return;
      if (error) {
        setMensaje({
          tipo: "error",
          texto:
            error.code === "PGRST205" || error.code === "42P01"
              ? "Todavía no existe la tabla de ajustes: ejecuta 009_ajustes.sql en Supabase. Mientras tanto la web usa estos valores."
              : error.message,
        });
      }
      setForm(mezclarAjustes((data?.data as Record<string, unknown> | undefined) ?? null));
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [revision]);

  const set = (k: keyof Ajustes) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const fallos = errores(form);
  const hayFallos = Object.keys(fallos).length > 0;
  const ver = (k: keyof Ajustes) => (intentado ? fallos[k] : undefined);

  async function guardar() {
    if (!supabase) return;
    setIntentado(true);
    setMensaje(null);
    if (hayFallos) {
      setMensaje({ tipo: "error", texto: "Hay campos por corregir, marcados en rojo." });
      return;
    }

    const limpio = Object.fromEntries(CAMPOS_AJUSTES.map((k) => [k, form[k].trim()])) as unknown as Ajustes;
    limpio.whatsapp = limpio.whatsapp.replace(/\D/g, "");
    for (const red of ["facebook", "instagram", "tiktok", "youtube"] as const) {
      limpio[red] = normalizarRed(red, limpio[red]).url;
    }

    setGuardando(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: 1, data: limpio, updated_at: new Date().toISOString() });
    setGuardando(false);

    if (error) {
      setMensaje({
        tipo: "error",
        texto:
          error.code === "PGRST205" || error.code === "42P01"
            ? "No se pudo guardar: falta ejecutar 009_ajustes.sql en Supabase."
            : error.message,
      });
      return;
    }
    setForm(limpio);
    setMensaje({
      tipo: "ok",
      texto: "Guardado. Pulsa «Publicar cambios» para que se vea en toda la web.",
    });
    onCambio();
  }

  if (cargando) return <p className="text-sm text-slate-400">Cargando…</p>;

  const canales = ["WhatsApp", ...redesConEnlace(form).map((r) => r.etiqueta)];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
      className="max-w-3xl space-y-8"
    >
      <p className="text-sm leading-relaxed text-slate-500">
        Estos datos salen en toda la web: la barra de arriba, el menú, el pie, contacto, las fichas,
        el botón de contacto, «Nosotros» y los textos legales. Se ven al pulsar{" "}
        <b className="text-slate-700">Publicar cambios</b>.
      </p>

      {mensaje && (
        <p
          role={mensaje.tipo === "error" ? "alert" : "status"}
          className={
            mensaje.tipo === "ok"
              ? "rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200"
              : "rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200"
          }
        >
          {mensaje.texto}
        </p>
      )}

      <section className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
        <h3 className="eyebrow text-slate-900">Contacto</h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Campo
            etiqueta="Teléfono (como se muestra)"
            valor={form.telefono}
            onChange={set("telefono")}
            placeholder="+51 986 377 524"
            error={ver("telefono")}
          />
          <Campo
            etiqueta="Número de WhatsApp"
            valor={form.whatsapp}
            onChange={set("whatsapp")}
            placeholder="51986377524"
            ayuda="Solo números, empezando por 51. Es el que abren todos los botones de WhatsApp."
            error={ver("whatsapp")}
          />
          <Campo
            etiqueta="Correo de reservas"
            tipo="email"
            valor={form.correoReservas}
            onChange={set("correoReservas")}
            error={ver("correoReservas")}
            ayuda="El del dominio de la agencia. Sale en la barra de arriba y primero en contacto."
          />
          <Campo
            etiqueta="Correo de consultas"
            tipo="email"
            valor={form.correo}
            onChange={set("correo")}
            error={ver("correo")}
            ayuda="Comprueba que el buzón existe: los dos salen en contacto, el pie y los textos legales."
          />
          <Campo etiqueta="Horario" valor={form.horario} onChange={set("horario")} />
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
        <h3 className="eyebrow text-slate-900">Redes sociales</h3>
        <p className="mt-2 text-sm text-slate-500">
          Pega la dirección de la página o escribe el usuario. Deja vacía la red que no uses: no se
          mostrará en ninguna parte.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Campo
            etiqueta="Facebook"
            valor={form.facebook}
            onChange={set("facebook")}
            placeholder="https://www.facebook.com/…"
            error={ver("facebook")}
          />
          <Campo
            etiqueta="Instagram"
            valor={form.instagram}
            onChange={set("instagram")}
            placeholder="@usuario o dirección"
            error={ver("instagram")}
          />
          <Campo
            etiqueta="TikTok"
            valor={form.tiktok}
            onChange={set("tiktok")}
            placeholder="@usuario o dirección"
            error={ver("tiktok")}
          />
          <Campo
            etiqueta="YouTube"
            valor={form.youtube}
            onChange={set("youtube")}
            placeholder="@canal o dirección"
            error={ver("youtube")}
          />
        </div>
        <p className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-500">
          El botón de contacto de la web mostrará:{" "}
          <b className="text-slate-800">{canales.join(" · ")}</b>
        </p>
      </section>

      <section className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
        <h3 className="eyebrow text-slate-900">Página de tours</h3>
        <div className="mt-6">
          <CampoImagen
            etiqueta="Fondo de la cabecera («Todos»)"
            valor={form.fondoTours}
            onChange={set("fondoTours")}
            carpeta="categorias"
            ayuda="Vacío: se usa la foto del tour mejor valorado. El de cada categoría se cambia en Tours → Fondos de categoría."
          />
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
        <h3 className="eyebrow text-slate-900">Datos legales</h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Campo
            etiqueta="Razón social"
            valor={form.razonSocial}
            onChange={set("razonSocial")}
            error={ver("razonSocial")}
            className="sm:col-span-2"
          />
          <Campo etiqueta="RUC" valor={form.ruc} onChange={set("ruc")} error={ver("ruc")} />
          <Campo etiqueta="Actividad" valor={form.actividad} onChange={set("actividad")} />
          <Campo
            etiqueta="Licencia de funcionamiento"
            valor={form.licenciaFuncionamiento}
            onChange={set("licenciaFuncionamiento")}
          />
          <Campo
            etiqueta="Certificado de autorización"
            valor={form.certificadoAutorizacion}
            onChange={set("certificadoAutorizacion")}
          />
          <Campo
            etiqueta="Domicilio"
            valor={form.domicilio}
            onChange={set("domicilio")}
            error={ver("domicilio")}
            className="sm:col-span-2"
          />
          <Campo
            etiqueta="Ciudad"
            valor={form.ciudad}
            onChange={set("ciudad")}
            error={ver("ciudad")}
            ayuda="La de los juzgados en los términos y condiciones."
          />
        </div>
      </section>

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <Boton tipo="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar ajustes"}
        </Boton>
      </div>
    </form>
  );
}
