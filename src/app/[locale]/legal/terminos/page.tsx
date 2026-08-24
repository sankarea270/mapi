import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { TERMS } from "@/components/legal/LegalContent";
import { LegalContent } from "@/components/legal/LegalContent";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: TERMS.title[locale as "es" | "en" | "pt"],
    description: TERMS.intro[locale as "es" | "en" | "pt"],
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
  const l = locale as "es" | "en" | "pt";

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            {TERMS.badge[l]}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {TERMS.title[l]}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500">{TERMS.updated[l]}</p>
        </div>
      </div>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <LegalContent doc={TERMS} locale={l} />
      </section>
    </div>
  );
}