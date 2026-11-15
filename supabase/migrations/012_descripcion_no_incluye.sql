-- ═══════════════════════════════════════════════════════════════════════
--  Descripción detallada y «Qué no incluye» de cada tour
-- ═══════════════════════════════════════════════════════════════════════
--
--  La ficha del tour solo tenía el resumen de dos o tres líneas, el mismo
--  texto que sale en la tarjeta del listado, y la agencia no tenía dónde
--  contar el tour con detalle. Tampoco había dónde decir lo que el precio
--  NO cubre (propinas, comidas, vuelos…), que es de lo primero que pregunta
--  quien compara tours, y su ausencia acaba en malentendidos al pagar.
--
--  · description_es/en/pt: texto largo, en párrafos separados por una línea
--    en blanco. Si está vacío, la ficha enseña el resumen como hasta ahora.
--  · not_included: la misma forma que `included`, una lista de
--    {"es": "…", "en": "…", "pt": "…"}.
--
--  Se puede ejecutar más de una vez: solo añade lo que todavía no existe y
--  no toca ningún dato.

ALTER TABLE tours ADD COLUMN IF NOT EXISTS description_es TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS description_pt TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS not_included JSONB DEFAULT '[]'::jsonb;
