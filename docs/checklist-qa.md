# Checklist QA Integral — 04/09 (resultados 01/09)

## Resultados automatizados (build de producción)

| Verificación | Resultado | Detalle |
|---|---|---|
| `npm run lint` | ✅ | 0 errores |
| `tsc --noEmit` | ✅ | 0 errores |
| `npm run build` | ✅ | 347 páginas prerenderizadas (341 + 6 legales) |
| Smoke test 67 rutas × 3 idiomas | ✅ | 67/67 200 OK (script: `scripts/smoke-test.ps1`) |
| `/api/tours` | ✅ | 200 |
| `/api/health` | ✅ | 200 `{"ok":true}` |
| `/robots.txt` | ✅ | allow /, disallow /studio y /api/ |
| `/sitemap.xml` | ✅ | 342 URLs (es sin prefijo + /en + /pt) |
| Lighthouse (home) | ✅ | Perf 89 · **A11y 100** · Best 100 · SEO 92 (canonical: solo artefacto local) |
| Contenido 3 idiomas | ✅ | 239 claves idénticas es/en/pt, 0 placeholders rotos |

## Casos de prueba manuales

### Reservas (formulario `/reservar`)
- [ ] Validación: fecha vacía, viajeros 0, email inválido, nombre corto → mensajes por campo.
- [ ] Envío válido → código de reserva generado + persistencia en localStorage (`mapi-reservations`).
- [ ] Botón "Confirmar por WhatsApp" → enlace `wa.me` con resumen prefabricado.
- [ ] Título del tour precargado al entrar desde un tour (`/tours/[slug]` → "Reservar este tour").
- [ ] Rate limit: 6 envíos en 1 min → error genérico (protección anti-spam).
- [ ] Honeypot: rellenar campo oculto `website` → rechazo silencioso.

### Newsletter (footer)
- [ ] Email inválido → "Escribe un correo válido".
- [ ] Email válido → mensaje de éxito (o log de servidor si `RESEND_API_KEY` no está configurada).
- [ ] Doble envío rápido → rate limit activo.

### Navegación e idiomas
- [ ] Cambio es/en/pt desde el selector del header en todas las páginas.
- [ ] `/es/*` → 307 a `/` (comportamiento previsto con `localePrefix: as-needed`).
- [ ] Menú móvil, búsqueda de tours, filtros (categoría, duración, precio, valoración, orden).
- [ ] Skip link "Saltar al contenido" funciona con teclado (Tab + Enter).
- [ ] Navegación solo teclado completa en todas las páginas.

### Responsive (dispositivos)
- [ ] 375 px (móvil), 768 px (tablet), 1440 px (desktop): sin scroll horizontal, header colapsado correcto.
- [ ] Imágenes AVIF/WebP servidas (`Content-Type` + `x-vercel-cache` en producción).
- [ ] Top bar: enlaces de icono accesibles (aria-label) con texto oculto.

### SEO
- [ ] `hreflang` (es/en/pt/x-default) y canonical correctos por página.
- [ ] JSON-LD: TravelAgency (home), ItemList (tours), TouristTrip (detalle), FAQPage (guía FAQ).
- [ ] Google Search Console: 342 URLs del sitemap sin errores tras el deploy.

## Bugs encontrados y corregidos durante el QA

| Bug | Severidad | Fix |
|---|---|---|
| `/legal/terminos` y `/legal/privacidad` → 404 (enlaces del footer) | Alta | Páginas creadas (`src/app/[locale]/legal/*`) con contenido ES/EN/PT en `src/data/legal.ts`; añadidas al sitemap |
| `FilterBar`: ordenación rota (claves de mensaje incorrectas) | Media | `SORT_KEYS` explícito en `FilterBar.tsx` |
| `priceUpTo` sin interpolar `{value}` en 3 idiomas | Media | `"Hasta {value}"` / `"Up to {value}"` / `"Até {value}"` |
| Contraste insuficiente (eyebrows ámbar y footer) | Media | `text-amber-700` y `text-slate-400` (informe Lighthouse) |
| `aria-label` en divs sin rol (estrellas de reseñas) | Media | `role="img"` |
| Logo con nombre accesible incompleto | Baja | Eliminado `aria-label` redundante |
| Enlaces de icono sin nombre (topbar) | Baja | `aria-label` en WhatsApp y teléfono |