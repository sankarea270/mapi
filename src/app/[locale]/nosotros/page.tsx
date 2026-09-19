import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildMetadata, pageUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { MigasJsonLd } from "@/components/layout/Migas";
import { agenciaRef } from "@/lib/jsonld";
import { getTeam } from "@/lib/content";
import { AboutHero } from "@/components/about/AboutHero";
import { MissionVision } from "@/components/about/MissionVision";
import { StatsSection } from "@/components/about/StatsSection";
import { TeamSection } from "@/components/about/TeamSection";
import { CertificationsSection } from "@/components/about/CertificationsSection";
import { CompanyInfo } from "@/components/about/CompanyInfo";
import { TransparenciaLegal } from "@/components/about/TransparenciaLegal";
import type { AppLocale } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return buildMetadata({
    locale,
    title: t("meta.title"),
    description: t("meta.description"),
    path: "/nosotros",
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const equipo = await getTeam(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: t("meta.title"),
          description: t("meta.description"),
          url: pageUrl("/nosotros", locale),
          inLanguage: locale,
          about: agenciaRef,
        }}
      />
      <MigasJsonLd locale={locale} migas={[{ nombre: t("meta.title") }]} />
      <AboutHero />
      <MissionVision />
      <StatsSection />
      <CertificationsSection locale={locale} />
      <TeamSection miembros={equipo} />
      <CompanyInfo>
        <TransparenciaLegal locale={locale as AppLocale} />
      </CompanyInfo>
    </>
  );
}