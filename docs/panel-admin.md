# Panel de administración

Editor de contenidos en `https://gotomachupicchuperu.com/admin`.

---

## Por qué está montado así

Hubo un panel antes. Se borró en el commit `3a2464e` al pasar el sitio a
export estático, y no fue un descuido: **no podía sobrevivir**. Aquel panel
dependía de tres cosas que ya no existen.

| Lo que usaba | Por qué dejó de funcionar |
|---|---|
| Rutas `/api/admin/*` | Con `output: 'export'` no hay servidor que las ejecute |
| `middleware.ts` para proteger `/admin` | El middleware tampoco se ejecuta; la ruta quedaba abierta |
| `ADMIN_PASS` en texto plano + cookie sin firmar | Cualquiera podía fabricarse esa cookie a mano |

Y había un cuarto problema, más de fondo: **la web se genera al compilar**.
Aunque el panel guardara los cambios, el visitante seguiría viendo el HTML
antiguo hasta que el sitio se reconstruyera.

El montaje actual resuelve las cuatro cosas:

```
  Panel /admin  ──►  Supabase  ──►  Función `publicar`  ──►  GitHub Actions
   (estático,        (datos +        (comprueba que eres     (compila y sube
    en cPanel)        permisos)       admin, avisa a GH)      por FTPS)  ~3 min
```

La protección **no está en el panel**, está en la base de datos. El HTML de
`/admin` es una cáscara vacía —compruébalo: `out/admin/index.html` no
contiene ni un dato del negocio—. Aunque alguien lo abra, sin sesión válida
y sin figurar en la tabla `admins` Postgres le rechaza cada consulta. Eso se
cumple siempre, porque se aplica en el servidor de la base de datos, no en
un JavaScript que el visitante controla.

---

## Puesta en marcha

Solo hace falta una vez. Calcula unos 20 minutos.

### 1. Crear el proyecto en Supabase

