import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { LegalContent, crearPrivacidad, crearTerminos } from "@/components/legal/LegalContent";
import { getAjustes } from "@/lib/content";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = locale as AppLocale;
  const documento = crearPrivacidad(await getAjustes());
  return buildMetadata({
    locale,
    title: documento.title[l],
    description: documento.intro[l],
    path: "/legal/privacidad",
  });
}

export default async function PrivacidadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ajustes = await getAjustes();

  return (
    <LegalContent
      doc={crearPrivacidad(ajustes)}
      locale={locale as AppLocale}
      otro={{ href: "/legal/terminos", doc: crearTerminos(ajustes) }}
    />
  );
}
