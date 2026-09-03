/*
 * Auditoría de SEO sobre el sitio ya compilado (`out/`).
 *
 * Se ejecuta contra el HTML final, no contra el código: lo que importa es
 * lo que recibe Google, no lo que pretendía el componente.
 *
 *   npm run build && node scripts/auditar-seo.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const RAIZ = "out";
const DOMINIO = "https://gotomachupicchuperu.com";

/* Longitudes con las que Google suele mostrar el resultado sin recortar.
   No son reglas suyas —no las publica— sino el ancho en píxeles que cabe,
   traducido a caracteres de forma aproximada. */
const TITULO = { min: 25, max: 60 };
const DESCRIPCION = { min: 110, max: 165 };

function paginas(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) paginas(p, acc);
    else if (e === "index.html") acc.push(p);
  }
  return acc;
}

const entre = (html, re) => (html.match(re) ?? [])[1]?.trim();

function analizar(archivo) {
  const html = readFileSync(archivo, "utf8");
  const ruta = "/" + relative(RAIZ, archivo).split(sep).slice(0, -1).join("/") + "/";
  return {
    ruta: ruta === "//" ? "/" : ruta,
    bytes: Buffer.byteLength(html),
    titulo: entre(html, /<title>([^<]*)<\/title>/),
    descripcion: entre(html, /<meta name="description" content="([^"]*)"/),
    canonical: entre(html, /<link rel="canonical" href="([^"]*)"/),
    /* Sin distinguir mayúsculas: React emite `hrefLang` y en HTML los
       nombres de atributo son insensibles a mayúsculas, así que buscarlo
       en minúscula daba un falso "no hay hreflang" en las 345 páginas. */
    hreflang: (html.match(/hreflang="[^"]*"/gi) ?? []).length,
    h1: (html.match(/<h1[\s>]/g) ?? []).length,
    og: /property="og:image"/.test(html),
    jsonLd: (html.match(/"@type":"([^"]+)"/g) ?? []).map((s) => s.split('"')[3]),
    imgSinAlt: (html.match(/<img(?![^>]*\balt=)[^>]*>/g) ?? []).length,
    noindex: /name="robots"[^>]*noindex/.test(html),
  };
}

const todas = paginas(RAIZ).map(analizar);
const indexables = todas.filter((p) => !p.noindex);

const linea = (etiqueta, valor) => console.log(`  ${etiqueta.padEnd(38)} ${valor}`);
const bloque = (t) => console.log(`\n${t}\n${"─".repeat(t.length)}`);

console.log(`\nAuditoría SEO — ${todas.length} páginas (${indexables.length} indexables)`);

bloque("TÍTULOS");
const sinTitulo = indexables.filter((p) => !p.titulo);
const titulos = new Map();
for (const p of indexables) titulos.set(p.titulo, [...(titulos.get(p.titulo) ?? []), p.ruta]);
const duplicados = [...titulos.entries()].filter(([, r]) => r.length > 1);
const largos = indexables.filter((p) => p.titulo && p.titulo.length > TITULO.max);
const cortos = indexables.filter((p) => p.titulo && p.titulo.length < TITULO.min);
linea("sin título", sinTitulo.length);
linea("duplicados", `${duplicados.length} grupos`);
linea(`más largos de ${TITULO.max} caracteres`, largos.length);
linea(`más cortos de ${TITULO.min}`, cortos.length);
for (const [t, rutas] of duplicados.slice(0, 5))
  console.log(`      "${t}" → ${rutas.length} páginas: ${rutas.slice(0, 3).join(", ")}…`);

bloque("DESCRIPCIONES");
const sinDesc = indexables.filter((p) => !p.descripcion);
const descs = new Map();
for (const p of indexables)
  if (p.descripcion) descs.set(p.descripcion, [...(descs.get(p.descripcion) ?? []), p.ruta]);
const descDup = [...descs.entries()].filter(([, r]) => r.length > 1);
linea("sin descripción", sinDesc.length);
linea("duplicadas", `${descDup.length} grupos`);
linea(`fuera de ${DESCRIPCION.min}-${DESCRIPCION.max} caracteres`,
  indexables.filter((p) => p.descripcion &&
    (p.descripcion.length < DESCRIPCION.min || p.descripcion.length > DESCRIPCION.max)).length);
for (const p of sinDesc.slice(0, 8)) console.log(`      falta en ${p.ruta}`);
for (const [, rutas] of descDup.slice(0, 4))
  console.log(`      repetida en ${rutas.length}: ${rutas.slice(0, 3).join(", ")}…`);

bloque("ESTRUCTURA");
linea("sin canonical", indexables.filter((p) => !p.canonical).length);
linea("sin hreflang", indexables.filter((p) => p.hreflang === 0).length);
const sinH1 = indexables.filter((p) => p.h1 === 0);
linea("sin H1", sinH1.length);
for (const p of sinH1.slice(0, 6)) console.log(`      ${p.ruta}`);
linea("con más de un H1", indexables.filter((p) => p.h1 > 1).length);
linea("sin imagen para redes (og:image)", indexables.filter((p) => !p.og).length);
linea("imágenes sin texto alternativo", indexables.reduce((a, p) => a + p.imgSinAlt, 0));

bloque("DATOS ESTRUCTURADOS");
const tipos = {};
for (const p of indexables) for (const t of p.jsonLd) tipos[t] = (tipos[t] ?? 0) + 1;
if (Object.keys(tipos).length === 0) linea("(ninguno)", "");
for (const [t, n] of Object.entries(tipos).sort((a, b) => b[1] - a[1])) linea(t, n);
const fichasTour = indexables.filter((p) => /\/tours\/[^/]+\/$/.test(p.ruta));
linea("fichas de tour sin AggregateRating",
  fichasTour.filter((p) => !p.jsonLd.includes("AggregateRating")).length + " de " + fichasTour.length);
linea("fichas sin BreadcrumbList",
  fichasTour.filter((p) => !p.jsonLd.includes("BreadcrumbList")).length + " de " + fichasTour.length);

bloque("PESO");
const ordenadas = [...indexables].sort((a, b) => b.bytes - a.bytes);
const media = Math.round(indexables.reduce((a, p) => a + p.bytes, 0) / indexables.length / 1024);
linea("HTML medio", `${media} KB`);
linea("la más pesada", `${Math.round(ordenadas[0].bytes / 1024)} KB — ${ordenadas[0].ruta}`);

bloque("SITEMAP");
try {
  const xml = readFileSync(join(RAIZ, "sitemap.xml"), "utf8");
  const urls = (xml.match(/<loc>([^<]+)<\/loc>/g) ?? []).map((s) => s.slice(5, -6));
  const enSitemap = new Set(urls.map((u) => u.replace(DOMINIO, "")));
  const faltan = indexables.filter((p) => !enSitemap.has(p.ruta));
  const sobran = [...enSitemap].filter((u) => !indexables.some((p) => p.ruta === u));
  linea("URLs en el sitemap", urls.length);
  linea("páginas indexables fuera del sitemap", faltan.length);
  linea("URLs del sitemap que no existen", sobran.length);
  for (const p of faltan.slice(0, 6)) console.log(`      falta ${p.ruta}`);
  for (const u of sobran.slice(0, 6)) console.log(`      sobra ${u}`);
} catch {
  linea("sitemap.xml", "NO EXISTE");
}

bloque("VERIFICACIÓN EN BUSCADORES");
const portada = readFileSync(join(RAIZ, "es", "index.html"), "utf8");
linea("Google Search Console",
  /name="google-site-verification"/.test(portada) ? "configurada" : "SIN CONFIGURAR");
console.log("");
