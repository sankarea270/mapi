# Changelog — Fases 1-4 (18/08/2026)

## Fase 1: Hero Animado

### Tipografía
- Título del tour: `font-extrabold` → `font-medium text-5xl sm:text-6xl lg:text-7xl`
- Precio del tour: `font-extrabold` → `font-bold text-amber-300`
- Homepage title: gradiente amber sutil con `bg-gradient-to-r from-slate-100 via-amber-100 to-slate-100 bg-clip-text text-transparent`

### Animaciones CSS (`globals.css`)
- `@keyframes ken-burns`: zoom lento 25s ease-in-out infinite alternate
- `@keyframes cloud-drift-1/2/3`: nubes flotantes a diferentes velocidades (50s, 65s, 80s)
- `@keyframes text-reveal`: slide-up + fade-in secuencial para textos del hero
- `@keyframes shimmer`: efecto brillo para badges

### Componentes nuevos
- `src/components/home/CloudLayer.tsx`: 4 capas de nubes SVG con opacidad baja
- `src/components/home/HeroCarousel.tsx`: carousel auto-play 7s, fade, arrows, dots

### Homepage
- Hero con carousel de 5 imágenes (Machu Picchu, Cusco, Amazonía, Lima, Colca)
- Nubes flotantes sobre el carousel
- Ken Burns en imagen activa
- CTAs con hover:scale-105
- Text-reveal secuencial (0.2s, 0.4s, 0.6s, 0.8s)

---

## Fase 2: Migración Sanity → Supabase

### Paquetes
- Instalado: `@supabase/supabase-js`
- Eliminados: `@sanity/client`, `sanity`

### Archivos nuevos
- `src/lib/supabase.ts`: cliente Supabase singleton con fallback a null
- `supabase/migrations/001_initial.sql`: schema SQL completo
  - categories (slug, name_es/en/pt, sort_order)
  - tours (category_id FK, names, price, rating, featured, status, gallery JSONB, itinerary JSONB)
  - destinations, reservations, subscribers
  - Índices + triggers para updated_at
- `scripts/seed-supabase.ts`: script para popular Supabase desde mock data

### Rewrite tours.ts
- GROQ queries → Supabase `from().select()` con JOIN
- Mantiene fallback a `getMockCategories()` cuando Supabase no está configurado

### Archivos eliminados
- `sanity.config.ts`, `sanity/schemaTypes/*`, `sanity/seed.ts`
- `src/lib/sanity.ts`

### Actualizaciones
- `package.json`: scripts `studio`, `seed:sanity`, `backup:sanity` → `seed:supabase`
- `next.config.ts`: `cdn.sanity.io` → `*.supabase.co` (images + CSP)
- `.env.example`: SANITY_* → SUPABASE_* + ADMIN_USER/ADMIN_PASS
- `src/data/legal.ts`: "Sanity" → "Supabase" en privacidad y términos
- `docs/despliegue-vercel.md`: env vars actualizadas
- `docs/seguridad.md`: CSP + backups actualizados

---

## Fase 3: Panel Admin

### Auth
- `src/middleware.ts`: protege `/admin/*`, redirect a login si no hay sesión
- `src/lib/auth.ts`: createSession, removeSession, isAuthenticated, timingSafeEqual
- `src/app/api/admin/login/route.ts`: POST autenticación
- `src/app/api/admin/logout/route.ts`: POST cerrar sesión

### Layout
- `src/app/admin/layout.tsx`: layout con sidebar oscuro + header
- `src/components/admin/AdminSidebar.tsx`: sidebar responsive con navegación

### Dashboard (`/admin`)
- 4 stats cards: tours, reservas, ingresos, suscriptores (datos reales de Supabase)
- Gráfico de barras SVG: reservas semana
- Tours más populares: barras horizontales con progreso
- Últimas reservas: tabla con estados

### Tours CRUD
- `/admin/tours`: lista con thumbnails, categoría, precio, rating, estado, acciones
- `/admin/tours/new`: formulario crear (nombres i18n, slug, precio, duración, excerpt, imagen)
- `/admin/tours/[id]`: formulario editar + eliminar
- API routes: POST crear, PATCH editar, DELETE eliminar

### Reservas (`/admin/reservations`)
- Lista con: cliente, tour, fecha, viajeros, estado, contacto
- Estados: pending, confirmed, completed, cancelled

### Analytics (`/admin/analytics`)
- Mock data: pageviews chart 14 días, top pages, dispositivos, idiomas

### Settings (`/admin/settings`)
- Formulario: nombre del sitio, descripción, contacto, redes sociales

---

## Fase 4: Testing + Docs

### Verificaciones
- `npm run lint`: 0 errores, 11 warnings (unused vars existentes)
- `npx tsc --noEmit`: 0 errores
- `npm run build`: exitoso
- Smoke test: 4/4 OK (/, /es/tours/camino-inca, /pt, /admin/login)

### Archivos creados
- `docs/changelog-18ago2026.md`: este archivo

---

## Resumen de impacto

| Métrica | Antes | Después |
|---------|-------|---------|
| Lighthouse Perf | 89 | ~90+ (CSS animations, sin JS overhead) |
| Lighthouse A11y | 100 | 100 |
| Total archivos nuevos | — | ~20 |
| Total archivos eliminados | — | ~6 (Sanity files) |
| Total archivos modificados | — | ~8 |
| Dependencias nuevas | — | @supabase/supabase-js |
| Dependencias eliminadas | — | @sanity/client, sanity |
| Admin pages | 0 | 8 (login, dashboard, tours CRUD, reservations, analytics, settings) |
| Animaciones CSS | 0 | 6 (ken-burns, cloud-drift ×3, text-reveal, shimmer) |
