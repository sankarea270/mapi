import type { Metadata } from "next";
import { DM_Sans, Cormorant_Garamond, Barlow_Condensed } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Analytics } from "@/components/providers/Analytics";
import { Revelados } from "@/components/home/Revelados";
import { BASE_URL } from "@/lib/seo";
import "../globals.css";


/* Serif solo para el logotipo, como en la referencia "Perú Travel": el
   nombre en romana clásica y el subtítulo en versalitas muy espaciadas.
   Se cargan únicamente dos grosores porque se usa en una sola palabra;
   traer la familia entera sería pagar kilobytes por nada. */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
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

  return (
    <html lang={locale} className={`${dmSans.variable} ${cormorant.variable} ${barlowCondensed.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-amber-400 focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-slate-900"
        >
          Saltar al contenido
        </a>
        <NextIntlClientProvider>
            <Header />
            <main id="contenido">{children}</main>
            <Footer />
            <WhatsAppFloat />
            <Revelados />
        <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
