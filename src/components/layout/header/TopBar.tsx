"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { siteConfig, whatsappLink, siteEmail } from "@/config/site";
import { LanguageSelect } from "./LanguageSelect";
import { CurrencySelect } from "./CurrencySelect";

export function TopBar() {
  const t = useTranslations("topbar");

  return (
    <div className="bg-slate-950 text-slate-300">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("whatsapp")}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-semibold text-emerald-400 transition-colors hover:bg-white/10 hover:text-emerald-300"
          >
            <MessageCircle className="size-3.5 shrink-0" />
            <span className="hidden md:inline">{t("whatsapp")}</span>
          </a>
          <span className="mx-1 hidden h-3.5 w-px bg-white/15 sm:block" />
          <a
            href={`tel:${siteConfig.phone.tel}`}
            aria-label={siteConfig.phone.display}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium transition-colors hover:bg-white/10 hover:text-white"
          >
            <Phone className="size-3.5 shrink-0" />
            <span className="hidden lg:inline">{siteConfig.phone.display}</span>
          </a>
          <span className="mx-1 hidden h-3.5 w-px bg-white/15 lg:block" />
          <a
            href={`mailto:${siteEmail}`}
            className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium transition-colors hover:bg-white/10 hover:text-white sm:flex"
          >
            <Mail className="size-3.5 shrink-0" />
            <span className="hidden xl:inline">{siteEmail}</span>
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <LanguageSelect />
          <span className="h-3.5 w-px bg-white/15" />
          <CurrencySelect />
        </div>
      </div>
    </div>
  );
}
