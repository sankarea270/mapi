import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/*
 * Middleware de idioma, solo para `npm run dev`.
 *
 * El sitio se publica con `output: 'export'` sobre Apache: no hay proceso de
 * Node delante, así que esto NUNCA se ejecuta en producción. Por eso
 * `localePrefix` es "always" —cada ruta lleva su idioma escrito— y por eso
 * `scripts/generar-raiz.mjs` fabrica un `index.html` que redirige desde la
 * raíz. Aquí solo sirve para que en local la raíz se comporte igual.
 *
 * Antes había además un bloque que comprobaba una cookie para proteger
 * /admin. Se ha quitado porque no protegía nada: en producción este archivo
 * no llega ni a cargarse, así que la ruta quedaba abierta y el código daba
 * una falsa sensación de seguridad. El panel se defiende donde sí se
 * ejecuta siempre —en la base de datos—, con las políticas RLS de
 * `supabase/migrations/002_panel.sql`.
 */
export default createMiddleware(routing);

export const config = {
  // El panel queda fuera: no se traduce y no debe recibir prefijo de idioma.
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
};
