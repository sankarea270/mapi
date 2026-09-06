-- Fotos de la portada, editables desde el panel.
--
-- Hasta ahora las cinco fotos del carrusel estaban escritas dentro del
-- componente, así que cambiarlas exigía tocar el código. Son justo lo primero
-- que ve quien entra, o sea lo que más se quiere cambiar y lo que menos
-- sentido tiene que dependa de un programador.
--
-- Igual que el resto del contenido: la web se genera al compilar, así que
-- editar aquí no cambia nada hasta pulsar "Publicar cambios".

CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  -- El texto alternativo es obligatorio en español porque es lo que lee un
  -- lector de pantalla y lo que ve Google. Los otros dos idiomas caen al
  -- español si se dejan vacíos, igual que en los tours.
  alt_es TEXT NOT NULL,
  alt_en TEXT,
  alt_pt TEXT,
  sort_order INT DEFAULT 10,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Mismas dos políticas que las demás tablas de contenido: cualquiera lee lo
-- publicado, solo un administrador escribe. Se nombran igual que en
-- 002_panel.sql para que el conjunto siga leyéndose como uno solo.
DROP POLICY IF EXISTS hero_slides_lectura_publica ON hero_slides;
CREATE POLICY hero_slides_lectura_publica ON hero_slides
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR is_admin());

DROP POLICY IF EXISTS hero_slides_escritura_admin ON hero_slides;
CREATE POLICY hero_slides_escritura_admin ON hero_slides
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS hero_slides_orden ON hero_slides (sort_order);