En [supabase.com](https://supabase.com) → **New project**. El plan gratuito
sobra para esto.

Guarda la contraseña de la base de datos que te pide: no se puede recuperar.

### 2. Crear las tablas

En el panel de Supabase → **SQL Editor** → **New query**. Pega y ejecuta,
**en este orden**:

1. El contenido de `supabase/migrations/001_initial.sql`
2. El contenido de `supabase/migrations/002_panel.sql`

El segundo es el que enciende las políticas de seguridad. Sin él las tablas
quedan abiertas a cualquiera que tenga la clave anónima, que va dentro del
JavaScript público de la web. **No te lo saltes.**

### 2b. Crear el almacén de imágenes

Mismo sitio, otra consulta: pega y ejecuta el contenido de
`supabase/migrations/003_almacenamiento.sql`.

Sin esto el panel deja pegar direcciones de fotos, pero no subirlas: al
intentarlo dirá *"No existe el almacén de imágenes"*.

### 3. Copiar las claves

En Supabase → **Project Settings** → **API**. Necesitas dos valores:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Crea `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

La tercera (**service_role**, en la misma pantalla) solo se usa para el
sembrado del paso siguiente. **Nunca la pongas en un secreto de GitHub ni en
ningún sitio que llegue al navegador**: se salta todas las políticas de
seguridad. `.env.local` está en `.gitignore`, así que no se sube.

### 4. Llenar la base de datos con el contenido actual

```bash
npm run seed:supabase
```

Sube los 62 tours, los destinos, los paquetes y las reseñas que hoy están en
`src/data/`. Se puede repetir sin duplicar nada.

### 5. Crear tu cuenta

En Supabase → **Authentication** → **Users** → **Add user** → *Create new
user*. Pon tu correo y una contraseña.

Marca **Auto Confirm User**, o no podrás entrar hasta validar el correo.

Ahora hay que autorizarla. **SQL Editor**, cambiando el correo:

```sql
insert into admins (user_id, email)
select id, email from auth.users where email = 'tu@correo.com';
```

Este paso existe a propósito: tener cuenta en Supabase no basta para editar
la web. Si algún día alguien consiguiera registrarse, seguiría sin poder
tocar nada.

### 6. Dar las claves a GitHub Actions

Repositorio → **Settings** → **Secrets and variables** → **Actions** → *New
repository secret*. Añade dos:

| Nombre | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | El Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La clave anon public |

Sin esto la compilación no encuentra Supabase, cae al respaldo de
`src/data/` y **tus cambios no aparecerían nunca en la web**.

### 7. El botón de publicar

Este paso es opcional: sin él todo funciona, pero tendrás que lanzar el
despliegue a mano desde la pestaña **Actions** del repositorio.

Para que el botón funcione hace falta desplegar la función `publicar`:

```bash
npx supabase login
npx supabase link --project-ref TU_REF
npx supabase secrets set GITHUB_TOKEN=ghp_xxx GITHUB_REPO=Sankarea270/MAPI
npx supabase functions deploy publicar
```

El `GITHUB_TOKEN` es un *fine-grained personal access token* creado en
GitHub → Settings → Developer settings, **limitado a este repositorio** y
con un solo permiso: **Contents: Read and write**.

Ese token vive en Supabase, en el servidor. Nunca en el panel: el navegador
descarga el JavaScript entero, así que meterlo ahí sería publicarlo.

---

## Cómo se usa

Entra en `/admin` con el correo y la contraseña del paso 5.

### Las dos velocidades

Hay una diferencia que conviene tener clara:

- **Reservas** — efecto inmediato. Cambiar el estado de una solicitud no
  toca la web, así que no hay que publicar.
- **Todo lo demás** — tours, paquetes, destinos, reseñas. Se guarda al
  momento en la base de datos, pero **la web no cambia hasta que pulsas
  "Publicar cambios"**. Tarda unos 3 minutos.

La cabecera lleva la cuenta de lo que tienes sin publicar, y se acuerda
aunque cierres la pestaña.

### Borrador y publicado

Cada tour, paquete, destino y reseña tiene una casilla **Visible en la web**.

Lo que nace nuevo nace como borrador. Un borrador es invisible para el
visitante aunque publiques: la base de datos directamente no se lo entrega a
la compilación. Puedes dejar un tour a medias sin miedo.

### Los tres idiomas

En vez de triplicar cada campo, arriba del formulario hay un selector
**Español / English / Português**. El punto naranja marca los idiomas sin
traducir.

Si dejas una traducción vacía, la web usa el español en su lugar en vez de
mostrar un hueco.

### Las fotos

En tours, paquetes y destinos puedes **arrastrar una imagen** al recuadro, o
pulsar *Elegir archivo*. En la galería de un tour se pueden soltar varias de
golpe.

Antes de subirla, el panel la reduce a 1600px de ancho y la convierte a
WebP. Verás cuánto se ahorró: *"Optimizada: 4.2 MB → 280 KB"*.

Eso no es cosmética. La web publica las imágenes **sin optimizar** —el sitio
estático no lleva servidor que las procese al vuelo—, así que lo que subes es
exactamente lo que descarga cada visitante. Una foto de móvil sin reducir
haría que la ficha tardara varios segundos en cargar con datos móviles, que
es justo como te va a mirar la mayoría de la gente.

Debajo sigue habiendo un campo de texto para **pegar una dirección**. Sirve
para las fotos que ya están en el sitio (`/fotos/...`) o alojadas en otro
lado.

### La dirección en la web

El campo *Dirección en la web* es lo que sale en la URL:
`/es/tours/machu-picchu-clasico`. Se genera sola a partir del nombre.

**Cambiarla en algo ya publicado rompe los enlaces que circulen** —los de
Google, los de WhatsApp, los que un cliente tenga guardados—. Si el tour ya
lleva tiempo publicado, mejor no tocarla.

---

## Si algo falla

**"Panel sin conectar"** — faltaban las claves de Supabase al compilar. Paso
3 si estás en local, paso 6 si es la web publicada.

**"Sin permiso"** — la cuenta existe pero no está en `admins`. Paso 5.

**"Correo o contraseña incorrectos"** — el mensaje es ambiguo a propósito, no
distingue si el correo existe. Comprueba que marcaste *Auto Confirm User*.

**"No existe el almacén de imágenes"** — falta ejecutar
`003_almacenamiento.sql` (paso 2b).

**"Tu cuenta no tiene permiso para subir imágenes"** — el 003 se ejecutó a
medias: se creó el depósito pero no las políticas. Vuelve a lanzarlo entero.

**El botón de publicar da error** — la función `publicar` no está desplegada
(paso 7), o el token de GitHub caducó. Mientras tanto puedes desplegar a
mano: repositorio → **Actions** → *Desplegar en cPanel* → **Run workflow**.

**Publiqué pero la web no cambia** — mira la pestaña Actions. Si el workflow
salió en verde y aun así ves lo viejo, es la caché de tu navegador: recarga
con `Ctrl + Shift + R`.

**Un tour no aparece en la web** — casi siempre está en borrador. Abre la
ficha y mira la casilla *Visible en la web*.

---

## Notas sobre el diseño

**Por qué una sola página y no varias rutas.** Con export estático cada ruta
se convierte en un fichero HTML en disco. Una ruta como `/admin/tours/[id]`
exigiría conocer todos los identificadores en el momento de compilar, y los
tours se crean después. El panel usa vistas internas y guarda la posición en
el hash de la URL (`/admin#tours`), que no necesita servidor.

**Por qué los ficheros de `src/data/` siguen ahí.** Son el respaldo. Si
Supabase se cae, o alguien clona el proyecto sin claves, la web compila
igual con ese contenido en vez de quedarse vacía. Ojo: a partir de ahora son
una foto del contenido en el momento en que se sembró, no la verdad.

**Qué puede hacer alguien sin sesión.** Solo dos cosas: leer el contenido
publicado —que es público de todos modos— y crear una solicitud de reserva o
una suscripción, porque los formularios de la web tienen que funcionar sin
que nadie inicie sesión. **No puede leer las reservas de nadie**, ni
modificar ni borrar nada. La contrapartida es que un robot podría llenar la
tabla de solicitudes basura; si algún día pasa, la solución es un captcha en
el formulario, no cerrar el permiso.

**Por qué las reservas se guardan además de ir por WhatsApp.** Antes una
solicitud solo existía como mensaje: si el cliente cerraba la conversación
sin enviarlo, o se perdía entre otros cien, no quedaba rastro. Ahora queda
registrada. El cliente no nota ningún cambio, y si la base de datos falla el
WhatsApp se abre igual: se guarda *después* de abrirlo, nunca antes.
