import type { Review } from "@/data/reviews";
import type { TourPackage } from "@/data/packages";
import type { Experience } from "@/data/experiences";
import type { TourCategory } from "@/types/tour";
import { pickLocalized } from "@/lib/format";

/*
 * A qué ficha pertenece cada reseña.
 *
 * Una reseña guarda la dirección de la ficha (`tourSlug`) y, desde la
 * migración 008, de qué tipo es (`targetType`): tour, paquete, experiencia o
 * la agencia en general. Antes solo había dirección, y una reseña sobre el
 * paquete «Sur del Perú» se buscaba entre los tours y no aparecía en ninguna
 * parte.
 *
 * Todo lo que decide "esta reseña es de esta ficha" pasa por aquí, para que
 * la portada, los tours, los paquetes y las experiencias no lo resuelvan cada
 * uno a su manera.
 */

export type TipoFicha = "tour" | "paquete" | "experiencia" | "agencia";

export type Ficha = { nombre: string; imagen: string; href: string };

/** Clave de ficha: el tipo y la dirección juntos, porque un tour y un
    paquete pueden compartir dirección. */
export const clave = (tipo: TipoFicha, slug: string) => `${tipo}:${slug}`;

/** Las fichas del catálogo, indexadas por tipo y dirección. */
export function construirFichas(
  locale: string,
  { categorias = [], paquetes = [], experiencias = [] }: {
    categorias?: TourCategory[];
    paquetes?: TourPackage[];
    experiencias?: Experience[];
  }
): Record<string, Ficha> {
  const fichas: Record<string, Ficha> = {};
  for (const c of categorias) {
    for (const t of c.tours) {
      fichas[clave("tour", t.slug)] = {
        nombre: pickLocalized(t.name, locale),
        imagen: t.image,
        href: `/tours/${t.slug}`,
      };
    }
  }
  for (const p of paquetes) {
    fichas[clave("paquete", p.slug)] = {
      nombre: pickLocalized(p.name, locale),
      imagen: p.image,
      href: `/paquetes/${p.slug}`,
    };
  }
  for (const e of experiencias) {
    fichas[clave("experiencia", e.slug)] = {
      nombre: pickLocalized(e.name, locale),
      imagen: e.image,
      href: `/experiencias/${e.slug}`,
    };
  }
  return fichas;
}

/**
 * La ficha de la que habla una reseña, si existe de verdad.
 *
 * Mientras no se haya ejecutado la migración 008 las reseñas no traen tipo;
 * entonces se prueba en orden tour → paquete → experiencia. Es lo que permite
 * que la web funcione igual antes y después de ejecutarla.
 */
export function fichaDe(r: Review, fichas: Record<string, Ficha>): Ficha | undefined {
  if (!r.tourSlug || r.targetType === "agencia") return undefined;
  if (r.targetType) return fichas[clave(r.targetType, r.tourSlug)];
  return (
    fichas[clave("tour", r.tourSlug)] ??
    fichas[clave("paquete", r.tourSlug)] ??
    fichas[clave("experiencia", r.tourSlug)]
  );
}

/** ¿Es esta reseña de esta ficha concreta? */
export function esDe(r: Review, tipo: TipoFicha, slug: string): boolean {
  if (r.tourSlug !== slug) return false;
  /* Sin tipo (antes de la 008), la dirección basta: es lo que se hacía. */
  return r.targetType ? r.targetType === tipo : true;
}
