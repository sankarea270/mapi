import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { LegalContent, PRIVACY } from "@/components/legal/LegalContent";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = locale as "es" | "en" | "pt";
  return buildMetadata({
    locale,
    title: PRIVACY.title[l],
    description: PRIVACY.intro[l],
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
  const l = locale as "es" | "en" | "pt";

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            {PRIVACY.badge[l]}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {PRIVACY.title[l]}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500">{PRIVACY.updated[l]}</p>
        </div>
      </div>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <LegalContent doc={PRIVACY} locale={l} />
      </section>
    </div>
  );
}