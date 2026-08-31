/**
 * Comprobación del buscador de tours.
 *
 *   npm run verificar:busqueda
 *
 * El buscador estuvo roto sin que nadie lo notara: llamaba a una API que
 * dejó de existir al pasar el sitio a export estático y devolvía 404 en
 * silencio. Esta comprobación existe para que ese fallo no pueda repetirse
 * sin avisar.
 *
 * Corre contra los datos reales del catálogo, no contra datos de prueba.
 */
import { getMockCategories } from "../src/data/tours";
import { toBriefCatalog, searchTours } from "../src/lib/catalog";

interface Caso {
  consulta: string;
  espera: "resultados" | "vacio";
  porque: string;
  /** Si se indica, debe aparecer entre los resultados. */
  contiene?: string;
}

const CASOS: Caso[] = [
  { consulta: "machu", espera: "resultados", porque: "término parcial" },
  { consulta: "Machu Picchu", espera: "resultados", porque: "nombre completo" },
  { consulta: "canon colca", espera: "resultados", porque: "sin tildes ni ñ", contiene: "Colca" },
  { consulta: "CAÑÓN", espera: "resultados", porque: "mayúsculas con tilde", contiene: "Colca" },
  { consulta: "titicaca", espera: "resultados", porque: "por destino" },
  { consulta: "rainbow", espera: "resultados", porque: "coincide por el slug en inglés" },
  { consulta: "valle sagrado", espera: "resultados", porque: "dos palabras" },
  { consulta: "aventura", espera: "resultados", porque: "por nombre de categoría" },
  { consulta: "zzzqx", espera: "vacio", porque: "no existe" },
  { consulta: "   ", espera: "vacio", porque: "solo espacios" },
];

const catalogo = toBriefCatalog(getMockCategories(), "es");
const total = catalogo.reduce((n, c) => n + c.tours.length, 0);

console.log(`Catálogo: ${catalogo.length} categorías · ${total} tours\n`);

let fallos = 0;

for (const caso of CASOS) {
  const encontrados = searchTours(catalogo, caso.consulta);
  const hay = encontrados.length > 0;

  let ok = caso.espera === "resultados" ? hay : !hay;
  let detalle = "";

  if (ok && caso.contiene) {
    ok = encontrados.some((t) => t.name.includes(caso.contiene!));
    if (!ok) detalle = ` — se esperaba encontrar "${caso.contiene}"`;
  }

  if (!ok) fallos++;

  const marca = ok ? "  ok " : "FALLA";
  const primero = encontrados[0] ? `  →  ${encontrados[0].name}` : "";
  console.log(
    `${marca}  ${`"${caso.consulta}"`.padEnd(18)}` +
      `${String(encontrados.length).padStart(2)} resultados${primero}`.padEnd(46) +
      `(${caso.porque})${detalle}`
  );
}

if (fallos > 0) {
  console.error(`\n${fallos} de ${CASOS.length} casos fallan.`);
  process.exit(1);
}
console.log(`\nLos ${CASOS.length} casos pasan.`);
