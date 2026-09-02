/*
 * Forma de las filas de Supabase.
 *
 * El cliente de `@supabase/supabase-js` está sin tipar —no se han generado
 * los tipos del esquema—, así que `select()` devuelve `GenericStringError`.
 * Estas interfaces son el contrato entre la base de datos y el código: se
 * escriben a mano a partir de `supabase/migrations/`, y si cambia una
 * columna allí hay que cambiarla aquí.
 *
 * Los precios llegan como cadena porque Postgres serializa DECIMAL así para
 * no perder precisión al pasar por JSON.
 */

export type Estado = "draft" | "published";

export interface FilaCategoria {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  name_pt: string;
  sort_order: number | null;
}

export interface FilaTour {
  id: string;
  category_id: string | null;
  slug: string;
  name_es: string;
  name_en: string;
  name_pt: string;
  duration_es: string | null;
  duration_en: string | null;
  duration_pt: string | null;
  price: number | string;
  rating: number | string | null;
  featured: boolean | null;
  status: Estado;
  image_url: string | null;
  gallery: string[] | null;
  excerpt_es: string | null;
  excerpt_en: string | null;
  excerpt_pt: string | null;
  included: Array<{ es: string; en: string; pt: string }> | null;
  itinerary: Array<{
    day: string;
    title: { es: string; en: string; pt: string };
    description: { es: string; en: string; pt: string };
  }> | null;
  updated_at: string | null;
}

export interface FilaPaquete {
  id: string;
  slug: string;
  name_es: string;
  name_en: string | null;
  name_pt: string | null;
  description_es: string | null;
  description_en: string | null;
  description_pt: string | null;
  duration_es: string | null;
  duration_en: string | null;
  duration_pt: string | null;
  price: number | string;
  image_url: string | null;
  tour_slugs: string[] | null;
  status: Estado;
  sort_order: number | null;
}

export interface FilaDestino {
  id: string;
  slug: string;
  name_es: string;
  name_en: string | null;
  name_pt: string | null;
  description_es: string | null;
  description_en: string | null;
  description_pt: string | null;
  image_url: string | null;
  category_slugs: string[] | null;
  tour_slugs: string[] | null;
  status: Estado;
  sort_order: number | null;
}

export interface FilaResena {
  id: string;
  author: string;
  country: string | null;
  rating: number;
  text_es: string;
  text_en: string | null;
  text_pt: string | null;
  tour_slug: string | null;
  status: Estado;
  sort_order: number | null;
}

export type EstadoReserva = "pending" | "confirmed" | "cancelled" | "completed";

export interface FilaReserva {
  id: string;
  tour_slug: string;
  tour_name: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  travel_date: string;
  travelers: number;
  status: EstadoReserva;
  notes: string | null;
  locale: string | null;
  source: string | null;
  created_at: string;
}
