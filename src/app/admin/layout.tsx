import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "../globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });

/*
 * El panel vive fuera de `[locale]`: no se traduce, no lleva cabecera ni pie
 * y no debe indexarse. Por eso tiene su propio layout raíz con su <html>,
 * hermano del de la web pública.
 */
export const metadata: Metadata = {
  title: "Panel · GoToMapi",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className="min-h-dvh bg-slate-100 antialiased">{children}</body>
    </html>
  );
}
