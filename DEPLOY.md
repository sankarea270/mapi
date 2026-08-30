# Despliegue

El sitio es un export estático de Next.js: `npm run build` deja en `out/` un
árbol de HTML, CSS, JS e imágenes que cualquier hosting puede servir. No hay
servidor, ni API, ni base de datos en tiempo de ejecución.

## Las dos variables que importan

| Variable | Qué controla | Si te equivocas |
|---|---|---|
| `BASE_PATH` | Subcarpeta desde la que se sirve el sitio | Todos los enlaces y recursos apuntan a una carpeta que no existe: el sitio queda inservible |
| `NEXT_PUBLIC_SITE_URL` | URL pública absoluta | El canonical, los hreflang, el sitemap y `robots.txt` declaran a Google URLs que no resuelven |

Ambas se leen en el build, no en tiempo de ejecución: **hay que reconstruir
después de cambiarlas**.

## Appwrite Sites

El sitio se sirve desde la raíz, así que `BASE_PATH` se deja **sin definir**.

Ajustes del panel:

| Ajuste | Valor |
|---|---|
| Static site | activado |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | `./out` |
| Fallback file | `404.html` |

> El panel propone `./.next` por defecto. Eso es para el modo servidor; con
> `output: 'export'` la salida está en `out/`.

Variables de entorno a definir en Appwrite:

```
NEXT_PUBLIC_SITE_URL=https://<lo-que-te-dé-appwrite>
```

Y las de Supabase, si se quiere que los tours salgan de la base de datos en
vez de los datos de ejemplo:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**No** hace falta subir `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` ni
`ADMIN_PASS`: son secretos de funciones que no existen en el build estático.

### Cuando tengas el dominio

1. Apuntar el dominio a Appwrite y verificarlo en el panel.
2. Cambiar `NEXT_PUBLIC_SITE_URL` a `https://tu-dominio`.
3. Actualizar `domain` y `handle` en `src/config/site.ts`, de donde salen el
   correo, las redes y los textos legales.
4. Reconstruir y volver a desplegar.

## GitHub Pages

Es la excepción: sirve desde `/<repo>`, así que su workflow exporta
`BASE_PATH=/mapi`. Está en `.github/workflows/deploy.yml` y no hay que tocar
nada.

Cuando el sitio viva en su dominio y Pages deje de usarse, se puede borrar
ese workflow entero.

## Datos

Los tours se leen de Supabase **en el momento del build**, con los datos de
`src/data/` como respaldo si no hay credenciales. Un tour nuevo en Supabase
no aparece hasta que se vuelve a construir y desplegar.
