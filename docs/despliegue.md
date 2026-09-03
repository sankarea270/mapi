# Despliegue

El sitio se publica en dos sitios a la vez, cada uno con su workflow. Ambos
compilan el mismo código; lo único que cambia es dónde vive el sitio.

| Destino | Workflow | Ruta base | URL |
|---|---|---|---|
| cPanel (Namecheap) | `deploy-cpanel.yml` | raíz | https://gotomachupicchuperu.com |
| GitHub Pages | `deploy.yml` | `/mapi` | https://sankarea270.github.io/mapi |

GitHub Pages se mantiene como copia de seguridad y vista previa. Si algún día
sobra, basta con borrar `deploy.yml`.

## Por qué dos rutas base

En cPanel el sitio ocupa la raíz del dominio; en GitHub Pages cuelga de
`/<repo>`. Esa diferencia la resuelve la variable `BASE_PATH`, que se lee en
`next.config.ts`. Vacía por defecto (raíz), y el workflow de Pages exporta
`/mapi`.

Publicar con la ruta equivocada rompe el sitio entero: todos los enlaces y
recursos apuntarían a una carpeta que no existe.

## Secretos necesarios (solo para cPanel)

En GitHub: **Settings → Secrets and variables → Actions → New repository secret**

| Secreto | Qué es | Dónde encontrarlo |
|---|---|---|
| `SSH_KEY` | Clave privada, **sin contraseña** | Ver más abajo |
| `SSH_HOST` | IP del servidor | cPanel → portada → *Dirección IP compartida* |
| `SSH_USER` | Usuario de cPanel | cPanel → portada → *Usuario actual* |

`SSH_PORT` y `SSH_TARGET_DIR` son opcionales: valen `21098` y `public_html`
por defecto, que es lo que usa Namecheap.

### La clave

El generador de claves de cPanel **obliga a poner contraseña**, y eso no
sirve: GitHub no puede teclearla al conectarse. Hay que generarla fuera e
importar solo la pública.

```bash
ssh-keygen -t ed25519 -f despliegue -N "" -C "despliegue-github-actions"
```

1. **cPanel → Acceso SSH → Administrar claves SSH → Importar clave.** Pega el
   contenido de `despliegue.pub` en *Clave pública*. Deja vacíos el campo de
   contraseña y el de clave privada.
2. En **Claves públicas**, junto a la recién importada: **Administrar →
   Autorizar**. Sin esto el servidor no la acepta.
3. El contenido de `despliegue` (la privada, 7 líneas) va al secreto
   `SSH_KEY`. Luego borra el fichero de tu equipo.

## Primer despliegue: simular antes

**Actions → Desplegar en cPanel → Run workflow →** marca **Simular**.

Lista lo que subiría y lo que borraría, sin tocar el servidor.

Importa especialmente por el `--delete`: si alguna vez hay en `public_html`
algo que no venga del build, la simulación lo enseña antes de que desaparezca.

## Cómo transfiere

`rsync` sobre SSH. Compara contenido, no fechas, así que los despliegues
posteriores al primero mandan solo lo que cambió y tardan segundos.

`--delete` retira del servidor lo que ya no existe en el sitio, para que no
queden páginas viejas accesibles ni indexables. Dos exclusiones son críticas:

- **`.well-known/`** — guarda la validación del certificado SSL. Borrarla
  rompería el HTTPS en la siguiente renovación.
- **`cgi-bin/`** — carpeta propia de cPanel.

## Por qué SSH y no FTP

Se intentó FTPS primero, con dos herramientas, y las dos murieron a mitad:

| Herramienta | Resultado |
|---|---|
| `SamKirkland/FTP-Deploy-Action` | `Server sent FIN packet unexpectedly` a los 2 min |
| `lftp` con 10 reintentos | `max-retries exceeded` tras 18 min |

La causa es el hosting compartido: subir 766 ficheros pequeños seguidos
dispara su protección anti-abuso, que corta la conexión una y otra vez. No
son las credenciales —conectaba y subía cientos de ficheros antes de caer.

Lo peligroso era el resultado: `public_html` a medias, con media web nueva y
media vieja, sin aviso.

SSH lo resuelve de raíz porque abre **una sola conexión** para todo. No hay
nada que disparar.

## Comprobación antes de subir

El paso *Comprobar el build antes de subir* verifica que existan
`out/index.html`, `out/.htaccess` y `out/es`. Si el build fallara a medias, el
despliegue se detiene ahí en lugar de sincronizar un sitio incompleto sobre
el que ya funciona.

`out/index.html` no lo genera Next: lo crea `scripts/generar-raiz.mjs` en el
`postbuild`. Es la página que redirige según el idioma del navegador cuando
alguien escribe el dominio a secas.
