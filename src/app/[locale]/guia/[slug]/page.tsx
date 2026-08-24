import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { GUIDES } from "@/data/guides";
import { pickLocalized } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    GUIDES.map((guide) => ({ locale, slug: guide.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return {};
  return buildMetadata({
    locale,
    title: pickLocalized(guide.title, locale),
    description: pickLocalized(guide.excerpt, locale),
    path: `/guia/${guide.slug}`,
    image: guide.image,
  });
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

  const t = await getTranslations("guia");
  const title = pickLocalized(guide.title, locale);

  const jsonLd =
    guide.category === "faq"
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.sections.map((section) => ({
            "@type": "Question",
            name: pickLocalized(section.heading, locale),
            acceptedAnswer: {
              "@type": "Answer",
              text: pickLocalized(section.body, locale),
            },
          })),
        }
      : undefined;

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Link
            href="/guia"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            {t("back")}
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
          {t(`cat.${guide.category}`)}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {pickLocalized(guide.excerpt, locale)}
        </p>

        <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-2xl">
          <Image
            src={guide.image}
            alt={title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>

        {guide.category === "faq" ? (
          <Accordion type="single" collapsible className="mt-10 w-full">
            {guide.sections.map((section, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-bold text-slate-900">
                  {pickLocalized(section.heading, locale)}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-slate-600">
                  {pickLocalized(section.body, locale)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="mt-10 space-y-10">
            {guide.sections.map((section, index) => (
              <section key={index}>
                <h2 className="font-heading text-xl font-bold text-slate-900">
                  {pickLocalized(section.heading, locale)}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  {pickLocalized(section.body, locale)}
                </p>
              </section>
            ))}
          </div>
        )}
      </article>

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </div>
  );
}