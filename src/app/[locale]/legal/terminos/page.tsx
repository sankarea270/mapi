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
  const documento = crearTerminos(await getAjustes());
  return buildMetadata({
    locale,
    title: documento.title[l],
    description: documento.intro[l],
    path: "/legal/terminos",
  });
}

export default async function TerminosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ajustes = await getAjustes();

  return (
    <LegalContent
      doc={crearTerminos(ajustes)}
      locale={locale as AppLocale}
      otro={{ href: "/legal/privacidad", doc: crearPrivacidad(ajustes) }}
    />
  );
}
