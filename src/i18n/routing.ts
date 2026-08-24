import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en", "pt"],
  defaultLocale: "es",
  // "always": el export estático no ejecuta middleware, así que todas las
  // rutas deben llevar el prefijo de idioma (/es, /en, /pt).
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
