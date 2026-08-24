import { Clock, Mail, MessageCircle, Phone, CreditCard, Shield, Banknote } from "lucide-react";
import { useTranslations } from "next-intl";
import { NAV_ITEMS } from "@/config/navigation";
import { siteConfig, whatsappLink } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/layout/header/Logo";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/layout/SocialIcons";

const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
} as const;

const footerDestinations = [
  { labelKey: "destinos.cusco", href: "/destinos/cusco" },
  { labelKey: "destinos.machuPicchu", href: "/destinos/machu-picchu" },
  { labelKey: "destinos.sacredValley", href: "/destinos/valle-sagrado" },
  { labelKey: "destinos.arequipa", href: "/destinos/arequipa" },
  { labelKey: "destinos.punoTiticaca", href: "/destinos/puno" },
  { labelKey: "destinos.iquitos", href: "/destinos/iquitos" },
];

const paymentMethods = [
  { name: "Visa", icon: "💳" },
  { name: "Mastercard", icon: "💳" },
  { name: "PayPal", icon: "🅿️" },
  { name: "Yape", icon: "📱" },
  { name: "Plin", icon: "📱" },
];

export default function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 lg:flex-row">
          <div className="max-w-md">
            <h3 className="font-heading text-xl font-bold text-white">
              {t("newsletter.title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {t("newsletter.subtitle")}
            </p>
          </div>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
              {t("footer.description")}
            </p>
            <div className="mt-6 flex gap-2">
              {(Object.keys(socialIcons) as Array<keyof typeof socialIcons>).map((key) => {
                const Icon = socialIcons[key];
                const social = siteConfig.socials[key];
                return (
                  <a
                    key={key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid size-9 place-items-center rounded-full bg-white/5 text-slate-300 transition-colors hover:bg-amber-400 hover:text-slate-900"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>

            <div className="mt-6">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white">
                {t("footer.paymentMethods")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method.name}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300"
                  >
                    <CreditCard className="size-3.5" />
                    {method.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              {t("footer.navigation")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.labelKey}>
                  <Link
                    href={item.kind === "category" ? `/tours?categoria=${item.categorySlug}` : item.href}
                    className="text-slate-400 transition-colors hover:text-amber-300"
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              {t("footer.destinations")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerDestinations.map((dest) => (
                <li key={dest.labelKey}>
                  <Link
                    href={dest.href}
                    className="text-slate-400 transition-colors hover:text-amber-300"
                  >
                    {t(dest.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              {t("footer.contact")}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-slate-400 transition-colors hover:text-emerald-400"
                >
                  <MessageCircle className="size-4 shrink-0" />
                  {siteConfig.phone.display}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phone.tel}`}
                  className="flex items-center gap-2.5 text-slate-400 transition-colors hover:text-amber-300"
                >
                  <Phone className="size-4 shrink-0" />
                  {siteConfig.phone.display}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2.5 text-slate-400 transition-colors hover:text-amber-300"
                >
                  <Mail className="size-4 shrink-0" />
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <Clock className="size-4 shrink-0" />
                {t("footer.hours")}: {siteConfig.hours}
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white">
                {t("footer.security")}
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                  <Shield className="size-3.5 text-emerald-400" />
                  SSL Seguro
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                  <Banknote className="size-3.5 text-amber-400" />
                  {t("footer.refund")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:px-6">
          <p>
            © {year} {siteConfig.name} {siteConfig.nameSuffix} · {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            <Link href="/legal/terminos" className="transition-colors hover:text-slate-300">
              {t("footer.terms")}
            </Link>
            <Link href="/legal/privacidad" className="transition-colors hover:text-slate-300">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
