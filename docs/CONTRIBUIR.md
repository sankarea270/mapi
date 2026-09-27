# Trabajar en el proyecto (guía para colaboradores)

Dos partes: la primera es para **quien entrega el proyecto** (qué dar, qué no dar
y qué preparar antes); la segunda, para **quien lo recibe** (cómo ponerlo en
marcha y cómo entregar cambios sin romper la web). Si trabajas con Claude Code,
lee también el apartado [«Trabajar con Claude»](#trabajar-con-claude).

> **Lo único que hay que tener claro antes de tocar nada:** en este proyecto
> **publicar es hacer `git push` a la rama `main`**. Cada push a `main` compila
> el sitio y lo sube a producción en ~3 minutos, sin pasos intermedios. Por eso
> los cambios se hacen en una **rama** y se entregan con un **Pull Request**.

---

## Parte 1 — Para quien entrega el proyecto

### Qué darle y qué no

| Acceso | ¿Lo necesita? | Cómo |
|---|---|---|
| **Repositorio de GitHub** | Sí | Repositorio → **Settings → Collaborators → Add people**, rol **Write**. Con la protección de `main` de más abajo, «Write» le deja proponer cambios pero no publicarlos. |
| **Claves de Supabase** (`NEXT_PUBLIC_SUPABASE_URL` y `…_ANON_KEY`) | Sí, para ver el contenido real | Por un **canal privado** (mensaje directo). Nunca en un issue, un PR ni el chat público. Están en Supabase → *Project Settings → API*. |
| **Cuenta en el panel `/admin`** | Solo si va a usarlo | Supabase → *Authentication → Add user*, y darla de alta en la tabla `admins` (pasos en [`panel-admin.md`](panel-admin.md)). |
| **Acceso al proyecto de Supabase** (el panel web) | **No al principio** | Da acceso a **todos los datos reales**. Para las migraciones SQL es más seguro que él te pase el archivo y lo ejecutes tú. |
| **`SUPABASE_SERVICE_ROLE_KEY`** | **No** | Salta todas las políticas de seguridad. Solo la usan dos scripts de carga inicial que él no necesita. |
| **Secretos de GitHub Actions** (clave SSH, tokens) | **No** | No hacen falta para trabajar: los usa el despliegue automático. GitHub ni siquiera deja leerlos. |
| **Hosting (HostArmada / Namecheap), cPanel, DNS** | **No** | Quien publica es GitHub Actions. |
| **Claude** | Su propia cuenta | Cada persona usa la suya. |

### Antes de dárselo: cuatro cosas que solo puedes hacer tú

**1. Proteger `main`** (5 minutos; es lo más importante).
GitHub → repositorio → **Settings → Rules → Rulesets → New ruleset → New branch
ruleset**:

- *Ruleset name*: `Proteger main`. *Enforcement status*: **Active**.
- *Target branches* → **Add target → Include default branch**.
- Activa **Require a pull request before merging**.
- Activa **Require status checks to pass** y añade la comprobación **`verificar`**
  (aparece en la lista después de que se haya ejecutado una vez, por ejemplo en el
  primer PR).
- Activa **Block force pushes**.

Con esto, nadie —tampoco tu compa— puede empujar a `main` directamente ni
fusionar un PR que no compile. Tú, como propietaria, sigues pudiendo fusionar.

**2. Decidir qué pasa con la base de datos.** Solo hay **un** proyecto de
Supabase, el real. Si tu compa entra en `/admin` desde su ordenador y edita algo,
**está editando producción**. Lo razonable, de momento: que no escriba en el
panel, y que lea los datos con la clave anónima (solo lectura). Si más adelante
hace falta probar cosas del panel, se crea un segundo proyecto de Supabase
gratuito con las migraciones 001–010 y el mismo procedimiento de
[`panel-admin.md`](panel-admin.md).

**3. Comprobar que el estado de la base de datos está al día**:

```bash
npm run verificar:migraciones
```

Todas deben salir `HECHA`. Así no se encuentra con errores de columnas que faltan
que en realidad no son suyos.

**4. Enseñarle este archivo** y `CLAUDE.md`, y acordar cómo avisa cuando un PR
esté listo.

### Qué revisar en cada Pull Request

- [ ] La comprobación **`verificar`** está en verde (tipos, lint y compilación).
- [ ] Todo texto nuevo está en **los tres idiomas** (`messages/es.json`, `en.json`, `pt.json`).
- [ ] No hay claves, `.env*`, capturas con datos de clientes ni archivos ajenos al cambio.
- [ ] Si toca la base de datos: hay un archivo `supabase/migrations/NNN_*.sql` **y el PR
      explica que hay que ejecutarlo** (y cuándo: antes de fusionar).
- [ ] Si toca algo visible: capturas del PR a móvil y a escritorio.
- [ ] Solo cambia lo que el PR dice que cambia.

Cuando lo fusionas, **se despliega solo**. Espera ~3 minutos y mira la web.

---

## Parte 2 — Para quien recibe el proyecto

### Poner el proyecto en marcha

**Necesitas:** [Node.js 22](https://nodejs.org), [Git](https://git-scm.com) y un editor
(VS Code, por ejemplo). Y las dos claves de Supabase que te haya pasado el
responsable.

```bash
git clone https://github.com/sankarea270/mapi.git
cd mapi
npm install
```

Crea el archivo de variables copiando la plantilla:

```bash
cp .env.example .env.local
```

(En Windows PowerShell: `Copy-Item .env.example .env.local`.)

Abre `.env.local` y rellena **solo** estas dos líneas con lo que te dieron:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Deja vacías las demás. **No pidas ni uses la `SUPABASE_SERVICE_ROLE_KEY`.** Después:

```bash
npm run dev
```

y abre http://localhost:3000. Si ves datos de ejemplo en vez del contenido real
(otros tours, otros textos), es que falta o está mal `.env.local`.

`.env.local` **no se sube a Git** (está ignorado): mantenlo así.

### Cómo entregar un cambio

Siempre por rama y Pull Request, nunca directo a `main`:

```bash
git checkout main
git pull
git checkout -b feat/nombre-corto-del-cambio
```

Trabaja. Antes de entregar, la misma comprobación que hará GitHub:

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Sube **solo los archivos que has tocado**, con su ruta (no `git add -A`: en la raíz
suelen quedar capturas y otros archivos sueltos):

```bash
git add src/components/lo-que-tocaste.tsx messages/es.json messages/en.json messages/pt.json
git commit -m "feat: qué hace el cambio y por qué"
git push -u origin feat/nombre-corto-del-cambio
```

Después, en GitHub aparece un botón **«Compare & pull request»**. Ábrelo, cuenta qué
cambia y **por qué**, y adjunta capturas si es visual. Espera al check verde y avisa
al responsable: será quien lo fusione.

**Mensajes de commit:** en español, con prefijo (`feat:` novedad, `fix:` arreglo,
`docs:` documentación, `ci:` automatización) y explicando el motivo, no solo la
acción. Mira `git log --oneline -15` para el tono.

### Reglas que evitan los sustos

- **Nada de claves ni contraseñas en el código, en un commit ni en un PR.** El
  repositorio es **público**: cualquiera puede leerlo.
- **Texto nuevo → en los tres idiomas.** Si no sabes traducirlo, pídeselo a Claude,
  pero no lo dejes a medias.
- **Base de datos nueva → migración numerada** (`supabase/migrations/011_…sql`), que
  se pueda ejecutar más de una vez sin romper, y **lectura tolerante** en el código
  (que el sitio compile aunque la migración aún no esté ejecutada). Ejemplo en
  `src/lib/content.ts` (`faltaColumna`).
- **No cambies la identidad visual** (colores, tipografías, logo) sin avisar.
- **Comprueba lo visual a 375, 768 y 1440 px.**
- **No escribas en el `/admin` de tu equipo** salvo que se acuerde: escribe en la
  base de datos real.

### Si algo sale mal

| Síntoma | Qué hacer |
|---|---|
| La web en `npm run dev` carga sin componentes tras un `npm run build` | Compartís la carpeta `.next`. Para el servidor, `rm -rf .next` y vuelve a arrancar. |
| Salen datos de ejemplo o falta un tour | Falta o está mal `.env.local`. |
| El check `verificar` falla | Abre la pestaña **Actions** del PR y lee el paso en rojo: dice si es de tipos, de lint o de compilación. Reprodúcelo en local con `npx tsc --noEmit && npm run lint && npm run build`. |
| Se fusionó algo que rompe la web | En GitHub, abre el PR fusionado y pulsa **Revert**: crea otro PR que lo deshace. Fusiónalo y en ~3 minutos vuelve a estar bien. |
| Avisos «LF will be replaced by CRLF» en Windows | Normales. Ignóralos. |

---

## Trabajar con Claude

Claude Code lee `CLAUDE.md` **automáticamente** al abrir la carpeta del proyecto: ahí
está cómo se publica, el mapa del código y las reglas. **No arrastra la memoria de
otras sesiones ni de otras personas**, así que lo que no esté escrito ahí, no lo sabe.

**Cómo empezar cada sesión:** abre Claude Code dentro de la carpeta `mapi` y, la
primera vez, pídele algo como:

> Lee `CLAUDE.md` y `docs/CONTRIBUIR.md`. Explícame en cinco líneas cómo se publica
> este sitio y qué reglas tengo que respetar antes de que toques nada.

**Qué decirle siempre** (cópialo al empezar una tarea si quieres):

> Trabaja en una rama nueva, nunca en `main`. No hagas `git push` a `main`. No
> subas ningún `.env*` ni claves. Cuando termines, pasa `npx tsc --noEmit`,
> `npm run lint` y `npm run build`, y dime qué archivos tocaste. Los textos nuevos
> van en es/en/pt. Añade los archivos con rutas explícitas, no con `git add -A`.

**Cosas que Claude no puede saber, y que tienes que decirle tú si aplican:**

- Que un cambio necesita una **migración** o un **secreto** nuevo.
- Que algo se ve mal **en tu pantalla concreta** (móvil, navegador…). Pásale una captura.
- Si una decisión es de **diseño o de negocio** (precios, textos legales, datos de
  la agencia): que la confirme la responsable antes de cambiarla.

**Buenas prácticas:**

- Da **tareas acotadas** («cambia X en Y») mejor que «mejora la web».
- **Lee lo que propone** antes de aceptarlo, sobre todo en `.github/workflows/`,
  `public/.htaccess`, `supabase/` y `next.config.ts`: un cambio ahí puede afectar
  a la publicación de todo el sitio.
- **No pegues claves en la conversación** con Claude. Si necesita una variable,
  dile que la lea de `.env.local`, no que te la muestre.
- Si no entiendes un cambio, **pídele que te lo explique** antes de fusionarlo.

---

## Documentos relacionados

- [`CLAUDE.md`](../CLAUDE.md) — el contexto que lee Claude Code.
- [`panel-admin.md`](panel-admin.md) — cómo funciona el panel y cómo montar Supabase.
- [`despliegue.md`](despliegue.md) — cómo se publica el sitio.
- [`../MIGRACION-HOSTARMADA.md`](../MIGRACION-HOSTARMADA.md) — la migración de hosting en curso.
