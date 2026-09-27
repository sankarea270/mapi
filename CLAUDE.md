# GoToMapi — contexto para Claude Code

Sitio web de una agencia de viajes de Cusco (gotomachupicchuperu.com): tours,
paquetes, destinos, experiencias, guía, reseñas y un panel de administración.
El equipo habla español; **los textos, comentarios y mensajes de commit van en
español**.

Este archivo lo lee Claude Code al abrir la carpeta. Lo que aquí falta, no lo
sabe: **no arrastra la memoria de otras sesiones ni de otros equipos**.

## Lo primero que hay que entender: publicar es hacer `git push` a `main`

```
git push a main ──► GitHub Actions ──► npm run build ──► rsync por SSH ──► hosting
```

- **Cada push a `main` pone el sitio en producción** en ~3 minutos. No hay
  entorno de pruebas intermedio.
- El botón «Publicar cambios» del panel `/admin` lanza ese mismo despliegue.
- Por eso: **trabaja siempre en una rama y entrega con Pull Request**. No
  empujes directamente a `main` (ver `docs/CONTRIBUIR.md`).
- Los PR ejecutan `.github/workflows/verificar.yml` (tipos, lint y build) **sin
  desplegar nada**.

## Cómo funciona

- **Next.js 15 (App Router) con `output: 'export'`**: el resultado es HTML
  estático en `out/`. **No hay servidor, ni rutas API, ni código que corra en
  el servidor en producción.** Cualquier cosa que necesite backend va en
  Supabase (base de datos, auth, almacenamiento, funciones edge).
- **El contenido vive en Supabase y se lee UNA vez, al compilar.** Un cambio
  hecho en el panel no se ve hasta que se vuelve a compilar (de ahí el botón
  «Publicar cambios»). Los datos de `src/data/*` son el **respaldo** si
  Supabase no está configurado o falla (`conRespaldo` en `src/lib/content.ts`).
- React 19, Tailwind v4 (tokens en `src/app/globals.css`, bloque `@theme`),
  next-intl con **tres idiomas: es (por defecto), en, pt**. El prefijo de idioma
  va siempre (`/es/…`) y las URLs llevan barra final (`trailingSlash`).

## Mapa rápido

| Qué | Dónde |
|---|---|
| Páginas | `src/app/[locale]/…` |
| Panel de administración | `src/app/admin`, `src/components/admin/*` |
| Lectura de contenido (Supabase + respaldo) | `src/lib/content.ts`, `src/lib/tours.ts` |
| Datos de respaldo | `src/data/*` |
| Textos de la interfaz (los 3 idiomas) | `messages/es.json`, `en.json`, `pt.json` |
| Datos de la agencia (teléfono, RUC, redes…) | tabla `site_settings`; tipos y valores por defecto en `src/config/ajustes.ts` |
| Textos legales | `src/data/legal.ts` (se generan con los ajustes) |
| SEO, metadatos, datos estructurados | `src/lib/seo.ts`, `src/lib/jsonld.ts`, `src/app/sitemap.ts` |
| Migraciones de base de datos | `supabase/migrations/NNN_*.sql` |
| Función «Publicar» (edge function) | `supabase/functions/publicar` |
| Despliegue | `.github/workflows/deploy-cpanel.yml`, `public/.htaccess` |

## Comandos

```bash
npm install
npm run dev                 # servidor de desarrollo → http://localhost:3000
npm run build               # compilar como en producción (genera out/)
npx tsc --noEmit            # comprobar tipos
npm run lint
npm run verificar:migraciones   # ¿qué migraciones de supabase/ faltan?
node scripts/comprobar-hosting.mjs   # comprobar el sitio publicado
```

Para ver el resultado compilado: `npx serve out -l 3123` tras un `npm run build`.

## Reglas de este proyecto (por qué son así)

1. **Todo texto visible se añade en los tres idiomas** (`messages/*.json`).
   Uno solo deja la interfaz medio traducida en las otras dos versiones.
2. **Los datos nuevos que vienen de Supabase se leen con tolerancia**: si una
   columna todavía no existe (la migración no se ha pasado), el sitio debe
   seguir compilando. Mira `faltaColumna` y `getPackages` en `src/lib/content.ts`
   como modelo. Sin esto, una migración pendiente tumba el despliegue entero.
3. **Una migración nueva es un archivo `supabase/migrations/NNN_nombre.sql`
   numerado** y se ejecuta **a mano** en el editor SQL de Supabase (no hay
   ejecución automática). Debe poder correrse más de una vez sin romper nada
   (`IF NOT EXISTS`, `ON CONFLICT`…). Añade su comprobación a
   `scripts/estado-migraciones.mjs`.
4. **Colores y tipografía son de la marca; no inventes otros.** `teal-*` es el
   petróleo del logo, `amber-*` el naranja, `--color-oro` el dorado del titular
   de la portada. Fuentes: `font-heading` (Barlow Condensed), `font-logo`
   (Cormorant), sans (DM Sans). Cambiar la identidad visual no se hace sin
   avisar.
5. **No hay imágenes optimizadas por Next** (`images.unoptimized`): sube las
   fotos ya comprimidas. Los dominios permitidos están en `next.config.ts`.
6. **Comentarios en español, explicando el *porqué*** (qué problema resuelve y
   qué falló antes), no repitiendo lo que hace el código. Es la convención del
   repositorio; síguela.
7. **Accesibilidad y móvil no son opcionales**: comprueba cada cambio visual
   a 375 px, 768 px y 1440 px, y con «reducir movimiento».

## Trampas conocidas

- **`npm run build` estropea un `next dev` que esté abierto** (comparten la
  carpeta `.next`): la página carga sin componentes y parece un fallo tuyo.
  Tras compilar, para el servidor, `rm -rf .next` y vuélvelo a arrancar.
- **Sin `.env.local`, el sitio compila con datos de ejemplo** (`src/data/*`), no
  con el contenido real. Si «falta un tour» o «los textos son otros», mira
  primero eso.
- **El `/admin` de tu equipo local escribe en la base de datos REAL.** Solo hay
  un proyecto de Supabase. Edita datos ahí solo si es a propósito.
- **El repositorio es público.** No subas claves, contraseñas, capturas con
  datos de clientes ni archivos de `.env*`. Las claves de Supabase que empiezan
  por `NEXT_PUBLIC_` sí acaban en el JavaScript público (y las protegen las
  políticas RLS); **la `service_role` nunca**.
- **Añade archivos con rutas explícitas** (`git add ruta/archivo`), no con
  `git add -A`: en la raíz suelen quedar capturas y otros archivos sueltos.
- Los avisos «LF will be replaced by CRLF» en Windows son normales.

## Antes de dar algo por terminado

```bash
npx tsc --noEmit && npm run lint && npm run build
```

y, si tocaste algo visible, mirarlo en el navegador (móvil incluido). Si el
cambio necesita una migración o un secreto nuevo, **dilo en el PR**: no basta
con que compile.
