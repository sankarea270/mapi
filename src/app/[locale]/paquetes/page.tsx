import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, CalendarRange } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PACKAGES } from "@/data/packages";
import { pickLocalized, formatPrice } from "@/lib/format";
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
  const t = await getTranslations({ locale, namespace: "paquetes" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("subtitle"),
    path: "/paquetes",
  });
}

export default async function PackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("paquetes");

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            {t("count", { count: PACKAGES.length })}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500">{t("subtitle")}</p>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {PACKAGES.map((pkg) => (
            <Link
              key={pkg.slug}
              href={`/paquetes/${pkg.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[16/8]">
                <Image
                  src={pkg.image}
                  alt={pickLocalized(pkg.name, locale)}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 right-4 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-slate-900 shadow">
                  {formatPrice(pkg.price, locale, "USD")}
                </span>
              </div>
              <div className="p-6">
                <h2 className="font-heading text-xl font-bold text-slate-900 transition-colors group-hover:text-primary">
                  {pickLocalized(pkg.name, locale)}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                  <CalendarRange className="size-4 text-amber-500" />
                  {pickLocalized(pkg.duration, locale)}
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {pickLocalized(pkg.description, locale)}
                </p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  {t("view")}
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