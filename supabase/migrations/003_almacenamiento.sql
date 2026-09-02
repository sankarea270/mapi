-- GoToMapi — Almacén de imágenes
--
-- Ejecuta este archivo en el SQL Editor de Supabase DESPUÉS de 002_panel.sql.
-- Es idempotente: puedes volver a lanzarlo sin romper nada.
--
-- Crea el depósito donde el panel sube las fotos de tours, paquetes y
-- destinos, y le pone las mismas reglas que al resto: cualquiera puede VER
-- las imágenes —tienen que salir en la web—, pero solo un administrador
-- puede subirlas o borrarlas.

-- `public = true` significa que las fotos se sirven por URL directa, sin
-- pedir permiso. Es lo que necesita la web: son fotos de catálogo, no
-- documentos privados. Lo que sigue protegido es QUIÉN puede escribir.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medios',
  'medios',
  true,
  -- 6 MB por archivo. El panel además reduce cada foto antes de subirla,
  -- así que en la práctica ninguna se acerca a este techo; el límite está
  -- para que un fallo del navegador no llene el almacén.
  6291456,
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Las políticas van sobre storage.objects, que es una tabla normal de
-- Postgres: el almacén de Supabase se protege con el mismo RLS que los datos.
DROP POLICY IF EXISTS medios_lectura_publica ON storage.objects;
CREATE POLICY medios_lectura_publica ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'medios');

DROP POLICY IF EXISTS medios_subida_admin ON storage.objects;
CREATE POLICY medios_subida_admin ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'medios' AND is_admin());

-- Hace falta UPDATE además de INSERT: subir con `upsert` reemplaza el
-- objeto si ya existía, y eso Postgres lo ve como una actualización.
DROP POLICY IF EXISTS medios_reemplazo_admin ON storage.objects;
CREATE POLICY medios_reemplazo_admin ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'medios' AND is_admin())
  WITH CHECK (bucket_id = 'medios' AND is_admin());

DROP POLICY IF EXISTS medios_borrado_admin ON storage.objects;
CREATE POLICY medios_borrado_admin ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'medios' AND is_admin());
