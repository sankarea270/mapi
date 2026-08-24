import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "../globals.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin · Mapi Travels",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className="min-h-dvh bg-slate-50 antialiased">
        <AdminSidebar />
        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
            <div className="flex h-14 items-center px-6">
              <p className="text-sm font-medium text-slate-500">Panel de administración</p>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
