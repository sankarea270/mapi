import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteConfig, whatsappLink, siteEmail } from "@/config/site";
import { ContactForm } from "@/components/contact/ContactForm";
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
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("subtitle"),
    path: "/contacto",
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const cards = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: siteConfig.phone.display,
      href: whatsappLink(),
      external: true,
      accent: "text-emerald-500",
      hover: "hover:bg-emerald-50",
    },
    {
      icon: Phone,
      label: t("quick"),
      value: siteConfig.phone.display,
      href: `tel:${siteConfig.phone.tel}`,
      external: false,
      accent: "text-primary",
      hover: "hover:bg-slate-50",
    },
    {
      icon: Mail,
      label: "Email",
      value: siteEmail,
      href: `mailto:${siteEmail}`,
      external: false,
      accent: "text-amber-500",
      hover: "hover:bg-slate-50",
    },
    {
      icon: Clock,
      label: t("hours"),
      value: siteConfig.hours,
      href: undefined,
      external: false,
      accent: "text-slate-500",
      hover: "hover:bg-slate-50",
    },
  ];

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            {t("quick")}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {cards.map((card) => {
              const Icon = card.icon;
              const inner = (
                <>
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 ${card.accent}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                      {card.label}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold text-slate-900">
                      {card.value}
                    </span>
                  </span>
                </>
              );

              const className = `flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-colors ${card.hover}`;

              if (card.href) {
                return card.external ? (
                  <a
                    key={card.label}
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {inner}
                  </a>
                ) : (
                  <a key={card.label} href={card.href} className={className}>
                    {inner}
                  </a>
                );
              }
              return (
                <div key={card.label} className={className}>
                  {inner}
                </div>
              );
            })}
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}