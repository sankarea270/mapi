# Informe de Seguridad — 03/09

## Medidas implementadas

### 1. Rate limiting (formularios)
- Util en memoria `src/lib/rateLimit.ts`: buckets por IP (`x-forwarded-for` con fallback `local`), ventana deslizante, límite configurable.
- Aplicado a:
  - `createReservation` (`src/app/actions/reserve.ts`): máx. **5 reservas / minuto / IP** → respuesta `{ ok: false, limited: true }`.
  - `subscribeNewsletter` (`src/app/actions/newsletter.ts`): máx. **5 suscripciones / minuto / IP**.
- ContactForm va directo a WhatsApp (sin endpoint de servidor): no aplica rate limit ni honeypot; el riesgo de abuso es de la cuenta WhatsApp, no del sitio.

### 2. Honeypot anti-spam
- Campo oculto `website` (fuera de pantalla, `tabIndex=-1`, `aria-hidden`) en:
  - `BookingForm.tsx` (formulario de reserva)
  - `NewsletterForm.tsx` (newsletter)
- Las acciones rechazan silenciosamente cualquier envío con el campo relleno (bots).

### 3. Cabeceras de seguridad (`next.config.ts`)
- `Content-Security-Policy`: `default-src 'self'`; `script-src 'self' 'unsafe-inline'` + googletagmanager + connect.facebook.net; `img-src 'self' data:` + picsum + *.supabase.co; `connect-src` + api.resend.com + google-analytics; `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`.
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security` (HSTS) solo en producción: `max-age=63072000; includeSubDomains; preload`

### 4. Variables de entorno
- `.env.example` creado con todas las variables documentadas.
- `.env*` en `.gitignore` (ya existía).
- Ningún secreto en el repositorio; credenciales solo en el panel de Vercel.

### 5. Backups
- Base de datos Supabase: backup automático diario (plan gratuito: 7 días deretención).
- Manual: **SQL Editor** → exportar tablas como CSV.
- `backups/` añadido a `.gitignore`.
- Recomendación: exportar manualmente antes de cambios grandes; Supabase conserva snapshots 7 días.

## Limitaciones y recomendaciones futuras

- **Rate limiting en memoria**: correcto para Vercel (instancias efímeras, límites por instancia). Para self-hosting con múltiples instancias, migrar a un store compartido (Redis/Upstash) con la misma interfaz `rateLimited()`.
- **CSP**: `'unsafe-inline'` en `script-src` es necesario por Next.js inline scripts; si se requiere máximo endurecimiento, evaluar nonce/hash con `next-safe`.
- **Backups de Supabase**: plan gratuito incluye backup automático diario con 7 días de retención. Para retención mayor, upgrade a plan Pro.
- **Vercel**: protección automática de rutas `/api/*` y variables de entorno cifradas. Activar "Protection" del proyecto durante el desarrollo.
- **Monitoreo de seguridad**: Vercel Logs + alertas de uptime (ver `monitoreo.md`).