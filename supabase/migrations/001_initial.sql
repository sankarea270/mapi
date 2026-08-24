-- Mapi Travels — Supabase Schema
-- Ejecuta este archivo en el SQL Editor de Supabase Dashboard

-- Categorías de tours
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  sort_order INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tours
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  duration_es TEXT,
  duration_en TEXT,
  duration_pt TEXT,
  price DECIMAL(10,2) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.8,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  excerpt_es TEXT,
  excerpt_en TEXT,
  excerpt_pt TEXT,
  included JSONB DEFAULT '[]'::jsonb,
  itinerary JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Destinos
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  description_es TEXT,
  description_en TEXT,
  description_pt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reservas
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_slug TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  travel_date DATE NOT NULL,
  travelers INT NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category_id);
CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(featured);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_created ON reservations(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para tours
CREATE OR REPLACE TRIGGER tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
