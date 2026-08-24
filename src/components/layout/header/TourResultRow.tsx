"use client";

import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";
import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";

interface TourResultRowProps {
  slug: string;
  name: string;
  duration: string;
  price: number;
  rating: number;
  image: string;
  categoryName: string;
  onSelect?: () => void;
}

export function TourResultRow({
  slug,
  name,
  duration,
  price,
  rating,
  image,
  categoryName,
  onSelect,
}: TourResultRowProps) {
  const locale = useLocale();

  return (
    <Link
      href={`/tours/${slug}`}
      onClick={onSelect}
      className="group flex items-center gap-4 rounded-xl p-2 pr-3 transition-colors hover:bg-slate-50"
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <Image src={image} alt={name} fill sizes="56px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-primary">
          {name}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
          <span>{duration}</span>
          <span className="text-slate-400">·</span>
          <span>{categoryName}</span>
          <span className="inline-flex items-center gap-0.5 font-semibold text-amber-500">
            <Star className="size-3 fill-current" />
            {rating.toFixed(1)}
          </span>
        </p>
      </div>
      <p className="shrink-0 text-sm font-bold text-primary">{formatPrice(price, locale, "USD")}</p>
      <ChevronRight className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-primary" />
    </Link>
  );
}