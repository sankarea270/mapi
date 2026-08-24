import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { GUIDES } from "@/data/guides";
import { pickLocalized } from "@/lib/format";
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
  const t = await getTranslations({ locale, namespace: "guia" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("subtitle"),
    path: "/guia",
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guia");

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            {t("count", { count: GUIDES.length })}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500">{t("subtitle")}</p>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guia/${guide.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={guide.image}
                  alt={pickLocalized(guide.title, locale)}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  {t(`cat.${guide.category}`)}
                </p>
                <h2 className="mt-2 font-heading text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
                  {pickLocalized(guide.title, locale)}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {pickLocalized(guide.excerpt, locale)}
                </p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  {t("read")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}