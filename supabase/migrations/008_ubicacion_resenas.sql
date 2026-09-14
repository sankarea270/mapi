-- ═══════════════════════════════════════════════════════════════════════
--  Ubicación con mapa, reseñas por ficha y fuera las experiencias de relleno
-- ═══════════════════════════════════════════════════════════════════════
--
--  Se puede ejecutar más de una vez: nada se duplica ni se pisa.


-- ─── 1 · Experiencias de relleno ──────────────────────────────────────
--
--  La versión anterior de 006 cargaba las siete experiencias del código, y
--  no se querían. Se borran solo las que siguen con su foto de relleno
--  (picsum): si alguna ya se editó y tiene foto propia, se respeta.
--
--  Con la tabla vacía la web ya NO vuelve a enseñar las del código: las
--  experiencias son las que se crean desde el panel, y si no hay ninguna,
--  no sale ninguna.

DELETE FROM experiences
 WHERE slug IN ('textileria', 'festivales', 'cocina', 'gastronomia',
                'pisco', 'fotografia', 'astroturismo')
   AND image_url LIKE 'https://picsum.photos/seed/mapi-exp-%';


-- ─── 2 · Ubicación: mapa y texto propios ──────────────────────────────
--
--  Hasta ahora el apartado «Ubicación» de la ficha enseñaba la foto y la
--  descripción del DESTINO, iguales en todos los tours de esa región. Con
--  esto cada tour y cada paquete puede llevar su propio mapa —una imagen:
--  el mapa de la ruta, un plano con el punto de encuentro— y su propio
--  texto. Si se dejan vacíos, se sigue usando el del destino.

ALTER TABLE tours    ADD COLUMN IF NOT EXISTS location_image_url TEXT;
ALTER TABLE tours    ADD COLUMN IF NOT EXISTS location_es TEXT;
ALTER TABLE tours    ADD COLUMN IF NOT EXISTS location_en TEXT;
ALTER TABLE tours    ADD COLUMN IF NOT EXISTS location_pt TEXT;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS location_image_url TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS location_es TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS location_en TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS location_pt TEXT;


-- ─── 3 · Reseñas de cualquier ficha, no solo de tours ─────────────────
--
--  `tour_slug` guardaba la dirección de la ficha, pero no de QUÉ tipo era.
--  Una reseña sobre un paquete y un tour con la misma dirección se
--  confundían, y no había forma de asignarla a una experiencia. Ahora cada
--  reseña dice a qué apunta: un tour, un paquete, una experiencia o la
--  agencia en general.
--
--  La columna se sigue llamando `tour_slug` para no romper lo que ya la
--  lee; lo que cambia es que ahora se lee junto a `target_type`.

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS target_type TEXT NOT NULL DEFAULT 'tour';

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_target_type_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_target_type_check
  CHECK (target_type IN ('tour', 'paquete', 'experiencia', 'agencia'));

--  Las que ya existen: las que apuntan a un paquete —y no a un tour— pasan
--  a ser de paquete («Carlos & Ana», el circuito del Sur del Perú), y las
--  que no apuntan a nada, de la agencia.
UPDATE reviews SET target_type = 'paquete'
 WHERE target_type = 'tour'
   AND tour_slug IN (SELECT slug FROM packages)
   AND tour_slug NOT IN (SELECT slug FROM tours);

UPDATE reviews SET target_type = 'agencia', tour_slug = NULL
 WHERE tour_slug IS NULL OR btrim(tour_slug) = '';

-- Para comprobar cómo quedó:
--   select author, target_type, tour_slug from reviews order by sort_order;
