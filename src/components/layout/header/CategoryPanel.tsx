"use client";

import { ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { TourCategory } from "@/types/tour";
import { Link } from "@/i18n/navigation";
import { pickLocalized, formatPrice } from "@/lib/format";
import { FeaturedCard } from "./FeaturedCard";

export function CategoryPanel({ category }: { category: TourCategory }) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const categoryName = pickLocalized(category.name, locale);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <Link
            href={`/tours?categoria=${category.slug}`}
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 transition-colors hover:text-primary"
          >
            {categoryName}
            <ChevronRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <ul className="mt-4 grid gap-1 sm:grid-cols-2">
            {category.tours.map((tour) => (
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
          <Link
            href={`/tours?categoria=${category.slug}`}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-slate-900"
          >
            {t("viewAll")}
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <FeaturedCard
          image={category.tours[0]?.image ?? "https://picsum.photos/seed/mapi-cat/600/800"}
          title={categoryName}
          href={`/tours?categoria=${category.slug}`}
          cta={t("viewAll")}
          badge={t("featured")}
        />
      </div>
    </div>
  );
}
