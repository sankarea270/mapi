"use client";

import { ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { TourCategory } from "@/types/tour";
import { Link } from "@/i18n/navigation";
import { pickLocalized, formatPrice } from "@/lib/format";
import { FeaturedCard } from "./FeaturedCard";

const VISIBLE_COLUMNS = 3;

export function ToursPanel({ categories }: { categories: TourCategory[] }) {
  const locale = useLocale();
  const t = useTranslations("nav");

  const visible = categories.slice(0, VISIBLE_COLUMNS);
  const rest = categories.slice(VISIBLE_COLUMNS);
  const allTours = categories.flatMap((c) => c.tours);
  const featured =
    allTours.find((tour) => tour.featured) ?? categories[0]?.tours[0];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="grid gap-10 lg:grid-cols-4">
        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
          {visible.map((category) => (
            <div key={category.slug}>
              <Link
                href={`/tours?categoria=${category.slug}`}
                className="group flex items-center justify-between text-sm font-bold text-slate-900 transition-colors hover:text-primary"
              >
                {pickLocalized(category.name, locale)}
                <ChevronRight className="size-4 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
              <ul className="mt-3 space-y-1">
                {category.tours.slice(0, 4).map((tour) => (
                  <li key={tour.slug}>
                    <Link
                      href={`/tours/${tour.slug}`}
                      className="group/tour block rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
                    >
                      <p className="truncate text-sm font-medium text-slate-700 transition-colors group-hover/tour:text-primary">
                        {pickLocalized(tour.name, locale)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {pickLocalized(tour.duration, locale)} · {t("from")}{" "}
                        <span className="font-semibold text-slate-600">
                          {formatPrice(tour.price, locale, "USD")}
                        </span>
                      </p>
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
            title={pickLocalized(featured.name, locale)}
            href={`/tours/${featured.slug}`}
            cta={t("seeTour")}
            badge={t("featured")}
          />
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
        <Link
          href="/tours"
          className="group inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-slate-900"
        >
          {t("allTours", { count: allTours.length })}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        {rest.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">{t("moreCategories")}:</span>
            {rest.map((category) => (
              <Link
                key={category.slug}
                href={`/tours?categoria=${category.slug}`}
                className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600 transition-colors hover:bg-primary hover:text-white"
              >
                {pickLocalized(category.name, locale)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
