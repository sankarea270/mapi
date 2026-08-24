# Plan de Mejoras — Mapi Travels

## Resumen de cambios solicitados
1. Título del tour "chato" → mejorar tipografía visual
2. Nubes animadas en el hero del homepage
3. Ken Burns (zoom lento) en imagen del hero
4. Carousel de imágenes con auto-play y flechas
5. Panel admin completo (dashboard, CRUD tours/paquetes/etc, analytics mock)
6. **Migrar de Sanity a Supabase** como backend de datos
7. Auth simple usuario/password para el admin

---

## Fase 1: Tipografía + Hero Animado

### 1.1 Corregir título del tour (chato/pesado)
**Archivo**: `src/app/[locale]/tours/[slug]/page.tsx`

El `<h1>` actual usa `font-extrabold` que se ve pesado. Cambiar a:
```
font-heading text-5xl font-bold tracking-tight text-white
```
Opcional: gradiente sutil `bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent`.

Mismo cambio en el homepage (`src/app/[locale]/page.tsx`):
```
font-heading text-5xl font-bold italic text-white
```

### 1.2 Nubes flotantes (homepage)
**Archivo nuevo**: `src/components/home/CloudLayer.tsx`

- 3-4 nubes SVG con animación CSS `@keyframes cloud-drift`
- Opacidad baja (0.08-0.15) para no distraer
- Posicionadas absolutas sobre el hero
- Velocidades diferentes para profundidad (parallax sutil)
- Respetar `prefers-reduced-motion`

### 1.3 Ken Burns en hero
**Archivo**: `src/app/[locale]/page.tsx`

Animación CSS en la imagen del hero:
```css
@keyframes ken-burns {
  0% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.08) translate(-1%, -1%); }
  100% { transform: scale(1) translate(0, 0); }
}
```
Duración: 25s ease-in-out infinite alternate.

### 1.4 Carousel de imágenes en hero
**Archivo nuevo**: `src/components/home/HeroCarousel.tsx`

Componente client-side:
- 4-5 imágenes de destinos (Machu Picchu, Cusco, Amazonía, Lima, Colca)
- Auto-play cada 6 segundos con transición fade
- Flechas izquierda/derecha para cambio manual
- Dots indicadores en la parte inferior
- Ken Burns en imagen activa
- Nubes flotantes sobre el carousel

---

## Fase 2: Migración Sanity → Supabase

### 2.1 Instalar dependencias
```bash
npm install @supabase/supabase-js
npm uninstall @sanity/client sanity
```

### 2.2 Crear cliente Supabase
**Archivo nuevo**: `src/lib/supabase.ts`
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2.3 Schema de base de datos (SQL)
**Archivo nuevo**: `supabase/migrations/001_initial.sql`

```sql
-- Categorías
CREATE TABLE categories (
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
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
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
  image_url TEXT,
  gallery JSONB DEFAULT '[]',
  excerpt_es TEXT,
  excerpt_en TEXT,
  excerpt_pt TEXT,
  included JSONB DEFAULT '[]',
  itinerary JSONB DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Destinos
CREATE TABLE destinations (
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
```

### 2.4 Seed data
**Archivo nuevo**: `supabase/seed.sql`

Insertar los 62 tours de mock data (`src/data/tours.ts`) en las tablas de Supabase.
También crear script `scripts/seed-supabase.ts` como alternativa.

### 2.5 Rewrite lib/tours.ts
**Archivo**: `src/lib/tours.ts`

Reemplazar GROQ queries de Sanity con queries de Supabase:
```ts
const { data: categories } = await supabase
  .from('categories')
  .select('*, tours(*)')
  .order('sort_order');
```

Mantener fallback a `getMockCategories()` cuando Supabase no esté configurado.

### 2.6 Eliminar archivos de Sanity
| Archivo | Acción |
|---------|--------|
| `sanity.config.ts` | Eliminar |
| `sanity/schemaTypes/tour.ts` | Eliminar |
| `sanity/schemaTypes/category.ts` | Eliminar |
| `sanity/schemaTypes/destination.ts` | Eliminar |
| `sanity/seed.ts` | Eliminar |
| `src/lib/sanity.ts` | Reemplazar con supabase.ts |
| `docs/capacitacion-sanity.md` | Reemplazar con docs/capacitacion-supabase.md |

### 2.7 Actualizar configuración
- `package.json`: remover scripts `studio`, `seed:sanity`, `backup:sanity`
- `next.config.ts`: remover `cdn.sanity.io` de images.remotePatterns y CSP
- `.env.example`: remover SANITY_*, agregar SUPABASE_*
- `src/data/legal.ts`: reemplazar "Sanity" por "Supabase"
- `docs/despliegue-vercel.md`: actualizar env vars
- `docs/seguridad.md`: actualizar CSP docs

---

