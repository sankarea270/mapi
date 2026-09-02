-- GoToMapi — Panel de administración
--
-- Ejecuta este archivo en el SQL Editor de Supabase DESPUÉS de 001_initial.sql.
-- Es idempotente: puedes volver a lanzarlo sin romper nada.
--
-- Hace tres cosas:
--   1. Crea las tablas que faltaban (paquetes y reseñas).
--   2. Enciende RLS en TODAS las tablas. Sin esto, la clave anónima —que va
--      dentro del JavaScript del navegador, a la vista de cualquiera— podría
--      borrar la base de datos entera. En 001_initial.sql no se activó.
--   3. Define quién es administrador con una lista blanca explícita, para que
--      registrarse en Supabase no baste para poder editar.

-- ─────────────────────────────────────────────────────────────
-- 1. Tablas que faltaban
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  description_pt TEXT,
  duration_es TEXT,
  duration_en TEXT,
  duration_pt TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  -- Slugs de los tours que componen el paquete, en orden.
  tour_slugs JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  sort_order INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  country TEXT,
  -- Decimal, no entero: hay reseñas de 4.5 y con INT se rechazaban.
  rating DECIMAL(2,1) NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text_es TEXT NOT NULL,
  text_en TEXT,
  text_pt TEXT,
  -- Reseña asociada a un tour concreto; si va vacío, es una reseña general.
  tour_slug TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  sort_order INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Para bases donde `reviews` ya se creó con rating INT: sin esto, sembrar
-- falla con "invalid input syntax for type integer: 4.5".
ALTER TABLE reviews ALTER COLUMN rating TYPE DECIMAL(2,1);

-- Columnas que 001 no contemplaba y el panel necesita para ordenar y ocultar.
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 10;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS category_slugs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS tour_slugs JSONB DEFAULT '[]'::jsonb;

-- La reserva guarda el nombre del tour tal y como lo vio el cliente: si más
-- tarde renombras o borras ese tour, la reserva sigue siendo legible.
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS tour_name TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS locale TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';

-- `phone` es NOT NULL en 001, pero el formulario de la ficha de tour no lo
-- pide. Sin esto, esas reservas se perderían al guardar.
ALTER TABLE reservations ALTER COLUMN phone DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_packages_slug ON packages(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_tour ON reviews(tour_slug);

CREATE OR REPLACE TRIGGER packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 2. Quién es administrador
-- ─────────────────────────────────────────────────────────────

-- Lista blanca. Estar dado de alta en Supabase Auth no basta: hay que
-- aparecer aquí. Así, aunque alguien consiguiera crearse una cuenta, no
-- podría tocar el contenido.
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER para que la comprobación pueda leer `admins` sin que el
-- usuario tenga permiso directo sobre esa tabla; si no, la política se
-- llamaría a sí misma en bucle. El search_path fijo evita que alguien
-- redirija la consulta a una tabla suya.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$$;

DROP POLICY IF EXISTS admins_self_read ON admins;
CREATE POLICY admins_self_read ON admins
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 3. RLS en el contenido
-- ─────────────────────────────────────────────────────────────
--
-- Regla general, tabla por tabla:
--   · cualquiera puede LEER lo publicado (lo necesita `next build`)
--   · solo un administrador puede escribir
--
-- El filtro por `status` es lo que hace que un borrador no llegue a la web:
-- la compilación usa la clave anónima, así que Postgres se lo oculta.

ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours        ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers  ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
  lectura TEXT;
  escritura TEXT;
  publicas TEXT[] := ARRAY['categories', 'tours', 'destinations', 'packages', 'reviews'];
BEGIN
  FOREACH t IN ARRAY publicas LOOP
    -- El nombre de la política se compone ANTES de pasarlo a format(). Con
    -- %I el identificador sale entrecomillado, así que un '%I_lectura' daría
    -- "categories"_lectura, que no es SQL válido.
    lectura   := t || '_lectura_publica';
    escritura := t || '_escritura_admin';

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', lectura, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', escritura, t);

    -- `categories` no tiene columna status: se lee entera.
    IF t = 'categories' THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR SELECT TO anon, authenticated USING (true)',
        lectura, t
      );
    ELSE
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR SELECT TO anon, authenticated
           USING (status = ''published'' OR is_admin())',
        lectura, t
      );
    END IF;

    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO authenticated
         USING (is_admin()) WITH CHECK (is_admin())',
      escritura, t
    );
  END LOOP;
END $$;

-- Reservas: el formulario de la web las crea sin estar identificado, pero
-- nadie salvo el administrador puede leerlas. Son datos personales.
DROP POLICY IF EXISTS reservas_alta_publica ON reservations;
CREATE POLICY reservas_alta_publica ON reservations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS reservas_gestion_admin ON reservations;
CREATE POLICY reservas_gestion_admin ON reservations
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS suscriptores_alta_publica ON subscribers;
CREATE POLICY suscriptores_alta_publica ON subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS suscriptores_gestion_admin ON subscribers;
CREATE POLICY suscriptores_gestion_admin ON subscribers
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
