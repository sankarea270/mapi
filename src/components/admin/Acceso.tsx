"use client";

import { useState } from "react";
import { entrar } from "@/lib/admin/sesion";
import { Boton, Campo } from "./campos";

/**
 * Pantalla de acceso.
 *
 * Contra Supabase Auth: la contraseña viaja cifrada y se guarda con hash en
 * el servidor. El panel anterior comparaba contra una variable de entorno en
 * texto plano y dejaba una cookie sin firmar que cualquiera podía fabricarse.
 */
export function Acceso() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    const fallo = await entrar(email.trim(), password);
    /* Si entra, `onAuthStateChange` cambia la pantalla y este componente se
       desmonta; solo hay que soltar el botón cuando ha fallado. */
    if (fallo) {
      setError(fallo);
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-heading text-2xl font-extrabold text-slate-900">
            GoTo<span className="text-amber-500">Mapi</span>
          </p>
          <p className="eyebrow mt-2 text-slate-400">Panel de administración</p>
        </div>

        <form
          onSubmit={enviar}
          noValidate
          className="space-y-6 rounded-lg bg-white p-7 ring-1 ring-slate-200"
        >
          <Campo
            etiqueta="Correo"
            tipo="email"
            valor={email}
            onChange={setEmail}
            placeholder="tu@gotomachupicchuperu.com"
          />
          <Campo
            etiqueta="Contraseña"
            tipo="password"
            valor={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <Boton tipo="submit" disabled={enviando || !email || !password} className="w-full">
            {enviando ? "Entrando…" : "Entrar"}
          </Boton>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">
          Las cuentas se crean desde Supabase, no desde aquí. Así nadie puede darse de alta solo.
        </p>
      </div>
    </div>
  );
}
