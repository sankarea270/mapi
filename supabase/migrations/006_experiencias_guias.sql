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

-- ─── Carga inicial ──────────────────────────────────────────────────────
--
-- Las tablas NO pueden quedar vacías. Mientras lo están, la web sigue
-- mostrando las experiencias y guías del código; pero en cuanto se agrega
-- UNA desde el panel, pasa a leer solo la tabla, y las demás desaparecerían
-- de golpe del sitio. Por eso se cargan aquí las que ya están publicadas,
-- con sus textos y fotos actuales, para editarlas desde el panel.
--
-- `ON CONFLICT DO NOTHING`: ejecutar este archivo dos veces no duplica nada
-- ni pisa lo que ya se haya cambiado en el panel.
--
-- Generado con: npx tsx scripts/semilla-experiencias-guias.ts

INSERT INTO experiences
  (slug, name_es, name_en, name_pt, description_es, description_en, description_pt, image_url, tour_slugs, sort_order)
VALUES
  ('textileria', 'Textilería Andina', 'Andean Textiles', 'Tecelagem Andina', 'Conoce los telares de Pisac y Chinchero, donde los colores de los Andes cobran vida.', 'Discover the looms of Pisac and Chinchero, where the colors of the Andes come to life.', 'Conheça os teares de Pisac e Chinchero, onde as cores dos Andes ganham vida.', 'https://picsum.photos/seed/mapi-exp-textil/1200/800', '["valle-sagrado-pisac","cusco-fotografico","cusco-museos"]'::jsonb, 10),
  ('festivales', 'Festivales y Fiestas', 'Festivals & Celebrations', 'Festivais e Festas', 'Inti Raymi, fiestas patronales y celebraciones andinas con comunidades locales.', 'Inti Raymi, patron saint festivals and Andean celebrations with local communities.', 'Inti Raymi, festas de padroeiros e celebrações andinas com comunidades locais.', 'https://picsum.photos/seed/mapi-exp-festival/1200/800', '["amantani","titicaca-2d","cusco-nocturno"]'::jsonb, 20),
  ('cocina', 'Cocina Peruana', 'Peruvian Cooking', 'Culinária Peruana', 'Clases de cocina con chefs locales: ceviche, lomo saltado y los sabores de la tierra.', 'Cooking classes with local chefs: ceviche, lomo saltado and the flavors of the land.', 'Aulas de culinária com chefs locais: ceviche, lomo saltado e os sabores da terra.', 'https://picsum.photos/seed/mapi-exp-cocina/1200/800', '["cusco-gastronomico","lima-gastronomico"]'::jsonb, 30),
  ('gastronomia', 'Rutas Gastronómicas', 'Food Tours', 'Rotas Gastronômicas', 'Mercados, picanterías y food tours por las capitales gastronómicas del Perú.', 'Markets, picanterías and food tours through Peru''s gastronomic capitals.', 'Mercados, picanterías e food tours pelas capitais gastronômicas do Peru.', 'https://picsum.photos/seed/mapi-exp-gastro/1200/800', '["cusco-gastronomico","lima-gastronomico","valle-sagrado-pisac"]'::jsonb, 40),
  ('pisco', 'Ruta del Pisco', 'Pisco Route', 'Rota do Pisco', 'Degustaciones y bodegas artesanales para conocer la bebida bandera del Perú.', 'Tastings and artisan distilleries to discover Peru''s signature drink.', 'Degustações e destilarias artesanais para conhecer a bebida símbolo do Peru.', 'https://picsum.photos/seed/mapi-exp-pisco/1200/800', '["lima-gastronomico","lima-barranco"]'::jsonb, 50),
  ('fotografia', 'Fotografía de Viajes', 'Travel Photography', 'Fotografia de Viagem', 'Tours fotográficos guiados por profesionales: luces doradas y paisajes únicos.', 'Photography tours led by professionals: golden light and unique landscapes.', 'Tours fotográficos guiados por profissionais: luz dourada e paisagens únicas.', 'https://picsum.photos/seed/mapi-exp-foto/1200/800', '["cusco-fotografico","valle-sagrado-fotografico","machu-picchu-amanecer"]'::jsonb, 60),
  ('astroturismo', 'Astroturismo', 'Astrotourism', 'Astroturismo', 'Cielos andinos sin contaminación lumínica: observa la Vía Láctea desde los Andes.', 'Andean skies without light pollution: watch the Milky Way from the Andes.', 'Céus andinos sem poluição luminosa: observe a Via Láctea a partir dos Andes.', 'https://picsum.photos/seed/mapi-exp-astro/1200/800', '["machu-picchu-amanecer","valle-sagrado-2dias"]'::jsonb, 70)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO guides
  (slug, title_es, title_en, title_pt, excerpt_es, excerpt_en, excerpt_pt, image_url, category, sort_order)
VALUES
  ('como-llegar', 'Cómo llegar al Perú', 'How to get to Peru', 'Como chegar ao Peru', 'Vuelos, aeropuertos y consejos para tu llegada a Lima y conexiones internas.', 'Flights, airports and tips for arriving in Lima and domestic connections.', 'Voos, aeroportos e dicas para chegar a Lima e conexões internas.', 'https://picsum.photos/seed/mapi-guia-llegar/1200/800', 'como-llegar', 10),
  ('mejor-epoca', 'Mejor época para viajar', 'Best time to travel', 'Melhor época para viajar', 'Estaciones, clima y los mejores meses para cada región del Perú.', 'Seasons, weather and the best months for each region of Peru.', 'Estações, clima e os melhores meses para cada região do Peru.', 'https://picsum.photos/seed/mapi-guia-epoca/1200/800', 'clima', 20),
  ('que-llevar', 'Qué llevar al viaje', 'What to pack', 'O que levar na viagem', 'Lista práctica de equipaje según región, altura y temporada.', 'A practical packing list by region, altitude and season.', 'Lista prática de bagagem por região, altitude e estação.', 'https://picsum.photos/seed/mapi-guia-llevar/1200/800', 'equipaje', 30),
  ('seguridad', 'Seguridad en el viaje', 'Travel safety', 'Segurança na viagem', 'Recomendaciones de seguridad generales para disfrutar el Perú con tranquilidad.', 'General safety recommendations to enjoy Peru with peace of mind.', 'Recomendações gerais de segurança para aproveitar o Peru com tranquilidade.', 'https://picsum.photos/seed/mapi-guia-seguridad/1200/800', 'seguridad', 40),
  ('visas', 'Visas y requisitos', 'Visas & requirements', 'Vistos e requisitos', 'Requisitos de ingreso, vacunas y recomendaciones para tu entrada al Perú.', 'Entry requirements, vaccines and recommendations for entering Peru.', 'Requisitos de entrada, vacinas e recomendações para entrar no Peru.', 'https://picsum.photos/seed/mapi-guia-visas/1200/800', 'visas', 50),
  ('faq', 'Preguntas frecuentes', 'Frequently asked questions', 'Perguntas frequentes', 'Las dudas más comunes antes de viajar con nosotros, respondidas por nuestro equipo.', 'The most common questions before traveling with us, answered by our team.', 'As dúvidas mais comuns antes de viajar conosco, respondidas pela nossa equipe.', 'https://picsum.photos/seed/mapi-guia-faq/1200/800', 'faq', 60)
ON CONFLICT (slug) DO NOTHING;
