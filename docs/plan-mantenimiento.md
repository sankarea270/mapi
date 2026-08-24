# Plan de Mantenimiento — 08/09 (post-lanzamiento)

## Objetivo

Garantizar disponibilidad, actualidad del contenido y mejora continua tras el lanzamiento oficial.

## Rutinas

| Frecuencia | Tarea | Responsable |
|---|---|---|
| Diario | Revisar reservas recibidas (email/WhatsApp) y errores en Vercel Logs | Comercial |
| Semanal (lunes) | Backups Sanity (`npm run backup:sanity`), revisar Analytics (tráfico, conversión), nuevos tours/destinos desde el CMS | Comercial + Dev |
| Quincenal | Actualizar reseñas y feed social en `src/data/`; verificar hreflang/sitemap en Search Console | Marketing |
| Mensual | Lighthouse en producción (Performance ≥ 90, A11y ≥ 95); auditoría de velocidad; revisar dependencias (`npm outdated`) | Dev |
| Trimestral | Auditoría de seguridad (CSP, dependencias con `npm audit`), revisar renovación de dominio y certificados | Dev |

## Proceso de cambios

1. Nuevos contenidos → CMS Sanity (sin deploy).
2. Cambios de código → branch + PR → *Preview Deployment* de Vercel → aprobación → merge (auto-deploy con *Instant Rollback* disponible).
3. Los textos de idioma (`messages/*.json`) son cambios de código: traducir los 3 idiomas en el mismo PR.

## Dependencias y costes recurrentes

| Servicio | Plan | Coste |
|---|---|---|
| Vercel (hosting + CDN + HTTPS) | Hobby (gratuito) | $0 |
| Sanity (CMS) | Free tier (1 proyecto, 1M+ docs) | $0 |
| Resend (email) | Free (100 emails/día) | $0 |
| UptimeRobot (monitoreo) | Free (50 checks) | $0 |
| Google Analytics / Search Console / Meta Pixel | — | $0 |
| Dominio `.pe` | Registrador | ~$30/año |

## Riesgos y mitigación

- **Sin acceso a la cuenta Sanity del dueño**: un único `Administrador`; documentar credenciales en gestor de contraseñas.
- **Cuota de email Resend agotada**: las reservas se siguen mostrando en la app (localStorage) y en WhatsApp; subir de plan solo si necesario.
- **Cambios de API de Google/Meta**: el provider `Analytics.tsx` es aislado; actualizar el snippet si cambian.
- **Churn del equipo**: documentar en `docs/` (despliegue, seguridad, monitoreo, Sanity) para onboarding de nuevos integrantes.

## Criterios de éxito a 3 meses

- Disponibilidad ≥ 99.9%.
- ≥ 1 actualización de contenido/semana en el CMS.
- Lighthouse Performance ≥ 90 y A11y ≥ 95 en el último informe.
- Reservas mensuales registradas en Analytics con tendencia positiva.