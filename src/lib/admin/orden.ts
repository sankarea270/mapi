import { supabase } from "@/lib/supabase";

/**
 * Sube o baja una fila de una lista ordenada a mano (equipo, fotos de la
 * portada) y devuelve el error de Supabase, si lo hubo.
 *
 * Antes se intercambiaban los dos números con un `upsert` que llevaba solo
 * `id` y `sort_order`. Postgres comprueba los NOT NULL de la fila a insertar
 * ANTES de mirar si ya existe, así que el `upsert` fallaba siempre con
 * «null value in column "name"» y las flechas no movían nada. Además, si dos
 * filas tenían el mismo número (las de equipo nacen todas con 10),
 * intercambiarlos no cambiaba el orden.
 *
 * Ahora se renumera toda la lista de diez en diez con el nuevo orden y se
 * actualizan solo las filas cuyo número cambia: un `update` por fila, que no
 * toca las demás columnas.
 */
export async function moverFila<T extends { id: string; sort_order: number | null }>(
  tabla: string,
  filas: T[],
  i: number,
  direccion: -1 | 1
): Promise<{ message: string; code?: string } | null> {
  if (!supabase) return null;
  const j = i + direccion;
  if (j < 0 || j >= filas.length) return null;

  const nuevas = [...filas];
  [nuevas[i], nuevas[j]] = [nuevas[j], nuevas[i]];

  const cambios = nuevas
    .map((fila, k) => ({ id: fila.id, antes: fila.sort_order, sort_order: (k + 1) * 10 }))
    .filter((c) => c.antes !== c.sort_order);

  const respuestas = await Promise.all(
    cambios.map((c) => supabase!.from(tabla).update({ sort_order: c.sort_order }).eq("id", c.id))
  );
  return respuestas.find((r) => r.error)?.error ?? null;
}
