"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  const t = useTranslations("brand");

  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl transition-transform duration-300 group-hover:rotate-6">
        <Image
          src="/mapilogo.png"
          alt="Mapi Travels Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <span className="leading-none">
        <span
          className={cn(
            "block text-lg font-extrabold tracking-tight transition-colors",
            light ? "text-white" : "text-slate-900"
          )}
        >
          {siteConfig.name}
          <span className="text-amber-400"> {siteConfig.nameSuffix}</span>
        </span>
        {!compact && (
          <span
            className={cn(
              "mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors",
              light ? "text-slate-300" : "text-slate-400"
            )}
          >
            {t("tagline")}
          </span>
        )}
      </span>
    </Link>
  );
}
