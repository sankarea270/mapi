import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { enlaceTelefono, enlaceWhatsapp } from "@/config/ajustes";
import { getAjustes } from "@/lib/content";
import { ContactForm } from "@/components/contact/ContactForm";
import { buildMetadata, pageUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { MigasJsonLd } from "@/components/layout/Migas";
import { ID_AGENCIA } from "@/lib/jsonld";

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
  const ajustes = await getAjustes();

  const cards = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: ajustes.telefono,
      href: enlaceWhatsapp(ajustes),
      external: true,
      accent: "text-emerald-500",
      hover: "hover:bg-emerald-50",
    },
    {
      icon: Phone,
      label: t("quick"),
      value: ajustes.telefono,
      href: enlaceTelefono(ajustes),
      external: false,
      accent: "text-primary",
      hover: "hover:bg-slate-50",
    },
    ...[
      { correo: ajustes.correoReservas, label: t("emailBookings") },
      { correo: ajustes.correo, label: t("emailGeneral") },
    ]
      .filter((c) => c.correo)
      .map((c) => ({
        icon: Mail,
        label: c.label,
        value: c.correo,
        href: `mailto:${c.correo}`,
        external: false,
        accent: "text-amber-500",
        hover: "hover:bg-slate-50",
      })),
    {
      icon: Clock,
      label: t("hours"),
      value: ajustes.horario,
      href: undefined,
      external: false,
      accent: "text-slate-500",
      hover: "hover:bg-slate-50",
    },
  ];

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* ContactPage con la agencia como entidad principal: los teléfonos,
          correos y horario que Google puede enseñar en su ficha salen de los
          mismos ajustes que pinta la página, no de una copia. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: t("title"),
          url: pageUrl("/contacto", locale),
          inLanguage: locale,
          mainEntity: {
            "@type": "TravelAgency",
            "@id": ID_AGENCIA,
            name: "GoToMapi",
            telephone: ajustes.telefono,
            email: ajustes.correoReservas || ajustes.correo,
            address: {
              "@type": "PostalAddress",
              streetAddress: ajustes.domicilio,
              addressLocality: ajustes.ciudad,
              addressCountry: "PE",
            },
            contactPoint: [
              {
                "@type": "ContactPoint",
                contactType: "customer service",
                telephone: ajustes.telefono,
                email: ajustes.correoReservas || ajustes.correo,
                availableLanguage: ["Spanish", "English", "Portuguese"],
              },
            ],
          },
        }}
      />
      <MigasJsonLd locale={locale} migas={[{ nombre: t("title") }]} />
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            {t("quick")}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-slate-900 sm:text-4xl">
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