import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/*
 * Manifiesto de la web: lo que el móvil lee para «Añadir a la pantalla de
 * inicio» y lo que Chrome usa para ofrecer instalarla.
 *
 * Antes no había ninguno, y en Android el icono de inicio era una captura
 * borrosa de la página. Los tres iconos son la marca sobre ficha blanca:
 *
 *  · 192 y 512 «any»: el logotipo tal cual, con esquinas redondeadas.
 *  · 512 «maskable»: a sangre y con el pin dentro del 60% central. Android
 *    lo recorta con la forma que use el teléfono —círculo, gota, cuadrado— y
 *    con el icono «any» ese recorte se llevaba media montaña.
 *
 * `start_url: "/"` y no «/es/»: la raíz elige el idioma del visitante, y una
 * web instalada por alguien que navega en inglés no debe abrirse en español.
 *
 * Los colores son los de la marca: el fondo es el crema de la portada y el
 * tema el petróleo oscuro de la barra superior, que es el que tiñe la barra
 * de estado del móvil.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GoToMapi — Agencia de viajes en Perú",
    short_name: "GoToMapi",
    description: "Tours y paquetes a Machu Picchu, Valle Sagrado, Cusco, Amazonía y más.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#0f3736",
    lang: "es",
    categories: ["travel", "tourism"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