## Fase 3: Panel Admin

### 3.1 Estructura de rutas
```
src/app/admin/
├── layout.tsx          (layout del admin con sidebar)
├── page.tsx            (dashboard principal)
├── tours/
│   ├── page.tsx        (lista de tours)
│   ├── new/page.tsx    (crear tour)
│   └── [id]/page.tsx   (editar tour)
├── destinos/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/page.tsx
├── reservas/
│   └── page.tsx        (lista de reservas)
├── analytics/
│   └── page.tsx        (gráficos mock)
└── settings/
    └── page.tsx        (configuración)
```

### 3.2 Layout del admin
- Sidebar oscuro (slate-900) con navegación
- Header con logo + nombre usuario + logout
- Contenido con fondo slate-50
- Responsive: sidebar colapsable en móvil

### 3.3 Auth
- Middleware que protege `/admin/*`
- Login simple con env vars `ADMIN_USER` / `ADMIN_PASS`
- Cookie httpOnly + secure
- Rate limiting en login (5 intentos/min)

### 3.4 Dashboard (`/admin`)
- **Stats cards**: Total tours, reservas pendientes, ingresos, visitas
- **Gráfico de reservas** (últimos 30 días) — SVG puro
- **Gráfico de tours más populares** — barras horizontales
- **Últimas reservas** — tabla con estado
- **Actividad reciente** — timeline

### 3.5 CRUD Tours
**Lista** (`/admin/tours`):
- Tabla: imagen thumbnail, nombre, categoría, precio, rating, estado, acciones
- Búsqueda y filtros
- Paginación
- Botón "Crear nuevo"

**Crear/Editar** (`/admin/tours/new`, `/admin/tours/[id]`):
- Formulario: nombre (ES/EN/PT), slug, descripción, precio, duración, categoría, imágenes, itinerario
- Preview en tiempo real
- Guardar como borrador o publicar

### 3.6 CRUD Destinos
Mismo patrón que tours.

### 3.7 Reservas (`/admin/reservas`)
- Lista con estados (pendiente/confirmada/completada)
- Detalle de reserva
- Cambiar estado

### 3.8 Analytics (`/admin/analytics`)
- Datos mock/demo
- Gráfico de tráfico (últimos 30 días)
- Tours más vistos
- Conversión de reservas
- Dispositivos (desktop/móvil)

### 3.9 Settings (`/admin/settings`)
- Información del sitio
- Datos de contacto
- Redes sociales
- Configuración de email

### 3.10 Componentes compartidos
- `AdminLayout` — sidebar + header + contenido
- `DataTable` — tabla reutilizable con sorting, pagination, search
- `FormField` — campo de formulario con label, error
- `ImageUpload` — subida de imágenes con preview
- `StatusBadge` — badge de estado
- `StatsCard` — card de estadística con icono
- `ConfirmDialog` — diálogo de confirmación

---

## Fase 4: Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Solo para admin/seed

# Admin
ADMIN_USER=admin
ADMIN_PASS=hashed_password

# Existentes (se mantienen)
RESEND_API_KEY=
RESEND_DOMAIN=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=
```

---

## Fase 5: Testing y deploy

### 5.1 Verificaciones
- `npm run lint` limpio
- `npx tsc --noEmit` sin errores
- `npm run build` exitoso
- Smoke test: todas las rutas × 3 idiomas
- Admin: login funcional, CRUD tours, dashboard

### 5.2 Deploy
- Actualizar `docs/despliegue-vercel.md` con env vars de Supabase
- Actualizar `docs/seguridad.md` con CSP actualizado
- Crear `docs/capacitacion-supabase.md` (reemplaza la de Sanity)

---

## Orden de ejecución

| Paso | Descripción | Tiempo est. |
|------|-------------|-------------|
| 1 | Fase 1.1: Corregir tipografía del título | 15 min |
| 2 | Fase 1.2: Nubes flotantes | 30 min |
| 3 | Fase 1.3: Ken Burns | 15 min |
| 4 | Fase 1.4: Carousel de imágenes | 45 min |
| 5 | Fase 2.1-2.2: Instalar Supabase + crear cliente | 15 min |
| 6 | Fase 2.3: Schema SQL | 30 min |
| 7 | Fase 2.4-2.5: Seed + rewrite tours.ts | 45 min |
| 8 | Fase 2.6-2.7: Eliminar Sanity + actualizar configs | 30 min |
| 9 | Fase 3.1-3.3: Layout admin + auth | 45 min |
| 10 | Fase 3.4: Dashboard | 60 min |
| 11 | Fase 3.5-3.6: CRUD Tours + Destinos | 60 min |
| 12 | Fase 3.7-3.9: Reservas + Analytics + Settings | 45 min |
| 13 | Fase 5: Testing + docs | 30 min |

**Total estimado**: ~8-9 horas de desarrollo
