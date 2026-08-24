# Guía de Capacitación — Supabase (Mapi Travels)

## 1. Acceso a Supabase

1. Ir a [supabase.com](https://supabase.com) → Login con tu cuenta.
2. Seleccionar el proyecto **Mapi Travels**.
3. Panel principal: Dashboard, Table Editor, SQL Editor, Storage, Authentication.

## 2. Estructura de tablas

| Tabla | Descripción |
|-------|-------------|
| `categories` | Categorías de tours (slug, nombre ES/EN/PT, orden) |
| `tours` | Tours (nombre, duración, precio, rating, galería, itinerario, estado) |
| `destinos` | Destinos turísticos |
| `reservations` | Reservas de tours |
| `subscribers` | Suscriptores del newsletter |

## 3. Gestionar tours

### Ver tours
1. **Table Editor** → `tours` → ver todas las filas.
2. Filtros: click en columnas para filtrar por categoría, precio, estado.

### Editar un tour
1. Click en la fila del tour.
2. Modificar campos: `name_es`, `name_en`, `name_pt`, `price`, `rating`, `featured`, `status`.
3. **Save** (Ctrl+S).

### Crear un tour
1. **Insert Row** en `tours`.
2. Completar: `slug` (único), `category_id` (UUID de categoría), nombres, precio, duración.
3. `status`: `published` para visible, `draft` para borrador.
4. Guardar.

### Eliminar un tour
1. Seleccionar la fila.
2. **Delete** → confirmar.

## 4. Gestionar categorías

1. **Table Editor** → `categories`.
2. Para reordenar: modificar `sort_order` (menor = más arriba).
3. Para agregar imagen: copiar URL en `image_url`.

## 5. Gestionar reservas

1. **Table Editor** → `reservations`.
2. Estados: `pending` → `confirmed` → `completed` (o `cancelled`).
3. Para cambiar estado: click en celda `status` → editar → guardar.

## 6. Backup de datos

### Exportar
1. **SQL Editor** → pegar:
```sql
COPY (SELECT * FROM tours) TO STDOUT WITH CSV HEADER;
```
2. Descargar resultado.

### Importar
1. **SQL Editor** → pegar el CSV como INSERT statements.

## 7. Seguridad

- **RLS (Row Level Security)**: Deshabilitado para el sitio público (lectura anónima). Habilitar si se necesita auth para el admin.
- **Service Role Key**: NUNCA exponer al cliente. Solo usar en scripts de seed y server-side.
- **Anon Key**: Segura para el cliente. Solo lectura pública.

## 8. Variables de entorno

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto (pública) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key anónima (pública, solo lectura) |
| `SUPABASE_SERVICE_ROLE_KEY` | Key admin (privada, solo server-side) |
