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
| `FTP_SERVER` | Servidor FTP | cPanel → Cuentas FTP → *Configurar el cliente FTP* |
| `FTP_USERNAME` | Usuario FTP completo | Incluye el dominio: `usuario@gotomachupicchuperu.com` |
| `FTP_PASSWORD` | Contraseña | La que definas al crear la cuenta FTP |
| `FTP_SERVER_DIR` | Carpeta de destino | `/public_html/` para la cuenta principal |

`FTP_SERVER_DIR` depende de cómo crees la cuenta FTP: si la creas con el
directorio raíz en `public_html`, la ruta que ve esa cuenta ya es `/` y el
valor sería `/`. Compruébalo con la simulación antes del primer despliegue
real.

## Primer despliegue: simular antes

**Actions → Desplegar en cPanel → Run workflow →** marca **Simular**.

Lista los archivos que subiría sin tocar el servidor. Sirve para confirmar que
`FTP_SERVER_DIR` apunta donde toca: si la ruta está mal, se ve en el registro
en vez de descubrirlo con el sitio ya roto.

## Cómo transfiere

La acción deja un manifiesto (`.ftp-deploy-sync-state.json`) en el servidor y
solo sube lo que cambió. El primer despliegue mueve los ~758 archivos; los
siguientes, unos pocos segundos.

Si ese manifiesto se borra o se corrompe, el siguiente despliegue vuelve a
subirlo todo. Es lento, pero no rompe nada.

## FTPS, no FTP

El workflow usa `protocol: ftps`. Con FTP a secas, la contraseña viaja sin
cifrar en cada despliegue.

Si el servidor lo rechaza, la alternativa es `ftps-legacy` (FTPS implícito).
Cambiar a `ftp` es el último recurso: funciona, pero expone las credenciales.

## Comprobación antes de subir

El paso *Comprobar el build antes de subir* verifica que existan
`out/index.html`, `out/.htaccess` y `out/es`. Si el build fallara a medias, el
despliegue se detiene ahí en lugar de sincronizar un sitio incompleto sobre
el que ya funciona.

`out/index.html` no lo genera Next: lo crea `scripts/generar-raiz.mjs` en el
`postbuild`. Es la página que redirige según el idioma del navegador cuando
alguien escribe el dominio a secas.
