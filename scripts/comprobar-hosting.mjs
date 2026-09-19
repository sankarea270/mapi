/**
 * Comprueba que un hosting sirve el sitio como debe. Solo lee: no toca nada.
 *
 *   node scripts/comprobar-hosting.mjs
 *   node scripts/comprobar-hosting.mjs --ip 203.0.113.10
 *   node scripts/comprobar-hosting.mjs --dominio otro-dominio.com
 *
 * Sirve para dos momentos de una migración:
 *
 *  · ANTES de cambiar el DNS, con `--ip <IP del hosting nuevo>`. Se conecta
 *    directamente a esa máquina pero pidiendo el dominio de siempre, que es lo
 *    que hará el navegador cuando el DNS ya apunte allí. Como el certificado
 *    del dominio todavía no existe en el servidor nuevo, en este modo no se
 *    valida el certificado (se avisa de ello en el resumen).
 *
 *  · DESPUÉS del cambio, sin argumentos, para confirmar que todo sigue igual.
 *
 * Cada prueba corresponde a algo que el sitio necesita del servidor y que un
 * hosting nuevo puede tener distinto: las redirecciones del .htaccess, el
 * estado real 404, el tipo del manifiesto, la caché, la compresión y el
 * certificado. Sin dependencias: solo módulos de Node.
 */
import http from "node:http";
import https from "node:https";
import tls from "node:tls";
import { argv, exit } from "node:process";

const arg = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined);
const DOMINIO = arg("--dominio") ?? "gotomachupicchuperu.com";
const IP = arg("--ip");

/** Una petición sin seguir redirecciones. Con IP, se conecta a ella pero pide el dominio. */
function pedir(ruta, { https: seguro = true, host = DOMINIO, headers = {}, metodo = "GET" } = {}) {
  return new Promise((resolver) => {
    const cliente = seguro ? https : http;
    const opciones = {
      host: IP ?? host,
      port: seguro ? 443 : 80,
      path: ruta,
      method: metodo,
      headers: { host, "user-agent": "comprobar-hosting/1.0", ...headers },
      timeout: 20000,
      ...(seguro ? { servername: host, rejectUnauthorized: !IP } : {}),
    };
    const req = cliente.request(opciones, (res) => {
      const trozos = [];
      res.on("data", (c) => trozos.length < 40 && trozos.push(c));
      res.on("end", () =>
        resolver({ estado: res.statusCode, cab: res.headers, cuerpo: Buffer.concat(trozos).toString("utf8") })
      );
    });
    req.on("timeout", () => req.destroy(new Error("tiempo agotado")));
    req.on("error", (e) => resolver({ error: e.message }));
    req.end();
  });
}

const resultados = [];
function prueba(nombre, ok, detalle = "", critica = true) {
  resultados.push({ nombre, ok, detalle, critica });
}

console.log(`\nComprobando ${DOMINIO}${IP ? `  (forzando la conexión a ${IP})` : ""}\n`);

// 1 · HTTPS y redirecciones de dominio
const http1 = await pedir("/es/", { https: false });
prueba(
  "HTTP redirige a HTTPS (301)",
  http1.estado === 301 && /^https:\/\//.test(http1.cab?.location ?? ""),
  http1.error ?? `${http1.estado} → ${http1.cab?.location}`
);

const www = await pedir("/es/", { https: false, host: `www.${DOMINIO}` });
prueba(
  "www redirige al dominio sin www (301)",
  www.estado === 301 && (www.cab?.location ?? "").startsWith(`https://${DOMINIO}/`),
  www.error ?? `${www.estado} → ${www.cab?.location}`
);

// 2 · La raíz elige idioma en el servidor
for (const [cab, esperado] of [
  ["", "/es/"],
  ["es-ES,es;q=0.9", "/es/"],
  ["en-US,en;q=0.9", "/en/"],
  ["pt-BR,pt;q=0.9", "/pt/"],
]) {
  const r = await pedir("/", { headers: cab ? { "accept-language": cab } : {} });
  prueba(
    `Raíz con «${cab || "sin idioma"}» → ${esperado} (302)`,
    r.estado === 302 && (r.cab?.location ?? "").endsWith(esperado),
    r.error ?? `${r.estado} → ${r.cab?.location ?? "-"}`
  );
}
const fr = await pedir("/", { headers: { "accept-language": "fr-FR,fr;q=0.9" } });
prueba("Raíz con idioma no admitido cae al index.html (200)", fr.estado === 200, fr.error ?? String(fr.estado));

// 3 · Páginas y 404 real
const portada = await pedir("/es/");
prueba("/es/ responde 200 con HTML", portada.estado === 200 && /<title>/.test(portada.cuerpo), portada.error ?? String(portada.estado));

const e404 = await pedir("/es/esto-no-existe/");
prueba(
  "Una dirección inexistente da 404 (no 200) con la página propia",
  e404.estado === 404 && /404/.test(e404.cuerpo),
  e404.error ?? `${e404.estado}${/Esta página no existe|This page doesn't exist/.test(e404.cuerpo) ? " · página propia" : " · ¡página por defecto del servidor!"}`
);

