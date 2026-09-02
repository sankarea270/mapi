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
  phone: {
    display: "+51 984 123 456",
    tel: "+51984123456",
  },
  whatsapp: {
    number: "51984123456",
    defaultMessage: "Hola, quiero planificar un viaje a Perú",
  },
  emailUser: "reservas",
  hours: "Lun – Dom · 8:00 – 20:00",
  currencies: [
    { code: "USD", symbol: "$" },
    { code: "PEN", symbol: "S/" },
    { code: "EUR", symbol: "€" },
  ],
  defaultCurrency: "USD",
  socialBases: {
    instagram: { label: "Instagram", base: "https://instagram.com/" },
    facebook: { label: "Facebook", base: "https://facebook.com/" },
    tiktok: { label: "TikTok", base: "https://tiktok.com/@" },
    youtube: { label: "YouTube", base: "https://youtube.com/@" },
  },
  locales: [
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "pt", label: "Português", flag: "🇧🇷" },
  ],
} as const;

/** Dirección de correo de la agencia, derivada del dominio de marca. */
export const siteEmail = `${siteConfig.emailUser}@${siteConfig.domain}`;

/** URL pública del sitio. */
export const siteUrl = `https://${siteConfig.domain}`;

/** Construye un correo de la marca: mailAt("carlos") -> carlos@gotomapi.pe */
export function mailAt(user: string): string {
  return `${user}@${siteConfig.domain}`;
}

/** Perfiles sociales, ya resueltos con el usuario de la marca. */
export const socials = Object.fromEntries(
  Object.entries(siteConfig.socialBases).map(([key, s]) => [
    key,
    { label: s.label, href: `${s.base}${siteConfig.handle}` },
  ])
) as Record<
  keyof typeof siteConfig.socialBases,
  { label: string; href: string }
>;

export function whatsappLink(message?: string): string {
  const text = encodeURIComponent(message ?? siteConfig.whatsapp.defaultMessage);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${text}`;
}
