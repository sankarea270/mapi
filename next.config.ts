import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/*
 * Subcarpeta en la que se publica el sitio.
 *
 * Vacío por defecto, que es el caso normal: en Appwrite, en un dominio
 * propio o en cualquier hosting, el sitio vive en la raíz. GitHub Pages es
 * la excepción —sirve desde /<repo>— y por eso su workflow exporta
 * BASE_PATH=/mapi.
 *
 * Publicar con el basePath equivocado rompe el sitio entero: todos los
 * enlaces y recursos apuntan a una carpeta que no existe.
 *
 * Se expone al cliente porque `images.unoptimized` no aplica el basePath
 * automáticamente a los `src` de next/image.
 */
const rawBasePath = process.env.BASE_PATH ?? "";
/* Se normaliza para que "mapi", "/mapi" y "/mapi/" den todos lo mismo: sin
   esto, olvidar la barra inicial rompe el build con un error poco claro. */
const basePath = rawBasePath
  ? `/${rawBasePath.replace(/^\/+/, "").replace(/\/+$/, "")}`
  : "";

const nextConfig: NextConfig = {
  output: 'export',
  ...(basePath ? { basePath, assetPrefix: `${basePath}/` } : {}),
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
