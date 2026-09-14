/*
 * Genera el bloque de carga inicial de `006_experiencias_guias.sql` a partir
 * de los datos del repositorio.
 *
 * Existe para que el SQL no se escriba a mano: son ocho experiencias y seis
 * guías en tres idiomas, y copiarlas a mano es la forma segura de que una
 * tilde o un slug no coincidan con lo que ya está publicado.
 *
 *   npx tsx scripts/semilla-experiencias-guias.ts
 */
import { EXPERIENCES } from "../src/data/experiences";
import { GUIDES } from "../src/data/guides";

/* Comillas simples dobladas: la única escapatoria que necesita un literal de
   texto en PostgreSQL con `standard_conforming_strings`, que es lo normal. */
const q = (v: string | undefined | null) => (v == null ? "NULL" : `'${v.replace(/'/g, "''")}'`);

const exp = EXPERIENCES.map(
  (e, i) =>
    `  (${q(e.slug)}, ${q(e.name.es)}, ${q(e.name.en)}, ${q(e.name.pt)}, ` +
    `${q(e.description.es)}, ${q(e.description.en)}, ${q(e.description.pt)}, ` +
    `${q(e.image)}, ${q(JSON.stringify(e.tourSlugs))}::jsonb, ${(i + 1) * 10})`
).join(",\n");

const gui = GUIDES.map(
  (g, i) =>
    `  (${q(g.slug)}, ${q(g.title.es)}, ${q(g.title.en)}, ${q(g.title.pt)}, ` +
    `${q(g.excerpt.es)}, ${q(g.excerpt.en)}, ${q(g.excerpt.pt)}, ` +
    `${q(g.image)}, ${q(g.category)}, ${(i + 1) * 10})`
).join(",\n");

console.log(`INSERT INTO experiences
  (slug, name_es, name_en, name_pt, description_es, description_en, description_pt, image_url, tour_slugs, sort_order)
VALUES
${exp}
ON CONFLICT (slug) DO NOTHING;

INSERT INTO guides
  (slug, title_es, title_en, title_pt, excerpt_es, excerpt_en, excerpt_pt, image_url, category, sort_order)
VALUES
${gui}
ON CONFLICT (slug) DO NOTHING;`);
