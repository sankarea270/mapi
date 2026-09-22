# Migrar GoToMapi de Namecheap a HostArmada

Guía paso a paso, hecha con los datos reales de tu configuración actual
(consultados el 19-sep-2026). Cada fase dice **dónde** se hace, **cómo** y
**cómo comprobar** que salió bien.

> **Aviso honesto:** conozco tu proyecto, tu DNS y tu despliegue, pero **no he
> visto el panel de HostArmada**. Los nombres de menús de cPanel que uso son
> los estándar; si algo se llama distinto, busca por la palabra clave. Lo que
> sí depende de HostArmada (acceso SSH, puerto, carpeta raíz) va marcado con
> ⚠️ y en la [sección 3](#3-antes-de-empezar-preguntas-para-hostarmada) tienes
> la lista de preguntas para su chat de soporte.

---

## Índice

1. [Resumen en un minuto](#1-resumen-en-un-minuto)
   - **[Empieza aquí: los 6 primeros pasos](#empieza-aquí-los-6-primeros-pasos)**
2. [Cómo está montado hoy](#2-cómo-está-montado-hoy)
3. [Antes de empezar: preguntas para HostArmada](#3-antes-de-empezar-preguntas-para-hostarmada)
4. [Fase 1 — Preparar HostArmada](#4-fase-1--preparar-hostarmada-sin-tocar-nada-de-lo-actual)
5. [Fase 2 — Subir el sitio y probarlo sin cambiar el DNS](#5-fase-2--subir-el-sitio-y-probarlo-sin-cambiar-el-dns)
6. [Fase 3 — El correo](#6-fase-3--el-correo-lo-más-delicado)
7. [Fase 4 — El cambio de DNS (día D)](#7-fase-4--el-cambio-de-dns-día-d)
8. [Fase 5 — Después del cambio](#8-fase-5--después-del-cambio-primeras-72-horas)
9. [Fase 6 — Limpieza](#9-fase-6--limpieza-del-repositorio-y-de-namecheap)
10. [Plan de vuelta atrás](#10-plan-de-vuelta-atrás)
11. [Cronograma sugerido](#11-cronograma-sugerido)
12. [Referencia rápida](#12-referencia-rápida)

---

> ## ⚠️ Urgente: tu hospedaje de Namecheap vence el 1-oct-2026
>
> Es el plan «Stellar Plus», y es distinto del registro del dominio (ese vence en
> 2027). Se renueva solo cada año salvo que lo desactives, así que mientras no
> hagas nada seguirá funcionando — pero si algo se corta antes de terminar la
> migración (un impago, una cancelación por error), la web y el correo se caen de
> golpe. **No canceles ni desactives nada en Namecheap todavía**: la [Fase 6](#9-fase-6--limpieza-del-repositorio-y-de-namecheap)
> ya se ocupa de eso, y solo cuando HostArmada lleve 7-14 días funcionando bien.
> Con SSH ya confirmado en los dos lados, terminar los pasos 1-6 de abajo y el
> cambio de DNS ([Fase 4](#7-fase-4--el-cambio-de-dns-día-d)) cabe de sobra antes
> del 1 de octubre.

## 1. Resumen en un minuto

**Qué se mueve:** los archivos del sitio (unos 790 archivos, 125 MB), el
certificado HTTPS, la zona DNS y los buzones de correo `@gotomachupicchuperu.com`.

**Qué NO se mueve** (y por eso es menos arriesgado de lo que parece):

| Pieza | Dónde vive | ¿Cambia? |
|---|---|---|
| Base de datos, imágenes subidas, login del panel, función «Publicar» | **Supabase** | No |
| Código, historial y despliegue automático | **GitHub** | Solo 3-5 secretos |
| Registro del dominio (quién lo posee y lo renueva) | **Namecheap** | No (ver aviso abajo) |
| Google Search Console, TripAdvisor | Cuentas propias | No |

**Lo más importante, por orden:**

1. **Los nameservers de tu dominio son los del hosting de Namecheap**
   (`dns1/dns2.namecheaphosting.com`). La zona DNS vive *dentro* de ese hosting.
   Si cancelas Namecheap antes de mover el DNS, **se caen la web y el correo**.
2. **El correo entra por el servidor de Namecheap** (`mx1/2/3-hosting.jellyfish.systems`).
   Migrar la web sin migrar el correo dejaría `reservas@…` sin funcionar.
3. **No hace falta transferir el dominio.** Se queda en Namecheap y solo se
   cambian sus nameservers. Además está bloqueado para transferencias hasta
   ~31-oct-2026 (regla ICANN de 60 días tras el registro del 1-sep-2026).

**Tiempo real de trabajo:** 3-5 horas repartidas en 2 semanas. **Caída de la
web esperable:** ninguna si sigues el orden (las dos webs coexisten). **Riesgo
principal:** el correo, por eso tiene su propia fase.

---

## Empieza aquí: los 6 primeros pasos

Tu plan de HostArmada **incluye SSH**, así que se usa el camino principal (rsync
por SSH, el mismo que hoy con Namecheap). El workflow ya trae preparados los
pasos de HostArmada, **dormidos** hasta que exista el secreto `HA_SSH_HOST`: no
hay que editar ningún archivo del proyecto. Estos seis pasos resumen las fases 1
y 2; el detalle de cada uno está en la sección que se enlaza.

> **HostArmada tiene DOS paneles distintos y es fácil mezclarlos:**
>
> | Panel | Para qué | Cómo se ve |
> |---|---|---|
> | **Área de Cliente** (billing) | Comprar, ver facturas, **dominios que registras a través de HostArmada** | Menú lateral morado: *Salpicadero, Mi cuenta, Mis servicios, Dominios (Registro/Transferencia/Renovar), Mis facturas, Tickets* |
> | **cPanel del hospedaje** | Donde vive de verdad el sitio: archivos, SSH, correo, DNS de tu dominio | Pestañas arriba: *Dashboard, Websites & Apps, Email, Files, Databases, Security, Performance* — el tema «Meridian» que ya viste (`naca1.armadaservers.com`) |
>
> **Tu dominio `gotomachupicchuperu.com` NO está registrado en HostArmada — sigue en
> Namecheap, y así se queda.** Lo que viste en *Dominios → Registro/Transferencia*
> (la búsqueda de disponibilidad y el campo «Código de transferencia EPP») es el
> flujo para **cambiar de registrador**, algo que esta guía **no** pide hacer y que,
> además, ahora mismo estaría bloqueado por la regla de ICANN de 60 días desde el
> registro (1-sep-2026 → hasta ~31-oct-2026). **No rellenes el código EPP ni sigas
> esa transferencia.** Lo único que hace falta es cambiar, en Namecheap, a QUÉ
> nameservers apunta el dominio — eso no es una transferencia y no lo bloquea nada
> ([lo confirma la propia documentación de HostArmada](https://hostarmada.com/kb/domain-and-dns/can-i-host-my-domain-with-you-without-transferring-it/):
> *"You may host your domain name with HostArmada without needing to transfer it
> from the registrar (...) point the domain name to the nameservers corresponding
> to your server"*). El paso 4.2 más abajo dice exactamente dónde ver esos
> nameservers — **no son los que salían en esa pantalla de Dominios**, que son los
> del sistema de registro de dominios y no tienen por qué coincidir con los de tu
> servidor de hospedaje.
>
> **¿Ya le pediste a Namecheap el código EPP?** No pasa nada, no hay que usarlo
> todavía — ni hace falta. Aunque lo pegues en HostArmada, **el registro `.com`
> rechaza la transferencia igualmente mientras dure el bloqueo de 60 días**: no es
> algo que dependa del código ni que ningún registrador pueda saltarse
> ([confirmado por ICANN](https://www.icann.org/resources/pages/name-holder-faqs-2017-10-10-en);
> [explicación técnica](https://www.namesilo.com/blog/en/domain-transfer/why-cant-i-transfer-my-domain)).
> Guarda el código si quieres, pero no sigas ese formulario — ni falta que hace
> escribir nada en «Configure servidores de nombres» de esa pantalla.

> **Tu panel es «Meridian»**, el tema nuevo de cPanel (pestañas *Dashboard,
> Websites & Apps, Email, Files, Databases, Security, Performance* arriba). Las
> claves SSH ya no están en un icono aparte «Acceso SSH»: viven dentro de
> **Security → Terminal Access (SSH)**, con dos botones directamente en esa
> página, **Generate Key** e **Import Key**. Este documento usa los nombres del
> tema clásico entre paréntesis por si en algún momento ves el otro.
>
> **Datos que ya sé de tu cuenta** (por lo que me enseñaste y por la propia
> documentación de HostArmada):
>
> | Dato | Valor |
> |---|---|
> | Servidor (host SSH) | `naca1.armadaservers.com` (resuelve a `84.75.144.0`) |
> | Puerto SSH | **`19199`, siempre** — es fijo en todos los servidores de HostArmada, no hay que preguntarlo ([fuente](https://hostarmada.com/kb/ssh-and-linux/how-can-i-connect-via-ssh-on-hostarmada/)) |
> | Estado del servidor | Ya probado: responde, y tiene forzado HTTPS a nivel de cuenta (Security → *HTTPS Redirect: All Redirected*) |

### Tu situación real: una cuenta, dos dominios

Esa cuenta de HostArmada ya aloja **otro dominio tuyo**; `gotomachupicchuperu.com`
todavía no está en ningún hospedaje de HostArmada. La buena noticia: **muy
probablemente no hace falta comprar nada nuevo.** El disco de esa cuenta marca
**30 GB**, y según la propia tabla de planes de HostArmada, ese tamaño coincide
con el plan **«Web Warp»**, que admite **dominios ilimitados**
([fuente](https://hostarmada.com/kb/web-hosting-services/how-many-sites-can-i-host-in-my-current-hostarmada-plan/)).
Confírmalo sin ambigüedad en **Área de Cliente → Mis servicios → tu paquete**: si
el nombre del plan no es «Start Dock» (ese sí limita a un solo sitio), puedes
añadir `gotomachupicchuperu.com` a la misma cuenta gratis, como **addon domain**:
mismo cPanel, mismo servidor, mismo usuario y la misma clave SSH que vamos a
preparar — sin tocar en nada al otro dominio, que sigue funcionando aparte.

> Si prefirieras separarlos del todo más adelante (por ejemplo, para no mezclar
> este proyecto con el otro), siempre se puede mover a una cuenta propia después
> repitiendo este mismo proceso — no es una decisión que ate para siempre.

### Paso 1 — Añade el dominio a tu cuenta de HostArmada (addon domain)

**Dónde:** en el cPanel `naca1.armadaservers.com` → pestaña **Websites & Apps**
(en el tema clásico: *Domains*). Pasos exactos
([fuente](https://hostarmada.com/tutorials/getting-started/cpanel/how-to-manage-your-domains-in-cpanel/)):

1. Botón **Create A New Domain Name** (esquina derecha).
2. **Domain**: escribe `gotomachupicchuperu.com`.
3. **Share document root**: **desmárcalo**. Con la casilla marcada, este dominio
   serviría lo mismo que el otro que ya tienes ahí — hay que separarlos.
4. **New Document Root**: escribe exactamente `gotomachupicchuperu.com` (es
   relativo a `public_html`, así que queda en `public_html/gotomachupicchuperu.com`).
   Usa ese valor tal cual — es el que dan por sentado los pasos de más abajo.
5. **Subdomain**: cPanel lo rellena solo; déjalo como está.
6. **Submit**.

Con esto queda **`HA_SSH_TARGET_DIR` = `public_html/gotomachupicchuperu.com`** — la
carpeta a la que vamos a subir el sitio con rsync. (Detalle de qué pasa con el
correo y el certificado de este dominio, en las fases 3 y 4 más abajo.)

### Paso 2 — Encuentra tu usuario de cPanel y los nameservers

Dos datos, en dos sitios **del Área de Cliente** (el panel morado; no el cPanel):

- [ ] **Usuario de cPanel**: pestaña **Dashboard** del cPanel de hospedaje → panel
      «General Information» (donde Namecheap te enseñaba `gotoninw`), o el correo
      «Welcome to HostArmada». Es el mismo usuario para las dos webs: no cambia
      por añadir el addon domain.
- [ ] **Nameservers de tu hospedaje**: Área de Cliente → **Mis servicios** → tu
      paquete → icono de medidor junto a la fecha de vencimiento. **No** los de
      *Dominios → Transferencia* — detalle de por qué en la nota de arriba y en el
      [paso 4.2](#42-cambiar-los-nameservers-en-namecheap). Son los del servidor,
      así que valen igual para tu otro dominio y para este.

### Paso 3 — Genera la clave SSH (o reutiliza la que ya tengas)

Es la **misma cuenta** que usa tu otro dominio: si ya despliegas ese sitio por SSH
y tienes una clave autorizada y sin passphrase, **puedes usar esa misma** y
saltarte este paso y el siguiente — ve directa al paso 5 con esa clave. Si no,
dos formas de crear una nueva; cualquiera sirve. **En las dos, deja la contraseña
(passphrase) VACÍA: GitHub Actions no puede teclearla, y una clave con
passphrase rompe el despliegue automático.**

**A) En tu equipo (recomendado: la privada no sale de tu PC hasta que tú la pegas
en GitHub).** PowerShell:

```bash
ssh-keygen -t ed25519 -f despliegue-hostarmada -N "" -C "despliegue-github-actions-hostarmada"
```

Crea `despliegue-hostarmada` (**privada**, no la compartas con nadie) y
`despliegue-hostarmada.pub` (pública). Sigue en el paso 4 con **Import Key**.

**B) Directamente en el panel** (Security → Terminal Access (SSH) → **Generate
Key**): dale un nombre sin espacios, **deja la contraseña en blanco**, y genera.
El panel te deja descargar la clave privada: guárdala para el paso 6 y bórrala de
tus descargas en cuanto la hayas pegado en GitHub. Con esta vía te saltas el
paso 4 (Import), pero **igual tienes que Autorizarla** — sigue leyendo.

Detalle: [1.4](#14-una-clave-ssh-nueva-para-hostarmada).

### Paso 4 — Importa (o localiza) la clave y AUTORÍZALA

**Dónde:** Security → **Terminal Access (SSH)**, la sección que ya tienes abierta.

1. Si generaste la clave en tu equipo (opción A): botón **Import Key** → pega el
   contenido de `despliegue-hostarmada.pub` en *Clave pública* → nómbrala → Import.
   Si la generaste en el panel (opción B), ya aparece en la lista: sáltate esto.
2. **La clave queda en la lista, pero no sirve todavía.** Ábrela (clic en la clave
   o en su menú «Manage») y pulsa **Authorize**. Debe pasar a estado *authorized*.
   **Sin este paso el servidor la rechaza aunque la hayas importado bien** — es el
   error más común en este paso, confirmado en la propia documentación de
   HostArmada.

### Paso 5 — Comprueba que entra sin contraseña

```bash
ssh -i despliegue-hostarmada -p 19199 USUARIO@naca1.armadaservers.com
```

(Sustituye `USUARIO` por el del paso 2; si generaste la clave en el panel, usa la
ruta donde descargaste la privada en vez de `despliegue-hostarmada`.)

Debe dejarte entrar **sin** pedir contraseña. Escribe `exit` para salir. Si pide
contraseña o dice «Permission denied», vuelve al paso 4 — casi siempre falta
**Authorize**.

### Paso 6 — Crea los 5 secretos en GitHub

**Dónde:** https://github.com/sankarea270/mapi → **Settings → Secrets and variables →
Actions → New repository secret**. Detalle: [2.1](#21-crear-los-secretos-nuevos-en-github).

| Secreto | Valor |
|---|---|
| `HA_SSH_HOST` | `naca1.armadaservers.com` |
| `HA_SSH_USER` | tu usuario de cPanel (paso 2) |
| `HA_SSH_PORT` | `19199` |
| `HA_SSH_KEY` | contenido **completo** de la clave privada (paso 3), con las líneas `-----BEGIN…` y `-----END…` |
| `HA_SSH_TARGET_DIR` | `public_html/gotomachupicchuperu.com` (paso 1) |

Cuando hayas pegado la clave privada en GitHub, **bórrala de tu equipo** (y de tus
descargas, si la generaste en el panel).

### Y después: simular, subir, probar

1. **GitHub → Actions → «Desplegar en cPanel (Namecheap)» → Run workflow →** marca
   **Simular** → Run. En el paso **«Sincronizar con HostArmada»** verás qué subiría
   **y qué borraría**. Los archivos de bienvenida del hosting saldrán como
   «deleting»: es lo esperado. Detalle: [2.3](#23-primero-simulando-luego-en-real).
2. Si el listado es razonable, lánzalo de nuevo **sin** marcar Simular (~125 MB la
   primera vez; después solo se sube lo que cambia).
3. Pruébalo **antes** de tocar el DNS: [2.4](#24-probar-hostarmada-antes-de-que-nadie-lo-vea).

```bash
node scripts/comprobar-hosting.mjs --ip 84.75.144.0
```

(Ya lo probé así antes de que hicieras nada de esto: el servidor responde y tiene
HTTPS forzado a nivel de cuenta; todo lo demás falla porque no hay ningún sitio
en `gotomachupicchuperu.com` todavía — se arregla subiendo el sitio a la carpeta
del paso 1.)

> **Ten presente esto:** en cuanto exista `HA_SSH_HOST`, **cada `push` y cada
> «Publicar cambios» del panel subirá a los dos hostings** (primero Namecheap,
> luego HostArmada). Es lo que se quiere durante la migración. Si creas
> `HA_SSH_HOST` pero olvidas otro secreto, el paso de HostArmada falla con un
> mensaje que dice cuál falta, y el despliegue sale en rojo; la web real de
> Namecheap ya se habrá actualizado.
>
> **El DNS, el correo y el cambio de nameservers vienen después** (fases 3 y 4):
> no los toques hasta que el script dé **0 fallos**.

---

## 2. Cómo está montado hoy

Datos leídos del DNS público y del servidor el 19-sep-2026:

| Dato | Valor actual |
|---|---|
| Registrador del dominio | Namecheap, registrado 2026-09-01, **vence 2027-09-01** |
| Nameservers | `dns1.namecheaphosting.com`, `dns2.namecheaphosting.com` |
| Web (registro A) | `162.0.232.31` (servidor compartido de Namecheap, LiteSpeed) |
| `www` | CNAME → `gotomachupicchuperu.com` |
| Correo (MX) | `mx1/mx2/mx3-hosting.jellyfish.systems` (prioridades 5/10/20) |
| SPF (TXT) | `v=spf1 +a +mx +ip4:162.0.232.28 +ip4:162.0.232.32 include:spf.web-hosting.com ~all` |
| Search Console (TXT) | `google-site-verification=Ed46BAMrHr0ko-o9Cc44hk4Xpw40wiylxYJHs7ZbmhY` |
| DMARC (TXT `_dmarc`) | `v=DMARC1; p=none;` |
| Certificado HTTPS | SSL.com (AutoSSL de Namecheap), caduca 2027-03-19 |

**Cómo llega un cambio a la web:**

```
Panel /admin ──► Supabase (guarda el dato)
     │
     └─ «Publicar cambios» ──► función `publicar` de Supabase
                                   │  (usa GITHUB_TOKEN)
                                   ▼
                         GitHub Actions: deploy-cpanel.yml
                          1. npm run build  (lee Supabase)
                          2. rsync por SSH ──► public_html del hosting
```

El mismo flujo se dispara con cada `git push` a `main`. **Toda la migración del
despliegue consiste en cambiar el «destino» de ese último `rsync`**: el panel,
Supabase y GitHub siguen igual.

Los secretos de GitHub que usa hoy (**Settings → Secrets and variables → Actions**):

| Secreto | Qué es |
|---|---|
| `SSH_HOST`, `SSH_USER` | IP y usuario de cPanel de Namecheap |
| `SSH_PORT` | opcional; vale `21098` (el puerto SSH de Namecheap) |
| `SSH_KEY` | clave privada de despliegue, sin contraseña |
| `SSH_TARGET_DIR` | opcional; vale `public_html` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | para compilar con tus datos |
| `TRIPADVISOR_API_KEY`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | opcionales |

Los cuatro últimos **no cambian** con la migración.

---

## 3. Antes de empezar: preguntas para HostArmada

Pega esto en su chat de soporte (o léelo en el panel antes de contratar). Las
respuestas cambian pasos concretos de esta guía:

1. **¿Mi plan incluye acceso SSH?** ¿Hay que activarlo (en cPanel → *Acceso SSH* o
   pidiéndolo a soporte)? → si es **no**, ve a [«Si no hay SSH»](#si-no-hay-ssh).
2. **¿Qué puerto SSH usan?** (No asumas 22 ni 21098.) → secreto `HA_SSH_PORT`.
3. **¿Se puede iniciar sesión SSH con clave, sin contraseña, y usar `rsync`?**
4. **¿Qué servidor web usan (Apache o LiteSpeed) y respetan el `.htaccess`
   (mod_rewrite, mod_expires, mod_deflate, mod_headers)?** El sitio depende de
   él para redirecciones, 404 y caché.
5. **¿Cuál es la IP del servidor y cuáles son sus nameservers?**
6. **¿Hay algún límite de archivos (inodos) o de espacio?** El sitio son
   ~790 archivos y 125 MB.
7. **¿Me ayudan a migrar los correos?** (Muchos hostings lo hacen gratis: pídelo
   antes de hacerlo tú.)
8. **¿Cómo se emite el certificado (AutoSSL / Let's Encrypt) y cuánto tarda
   tras apuntar el DNS?**
9. **¿Hay una URL temporal** para ver el sitio antes de cambiar el DNS?

**Requisitos mínimos del hosting** (si alguna respuesta es «no», no sirve):
HTTPS gratuito · `.htaccess` con mod_rewrite · SSH+rsync (o alternativa de la
sección [«Si no hay SSH»](#si-no-hay-ssh)) · correo IMAP/SMTP · cPanel o
equivalente para DNS/correo.

> Para HostArmada en concreto, las preguntas 2 y 5 ya están resueltas: el puerto
> SSH es siempre `19199` y la IP de tu servidor es `84.75.144.0`
> ([«Empieza aquí»](#empieza-aquí-los-6-primeros-pasos) tiene el resto de datos ya
> rellenados).

---

## 4. Fase 1 — Preparar HostArmada (sin tocar nada de lo actual)

Nada de esta fase afecta a la web que funciona hoy.

### 1.1 Contratar y anotar los datos de acceso

Del correo de bienvenida de HostArmada anota:

- [ ] URL del cPanel y usuario/contraseña
- [ ] **IP del servidor**
- [ ] **Nameservers** (dos, tipo `ns1…` / `ns2…`)
- [ ] URL temporal de pruebas, si la dan

> Si compraste el hosting de Namecheap hace menos de 30 días (el dominio se
> registró el 1-sep), **revisa la política de reembolso de Namecheap antes de que
> pase el plazo** si decides no seguir con ellos.

### 1.2 Añadir el dominio en HostArmada y anotar la «carpeta raíz»

**Dónde:** cPanel de HostArmada → **Dominios** (*Domains*).

- Si `gotomachupicchuperu.com` es el **dominio principal** de la cuenta, la carpeta
  raíz es `public_html`.
- Si lo añades como **dominio adicional**, la carpeta raíz suele ser otra (por
  ejemplo `public_html/gotomachupicchuperu.com`). Cópiala tal cual aparece en la
  columna **Raíz del documento** (*Document Root*).

Esa ruta es tu futuro `HA_SSH_TARGET_DIR` (relativa a tu carpeta personal, sin
barra inicial). ⚠️ Es la causa nº 1 de «he subido todo y sale 404».

### 1.3 Activar SSH y comprobar que entra

**Dónde:** cPanel → **Acceso SSH** (*SSH Access*), o pídelo a soporte (pregunta 1).

Desde tu ordenador (PowerShell):

```bash
ssh -p PUERTO USUARIO@IP_DEL_SERVIDOR
```

Debe pedirte la contraseña de cPanel y dejarte entrar. Escribe `exit` para salir.

### 1.4 Una clave SSH nueva para HostArmada

Se usa una clave **distinta** a la de Namecheap para poder desplegar a los dos
sitios sin pisar nada mientras conviven.

1. En tu equipo (PowerShell), en una carpeta temporal:

   ```bash
   ssh-keygen -t ed25519 -f despliegue-hostarmada -N "" -C "despliegue-github-actions-hostarmada"
   ```

   Crea `despliegue-hostarmada` (privada) y `despliegue-hostarmada.pub` (pública).
   **El `-N ""` es imprescindible:** GitHub no puede teclear una contraseña.

2. **Dónde importarla:** cPanel de HostArmada → **Acceso SSH → Administrar claves
   SSH → Importar clave**.
   - *Clave pública*: pega el contenido de `despliegue-hostarmada.pub`.
   - Deja vacíos el campo de contraseña y el de clave privada.
3. En **Claves públicas**, junto a la que acabas de importar: **Administrar →
   Autorizar**. Sin este paso el servidor la rechaza.
4. Guarda el contenido de `despliegue-hostarmada` (la privada, 7 líneas) para el
   secreto `HA_SSH_KEY` de la fase 2. Cuando lo hayas pegado en GitHub, **bórrala
   de tu equipo**.

Comprobación (debe entrar **sin** pedir contraseña):

```bash
ssh -i despliegue-hostarmada -p PUERTO USUARIO@IP_DEL_SERVIDOR
```

### 1.5 Inventario del correo actual

**Dónde:** cPanel de **Namecheap** → **Cuentas de correo electrónico**.

Anota, para cada buzón (como mínimo `reservas@gotomachupicchuperu.com`):

- [ ] Dirección y espacio que ocupa
- [ ] Reenvíos (*Forwarders*), respuestas automáticas (*Autoresponders*) y filtros
- [ ] **Dónde lo lees**: Gmail (reenvío o POP), móvil, Outlook, Thunderbird…

Luego, en cPanel de **HostArmada → Cuentas de correo**, crea los mismos buzones
**con la misma dirección** y contraseñas nuevas. Aún no reciben nada: el correo
sigue entrando en Namecheap hasta el cambio de DNS.

---

## 5. Fase 2 — Subir el sitio y probarlo sin cambiar el DNS

Objetivo: tener en HostArmada una copia idéntica funcionando, mientras la web
real sigue en Namecheap. **Los visitantes no notan nada.**

### 2.1 Crear los secretos nuevos en GitHub

**Dónde:** https://github.com/sankarea270/mapi → **Settings → Secrets and
variables → Actions → New repository secret**. Crea estos cinco:

| Secreto | Valor |
|---|---|
| `HA_SSH_HOST` | IP del servidor de HostArmada |
| `HA_SSH_USER` | usuario de cPanel de HostArmada |
| `HA_SSH_PORT` | el puerto que te dijeron (pregunta 2) |
| `HA_SSH_KEY` | contenido **completo** de `despliegue-hostarmada` (incluidas las líneas `-----BEGIN…` y `-----END…`) |
| `HA_SSH_TARGET_DIR` | la carpeta raíz del paso 1.2 (`public_html` o la que sea) |

### 2.2 El despliegue doble ya está en el workflow

Durante el solapamiento, cada `push` y cada «Publicar cambios» debe actualizar
**los dos** servidores; si no, uno se queda desactualizado.

**No tienes que editar nada:** los dos pasos de HostArmada («Preparar la clave
SSH de HostArmada» y «Sincronizar con HostArmada») ya están en
`.github/workflows/deploy-cpanel.yml`, pero **dormidos**: solo se ejecutan cuando
existe el secreto `HA_SSH_HOST`. Mientras no lo crees, el despliegue es
exactamente el de siempre. En cuanto lo crees (paso 2.1), cada despliegue sube
primero a Namecheap y después a HostArmada.

Detalles que conviene saber:

- Van **después** del despliegue de Namecheap a propósito: si HostArmada falla, el
  despliegue sale en rojo y lo ves, pero la web real ya se actualizó.
- Si creas `HA_SSH_HOST` pero olvidas otro secreto, el paso falla con un mensaje
  que dice cuál falta («Falta el secreto HA_SSH_PORT…»).
- Usan las mismas opciones que el de Namecheap. `--delete` retira del servidor lo
  que ya no existe en el sitio; `.well-known/` guarda la validación del
  certificado SSL (borrarla rompe el HTTPS en la siguiente renovación) y
  `cgi-bin/` es de cPanel. Ambos están excluidos.

### 2.3 Primero simulando, luego en real

1. Con los cinco secretos ya creados, ve a **GitHub → Actions → «Desplegar en
   cPanel (Namecheap)» → Run workflow →** marca **Simular** → Run.
2. Abre la ejecución y mira el paso **«Sincronizar con HostArmada»**: te lista qué
   subiría **y qué borraría**. Los archivos de bienvenida de HostArmada (un
   `index.html` de «sitio en construcción», por ejemplo) aparecerán como
   «deleting»: es lo esperado. El de Namecheap también corre, pero también en
   simulación: no toca nada.
3. Si el listado es razonable, vuelve a lanzar **sin** marcar Simular. La primera
   subida son ~125 MB: unos minutos. Las siguientes solo mandan lo que cambia.

### 2.4 Probar HostArmada antes de que nadie lo vea

**A) Automático — el script del proyecto.** Comprueba redirecciones, 404, tipo del
manifiesto, caché y compresión, pidiendo el dominio de siempre pero
conectando a la IP nueva:

```bash
node scripts/comprobar-hosting.mjs --ip IP_DEL_SERVIDOR
```

Debe terminar con **0 fallos**. Cada ✖ es algo concreto que arreglar (mira la
tabla de la sección 2.5). Los ▲ son avisos que no impiden publicar. Con `--ip` no
valida el certificado, porque aún no existe en el servidor nuevo.

**B) Verlo con tus ojos — archivo `hosts` de Windows.** Le dice a *tu* ordenador
que el dominio está en la IP nueva, sin tocar el DNS real:

1. Abre **Bloc de notas como administrador** (clic derecho → *Ejecutar como
   administrador*).
2. Archivo → Abrir → `C:\Windows\System32\drivers\etc\hosts` (elige «Todos los archivos»).
3. Añade al final: `IP_DEL_SERVIDOR gotomachupicchuperu.com www.gotomachupicchuperu.com`
4. Guarda y, en PowerShell: `ipconfig /flushdns`
5. Abre `https://gotomachupicchuperu.com/`. **Saldrá un aviso de certificado**
   (normal: aún no hay certificado en HostArmada); acéptalo solo para probar.
6. Navega: portada, un tour, un destino, `/es/no-existe/` (debe salir la página 404 propia).
7. **Cuando termines, borra esa línea del `hosts`** y repite `ipconfig /flushdns`,
   o tu ordenador seguirá viendo HostArmada mientras el resto del mundo ve otra cosa.

### 2.5 Si algo falla

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Todo da 404 o sale la página de bienvenida del hosting | Carpeta raíz equivocada | Revisa `HA_SSH_TARGET_DIR` (paso 1.2) |
| Las redirecciones (`/`, `www`, HTTPS) no funcionan | El servidor ignora `.htaccess` | Pregunta 4 a soporte: hay que activar `AllowOverride` |
| Error 500 en todo el sitio | Un módulo del `.htaccess` no está | Pide a soporte el error exacto del log; los bloques `IfModule` ya protegen los módulos opcionales |
| `/es/no-existe/` da 200 o la página del hosting | `ErrorDocument` no aplicado | Igual que la 2ª fila |
| `manifest.webmanifest` no baja como `application/manifest+json` | Falta el `AddType` | Igual que la 2ª fila |
| Bucle de redirecciones | HTTPS detrás de un proxy | Avisa: el `.htaccess` ya contempla `X-Forwarded-Proto` |
| `rsync` pide contraseña / «Permission denied» | Clave no autorizada | Repite el paso 1.4 (punto 3: **Autorizar**) |
| «Connection timed out» | Puerto SSH equivocado o SSH desactivado | Preguntas 1 y 2 |

### Si no hay SSH

Tres alternativas, de más a menos recomendable:

1. **Pedirlo/activarlo con soporte** (suele ser un cambio de un minuto).
2. **Subida manual con ZIP** (siempre funciona): en tu equipo `npm run build`,
   comprime el **contenido** de la carpeta `out/` en un `.zip`, y en cPanel →
   **Administrador de archivos** → carpeta raíz → **Cargar** → clic derecho en el
   zip → **Extraer**. Es 100 % manual: cada «Publicar cambios» del panel dejaría
   de llegar solo a la web.
3. **FTPS desde GitHub Actions.** ⚠️ En Namecheap se probó dos veces y el servidor
   cortaba la conexión a mitad de subida (ver `docs/despliegue.md`); en
   HostArmada puede ir distinto, pero un corte deja el sitio **a medias**. Solo
   con una simulación previa y sabiendo cómo restaurar.

---

## 6. Fase 3 — El correo (lo más delicado)

**Por qué necesita cuidado:** hoy todo el correo `@gotomachupicchuperu.com` entra
en el servidor de Namecheap. En cuanto cambies el DNS, empezará a entrar en
HostArmada. Lo que ya está guardado en Namecheap **no se mueve solo**.

### 3.1 Copiar los mensajes existentes

Elige **una** vía (de más fácil a más técnica):

- **Pedírselo a HostArmada** (pregunta 7). Muchos lo hacen gratis. Dales las
  credenciales IMAP del buzón viejo.
- **Thunderbird (gratis, sin comandos):**
  1. Instala Thunderbird y añade **las dos cuentas** (la de Namecheap y la de
     HostArmada) como **IMAP**. Servidores: el correo de bienvenida de cada
     hosting; suelen ser `mail.gotomachupicchuperu.com`, pero cada cuenta muestra los
     suyos en cPanel → *Cuentas de correo → Conectar dispositivos*.
  2. Arrastra las carpetas (Recibidos, Enviados…) de una cuenta a la otra.
  3. Espera a que termine (puede tardar con muchos mensajes).
- **`imapsync` (técnico, buzones grandes):**

  ```bash
  imapsync --host1 mail.gotomachupicchuperu.com --user1 reservas@gotomachupicchuperu.com --password1 'CLAVE_VIEJA' --ssl1 --host2 SERVIDOR_NUEVO --user2 reservas@gotomachupicchuperu.com --password2 'CLAVE_NUEVA' --ssl2
  ```

### 3.2 Hazlo DOS veces

1. **Antes del cambio de DNS**: copia el grueso.
2. **Después** (Fase 4-5): repite para traer lo que llegó al servidor viejo durante
   las horas de propagación. Los duplicados no se generan: las herramientas
   comparan mensajes.

### 3.3 SPF, DKIM y DMARC (que tus correos no caigan en spam)

Hoy tu SPF autoriza el servidor de Namecheap (`include:spf.web-hosting.com` y sus
IPs). **Ese registro NO debe copiarse a HostArmada**: lo correcto es el que genere
HostArmada para sus servidores.

**Dónde:** cPanel de HostArmada → **Entregabilidad del correo** (*Email
Deliverability*) → debe mostrar **SPF** y **DKIM** en verde. Si sale «Reparar»
(*Repair*), púlsalo. Mantén el DMARC actual (`v=DMARC1; p=none;`): no bloquea
nada y sirve para empezar a recibir informes.

### 3.4 Reconfigurar dónde lees el correo

- [ ] **Móvil/Outlook/Thunderbird:** actualiza servidor entrante y saliente y la
      contraseña nueva.
- [ ] **Gmail que lee `reservas@` (si lo usas):** *Ajustes → Cuentas → Consultar
      correo de otras cuentas / Enviar como*: cambia servidor y contraseña.
- [ ] **Reenvíos y respuestas automáticas:** recréalos en HostArmada (paso 1.5).

---

## 7. Fase 4 — El cambio de DNS (día D)

**Cuándo:** un martes-jueves por la mañana. Nunca viernes ni fin de semana: si algo
falla, quieres soporte de ambos lados disponible.

**Requisitos antes de empezar:**

- [ ] `node scripts/comprobar-hosting.mjs --ip IP` da **0 fallos**
- [ ] Los buzones existen en HostArmada y la copia inicial está hecha (Fase 3)
- [ ] Tienes a mano los datos de la tabla de la sección 2

### 4.1 Recrear la zona DNS en HostArmada

**Dónde:** cPanel de HostArmada → **Editor de zona** (*Zone Editor*) → **Administrar**
(*Manage*) del dominio.

Al añadir un dominio, cPanel genera casi todo solo (A, MX, SPF, DKIM, `mail`,
`ftp`, `cpanel`…). **Comprueba que estén y añade lo que falte:**

| Registro | Debe valer |
|---|---|
| **A** `@` | la IP de HostArmada (**no** `162.0.232.31`) |
| **CNAME** `www` | `gotomachupicchuperu.com` |
| **MX** `@` | los servidores de correo de HostArmada (los pone cPanel) |
| **TXT** `@` (SPF) | el que genere HostArmada (**no** el de Namecheap) |
| **TXT** `@` (Search Console) | **copia exacta:** `google-site-verification=Ed46BAMrHr0ko-o9Cc44hk4Xpw40wiylxYJHs7ZbmhY` |
| **TXT** `_dmarc` | `v=DMARC1; p=none;` |

> ⚠️ **El TXT de Google Search Console es el que casi todos olvidan.** Sin él,
> Search Console pierde la verificación del sitio. Cópialo carácter a carácter.

Para ver todos los registros actuales en Namecheap (por si hubiera alguno más):
cPanel de Namecheap → **Editor de zona** → **Administrar**. Los registros que
apuntan a `162.0.232.x` o a `jellyfish.systems` son de Namecheap y **no se copian**.

### 4.2 Cambiar los nameservers en Namecheap

Primero hay que **encontrar los nameservers correctos de tu hospedaje** — los del
servidor donde vive el sitio (`naca1.armadaservers.com`), no los que aparecían en
*Dominios → Transferencia* del Área de Cliente (esos son del sistema de registro
de dominios de HostArmada, un servicio que no estás usando).

**Dónde encontrarlos** ([fuente](https://hostarmada.com/kb/domain-and-dns/where-can-i-find-my-nameservers/)):

1. En el **Área de Cliente** (el panel morado, `Salpicadero`) → **Mis servicios**.
2. Haz clic en tu paquete de hospedaje (el que tiene `naca1.armadaservers.com`).
3. En esa página, junto a la fecha de próximo vencimiento, hay un icono de
   medidor/velocímetro — pulsa ahí. Se abre la información del servidor, y ahí están
   los **nameservers** (normalmente dos, del estilo `ns1…` / `ns2…`).
4. Si no los ves, están también en el correo **«Welcome to HostArmada»**: icono de
   sobre (✉) arriba a la derecha del Área de Cliente → historial de correos.

Con esos dos nameservers (no los de la pantalla de Dominios):

**Dónde:** [namecheap.com](https://www.namecheap.com) → **Domain List** →
`gotomachupicchuperu.com` → **Manage** → sección **Nameservers**.

1. Hoy dice «Namecheap Web Hosting DNS» (o «Custom DNS» con `dns1/dns2.namecheaphosting.com`).
2. Cámbialo a **Custom DNS**.
3. Escribe los **dos nameservers de HostArmada** del paso anterior.
4. Pulsa el ✔ para guardar.

Desde este momento el mundo empieza a resolver hacia HostArmada. Tarda entre 30
minutos y 24 h según cada proveedor de internet.

> **Alternativa (opcional): Cloudflare.** Si prefieres que tu DNS **no dependa
> nunca más de un hosting** (así el próximo cambio sería solo editar un registro
> A), puedes poner los nameservers de Cloudflare (plan gratuito) en lugar de los
> de HostArmada. Requiere recrear la zona allí y desactivar el proxy naranja de
> los registros de correo. Es más trabajo ahora y menos después; no es necesario
> para migrar.

### 4.3 Mientras se propaga

- Las **dos webs sirven lo mismo** (gracias al despliegue doble). Nadie ve nada roto.
- **No cambies contenido** si puedes evitarlo en las próximas horas.
- Para ver hacia dónde resuelve tu ordenador:

  ```bash
  nslookup -type=NS gotomachupicchuperu.com 8.8.8.8
  ```

  Debe mostrar los nameservers de HostArmada. Comprueba también en
  [dnschecker.org](https://dnschecker.org) (escribe el dominio, tipo **NS**).

### 4.4 El certificado HTTPS

**Dónde:** cPanel de HostArmada → **Estado de SSL/TLS** (*SSL/TLS Status*) →
**Ejecutar AutoSSL** (*Run AutoSSL*).

Solo puede emitirse cuando el DNS ya apunta a HostArmada: puede haber unos
minutos (o hasta ~1 h) con aviso de certificado en los navegadores que ya
resuelvan al servidor nuevo. Si a las 2 h sigue sin candado, avisa a soporte.

Cuando esté, ejecuta la comprobación **sin** `--ip` (ahora sí valida el certificado):

```bash
node scripts/comprobar-hosting.mjs
```

Debe dar **0 fallos** y «Certificado válido y cubre el dominio y www».

---

## 8. Fase 5 — Después del cambio (primeras 72 horas)

- [ ] **Correo:** envía un mensaje **a** `reservas@…` desde Gmail y otro **desde**
      `reservas@…` a Gmail. Comprueba que llegan y que no caen en spam.
- [ ] **Copia final del correo** (paso 3.2, segunda pasada).
- [ ] **Panel `/admin`:** entra, sube una imagen, edita un texto y pulsa
      **«Publicar cambios»**. En ~3 min debe verse en la web. Esto confirma que
      Supabase → GitHub → HostArmada funciona de punta a punta.
- [ ] **Search Console:** entra en https://search.google.com/search-console →
      la propiedad debe seguir «verificada». Si no, verifica de nuevo con el TXT
      del paso 4.1. Luego: **Sitemaps** → reenvía `sitemap.xml`, y **Inspección de
      URL** → `https://gotomachupicchuperu.com/es/` → **Solicitar indexación**.
      Vigila **Ajustes → Estadísticas de rastreo** unos días por errores 5xx.
- [ ] **Redirecciones:** `node scripts/comprobar-hosting.mjs` sin fallos.
- [ ] **Móviles/aplicaciones:** que ya no tengan la configuración antigua del correo.

---

## 9. Fase 6 — Limpieza del repositorio y de Namecheap

Hazla **cuando llevas 7-14 días sin incidencias**, no antes.

### 6.1 Que HostArmada sea el único destino

En **GitHub → Settings → Secrets**, sustituye los valores de Namecheap por los de
HostArmada **con los mismos nombres**, y borra los `HA_*`:

| Secreto (nombre definitivo) | Nuevo valor |
|---|---|
| `SSH_HOST` | el que era `HA_SSH_HOST` |
| `SSH_USER` | el que era `HA_SSH_USER` |
| `SSH_PORT` | el que era `HA_SSH_PORT` |
| `SSH_KEY` | el que era `HA_SSH_KEY` |
| `SSH_TARGET_DIR` | el que era `HA_SSH_TARGET_DIR` |

Después, en `deploy-cpanel.yml`, **borra** los dos pasos de HostArmada, el `env:` con `HA_SSH_HOST` del principio del
trabajo y la referencia a `id_hostarmada` en el último paso. **No renombres el archivo del workflow:**
el botón «Publicar cambios» del panel enlaza a `deploy-cpanel.yml`
(`src/components/admin/BarraPublicar.tsx`). Sí puedes cambiar el `name:` de la
primera línea a `Desplegar en cPanel (HostArmada)`.

### 6.2 Cambiar los textos que nombran a Namecheap

La política de privacidad dice que **Namecheap aloja el sitio**. Hay que corregirlo:

```bash
grep -rn "Namecheap" src docs DEPLOY.md
```

Sustituye por **HostArmada** en `src/data/legal.ts` (líneas ~214-216, en los tres
idiomas), y actualiza `docs/despliegue.md` y `docs/panel-admin.md`. Después:

```bash
npm run build
```

Comprueba `/es/legal/privacidad/` y haz commit y push.

### 6.3 Seguridad

- [ ] Borra de tu equipo `despliegue`, `despliegue.pub`, `despliegue-hostarmada`
      y `despliegue-hostarmada.pub`.
- [ ] En el cPanel de **Namecheap → Acceso SSH → Claves**, **borra** la clave de
      despliegue antigua (ya no hace falta).
- [ ] Cambia la contraseña del cPanel de HostArmada por una propia y guárdala en tu
      gestor de contraseñas.

### 6.4 Cancelar el hosting de Namecheap (sin cancelar el dominio)

1. Comprueba **cuándo vence** el hosting y **no lo renueves**.
2. **Nunca canceles el dominio:** es el `gotomachupicchuperu.com` y vence el
   2027-09-01. Solo se cancela el *hosting* (Namecheap → **Hosting List**).
3. Cuando el hosting caduque, la zona DNS vieja desaparece; no importa, porque ya
   usas la de HostArmada.

---

## 10. Plan de vuelta atrás

| Si el problema aparece… | Cómo volver |
|---|---|
| **En la Fase 2** (pruebas) | No hace falta nada: el sitio real sigue en Namecheap. Quita la línea del `hosts`. |
| **Tras cambiar los nameservers** | Namecheap → **Manage → Nameservers → Namecheap Web Hosting DNS** (o `dns1.namecheaphosting.com` / `dns2.namecheaphosting.com`). En 1-24 h todo vuelve al hosting viejo, que sigue con la web y el correo intactos **mientras no lo hayas cancelado**. |
| **El correo pierde mensajes** | Los mensajes que llegaron al servidor nuevo siguen en HostArmada: cópialos con la segunda pasada del paso 3.2. |

**Por eso no se cancela Namecheap hasta pasar 7-14 días sin problemas.**

---

## 11. Cronograma sugerido

| Día | Qué | Riesgo |
|---|---|---|
| **1** | Preguntas a soporte, contratar, fases 1.1-1.5 | Ninguno |
| **2** | Secretos, doble despliegue, simulación y subida real (2.1-2.3) | Ninguno |
| **3** | Pruebas con `hosts` y `comprobar-hosting.mjs` (2.4-2.5), buzones creados y primera copia de correo | Ninguno |
| **4** (mar-jue, mañana) | **Día D:** zona DNS + nameservers (4.1-4.2), AutoSSL (4.4) | Bajo |
| **4-5** | Pruebas de Fase 5, segunda copia de correo | Bajo |
| **6-18** | Observación (Search Console, correo, panel) | Ninguno |
| **~18** | Limpieza (Fase 6), cancelar hosting de Namecheap | Ninguno |

---

## 12. Referencia rápida

### Comprobar cosas

```bash
node scripts/comprobar-hosting.mjs
```

```bash
node scripts/comprobar-hosting.mjs --ip IP_DEL_SERVIDOR
```

```bash
nslookup -type=NS gotomachupicchuperu.com 8.8.8.8
```

```bash
nslookup -type=MX gotomachupicchuperu.com 8.8.8.8
```

```bash
nslookup -type=TXT gotomachupicchuperu.com 8.8.8.8
```

### Qué toca cada pieza si vuelve a mudarse el sitio

| Pieza | Qué cambiar |
|---|---|
| Destino del despliegue | Los 5 secretos `SSH_*` de GitHub |
| DNS | Registro A (y MX si cambia el correo) |
| Certificado | AutoSSL del hosting nuevo |
| Contenido, imágenes, login, «Publicar» | **Nada** (Supabase y GitHub) |
| URL pública en el build | `NEXT_PUBLIC_SITE_URL` en el workflow (solo si cambia el dominio) |

### Errores típicos y su causa

| Error | Causa |
|---|---|
| El sitio sale sin estilos ni imágenes | Se compiló con un `BASE_PATH` que no toca (en el dominio raíz debe estar vacío) |
| Todo sale en 404 tras subir | Carpeta raíz equivocada (paso 1.2) |
| «Publicar cambios» no actualiza la web | Los secretos `SSH_*` no apuntan al servidor correcto |
| Search Console pide verificar de nuevo | Falta el TXT `google-site-verification` en el DNS nuevo (paso 4.1) |
| Correos que llegan a spam | SPF/DKIM sin reparar en HostArmada (paso 3.3) |
| Certificado caducado tras meses | Se borró `.well-known/` del servidor: revisa las exclusiones del `rsync` |

### Documentación relacionada

- `docs/despliegue.md` — cómo funciona el despliegue (y por qué SSH y no FTP)
- `docs/panel-admin.md` — cómo funciona «Publicar cambios»
- `scripts/comprobar-hosting.mjs` — la comprobación automática de esta guía
