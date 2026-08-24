"use client";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { NavFeatured, NavSection } from "@/config/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { FeaturedCard } from "./FeaturedCard";

interface LinksPanelProps {
  sections: NavSection[];
  featured?: NavFeatured;
}

export function LinksPanel({ sections, featured }: LinksPanelProps) {
  const t = useTranslations();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className={cn("grid gap-10", featured && "lg:grid-cols-[1fr_300px]")}>
        <div className="grid gap-8 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.titleKey} className={cn(sections.length === 1 && "sm:col-span-2")}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {t(section.titleKey)}
              </p>
              <ul className="mt-3 space-y-0.5">
                {section.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary"
                    >
                      {t(link.labelKey)}
                      <ArrowUpRight className="size-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {featured && (
          <FeaturedCard
            image={featured.image}
            title={t(featured.titleKey)}
            href={featured.href}
            cta={t(featured.ctaKey)}
            badge={t("nav.featured")}
          />
        )}
      </div>
    </div>
  );
}
