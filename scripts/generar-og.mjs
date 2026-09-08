/**
 * Genera la imagen de compartir (Open Graph) a partir del logotipo.
 *
 * Existe porque el sitio estaba anunciando como imagen de compartir una foto
 * aleatoria de picsum.photos: cada vez que alguien pegaba un enlace de la
 * web en WhatsApp o en redes salía una fotografía de archivo distinta, sin
 * relación con la agencia, servida desde un tercero.
 *
 * El tamaño es 1200x630 porque es el que anuncian las etiquetas `og:image:*`
 * y el que esperan las redes. El archivo que había con nombre de OG era en
 * realidad un cuadrado de 512, así que se recortaba mal.
 *
 * Se ejecuta a mano cuando cambie el logotipo:  node scripts/generar-og.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const ANCHO = 1200;
const ALTO = 630;
/* El logotipo ocupa poco más de la mitad del alto: en una miniatura de
   WhatsApp, un logo a sangre se recorta por los bordes. */
const ALTO_LOGO = 340;

const logo = await sharp(await readFile("public/gotomapi-logo.webp"))
  .resize({ height: ALTO_LOGO, fit: "inside" })
  .png()
  .toBuffer();

const { width: anchoLogo } = await sharp(logo).metadata();

const salida = await sharp({
  create: {
    width: ANCHO,
    height: ALTO,
    channels: 4,
    /* Crema, el mismo fondo que usa la web bajo la portada. Sobre blanco
       puro el logotipo pierde el borde y sobre petróleo se apagaría el
       verde del propio dibujo. */
    background: { r: 250, g: 248, b: 244, alpha: 1 },
  },
})
  .composite([
    {
      input: logo,
      top: Math.round((ALTO - ALTO_LOGO) / 2),
      left: Math.round((ANCHO - (anchoLogo ?? 0)) / 2),
    },
  ])
  .png()
  .toBuffer();

await writeFile("public/gotomapi-og.png", salida);
console.log(`public/gotomapi-og.png generado (${ANCHO}x${ALTO})`);
