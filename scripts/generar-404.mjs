/**
 * Genera out/404.html: la página que ve quien llega a una dirección que no existe.
 *
 * Apache la sirve con el estado 404 (`ErrorDocument 404 /404.html` en el
 * .htaccess). Hasta ahora era la de Next por defecto —«404: This page could
 * not be found.», en inglés, sobre fondo blanco y sin un solo enlace—, que es
 * justo lo que hace que alguien cierre la pestaña: quien llegó por un enlace
 * roto de Google o de un mensaje no tenía por dónde seguir.
 *
 * Se escribe a mano y no como página de Next por dos motivos:
 *
 *  · Con la exportación estática y las rutas bajo [locale], Next no puede
 *    dar una página 404 con la cabecera y el pie del sitio: no sabe en qué
 *    idioma está el visitante porque la dirección no existe.
 *  · Tiene que funcionar desde cualquier profundidad («/es/tours/no-existe/»,
 *    «/basura») y aunque el JavaScript del sitio no cargue. Por eso es un
 *    HTML autónomo: estilos dentro, rutas absolutas a la raíz y ni una
 *    dependencia de los archivos con hash de /_next/.
 *
 * Trae los tres idiomas y enseña el del visitante: el de la dirección si
 * empieza por /es/, /en/ o /pt/ y, si no, el del navegador. Sin JavaScript se
 * ve en español, y los otros dos idiomas quedan enlazados igualmente.
 *
 * El WhatsApp se lee de los ajustes del panel al compilar, como el resto del
 * sitio; si Supabase no responde, se usa el de reserva.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE = (process.env.BASE_PATH ?? "").replace(/\/$/, "");
const WHATSAPP_RESERVA = "51910915111";

async function leerWhatsapp() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !clave) return WHATSAPP_RESERVA;
  try {
    const r = await fetch(`${url}/rest/v1/site_settings?select=data&id=eq.1`, {
      headers: { apikey: clave, Authorization: `Bearer ${clave}` },
      signal: AbortSignal.timeout(6000),
    });
    const numero = String((await r.json())?.[0]?.data?.whatsapp ?? "").replace(/\D/g, "");
    return numero.length >= 8 ? numero : WHATSAPP_RESERVA;
  } catch {
    return WHATSAPP_RESERVA;
  }
}

const whatsapp = await leerWhatsapp();

const IDIOMAS = {
  es: {
    titulo: "Esta página no existe",
    texto:
      "Puede que el enlace haya cambiado o que la dirección tenga un error. Estos caminos te devuelven al viaje:",
    inicio: "Ir al inicio",
    enlaces: [
      ["Tours", "tours"],
      ["Destinos", "destinos"],
      ["Paquetes", "paquetes"],
      ["Experiencias", "experiencias"],
      ["Contacto", "contacto"],
    ],
    ayuda: "¿Buscabas algo concreto? Escríbenos y te lo encontramos.",
    wa: "Escribir por WhatsApp",
    mensaje: "Hola, no encontré una página en la web y quería hacerles una consulta",
    otros: "También en",
  },
  en: {
    titulo: "This page doesn't exist",
    texto: "The link may have changed, or the address may have a typo. These paths take you back to the trip:",
    inicio: "Go to the home page",
    enlaces: [
      ["Tours", "tours"],
      ["Destinations", "destinos"],
      ["Packages", "paquetes"],
      ["Experiences", "experiencias"],
      ["Contact", "contacto"],
    ],
    ayuda: "Looking for something specific? Message us and we'll find it for you.",
    wa: "Message us on WhatsApp",
    mensaje: "Hi, I couldn't find a page on the website and I'd like to ask something",
    otros: "Also in",
  },
  pt: {
    titulo: "Esta página não existe",
    texto: "O link pode ter mudado ou o endereço pode ter um erro. Estes caminhos levam você de volta à viagem:",
    inicio: "Ir para o início",
    enlaces: [
      ["Tours", "tours"],
      ["Destinos", "destinos"],
      ["Pacotes", "paquetes"],
      ["Experiências", "experiencias"],
      ["Contato", "contacto"],
    ],
    ayuda: "Procurava algo em particular? Escreva para nós e encontramos para você.",
    wa: "Falar pelo WhatsApp",
    mensaje: "Olá, não encontrei uma página no site e gostaria de fazer uma pergunta",
    otros: "Também em",
  },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

const bloque = (cod, t, oculto) => `
    <section lang="${cod}" data-idioma="${cod}"${oculto ? " hidden" : ""}>
      <h1>${esc(t.titulo)}</h1>
      <p class="texto">${esc(t.texto)}</p>
      <p><a class="boton" href="${BASE}/${cod}/">${esc(t.inicio)}</a></p>
      <ul class="enlaces">
        ${t.enlaces.map(([n, r]) => `<li><a href="${BASE}/${cod}/${r}/">${esc(n)}</a></li>`).join("\n        ")}
      </ul>
      <p class="ayuda">${esc(t.ayuda)}
        <a class="wa" href="https://wa.me/${whatsapp}?text=${encodeURIComponent(t.mensaje)}" rel="noopener">${esc(t.wa)}</a>
      </p>
      <p class="otros">${esc(t.otros)}:
        ${Object.keys(IDIOMAS)
          .filter((c) => c !== cod)
          .map((c) => `<a href="${BASE}/${c}/" hreflang="${c}">${c.toUpperCase()}</a>`)
          .join(" · ")}
      </p>
    </section>`;

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow">
<meta name="theme-color" content="#0f3736">
<title>404 · GoToMapi</title>
<link rel="icon" href="${BASE}/favicon.ico" sizes="48x48">
<link rel="icon" href="${BASE}/icon.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="${BASE}/apple-icon.png">
<link rel="manifest" href="${BASE}/manifest.webmanifest">
<style>
  :root { --petroleo:#036564; --oscuro:#0f3736; --naranja:#d88527; --crema:#faf8f4; }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 32px 20px;
    background: var(--crema); color: var(--oscuro); position: relative; overflow-x: hidden;
    font: 16px/1.6 "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  /* Las curvas de nivel de la marca, apenas insinuadas al fondo. */
  .relieve { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .5; pointer-events: none; }
  main { position: relative; width: 100%; max-width: 640px; text-align: center; }
  .logo { display: block; margin: 0 auto 4px; width: auto; height: 84px; }
  .codigo {
    margin: 0; font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif; font-weight: 700;
    font-size: clamp(6rem, 26vw, 11rem); line-height: 1; letter-spacing: -.04em; color: var(--naranja);
    /* Cifras de caja alta: con las de estilo antiguo del serif, el «4» y el «0»
       bajan de la línea y se montaban sobre el título. */
    font-variant-numeric: lining-nums; font-feature-settings: "lnum" 1;
  }
  h1 { margin: 6px 0 12px; font: 700 clamp(1.7rem, 5.6vw, 2.4rem)/1.1 "Barlow Condensed", "Arial Narrow", system-ui, sans-serif;
       text-transform: uppercase; letter-spacing: .02em; color: var(--petroleo); }
  .texto { margin: 0 auto 22px; max-width: 46ch; color: #3d5a59; }
  .boton {
    display: inline-block; padding: 14px 32px; background: var(--petroleo); color: #fff; text-decoration: none;
    font-weight: 700; letter-spacing: .08em; text-transform: uppercase; font-size: .85rem;
    transition: background-color .2s, transform .2s;
  }
  .boton:hover, .boton:focus-visible { background: #04524f; transform: translateY(-1px); }
  .enlaces { list-style: none; margin: 28px 0 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 10px; }
  .enlaces a {
    display: inline-block; padding: 8px 16px; border: 1px solid #c6dcdb; border-radius: 999px; background: #fff;
    color: var(--oscuro); text-decoration: none; font-weight: 600; font-size: .92rem;
    transition: border-color .2s, color .2s;
  }
  .enlaces a:hover, .enlaces a:focus-visible { border-color: var(--naranja); color: #955718; }
  .ayuda { margin: 34px 0 0; font-size: .95rem; color: #3d5a59; }
  .wa { display: inline-block; margin-top: 4px; color: var(--petroleo); font-weight: 700; text-underline-offset: 4px; }
  .otros { margin: 22px 0 0; font-size: .85rem; color: #6a8a89; }
  .otros a { color: inherit; font-weight: 600; text-underline-offset: 3px; }
  a:focus-visible { outline: 3px solid var(--naranja); outline-offset: 3px; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<svg class="relieve" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="#036564" stroke-width="1" stroke-opacity=".16">
  <path d="M-20 430C120 380 200 470 340 430S560 330 700 380 820 420 830 410"/>
  <path d="M-20 470C110 420 210 510 350 470S570 370 705 420 820 460 830 450"/>
  <path d="M-20 510C100 460 220 550 360 510S580 410 710 460 820 500 830 490"/>
  <path d="M-20 550C90 500 230 590 370 550S590 450 715 500 820 540 830 530"/>
  <path d="M-20 150C120 100 220 190 360 150S580 50 720 100 820 140 830 130"/>
  <path d="M-20 110C110 60 230 150 370 110S590 10 725 60 820 100 830 90"/>
</svg>
<main>
  <img class="logo" src="${BASE}/gotomapi-logo.webp" alt="GoToMapi" width="72" height="84">
  <p class="codigo" aria-hidden="true">404</p>
  ${Object.entries(IDIOMAS)
    .map(([cod, t]) => bloque(cod, t, cod !== "es"))
    .join("")}
</main>
<script>
(function () {
  var admitidos = ["es", "en", "pt"];
  var elegido = "es";
  // 1º el idioma de la dirección («/en/tours/no-existe/»); 2º el del navegador.
  var deLaRuta = (location.pathname.split("/")[1] || "").toLowerCase();
  if (admitidos.indexOf(deLaRuta) !== -1) {
    elegido = deLaRuta;
  } else {
    var pref = navigator.languages || [navigator.language || "es"];
    for (var i = 0; i < pref.length; i++) {
      var c = String(pref[i]).toLowerCase().slice(0, 2);
      if (admitidos.indexOf(c) !== -1) { elegido = c; break; }
    }
  }
  document.documentElement.lang = elegido;
  var bloques = document.querySelectorAll("[data-idioma]");
  for (var j = 0; j < bloques.length; j++) {
    bloques[j].hidden = bloques[j].getAttribute("data-idioma") !== elegido;
  }
})();
</script>
</body>
</html>
`;

await writeFile(join(process.cwd(), "out", "404.html"), html, "utf8");
console.log(`out/404.html generado (whatsapp ${whatsapp}, idiomas ${Object.keys(IDIOMAS).join(", ")})`);
