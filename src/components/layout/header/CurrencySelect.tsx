"use client";

import { useEffect, useState } from "react";
import { Banknote, Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mapi-currency";

export function CurrencySelect() {
  const t = useTranslations("topbar");
  const [currency, setCurrency] = useState<string>(siteConfig.defaultCurrency);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && siteConfig.currencies.some((c) => c.code === stored)) {
      setCurrency(stored);
    }
  }, []);

  const current = siteConfig.currencies.find((c) => c.code === currency) ?? siteConfig.currencies[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-semibold text-slate-200 transition-colors outline-none",
          "hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-400/60"
        )}
      >
        <Banknote className="size-3.5" />
        <span className="uppercase">{current.symbol}</span>
        <span>{current.code}</span>
        <ChevronDown className="size-3 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuLabel>{t("currency")}</DropdownMenuLabel>
        {siteConfig.currencies.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onSelect={() => {
              setCurrency(c.code);
              window.localStorage.setItem(STORAGE_KEY, c.code);
            }}
            className="justify-between font-medium"
          >
            <span>
              <span className="text-slate-400">{c.symbol}</span> {c.code}
            </span>
            {currency === c.code && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
