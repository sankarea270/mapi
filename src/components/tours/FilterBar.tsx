"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import type { TourCategory } from "@/types/tour";
import { pickLocalized } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface TourFilters {
  q: string;
  categoria: string;
  orden: string;
  duracion: string;
  precio_max: string;
  rating_min: string;
}

interface FilterBarProps {
  categories: TourCategory[];
  locale: string;
  filters: TourFilters;
  onChange: (patch: Partial<TourFilters>) => void;
  /** Al pulsar Intro o la lupa: llevar la vista a los resultados. */
  onBuscar?: () => void;
  /** Sobre la foto de la cabecera: controles translúcidos y texto claro. */
  sobreFoto?: boolean;
}

/* «Recomendados» es el orden que fija la agencia en el panel, categoría a
   categoría; va primero porque es el que se ve sin tocar nada. */
const SORT_OPTIONS = ["recommended", "rating", "price-asc", "price-desc", "name"] as const;
const SORT_KEYS: Record<(typeof SORT_OPTIONS)[number], string> = {
  recommended: "sortRecommended",
  rating: "sortRating",
  "price-asc": "sortPriceAsc",
  "price-desc": "sortPriceDesc",
  name: "sortName",
};
const PRICE_CAPS = ["", "100", "200", "300", "500", "1000"] as const;
const RATINGS = ["", "4.5", "4.8", "5.0"] as const;
const DURATIONS = ["", "1", "2", "3", "4+"] as const;

export function FilterBar({ categories, locale, filters, onChange, onBuscar, sobreFoto = false }: FilterBarProps) {
  const t = useTranslations("tours");

  const updateParams = (patch: Partial<TourFilters>) => onChange(patch);

  /* La búsqueda se aplica mientras se escribe. Antes solo contaba al pulsar
     Intro —la lupa era un dibujo, no un botón— y quien escribía y esperaba
     no veía cambiar nada: «el buscador no funciona». */
  const submitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscar?.();
  };

  /* Los controles, en cristal esmerilado sobre la foto. Blancos del todo
     tapaban la imagen con cinco bloques; transparentes del todo, el texto no
     se leía en las fotos claras. */
  const control = sobreFoto
    ? "border-white/25 bg-white/90 text-slate-800 shadow-lg shadow-slate-950/10 backdrop-blur-md"
    : "border-slate-200 bg-white text-slate-700";

  const durationLabel = (value: string) =>
    value === "1" ? t("durationDay") : value === "2" ? t("duration2") : value === "3" ? t("duration3") : t("duration4");

  return (
    <div className="space-y-4">
      {/* Rejilla y no una fila: con `flex-row` desde 640px los cinco controles
          no cabían y la página se ensanchaba —medido: 245px más a 640 y 132 a
          768—, que es el corte por la derecha que se veía en tableta. Ahora
          el buscador ocupa su fila y los desplegables van de dos en dos hasta
          que hay sitio para todos. */}
      <form
        onSubmit={submitQuery}
        className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]"
      >
        <div className="relative col-span-2 lg:col-span-1">
          <input
            type="search"
            value={filters.q}
            onChange={(e) => updateParams({ q: e.target.value })}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            enterKeyHint="search"
            className={cn("w-full rounded-full border py-2.5 pr-10 pl-11 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 [&::-webkit-search-cancel-button]:hidden", control)}
          />
          {/* Va DESPUÉS del campo para pintarse encima: el campo lleva
              `backdrop-blur`, que lo convierte en capa propia, y la lupa
              quedaba tapada. */}
          <button
            type="submit"
            aria-label={t("searchSubmit")}
            className="absolute top-1/2 left-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            <Search className="size-4" aria-hidden />
          </button>
          {filters.q && (
            <button
              type="button"
              onClick={() => updateParams({ q: "" })}
              aria-label={t("searchClear")}
              className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <select
          value={filters.orden}
          onChange={(e) => updateParams({ orden: e.target.value })}
          aria-label={t("sortLabel")}
          className={cn("w-full min-w-0 truncate rounded-full border px-3 py-2.5 text-[13px] font-medium outline-none sm:px-4 sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30", control)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t(SORT_KEYS[option])}
            </option>
          ))}
        </select>
        <select
          value={filters.duracion}
          onChange={(e) => updateParams({ duracion: e.target.value })}
          aria-label={t("durationLabel")}
          className={cn("w-full min-w-0 truncate rounded-full border px-3 py-2.5 text-[13px] font-medium outline-none sm:px-4 sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30", control)}
        >
          <option value="">{t("durationAll")}</option>
          {DURATIONS.filter(Boolean).map((value) => (
            <option key={value} value={value}>
              {durationLabel(value)}
            </option>
          ))}
        </select>
        <select
          value={filters.precio_max}
          onChange={(e) => updateParams({ precio_max: e.target.value })}
          aria-label={t("priceMaxLabel")}
          className={cn("w-full min-w-0 truncate rounded-full border px-3 py-2.5 text-[13px] font-medium outline-none sm:px-4 sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30", control)}
        >
          <option value="">{t("priceAll")}</option>
          {PRICE_CAPS.filter(Boolean).map((value) => (
            <option key={value} value={value}>
              {t("priceUpTo", { value })}
            </option>
          ))}
        </select>
        <select
          value={filters.rating_min}
          onChange={(e) => updateParams({ rating_min: e.target.value })}
          aria-label={t("ratingLabel")}
          className={cn("w-full min-w-0 truncate rounded-full border px-3 py-2.5 text-[13px] font-medium outline-none sm:px-4 sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30", control)}
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
            !filters.categoria
              ? "border-amber-600 bg-amber-600 text-white"
              : sobreFoto
                ? "border-white/60 bg-white/85 text-slate-800 shadow-sm backdrop-blur-md hover:border-amber-500 hover:text-amber-700"
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
              filters.categoria === category.slug
                ? "border-amber-600 bg-amber-600 text-white"
                : sobreFoto
                ? "border-white/60 bg-white/85 text-slate-800 shadow-sm backdrop-blur-md hover:border-amber-500 hover:text-amber-700"
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