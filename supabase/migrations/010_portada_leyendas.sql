-- ═══════════════════════════════════════════════════════════════════════
--  Leyenda y enlace de cada foto de portada
-- ═══════════════════════════════════════════════════════════════════════
--
--  Cada foto de la portada enseña el nombre del lugar, una frase y un
--  enlace: a la página del destino o, para Salkantay, a los tours de
--  aventura. El enlace se elige en «Portada» del panel; el título y la
--  frase vienen escritos y también se pueden cambiar allí.
--
--  Se puede ejecutar más de una vez: solo rellena las filas que todavía
--  no tienen enlace, así que no pisa lo que se haya cambiado en el panel.

ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS title_es TEXT;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS title_pt TEXT;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS description_es TEXT;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS description_pt TEXT;

-- Las once fotos publicadas, por su orden: Cusco, Machu Picchu, Valle
-- Sagrado, Arequipa, Colca, Puno, Nazca, Lima, Amazonía, Norte y Salkantay.
UPDATE hero_slides h
SET link_url = v.link_url,
    title_es = v.title_es, title_en = v.title_en, title_pt = v.title_pt,
    description_es = v.description_es, description_en = v.description_en, description_pt = v.description_pt
FROM (VALUES
    (10, '/destinos/cusco', 'Cusco', 'Cusco', 'Cusco', 'La capital inca: muros imperiales, balcones coloniales y plazas que no duermen.', 'The Inca capital: imperial walls, colonial balconies and squares that never sleep.', 'A capital inca: muros imperiais, sacadas coloniais e praças que nunca dormem.'),
    (20, '/destinos/machu-picchu', 'Machu Picchu', 'Machu Picchu', 'Machu Picchu', 'La ciudadela sagrada que asoma entre nubes y montañas. Un viaje de una vez en la vida.', 'The sacred citadel rising between clouds and peaks. A once-in-a-lifetime journey.', 'A cidadela sagrada que surge entre nuvens e montanhas. Uma viagem única na vida.'),
    (30, '/destinos/valle-sagrado', 'Valle Sagrado', 'Sacred Valley', 'Vale Sagrado', 'Terrazas incas, mercados andinos y el río Urubamba al pie de los nevados.', 'Inca terraces, Andean markets and the Urubamba River beneath snowy peaks.', 'Terraços incas, mercados andinos e o rio Urubamba aos pés dos nevados.'),
    (40, '/destinos/arequipa', 'Arequipa', 'Arequipa', 'Arequipa', 'La Ciudad Blanca de sillar volcánico, custodiada por el Misti.', 'The White City carved from volcanic stone, guarded by El Misti.', 'A Cidade Branca de pedra vulcânica, guardada pelo Misti.'),
    (50, '/destinos/colca', 'Cañón del Colca', 'Colca Canyon', 'Cânion do Colca', 'Uno de los cañones más profundos del planeta y el vuelo del cóndor andino.', 'One of the deepest canyons on Earth, where the Andean condor soars.', 'Um dos cânions mais profundos do planeta e o voo do condor andino.'),
    (60, '/destinos/puno', 'Puno y el Titicaca', 'Puno & Lake Titicaca', 'Puno e o Titicaca', 'Islas flotantes de totora sobre el lago navegable más alto del mundo.', 'Floating reed islands on the highest navigable lake in the world.', 'Ilhas flutuantes de totora no lago navegável mais alto do mundo.'),
    (70, '/destinos/nazca', 'Líneas de Nazca', 'Nazca Lines', 'Linhas de Nazca', 'Figuras gigantes trazadas en el desierto que solo se descifran desde el cielo.', 'Giant figures drawn on the desert that only reveal themselves from the sky.', 'Figuras gigantes traçadas no deserto que só se revelam do céu.'),
    (80, '/destinos/lima', 'Lima', 'Lima', 'Lima', 'Capital gastronómica de América, frente al Pacífico y con siglos de historia.', 'The culinary capital of the Americas, facing the Pacific with centuries of history.', 'Capital gastronômica das Américas, de frente para o Pacífico e cheia de história.'),
    (90, '/destinos/amazonia', 'Amazonía', 'Amazon', 'Amazônia', 'Ríos inmensos, fauna única y noches con el sonido de la selva.', 'Mighty rivers, unique wildlife and nights filled with jungle sounds.', 'Rios imensos, fauna única e noites com o som da floresta.'),
    (100, '/destinos/norte', 'Norte del Perú', 'Northern Peru', 'Norte do Peru', 'Tumbas de señores moches, la ciudad de barro de Chan Chan y sol todo el año.', 'Moche royal tombs, the adobe city of Chan Chan and sunshine all year round.', 'Tumbas de senhores mochicas, a cidade de barro de Chan Chan e sol o ano todo.'),
    (110, '/tours?categoria=aventura', 'Salkantay', 'Salkantay', 'Salkantay', 'Nevado sagrado y ruta épica hacia Machu Picchu para espíritus aventureros.', 'A sacred snow peak and an epic trail to Machu Picchu for adventurous spirits.', 'Nevado sagrado e rota épica rumo a Machu Picchu para espíritos aventureiros.')
) AS v(sort_order, link_url, title_es, title_en, title_pt, description_es, description_en, description_pt)
WHERE h.sort_order = v.sort_order
  AND h.link_url IS NULL;
