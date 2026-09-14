"use client";

import { createContext, useContext, type ReactNode } from "react";
import { AJUSTES_POR_DEFECTO, type Ajustes } from "@/config/ajustes";

/*
 * Los ajustes de la agencia para los componentes de cliente.
 *
 * El layout los lee de Supabase al compilar y los pasa aquí una sola vez;
 * la cabecera, el menú, el botón de contacto o el panel de reserva los toman
 * de este contexto. Los componentes de servidor no lo necesitan: llaman
 * directamente a `getAjustes()`.
 */
const Contexto = createContext<Ajustes>(AJUSTES_POR_DEFECTO);

export function AjustesProvider({ ajustes, children }: { ajustes: Ajustes; children: ReactNode }) {
  return <Contexto.Provider value={ajustes}>{children}</Contexto.Provider>;
}

export function useAjustes(): Ajustes {
  return useContext(Contexto);
}
