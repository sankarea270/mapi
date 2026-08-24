"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { TourCategory } from "@/types/tour";
import { pickLocalized } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  categories: TourCategory[];
  locale: string;
  initialQuery: string;
  initialCategory: string;
  initialSort: string;
  initialDuration: string;
  initialMaxPrice: string;
  initialMinRating: string;
}

const SORT_OPTIONS = ["rating", "price-asc", "price-desc", "name"] as const;
const SORT_KEYS: Record<(typeof SORT_OPTIONS)[number], string> = {
  rating: "sortRating",
  "price-asc": "sortPriceAsc",
  "price-desc": "sortPriceDesc",
  name: "sortName",
};
const PRICE_CAPS = ["", "100", "200", "300", "500", "1000"] as const;
const RATINGS = ["", "4.5", "4.8", "5.0"] as const;
const DURATIONS = ["", "1", "2", "3", "4+"] as const;

export function FilterBar({
  categories,
  locale,
  initialQuery,
  initialCategory,
  initialSort,
  initialDuration,
  initialMaxPrice,
  initialMinRating,
}: FilterBarProps) {
  const t = useTranslations("tours");
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);

  const updateParams = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    const next = {
      q: query,
      categoria: initialCategory,
      orden: initialSort,
      duracion: initialDuration,
      precio_max: initialMaxPrice,
      rating_min: initialMinRating,
      ...patch,
    };
    if (next.q) params.set("q", next.q);
    if (next.categoria) params.set("categoria", next.categoria);
    if (next.orden) params.set("orden", next.orden);
    if (next.duracion) params.set("duracion", next.duracion);
    if (next.precio_max) params.set("precio_max", next.precio_max);
    if (next.rating_min) params.set("rating_min", next.rating_min);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const submitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({});
  };

  const durationLabel = (value: string) =>
    value === "1" ? t("durationDay") : value === "2" ? t("duration2") : value === "3" ? t("duration3") : t("duration4");

  return (
    <div className="space-y-4">
      <form onSubmit={submitQuery} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pr-10 pl-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                updateParams({ q: "" });
              }}
              aria-label={t("reset")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <select
          value={initialSort}
          onChange={(e) => updateParams({ orden: e.target.value })}
          aria-label={t("sortLabel")}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t(SORT_KEYS[option])}
            </option>
          ))}
        </select>
        <select
          value={initialDuration}
          onChange={(e) => updateParams({ duracion: e.target.value })}
          aria-label={t("durationLabel")}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
        >
          <option value="">{t("durationAll")}</option>
          {DURATIONS.filter(Boolean).map((value) => (
            <option key={value} value={value}>
              {durationLabel(value)}
            </option>
          ))}
        </select>
        <select
          value={initialMaxPrice}
          onChange={(e) => updateParams({ precio_max: e.target.value })}
          aria-label={t("priceMaxLabel")}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
        >
          <option value="">{t("priceAll")}</option>
          {PRICE_CAPS.filter(Boolean).map((value) => (
            <option key={value} value={value}>
              {t("priceUpTo", { value })}
            </option>
          ))}
        </select>
        <select
          value={initialMinRating}
          onChange={(e) => updateParams({ rating_min: e.target.value })}
          aria-label={t("ratingLabel")}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
        >
          <option value="">{t("ratingAll")}</option>
          {RATINGS.filter(Boolean).map((value) => (
            <option key={value} value={value}>
              {t("ratingAtLeast", { value })}
            </option>
          ))}
        </select>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateParams({ categoria: "" })}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            !initialCategory
              ? "border-amber-600 bg-amber-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-amber-500 hover:text-amber-700"
          )}
        >
          {t("allCategories")}
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => updateParams({ categoria: category.slug })}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              initialCategory === category.slug
                ? "border-amber-600 bg-amber-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-amber-500 hover:text-amber-700"
            )}
          >
            {pickLocalized(category.name, locale)}
          </button>
        ))}
      </div>
    </div>
  );
}