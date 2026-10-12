-- ═══════════════════════════════════════════════════════════════════════
--  Orden propio de los tours dentro de su categoría
-- ═══════════════════════════════════════════════════════════════════════
--
--  Hasta ahora cada categoría se ordenaba sola, por valoración, y la
--  agencia no podía decidir qué tour va primero. La revisión de 2026 pide
--  un orden correlativo: en Machu Picchu, primero el Camino Inca de cuatro
--  días, luego el de dos, los de dos días con hotel y al final los de un
--  día. Ese orden se cambia después en el panel («Orden en su categoría»).
--
--  Los números van de diez en diez para poder meter un tour entre dos sin
--  renumerar los demás.
--
--  Se puede ejecutar más de una vez: solo rellena los tours que todavía no
--  tienen orden, así que no pisa lo que se haya cambiado en el panel.

ALTER TABLE tours ADD COLUMN IF NOT EXISTS sort_order INT;

-- Machu Picchu, en el orden del documento de revisión.
UPDATE tours t
SET sort_order = v.sort_order
FROM (VALUES
    ('camino-inca-clasico', 10),
    ('camino-inca-corto', 20),
    ('machu-picchu-valle-sagrado', 30),
    ('machu-picchu-maras-moray', 40),
    ('machu-picchu-clasico', 50),
    ('machu-picchu-huayna-picchu', 60),
    ('machu-picchu-vistadome', 70),
    ('machu-picchu-montana', 80),
    ('machu-picchu-privado', 90)
) AS v(slug, sort_order)
WHERE t.slug = v.slug
  AND t.sort_order IS NULL;

-- El resto, en el orden que ya tenían en la web: mejor valorados primero.
UPDATE tours t
SET sort_order = o.n * 10
FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY rating DESC NULLS LAST, name_es) AS n
    FROM tours
) o
WHERE t.id = o.id
  AND t.sort_order IS NULL;

CREATE INDEX IF NOT EXISTS idx_tours_orden ON tours(category_id, sort_order);
