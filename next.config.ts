import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  output: 'export',
  basePath: '/mapi',
  assetPrefix: '/mapi/',
  trailingSlash: true,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Excluir rutas API del export estático
  generateBuildId: () => {
    return 'build-' + Date.now()
  },
};

export default withNextIntl(nextConfig);
