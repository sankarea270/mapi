# Informe de Auditoría — Lighthouse y Accesibilidad WCAG (31/08)

Fecha: 2026-08-17
Herramienta: Lighthouse 12.8.2 (Chrome 152 headless) sobre build de producción (`npm run build` + `npm run start`).
URL auditada: `/` (home, idioma es) — servidor local.

## Resultados

| Categoría | Puntuación | Notas |
|---|---|---|
| Performance | 89 | LCP 3,4 s · CLS 0 · FCP 1,1 s · TBT 160 ms |
| Accesibilidad | **100** | Tras correcciones (ver abajo) |
| Best Practices | **100** | |
| SEO | 92 | Único fallo: `canonical` — artefacto local (canonical apunta a `https://mapitravels.pe`, dominio de producción; pasa en el entorno real) |

## Hallazgos corregidos (Accesibilidad / WCAG 2.1)

1. **aria-prohibited-attr (6 nodos)** — `aria-label` en `<div>` sin rol válido (calificaciones con estrellas en reseñas).
   → Fix: añadido `role="img"` en `ReviewsSection.tsx:27`.
2. **color-contrast (4 nodos)**:
   - Eyebrows `text-amber-600` sobre blanco (3,19:1; requerido 4,5:1) en 12 páginas.
     → Fix: `text-amber-700` (#b45309, 5,02:1) en todos los eyebrows.
   - Texto inferior del footer `text-slate-500` sobre `slate-950` (4,23:1).
     → Fix: `text-slate-400` (7,8:1) en `Footer.tsx:160`.
3. **label-content-name-mismatch (2 nodos)** — logo con `aria-label="Mapi"` pero texto visible "Mapi Travels".
   → Fix: eliminado el `aria-label` en `Logo.tsx:13` (el nombre accesible proviene del texto visible).
4. **link-name (2 nodos)** — enlaces de icono de la barra superior (WhatsApp y teléfono) sin nombre accesible cuando el texto se oculta en pantallas pequeñas.
   → Fix: `aria-label` en ambos enlaces (`TopBar.tsx:21,29`).

## Mejoras de accesibilidad ya aplicadas antes de la auditoría (auditoría de código)

- Enlace "Saltar al contenido" (`#contenido`) y `<main id="contenido">` en el layout.
- `:focus-visible` visible en todos los elementos interactivos (`globals.css`).
- Soporte `prefers-reduced-motion: reduce`.
- Formularios con `<label>` explícito (asociación `htmlFor`/`id`).
- Imágenes con `alt` descriptivo y texto alternativo en iconos sociales/icon-buttons.

## Recomendaciones pendientes

- **LCP 3,4 s**: en local con throttling. Mejorar con preload de la imagen hero (ya tiene `priority`), AVIF/WebP ya activado, y caché CDN en Vercel. Re-medir tras el deploy.
- **canonical**: verificar en producción que cada URL declara su canonical dentro del mismo dominio (la lógica ya genera `https://mapitravels.pe/...`; el fallo local es esperado).
- Re-ejecutar Lighthouse en producción tras el deploy (05/09) y guardar informe como referencia.

## Procedimiento de re-ejecución

```powershell
npm run build
npm run start -- -p 3232
# en otra terminal:
npx -y lighthouse http://localhost:3232/ --chrome-flags="--headless --no-sandbox" --output=json --output-path=lh-report.json
```

Nota: requiere Chrome/Chromium; Lighthouse se descarga con `npx` automáticamente. Asegurar que no queden procesos `next start` antiguos antes de re-auditar (chunks obsoletos producen `__next_error__`).