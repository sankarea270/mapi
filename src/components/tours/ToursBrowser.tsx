"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { TourCategory } from "@/types/tour";
import { pickLocalized, tourDurationBucket } from "@/lib/format";
import { TourCard } from "@/components/tours/TourCard";
import { FilterBar, type TourFilters } from "@/components/tours/FilterBar";

const PER_PAGE = 12;

const EMPTY_FILTERS: TourFilters = {
  q: "",
  categoria: "",
  orden: "rating",
  duracion: "",
  precio_max: "",
  rating_min: "",
};

function readFiltersFromUrl(search: string): TourFilters {
  const params = new URLSearchParams(search);
  return {
    q: params.get("q") ?? "",
    categoria: params.get("categoria") ?? "",
    orden: params.get("orden") ?? "rating",
    duracion: params.get("duracion") ?? "",
    precio_max: params.get("precio_max") ?? "",
    rating_min: params.get("rating_min") ?? "",
  };
}

function toQueryString(filters: TourFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categoria) params.set("categoria", filters.categoria);
  if (filters.orden && filters.orden !== "rating") params.set("orden", filters.orden);
  if (filters.duracion) params.set("duracion", filters.duracion);
  if (filters.precio_max) params.set("precio_max", filters.precio_max);
  if (filters.rating_min) params.set("rating_min", filters.rating_min);
  if (page > 1) params.set("pagina", String(page));
  return params.toString();
}

interface ToursBrowserProps {
  categories: TourCategory[];
  locale: string;
  fromLabel: string;
}

/**
 * El export estático no recibe searchParams en el servidor. Para que la lista
 * completa siga estando en el HTML generado (SEO + sin JS), este componente se
 * prerenderiza sin filtros y lee la query de la URL al montar en el navegador.
 * No usa useSearchParams a propósito: eso forzaría un bailout del prerender.
 */
export function ToursBrowser({ categories, locale, fromLabel }: ToursBrowserProps) {
  const t = useTranslations("tours");
  const [filters, setFilters] = useState<TourFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  // Aplica la query de la URL una vez montado (y en back/forward).
  useEffect(() => {
    const sync = () => {
      setFilters(readFiltersFromUrl(window.location.search));
      setPage(Math.max(1, Number(new URLSearchParams(window.location.search).get("pagina")) || 1));
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const pushUrl = useCallback((next: TourFilters, nextPage: number) => {
    const query = toQueryString(next, nextPage);
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, []);

  const handleFiltersChange = useCallback(
    (patch: Partial<TourFilters>) => {
      setFilters((current) => {
        const next = { ...current, ...patch };
        setPage(1);
        pushUrl(next, 1);
        return next;
      });
    },
    [pushUrl]
  );

  const allTours = useMemo(() => categories.flatMap((c) => c.tours), [categories]);

  const sorted = useMemo(() => {
    const normalized = filters.q.toLocaleLowerCase(locale).trim();
    const maxPrice = Number(filters.precio_max) || 0;
    const minRating = Number(filters.rating_min) || 0;

    const filtered = allTours.filter((tour) => {
      const matchesCategory = !filters.categoria || tour.categorySlug === filters.categoria;
      const matchesQuery =
        !normalized ||
        [tour.name.es, tour.name.en, tour.name.pt, tour.slug]
          .join(" ")
          .toLocaleLowerCase(locale)
          .includes(normalized);
      const matchesDuration = !filters.duracion || tourDurationBucket(tour) === filters.duracion;
      const matchesPrice = !maxPrice || tour.price <= maxPrice;
      const matchesRating = !minRating || tour.rating >= minRating;
      return matchesCategory && matchesQuery && matchesDuration && matchesPrice && matchesRating;
    });

    return filtered.sort((a, b) => {
      switch (filters.orden) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
          return pickLocalized(a.name, locale).localeCompare(pickLocalized(b.name, locale), locale);
        default:
          return b.rating - a.rating;
      }
    });
  }, [allTours, filters, locale]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const goToPage = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
    pushUrl(filters, clamped);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <FilterBar
        categories={categories}
        locale={locale}
        filters={filters}
        onChange={handleFiltersChange}
      />

      <p className="mt-8 text-sm font-medium text-slate-500">
        {t("results", { count: sorted.length })}
      </p>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-base text-slate-600">{t("empty")}</p>
          <button
            type="button"
            onClick={() => handleFiltersChange(EMPTY_FILTERS)}
            className="mt-4 inline-block rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            {t("reset")}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((tour) => {
            const category = categories.find((c) => c.slug === tour.categorySlug);
            return (
              <TourCard
                key={tour.slug}
                tour={tour}
                categoryName={category ? pickLocalized(category.name, locale) : ""}
                locale={locale}
                fromLabel={fromLabel}
              />
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-4" aria-label={t("title")}>
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-amber-500 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("prev")}
          </button>
          <span className="text-sm font-medium text-slate-500">
            {t("pageInfo", { current: currentPage, total: totalPages })}
          </span>
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-amber-500 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("next")}
          </button>
        </nav>
      )}

      {/* Enlaces rastreables al resto del catálogo (no visibles) */}
      <div className="sr-only">
        {sorted.slice(PER_PAGE).map((tour) => (
          <Link key={tour.slug} href={`/tours/${tour.slug}`}>
            {pickLocalized(tour.name, locale)}
          </Link>
        ))}
      </div>
    </>
  );
}
