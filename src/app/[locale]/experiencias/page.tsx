import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { EXPERIENCES } from "@/data/experiences";
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
  const t = await getTranslations({ locale, namespace: "experiencias" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("subtitle"),
    path: "/experiencias",
  });
}

export default async function ExperiencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("experiencias");

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            {t("count", { count: EXPERIENCES.length })}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500">{t("subtitle")}</p>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCES.map((experience) => (
            <Link
              key={experience.slug}
              href={`/experiencias/${experience.slug}`}
              className="group relative block overflow-hidden rounded-2xl bg-slate-900"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={experience.image}
                  alt={pickLocalized(experience.name, locale)}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h2 className="font-heading text-xl font-bold text-white">
                  {pickLocalized(experience.name, locale)}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-200">
                  {pickLocalized(experience.description, locale)}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-amber-300">
                  {t("explore")}
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