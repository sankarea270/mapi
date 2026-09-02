/**
 * Genera out/index.html: la página que ve quien escribe el dominio pelado.
 *
 * Con `output: export` y rutas bajo [locale], Next no crea ningún index.html
 * en la raíz. Sin este archivo, gotomachupicchuperu.com/ devuelve 404.
 *
 * Antes lo creaba el workflow de GitHub Pages, así que solo existía en ese
 * despliegue: al publicar en Appwrite o en cualquier otro sitio, la portada
 * del dominio quedaba rota. Generarlo en el build lo arregla en todas partes.
 *
 * Elige idioma según el navegador y cae al idioma por defecto. La redirección
 * va también en <meta refresh> para que funcione sin JavaScript, y el enlace
 * visible cubre el caso de que ambas cosas fallen.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const LOCALES = ["es", "en", "pt"];
const DEFAULT = "es";
const BASE = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

const html = `<!doctype html>
<html lang="${DEFAULT}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>GoToMapi</title>
<link rel="canonical" href="${BASE}/${DEFAULT}/">
<meta http-equiv="refresh" content="0;url=${BASE}/${DEFAULT}/">
<script>
(function () {
  var admitidos = ${JSON.stringify(LOCALES)};
  var preferidos = navigator.languages || [navigator.language || "${DEFAULT}"];
  var elegido = "${DEFAULT}";
  for (var i = 0; i < preferidos.length; i++) {
    var corto = String(preferidos[i]).toLowerCase().slice(0, 2);
    if (admitidos.indexOf(corto) !== -1) { elegido = corto; break; }
  }
  // replace() y no href: así el botón "atrás" no vuelve a esta página y
  // deja al visitante en un bucle de redirecciones.
  location.replace("${BASE}/" + elegido + "/");
})();
</script>
</head>
<body style="font:16px/1.6 system-ui,sans-serif;margin:0;display:grid;place-items:center;min-height:100dvh;color:#0f3736">
<p><a href="${BASE}/${DEFAULT}/">Ir a GoToMapi</a></p>
</body>
</html>
`;

await writeFile(join(process.cwd(), "out", "index.html"), html, "utf8");
console.log(`out/index.html generado (base "${BASE || "/"}", idiomas ${LOCALES.join(", ")})`);
