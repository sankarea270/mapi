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
      {/* Solo el pin del logo: la pieza completa lleva el rótulo "GoToMapi
          PERÚ" dentro y, a tamaño de cabecera, ese texto quedaría ilegible y
          además duplicaría el nombre que ya va al lado. */}
      <div className="relative size-16 shrink-0 transition-transform duration-300 group-hover:-rotate-3">
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/gotomapi-mark.webp`}
          alt="GoToMapi Perú"
          fill
          sizes="64px"
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
