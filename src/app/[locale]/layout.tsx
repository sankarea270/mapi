import type { Metadata } from "next";
import { Playfair, DM_Sans, Cormorant_Garamond, Barlow_Condensed } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/Footer";
import { BotonContacto } from "@/components/layout/BotonContacto";
import { AjustesProvider } from "@/components/providers/Ajustes";
import { getAjustes } from "@/lib/content";
import { Analytics } from "@/components/providers/Analytics";
import { Revelados } from "@/components/home/Revelados";
import { BASE_URL } from "@/lib/seo";
import "../globals.css";


/* La letra del titular de la portada, y solo de ahí.
 *
 * Es una fuente variable con dos ejes que aquí importan: el tamaño óptico
 * («opsz») y la anchura («wdth»). Llevando el óptico al máximo, el dibujo
 * se afila —asta gruesa y perfil de pelo, el contraste de las portadas de
 * revista— porque ese eje existe justo para eso: el mismo tipo se dibuja
 * distinto para un cuerpo de texto que para un rótulo. Y con la anchura al
 * mínimo, las versales salen altas y estrechas en vez de anchas.
 *
 * Se pide variable, no grosores sueltos, porque los ejes solo se pueden
 * mover si viene el archivo variable. */
const playfair = Playfair({
  variable: "--font-playfair",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

/* La romana del logotipo, y desde ahora también la del titular de la
   portada: el nombre del lugar en letra clásica de contraste alto es lo que
   da el aire de agencia de viajes de lujo que se busca, y lo que ata el
   titular al logotipo en vez de dejarlos como dos marcas distintas.
   Tres grosores, no la familia entera: el titular pide el más grueso. */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

/* La condensada de la referencia, y la única de titulares del sitio.
   Sustituye a Syne, que era una geométrica ancha: convivían mal, porque el
   menú salía condensado y el inicio no, y parecían dos sitios distintos.
   Al quitar Syne, además, se deja de descargar una familia entera. */
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "GoToMapi",
    template: "%s · GoToMapi",
  },
  description: "Tours y paquetes turísticos en Perú.",
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  /* Los ajustes del panel, leídos una vez al compilar y repartidos a los
     componentes de cliente por contexto. */
  const ajustes = await getAjustes();

  return (
    <html lang={locale} className={`${dmSans.variable} ${cormorant.variable} ${barlowCondensed.variable} ${playfair.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-amber-400 focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-slate-900"
        >
          Saltar al contenido
        </a>
        <NextIntlClientProvider>
          <AjustesProvider ajustes={ajustes}>
            <Header />
            <main id="contenido">{children}</main>
            <Footer />
            <BotonContacto />
            <Revelados />
            <Analytics />
          </AjustesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
