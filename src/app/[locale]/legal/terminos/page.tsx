import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { LegalContent, PRIVACY, TERMS } from "@/components/legal/LegalContent";

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
  return buildMetadata({
    locale,
    title: TERMS.title[l],
    description: TERMS.intro[l],
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

  return (
    <LegalContent
      doc={TERMS}
      locale={locale as AppLocale}
      otro={{ href: "/legal/privacidad", doc: PRIVACY }}
    />
  );
}
