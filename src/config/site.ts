export const siteConfig = {
  /*
   * El logotipo escribe "GoToMapi" como una sola palabra, con "GoTo" en
   * petróleo y "Mapi" en naranja. `name` y `nameSuffix` son esas dos mitades
   * para poder colorearlas por separado en la cabecera; `fullName` es la
   * cadena sin partir, para metadatos, JSON-LD y textos legales, donde meter
   * un espacio daría "GoTo Mapi".
   */
  name: "GoTo",
  nameSuffix: "Mapi",
  fullName: "GoToMapi",

  /*
   * Dominio y usuario de redes: única fuente de verdad para todo lo que
   * "apunta" a la marca. El correo, las URL sociales, la URL base del SEO y
   * los textos legales se derivan de aquí, así que mover la marca a otro
   * dominio es cambiar estas dos líneas y nada más.
   */
  domain: "gotomachupicchuperu.com",
  handle: "gotomapi",

  taglineKey: "brand.tagline",
  /* Teléfono, WhatsApp, correo, horario y redes ya no están aquí: se editan
     en «Ajustes» del panel. Ver `config/ajustes.ts`. */
  currencies: [
    { code: "USD", symbol: "$" },
    { code: "PEN", symbol: "S/" },
    { code: "EUR", symbol: "€" },
  ],
  defaultCurrency: "USD",
  locales: [
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "pt", label: "Português", flag: "🇧🇷" },
  ],
} as const;

/** URL pública del sitio. */
export const siteUrl = `https://${siteConfig.domain}`;

/** Construye un correo de la marca: mailAt("carlos") -> carlos@gotomapi.pe */
export function mailAt(user: string): string {
  return `${user}@${siteConfig.domain}`;
}
