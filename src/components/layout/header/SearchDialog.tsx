"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { TourCategory } from "@/types/tour";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { TourResultRow } from "./TourResultRow";

interface SearchResult {
  slug: string;
  name: string;
  duration: string;
  price: number;
  rating: number;
  image: string;
  categoryName: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: TourCategory[];
}

export function SearchDialog({ open, onOpenChange, categories }: SearchDialogProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query, open]);

  const { data, isFetching } = useQuery({
    queryKey: ["tours-search", debounced, locale],
    queryFn: async () => {
      const response = await fetch(
        `/api/tours?q=${encodeURIComponent(debounced)}&locale=${locale}&limit=8`
      );
      if (!response.ok) throw new Error("search failed");
      const body = (await response.json()) as { results: SearchResult[] };
      return body.results;
    },
    enabled: debounced.length > 0,
    placeholderData: (prev) => prev,
  });

  const total = categories.reduce((n, c) => n + c.tours.length, 0);
  const results = data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-16 left-1/2 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 translate-y-0 gap-0 rounded-2xl border-slate-100 p-0 sm:top-24"
      >
        <DialogTitle className="sr-only">{t("search")}</DialogTitle>

        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <Search className="size-5 shrink-0 text-slate-400" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
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
          {!query.trim() && (
            <p className="px-3 py-10 text-center text-sm text-slate-400">
              {t("searchHint", { count: total })}
            </p>
          )}
          {query.trim() && isFetching && !results.length && (
            <p className="px-3 py-10 text-center text-sm text-slate-400">
              {t("searchLoading")}
            </p>
          )}
          {query.trim() && !isFetching && results.length === 0 && (
            <p className="px-3 py-10 text-center text-sm text-slate-500">
              {t("searchEmpty", { query: query.trim() })}
            </p>
          )}
          {results.map((result) => (
            <TourResultRow
              key={result.slug}
              slug={result.slug}
              name={result.name}
              duration={result.duration}
              price={result.price}
              rating={result.rating}
              image={result.image}
              categoryName={result.categoryName}
              onSelect={() => onOpenChange(false)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}