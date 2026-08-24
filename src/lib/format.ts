import type { LocalizedText, Tour } from "@/types/tour";

export const pickLocalized = (text: LocalizedText, locale: string): string =>
  text[locale as keyof LocalizedText] ?? text.es;

export function formatPrice(price: number, locale: string, code: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(price);
}

const DAYS_RE = /(\d+)\s*(día|dias|day|days|dia|dias)/i;

export function tourDays(tour: Tour): number {
  const match = tour.duration.es.match(DAYS_RE);
  if (match) return Math.max(1, parseInt(match[1], 10));
  return 1;
}

export function tourDurationBucket(tour: Tour): string {
  const days = tourDays(tour);
  if (days <= 1) return "1";
  if (days === 2) return "2";
  if (days === 3) return "3";
  return "4+";
}
