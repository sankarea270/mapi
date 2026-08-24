# Monitoreo Post-Deploy — 05/09

## Health endpoint

`GET /api/health` → `{"ok":true,"service":"mapi-travels","version":"1.0.0","timestamp":"..."}` (dinámico, sin caché).

### Uptime checks gratuitos (fuera de Vercel)
- [UptimeRobot](https://uptimerobot.com) (gratis, 50 checks): monitor `HTTP(S)` sobre `https://mapitravels.pe/api/health` cada 5 min, alerta email/Telegram.
- [Better Stack](https://betterstack.com) o [Pingdom](https://pingdom.com) como alternativa.

## Vercel Monitoring

1. **Vercel Analytics** (*Analytics tab*): activar Web Analytics (Core Web Vitals en reales).
2. **Speed Insights** (Core Web Vitals lab): activar en proyecto → *Analytics → Speed Insights*.
3. **Logs**: *Observability → Logs* — filtrar `status >= 400`; crear alerta de error rate.
4. **Alertas de deploy**: en *Settings → Notifications* (email/Slack/Discord).

## Métricas clave a vigilar

| Métrica | Umbral | Fuente |
|---|---|---|
| Disponibilidad | 99.9% (≈43 min/mes) | UptimeRobot |
| LCP (real) | < 2.5 s p75 | Vercel Speed Insights |
| CLS | < 0.1 | Vercel Speed Insights |
| Error 4xx | < 1% del tráfico | Vercel Logs |
| Error 5xx | < 0.1% | Vercel Logs + UptimeRobot |
| Tiempo de build/deploy | < 5 min | Vercel |

## Playbook de incidentes

1. **Sitio caído**: UptimeRobot alerta → revisar *Deployments* → *Instant Rollback* al último deploy estable.
2. **Errores 500 aislados**: revisar Vercel Logs (stack trace) → corregir y desplegar.
3. **Rendimiento degradado**: comparar Speed Insights antes/después; revisar tamaño de imágenes y terceros (GA/Meta) en Lighthouse.
4. **Spam en reservas**: revisar rate limit/honeypot (ya activos); bloqueo manual por IP en Vercel Firewall (plan Pro) si persiste.

## Calendario de revisión

- **Semanal**: uptime report, errores 4xx/5xx, backups Sanity (`npm run backup:sanity`).
- **Mensual**: Lighthouse en producción (performance + a11y), revisión de Analytics (conversión de reservas), limpieza de datos.

## Checklist del día del lanzamiento (08/09)

- [ ] `/api/health` OK en producción.
- [ ] UptimeRobot monitor activo y alerta de prueba recibida.
- [ ] Vercel Web Analytics + Speed Insights activos.
- [ ] Sitemap enviado en Search Console y 336 URLs indexadas sin errores.
- [ ] HSTS verificado (`curl -I https://mapitravels.pe` → `strict-transport-security`).