// 4 · Archivos de marca y de buscadores
const manif = await pedir("/manifest.webmanifest");
prueba(
  "manifest.webmanifest con tipo application/manifest+json",
  manif.estado === 200 && /manifest\+json/.test(manif.cab?.["content-type"] ?? ""),
  manif.error ?? `${manif.estado} · ${manif.cab?.["content-type"]}`
);
for (const [ruta, tipo] of [["/favicon.ico", /icon|octet/], ["/icon.png", /png/], ["/apple-icon.png", /png/], ["/icons/icon-maskable-512.png", /png/]]) {
  const r = await pedir(ruta);
  prueba(`${ruta} existe`, r.estado === 200 && tipo.test(r.cab?.["content-type"] ?? ""), r.error ?? `${r.estado} · ${r.cab?.["content-type"]}`);
}
const robots = await pedir("/robots.txt");
prueba("robots.txt enseña el sitemap", robots.estado === 200 && robots.cuerpo.includes(`https://${DOMINIO}/sitemap.xml`), robots.error ?? String(robots.estado));
const sitemap = await pedir("/sitemap.xml");
prueba("sitemap.xml lista páginas del dominio", sitemap.estado === 200 && sitemap.cuerpo.includes(`https://${DOMINIO}/es/`), sitemap.error ?? String(sitemap.estado));

// 5 · Caché y compresión (lo que el .htaccess pide y no todo hosting concede)
const js = (portada.cuerpo.match(/\/_next\/static\/[^"']+\.js/) ?? [])[0];
if (js) {
  const r = await pedir(js);
  const cc = r.cab?.["cache-control"] ?? "";
  const segundos = Number((cc.match(/max-age=(\d+)/) ?? [])[1] ?? 0);
  /* Vale cualquiera de las tres formas de decir «para siempre»: `immutable`,
     un max-age de un año o más, o una cabecera Expires lejana (que es lo que
     manda mod_expires en algunos servidores). */
  const caduca = r.cab?.expires ? (new Date(r.cab.expires) - Date.now()) / 1000 : 0;
  prueba(
    "Los archivos con hash de /_next/ se cachean ≥ 1 año",
    r.estado === 200 && (/immutable/.test(cc) || segundos >= 31536000 || caduca >= 31536000),
    `${cc || "sin cabecera cache-control"}${r.cab?.expires ? ` · expires ${r.cab.expires}` : ""}`,
    false
  );
} else {
  prueba("Los archivos con hash de /_next/ se cachean ≥ 1 año", false, "no se encontró ningún .js en la portada", false);
}
const gz = await pedir("/es/", { headers: { "accept-encoding": "gzip, br" } });
prueba("El HTML se envía comprimido", /gzip|br/.test(gz.cab?.["content-encoding"] ?? ""), gz.cab?.["content-encoding"] ?? "sin compresión", false);
const html = await pedir("/es/", { metodo: "HEAD" });
prueba(
  "El HTML no se cachea de forma agresiva",
  /must-revalidate|no-cache|max-age=0/.test(html.cab?.["cache-control"] ?? ""),
  html.cab?.["cache-control"] ?? "sin cabecera cache-control",
  false
);

// 6 · Certificado (solo con conexión normal: con --ip todavía no existe en el servidor nuevo)
if (!IP) {
  const cert = await new Promise((resolver) => {
    const s = tls.connect({ host: DOMINIO, port: 443, servername: DOMINIO }, () => {
      const c = s.getPeerCertificate();
      s.end();
      resolver(c);
    });
    s.on("error", (e) => resolver({ error: e.message }));
  });
  if (cert.error) prueba("Certificado HTTPS válido", false, cert.error);
  else {
    const dias = Math.round((new Date(cert.valid_to) - Date.now()) / 86400000);
    const cubre = (cert.subjectaltname ?? "").includes(`DNS:${DOMINIO}`) && (cert.subjectaltname ?? "").includes(`DNS:www.${DOMINIO}`);
    prueba(
      "Certificado válido y cubre el dominio y www",
      dias > 14 && cubre,
      `emite ${cert.issuer?.O ?? "?"} · caduca en ${dias} días · ${cubre ? "cubre www" : "NO cubre www"}`
    );
  }
}

// ── Resumen ─────────────────────────────────────────────────────────────
let criticos = 0;
for (const r of resultados) {
  const marca = r.ok ? "✔" : r.critica ? "✖" : "▲";
  console.log(`${marca}  ${r.nombre}${r.detalle ? `\n     ${r.detalle}` : ""}`);
  if (!r.ok && r.critica) criticos++;
}
const avisos = resultados.filter((r) => !r.ok && !r.critica).length;
console.log(
  `\n${resultados.filter((r) => r.ok).length}/${resultados.length} correctas · ${criticos} fallos · ${avisos} avisos (▲ no impiden publicar, pero conviene arreglarlos)`
);
if (IP) console.log("\nNota: con --ip no se valida el certificado; pruébalo de nuevo sin --ip cuando el DNS ya apunte al servidor nuevo.");
exit(criticos ? 1 : 0);
