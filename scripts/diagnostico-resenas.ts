/*
 * Qué ficha resuelve cada reseña, tal como lo calcula la web al compilar.
 *
 *   npx tsx --env-file=.env.local scripts/diagnostico-resenas.ts
 */
import { getCategoriesWithTours } from "../src/lib/tours";
import { getExperiences, getPackages, getReviews } from "../src/lib/content";
import { construirFichas, fichaDe } from "../src/lib/resenas";

async function main() {
const [categorias, paquetes, experiencias, resenas] = await Promise.all([
  getCategoriesWithTours(),
  getPackages(),
  getExperiences(),
  getReviews(),
]);
const fichas = construirFichas("es", { categorias, paquetes, experiencias });
console.log(
  `tours ${categorias.flatMap((c) => c.tours).length} · paquetes ${paquetes.length} · experiencias ${experiencias.length} · reseñas ${resenas.length}`
);
for (const r of resenas) {
  const f = fichaDe(r, fichas);
  console.log(
    `${r.name.padEnd(16)} ${String(r.targetType ?? "(sin tipo)").padEnd(11)} ${String(r.tourSlug ?? "").padEnd(28)} → ${f ? f.nombre : "SIN FICHA"}`
  );
}
}

void main();
