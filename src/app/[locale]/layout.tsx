import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Analytics } from "@/components/providers/Analytics";
import { BASE_URL } from "@/lib/seo";
import "../globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
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
    <html lang={locale} className={`${syne.variable} ${dmSans.variable}`}>
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
            <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
