/*
 * ¿Qué migraciones faltan por ejecutar en Supabase?
 *
 * Comprueba, con la clave pública, una huella de cada archivo de
 * `supabase/migrations`: la tabla o la columna que crea, o el dato que
 * cambia. Solo lee; no toca nada.
 *
 *   node scripts/estado-migraciones.mjs
 */
import { readFileSync } from "node:fs";

for (const linea of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const cab = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/* Reintenta los "Gateway Timeout" pasajeros de la API: no dicen nada de
   si la migración está o no. */
async function pedir(ruta) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(`${URL_}/rest/v1/${ruta}`, { headers: cab });
    const cuerpo = await r.json().catch(() => ({}));
    if (r.status !== 504 && cuerpo?.message !== "Gateway Timeout") return { status: r.status, cuerpo };
    await new Promise((s) => setTimeout(s, 1500));
  }
  return { status: 504, cuerpo: { message: "Gateway Timeout" } };
}

/** ¿Existe la columna? Pedirla y ver si la API la reconoce. */
async function existe(tabla, columna = "*") {
  const { status, cuerpo } = await pedir(`${tabla}?select=${columna}&limit=1`);
  if (status === 504) return null;
  if (cuerpo?.code === "PGRST205" || cuerpo?.code === "42P01") return false; // tabla
  if (cuerpo?.code === "42703" || cuerpo?.code === "PGRST204") return false; // columna
  return status < 400;
}

const comprobaciones = [
  ["001_initial.sql", async () => (await existe("tours")) && (await existe("categories")) && (await existe("destinations"))],
  ["002_panel.sql", async () => (await existe("packages")) && (await existe("reviews")) && (await existe("destinations", "category_slugs"))],
  ["003_almacenamiento.sql", async () => {
    const r = await fetch(`${URL_}/storage/v1/object/list/medios`, {
      method: "POST",
      headers: { ...cab, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 1 }),
    });
    return r.status < 400;
  }],
  ["004_portada.sql", () => existe("hero_slides")],
  ["005_equipo.sql", () => existe("team_members")],
  ["006_experiencias_guias.sql", async () => (await existe("experiences")) && (await existe("guides"))],
  ["007_resenas_tour.sql", async () => {
    const { status, cuerpo } = await pedir("reviews?select=tour_slug");
    if (status >= 400 || !Array.isArray(cuerpo)) return null;
    const viejos = ["sur-del-peru-clasico", "amazonia-iquitos-clasico", "colca-full-day", "cusco-city-tour"];
    return !cuerpo.some((r) => viejos.includes(r.tour_slug));
  }],
  ["008_ubicacion_resenas.sql", async () =>
    (await existe("tours", "location_image_url")) &&
    (await existe("packages", "location_image_url")) &&
    (await existe("reviews", "target_type"))],
  ["009_ajustes.sql", () => existe("site_settings")],
  ["010_portada_leyendas.sql", () => existe("hero_slides", "link_url")],
];

const extra = process.argv.slice(2);
for (const [archivo, f] of comprobaciones) {
  const ok = await f();
  console.log(`${ok === null ? "¿?  " : ok ? "HECHA" : "FALTA"}  ${archivo}${ok === null ? "  (la API no respondió)" : ""}`);
}
if (extra.includes("--resenas")) {
  let { cuerpo } = await pedir("reviews?select=author,target_type,tour_slug&order=sort_order");
  if (!Array.isArray(cuerpo)) ({ cuerpo } = await pedir("reviews?select=author,tour_slug&order=sort_order"));
  console.log(cuerpo);
}
