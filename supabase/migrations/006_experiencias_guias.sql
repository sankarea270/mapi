-- Experiencias y guías, editables desde el panel.
--
-- Eran las dos únicas secciones del menú cuyo contenido seguía escrito en el
-- código: ocho experiencias y siete guías, con sus fotos de relleno. Sin esto
-- no había forma de cambiarles la imagen sin tocar el proyecto, que es justo
-- lo que se pidió poder hacer.
--
-- Igual que el resto del contenido: la web se genera al compilar, así que
-- editar aquí no cambia nada hasta pulsar "Publicar cambios".

CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT,
  name_pt TEXT,
  description_es TEXT,
  description_en TEXT,
  description_pt TEXT,
  image_url TEXT,
  -- Los tours que la componen, por dirección. JSONB y no una tabla de unión
  -- porque el orden importa y la lista es corta; una tabla intermedia
  -- obligaría a un campo de posición y a mantenerlo a mano.
  tour_slugs JSONB DEFAULT '[]'::jsonb,
  sort_order INT DEFAULT 10,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_es TEXT NOT NULL,
  title_en TEXT,
  title_pt TEXT,
  excerpt_es TEXT,
  excerpt_en TEXT,
  excerpt_pt TEXT,
  image_url TEXT,
  -- Agrupa la guía en el índice: como-llegar, clima, equipaje, seguridad,
  -- visas o faq. Texto libre y no un ENUM: añadir un valor a un ENUM exige
  -- una migración, y esto es una etiqueta editorial.
  category TEXT,
  sort_order INT DEFAULT 10,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- Las mismas dos políticas que el resto del contenido: cualquiera lee lo
-- publicado, solo un administrador escribe.
DROP POLICY IF EXISTS experiences_lectura_publica ON experiences;
CREATE POLICY experiences_lectura_publica ON experiences
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR is_admin());

DROP POLICY IF EXISTS experiences_escritura_admin ON experiences;
CREATE POLICY experiences_escritura_admin ON experiences
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS guides_lectura_publica ON guides;
CREATE POLICY guides_lectura_publica ON guides
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR is_admin());

DROP POLICY IF EXISTS guides_escritura_admin ON guides;
CREATE POLICY guides_escritura_admin ON guides
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS experiences_orden ON experiences (sort_order);
CREATE INDEX IF NOT EXISTS guides_orden ON guides (sort_order);
