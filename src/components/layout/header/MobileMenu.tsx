"use client";

import { useMemo, useState } from "react";
import { Mail, MessageCircle, Phone, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { TourCategory } from "@/types/tour";
import { NAV_ITEMS } from "@/config/navigation";
import { siteConfig, whatsappLink } from "@/config/site";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { TourResultRow } from "./TourResultRow";
import { LanguageSelect } from "./LanguageSelect";
import { CurrencySelect } from "./CurrencySelect";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: TourCategory[];
}

export function MobileMenu({ open, onOpenChange, categories }: MobileMenuProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [query, setQuery] = useState("");

  const allTours = useMemo(() => categories.flatMap((c) => c.tours), [categories]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allTours
      .filter((tour) => {
        const name = pickLocalized(tour.name, locale).toLowerCase();
        const category = categories.find((c) => c.slug === tour.categorySlug);
        const categoryName = category
          ? pickLocalized(category.name, locale).toLowerCase()
          : "";
        return name.includes(q) || categoryName.includes(q);
      })
      .slice(0, 6);
  }, [query, allTours, categories, locale]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="inset-0 top-0 h-dvh max-h-dvh w-full max-w-full translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-0 p-0 ring-0 sm:max-w-full"
      >
        <DialogTitle className="sr-only">{t("nav.menu")}</DialogTitle>

        <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-4">
          <Logo />
          <DialogClose asChild>
            <button
              type="button"
              aria-label={t("nav.close")}
              className="grid size-10 place-items-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
            >
              <X className="size-5" />
            </button>
          </DialogClose>
        </div>

        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("nav.searchPlaceholder")}
              className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {query.trim() ? (
          <div className="px-2 py-3">
            {results.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                {t("nav.searchEmpty", { query: query.trim() })}
              </p>
            ) : (
              results.map((tour) => (
                <TourResultRow
                  key={tour.slug}
                  slug={tour.slug}
                  name={pickLocalized(tour.name, locale)}
                  duration={pickLocalized(tour.duration, locale)}
                  price={tour.price}
                  rating={tour.rating}
                  image={tour.image}
                  categoryName={""}
                  onSelect={() => onOpenChange(false)}
                />
              ))
            )}
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            defaultValue={NAV_ITEMS[1].labelKey}
            className="px-2 pt-1"
          >
            {NAV_ITEMS.map((item, i) => (
              <AccordionItem key={item.labelKey} value={`item-${i}`} className="border-b-0">
                <AccordionTrigger className="px-3 py-4 text-[15px] font-bold text-slate-900 hover:no-underline">
                  {t(item.labelKey)}
                </AccordionTrigger>
                <AccordionContent className="pb-1 [&_a]:no-underline">
                  {item.kind === "tours" && (
                    <ul className="space-y-0.5">
                      {categories.map((category) => (
                        <li key={category.slug}>
                          <Link
                            href={`/tours?categoria=${category.slug}`}
                            onClick={() => onOpenChange(false)}
                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                          >
                            {pickLocalized(category.name, locale)}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href="/tours"
                          onClick={() => onOpenChange(false)}
                          className="block rounded-lg px-3 py-2.5 text-sm font-bold text-primary"
                        >
                          {t("nav.allTours", { count: allTours.length })}
                        </Link>
                      </li>
                    </ul>
                  )}

                  {item.kind === "category" && (
                    <ul className="space-y-0.5">
                      {categories
                        .find((c) => c.slug === item.categorySlug)
                        ?.tours.map((tour) => (
                          <li key={tour.slug}>
                            <Link
                              href={`/tours/${tour.slug}`}
                              onClick={() => onOpenChange(false)}
                              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                            >
                              {pickLocalized(tour.name, locale)}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  )}

                  {item.kind === "links" &&
                    item.sections.map((section) => (
                      <div key={section.titleKey} className="mb-3">
                        <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          {t(section.titleKey)}
                        </p>
                        <ul className="space-y-0.5">
                          {section.links.map((link) => (
                            <li key={link.labelKey}>
                              <Link
                                href={link.href}
                                onClick={() => onOpenChange(false)}
                                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                              >
                                {t(link.labelKey)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-center justify-between gap-2">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-emerald-600",
                "transition-colors hover:bg-emerald-50"
              )}
            >
              <MessageCircle className="size-4" />
              {t("topbar.whatsapp")}
            </a>
            <a
              href={`tel:${siteConfig.phone.tel}`}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Phone className="size-4" />
              <span className="hidden sm:inline">{siteConfig.phone.display}</span>
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Mail className="size-4" />
            </a>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
            <LanguageSelect />
            <CurrencySelect />
          </div>

          <Link
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onOpenChange(false)}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-400 text-sm font-bold text-slate-900 shadow-md shadow-amber-400/20 transition-colors hover:bg-amber-300"
          >
            {t("nav.plan")}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
