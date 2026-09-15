import type { Review } from "@/data/reviews";
import type { Ajustes } from "@/config/ajustes";

/**
 * Reseñas reales de la ficha de la agencia en TripAdvisor.
 *
 * Se leen al compilar con la Content API oficial de TripAdvisor, igual que
 * el resto del contenido se lee de Supabase: la web es estática y no hace
 * ninguna llamada desde el navegador, así que la clave nunca llega al
 * público. Hace falta:
 *
 *  · La dirección de la ficha, puesta en «Ajustes» del panel. De ella se
 *    saca el número de la ficha (el «-d12345678-» de la dirección).
 *  · La clave de la API, como secreto `TRIPADVISOR_API_KEY` en GitHub (y en
 *    `.env.local` para compilar en local). Se pide gratis en
 *    tripadvisor.com/developers.
 *
 * Sin cualquiera de las dos, o si TripAdvisor no responde, devuelve `null` y
 * la web enseña las reseñas del panel como hasta ahora. Una caída de un
 * servicio de fuera no puede tumbar la compilación.
 *
 * La API da las cinco reseñas más recientes por idioma; se piden en los tres
 * idiomas de la web y se juntan.
 */

const API = "https://api.content.tripadvisor.com/api/v1";
const IDIOMAS = ["es", "en", "pt"] as const;

export interface DatosTripadvisor {
  /** La ficha en TripAdvisor, para enlazarla. */
  url: string;
  nombre: string;
  /** Nota media de la ficha y número total de opiniones, según TripAdvisor. */
  nota: number | null;
  total: number | null;
  resenas: Review[];
}

/** El número de ficha a partir de la dirección que se pega en el panel. */
export function idDeTripadvisor(direccion: string): string | null {
  const d = direccion.trim();
  if (/^\d{4,}$/.test(d)) return d;
  return d.match(/-d(\d{4,})(?:-|\.|$)/i)?.[1] ?? null;
}

/** ¿Dónde quiere Jose que se vean? Guardado como "inicio,tours". */
export function tripadvisorEn(ajustes: Ajustes, sitio: "inicio" | "tours"): boolean {
  return ajustes.tripadvisorMostrar
    .split(",")
    .map((s) => s.trim())
    .includes(sitio);
}

async function pedir(ruta: string, clave: string): Promise<Record<string, unknown> | null> {
  const separador = ruta.includes("?") ? "&" : "?";
  const r = await fetch(`${API}${ruta}${separador}key=${encodeURIComponent(clave)}`, {
    headers: {
      accept: "application/json",
      /* Si la clave está restringida por dominio, TripAdvisor mira este
         encabezado. */
      referer: process.env.NEXT_PUBLIC_SITE_URL || "https://gotomachupicchuperu.com",
    },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`TripAdvisor ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return (await r.json()) as Record<string, unknown>;
}

let enCurso: Promise<DatosTripadvisor | null> | null = null;
let deLaDireccion = "";

export function getTripadvisor(ajustes: Ajustes): Promise<DatosTripadvisor | null> {
  if (enCurso && deLaDireccion === ajustes.tripadvisor) return enCurso;
  deLaDireccion = ajustes.tripadvisor;
  enCurso = leer(ajustes.tripadvisor);
  return enCurso;
}

async function leer(direccion: string): Promise<DatosTripadvisor | null> {
  const clave = process.env.TRIPADVISOR_API_KEY?.trim();
  const id = idDeTripadvisor(direccion);
  if (!clave || !id) {
    if (id && !clave) console.warn("[tripadvisor] hay ficha pero falta TRIPADVISOR_API_KEY: se usan las reseñas del panel.");
    return null;
  }

  try {
    const [detalles, ...porIdioma] = await Promise.all([
      pedir(`/location/${id}/details?language=es&currency=USD`, clave).catch((e) => {
        console.warn("[tripadvisor] datos de la ficha:", (e as Error).message);
        return null;
      }),
      ...IDIOMAS.map((l) =>
        pedir(`/location/${id}/reviews?language=${l}&limit=5`, clave).catch((e) => {
          console.warn(`[tripadvisor] reseñas en ${l}:`, (e as Error).message);
          return null;
        })
      ),
    ]);

    const vistas = new Set<string>();
    const resenas: Review[] = [];
    for (const lista of porIdioma) {
      for (const r of (lista?.data as Record<string, unknown>[] | undefined) ?? []) {
        const rid = String(r.id ?? "");
        const texto = String(r.text ?? "").trim();
        if (!rid || !texto || vistas.has(rid)) continue;
        vistas.add(rid);
        const usuario = (r.user ?? {}) as Record<string, unknown>;
        const lugar = (usuario.user_location ?? {}) as Record<string, unknown>;
        /* La reseña está escrita en un idioma: se enseña tal cual en los
           tres. Traducirla sería poner palabras en boca del viajero. */
        resenas.push({
          id: `ta-${rid}`,
          name: String(usuario.username ?? "").trim() || "TripAdvisor",
          country: String(lugar.name ?? "").trim(),
          rating: Number(r.rating) || 5,
          text: { es: texto, en: texto, pt: texto },
          targetType: "agencia",
          fuente: "tripadvisor",
          url: typeof r.url === "string" ? r.url : undefined,
          titulo: typeof r.title === "string" ? r.title : undefined,
          fecha: typeof r.published_date === "string" ? r.published_date : undefined,
        });
      }
    }
    resenas.sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));

    if (resenas.length === 0) {
      console.warn("[tripadvisor] la ficha no devolvió reseñas: se usan las del panel.");
      return null;
    }

    const nota = Number(detalles?.rating);
    const total = Number(detalles?.num_reviews);
    return {
      url: (typeof detalles?.web_url === "string" && detalles.web_url) || direccion,
      nombre: String(detalles?.name ?? ""),
      nota: Number.isFinite(nota) && nota > 0 ? nota : null,
      total: Number.isFinite(total) && total > 0 ? total : null,
      resenas,
    };
  } catch (e) {
    console.warn("[tripadvisor] no se pudo leer la ficha:", (e as Error).message);
    return null;
  }
}
