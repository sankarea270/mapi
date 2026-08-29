import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { AboutHero } from "@/components/about/AboutHero";
import { MissionVision } from "@/components/about/MissionVision";
import { StatsSection } from "@/components/about/StatsSection";
import { TeamSection } from "@/components/about/TeamSection";
import { CertificationsSection } from "@/components/about/CertificationsSection";
import { CompanyInfo } from "@/components/about/CompanyInfo";

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

  return (
    <>
      <AboutHero />
      <MissionVision />
      <StatsSection />
      <CertificationsSection locale={locale} />
      <TeamSection />
      <CompanyInfo />
    </>
  );
}