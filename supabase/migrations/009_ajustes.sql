-- ═══════════════════════════════════════════════════════════════════════
--  Ajustes de la agencia: datos legales, contacto y redes
-- ═══════════════════════════════════════════════════════════════════════
--
--  El RUC, el teléfono, el correo, la dirección y las redes estaban
--  escritos en el código, repartidos por dieciséis archivos. Con esto se
--  editan en «Ajustes» del panel y la web entera los toma de aquí al
--  publicar.
--
--  Una sola fila (id = 1) con los datos en JSON: son unos pocos campos que
--  se leen siempre juntos, y añadir uno mañana no pide otra migración.
--
--  Se puede ejecutar más de una vez: no pisa lo que ya se haya guardado.

CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Cualquiera lee (la web los necesita al compilar); solo un administrador
-- los cambia.
DROP POLICY IF EXISTS site_settings_lectura_publica ON site_settings;
CREATE POLICY site_settings_lectura_publica ON site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS site_settings_escritura_admin ON site_settings;
CREATE POLICY site_settings_escritura_admin ON site_settings
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Valores iniciales: los de la página de Facebook de la agencia. Instagram,
-- TikTok y YouTube quedan vacíos hasta poner sus direcciones en el panel:
-- la web enlazaba un Instagram que no existe.
INSERT INTO site_settings (id, data) VALUES (1, '{
  "razonSocial": "MAPI TRAVELS TOUR OPERATOR E.I.R.L.",
  "ruc": "20491103753",
  "actividad": "Agencia de viajes y operador turístico",
  "licenciaFuncionamiento": "002059-2012",
  "certificadoAutorizacion": "301-2012",
  "domicilio": "Calle Siete Cuartones 344, Cusco, Perú",
  "ciudad": "Cusco",
  "telefono": "+51 986 377 524",
  "whatsapp": "51986377524",
  "correo": "gotomapiperu@gmail.com",
  "horario": "Lun – Dom · 8:00 – 20:00",
  "facebook": "https://www.facebook.com/profile.php?id=61594386779195",
  "instagram": "",
  "tiktok": "",
  "youtube": ""
}'::jsonb)
ON CONFLICT (id) DO NOTHING;
