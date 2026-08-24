# Guía de Despliegue — Vercel (18/08/2026)

## 1. Prerrequisitos

- Repositorio Git del proyecto (o importar desde GitHub).
- Cuenta en [vercel.com](https://vercel.com) (plan Hobby gratuito suficiente).
- Cuenta en [supabase.com](https://supabase.com) (plan gratuito: 500MB DB, 1GB storage).
- Dominio: ej. `mapitravels.pe` (registrar en un registrador cualquiera; Vercel gestiona DNS).

## 2. Setup Supabase

1. Crear proyecto en Supabase → nombre: `mapi-travels`.
2. Ir a **SQL Editor** → pegar contenido de `supabase/migrations/001_initial.sql` → Run.
3. Copiar las credenciales:
   - **Settings → API**: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Settings → API → Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY` (solo para seed, NO exponer al cliente)
4. Opcional: ejecutar seed:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
   npm run seed:supabase
   ```

## 3. Variables de entorno en Vercel

En *Settings → Environment Variables*:

| Variable | Valor | Notas |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://mapitravels.pe` | URL pública del sitio |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | código de Search Console | Verificación GSC |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXX` | Google Analytics 4 |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID numérico | Meta Pixel (Facebook) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | URL proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Anon Key (pública, solo lectura) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Service Role (server-side only) |
| `RESEND_API_KEY` | key de Resend | Notificaciones por email |
| `RESEND_DOMAIN` | `mapitravels.pe` | Dominio verificado en Resend |
| `RESEND_FROM` | `Mapi Travels <hola@mapitravels.pe>` | Remitente |
| `ADMIN_USER` | `admin` | Usuario del panel admin |
| `ADMIN_PASS` | contraseña fuerte | Contraseña del panel admin |

## 4. Importar el proyecto

1. Vercel → *Add New → Project* → importar el repo `mapi`.
2. Framework: detectado automáticamente (**Next.js**).
3. Build command: `npm run build` · Output directory: `.next` (por defecto).
4. Añadir las variables de entorno (ver tabla arriba).
5. *Deploy* → primera URL provisional `mapi-xxxx.vercel.app`.

## 5. Dominio y DNS

1. Vercel → proyecto → *Settings → Domains* → añadir `mapitravels.pe` (y `www.mapitravels.pe`).
2. Vercel mostrará los registros a crear en el registrador:
   - `A` → `76.76.21.21` (o `CNAME` según instrucciones) para el dominio raíz.
   - `CNAME` `www` → `cname.vercel-dns.com`.
3. Activar *Redirect www → apex* (opcional; recomendado).
4. **HTTPS**: Vercel emite y renueva certificados Let's Encrypt automáticamente. HSTS se sirve desde `next.config.ts` en producción.

## 6. CDN

- Vercel Edge Network sirve estáticos desde el borde automáticamente (imágenes Next con AVIF/WebP).
- Verificar cabeceras de caché en *Network*: `x-vercel-cache: HIT` en assets estáticos.

## 7. Verificación post-deploy

- `https://mapitravels.pe/robots.txt` → `Sitemap: https://mapitravels.pe/sitemap.xml`.
- `/sitemap.xml` → URLs completas (es sin prefijo, /en/, /pt/).
- `/api/health` → `{"ok":true,...}`.
- `/admin` → redirect a `/admin/login` → login funcional.
- Google Search Console: verificar propiedad, enviar sitemap.
- Re-ejecutar Lighthouse en producción (informe: `auditoria-lighthouse.md`).

## 8. Panel Admin

- URL: `https://mapitravels.pe/admin`
- Login: usuario y contraseña configurados en `ADMIN_USER` / `ADMIN_PASS`
- Dashboard: stats en tiempo real desde Supabase
- Tours CRUD: crear, editar, eliminar tours
- Reservas: ver y gestionar estados
- Analytics: datos mock de tráfico
- Settings: configuración general

## 9. Backup Supabase

- **Automático**: Supabase hace backup diario (plan gratuito: 7 días retención).
- **Manual**: SQL Editor → exportar tablas como CSV.
- **Antes de cambios grandes**: exportar manualmente.

## 10. Promociones (opcional)

- Activar *Instant Rollback* (gratuito) y *Preview Deployments* para cada PR.
- Plan Pro: *Production Protection* para bloquear el acceso con contraseña antes del lanzamiento.
