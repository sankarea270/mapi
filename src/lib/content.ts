import { supabase } from "@/lib/supabase";
import { pickLocalized } from "@/lib/format";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { PACKAGES, type TourPackage } from "@/data/packages";
import { REVIEWS, type Review } from "@/data/reviews";
import { HERO_SLIDES, type HeroSlide } from "@/data/portada";
import { EQUIPO, type MiembroEquipo } from "@/data/equipo";
import type { LocalizedText } from "@/types/tour";
import type { FilaDestino, FilaPaquete, FilaResena } from "@/types/db";

/*
 * Paquetes, destinos y reseñas leídos de Supabase en tiempo de compilación,
 * con los ficheros de `src/data` como red de seguridad.
 *
 * Misma estrategia que `src/lib/tours.ts`: si Supabase no está configurado,
 * o responde vacío, o falla, se usa el contenido del repositorio. Así la web
 * compila igual en un portátil recién clonado y una caída de la base de
 * datos no deja el sitio sin contenido.
 *
 * Las tres funciones se llaman desde componentes de servidor, o sea durante
 * `next build`. En la web publicada no queda ni rastro de Supabase.
 */

function loc(es: string | null, en: string | null, pt: string | null): LocalizedText {
  const base = es ?? en ?? pt ?? "";
  return { es: base, en: en ?? base, pt: pt ?? en ?? base };
}

/* Postgres devuelve DECIMAL como cadena para no perder precisión. */
function num(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function slugList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((s): s is string => typeof s === "string") : [];
}

/**
 * Envuelve una consulta para que nunca tumbe la compilación: ante cualquier
 * problema devuelve el contenido del repositorio y deja constancia en el log.
 */
async function conRespaldo<T>(
  etiqueta: string,
  respaldo: T[],
  consulta: () => Promise<T[]>
): Promise<T[]> {
  if (!supabase) return respaldo;
  try {
    const filas = await consulta();
    if (filas.length > 0) return filas;
    console.warn(`[${etiqueta}] Supabase no devolvió filas; se usa el contenido del repositorio.`);
  } catch (error) {
    console.error(`[${etiqueta}] Error consultando Supabase; se usa el contenido del repositorio:`, error);
  }
  return respaldo;
}

export async function getPackages(): Promise<TourPackage[]> {
  return conRespaldo("paquetes", PACKAGES, async () => {
    const { data, error } = await supabase!
      .from("packages")
      .select(
        "slug, name_es, name_en, name_pt, description_es, description_en, description_pt, " +
          "duration_es, duration_en, duration_pt, price, image_url, tour_slugs"
      )
      .order("sort_order");
    if (error) throw error;

    return ((data ?? []) as unknown as FilaPaquete[]).map((p) => ({
      slug: p.slug,
      name: loc(p.name_es, p.name_en, p.name_pt),
      description: loc(p.description_es, p.description_en, p.description_pt),
      duration: loc(p.duration_es, p.duration_en, p.duration_pt),
      price: num(p.price),
      image: p.image_url ?? "",
      tourSlugs: slugList(p.tour_slugs),
    }));
  });
}

export async function getDestinations(): Promise<Destination[]> {
  return conRespaldo("destinos", DESTINATIONS, async () => {
    const { data, error } = await supabase!
      .from("destinations")
      .select(
        "slug, name_es, name_en, name_pt, description_es, description_en, description_pt, " +
          "image_url, category_slugs, tour_slugs"
      )
      .order("sort_order");
    if (error) throw error;

    return ((data ?? []) as unknown as FilaDestino[]).map((d) => ({
      slug: d.slug,
      name: loc(d.name_es, d.name_en, d.name_pt),
      description: loc(d.description_es, d.description_en, d.description_pt),
      image: d.image_url ?? "",
      categorySlugs: slugList(d.category_slugs),
      tourSlugs: slugList(d.tour_slugs),
    }));
  });
}

export async function getReviews(): Promise<Review[]> {
  return conRespaldo("reseñas", REVIEWS, async () => {
    const { data, error } = await supabase!
      .from("reviews")
      .select("id, author, country, rating, text_es, text_en, text_pt, tour_slug")
      .order("sort_order");
    if (error) throw error;

    return ((data ?? []) as unknown as FilaResena[]).map((r) => ({
      id: r.id,
      name: r.author,
      country: r.country ?? "",
      rating: num(r.rating, 5),
      text: loc(r.text_es, r.text_en, r.text_pt),
      ...(r.tour_slug ? { tourSlug: r.tour_slug } : {}),
    }));
  });
}

/**
 * Fotos de la portada.
 *
 * Solo se piden las publicadas y en el orden fijado en el panel. Si la tabla
 * no existe todavía —el panel es posterior al sitio— o está vacía, se
 * devuelven las del repositorio: la primera pantalla nunca se queda en negro
 * por un problema de base de datos.
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  return conRespaldo("portada", HERO_SLIDES, async () => {
    const { data, error } = await supabase!
      .from("hero_slides")
      .select("image_url, alt_es, sort_order, status")
      .eq("status", "published")
      .order("sort_order");
    if (error) throw error;
    return (data ?? [])
      .filter((f) => typeof f.image_url === "string" && f.image_url.trim() !== "")
      .map((f) => ({
        src: f.image_url as string,
        alt: (f.alt_es as string) ?? "",
      }));
  });
}

/**
 * Equipo.
 *
 * Solo los publicados y en el orden fijado en el panel. Si la tabla no
 * existe todavía o está vacía, se devuelven las fichas del repositorio, que
 * son de relleno: es lo que había antes escrito dentro del componente.
 */
export async function getTeam(locale: string): Promise<MiembroEquipo[]> {
  return conRespaldo("equipo", EQUIPO, async () => {
    const { data, error } = await supabase!
      .from("team_members")
      .select("*")
      .eq("status", "published")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((f) => ({
      nombre: (f.name as string) ?? "",
      cargo: pickLocalized(
        loc(f.position_es as string, f.position_en as string, f.position_pt as string),
        locale
      ),
      area: (f.department as string) ?? "",
      foto: (f.photo_url as string) ?? "",
      correo: (f.email as string) ?? "",
      telefono: (f.phone as string) ?? "",
      idiomas: (f.languages as string) ?? "",
    }));
  });
}
