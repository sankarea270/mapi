"use client";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

/*
 * Sesión del panel.
 *
 * El panel se sirve como HTML estático desde Apache: no hay servidor que
 * pueda comprobar nada antes de entregar la página. Por eso la protección
 * real NO está aquí, sino en las políticas RLS de Postgres: aunque alguien
 * se descargue el HTML del panel, sin una sesión válida y sin estar en la
 * tabla `admins` la base de datos le niega cada consulta.
 *
 * Lo de este archivo es la parte cómoda —enseñar el formulario de acceso en
 * vez de una pantalla de errores—, no la barrera.
 *
 * Esto sustituye al antiguo `src/lib/auth.ts`, que comparaba una contraseña
 * en texto plano de una variable de entorno y guardaba una cookie sin firmar:
 * cualquiera podía fabricársela a mano.
 */

export { isSupabaseConfigured };

export async function sesionActual(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Avisa de los cambios de sesión (entrar, salir, caducar el token). */
export function alCambiarSesion(cb: (s: Session | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => cb(sesion));
  return () => data.subscription.unsubscribe();
}

export async function entrar(email: string, password: string): Promise<string | null> {
  if (!supabase) return "Supabase no está configurado.";
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) return null;
  /* El mensaje de Supabase llega en inglés y es genérico a propósito: no
     distingue entre correo inexistente y contraseña mala, para no revelar
     qué cuentas existen. Se mantiene esa ambigüedad al traducirlo. */
  return error.message.includes("Invalid login")
    ? "Correo o contraseña incorrectos."
    : error.message;
}

export async function salir(): Promise<void> {
  await supabase?.auth.signOut();
}

/**
 * Comprueba que el usuario está en la lista blanca `admins`.
 *
 * Tener cuenta en Supabase no basta. Si esto devuelve `false`, las políticas
 * RLS también van a rechazar cualquier escritura, así que el panel se limita
 * a decirlo claro en vez de dejar que falle consulta a consulta.
 */
export async function esAdmin(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.from("admins").select("user_id").maybeSingle();
  if (error) {
    console.error("[panel] No se pudo comprobar la lista de administradores:", error);
    return false;
  }
  return Boolean(data);
}
