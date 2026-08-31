# Fase 2 — Reparar lo que no funcionaba

Dos funciones que el visitante veía y que no respondían. Ambas fallaban en
silencio: nadie recibía un error, simplemente no pasaba nada.

---

## 1. El buscador no encontraba nada

### Qué pasaba

`SearchDialog` pedía los resultados a `/api/tours`. Esa ruta se eliminó al
convertir el sitio a export estático, así que respondía 404 y la lista salía
siempre vacía. Comprobado en producción antes de tocar nada:

```
GET /mapi/api/tours?q=machu  →  HTTP 404
```

Lo llamativo es que **el componente ya recibía el catálogo entero como prop**.
Los datos estaban ahí; se pedían por red sin necesidad.

### Qué se hizo

La búsqueda se resuelve en el navegador, sobre los datos que ya vienen con la
página. Al no haber petición, tampoco hace falta *debounce* ni indicador de
carga: el resultado sale en la misma pulsación.

Piezas nuevas, en `src/lib/catalog.ts`:

| | |
|---|---|
| `toBriefCatalog(categorias, idioma)` | Deja el catálogo en un solo idioma y solo con los campos que el menú y el buscador pintan |
| `searchTours(catalogo, consulta)` | Busca y ordena por relevancia |
| `normalize(texto)` | Quita tildes y pasa a minúsculas |

**Orden de los resultados.** Se puntúa según dónde cae la coincidencia:
empieza por el término (10), empieza una palabra (6), aparece suelto (2), y a
igualdad manda la valoración. Sin ese orden, buscar «machu» devolvía primero
cualquier tour cuya *categoría* fuese Machu Picchu, en vez del propio Machu
Picchu.

**Tildes.** Se normaliza con `NFD` y se descartan los diacríticos, así
«canon colca» encuentra «Cañón del Colca». Un buscador que exige escribir la
ñ no lo usa nadie desde un teclado extranjero.

### El menú móvil tenía su propio buscador

Filtraba por su cuenta, con otro criterio, así que la misma consulta daba
resultados distintos en móvil y en escritorio. Ahora ambos llaman a
`searchTours`.

### Comprobación

```bash
npm run verificar:busqueda
```

Corre 10 casos contra los datos reales del catálogo. Existe porque este fallo
estuvo activo sin que nadie lo notara, y no debería poder repetirse en
silencio.

---

## 2. Enviar un formulario no confirmaba nada

### Qué pasaba

Los tres formularios —reserva, ficha de tour y contacto— hacían
`window.open(whatsapp)` y ahí terminaba todo. Sin aviso de envío, de éxito ni
de error. Si el navegador bloqueaba la ventana, cosa habitual en móvil, la
persona creía haber enviado su reserva y no había salido nada.

Las claves `successTitle`, `successBody` y `submitting` estaban traducidas a
los tres idiomas y **no se usaban en ningún sitio**: la pantalla de
confirmación se había planificado y nunca se conectó.

### Qué se hizo

Al enviar, la confirmación sustituye al formulario en su mismo hueco. Muestra
el resumen de lo que se envía, un enlace directo a WhatsApp y un botón para
empezar de nuevo.

Piezas nuevas:

- `src/hooks/useWhatsappSend.ts` — el envío y su estado.
- `src/components/ui/SentPanel.tsx` — la pantalla de confirmación.

### Por qué no se detecta si el navegador bloqueó la ventana

Parece que bastaría con mirar lo que devuelve `window.open`: `null` si la
bloquearon. Pero con la opción `noopener` la especificación obliga a devolver
`null` **siempre**, se haya abierto o no. Ese valor no distingue un caso del
otro, y quitar `noopener` para poder distinguirlos abre un agujero conocido a
cambio de nada.

Así que no se adivina: la confirmación **siempre** muestra el enlace directo.
Si WhatsApp se abrió, sobra; si no, resuelve. Es más simple y no falla.

### Un detalle que evita que se desincronicen

El resumen que ve la persona y el mensaje que se manda por WhatsApp salen de
la misma función `resumen()`. Si se construyeran por separado, tarde o
temprano mostrarían cosas distintas.

### Accesibilidad

La confirmación recibe el foco al aparecer y se anuncia con `role="status"`:
quien navega con teclado o lector de pantalla no ve que la pantalla cambió.
El buscador también anuncia el número de resultados por la misma razón.

---

## Efecto secundario: el sitio adelgazó

La cabecera se monta en todas las páginas y recibía el catálogo completo: los
70 tours en tres idiomas, con itinerario día a día y lista de «qué incluye».
Un menú no usa nada de eso, pero viajaba en el HTML de cada página.

Al localizar el catálogo en el servidor y dejar solo los campos que se pintan:

| Página | Antes | Después | |
|---|---|---|---|
| Inicio | 358 KB | 233 KB | −35 % |
| Listado de tours | 427 KB | 303 KB | −29 % |
| Ficha de tour | 351 KB | 229 KB | −35 % |

En el inicio ya no queda **ni un solo** texto en inglés o portugués.

Esto era trabajo previsto para la fase 3. Lo que queda de esa fase es el
listado de tours, que todavía recibe el catálogo completo por su cuenta.

---

## Cómo se comprobó

| | |
|---|---|
| Buscador | `npm run verificar:busqueda` — 10 casos sobre datos reales |
| Formulario vacío | No envía y muestra los 4 errores |
| Formulario completo | Avance 4/4, URL de WhatsApp correcta, formulario sustituido por la confirmación con el resumen completo |
| Foco | La confirmación recibe el foco al aparecer |
| Peso | Medido sobre el HTML generado, antes y después |
