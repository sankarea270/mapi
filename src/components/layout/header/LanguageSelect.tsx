"use client";

import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function LanguageSelect() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("topbar");

  const currentLocale = siteConfig.locales.find((l) => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 text-[13px] font-semibold text-slate-200 transition-colors outline-none",
          "hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-400/60"
        )}
      >
        <span className="text-base leading-none">{currentLocale?.flag}</span>
        <span className="uppercase">{locale}</span>
        <ChevronDown className="size-3 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        {siteConfig.locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => router.replace(pathname, { locale: l.code })}
            className="justify-between font-medium"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{l.flag}</span>
              {l.label}
            </span>
            {locale === l.code && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
