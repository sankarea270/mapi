import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BookingForm } from "@/components/reservations/BookingForm";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reserva" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("subtitle"),
    path: "/reservar",
  });
}

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-dvh bg-slate-50">

      {/* El formulario ya trae su propia caja, cabecera y nota de "sin pagos
          en línea": envolverlo en otra tarjeta duplicaba ambos textos. */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <BookingForm />
      </section>
    </div>
  );
}