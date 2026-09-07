-- Equipo, editable desde el panel.
--
-- Hasta ahora las seis fichas estaban escritas dentro del componente, con
-- nombres inventados, retratos de banco de imágenes y teléfonos de relleno.
-- Eso en una web de agencia no es un detalle estético: son personas que un
-- cliente puede intentar buscar o llamar. Sacarlo a una tabla permite poner
-- al equipo de verdad sin tocar código, y quitar a quien ya no esté.

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  -- El cargo se traduce; el nombre de la persona no.
  position_es TEXT NOT NULL,
  position_en TEXT,
  position_pt TEXT,
  -- Área a la que pertenece. Texto libre a propósito: una agencia añade
  -- áreas con el tiempo y no tiene sentido que eso exija una migración.
  department TEXT,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  -- Qué idiomas habla. En una agencia de viajes es de lo primero que
  -- pregunta un cliente, y no estaba en ningún sitio.
  languages TEXT,
  sort_order INT DEFAULT 10,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Las mismas dos políticas que el resto del contenido: cualquiera lee lo
-- publicado, solo un administrador escribe.
DROP POLICY IF EXISTS team_members_lectura_publica ON team_members;
CREATE POLICY team_members_lectura_publica ON team_members
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR is_admin());

DROP POLICY IF EXISTS team_members_escritura_admin ON team_members;
CREATE POLICY team_members_escritura_admin ON team_members
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS team_members_orden ON team_members (sort_order);
