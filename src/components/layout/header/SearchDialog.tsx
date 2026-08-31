"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { searchTours, type CategoryBrief } from "@/lib/catalog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { TourResultRow } from "./TourResultRow";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: CategoryBrief[];
}

/**
 * Buscador de tours.
 *
 * Busca sobre el catálogo que ya viene con la página, sin llamar a la red.
 * Antes pedía `/api/tours`, una ruta que dejó de existir al pasar el sitio a
 * export estático: devolvía 404 y el buscador no encontraba nada nunca.
 *
 * Al no haber petición tampoco hace falta debounce ni estado de carga: el
 * resultado sale en la misma pulsación. `useDeferredValue` mantiene fluida la
 * escritura si la lista tardase en repintarse.
 */
export function SearchDialog({ open, onOpenChange, catalog }: SearchDialogProps) {
  const t = useTranslations("nav");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const total = useMemo(
    () => catalog.reduce((n, c) => n + c.tours.length, 0),
    [catalog]
  );

  const results = useMemo(
    () => searchTours(catalog, deferred.trim()),
    [catalog, deferred]
  );

  const typed = query.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-16 left-1/2 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 translate-y-0 gap-0 rounded-lg border-slate-200 p-0 sm:top-24"
      >
        <DialogTitle className="sr-only">{t("search")}</DialogTitle>

        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <Search className="size-5 shrink-0 text-slate-400" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-describedby="search-status"
            className="w-full border-0 bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
          <DialogClose asChild>
            <button
              type="button"
              aria-label={t("close")}
              className="grid size-8 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="size-4" />
            </button>
          </DialogClose>
        </div>

        <div className="max-h-[60dvh] overflow-y-auto p-2">
          {/* Se anuncia el recuento a los lectores de pantalla: sin esto,
              quien no ve la lista no sabe si la búsqueda dio algo. */}
          <p id="search-status" className="sr-only" role="status" aria-live="polite">
            {typed ? t("searchCount", { count: results.length }) : ""}
          </p>

          {!typed && (
            <p className="px-3 py-10 text-center text-sm text-slate-400">
              {t("searchHint", { count: total })}
            </p>
          )}

          {typed && results.length === 0 && (
            <p className="px-3 py-10 text-center text-sm text-slate-500">
              {t("searchEmpty", { query: query.trim() })}
            </p>
          )}

          {results.map((tour) => (
            <TourResultRow
              key={tour.slug}
              slug={tour.slug}
              name={tour.name}
              duration={tour.duration}
              price={tour.price}
              rating={tour.rating}
              image={tour.image}
              categoryName={tour.categoryName}
              onSelect={() => onOpenChange(false)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
