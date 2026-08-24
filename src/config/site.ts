export const siteConfig = {
  name: "Mapi",
  nameSuffix: "Travels",
  taglineKey: "brand.tagline",
  phone: {
    display: "+51 984 123 456",
    tel: "+51984123456",
  },
  whatsapp: {
    number: "51984123456",
    defaultMessage: "Hola, quiero planificar un viaje a Perú",
  },
  email: "reservas@mapitravels.pe",
  hours: "Lun – Dom · 8:00 – 20:00",
  currencies: [
    { code: "USD", symbol: "$" },
    { code: "PEN", symbol: "S/" },
    { code: "EUR", symbol: "€" },
  ],
  defaultCurrency: "USD",
  socials: {
    instagram: { label: "Instagram", href: "https://instagram.com/mapitravels" },
    facebook: { label: "Facebook", href: "https://facebook.com/mapitravels" },
    tiktok: { label: "TikTok", href: "https://tiktok.com/@mapitravels" },
    youtube: { label: "YouTube", href: "https://youtube.com/@mapitravels" },
  },
  locales: [
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "pt", label: "Português", flag: "🇧🇷" },
  ],
} as const;

export function whatsappLink(message?: string): string {
  const text = encodeURIComponent(message ?? siteConfig.whatsapp.defaultMessage);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${text}`;
}
